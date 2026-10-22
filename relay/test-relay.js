// Plays several SlimeBeep users against the relay (npm run dev first, or RELAY=wss://... for the live one).
//   node test-relay.js
const { makePeer, groupAuth, keyed, onRelay, sealMail, openMail, b64url, sign } = require('./e2e-peer.js');
const BASE = process.env.RELAY || 'ws://127.0.0.1:8787';
const ORIGIN = 'https://www.bondageprojects.elementfx.com';
let failed = 0;
const check = (ok, what) => {
	console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
	if (!ok) {
		failed++;
	}
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
/** The messages in a relay reply: one for 'msg', all of a 'history', none otherwise. */
const messagesOf = (x) => {
	if (x.t === 'msg') {
		return [x.m];
	}
	return x.t === 'history' ? x.msgs : [];
};

/** One player's connection to one group: everything it receives is kept in `got`. */
async function connect(gid, who, extra = {}, origin = ORIGIN) {
	// A group, or a mailbox (gid 'mbox:<member number>').
	const ws = new WebSocket(`${BASE}/ws?${gid.startsWith('mbox:') ? `m=${gid.slice(5)}` : `g=${gid}`}`, { headers: { Origin: origin } });
	const c = { ws, got: [], closed: null };
	ws.onmessage = (e) => {
		const x = JSON.parse(e.data);
		c.got.push(x);
		onRelay(c, x);
	};
	ws.onclose = (e) => {
		c.closed = e.code || 'closed';
	};
	ws.onerror = () => {
		c.closed = c.closed || 'error';
	};
	await new Promise((res) => {
		const t = setInterval(() => {
			if (c.got.length || c.closed) {
				clearInterval(t);
				res();
			}
		}, 20);
	});
	if (c.closed) {
		return c;
	}
	const hello = c.got.find((x) => x.t === 'hello');
	const member = extra.as || who.member;
	c.send = (x) => ws.send(JSON.stringify(x));
	if (!gid.startsWith('mbox:')) {
		keyed(c, who, gid);
		c.makesKeys = extra.makesKeys !== false;
	}
	const auth = await groupAuth(who, gid, hello.nonce, member, extra.signWith || who);
	if (extra.badSig) {
		auth.sig = b64url(new Uint8Array(64));
	}
	if (extra.oldVersion) {
		delete auth.ek;
		delete auth.eks;
	}
	ws.send(JSON.stringify({ ...auth, ...extra.fields }));
	await wait(250);
	c.last = (t) => [...c.got].reverse().find((x) => x.t === t);
	/** The stored form of every message received (as the relay has it). */
	c.raw = () => c.got.flatMap(messagesOf);
	return c;
}

(async () => {
	const gid = `test${Date.now().toString(36)}`;
	const ann = await makePeer(11, 'Ann');
	const cat = await makePeer(13, 'Cat');
	const zed = await makePeer(99, 'Zed');
	const eve = await makePeer(66, 'Eve');

	const bad = await connect(gid, ann, {}, 'https://evil.example');
	// (A relay started with --var ALLOW_ANY_ORIGIN:1 for the add-on's own test lets every page in.)
	if (process.env.ANY_ORIGIN) {
		console.log('skip another website cannot connect (test relay)');
	} else {
		check(bad.closed && !bad.got.length, 'another website cannot connect');
	}

	const old = await connect(gid, ann, { oldVersion: true, fields: { create: { name: 'Old', open: false } } });
	check(old.closed && /reload the game to update/.test(JSON.stringify(old.got)), 'a SlimeBeep without encryption is asked to update');
	const a = await connect(gid, ann, { fields: { create: { name: 'Slime Squad', open: false } } });
	check(a.last('welcome') && a.last('welcome').roster.owner === 11, 'Ann makes a group and is its owner');
	await wait(300);
	check(a.epoch === 1 && !!a.keys[1], 'Ann makes the group key (epoch 1); the relay only gets it sealed to her');
	await a.say('hi squad <img src=x onerror=alert(1)>');
	a.send({ t: 'say', text: 'plain text is refused' });
	await wait(200);
	const sealedMsgs = a.raw().filter((m) => !m.sys);
	check(
		sealedMsgs.length === 1 && !('text' in sealedMsgs[0]) && sealedMsgs[0].enc && !/hi squad/.test(JSON.stringify(sealedMsgs[0])),
		`the relay only stores and sends the sealed message, and refuses plain text (${JSON.stringify(sealedMsgs[0])})`,
	);
	check(
		(await a.texts()).some((t) => /^hi squad/.test(t)),
		'and Ann can open it with the group key',
	);
	a.send({ t: 'invite', member: 13 });
	a.send({ t: 'invite' });
	await wait(300);
	const invites = a.got.filter((x) => x.t === 'invite');
	const forCat = invites.find((x) => x.member === 13).code;
	const open = invites.find((x) => x.member === null).code;
	check(invites.length === 2 && /^[A-Z2-9]{10}$/.test(forCat), 'Ann gets an invite for Cat and an open one');

	const e1 = await connect(gid, eve, { as: 11 });
	check(e1.closed && /not a member/.test(JSON.stringify(e1.got)), "Eve can't sign in as Ann with her own key");
	const e2b = await connect(gid, eve, { fields: { invite: forCat } });
	const e2 = await connect(gid, eve, { as: 13, fields: { invite: forCat } });
	check(e2b.closed && /someone else/.test(JSON.stringify(e2b.got)), "Cat's invite doesn't work for anyone else");
	const e3 = await connect(gid, eve, { as: 11, fields: { invite: open } });
	check(e3.closed && /taken/.test(JSON.stringify(e3.got)), "an open invite can't take over Ann's place");
	const e4 = await connect(gid, cat, { badSig: true });
	check(e4.closed && /bad signature/.test(JSON.stringify(e4.got)), 'a wrong signature is refused');
	// e2: Eve claiming to be #13 with Cat's invite. The invite is bound to #13, so this is the risk a bound
	// invite carries if someone else gets the code: they become #13. Cat's real key then can't sign in.
	void e2;

	const c = await connect(gid, cat, { fields: { invite: forCat, after: 0 } });
	// (Eve already used Cat's invite above as #13; a bound invite works once.)
	const catIn = !!c.last('welcome');
	check(!catIn && /not valid/.test(JSON.stringify(c.got)), 'a used invite is gone (Eve spent it, so it no longer works)');
	a.send({ t: 'kick', member: 13 });
	await wait(200);
	a.send({ t: 'invite', member: 13 });
	await wait(200);
	const forCat2 = a.last('invite').code;
	const c2 = await connect(gid, cat, { fields: { invite: forCat2, after: 0 } });
	await wait(400);
	check(!!c2.keys[a.epoch], 'Ann gives Cat the group key when she joins (sealed to Cat)');
	check(
		c2.last('welcome') && (await c2.texts()).some((t) => /hi squad/.test(t)),
		'Cat joins with a fresh invite and can read what was said before she joined',
	);
	const z = await connect(gid, zed, { fields: { invite: open } });
	await wait(400);
	check(z.last('welcome') && z.last('roster').roster.members.length === 3, 'Zed, not a friend of anyone, joins with the open invite');
	await z.say('hello from a stranger');
	await wait(300);
	check(
		(await c2.texts()).includes('hello from a stranger') && (await a.texts()).includes('hello from a stranger'),
		'everyone gets messages, friends or not',
	);

	// Offline: Cat goes, three messages, Cat comes back asking for what came after the last one she saw.
	const lastSeen = Math.max(0, ...c2.got.flatMap(messagesOf).map((m) => m.id));
	c2.ws.close();
	await wait(200);
	for (const t of ['one', 'two', 'three']) {
		await a.say(t);
	}
	await wait(300);
	const c3 = await connect(gid, cat, { fields: { after: lastSeen } });
	await wait(300);
	const caught = (await c3.texts()).filter((t) => !/joined/.test(t));
	check(caught.join() === 'one,two,three', `coming back, Cat gets exactly what she missed (${caught})`);

	// A key is used for at most ROTATE_MSGS messages, then the group gets a new one (npm run dev:rotate makes it 5).
	const rotate = Number(process.env.ROTATE_MSGS);
	if (rotate) {
		// Cat sends them: Ann has sent close to the flood limit.
		const before = c3.epoch;
		for (let i = 0; i < rotate; i++) {
			await c3.say(`rotate ${i}`);
		}
		await wait(2500);
		check(
			c3.epoch > before && !c3.rekey,
			`after ${rotate} messages with one key, the group gets a new key (epoch ${before} -> ${c3.epoch})`,
		);
	}

	// Roles.
	z.send({ t: 'kick', member: 13 });
	z.send({ t: 'invite' });
	await wait(300);
	check(
		a.last('roster').roster.members.length === 3 && /only admins/.test(z.last('error').why),
		"a member can't remove anyone or invite in an admin-only group",
	);
	a.send({ t: 'admin', member: 13, on: true });
	await wait(200);
	c3.send({ t: 'admin', member: 11, on: false });
	c3.send({ t: 'kick', member: 11 });
	await wait(200);
	check(
		a.last('roster').roster.admins.join() === '11,13' && a.last('roster').roster.owner === 11,
		"an admin can't demote or remove the owner",
	);
	const before = a.epoch;
	c3.send({ t: 'kick', member: 99 });
	await wait(800);
	check(z.last('gone') && z.closed, 'an admin removes a member, whose connection is closed');
	const z2 = await connect(gid, zed);
	check(z2.closed && /not a member/.test(JSON.stringify(z2.got)), "and they can't come back without a new invite");
	check(
		a.epoch === before + 1 && !!a.keys[a.epoch] && !!c3.keys[a.epoch] && !z.keys[a.epoch],
		`a new group key is made without Zed, so he could never read what comes next (epoch ${before} -> ${a.epoch})`,
	);

	// Limits.
	const spam = a.raw().find((m) => m.enc);
	for (let i = 0; i < 25; i++) {
		a.send({ t: 'say', enc: spam.enc });
	}
	await wait(500);
	check(
		a.got.some((x) => x.t === 'error' && x.why === 'slow down'),
		'flooding gets "slow down"',
	);
	a.send({ t: 'profile', pic: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=' });
	await wait(200);
	check(!a.got.some((x) => x.t === 'pic' && x.data && /svg/.test(x.data)), 'an SVG is never taken as a picture');

	// The owner leaves (after the flood limit has passed): the admin (Cat) gets the group.
	await wait(10500);

	// The group picture: admins set it, everyone gets it, newcomers get it on sign-in, SVGs never.
	const png = 'data:image/png;base64,iVBORw0KGgo=';
	c3.send({ t: 'gpic', pic: png });
	await wait(300);
	check(
		a.last('gpic') && a.last('gpic').data === png && (await a.texts()).some((t) => /changed the group picture/.test(t)),
		'an admin sets the group picture and everyone gets it',
	);
	c3.send({ t: 'gpic', pic: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=' });
	await wait(300);
	check(a.last('gpic').data === png, 'an SVG is never taken as the group picture');
	const c4 = await connect(gid, cat);
	check(c4.last('gpic') && c4.last('gpic').data === png, 'signing in brings the group picture');
	c4.ws.close();
	c3.send({ t: 'gpic', pic: null });
	await wait(300);
	check(a.last('gpic').data === null, 'and it can be removed');

	// A song for the group: any member sets it, everyone gets it, newcomers get it with its age.
	const song = { u: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', ti: 'A song', p: 12.5, pl: true, d: 214 };
	c3.send({ t: 'music', ...song });
	await wait(300);
	const heard = a.last('music');
	check(
		heard && heard.music.u === song.u && heard.music.p === 12.5 && heard.music.by === 13 && heard.music.name === 'Cat' && heard.age === 0,
		`a member plays a song and everyone gets it, with who played it (${JSON.stringify(heard)})`,
	);
	c3.send({ t: 'music', ...song, u: 'http://example.com/a.mp3' });
	c3.send({ t: 'music', ...song, p: -1 });
	c3.send({ t: 'music', ...song, pl: 'yes' });
	await wait(300);
	check(a.got.filter((x) => x.t === 'music').length === 1, 'a song without https, a proper time or playing/paused is ignored');
	await wait(1000);
	const c5 = await connect(gid, cat);
	const stored = c5.last('music');
	check(
		stored && stored.music.u === song.u && stored.age >= 1000 && stored.age < 5000,
		`signing in brings the song and how long ago it was set, so players can catch up (${JSON.stringify(stored)})`,
	);
	c5.ws.close();
	// Cat repeats where the song is: everyone hears it, but the stored record keeps its first time.
	c3.send({ t: 'music', ...song, p: 12.5 + stored.age / 1000 });
	await wait(300);
	const c7 = await connect(gid, cat);
	check(
		a.got.filter((x) => x.t === 'music').length === 2 && c7.last('music').age >= stored.age,
		`a reminder of where the song is goes to everyone without being stored again (${c7.last('music').age} ms)`,
	);
	c7.ws.close();
	// The queue: only the host shows it; a member's songs and skips go to the host alone.
	c3.send({ t: 'musicQueue', q: [{ id: 2, ti: 'Next song', by: 11 }] });
	a.send({ t: 'musicQueue', q: [{ id: 9, ti: 'Not the host', by: 11 }] });
	await wait(300);
	check(
		JSON.stringify(a.last('musicQueue').q) === '[{"id":2,"ti":"Next song","by":11}]' &&
			a.got.filter((x) => x.t === 'musicQueue').length === 1,
		"the host shows the group what comes next; Ann isn't the host, so hers is ignored",
	);
	const c8 = await connect(gid, cat);
	check(c8.last('musicQueue') && c8.last('musicQueue').q.length === 1, 'signing in brings the queue');
	c8.ws.close();
	a.send({ t: 'musicAdd', u: 'https://example.com/b.mp3', ti: 'B' });
	a.send({ t: 'musicAdd', u: 'javascript:alert(1)', ti: 'X' });
	a.send({ t: 'musicSkip', id: 2 });
	await wait(300);
	const asked = c3.got.filter((x) => x.t === 'musicAdd');
	check(
		asked.length === 1 && asked[0].u === 'https://example.com/b.mp3' && asked[0].by === 11 && !a.got.some((x) => x.t === 'musicAdd'),
		`Ann asks the host to queue a song: only Cat gets it, with who asked; a link that isn't https is dropped (${JSON.stringify(asked)})`,
	);
	check(
		c3.last('musicSkip') && c3.last('musicSkip').id === 2 && c3.last('musicSkip').by === 11,
		'a skip goes to the host too, with who asked',
	);
	// Who listens along: everyone sees it, and it ends when they go.
	const ann2 = await connect(gid, ann);
	ann2.send({ t: 'musicListen', on: true });
	c3.send({ t: 'musicListen', on: true });
	await wait(300);
	check(
		JSON.stringify(c3.last('musicListeners').list) === '[11]',
		'Ann listens along and Cat sees it (the host never counts as a listener)',
	);
	ann2.ws.close();
	await wait(500);
	check(JSON.stringify(c3.last('musicListeners').list) === '[]', 'when her connection closes, she no longer listens');
	// Statuses live on connections: everyone sees them, newcomers get them, and they go with the connection.
	const ann3 = await connect(gid, ann);
	ann3.send({ t: 'status', s: { t: 'king of the swamp', l: '', a: ['sl', 'ra', 'sl', 'BAD', '<b>'] } });
	await wait(300);
	const c9 = await connect(gid, cat);
	check(
		JSON.stringify(c3.last('status')) === '{"t":"status","n":11,"s":{"t":"king of the swamp","l":"","a":["sl","ra"]}}' &&
			JSON.stringify(c9.last('statuses').list) === '[{"n":11,"s":{"t":"king of the swamp","l":"","a":["sl","ra"]}}]',
		'a status (with its achievements, each once, odd ones dropped) goes to everyone, and signing in brings all of them',
	);
	c9.ws.close();
	ann3.ws.close();
	await wait(500);
	check(c3.last('status').s === null, 'when the connection closes, the status goes');
	a.send({ t: 'musicEnd' });
	await wait(300);
	check(a.last('music').music !== null, "only the member sharing the song can stop it (Ann can't stop Cat's)");
	c3.send({ t: 'musicEnd' });
	await wait(300);
	check(a.last('music').music === null && a.last('music').by === 13, 'Cat stops sharing and everyone is told');
	const c6 = await connect(gid, cat);
	check(!c6.got.some((x) => x.t === 'music'), 'and nobody signing in later gets it');
	c6.ws.close();

	a.send({ t: 'leave' });
	await wait(300);
	check(c3.last('roster').roster.owner === 13, 'when the owner leaves, the group passes to an admin');

	// Only the owner can delete the group; it goes for everyone, and nobody can come back to it.
	c3.send({ t: 'disband' });
	await wait(300);
	check(c3.last('gone') && c3.last('gone').why === 'deleted', 'the owner deletes the group: everyone connected is told and closed');
	const back = await connect(gid, cat);
	check(back.closed && /no such group|not a member/.test(JSON.stringify(back.got)), 'and the group is gone for good');

	// ---- Mailboxes: beeps left for someone offline, readable only with the key they were left for.
	{
		const box = 'mbox:11';
		const kf = (who) => who.pub.x.slice(0, 16);
		const c1 = await connect(box, cat);
		c1.send({ t: 'put', kf: kf(ann), enc: await sealMail(13, 11, ann.ek, 'miss you <b>x</b>'), ref: 'r1' });
		c1.send({ t: 'put', kf: kf(ann), text: 'plain text', ref: 'r0' });
		await wait(300);
		check(
			c1.last('ok') && c1.last('ok').ref === 'r1' && /^[A-Z2-9]{10}$/.test(c1.last('ok').id),
			"Cat leaves a sealed beep in Ann's mailbox",
		);
		check(
			c1.got.some((x) => x.t === 'error' && x.ref === 'r0' && /bad beep/.test(x.why)),
			'a beep in plain text is refused',
		);
		const e1 = await connect(box, eve);
		e1.send({ t: 'put', kf: kf(eve), enc: await sealMail(66, 11, eve.ek, 'for the wrong key') });
		e1.send({ t: 'put', kf: 'short', enc: await sealMail(66, 11, ann.ek, 'bad') });
		e1.send({ t: 'ack', ids: [c1.last('ok').id] });
		await wait(300);
		check(e1.last('error') && /bad beep/.test(e1.last('error').why), 'a beep without a proper key start is refused');
		const fake = await connect(box, eve, { as: 11 });
		check(
			fake.last('mail') &&
				fake.last('mail').list.length === 1 &&
				(await openMail({ ...eve, member: 11 }, 66, fake.last('mail').list[0].enc)) === 'for the wrong key',
			"signing in as Ann with Eve's key only gets what was addressed to Eve's key, never Ann's beeps",
		);
		fake.send({ t: 'ack', ids: [c1.last('ok').id] });
		await wait(300);
		const a1 = await connect(box, ann);
		const got = a1.last('mail') ? a1.last('mail').list : [];
		check(
			got.length === 1 &&
				got[0].from === 13 &&
				got[0].name === 'Cat' &&
				got[0].fromKf === kf(cat) &&
				!('text' in got[0]) &&
				(await openMail(ann, 13, got[0].enc)) === 'miss you <b>x</b>',
			`Ann signs in and gets Cat's sealed beep (Eve's acks of it did nothing), which only she can open (${JSON.stringify(got)})`,
		);
		let stolen = 'opened';
		try {
			await openMail(eve, 13, got[0].enc);
		} catch (e) {
			stolen = 'refused';
		}
		check(stolen === 'refused', "Eve's key can't open a beep sealed to Ann");
		c1.send({ t: 'put', kf: kf(ann), enc: await sealMail(13, 11, ann.ek, 'and another'), ref: 'r2' });
		await wait(300);
		check(
			(await openMail(ann, 13, a1.last('mail').list[0].enc)) === 'and another',
			'a beep left while Ann is connected reaches her straight away',
		);
		a1.send({ t: 'ack', ids: [got[0].id, a1.last('mail').list[0].id] });
		await wait(300);
		a1.ws.close();
		const a2 = await connect(box, ann);
		check(a2.last('mail') && a2.last('mail').list.length === 0, 'read beeps are gone once acked');
		c1.send({ t: 'put', kf: kf(ann), enc: { ...(await sealMail(13, 11, ann.ek, 'x')), ct: 'A'.repeat(9000) } });
		await wait(300);
		check(c1.last('error') && c1.last('error').fatal, 'an oversized message is refused');
		for (const c of [c1, e1, fake, a2]) {
			try {
				c.ws.close();
			} catch (e) {
				/* closed */
			}
		}
	}

	// ---- Moving to new keys ('rekey'): signed over by the key the group knows, which then no longer signs in.
	{
		const g2 = `rk${Date.now().toString(36)}`;
		const ann2 = await makePeer(11, 'Ann');
		const a = await connect(g2, ann, { fields: { create: { name: 'Hand-over', open: true } } });
		a.send({ t: 'invite' });
		await wait(300);
		const z = await connect(g2, zed, { fields: { invite: a.last('invite').code } });
		await wait(600);
		const rekey = async (signOld, signNew, who = ann2) => ({
			t: 'rekey',
			pub: who.pub,
			sig: await sign(signOld, `rekey|11|${who.pub.x}|${who.pub.y}`),
			ek: who.ek,
			eks: await sign(signNew, `ek|${g2}|11|${who.ek}`),
		});
		a.send(await rekey(eve, ann2));
		await wait(300);
		const pubOf = (c) => c.last('roster').roster.members.find((m) => m.n === 11).pub.x;
		check(
			/bad key change/.test(a.last('error').why) && !a.closed && pubOf(z) === ann.pub.x,
			'a hand-over not signed by the key the group knows is refused, and nothing changes',
		);
		a.send(await rekey(ann, eve));
		await wait(300);
		check(
			a.got.filter((x) => x.t === 'error' && /bad key change/.test(x.why)).length === 2 && pubOf(z) === ann.pub.x,
			'so is one whose new encryption key is not signed by the new key',
		);
		const keysBefore = z.got.length;
		a.send(await rekey(ann, ann2));
		await wait(400);
		const zm = z.last('roster').roster.members.find((m) => m.n === 11);
		check(
			a.last('rekeyed') &&
				a.last('rekeyed').x === ann2.pub.x &&
				zm.pub.x === ann2.pub.x &&
				zm.ek === ann2.ek &&
				zm.kf === ann2.pub.x.slice(0, 16) &&
				zm.rk &&
				zm.rk.x === ann.pub.x,
			`a hand-over signed by the old key moves Ann to the new one; everyone gets her old key and its signature (${JSON.stringify(zm)})`,
		);
		check(
			z.got.slice(keysBefore).some((x) => x.t === 'keys' && x.needs.includes(11)),
			'her wraps for the old encryption key are dropped, so she gets the group key again',
		);
		a.send(await rekey(ann, ann2));
		await wait(200);
		check(a.got.filter((x) => x.t === 'rekeyed').length === 2, 'handing over to the key it already has only answers');
		const oldIn = await connect(g2, ann);
		check(oldIn.closed && /not a member/.test(JSON.stringify(oldIn.got)), 'the old key no longer signs in');
		const newIn = await connect(g2, ann2);
		await wait(2500);
		check(newIn.last('welcome') && newIn.epoch >= 1 && !!newIn.keys[newIn.epoch], 'the new key signs in and is given the group key');
		for (const c of [a, z, oldIn, newIn]) {
			try {
				c.ws.close();
			} catch (e) {
				/* closed */
			}
		}
		// In a mailbox the hand-over goes along with each beep, so a friend who only knows the old key can check the new one.
		const handover = { x: ann.pub.x, y: ann.pub.y, sig: await sign(ann, `rekey|11|${ann2.pub.x}|${ann2.pub.y}`) };
		const m1 = await connect('mbox:13', ann2, { fields: { rk: handover } });
		m1.send({ t: 'put', kf: cat.pub.x.slice(0, 16), enc: await sealMail(11, 13, cat.ek, 'new keys, same Ann'), ref: 'k1' });
		const forged = { ...handover, sig: await sign(eve, `rekey|11|${eve.pub.x}|${eve.pub.y}`) };
		const m2 = await connect('mbox:13', eve, { as: 11, fields: { rk: forged } });
		m2.send({ t: 'put', kf: cat.pub.x.slice(0, 16), enc: await sealMail(11, 13, cat.ek, 'not Ann'), ref: 'k2' });
		await wait(300);
		const box = await connect('mbox:13', cat);
		const list = box.last('mail') ? box.last('mail').list : [];
		const real = list.find((m) => m.fromKf === ann2.pub.x.slice(0, 16));
		const fake = list.find((m) => m.fromKf === eve.pub.x.slice(0, 16));
		check(
			real && real.rk && real.rk.x === ann.pub.x && real.pub.x === ann2.pub.x && fake && !fake.rk && !fake.pub,
			`a mailbox beep carries a valid hand-over, and a forged one is left out (${JSON.stringify(list.map((m) => !!m.rk))})`,
		);
		box.send({ t: 'ack', ids: list.map((m) => m.id) });
		await wait(200);
		for (const c of [m1, m2, box]) {
			try {
				c.ws.close();
			} catch (e) {
				/* closed */
			}
		}
	}

	console.log(failed ? `\n${failed} FAILED` : '\nall passed');
	process.exit(failed ? 1 : 0);
})();

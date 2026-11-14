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

	// The operator's code: an owner who lost their keys gets back into their group, still the owner. Only with the
	// relay's OPERATOR_KEY (npm run dev:test sets a test one; TEST_OPERATOR_KEY for another relay).
	{
		const http = BASE.replace(/^ws/, 'http');
		const key = process.env.TEST_OPERATOR_KEY || 'test-operator-key-0123456789abcdef';
		const op = (body, k = key) =>
			fetch(`${http}/op/invite`, { method: 'POST', headers: { Authorization: `Bearer ${k}` }, body: JSON.stringify(body) });
		const g3 = `test${Date.now().toString(36)}o`;
		const a = await connect(g3, ann, { fields: { create: { name: 'Locked out', open: false } } });
		const ann3 = await makePeer(11, 'Ann');
		const taken = await connect(g3, ann3);
		const wrong = await op({ g: g3, member: 11 }, 'not-the-key-0123456789abcdefghijkl');
		const none = await op({ g: 'nosuchgroup1', member: 11 });
		const res = await op({ g: g3, member: 11 });
		const made = res.ok ? await res.json() : {};
		const back = made.code && (await connect(g3, ann3, { fields: { invite: made.code } }));
		const w = back && back.last('welcome');
		check(
			!taken.last('welcome') &&
				wrong.status === 404 &&
				none.status === 404 &&
				made.listed &&
				made.owner &&
				w &&
				w.roster.owner === 11 &&
				w.roster.admins.includes(11),
			`a wrong operator key gets a 404; the right one makes a code for the locked-out owner, who is back in and still the owner (${JSON.stringify({ wrong: wrong.status, none: none.status, made, owner: w && w.roster.owner })})`,
		);
		for (const x of [a, taken, back]) {
			try {
				x.ws.close();
			} catch (e) {
				/* closed */
			}
		}
	}

	await testTimeoutsAndPins(`tp${Date.now().toString(36)}`);

	// Global: the test relay (npm run dev:test) makes every group id starting with GLOBAL_PREFIX a Global.
	const GLOBAL_PREFIX = process.env.GLOBAL_PREFIX || 'globaltest';
	if (BASE.startsWith('ws://')) {
		await testGlobal(`${GLOBAL_PREFIX}${Date.now().toString(36)}`);
		await testGlobalAdmins(`${GLOBAL_PREFIX}a${Date.now().toString(36)}`);
		await testLink();
	} else {
		console.log('skip Global (needs the local test relay)');
	}

	console.log(failed ? `\n${failed} FAILED` : '\nall passed');
	process.exit(failed ? 1 : 0);
})();

/** Plain texts in what a connection received (Global sends text, not sealed messages). */
const plainTexts = (c) => c.got.flatMap(messagesOf).map((m) => m.text);

/** Timeouts and pins in an ordinary (end-to-end) group: owner Ann, admin Cat, member Zed. */
async function testTimeoutsAndPins(gid) {
	const ann = await makePeer(41, 'Ann');
	const cat = await makePeer(43, 'Cat');
	const zed = await makePeer(49, 'Zed');
	const a = await connect(gid, ann, { fields: { create: { name: 'Mods', open: false } } });
	await wait(300);
	a.send({ t: 'invite', member: 43 });
	a.send({ t: 'invite', member: 49 });
	await wait(300);
	const codes = a.got.filter((x) => x.t === 'invite');
	const c = await connect(gid, cat, { fields: { invite: codes.find((x) => x.member === 43).code } });
	const z = await connect(gid, zed, { fields: { invite: codes.find((x) => x.member === 49).code } });
	a.send({ t: 'admin', member: 43, on: true });
	await wait(600);

	z.send({ t: 'timeout', member: 43, secs: 60 });
	c.send({ t: 'timeout', member: 41, secs: 60 });
	await wait(300);
	check(!Object.keys(a.last('roster').roster.timeouts).length, "a member can't time anyone out, and an admin can't time out the owner");
	c.send({ t: 'timeout', member: 49, secs: 60 });
	await wait(400);
	const until = z.last('timeout') && z.last('timeout').until;
	check(
		until > Date.now() + 50000 &&
			a.last('roster').roster.timeouts[49] === until &&
			(await a.texts()).includes('Cat timed out Zed for 1 minute'),
		'an admin times Zed out for a minute: he is told until when, everyone sees it, and the chat says so',
	);
	await z.say('can I talk?');
	await wait(300);
	check(
		z.last('error').why === 'timed out' && z.last('error').until === until && !(await a.texts()).includes('can I talk?'),
		"timed out, Zed's message is refused",
	);
	z.ws.close();
	await wait(200);
	const z2 = await connect(gid, zed);
	check(z2.last('timeout') && z2.last('timeout').until === until, 'signing in again, Zed is still timed out (and told so)');
	c.send({ t: 'timeout', member: 49, secs: LIMITS_TIMEOUT + 1 });
	await wait(200);
	check(a.last('roster').roster.timeouts[49] === until, 'a timeout longer than 28 days is refused');
	c.send({ t: 'timeout', member: 49, secs: 0 });
	await wait(400);
	await z2.say('back!');
	await wait(400);
	check(
		z2.last('timeout').until === 0 && (await a.texts()).includes('back!') && (await a.texts()).includes("Cat lifted Zed's timeout"),
		'lifting it lets Zed talk again',
	);

	// Pins: admins only, a copy that outlives the 200 kept messages, sealed as the message was.
	await a.say('read the rules');
	await wait(300);
	const ruleId = a
		.raw()
		.filter((m) => !m.sys && m.from === 41)
		.pop().id;
	z2.send({ t: 'pin', id: ruleId, on: true });
	await wait(300);
	check(!a.got.some((x) => x.t === 'pins'), "a member can't pin");
	c.send({ t: 'pin', id: ruleId, on: true });
	await wait(400);
	const pins = a.last('pins');
	check(
		pins &&
			pins.list.length === 1 &&
			pins.list[0].id === ruleId &&
			pins.list[0].by === 43 &&
			pins.list[0].m.enc &&
			!('text' in pins.list[0].m),
		'an admin pins a message: everyone gets the pin, still sealed with the group key',
	);
	check((await a.texts()).includes('Cat pinned a message'), 'and the chat says so');
	c.send({ t: 'pin', id: 999999, on: true });
	await wait(300);
	check(/too old/.test(c.last('error').why), "a message the group no longer keeps can't be pinned");
	const z3 = await connect(gid, zed);
	check(z3.last('pins') && z3.last('pins').list[0].id === ruleId, 'signing in, members get the pins');
	c.send({ t: 'pin', id: ruleId, on: false });
	await wait(400);
	check(a.last('pins').list.length === 0, 'unpinning takes it off for everyone');
	for (const x of [a, c, z, z2, z3]) {
		try {
			x.ws.close();
		} catch (e) {
			/* closed */
		}
	}
}
/** The relay's longest timeout (LIMITS.timeout), in seconds. */
const LIMITS_TIMEOUT = 28 * 86400;

async function testGlobal(gid) {
	const own = await makePeer(21, 'Owner');
	const cat = await makePeer(23, 'Cat');
	const zed = await makePeer(29, 'Zed');
	const eve = await makePeer(26, 'Eve');
	const all = [];
	/** A connection to Global, closed at the end. */
	const join = async (who, extra = {}) => {
		const c = await connect(gid, who, extra);
		all.push(c);
		return c;
	};

	// The group exists before it becomes Global (the beta group chat did): made, then reached again.
	const made = await join(own, { fields: { create: { name: 'Beta chat', open: false } } });
	await wait(300);
	made.ws.close();
	await wait(100);
	const o = await join(own);
	const w = o.last('welcome');
	check(
		w &&
			w.roster.global === true &&
			w.roster.name === 'Global' &&
			w.roster.owner === 21 &&
			o.last('gpic') &&
			/^data:image\/png;base64,/.test(o.last('gpic').data),
		'the group reached under the Global id becomes Global: renamed, the slime logo, same owner',
	);
	check(!o.got.some((x) => x.t === 'keys'), 'Global hands out no group keys');

	const c = await join(cat, { fields: { join: true } });
	check(c.last('welcome') && c.last('welcome').roster.global === true, 'Cat joins Global with no invite');
	const e = await join(eve, { as: 23, fields: { join: true } });
	check(e.closed && /not a member/.test(JSON.stringify(e.got)), "Eve can't take Cat's member number by joining with her own key");

	// The owner's exception: the owner looks up anyone in Global, anyone looks up the owner, and nobody else anybody.
	o.send({ t: 'lookup', member: 23 });
	o.send({ t: 'lookup', member: 29 });
	c.send({ t: 'lookup', member: 21 });
	await wait(300);
	const seen = o.got.filter((x) => x.t === 'lookup');
	const l1 = seen.find((x) => x.member === 23);
	const l0 = seen.find((x) => x.member === 29);
	const l2 = c.last('lookup');
	check(
		!!l1 && l1.ek === cat.ek && l1.pub.x === cat.pub.x && typeof l1.eks === 'string' && l1.name === 'Cat' && l1.on === true,
		"the owner looks up Cat: Global's keys for her, and that she is online",
	);
	check(!!l0 && !l0.ek && l0.on === false, 'someone not in Global: no keys, not online');
	check(!!l2 && l2.member === 21 && l2.ek === own.ek && l2.on === true, 'Cat looks up the owner');
	c.send({ t: 'lookup', member: 29 });
	await wait(300);
	check(
		c.got.filter((x) => x.t === 'lookup').length === 1 && c.last('error').why === 'unknown' && c.last('error').member === 29,
		'Cat can look up nobody else (the refusal names the number, so her SlimeBeep stops waiting)',
	);
	o.send({ t: 'admin', member: 23, on: true });
	await wait(300);
	c.send({ t: 'invite', member: 21 });
	await wait(300);
	check(/only the operator/.test(c.last('error').why), "even an admin can't make a code for the owner's number");
	o.send({ t: 'admin', member: 23, on: false });
	await wait(300);

	// No member cap: well past the 40 of other groups.
	const crowd = [];
	for (let i = 0; i < 45; i++) {
		crowd.push(await join(await makePeer(1000 + i, `Crowd ${i}`), { fields: { join: true } }));
	}
	await wait(3600);
	const r = o.last('roster').roster;
	check(
		crowd.every((x) => x.last('welcome')) && r.count === 47 && r.online.length === 47,
		`no member cap: 45 more join and everyone is counted (${r.count} members, ${r.online.length} online)`,
	);
	check(
		r.members.every((m) => m.kf && !m.pub && !m.ek),
		'its roster lists names and key starts only, never whole keys',
	);
	for (const x of crowd) {
		x.ws.close();
	}
	await wait(3600);
	check(o.last('roster').roster.online.length === 2 && o.last('roster').roster.count === 47, 'leaving the page is not leaving Global');

	c.send({ t: 'say', text: 'hello global <b>hi</b>' });
	c.send({ t: 'say', text: 'too quick' });
	await wait(400);
	check(plainTexts(o).includes('hello global <b>hi</b>'), 'Cat says hello and the owner gets it');
	check(
		!plainTexts(o).includes('too quick') && /slow down/.test(c.last('error').why),
		'a second message right after is refused (slow down)',
	);
	const later = await join(zed, { fields: { join: true, after: 0 } });
	check(plainTexts(later).includes('hello global <b>hi</b>'), 'Zed joins later and gets the history (stored sealed, opened for him)');
	const helloId = o.got.flatMap(messagesOf).find((m) => m.text === 'hello global <b>hi</b>').id;
	o.send({ t: 'pin', id: helloId, on: true });
	await wait(400);
	const gp = later.last('pins');
	check(
		gp && gp.list[0].m.text === 'hello global <b>hi</b>' && !gp.list[0].m.sec,
		"the owner pins Cat's hello: members get the pin opened, like Global's messages",
	);
	c.send({ t: 'music', u: 'https://example.com/a.mp3', p: 0, pl: true });
	c.send({ t: 'gkey', e: 1, fresh: true, wraps: [] });
	await wait(300);
	check(
		c.got.some((x) => x.t === 'error' && /no music in Global/.test(x.why)),
		'no music in Global',
	);

	later.send({ t: 'invite' });
	later.send({ t: 'kick', member: 23 });
	await wait(300);
	check(/admins/.test(later.last('error').why) && o.last('roster') && c.ws.readyState === 1, "a member can't make codes or remove anyone");

	o.send({ t: 'ban', member: 23, on: true });
	await wait(400);
	check(c.closed && /banned from Global/.test(JSON.stringify(c.got)), "the owner bans Cat: she's out at once");
	check(o.last('bans') && o.last('bans').list.some((b) => b.n === 23 && b.name === 'Cat'), 'the owner gets the ban list');
	check(!later.got.some((x) => x.t === 'bans'), "members don't get the ban list");
	const c2 = await join(cat, { fields: { join: true } });
	check(c2.closed && /banned from Global/.test(JSON.stringify(c2.got)), "Cat can't join again while banned");
	o.send({ t: 'ban', member: 23, on: false });
	await wait(300);
	const c3 = await join(cat, { fields: { join: true } });
	check(c3.last('welcome') && !o.last('bans').list.length, 'unbanned, Cat joins again');
	o.send({ t: 'timeout', member: 23, secs: 300 });
	await wait(400);
	c3.send({ t: 'leave' });
	await wait(400);
	const c4 = await join(cat, { fields: { join: true } });
	check(c4.last('timeout') && c4.last('timeout').until > Date.now(), 'leaving Global and joining again does not end a timeout');
	o.send({ t: 'timeout', member: 23, secs: 0 });
	await wait(300);

	o.send({ t: 'admin', member: 29, on: true });
	await wait(300);
	check(later.last('bans') && Array.isArray(later.last('bans').list), 'a new admin gets the ban list');
	later.send({ t: 'ban', member: 21, on: true });
	later.send({ t: 'kick', member: 21 });
	await wait(300);
	check(o.ws.readyState === 1 && o.last('roster').roster.owner === 21, "an admin can't ban or remove the owner");

	c4.send({ t: 'leave' });
	o.send({ t: 'disband' });
	await wait(3600);
	// 47 and Zed, less Cat.
	check(c4.closed && o.last('roster').roster.count === 47, 'Cat leaves Global');
	check(o.ws.readyState === 1 && o.last('roster').roster.name === 'Global', "the owner can't delete Global");
	const squat = await join(eve, { as: 23, fields: { join: true } });
	check(squat.closed && /taken/.test(JSON.stringify(squat.got)), "Eve can't take Cat's member number now that Cat has left");
	const back = await join(cat, { fields: { join: true } });
	check(!!back.last('welcome'), 'Cat comes back whenever she likes, on her own key');

	// Zed loses his keys (browser and account backup both gone): his number is bound to the old ones.
	const zedNew = await makePeer(29, 'Zed');
	const lost = await join(zedNew, { fields: { join: true } });
	check(
		lost.closed && /not a member|taken/.test(JSON.stringify(lost.got)),
		'Zed on new keys is refused: his number is bound to the old ones',
	);
	o.send({ t: 'invite', member: 29 });
	await wait(300);
	const letIn = o.last('invite');
	const zedBack = letIn && (await join(zedNew, { fields: { invite: letIn.code } }));
	check(zedBack && zedBack.last('welcome'), 'the owner makes a code for #29 and Zed is back in on his new keys');
	const zedOld = await join(zed);
	check(zedOld.closed && later.closed, 'and his old keys no longer sign in (the old connection is closed too)');

	o.send({ t: 'leave' });
	await wait(3600);
	const ownerSquat = await join(eve, { as: 21, fields: { join: true } });
	check(ownerSquat.closed && /taken/.test(JSON.stringify(ownerSquat.got)), "the owner leaves; nobody can join as the owner's number");
	const r2 = back.last('roster').roster;
	check(o.closed && r2.owner === 21 && r2.count === 47, 'Global stays, still owned by the owner, who is out of it');
	const o2 = await join(own, { fields: { join: true } });
	await wait(300);
	check(
		o2.last('welcome') && o2.last('welcome').roster.owner === 21 && !!o2.last('bans'),
		'the owner joins again and is the owner, with the ban list',
	);
	back.send({ t: 'leave' });
	o2.send({ t: 'leave' });
	zedBack.send({ t: 'leave' });
	await wait(500);
	const empty = await join(zedNew, { fields: { join: true } });
	check(!!empty.last('welcome') && empty.last('welcome').roster.name === 'Global', 'with everyone gone, Global is still there to join');

	// One address can't sign up member numbers in bulk (the crowd above came from this address too).
	const bulk = await join(await makePeer(5000, 'Bulk'), { fields: { join: true } });
	check(bulk.closed && /too many/.test(JSON.stringify(bulk.got)), 'one address joining too many new numbers is stopped');

	for (const x of all) {
		try {
			x.ws.close();
		} catch (err) {
			/* closed */
		}
	}
}

/** Global takes more admins than a group chat's 10. */
async function testGlobalAdmins(gid) {
	const own = await makePeer(21, 'Owner');
	const made = await connect(gid, own, { fields: { create: { name: 'Beta chat', open: false } } });
	await wait(300);
	made.ws.close();
	await wait(100);
	const o = await connect(gid, own);
	const crowd = [];
	for (let i = 0; i < 12; i++) {
		crowd.push(await connect(gid, await makePeer(3000 + i, `Helper ${i}`), { fields: { join: true } }));
	}
	for (let i = 0; i < 12; i++) {
		o.send({ t: 'admin', member: 3000 + i, on: true });
		await wait(120);
	}
	await wait(3600);
	const admins = (o.last('roster') || o.last('welcome')).roster.admins;
	check(admins.length === 13, `Global takes more than 10 admins (${admins.length} with the owner)`);
	for (const x of [o, ...crowd]) {
		try {
			x.ws.close();
		} catch (err) {
			/* closed */
		}
	}
}

/** The linked group: a partner server (holding LINK_KEY) makes codes for its members, one at a time, and removes them. */
async function testLink() {
	const http = BASE.replace(/^ws/, 'http');
	const post = (path, body, key = 'test-link-key-0123456789abcdef0123') =>
		fetch(`${http}${path}`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});
	const n = 7000 + Math.floor(Math.random() * 1000);
	const wrong = await post('/link/invite', { member: n }, 'not-the-key-0123456789abcdef0123456');
	check(wrong.status === 404, 'without the link key, no codes');
	const made = await (await post('/link/invite', { member: n })).json();
	check(/^[A-Z2-9]{10}$/.test(made.code || '') && made.gid === 'linktestvoidorder', 'the partner server gets a code for one member');
	const who = await makePeer(n, 'Linked');
	const c = await connect(made.gid, who, { fields: { invite: made.code } });
	const w = c.last('welcome');
	check(!!w && w.roster.linked === true && w.roster.owner === 21, 'that member joins with it: a linked group, owned by LINK_OWNER');
	const again = await (await post('/link/invite', { member: n })).json();
	check(again.member === true, 'asking again for someone already in says so');
	c.send({ t: 'invite', member: n + 1 });
	await wait(200);
	check(/through its add-on/.test(JSON.stringify(c.got)), 'in a linked group only the partner server brings people in');
	const squat = await connect(made.gid, await makePeer(n + 2, 'Squatter'), { fields: { create: { name: 'Mine now', open: true } } });
	check(squat.closed && /reserved/.test(JSON.stringify(squat.got)), "nobody can make a group under the linked group's id");
	const first = await (await post('/link/invite', { member: n + 3 })).json();
	const second = await (await post('/link/invite', { member: n + 3 })).json();
	check(!!first.code && first.code === second.code, 'one code per member, reused while it lasts');
	await post('/link/remove', { member: n + 3 });
	const late = await connect(made.gid, await makePeer(n + 3, 'Late'), { fields: { invite: first.code } });
	check(late.closed && !late.last('welcome'), 'removing someone voids the code they had not used yet');
	const boss = await (await post('/link/invite', { member: 21 })).json();
	const o = await connect(made.gid, await makePeer(21, 'Owner'), { fields: { invite: boss.code } });
	check(!!o.last('welcome'), 'the owner joins with a code like everyone');
	o.send({ t: 'owner', member: n });
	await wait(200);
	o.send({ t: 'leave' });
	await wait(300);
	const back = await connect(made.gid, who);
	check(
		!!back.last('welcome') && back.last('welcome').roster.owner === 21,
		'a linked group is never handed on: its owner stays its owner after leaving',
	);
	const removed = await (await post('/link/remove', { member: n })).json();
	await wait(300);
	check(removed.removed === true && c.closed, 'removing them (they left the order) takes them out');
	const owner = await (await post('/link/remove', { member: 21 })).json();
	check(owner.removed === false, 'the owner is never removed');
}

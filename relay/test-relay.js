// Plays several SlimeBeep users against the relay (npm run dev first, or RELAY=wss://... for the live one).
//   node test-relay.js
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
const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function keys() {
	const k = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
	const jwk = await crypto.subtle.exportKey('jwk', k.publicKey);
	return { k, pub: { x: jwk.x, y: jwk.y } };
}

/** One player's connection to one group: everything it receives is kept in `got`. */
async function connect(gid, who, extra = {}, origin = ORIGIN) {
	// A group, or a mailbox (gid 'mbox:<member number>').
	const ws = new WebSocket(`${BASE}/ws?${gid.startsWith('mbox:') ? `m=${gid.slice(5)}` : `g=${gid}`}`, { headers: { Origin: origin } });
	const c = { ws, got: [], closed: null };
	ws.onmessage = (e) => c.got.push(JSON.parse(e.data));
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
	const sig = await crypto.subtle.sign(
		{ name: 'ECDSA', hash: 'SHA-256' },
		(extra.signWith || who).k.privateKey,
		new TextEncoder().encode(`${hello.nonce}|${gid}|${member}`),
	);
	ws.send(
		JSON.stringify({
			t: 'auth',
			member,
			name: who.name,
			pub: who.pub,
			sig: extra.badSig ? b64url(new Uint8Array(64)) : b64url(sig),
			...extra.fields,
		}),
	);
	await wait(250);
	c.send = (x) => ws.send(JSON.stringify(x));
	c.last = (t) => [...c.got].reverse().find((x) => x.t === t);
	c.texts = () => c.got.flatMap(messagesOf).map((m) => m.text);
	return c;
}

(async () => {
	const gid = `test${Date.now().toString(36)}`;
	const ann = { member: 11, name: 'Ann', ...(await keys()) };
	const cat = { member: 13, name: 'Cat', ...(await keys()) };
	const zed = { member: 99, name: 'Zed', ...(await keys()) };
	const eve = { member: 66, name: 'Eve', ...(await keys()) };

	const bad = await connect(gid, ann, {}, 'https://evil.example');
	// (A relay started with --var ALLOW_ANY_ORIGIN:1 for the add-on's own test lets every page in.)
	if (process.env.ANY_ORIGIN) {
		console.log('skip another website cannot connect (test relay)');
	} else {
		check(bad.closed && !bad.got.length, 'another website cannot connect');
	}

	const a = await connect(gid, ann, { fields: { create: { name: 'Slime Squad', open: false } } });
	check(a.last('welcome') && a.last('welcome').roster.owner === 11, 'Ann makes a group and is its owner');
	a.send({ t: 'say', text: 'hi squad <img src=x onerror=alert(1)>' });
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
	check(
		c2.last('welcome') && c2.texts().some((t) => /hi squad/.test(t)),
		'Cat joins with a fresh invite and sees what was said before she joined',
	);
	const z = await connect(gid, zed, { fields: { invite: open } });
	check(z.last('welcome') && z.last('roster').roster.members.length === 3, 'Zed, not a friend of anyone, joins with the open invite');
	z.send({ t: 'say', text: 'hello from a stranger' });
	await wait(300);
	check(
		c2.texts().includes('hello from a stranger') && a.texts().includes('hello from a stranger'),
		'everyone gets messages, friends or not',
	);

	// Offline: Cat goes, three messages, Cat comes back asking for what came after the last one she saw.
	const lastSeen = Math.max(0, ...c2.got.flatMap(messagesOf).map((m) => m.id));
	c2.ws.close();
	await wait(200);
	for (const t of ['one', 'two', 'three']) {
		a.send({ t: 'say', text: t });
	}
	await wait(300);
	const c3 = await connect(gid, cat, { fields: { after: lastSeen } });
	const caught = c3.last('history').msgs.map((m) => m.text);
	check(caught.join() === 'one,two,three', `coming back, Cat gets exactly what she missed (${caught})`);

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
	c3.send({ t: 'kick', member: 99 });
	await wait(300);
	check(z.last('gone') && z.closed, 'an admin removes a member, whose connection is closed');
	const z2 = await connect(gid, zed);
	check(z2.closed && /not a member/.test(JSON.stringify(z2.got)), "and they can't come back without a new invite");

	// Limits.
	for (let i = 0; i < 25; i++) {
		a.send({ t: 'say', text: `spam ${i}` });
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
		a.last('gpic') && a.last('gpic').data === png && a.texts().some((t) => /changed the group picture/.test(t)),
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
		c1.send({ t: 'put', kf: kf(ann), text: 'miss you <b>x</b>', ref: 'r1' });
		await wait(300);
		check(c1.last('ok') && c1.last('ok').ref === 'r1' && /^[A-Z2-9]{10}$/.test(c1.last('ok').id), "Cat leaves a beep in Ann's mailbox");
		const e1 = await connect(box, eve);
		e1.send({ t: 'put', kf: kf(eve), text: 'for the wrong key' });
		e1.send({ t: 'put', kf: 'short', text: 'bad' });
		e1.send({ t: 'ack', ids: [c1.last('ok').id] });
		await wait(300);
		check(e1.last('error') && /bad beep/.test(e1.last('error').why), 'a beep without a proper key start is refused');
		const fake = await connect(box, eve, { as: 11 });
		check(
			fake.last('mail') && fake.last('mail').list.length === 1 && fake.last('mail').list[0].text === 'for the wrong key',
			"signing in as Ann with Eve's key only gets what was addressed to Eve's key, never Ann's beeps",
		);
		fake.send({ t: 'ack', ids: [c1.last('ok').id] });
		await wait(300);
		const a1 = await connect(box, ann);
		const got = a1.last('mail') ? a1.last('mail').list : [];
		check(
			got.length === 1 && got[0].from === 13 && got[0].name === 'Cat' && got[0].fromKf === kf(cat) && got[0].text === 'miss you <b>x</b>',
			`Ann signs in and gets Cat's beep (Eve's acks of it did nothing), with Cat's key start to check (${JSON.stringify(got)})`,
		);
		c1.send({ t: 'put', kf: kf(ann), text: 'and another', ref: 'r2' });
		await wait(300);
		check(a1.last('mail').list[0].text === 'and another', 'a beep left while Ann is connected reaches her straight away');
		a1.send({ t: 'ack', ids: [got[0].id, a1.last('mail').list[0].id] });
		await wait(300);
		a1.ws.close();
		const a2 = await connect(box, ann);
		check(a2.last('mail') && a2.last('mail').list.length === 0, 'read beeps are gone once acked');
		c1.send({ t: 'put', kf: kf(ann), text: 'x'.repeat(5000) });
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

	console.log(failed ? `\n${failed} FAILED` : '\nall passed');
	process.exit(failed ? 1 : 0);
})();

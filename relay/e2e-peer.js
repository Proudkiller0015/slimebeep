// A simulated SlimeBeep user for the tests: the same end-to-end encryption as slimebeep.js (ECDH P-256,
// HKDF-SHA-256, AES-GCM), so test players can talk to the relay and to the add-on like the real thing.
const enc = new TextEncoder();
const dec = new TextDecoder();
const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64url = (s) => new Uint8Array(Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64'));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** A player with a signing key (ECDSA) and an encryption key (ECDH), both P-256. */
async function makePeer(member, name) {
	const k = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
	const jwk = await crypto.subtle.exportKey('jwk', k.publicKey);
	const e = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
	const ejwk = await crypto.subtle.exportKey('jwk', e.publicKey);
	return { member, name, k, pub: { x: jwk.x, y: jwk.y }, e, ek: `${ejwk.x}.${ejwk.y}` };
}
const sign = async (who, text) => b64url(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, who.k.privateKey, enc.encode(text)));
async function verify(pub, sig, text) {
	try {
		const key = await crypto.subtle.importKey(
			'jwk',
			{ kty: 'EC', crv: 'P-256', x: pub.x, y: pub.y, ext: true },
			{ name: 'ECDSA', namedCurve: 'P-256' },
			false,
			['verify'],
		);
		return await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, unb64url(sig), enc.encode(text));
	} catch (e) {
		return false;
	}
}
async function agree(priv, ek, info) {
	const [x, y] = ek.split('.');
	const pubKey = await crypto.subtle.importKey(
		'jwk',
		{ kty: 'EC', crv: 'P-256', x, y, ext: true },
		{ name: 'ECDH', namedCurve: 'P-256' },
		false,
		[],
	);
	const bits = await crypto.subtle.deriveBits({ name: 'ECDH', public: pubKey }, priv, 256);
	const hkdf = await crypto.subtle.importKey('raw', bits, 'HKDF', false, ['deriveKey']);
	return crypto.subtle.deriveKey(
		{ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(32), info: enc.encode(info) },
		hkdf,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt'],
	);
}
async function seal(key, data, aad) {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: enc.encode(aad) }, key, data);
	return { iv: b64url(iv), ct: b64url(ct) };
}
async function unseal(key, box, aad) {
	return new Uint8Array(
		await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64url(box.iv), additionalData: enc.encode(aad) }, key, unb64url(box.ct)),
	);
}
const aesKey = (raw) => crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);

/** The sign-in fields for a group: the signed nonce plus the encryption key, signed. */
async function groupAuth(who, gid, nonce, member = who.member, signWith = who) {
	return {
		t: 'auth',
		member,
		name: who.name,
		pub: who.pub,
		sig: await sign(signWith, `${nonce}|${gid}|${member}`),
		ek: who.ek,
		eks: await sign(signWith, `ek|${gid}|${member}|${who.ek}`),
	};
}

/**
 * Makes a group connection behave like the add-on with keys: opens wraps sent to it, makes the first key (or
 * a new one after a member left) when `c.makesKeys`, and wraps the current key for members who need it.
 * Adds c.say(text) and c.texts() (opened messages, in order).
 */
function keyed(c, who, gid) {
	c.keys = {};
	c.roster = null;
	c.makesKeys = true;
	const members = () => (c.roster ? c.roster.members : []);
	const wrapFor = async (e, raw, m) => {
		const key = await agree(who.e.privateKey, m.ek, `slimebeep group v1|${gid}|${e}|${who.member}|${m.n}`);
		const box = await seal(key, raw, `${gid}|${e}|${m.n}`);
		return { to: m.n, ...box, sig: await sign(who, `wrap|${gid}|${e}|${m.n}|${box.iv}|${box.ct}`) };
	};
	const trusted = (m) => m && m.ek && m.eks && m.pub && verify(m.pub, m.eks, `ek|${gid}|${m.n}|${m.ek}`);
	c.onKeys = async (p) => {
		for (const x of p.mine || []) {
			if (c.keys[x.e] || x.w.ek !== who.ek) {
				continue;
			}
			const by = members().find((m) => m.n === x.w.by);
			if (!by || !(await trusted(by)) || !(await verify(by.pub, x.w.sig, `wrap|${gid}|${x.e}|${who.member}|${x.w.iv}|${x.w.ct}`))) {
				continue;
			}
			const key = await agree(who.e.privateKey, by.ek, `slimebeep group v1|${gid}|${x.e}|${x.w.by}|${who.member}`);
			c.keys[x.e] = await unseal(key, x.w, `${gid}|${x.e}|${who.member}`);
		}
		c.epoch = p.epoch;
		c.rekey = p.rekey;
		if (!c.makesKeys) {
			return;
		}
		if (p.epoch === 0 || p.rekey) {
			const raw = crypto.getRandomValues(new Uint8Array(32));
			const wraps = [];
			for (const m of members()) {
				if (await trusted(m)) {
					wraps.push(await wrapFor(p.epoch + 1, raw, m));
				}
			}
			c.send({ t: 'gkey', e: p.epoch + 1, fresh: true, wraps });
		} else if (c.keys[p.epoch] && p.needs.length) {
			for (const e of Object.keys(c.keys)
				.map(Number)
				.sort((x, y) => y - x)) {
				const wraps = [];
				for (const m of members().filter((x) => p.needs.includes(x.n))) {
					if (await trusted(m)) {
						wraps.push(await wrapFor(e, c.keys[e], m));
					}
				}
				if (wraps.length) {
					c.send({ t: 'gkey', e, wraps });
				}
			}
		}
	};
	c.say = async (text) => {
		for (let i = 0; i < 40 && !(c.epoch && !c.rekey && c.keys[c.epoch]); i++) {
			await wait(100);
		}
		const e = c.epoch;
		const box = await seal(await aesKey(c.keys[e]), enc.encode(text), `${gid}|${e}|${who.member}`);
		c.send({ t: 'say', enc: { e, ...box } });
	};
	c.texts = async () => {
		const out = [];
		for (const x of c.got) {
			for (const m of x.t === 'history' ? x.msgs : [x.m]) {
				if (x.t !== 'msg' && x.t !== 'history') {
					break;
				}
				if (m.sys) {
					out.push(m.text);
				} else if (m.enc && c.keys[m.enc.e]) {
					try {
						// Messages come padded with NULs (see `padded` in slimebeep.js).
						// eslint-disable-next-line no-control-regex -- removing the padding is the point
						out.push(dec.decode(await unseal(await aesKey(c.keys[m.enc.e]), m.enc, `${gid}|${m.enc.e}|${m.from}`)).replace(/\u0000+$/, ''));
					} catch (e) {
						/* not ours */
					}
				}
			}
		}
		return out;
	};
	return c;
}
/** Feeds relay messages to a keyed connection, in order. */
function onRelay(c, x) {
	if (x.t === 'welcome' || x.t === 'roster') {
		c.roster = x.roster;
	}
	if (x.t === 'keys' && c.onKeys) {
		c.chain = (c.chain || Promise.resolve()).then(() => c.onKeys(x)).catch((e) => console.error('keys', e));
	}
}

/** A mailbox beep sealed to `toEk` from `from` (a one-time key, as the add-on does). */
async function sealMail(from, to, toEk, text) {
	const once = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
	const jwk = await crypto.subtle.exportKey('jwk', once.publicKey);
	const key = await agree(once.privateKey, toEk, `slimebeep mail v1|${from}|${to}`);
	return { e: `${jwk.x}.${jwk.y}`, ...(await seal(key, enc.encode(text), `${from}|${to}`)) };
}
/** Opens a mailbox beep sent to `who`. */
async function openMail(who, from, box) {
	const key = await agree(who.e.privateKey, box.e, `slimebeep mail v1|${from}|${who.member}`);
	return dec.decode(await unseal(key, box, `${from}|${who.member}`));
}

module.exports = { b64url, makePeer, sign, groupAuth, keyed, onRelay, sealMail, openMail };

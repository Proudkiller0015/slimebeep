/**
 * SlimeBeep relay: a Cloudflare Worker with two Durable Object classes.
 *
 * Group (/ws?g=<group id>): a group chat's members, roles, invites, last LIMITS.keep messages and the
 * song it is listening to (one small record, replaced on every change).
 * Mailbox (/ws?m=<member number>): beeps left for an offline player, readable only with the key they
 * were addressed to.
 *
 * Clients sign in by signing a one-time nonce with their own P-256 key. In a group, a member number is
 * bound to a key when it joins with an invite; an invite made for one member number is the only way to
 * bind a new key. A member can also move to a new key with `rekey`, signed by the key the group knows.
 * All rules are enforced here.
 *
 * Messages are end-to-end encrypted by the clients (ECDH P-256, HKDF-SHA-256, AES-GCM), so this relay
 * only stores and passes on data it cannot read. A mailbox beep is sealed to the recipient's encryption
 * key. A group message is sealed with the group's key of the current epoch, which members hand to each
 * other as `wraps`: the key sealed to one member, signed by the member who wrapped it. The relay keeps
 * the wraps but never the key; a member leaving starts a new epoch (`rekey`).
 *
 * Free-plan limits: sockets hibernate, keep-alive pings get an auto-response without waking the
 * object, and each group takes at most LIMITS.perDay messages a day.
 */

import { DurableObject } from 'cloudflare:workers';

/** Mailbox limits. */
const MAIL = {
	/** Most beeps waiting in one mailbox. */
	box: 100,
	/** Most beeps one sender may leave in one mailbox per 24 h. */
	perSender: 50,
	/** Days before an unread beep is deleted. */
	days: 14,
	/** Most ids in one ack. */
	ack: 100,
};
/** A key fingerprint: the first 16 chars of a public key's x. */
const KF_RE = /^[A-Za-z0-9_-]{16}$/;
/** An encryption (ECDH P-256) public key: x.y in base64url. */
const EK_RE = /^[A-Za-z0-9_-]{43}\.[A-Za-z0-9_-]{43}$/;
/** An AES-GCM nonce (12 bytes, base64url). */
const IV_RE = /^[A-Za-z0-9_-]{16}$/;
/** Sealed data (base64url), up to `max` characters. */
const sealed = (x, max) => typeof x === 'string' && x.length >= 22 && x.length <= max && /^[A-Za-z0-9_-]+$/.test(x);
/** Longest sealed group message or mailbox beep. */
const CT_MAX = 6000;
/** Group key epochs kept, so history from before a rekey stays readable. */
const EPOCHS = 10;
/** A group gets a new key after this many messages with one key, or this long (ms), so one leaked key reads little. */
const ROTATE = { msgs: 500, ms: 7 * 24 * 3600 * 1000 };
/** Group limits. */
const LIMITS = {
	/** Longest group or member name. */
	name: 40,
	/** Longest message. */
	text: 500,
	/** Most members in a group. */
	members: 40,
	/** Most admins in a group. */
	admins: 10,
	/** Messages kept per group. */
	keep: 200,
	/** Longest picture data URL. */
	pic: 12000,
	/** Most messages per connection in 10 s. */
	burst: 20,
	/** Most open connections per object. */
	sockets: 80,
	/** Days an invite stays valid. */
	inviteDays: 7,
	/** Uses of an open (not member-bound) invite. */
	openUses: 20,
	/** Most messages a group takes per day. */
	perDay: 2000,
	/** Longest song link. */
	songUrl: 300,
	/** Longest song title. */
	songTitle: 100,
	/** Hours a group's song is kept for members who connect later. */
	songHours: 12,
	/** Most upcoming songs a host shows the group. */
	songQueue: 10,
	/** Longest title of a queued song. */
	queueTitle: 40,
	/** Longest status line (each part). */
	status: 60,
	/** Most achievements a status lists. */
	achievements: 40,
};
/** A group id. */
const ID_RE = /^[a-z0-9]{8,24}$/;
/** An invite secret, also used for mailbox beep ids. */
const SECRET_RE = /^[A-Z2-9]{10}$/;
/** A picture: an image data URL only. */
const PIC_RE = /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/]+=*$/;
/** A base64url key coordinate or signature. */
const B64URL = /^[A-Za-z0-9_-]{16,128}$/;
/**
 * Page origins allowed to connect: the game's sites and their subdomains (http or https; the European
 * mirror is spelt with and without the hyphen), and localhost for tests.
 */
const ORIGINS = [
	/^https?:\/\/([a-z0-9-]+\.)*bondageprojects\.elementfx\.com$/,
	/^https?:\/\/([a-z0-9-]+\.)*bondageprojects\.com$/,
	/^https?:\/\/([a-z0-9-]+\.)*bondage-?europe\.com$/,
	/^https?:\/\/([a-z0-9-]+\.)*bondage-asia\.com$/,
	/^http:\/\/localhost(:\d+)?$/,
	/^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

/** A plausible member number. */
const isNum = (n) => Number.isInteger(n) && n > 0 && n < 1e9;
/** A song link: https, short, nothing that could break out of an attribute; '' for anything else. */
const songUrl = (u) => (typeof u === 'string' && u.length <= LIMITS.songUrl && /^https:\/\/[^\s<>"']+$/.test(u) ? u : '');
/** A string with control characters removed, trimmed and cut to `max`; '' for anything else. */
const clean = (x, max) =>
	typeof x === 'string'
		? x
				// eslint-disable-next-line no-control-regex -- removing control characters is the point
				.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '')
				.trim()
				.slice(0, max)
		: '';
/** A random 10-character secret (no look-alike letters). */
const secret = () => {
	const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	const a = new Uint8Array(10);
	crypto.getRandomValues(a);
	return [...a].map((x) => abc[x % abc.length]).join('');
};
const b64url = (buf) =>
	btoa(String.fromCharCode(...new Uint8Array(buf)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
const unb64url = (s) =>
	Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));

/**
 * Whether a request carries the operator key (the OPERATOR_KEY secret, as `Authorization: Bearer <key>`).
 * Without that secret set, nothing is the operator.
 */
async function isOperator(req, env) {
	const key = env.OPERATOR_KEY;
	const got = (req.headers.get('Authorization') || '').replace(/^Bearer /, '');
	if (typeof key !== 'string' || key.length < 32 || !got) {
		return false;
	}
	// Compared as hashes, so the comparison takes the same time whatever the guess.
	const hash = async (x) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(x)));
	return crypto.subtle.timingSafeEqual(await hash(key), await hash(got));
}

export default {
	/**
	 * Checks the origin and hands the WebSocket to the group (?g=) or mailbox (?m=) object. Also takes the
	 * operator's POST /op/invite { g, member }: a code for that member number in that group, for someone
	 * who lost their keys when nobody else there can make one.
	 */
	async fetch(req, env) {
		const url = new URL(req.url);
		if (url.pathname === '/') {
			return new Response('SlimeBeep group chat relay', { headers: { 'content-type': 'text/plain' } });
		}
		if (url.pathname === '/op/invite' && req.method === 'POST') {
			if (!(await isOperator(req, env))) {
				return new Response('Not found', { status: 404 });
			}
			const p = await req.json().catch(() => ({}));
			if (!ID_RE.test(p.g || '') || !isNum(p.member)) {
				return new Response('Bad group or member number', { status: 400 });
			}
			return env.GROUP.get(env.GROUP.idFromName(p.g)).opInvite(p.member);
		}
		if (url.pathname !== '/ws') {
			return new Response('Not found', { status: 404 });
		}
		if (req.headers.get('Upgrade') !== 'websocket') {
			return new Response('Expected a WebSocket', { status: 426 });
		}
		const origin = req.headers.get('Origin') || '';
		// ALLOW_ANY_ORIGIN is set only by the local test server.
		if (env.ALLOW_ANY_ORIGIN !== '1' && !ORIGINS.some((re) => re.test(origin))) {
			return new Response('Forbidden', { status: 403 });
		}
		const box = Number(url.searchParams.get('m'));
		if (url.searchParams.has('m')) {
			if (!isNum(box)) {
				return new Response('Bad mailbox', { status: 400 });
			}
			return env.MAILBOX.get(env.MAILBOX.idFromName(`m:${box}`)).fetch(req);
		}
		const gid = url.searchParams.get('g') || '';
		if (!ID_RE.test(gid)) {
			return new Response('Bad group', { status: 400 });
		}
		return env.GROUP.get(env.GROUP.idFromName(gid)).fetch(req);
	},
};

/**
 * One group chat. Members' statuses and who listens along live on their connections, not in storage. Storage: 'meta' { name, owner, admins, open, created, pic, e2e }, 'members' (member
 * number -> { n, name, pub, ek, eks, joined, pic, rk }), 'invites' (secret -> { member, by, exp, uses }),
 * 'msg:<seq>' sealed messages, 'keys' { epoch, rekey, eps: epoch -> member -> wrap } and 'music'
 * { u, ti, p, pl, d, i, b, by, name, at, q }: the song playing, only its link and where it is, never the sound,
 * and the titles of the songs queued after it.
 */
export class Group extends DurableObject {
	constructor(ctx, env) {
		super(ctx, env);
		// ROTATE_MSGS is set only by the local test server.
		this.rotateMsgs = Number(env.ROTATE_MSGS) || ROTATE.msgs;
		// Pings are answered without waking the object.
		ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('{"t":"ping"}', '{"t":"pong"}'));
		ctx.blockConcurrencyWhile(async () => {
			this.meta = (await ctx.storage.get('meta')) || null;
			this.members = (await ctx.storage.get('members')) || {};
			this.invites = (await ctx.storage.get('invites')) || {};
			// Message counter, from the newest stored message.
			const newest = await ctx.storage.list({ prefix: 'msg:', reverse: true, limit: 1 });
			this.seq = newest.size ? [...newest.values()][0].id : (await ctx.storage.get('seq')) || 0;
			// Messages today, in memory only (restarts if the object is evicted).
			this.today = { day: '', n: 0 };
			this.keys = (await ctx.storage.get('keys')) || { epoch: 0, rekey: false, eps: {} };
			// Groups from before end-to-end encryption: their stored plain-text messages are deleted.
			if (this.meta && !this.meta.e2e) {
				const old = await ctx.storage.list({ prefix: 'msg:' });
				const ids = [...old.keys()];
				for (let i = 0; i < ids.length; i += 128) {
					await ctx.storage.delete(ids.slice(i, i + 128));
				}
				this.meta.e2e = 1;
				await ctx.storage.put({ meta: this.meta, seq: this.seq });
			}
		});
	}

	/**
	 * An invite for one member number, made by the operator (see the Worker's fetch): like an admin's, but
	 * with no admin needed, so an owner who lost their keys gets back in, still the owner.
	 * @returns {Promise<Response>} { code } or an error
	 */
	async opInvite(member) {
		if (!this.meta) {
			return new Response('No such group', { status: 404 });
		}
		if (!this.members[member] && Object.keys(this.members).length >= LIMITS.members) {
			return new Response('Group is full', { status: 409 });
		}
		const code = secret();
		this.invites[code] = { member, by: 0, exp: Date.now() + LIMITS.inviteDays * 864e5, uses: 0 };
		await this.save();
		return Response.json({ code, listed: !!this.members[member], owner: this.meta.owner === member });
	}

	/** Accepts a WebSocket and sends it a sign-in nonce. */
	async fetch(req) {
		const gid = new URL(req.url).searchParams.get('g');
		if (this.ctx.getWebSockets().length >= LIMITS.sockets) {
			return new Response('Busy', { status: 503 });
		}
		const [client, server] = Object.values(new WebSocketPair());
		this.ctx.acceptWebSocket(server);
		const nonce = b64url(crypto.getRandomValues(new Uint8Array(18)));
		server.serializeAttachment({ gid, nonce, member: null, hits: [] });
		server.send(JSON.stringify({ t: 'hello', nonce }));
		return new Response(null, { status: 101, webSocket: client });
	}

	/**
	 * A client message (JSON with `t`). Before sign-in only 'auth'; then 'say', 'history', 'gkey', 'rekey', 'invite', 'kick',
	 * 'admin', 'owner', 'rename', 'open', 'profile', 'gpic', 'music', 'musicEnd', 'musicQueue', 'musicAdd', 'musicSkip',
	 * 'musicListen', 'status', 'leave' and 'disband'. Rate limited per connection.
	 */
	async webSocketMessage(ws, raw) {
		const att = ws.deserializeAttachment();
		try {
			if (typeof raw !== 'string' || raw.length > 16000) {
				return this.fail(ws, 'too big');
			}
			const now = Date.now();
			att.hits = (att.hits || []).filter((t) => now - t < 10000);
			att.hits.push(now);
			ws.serializeAttachment(att);
			if (att.hits.length > LIMITS.burst) {
				return this.send(ws, { t: 'error', why: 'slow down' });
			}
			let p;
			try {
				p = JSON.parse(raw);
			} catch (e) {
				return this.fail(ws, 'not JSON');
			}
			if (!p || typeof p !== 'object' || Array.isArray(p) || typeof p.t !== 'string') {
				return this.fail(ws, 'bad message');
			}
			if (!att.member) {
				if (p.t !== 'auth') {
					return this.fail(ws, 'sign in first');
				}
				return await this.auth(ws, att, p);
			}
			const me = this.members[att.member];
			// Removed since signing in.
			if (!me || !this.meta) {
				return this.fail(ws, 'not a member');
			}
			switch (p.t) {
				case 'say':
					return await this.say(att.member, p);
				case 'history':
					return this.history(ws, p.after);
				case 'gkey':
					return await this.addKeys(att.member, p);
				case 'rekey':
					return await this.rekeyMember(ws, att, p);
				case 'invite':
					return await this.invite(ws, att.member, p);
				case 'kick':
					return await this.kick(att.member, p.member);
				case 'admin':
					return await this.setAdmin(att.member, p.member, p.on === true);
				case 'owner':
					return await this.setOwner(att.member, p.member);
				case 'rename':
					return await this.rename(att.member, p.name);
				case 'open':
					return await this.setOpen(att.member, p.on === true);
				case 'profile':
					return await this.profile(att.member, p);
				case 'gpic':
					return await this.groupPic(att.member, p.pic);
				case 'music':
					return await this.setMusic(att.member, p);
				case 'musicEnd':
					return await this.endMusic(att.member);
				case 'musicQueue':
					return await this.setQueue(att.member, p.q);
				case 'musicAdd':
					return await this.addSong(att.member, p);
				case 'musicSkip':
					return await this.skipSong(att.member, p.id);
				case 'musicListen':
					return await this.setListening(ws, att, p.on === true);
				case 'status':
					return this.setStatus(ws, att, p.s);
				case 'leave':
					return await this.leave(att.member);
				case 'disband':
					return await this.disband(att.member);
				default:
					return this.send(ws, { t: 'error', why: 'unknown' });
			}
		} catch (e) {
			this.send(ws, { t: 'error', why: 'server error' });
		}
	}

	webSocketClose(ws) {
		this.gone(ws);
	}
	webSocketError(ws) {
		this.gone(ws);
	}
	/** A connection closed: tells the others who is online now. */
	gone(ws) {
		const a = ws.deserializeAttachment();
		try {
			ws.close();
		} catch (e) {
			/* already closed */
		}
		if (a && a.member && this.meta) {
			this.broadcast({ t: 'presence', online: this.online(ws) });
			if (a.listening) {
				this.broadcast({ t: 'musicListeners', list: this.listeners(ws) });
			}
			if (a.status && !this.statuses(ws).some((x) => x.n === a.member)) {
				this.broadcast({ t: 'status', n: a.member, s: null });
			}
		}
	}
	/** Members with a live, signed-in connection right now (`except`: one that is closing). */
	online(except = null) {
		const on = new Set();
		for (const ws of this.ctx.getWebSockets()) {
			if (ws === except) {
				continue;
			}
			const a = ws.deserializeAttachment();
			if (a && a.member && this.members[a.member]) {
				on.add(a.member);
			}
		}
		return [...on];
	}

	/**
	 * Signs a connection in: verifies the signed nonce, then creates the group (p.create), joins it with
	 * an invite (p.invite) or checks the key of an existing member. Sends the roster, pictures and history.
	 */
	async auth(ws, att, p) {
		const member = p.member;
		if (!isNum(member) || !p.pub || !B64URL.test(p.pub.x || '') || !B64URL.test(p.pub.y || '') || !B64URL.test(p.sig || '')) {
			return this.fail(ws, 'bad sign-in');
		}
		const pub = { x: p.pub.x, y: p.pub.y };
		const ok = await verify(pub, p.sig, `${att.nonce}|${att.gid}|${member}`);
		if (!ok) {
			return this.fail(ws, 'bad signature');
		}
		// The encryption key, signed with the signing key so members can check it is really this member's.
		if (!EK_RE.test(p.ek || '') || !B64URL.test(p.eks || '') || !(await verify(pub, p.eks, `ek|${att.gid}|${member}|${p.ek}`))) {
			return this.fail(ws, 'please reload the game to update SlimeBeep');
		}
		const ek = p.ek;
		const eks = p.eks;
		const name = clean(p.name, LIMITS.name) || `#${member}`;
		if (p.create) {
			if (this.meta) {
				return this.fail(ws, 'group exists');
			}
			this.meta = {
				name: clean(p.create.name, LIMITS.name) || 'Group chat',
				owner: member,
				admins: [member],
				open: p.create.open === true,
				created: Date.now(),
				e2e: 1,
			};
			this.members = { [member]: { n: member, name, pub, ek, eks, joined: Date.now() } };
			this.keys = { epoch: 0, rekey: false, eps: {} };
			await this.ctx.storage.put('keys', this.keys);
			await this.save();
			await this.note(`${name} made the group`);
		} else if (!this.meta) {
			return this.fail(ws, 'no such group');
		} else if (p.invite) {
			const inv = this.invites[p.invite];
			if (!SECRET_RE.test(p.invite) || !inv || inv.exp < Date.now()) {
				return this.fail(ws, 'invite not valid');
			}
			if (inv.member && inv.member !== member) {
				return this.fail(ws, 'invite is for someone else');
			}
			const known = this.members[member];
			if (known && !samePub(known.pub, pub) && !inv.member) {
				return this.fail(ws, 'that member number is taken');
			}
			if (!known && Object.keys(this.members).length >= LIMITS.members) {
				return this.fail(ws, 'group is full');
			}
			// A key bound by an invite replaces any earlier hand-over (`rk`), which was for another key.
			const was = { ...(known || { joined: Date.now() }) };
			delete was.rk;
			this.members[member] = { ...was, n: member, name, pub, ek, eks };
			if (known && known.ek !== ek) {
				await this.dropWraps(member);
			}
			if (inv.member || ++inv.uses >= LIMITS.openUses) {
				delete this.invites[p.invite];
			}
			await this.save();
			if (!known) {
				await this.note(`${name} joined`);
			}
		} else {
			const known = this.members[member];
			if (!known || !samePub(known.pub, pub)) {
				return this.fail(ws, 'not a member');
			}
			if (known.name !== name || known.ek !== ek) {
				if (known.ek !== ek) {
					await this.dropWraps(member);
				}
				Object.assign(known, { name, ek, eks });
				await this.save();
			}
		}
		att.member = member;
		ws.serializeAttachment(att);
		this.send(ws, { t: 'welcome', me: member, roster: this.roster() });
		for (const m of Object.values(this.members)) {
			if (m.pic) {
				this.send(ws, { t: 'pic', n: m.n, data: m.pic });
			}
		}
		if (this.meta.pic) {
			this.send(ws, { t: 'gpic', data: this.meta.pic });
		}
		const statuses = this.statuses(ws);
		if (statuses.length) {
			this.send(ws, { t: 'statuses', list: statuses });
		}
		const music = await this.ctx.storage.get('music');
		if (music && Date.now() - music.at < LIMITS.songHours * 36e5) {
			const { at, q, ...song } = music;
			this.send(ws, { t: 'music', music: song, age: Date.now() - at });
			if (q) {
				this.send(ws, { t: 'musicQueue', q });
			}
			const list = this.listeners();
			if (list.length) {
				this.send(ws, { t: 'musicListeners', list });
			}
		}
		this.history(ws, p.after);
		this.broadcast({ t: 'roster', roster: this.roster() });
		this.sendKeys();
	}

	/** Posts a sealed message (within LIMITS.perDay): `enc` { e: key epoch, iv, ct }. */
	async say(member, p) {
		const enc = p.enc;
		const k = this.keys;
		if (
			!enc ||
			!Number.isInteger(enc.e) ||
			enc.e < 1 ||
			enc.e > k.epoch ||
			!k.eps[enc.e] ||
			!IV_RE.test(enc.iv || '') ||
			!sealed(enc.ct, CT_MAX)
		) {
			return;
		}
		const day = new Date().toISOString().slice(0, 10);
		if (this.today.day !== day) {
			this.today = { day, n: 0 };
		}
		if (++this.today.n > LIMITS.perDay) {
			return this.broadcast({ t: 'error', why: 'this group has sent enough messages for today; back tomorrow' });
		}
		const m = this.members[member];
		await this.append({
			from: member,
			name: m.name,
			enc: { e: enc.e, iv: enc.iv, ct: enc.ct },
			ref: typeof p.ref === 'string' ? p.ref.slice(0, 24) : undefined,
		});
		// Counted from the message numbers, which are stored anyway. Keys from before rotation have no `since`: they get a new one now.
		if (!k.rekey && (this.seq - (k.fromSeq || 0) >= this.rotateMsgs || Date.now() - (k.since || 0) > ROTATE.ms)) {
			k.rekey = true;
			await this.ctx.storage.put('keys', k);
			this.sendKeys();
		}
	}

	/** Posts a system line ("X joined"). */
	async note(text) {
		await this.append({ sys: true, text });
	}

	/** Stores a message, drops the oldest past LIMITS.keep, and sends it to everyone connected. */
	async append(msg) {
		this.seq += 1;
		const m = { id: this.seq, at: Date.now(), ...msg };
		await this.ctx.storage.put(`msg:${String(this.seq).padStart(10, '0')}`, m);
		if (this.seq > LIMITS.keep) {
			await this.ctx.storage.delete(`msg:${String(this.seq - LIMITS.keep).padStart(10, '0')}`);
		}
		this.broadcast({ t: 'msg', m });
	}

	/** Sends the stored messages after id `after`. */
	async history(ws, after) {
		const from = Number.isInteger(after) && after >= 0 ? after : 0;
		const list = await this.ctx.storage.list({ prefix: 'msg:', start: `msg:${String(from + 1).padStart(10, '0')}`, limit: LIMITS.keep });
		this.send(ws, { t: 'history', msgs: [...list.values()] });
	}

	/** Makes an invite: for one member number (p.member) or open. Admins only unless the group is open. */
	async invite(ws, member, p) {
		const admin = this.meta.admins.includes(member);
		if (!admin && !this.meta.open) {
			return this.send(ws, { t: 'error', why: 'only admins can invite here' });
		}
		if (Object.keys(this.members).length >= LIMITS.members) {
			return this.send(ws, { t: 'error', why: 'group is full' });
		}
		const target = p.member == null ? null : p.member;
		if (target !== null && !isNum(target)) {
			return this.send(ws, { t: 'error', why: 'bad member number' });
		}
		// Re-keying an existing member needs an admin.
		if (target !== null && this.members[target] && !admin) {
			return this.send(ws, { t: 'error', why: 'already a member' });
		}
		// Expired invites are dropped; at most 50 are kept.
		for (const [k, v] of Object.entries(this.invites)) {
			if (v.exp < Date.now()) {
				delete this.invites[k];
			}
		}
		const keys = Object.keys(this.invites);
		if (keys.length >= 50) {
			delete this.invites[keys[0]];
		}
		const code = secret();
		this.invites[code] = { member: target, by: member, exp: Date.now() + LIMITS.inviteDays * 864e5, uses: 0 };
		await this.save();
		this.send(ws, { t: 'invite', code, member: target, ref: typeof p.ref === 'string' ? p.ref.slice(0, 24) : undefined });
	}

	/** Removes a member (admins; only the owner can remove admins). */
	async kick(by, target) {
		const g = this.meta;
		if (!isNum(target) || !this.members[target] || target === g.owner || target === by) {
			return;
		}
		const byOwner = by === g.owner;
		if (!g.admins.includes(by) || (g.admins.includes(target) && !byOwner)) {
			return;
		}
		const name = this.members[target].name;
		delete this.members[target];
		g.admins = g.admins.filter((n) => n !== target);
		await this.save();
		await this.note(`${this.members[by].name} removed ${name}`);
		this.closeMember(target, 'removed');
		this.broadcast({ t: 'roster', roster: this.roster() });
		await this.needRekey();
	}

	/** Grants admin (any admin) or takes it (owner only). */
	async setAdmin(by, target, on) {
		const g = this.meta;
		if (!isNum(target) || !this.members[target] || target === g.owner) {
			return;
		}
		if (on && (!g.admins.includes(by) || g.admins.includes(target) || g.admins.length >= LIMITS.admins)) {
			return;
		}
		if (!on && (by !== g.owner || !g.admins.includes(target))) {
			return;
		}
		g.admins = on ? [...g.admins, target] : g.admins.filter((n) => n !== target);
		await this.save();
		await this.note(
			on
				? `${this.members[by].name} made ${this.members[target].name} admin`
				: `${this.members[by].name} took admin from ${this.members[target].name}`,
		);
		this.broadcast({ t: 'roster', roster: this.roster() });
	}

	/** Hands the group to another member (owner only). */
	async setOwner(by, target) {
		const g = this.meta;
		if (by !== g.owner || !isNum(target) || !this.members[target] || target === by) {
			return;
		}
		g.owner = target;
		if (!g.admins.includes(target)) {
			g.admins.push(target);
		}
		await this.save();
		await this.note(`${this.members[by].name} handed the group to ${this.members[target].name}`);
		this.broadcast({ t: 'roster', roster: this.roster() });
	}

	/** Renames the group (admins). */
	async rename(by, name) {
		const n = clean(name, LIMITS.name);
		if (!this.meta.admins.includes(by) || !n || n === this.meta.name) {
			return;
		}
		this.meta.name = n;
		await this.save();
		await this.note(`${this.members[by].name} renamed the group to "${n}"`);
		this.broadcast({ t: 'roster', roster: this.roster() });
	}

	/** Lets every member invite, or admins only (admins). */
	async setOpen(by, on) {
		if (!this.meta.admins.includes(by) || this.meta.open === on) {
			return;
		}
		this.meta.open = on;
		await this.save();
		await this.note(on ? `${this.members[by].name} let everyone invite` : `${this.members[by].name} made invites admin-only`);
		this.broadcast({ t: 'roster', roster: this.roster() });
	}

	/** Updates a member's name and picture (null removes it). */
	async profile(member, p) {
		const m = this.members[member];
		if (typeof p.name === 'string') {
			m.name = clean(p.name, LIMITS.name) || m.name;
		}
		if (p.pic === null) {
			delete m.pic;
		} else if (typeof p.pic === 'string' && p.pic.length <= LIMITS.pic && PIC_RE.test(p.pic)) {
			m.pic = p.pic;
		}
		await this.save();
		this.broadcast({ t: 'pic', n: member, data: m.pic || null });
		this.broadcast({ t: 'roster', roster: this.roster() });
	}

	/** The group's own picture: admins set or remove it (null). Kept in meta, sent to everyone. */
	async groupPic(by, pic) {
		if (!this.meta.admins.includes(by)) {
			return;
		}
		if (pic === null) {
			if (!this.meta.pic) {
				return;
			}
			delete this.meta.pic;
		} else if (typeof pic === 'string' && pic.length <= LIMITS.pic && PIC_RE.test(pic)) {
			if (pic === this.meta.pic) {
				return;
			}
			this.meta.pic = pic;
		} else {
			return;
		}
		await this.save();
		await this.note(pic ? `${this.members[by].name} changed the group picture` : `${this.members[by].name} removed the group picture`);
		this.broadcast({ t: 'gpic', data: this.meta.pic || null });
	}

	/**
	 * The song a member shares with the group (its host; a member who starts their own takes over).
	 * Each player plays the link itself; only this record is kept. The host repeats where the song is
	 * now and then: that is only passed on, and stored only when it differs from what is stored.
	 */
	async setMusic(member, p) {
		const u = songUrl(p.u);
		const pos = typeof p.p === 'number' && Number.isFinite(p.p) && p.p >= 0 && p.p <= 86400 ? p.p : -1;
		const dur = typeof p.d === 'number' && Number.isFinite(p.d) && p.d >= 0 && p.d <= 86400 ? p.d : 0;
		if (!u || pos < 0 || typeof p.pl !== 'boolean') {
			return;
		}
		const m = this.members[member];
		const song = { u, ti: clean(p.ti, LIMITS.songTitle), p: pos, pl: p.pl, d: dur, by: member, name: m.name };
		if (Number.isInteger(p.i) && p.i > 0 && p.i < 1e9) {
			song.i = p.i;
		}
		if (isNum(p.b) && this.members[p.b]) {
			song.b = p.b;
		}
		const old = await this.ctx.storage.get('music');
		const now = Date.now();
		// Where the stored record says the song is now.
		const due = old && (old.pl ? old.p + (now - old.at) / 1000 : old.p);
		const same =
			old && old.by === member && old.u === u && old.pl === song.pl && old.i === song.i && old.ti === song.ti && Math.abs(due - pos) < 2;
		if (!same) {
			// A new host starts with an empty queue and nobody listening along yet.
			const q = old && old.by === member ? old.q : undefined;
			await this.ctx.storage.put('music', { ...song, at: now, ...(q ? { q } : {}) });
			if (old && old.by !== member) {
				if (old.q) {
					this.broadcast({ t: 'musicQueue', q: [] });
				}
				this.stopListening();
			}
		}
		this.broadcast({ t: 'music', music: song, age: 0 });
	}

	/** The host's upcoming songs (titles and who added them, never the links), shown to the group. */
	async setQueue(member, list) {
		const music = await this.ctx.storage.get('music');
		if (!music || music.by !== member || !Array.isArray(list)) {
			return;
		}
		const q = [];
		for (const x of list.slice(0, LIMITS.songQueue)) {
			if (!x || !Number.isInteger(x.id) || x.id <= 0 || x.id >= 1e9 || !isNum(x.by)) {
				return;
			}
			q.push({ id: x.id, ti: clean(x.ti, LIMITS.queueTitle), by: x.by });
		}
		await this.ctx.storage.put('music', { ...music, q });
		this.broadcast({ t: 'musicQueue', q });
	}

	/** A member asks the host to queue a song; only the host's connections get it. */
	async addSong(member, p) {
		const u = songUrl(p.u);
		const music = await this.ctx.storage.get('music');
		if (!u || !music || music.by === member) {
			return;
		}
		this.sendMember(music.by, { t: 'musicAdd', u, ti: clean(p.ti, LIMITS.songTitle), by: member });
	}

	/** A member asks the host to skip or drop a song they added (the host checks it is theirs). */
	async skipSong(member, id) {
		const music = await this.ctx.storage.get('music');
		if (!Number.isInteger(id) || id <= 0 || id >= 1e9 || !music || music.by === member) {
			return;
		}
		this.sendMember(music.by, { t: 'musicSkip', id, by: member });
	}

	/** The host stops sharing their song. */
	async endMusic(member) {
		const music = await this.ctx.storage.get('music');
		if (!music || music.by !== member) {
			return;
		}
		await this.ctx.storage.delete('music');
		this.broadcast({ t: 'music', music: null, by: member });
		this.stopListening();
	}

	/** Members listening along to the group's song (kept on their connections, never stored), leaving out `skip`. */
	listeners(skip) {
		const list = new Set();
		for (const ws of this.ctx.getWebSockets()) {
			const a = ws !== skip && ws.deserializeAttachment();
			if (a && a.member && a.listening && this.members[a.member]) {
				list.add(a.member);
			}
		}
		return [...list];
	}

	/** A member starts or stops listening along; everyone sees who is. */
	async setListening(ws, att, on) {
		const music = await this.ctx.storage.get('music');
		if (!!att.listening === on || (on && (!music || music.by === att.member))) {
			return;
		}
		att.listening = on;
		ws.serializeAttachment(att);
		this.broadcast({ t: 'musicListeners', list: this.listeners() });
	}

	/** Members' statuses (kept on their connections while online, never stored), leaving out `skip`'s. */
	statuses(skip) {
		const list = new Map();
		for (const ws of this.ctx.getWebSockets()) {
			const a = ws !== skip && ws.deserializeAttachment();
			if (a && a.member && a.status && this.members[a.member]) {
				list.set(a.member, a.status);
			}
		}
		return [...list].map(([n, s]) => ({ n, s }));
	}

	/** A member's status: a short line of their own, the song they listen to and their achievements' ids (null: none). */
	setStatus(ws, att, s) {
		const ok = s && typeof s === 'object';
		const t = ok ? clean(s.t, LIMITS.status) : '';
		const l = ok ? clean(s.l, LIMITS.status) : '';
		const a =
			ok && Array.isArray(s.a)
				? [...new Set(s.a.filter((x) => typeof x === 'string' && /^[a-z]{2}$/.test(x)))].slice(0, LIMITS.achievements)
				: [];
		const status = t || l || a.length ? { t, l, a } : null;
		if (JSON.stringify(status) === JSON.stringify(att.status || null)) {
			return;
		}
		att.status = status;
		ws.serializeAttachment(att);
		this.broadcast({ t: 'status', n: att.member, s: status });
	}

	/** Nobody listens along any more (the song stopped, or someone else's took over). */
	stopListening() {
		let changed = false;
		for (const ws of this.ctx.getWebSockets()) {
			const a = ws.deserializeAttachment();
			if (a && a.listening) {
				a.listening = false;
				ws.serializeAttachment(a);
				changed = true;
			}
		}
		if (changed) {
			this.broadcast({ t: 'musicListeners', list: [] });
		}
	}

	/** A member leaves; ownership passes on, and an empty group is deleted. */
	async leave(member) {
		const g = this.meta;
		const name = this.members[member].name;
		delete this.members[member];
		g.admins = g.admins.filter((n) => n !== member);
		const left = Object.values(this.members);
		if (!left.length) {
			// Last member out: delete everything.
			this.closeMember(member, 'left');
			await this.ctx.storage.deleteAll();
			this.meta = null;
			this.members = {};
			this.invites = {};
			this.keys = { epoch: 0, rekey: false, eps: {} };
			this.seq = 0;
			return;
		}
		if (g.owner === member) {
			// Ownership passes to an admin, else the longest member.
			g.owner = g.admins[0] || left.sort((a, b) => a.joined - b.joined)[0].n;
			if (!g.admins.includes(g.owner)) {
				g.admins.push(g.owner);
			}
		}
		await this.save();
		await this.note(`${name} left`);
		this.closeMember(member, 'left');
		this.broadcast({ t: 'roster', roster: this.roster() });
		await this.needRekey();
	}

	/** Deletes the group and closes every connection (owner only). */
	async disband(by) {
		if (!this.meta || by !== this.meta.owner) {
			return;
		}
		for (const ws of this.ctx.getWebSockets()) {
			this.send(ws, { t: 'gone', why: 'deleted' });
			try {
				ws.close(4000, 'deleted');
			} catch (e) {
				/* gone */
			}
		}
		await this.ctx.storage.deleteAll();
		this.meta = null;
		this.members = {};
		this.invites = {};
		this.keys = { epoch: 0, rekey: false, eps: {} };
		this.seq = 0;
	}

	/**
	 * Takes wraps of a group key from a member: `e` the epoch, `wraps` [{ to, iv, ct, sig }]. With `fresh`,
	 * a new key starts epoch `e` (only the next one, and only when there is none yet or a member left);
	 * otherwise the wraps give a kept epoch's key to members who don't have it yet (newcomers get the older
	 * keys too, so they can read the history).
	 */
	async addKeys(member, p) {
		const k = this.keys;
		if (!Number.isInteger(p.e) || !Array.isArray(p.wraps) || p.wraps.length > LIMITS.members) {
			return;
		}
		if (p.fresh === true) {
			if (p.e !== k.epoch + 1 || (k.epoch > 0 && !k.rekey)) {
				return;
			}
			k.epoch = p.e;
			k.rekey = false;
			k.since = Date.now();
			k.fromSeq = this.seq;
			k.eps[p.e] = {};
			for (const e of Object.keys(k.eps)) {
				if (Number(e) <= p.e - EPOCHS) {
					delete k.eps[e];
				}
			}
		} else if (p.e > k.epoch || !k.eps[p.e]) {
			return;
		}
		const ep = k.eps[p.e];
		for (const w of p.wraps) {
			const to = w && isNum(w.to) ? this.members[w.to] : null;
			// A wrap for an encryption key the member no longer uses can be replaced.
			if (!to || (ep[w.to] && ep[w.to].ek === to.ek) || !IV_RE.test(w.iv || '') || !sealed(w.ct, 200) || !B64URL.test(w.sig || '')) {
				continue;
			}
			ep[w.to] = { to: w.to, by: member, ek: this.members[w.to].ek, iv: w.iv, ct: w.ct, sig: w.sig };
		}
		await this.ctx.storage.put('keys', k);
		this.sendKeys();
	}
	/** Forgets the wraps of a member whose encryption key changed, so they get new ones. */
	async dropWraps(member) {
		let dropped = false;
		for (const ep of Object.values(this.keys.eps)) {
			if (ep[member]) {
				delete ep[member];
				dropped = true;
			}
		}
		if (dropped) {
			await this.ctx.storage.put('keys', this.keys);
		}
	}
	/**
	 * A member moves to a new key (`pub`, with its encryption key `ek`): their browser restored the keys
	 * from their account, or made keys it can back up. `sig` is the old key's signature of
	 * `rekey|<member>|<new x>|<new y>`, so only whoever holds the key the group knows can hand over, and `eks`
	 * signs `ek` with the new key, so they hold that one too. The old key and its signature stay on the member
	 * as `rk`, so friends who only know the old key can check the new one. Answers 'rekeyed'; already on that
	 * key, it only answers.
	 */
	async rekeyMember(ws, att, p) {
		const member = att.member;
		const m = this.members[member];
		if (!m || !p.pub || !B64URL.test(p.pub.x || '') || !B64URL.test(p.pub.y || '') || !B64URL.test(p.sig || '')) {
			return this.send(ws, { t: 'error', why: 'bad key change' });
		}
		const pub = { x: p.pub.x, y: p.pub.y };
		if (samePub(m.pub, pub)) {
			return this.send(ws, { t: 'rekeyed', x: pub.x });
		}
		if (
			!EK_RE.test(p.ek || '') ||
			!B64URL.test(p.eks || '') ||
			!(await verify(m.pub, p.sig, `rekey|${member}|${pub.x}|${pub.y}`)) ||
			!(await verify(pub, p.eks, `ek|${att.gid}|${member}|${p.ek}`))
		) {
			return this.send(ws, { t: 'error', why: 'bad key change' });
		}
		const ekChanged = m.ek !== p.ek;
		Object.assign(m, { pub, ek: p.ek, eks: p.eks, rk: { x: m.pub.x, y: m.pub.y, sig: p.sig } });
		if (ekChanged) {
			await this.dropWraps(member);
		}
		await this.save();
		this.send(ws, { t: 'rekeyed', x: pub.x });
		this.broadcast({ t: 'roster', roster: this.roster() });
		this.sendKeys();
	}
	/** A member left or was removed: the next key must be one they never had. */
	async needRekey() {
		if (this.keys.epoch > 0) {
			this.keys.rekey = true;
			await this.ctx.storage.put('keys', this.keys);
		}
		this.sendKeys();
	}
	/**
	 * Sends every signed-in member the key state: the epoch, whether a new key is needed, their own wraps
	 * (with the wrapping member) and which members still need the current key.
	 */
	sendKeys() {
		const k = this.keys;
		const ep = k.eps[k.epoch] || {};
		const needs = k.epoch
			? Object.values(this.members)
					.filter((m) => m.ek && (!ep[m.n] || ep[m.n].ek !== m.ek))
					.map((m) => m.n)
			: [];
		for (const ws of this.ctx.getWebSockets()) {
			const a = ws.deserializeAttachment();
			if (!a || !a.member || !this.members[a.member]) {
				continue;
			}
			const ek = this.members[a.member].ek;
			const mine = Object.entries(k.eps)
				.map(([e, wraps]) => ({ e: Number(e), w: wraps[a.member] }))
				.filter((x) => x.w && x.w.ek === ek);
			this.send(ws, { t: 'keys', epoch: k.epoch, rekey: k.rekey, mine, needs });
		}
	}

	/**
	 * The roster sent to clients. Each member's `kf` lets friends compare it with the key they know; `pub`,
	 * `ek` and `eks` let members check a member's encryption key before sealing the group key to it; `rk`
	 * (after a rekey) is the old key and its signature of the new one.
	 */
	roster() {
		const g = this.meta;
		return {
			name: g.name,
			owner: g.owner,
			admins: g.admins,
			open: g.open,
			online: this.online(),
			members: Object.values(this.members).map((m) => ({
				n: m.n,
				name: m.name,
				kf: m.pub.x.slice(0, 16),
				pub: m.pub,
				ek: m.ek,
				eks: m.eks,
				...(m.rk ? { rk: m.rk } : {}),
			})),
		};
	}
	/** Saves meta, members and invites. */
	async save() {
		await this.ctx.storage.put({ meta: this.meta, members: this.members, invites: this.invites });
	}
	/** Sends JSON to one connection (ignored if it is closed). */
	send(ws, x) {
		try {
			ws.send(JSON.stringify(x));
		} catch (e) {
			/* gone */
		}
	}
	/** Sends to one member's signed-in connections. */
	sendMember(n, x) {
		const s = JSON.stringify(x);
		for (const ws of this.ctx.getWebSockets()) {
			const a = ws.deserializeAttachment();
			if (a && a.member === n) {
				try {
					ws.send(s);
				} catch (e) {
					/* gone */
				}
			}
		}
	}
	/** Sends to every signed-in member. */
	broadcast(x) {
		const s = JSON.stringify(x);
		for (const ws of this.ctx.getWebSockets()) {
			const a = ws.deserializeAttachment();
			if (a && a.member && this.members[a.member]) {
				try {
					ws.send(s);
				} catch (e) {
					/* gone */
				}
			}
		}
	}
	/** Closes a member's connections with a 'gone' message. */
	closeMember(member, why) {
		for (const ws of this.ctx.getWebSockets()) {
			const a = ws.deserializeAttachment();
			if (a && a.member === member) {
				this.send(ws, { t: 'gone', why });
				try {
					ws.close(4000, why);
				} catch (e) {
					/* gone */
				}
			}
		}
	}
	/** Sends a fatal error and closes the connection. */
	fail(ws, why) {
		this.send(ws, { t: 'error', why, fatal: true });
		try {
			ws.close(4001, why);
		} catch (e) {
			/* gone */
		}
	}
}

/**
 * One player's mailbox. Storage: 'm:<id>' -> { id, from, name, fromKf, kf, enc, at, rk?, pub? }, where `kf`
 * is the recipient key the beep is addressed to, `fromKf` the sender's and `enc` { e, iv, ct } the beep sealed
 * to the recipient's encryption key (`e` the sender's one-time key). A sender who moved to a new key signs in
 * with `rk`, their old key's signature of the new one (as in a group's rekey); it is kept with the beep, with
 * the sender's whole key (`pub`), so a recipient who only knows the old key can check it. Signed in as the
 * box's member number, a connection reads (and acks) the beeps for its own key; any other signed-in
 * connection may leave one.
 */
export class Mailbox extends DurableObject {
	constructor(ctx, env) {
		super(ctx, env);
		ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('{"t":"ping"}', '{"t":"pong"}'));
	}

	/** Accepts a WebSocket (at most 20 at once) and sends it a sign-in nonce. */
	async fetch(req) {
		const owner = Number(new URL(req.url).searchParams.get('m'));
		if (this.ctx.getWebSockets().length >= 20) {
			return new Response('Busy', { status: 503 });
		}
		const [client, server] = Object.values(new WebSocketPair());
		this.ctx.acceptWebSocket(server);
		const nonce = b64url(crypto.getRandomValues(new Uint8Array(18)));
		server.serializeAttachment({ owner, nonce, member: null, kf: null, hits: [] });
		server.send(JSON.stringify({ t: 'hello', nonce }));
		return new Response(null, { status: 101, webSocket: client });
	}

	/**
	 * A client message: 'auth' first (the owner then gets its beeps as 'mail'), then 'put' (leave a beep),
	 * 'ack' (owner: delete read beeps) or 'check' (owner: fetch again). Rate limited per connection.
	 */
	async webSocketMessage(ws, raw) {
		const att = ws.deserializeAttachment();
		try {
			if (typeof raw !== 'string' || raw.length > 8000) {
				return this.fail(ws, 'too big');
			}
			const now = Date.now();
			att.hits = (att.hits || []).filter((t) => now - t < 10000);
			att.hits.push(now);
			ws.serializeAttachment(att);
			if (att.hits.length > LIMITS.burst) {
				return this.send(ws, { t: 'error', why: 'slow down' });
			}
			let p;
			try {
				p = JSON.parse(raw);
			} catch (e) {
				return this.fail(ws, 'not JSON');
			}
			if (!p || typeof p !== 'object' || Array.isArray(p) || typeof p.t !== 'string') {
				return this.fail(ws, 'bad message');
			}
			if (!att.member) {
				if (p.t !== 'auth') {
					return this.fail(ws, 'sign in first');
				}
				const member = p.member;
				if (!isNum(member) || !p.pub || !B64URL.test(p.pub.x || '') || !B64URL.test(p.pub.y || '') || !B64URL.test(p.sig || '')) {
					return this.fail(ws, 'bad sign-in');
				}
				if (!(await verify({ x: p.pub.x, y: p.pub.y }, p.sig, `${att.nonce}|mbox:${att.owner}|${member}`))) {
					return this.fail(ws, 'bad signature');
				}
				att.member = member;
				att.kf = p.pub.x.slice(0, 16);
				att.name = clean(p.name, LIMITS.name) || `#${member}`;
				const rk = p.rk;
				if (
					rk &&
					B64URL.test(rk.x || '') &&
					B64URL.test(rk.y || '') &&
					B64URL.test(rk.sig || '') &&
					(await verify({ x: rk.x, y: rk.y }, rk.sig, `rekey|${member}|${p.pub.x}|${p.pub.y}`))
				) {
					att.rk = { x: rk.x, y: rk.y, sig: rk.sig };
					att.pub = { x: p.pub.x, y: p.pub.y };
				}
				ws.serializeAttachment(att);
				if (member === att.owner) {
					return this.send(ws, { t: 'mail', list: await this.mine(att.kf) });
				}
				return this.send(ws, { t: 'welcome' });
			}
			if (p.t === 'put') {
				return await this.put(ws, att, p);
			}
			if (p.t === 'ack') {
				return await this.ack(att, p.ids);
			}
			if (p.t === 'check' && att.member === att.owner) {
				return this.send(ws, { t: 'mail', list: await this.mine(att.kf) });
			}
			return this.send(ws, { t: 'error', why: 'unknown' });
		} catch (e) {
			this.send(ws, { t: 'error', why: 'server error' });
		}
	}

	/** All stored beeps, oldest first, after deleting those older than MAIL.days and any left unsealed by an older version. */
	async all() {
		const rows = [...(await this.ctx.storage.list({ prefix: 'm:' })).entries()];
		const old = Date.now() - MAIL.days * 864e5;
		const gone = rows.filter(([, m]) => !m || m.at < old || !m.enc).map(([k]) => k);
		if (gone.length) {
			await this.ctx.storage.delete(gone);
		}
		return rows
			.filter(([, m]) => m && m.at >= old && m.enc)
			.map(([, m]) => m)
			.sort((a, b) => a.at - b.at);
	}
	/** The beeps addressed to key `kf`. */
	async mine(kf) {
		return (await this.all())
			.filter((m) => m.kf === kf && m.enc)
			.map(({ id, from, name, fromKf, enc, at, rk, pub }) => ({ id, from, name, fromKf, enc, at, ...(rk ? { rk, pub } : {}) }));
	}

	/** Leaves a beep (not in your own box), within MAIL limits; delivered at once if the owner is connected with that key. */
	async put(ws, att, p) {
		if (att.member === att.owner) {
			return this.send(ws, { t: 'error', why: 'that is your own mailbox' });
		}
		const enc = p.enc;
		const ref = typeof p.ref === 'string' ? p.ref.slice(0, 24) : '';
		if (!enc || !EK_RE.test(enc.e || '') || !IV_RE.test(enc.iv || '') || !sealed(enc.ct, CT_MAX) || !KF_RE.test(p.kf || '')) {
			return this.send(ws, { t: 'error', why: 'bad beep', ref });
		}
		const list = await this.all();
		if (list.length >= MAIL.box) {
			return this.send(ws, { t: 'error', why: 'their mailbox is full', ref });
		}
		const day = Date.now() - 864e5;
		if (list.filter((m) => m.from === att.member && m.at > day).length >= MAIL.perSender) {
			return this.send(ws, { t: 'error', why: 'enough beeps left for today', ref });
		}
		const m = {
			id: secret(),
			from: att.member,
			name: att.name,
			fromKf: att.kf,
			kf: p.kf,
			enc: { e: enc.e, iv: enc.iv, ct: enc.ct },
			at: Date.now(),
			...(att.rk ? { rk: att.rk, pub: att.pub } : {}),
		};
		await this.ctx.storage.put(`m:${m.id}`, m);
		this.send(ws, { t: 'ok', ref, id: m.id });
		const { kf, ...item } = m;
		for (const o of this.ctx.getWebSockets()) {
			const a = o.deserializeAttachment();
			if (a && a.member === a.owner && a.kf === kf) {
				this.send(o, { t: 'mail', list: [item] });
			}
		}
	}

	/** Deletes read beeps (owner only, and only beeps for their key). */
	async ack(att, ids) {
		if (att.member !== att.owner || !Array.isArray(ids)) {
			return;
		}
		const keys = ids
			.slice(0, MAIL.ack)
			.filter((id) => typeof id === 'string' && SECRET_RE.test(id))
			.map((id) => `m:${id}`);
		if (!keys.length) {
			return;
		}
		const rows = await this.ctx.storage.get(keys);
		const mine = [...rows.entries()].filter(([, m]) => m && m.kf === att.kf).map(([k]) => k);
		if (mine.length) {
			await this.ctx.storage.delete(mine);
		}
	}

	webSocketClose(ws) {
		try {
			ws.close();
		} catch (e) {
			/* closed */
		}
	}
	webSocketError(ws) {
		try {
			ws.close();
		} catch (e) {
			/* closed */
		}
	}
	send(ws, x) {
		try {
			ws.send(JSON.stringify(x));
		} catch (e) {
			/* gone */
		}
	}
	fail(ws, why) {
		this.send(ws, { t: 'error', why, fatal: true });
		try {
			ws.close(4001, why);
		} catch (e) {
			/* gone */
		}
	}
}

/** Whether two public keys are the same. */
const samePub = (a, b) => !!a && !!b && a.x === b.x && a.y === b.y;

/** Verifies an ECDSA P-256 / SHA-256 signature (base64url r||s) of `text`. */
async function verify(pub, sig, text) {
	try {
		const key = await crypto.subtle.importKey(
			'jwk',
			{ kty: 'EC', crv: 'P-256', x: pub.x, y: pub.y, ext: true },
			{ name: 'ECDSA', namedCurve: 'P-256' },
			false,
			['verify'],
		);
		return await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, unb64url(sig), new TextEncoder().encode(text));
	} catch (e) {
		return false;
	}
}

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
 * Global (GLOBAL_ID) is the exception: a public group anyone with SlimeBeep joins without an invite. Its
 * messages come in as text over the encrypted connection and are stored sealed with the GLOBAL_KEY secret.
 *
 * Free-plan limits: sockets hibernate, keep-alive pings get an auto-response without waking the
 * object, and each group takes at most LIMITS.perDay messages a day.
 */

import { DurableObject } from 'cloudflare:workers';
import { GLOBAL_LOGO } from './global-logo.js';

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
	/** Longest timeout, in seconds (28 days, as on Discord). */
	timeout: 28 * 86400,
	/** Most pinned messages in a group (as on Discord). */
	pins: 50,
	/** Most achievements a status lists. */
	achievements: 40,
};
/**
 * Global: the one public group every SlimeBeep player can join without an invite, with no member cap. Its
 * messages are kept sealed with the GLOBAL_KEY secret (anyone can join, so members can't share a key the way
 * other groups do). An existing group is turned into it the first time it is reached under GLOBAL_ID.
 */
const GLOBAL_ID = 'lr0c521s94bn115u';
/**
 * Whether a group id is Global's. The test relay sets GLOBAL_GID: every id starting with it is then a Global,
 * so each test run gets a fresh one.
 */
const isGlobalId = (gid, env) => (env.GLOBAL_GID ? gid.startsWith(env.GLOBAL_GID) : gid === GLOBAL_ID);
/** Global's limits, where they differ from LIMITS. */
const GLOBAL = {
	/** Most open connections. */
	sockets: 3000,
	/** Most messages it takes per day. */
	perDay: 5000,
	/** Shortest gap between one member's messages (ms). */
	gap: 1500,
	/** Most members its roster lists: those online, then the admins. */
	listed: 300,
	/**
	 * How long roster changes are gathered before they go out (ms; GLOBAL_ROSTER_MS overrides it for the tests).
	 * Each send is an alarm, and alarms count as requests on the free plan: at most 8,640 a day at 10 s.
	 */
	rosterEvery: 10000,
	/** Most banned member numbers. */
	bans: 5000,
	/** Most bans sent to an admin (the newest). */
	bansSent: 500,
	/** Most new member numbers one address may join in an hour (GLOBAL_JOINS overrides it for the tests). */
	joinsPerHour: 20,
};
/** Global's owner (the Slime Queen), made owner when the group turns into Global if they are in it (GLOBAL_OWNER overrides it for the tests). */
const GLOBAL_OWNER = 255659;
/** The GLOBAL_KEY secret: 32 bytes in base64url. */
const GLOBAL_KEY_RE = /^[A-Za-z0-9_-]{43}$/;
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
 * One group chat. Members' statuses and who listens along live on their connections, not in storage. Storage: 'meta' { name, owner, admins, open, created, pic, e2e, timeouts }, 'members' (member
 * number -> { n, name, pub, ek, eks, joined, pic, rk }), 'invites' (secret -> { member, by, exp, uses }),
 * 'msg:<seq>' sealed messages, 'keys' { epoch, rekey, eps: epoch -> member -> wrap } and 'music'
 * { u, ti, p, pl, d, i, b, by, name, at, q }: the song playing, only its link and where it is, never the sound,
 * and the titles of the songs queued after it. 'pins' [{ id, by, at, m }]: pinned messages, each with a copy of
 * the stored message `m` so it outlives LIMITS.keep. meta.timeouts: member number -> when their timeout ends.
 *
 * Global (meta.global) keeps each member as 'gm:<member number>' instead of one 'members' record, since it has
 * no cap; meta also holds its `bans` (member number -> { name, by, at }). Its 'msg:<seq>' records keep their
 * text sealed with GLOBAL_KEY as `sec` { iv, ct }. It has no group keys and no music.
 */
export class Group extends DurableObject {
	constructor(ctx, env) {
		super(ctx, env);
		// ROTATE_MSGS is set only by the local test server.
		this.rotateMsgs = Number(env.ROTATE_MSGS) || ROTATE.msgs;
		// Global's members changed or removed since the last save (see touch and drop).
		this.dirty = new Set();
		this.dropped = new Set();
		// When each member last spoke in Global, and when each address last joined new numbers (in memory only).
		this.lastSay = new Map();
		this.joins = new Map();
		// Pings are answered without waking the object.
		ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('{"t":"ping"}', '{"t":"pong"}'));
		ctx.blockConcurrencyWhile(async () => {
			this.meta = (await ctx.storage.get('meta')) || null;
			this.members = this.meta && this.meta.global ? await this.loadGlobalMembers() : (await ctx.storage.get('members')) || {};
			this.invites = (await ctx.storage.get('invites')) || {};
			// Message counter: the newest stored message, or the saved count when that is ahead (Global passes some on unstored).
			const newest = await ctx.storage.list({ prefix: 'msg:', reverse: true, limit: 1 });
			this.seq = Math.max(newest.size ? [...newest.values()][0].id : 0, (await ctx.storage.get('seq')) || 0);
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

	/** Whether this group is Global. */
	get global() {
		return !!this.meta && this.meta.global === 1;
	}
	/** Global's members, read from their own records. */
	async loadGlobalMembers() {
		/** @type {Record<number, object>} */
		const out = {};
		for (const m of (await this.ctx.storage.list({ prefix: 'gm:' })).values()) {
			out[m.n] = m;
		}
		return out;
	}
	/** Marks a member as changed, so save() writes them (Global keeps each member in its own record). */
	touch(n) {
		this.dirty.add(n);
		this.dropped.delete(n);
	}
	/** Removes a member; save() deletes their record in Global (the key their number is bound to stays, see save). */
	drop(n) {
		delete this.members[n];
		this.dirty.delete(n);
		this.dropped.add(n);
	}
	/**
	 * Whether `ip` may join one more new member number to Global (GLOBAL.joinsPerHour), counting it if so.
	 * Numbers already bound to a key don't count: this only slows down claiming other players' numbers.
	 */
	joinAllowed(ip) {
		const now = Date.now();
		const times = (this.joins.get(ip) || []).filter((t) => now - t < 36e5);
		if (times.length >= (Number(this.env.GLOBAL_JOINS) || GLOBAL.joinsPerHour)) {
			return false;
		}
		times.push(now);
		this.joins.set(ip, times);
		return true;
	}

	/**
	 * Turns this group into Global (the first time it is reached under GLOBAL_ID): renamed, the slime logo as
	 * its picture, members moved to their own records. Its end-to-end sealed history goes, since nobody who joins
	 * from now on could open it; its members keep their own copies.
	 */
	async makeGlobal() {
		const old = [...(await this.ctx.storage.list({ prefix: 'msg:' })).keys()];
		for (let i = 0; i < old.length; i += 128) {
			await this.ctx.storage.delete(old.slice(i, i + 128));
		}
		Object.assign(this.meta, { global: 1, name: 'Global', pic: GLOBAL_LOGO, open: false, bans: {} });
		const owner = Number(this.env.GLOBAL_OWNER) || GLOBAL_OWNER;
		if (this.members[owner]) {
			this.meta.owner = owner;
			if (!this.meta.admins.includes(owner)) {
				this.meta.admins.push(owner);
			}
		}
		this.invites = {};
		this.keys = { epoch: 0, rekey: false, eps: {} };
		for (const n of Object.keys(this.members)) {
			this.touch(Number(n));
		}
		await this.ctx.storage.delete(['keys', 'members', 'music', 'pins']);
		await this.ctx.storage.put('seq', this.seq);
		await this.save();
		await this.note('This chat is now Global: everyone with SlimeBeep can join');
	}

	/** Global's message key from the GLOBAL_KEY secret, imported once; null without it (nothing is sent then). */
	globalKey() {
		if (!this.sealKey) {
			const raw = this.env.GLOBAL_KEY;
			this.sealKey =
				typeof raw === 'string' && GLOBAL_KEY_RE.test(raw)
					? crypto.subtle.importKey('raw', unb64url(raw), 'AES-GCM', false, ['encrypt', 'decrypt'])
					: Promise.resolve(null);
		}
		return this.sealKey;
	}
	/**
	 * A Global message's text sealed with GLOBAL_KEY, bound to its message id; null without the key.
	 * @returns {Promise<{ iv: string, ct: string } | null>}
	 */
	async sealText(text, id) {
		const key = await this.globalKey();
		if (!key) {
			return null;
		}
		const iv = crypto.getRandomValues(new Uint8Array(12));
		const ct = await crypto.subtle.encrypt(
			{ name: 'AES-GCM', iv, additionalData: new TextEncoder().encode(`global|${id}`) },
			key,
			new TextEncoder().encode(text),
		);
		return { iv: b64url(iv), ct: b64url(ct) };
	}
	/** Opens a stored Global message (sealText); null if it can't be opened. */
	async openText(sec, id) {
		const key = await this.globalKey();
		if (!key || !sec || typeof sec.iv !== 'string' || typeof sec.ct !== 'string') {
			return null;
		}
		try {
			const plain = await crypto.subtle.decrypt(
				{ name: 'AES-GCM', iv: unb64url(sec.iv), additionalData: new TextEncoder().encode(`global|${id}`) },
				key,
				unb64url(sec.ct),
			);
			return new TextDecoder().decode(plain);
		} catch (e) {
			return null;
		}
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
		if (!this.global && !this.members[member] && Object.keys(this.members).length >= LIMITS.members) {
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
		if (isGlobalId(gid, this.env) && this.meta && !this.global) {
			// Nothing else runs meanwhile, so it happens once.
			await this.ctx.blockConcurrencyWhile(async () => {
				if (!this.global) {
					await this.makeGlobal();
				}
			});
		}
		if (this.ctx.getWebSockets().length >= (this.global ? GLOBAL.sockets : LIMITS.sockets)) {
			return new Response('Busy', { status: 503 });
		}
		const [client, server] = Object.values(new WebSocketPair());
		this.ctx.acceptWebSocket(server);
		const nonce = b64url(crypto.getRandomValues(new Uint8Array(18)));
		server.serializeAttachment({ gid, nonce, member: null, hits: [], ip: req.headers.get('CF-Connecting-IP') || '' });
		server.send(JSON.stringify({ t: 'hello', nonce }));
		return new Response(null, { status: 101, webSocket: client });
	}

	/**
	 * A client message (JSON with `t`). Before sign-in only 'auth'; then 'say', 'history', 'gkey', 'rekey', 'invite', 'kick',
	 * 'ban' (Global), 'timeout', 'pin', 'admin', 'owner', 'rename', 'open', 'profile', 'gpic', 'music', 'musicEnd', 'musicQueue', 'musicAdd',
	 * 'musicSkip', 'musicListen', 'status', 'leave', 'disband' and 'lookup' (Global). Rate limited per connection.
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
			// Global has no group keys (its messages are sealed here) and no shared music.
			if (this.global && (p.t === 'gkey' || p.t.startsWith('music'))) {
				return this.send(ws, { t: 'error', why: p.t === 'gkey' ? 'unknown' : 'no music in Global' });
			}
			// Timed out: reading only, as on Discord (no messages, no songs shared with the group).
			const until = this.timedOut(att.member);
			if (until && (p.t === 'say' || p.t === 'music' || p.t === 'musicAdd')) {
				return this.send(ws, { t: 'error', why: 'timed out', until });
			}
			switch (p.t) {
				case 'say':
					return await (this.global ? this.sayGlobal(att.member, p) : this.say(att.member, p));
				case 'timeout':
					return await this.timeout(att.member, p.member, p.secs);
				case 'pin':
					return await this.pin(att.member, p.id, p.on === true);
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
				case 'ban':
					return await this.ban(att.member, p.member, p.on === true);
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
				case 'lookup':
					return this.lookup(ws, att.member, p.member);
				default:
					return this.send(ws, { t: 'error', why: 'unknown' });
			}
		} catch (e) {
			this.send(ws, { t: 'error', why: 'server error' });
		}
	}

	/**
	 * The SlimeBeep owner's exception, in Global only: the owner looks up any member, and any member looks up the owner,
	 * so the two can message each other through their mailboxes without being Bondage Club friends. Answers the keys
	 * Global holds for that number (bound to it, see auth) and whether they are online.
	 */
	lookup(ws, me, n) {
		const owner = Number(this.env.GLOBAL_OWNER) || GLOBAL_OWNER;
		if (!this.global || !isNum(n) || n === me || (me !== owner && n !== owner)) {
			return this.send(ws, { t: 'error', why: 'unknown', ...(isNum(n) ? { member: n } : {}) });
		}
		const m = this.members[n];
		const on = !!m && this.ctx.getWebSockets().some((w) => (w.deserializeAttachment() || {}).member === n);
		return this.send(ws, { t: 'lookup', member: n, ...(m && m.ek ? { name: m.name, pub: m.pub, ek: m.ek, eks: m.eks } : {}), on });
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
			if (this.global) {
				// Global's roster carries who is online; changes go out gathered (rosterChanged).
				this.rosterChanged().catch(() => {});
			} else {
				this.broadcast({ t: 'presence', online: this.online(ws) });
			}
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
	 * an invite (p.invite), joins Global (p.join) or checks the key of an existing member. Sends the roster,
	 * pictures and history.
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
		} else if (this.global && this.meta.bans[member]) {
			return this.fail(ws, 'banned from Global');
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
			if (!known && !this.global && Object.keys(this.members).length >= LIMITS.members) {
				return this.fail(ws, 'group is full');
			}
			// In Global, connections still signed in on the keys this replaces are closed.
			if (this.global && known && !samePub(known.pub, pub)) {
				this.closeMember(member, 'signed in with new keys');
			}
			// A key bound by an invite replaces any earlier hand-over (`rk`), which was for another key.
			const was = { ...(known || { joined: Date.now() }) };
			delete was.rk;
			this.members[member] = { ...was, n: member, name, pub, ek, eks };
			this.touch(member);
			if (known && known.ek !== ek) {
				await this.dropWraps(member);
			}
			if (inv.member || ++inv.uses >= LIMITS.openUses) {
				delete this.invites[p.invite];
			}
			await this.save();
			// Global gets too many comings and goings to note them.
			if (!known && !this.global) {
				await this.note(`${name} joined`);
			}
		} else if (this.global && p.join === true && !this.members[member]) {
			// Anyone joins Global. A number is bound to the first key it joins with, and stays bound after it leaves.
			const bound = await this.ctx.storage.get(`gb:${member}`);
			if (bound && !samePub(bound, pub)) {
				return this.fail(ws, 'that member number is taken');
			}
			if (!bound && !this.joinAllowed(att.ip)) {
				return this.fail(ws, 'too many new members from here; try again later');
			}
			this.members[member] = { n: member, name, pub, ek, eks, joined: Date.now() };
			this.touch(member);
			await this.save();
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
				this.touch(member);
				await this.save();
			}
		}
		att.member = member;
		ws.serializeAttachment(att);
		this.send(ws, { t: 'welcome', me: member, roster: this.roster() });
		// Global keeps no member pictures: with no cap, sending them all on every sign-in would be too much.
		for (const m of this.global ? [] : Object.values(this.members)) {
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
		if (this.global && this.meta.admins.includes(member)) {
			this.sendBans(ws);
		}
		if (this.timedOut(member)) {
			this.send(ws, { t: 'timeout', until: this.timedOut(member) });
		}
		const pins = await this.pinList();
		if (pins.length) {
			this.send(ws, { t: 'pins', list: pins });
		}
		const music = this.global ? null : await this.ctx.storage.get('music');
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
		await this.history(ws, p.after);
		await this.rosterChanged();
		this.sendKeys();
	}

	/**
	 * Posts a message in Global: text (sealed with GLOBAL_KEY when stored), at most one per member every
	 * GLOBAL.gap and GLOBAL.perDay a day. Refused without the key, so nothing is ever stored readable.
	 */
	async sayGlobal(member, p) {
		const text = clean(p.text, LIMITS.text);
		if (!text) {
			return;
		}
		const now = Date.now();
		if (now - (this.lastSay.get(member) || 0) < GLOBAL.gap) {
			return this.sendMember(member, { t: 'error', why: 'slow down' });
		}
		if (!(await this.globalKey())) {
			return this.sendMember(member, { t: 'error', why: 'Global is not set up yet' });
		}
		this.lastSay.set(member, now);
		const day = new Date().toISOString().slice(0, 10);
		if (this.today.day !== day) {
			this.today = { day, n: 0 };
		}
		if (++this.today.n > GLOBAL.perDay) {
			return this.sendMember(member, { t: 'error', why: 'Global has sent enough messages for today; back tomorrow' });
		}
		await this.append({
			from: member,
			name: this.members[member].name,
			text,
			ref: typeof p.ref === 'string' ? p.ref.slice(0, 24) : undefined,
		});
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

	/**
	 * Stores a message, drops the oldest past LIMITS.keep, and sends it to everyone connected. Global's text is
	 * stored sealed (sealText); without GLOBAL_KEY it is only passed on, never stored.
	 */
	async append(msg) {
		this.seq += 1;
		const m = { id: this.seq, at: Date.now(), ...msg };
		let stored = m;
		if (this.global) {
			const { text, ...rest } = m;
			const sec = await this.sealText(text, m.id);
			stored = sec ? { ...rest, sec } : null;
		}
		if (stored) {
			await this.ctx.storage.put(`msg:${String(this.seq).padStart(10, '0')}`, stored);
		} else {
			await this.ctx.storage.put('seq', this.seq);
		}
		if (this.seq > LIMITS.keep) {
			await this.ctx.storage.delete(`msg:${String(this.seq - LIMITS.keep).padStart(10, '0')}`);
		}
		this.broadcast({ t: 'msg', m });
	}

	/** Sends the stored messages after id `after` (Global's opened first; any that won't open are left out). */
	async history(ws, after) {
		const from = Number.isInteger(after) && after >= 0 ? after : 0;
		const list = await this.ctx.storage.list({ prefix: 'msg:', start: `msg:${String(from + 1).padStart(10, '0')}`, limit: LIMITS.keep });
		let msgs = [...list.values()];
		if (this.global) {
			const opened = await Promise.all(
				msgs.map(async ({ sec, ...m }) => {
					const text = await this.openText(sec, m.id);
					return text === null ? null : { ...m, text };
				}),
			);
			msgs = opened.filter(Boolean);
		}
		this.send(ws, { t: 'history', msgs });
	}

	/** Makes an invite: for one member number (p.member) or open. Admins only unless the group is open. */
	async invite(ws, member, p) {
		const admin = this.meta.admins.includes(member);
		if (!admin && !this.meta.open) {
			return this.send(ws, { t: 'error', why: 'only admins can invite here' });
		}
		if (!this.global && Object.keys(this.members).length >= LIMITS.members) {
			return this.send(ws, { t: 'error', why: 'group is full' });
		}
		const target = p.member == null ? null : p.member;
		if (target !== null && !isNum(target)) {
			return this.send(ws, { t: 'error', why: 'bad member number' });
		}
		// Anyone joins Global without one: its codes only let a number it knows back in on new keys (they lost theirs).
		if (this.global && (target === null || !admin || !(this.members[target] || (await this.ctx.storage.get(`gb:${target}`))))) {
			return this.send(ws, {
				t: 'error',
				why: target === null ? 'anyone can join Global from 👥 Groups' : 'Global has never seen that member number',
			});
		}
		// SlimeBeep's owner is let back in only by the operator (opInvite): with the owner's number, an admin's code would
		// make whoever uses it the owner for the owner's exception (see lookup).
		if (this.global && target === (Number(this.env.GLOBAL_OWNER) || GLOBAL_OWNER) && member !== target) {
			return this.send(ws, { t: 'error', why: "only the operator can let SlimeBeep's owner back in" });
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
		this.drop(target);
		g.admins = g.admins.filter((n) => n !== target);
		await this.save();
		await this.note(`${this.members[by].name} removed ${name}`);
		this.closeMember(target, 'removed');
		await this.rosterChanged();
		await this.needRekey();
	}

	/**
	 * When a member's timeout ends (ms), or 0 if they aren't timed out. Ended timeouts are forgotten at the next
	 * change (see timeout).
	 */
	timedOut(n) {
		const until = this.meta && this.meta.timeouts ? this.meta.timeouts[n] || 0 : 0;
		return until > Date.now() ? until : 0;
	}
	/**
	 * Times a member out for `secs` (at most LIMITS.timeout), or lifts their timeout (0): admins, like
	 * removing someone; only the owner times out an admin, and nobody the owner. A timed-out member still reads
	 * the chat but can't post (see webSocketMessage). Kept by member number, so leaving and joining again
	 * doesn't end it.
	 */
	async timeout(by, target, secs) {
		const g = this.meta;
		if (!isNum(target) || !this.members[target] || target === g.owner || target === by || !g.admins.includes(by)) {
			return;
		}
		if (g.admins.includes(target) && by !== g.owner) {
			return;
		}
		if (!Number.isInteger(secs) || secs < 0 || secs > LIMITS.timeout) {
			return;
		}
		const now = Date.now();
		const timeouts = Object.fromEntries(Object.entries(g.timeouts || {}).filter(([, until]) => until > now));
		const was = timeouts[target] || 0;
		if (!secs && !was) {
			return;
		}
		const name = this.members[target].name;
		if (secs) {
			timeouts[target] = now + secs * 1000;
		} else {
			delete timeouts[target];
		}
		g.timeouts = timeouts;
		await this.save();
		await this.note(
			secs ? `${this.members[by].name} timed out ${name} for ${spell(secs)}` : `${this.members[by].name} lifted ${name}'s timeout`,
		);
		this.sendMember(target, { t: 'timeout', until: timeouts[target] || 0 });
		await this.rosterChanged();
	}

	/**
	 * Pins a message (on) or unpins it (admins). A pin keeps a copy of the stored message, so it outlives the
	 * LIMITS.keep window; at most LIMITS.pins, newest first. Pinning says so in the chat, unpinning doesn't (as
	 * on Discord). Messages too old to be kept any more can't be pinned.
	 */
	async pin(by, id, on) {
		if (!this.meta.admins.includes(by) || !Number.isInteger(id) || id <= 0) {
			return;
		}
		const pins = (await this.ctx.storage.get('pins')) || [];
		const i = pins.findIndex((x) => x.id === id);
		if (on) {
			if (i >= 0) {
				return;
			}
			if (pins.length >= LIMITS.pins) {
				return this.sendMember(by, { t: 'error', why: `a chat keeps ${LIMITS.pins} pins at most: unpin one first` });
			}
			const m = await this.ctx.storage.get(`msg:${String(id).padStart(10, '0')}`);
			if (!m || m.sys) {
				return this.sendMember(by, { t: 'error', why: 'that message is too old to pin' });
			}
			pins.unshift({ id, by, at: Date.now(), m });
			await this.ctx.storage.put('pins', pins);
			await this.note(`${this.members[by].name} pinned a message`);
		} else {
			if (i < 0) {
				return;
			}
			pins.splice(i, 1);
			await this.ctx.storage.put('pins', pins);
		}
		this.broadcast({ t: 'pins', list: await this.pinList() });
	}
	/** The pins as members get them: Global's opened (its copies are sealed with GLOBAL_KEY, like its messages). */
	async pinList() {
		const pins = (await this.ctx.storage.get('pins')) || [];
		if (!this.global) {
			return pins;
		}
		const out = [];
		for (const x of pins) {
			const { sec, ...m } = x.m;
			const text = await this.openText(sec, m.id);
			if (text !== null) {
				out.push({ ...x, m: { ...m, text } });
			}
		}
		return out;
	}

	/**
	 * Bans a member number from Global, or lifts a ban (admins; only the owner can ban an admin). A banned
	 * number is removed and can't sign in or join again; it needn't be a member to be banned.
	 */
	async ban(by, target, on) {
		const g = this.meta;
		if (!this.global || !isNum(target) || target === g.owner || target === by || !g.admins.includes(by)) {
			return;
		}
		const was = g.bans[target];
		if (on) {
			if (was || (g.admins.includes(target) && by !== g.owner) || Object.keys(g.bans).length >= GLOBAL.bans) {
				return;
			}
			const name = this.members[target] ? this.members[target].name : `#${target}`;
			g.bans[target] = { name, by, at: Date.now() };
			g.admins = g.admins.filter((n) => n !== target);
			if (this.members[target]) {
				this.drop(target);
			}
			await this.save();
			await this.note(`${this.members[by].name} banned ${name}`);
			this.closeMember(target, 'banned from Global');
		} else {
			if (!was) {
				return;
			}
			delete g.bans[target];
			await this.save();
			await this.note(`${this.members[by].name} unbanned ${was.name}`);
		}
		this.sendBans();
		await this.rosterChanged();
	}
	/**
	 * Sends Global's ban list (the newest GLOBAL.bansSent) to one connection, or to every admin connected.
	 * @param {WebSocket} [ws]
	 */
	sendBans(ws) {
		const list = Object.entries(this.meta.bans)
			.map(([n, b]) => ({ n: Number(n), name: b.name, by: b.by, at: b.at }))
			.sort((a, b) => b.at - a.at)
			.slice(0, GLOBAL.bansSent);
		const x = { t: 'bans', list };
		if (ws) {
			return this.send(ws, x);
		}
		for (const n of this.meta.admins) {
			this.sendMember(n, x);
		}
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
		await this.rosterChanged();
		if (this.global && on) {
			this.sendBans();
		}
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
		await this.rosterChanged();
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
		await this.rosterChanged();
	}

	/** Lets every member invite, or admins only (admins; not in Global, which anyone joins). */
	async setOpen(by, on) {
		if (this.global || !this.meta.admins.includes(by) || this.meta.open === on) {
			return;
		}
		this.meta.open = on;
		await this.save();
		await this.note(on ? `${this.members[by].name} let everyone invite` : `${this.members[by].name} made invites admin-only`);
		await this.rosterChanged();
	}

	/** Updates a member's name and picture (null removes it). Global keeps names only (see auth). */
	async profile(member, p) {
		const m = this.members[member];
		if (typeof p.name === 'string') {
			m.name = clean(p.name, LIMITS.name) || m.name;
		}
		if (this.global) {
			delete m.pic;
		} else if (p.pic === null) {
			delete m.pic;
		} else if (typeof p.pic === 'string' && p.pic.length <= LIMITS.pic && PIC_RE.test(p.pic)) {
			m.pic = p.pic;
		}
		this.touch(member);
		await this.save();
		if (!this.global) {
			this.broadcast({ t: 'pic', n: member, data: m.pic || null });
		}
		await this.rosterChanged();
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

	/**
	 * A member leaves; ownership passes on, and an empty group is deleted. Global is never deleted, even
	 * empty, and its owner stays its owner (and admin) while out of it; anyone can join again whenever they like.
	 */
	async leave(member) {
		const g = this.meta;
		if (this.global) {
			this.drop(member);
			if (member !== g.owner) {
				g.admins = g.admins.filter((n) => n !== member);
			}
			await this.save();
			this.closeMember(member, 'left');
			return await this.rosterChanged();
		}
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
		await this.rosterChanged();
		await this.needRekey();
	}

	/** Deletes the group and closes every connection (owner only; never Global). */
	async disband(by) {
		if (!this.meta || by !== this.meta.owner || this.global) {
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
		this.touch(member);
		await this.save();
		this.send(ws, { t: 'rekeyed', x: pub.x });
		await this.rosterChanged();
		this.sendKeys();
	}
	/** A member left or was removed: the next key must be one they never had (not in Global, which has no group key). */
	async needRekey() {
		if (this.global) {
			return;
		}
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
		if (this.global) {
			return;
		}
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
	 * (after a rekey) is the old key and its signature of the new one. `timeouts` has the running timeouts of
	 * the members listed (member number -> when it ends).
	 *
	 * Global's lists only who is online and its admins (GLOBAL.listed at most), with names and key starts,
	 * and says how many members it has (`count`).
	 */
	roster() {
		const g = this.meta;
		if (this.global) {
			const online = this.online();
			const listed = [...new Set([...online, ...g.admins])].filter((n) => this.members[n]).slice(0, GLOBAL.listed);
			return {
				name: g.name,
				owner: g.owner,
				admins: g.admins,
				open: false,
				global: true,
				count: Object.keys(this.members).length,
				online: online.slice(0, GLOBAL.listed),
				members: listed.map((n) => ({ n, name: this.members[n].name, kf: this.members[n].pub.x.slice(0, 16) })),
				timeouts: this.timeoutsOf(listed),
			};
		}
		return {
			name: g.name,
			owner: g.owner,
			admins: g.admins,
			open: g.open,
			online: this.online(),
			timeouts: this.timeoutsOf(Object.keys(this.members).map(Number)),
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
	/** The running timeouts of these members: member number -> when it ends (ms). */
	timeoutsOf(nums) {
		/** @type {Record<number, number>} */
		const out = {};
		for (const n of nums) {
			if (this.timedOut(n)) {
				out[n] = this.timedOut(n);
			}
		}
		return out;
	}
	/** Saves meta, members and invites. Global writes only the members that changed, each in its own record. */
	async save() {
		if (!this.global) {
			await this.ctx.storage.put({ meta: this.meta, members: this.members, invites: this.invites });
			return;
		}
		/** @type {Record<string, unknown>} */
		const put = { meta: this.meta, invites: this.invites };
		for (const n of this.dirty) {
			const m = this.members[n];
			if (m) {
				put[`gm:${n}`] = m;
				// The key this number is bound to, kept after they leave so nobody else can take the number.
				put[`gb:${n}`] = { x: m.pub.x, y: m.pub.y };
			}
		}
		const gone = [...this.dropped].map((n) => `gm:${n}`);
		this.dirty.clear();
		this.dropped.clear();
		// Storage takes at most 128 keys a call.
		const entries = Object.entries(put);
		for (let i = 0; i < entries.length; i += 128) {
			await this.ctx.storage.put(Object.fromEntries(entries.slice(i, i + 128)));
		}
		for (let i = 0; i < gone.length; i += 128) {
			await this.ctx.storage.delete(gone.slice(i, i + 128));
		}
	}
	/**
	 * The roster changed: sent to everyone now, or in Global gathered for GLOBAL.rosterEvery (alarm), since its
	 * comings and goings would otherwise send everyone a new roster each time.
	 */
	async rosterChanged() {
		if (!this.global) {
			return this.broadcast({ t: 'roster', roster: this.roster() });
		}
		if ((await this.ctx.storage.getAlarm()) === null) {
			await this.ctx.storage.setAlarm(Date.now() + (Number(this.env.GLOBAL_ROSTER_MS) || GLOBAL.rosterEvery));
		}
	}
	/** Sends Global's gathered roster changes. */
	async alarm() {
		if (this.global) {
			this.broadcast({ t: 'roster', roster: this.roster() });
		}
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
/** A length of time in words ("10 minutes", "1 week"), in the largest whole unit. */
function spell(secs) {
	const units = [
		['week', 604800],
		['day', 86400],
		['hour', 3600],
		['minute', 60],
	];
	const [unit, size] = units.find(([, s]) => secs % s === 0) || ['second', 1];
	const n = secs / size;
	return `${n} ${unit}${n === 1 ? '' : 's'}`;
}

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

/*
 * SlimeBeep's group chat relay (Cloudflare Worker + one Durable Object per group).
 *
 * Group chats don't use game beeps, so they work between people who aren't friends. Each player's
 * SlimeBeep connects to the groups it is in over a WebSocket. A group keeps its members, roles,
 * invites and its last LIMITS.keep messages, so whoever was offline catches up when they connect.
 *
 * Who is who: every SlimeBeep makes its own key pair. Connecting means signing a one-time challenge
 * with it; a member's number is tied to their key when they join (with an invite from an admin, or
 * anyone when the group lets everyone invite). An invite made for one person only works for that
 * person, and is the only way to move a member to a new key (a new browser).
 *
 * Rules are enforced here, not in the add-on: owner > admins > members, at most LIMITS.members
 * people, plain text only, sizes capped, rate limited. Nothing a client sends is ever run.
 *
 * Staying inside Cloudflare's free plan (which never bills; past a limit requests just fail until the
 * daily reset): connections hibernate, so an idle group costs nothing; keep-alive pings are answered
 * by Cloudflare itself without waking the group (setWebSocketAutoResponse); a group takes at most
 * LIMITS.perDay messages a day; storage is a few small rows per group and the last LIMITS.keep messages.
 */

import { DurableObject } from 'cloudflare:workers';

const LIMITS = { name: 40, text: 500, members: 40, admins: 10, keep: 200, pic: 12000, burst: 20, sockets: 80, inviteDays: 7, openUses: 20, perDay: 2000 };
const ID_RE = /^[a-z0-9]{8,24}$/;
const SECRET_RE = /^[A-Z2-9]{10}$/;
const PIC_RE = /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/]+=*$/;
const B64URL = /^[A-Za-z0-9_-]{16,128}$/;
// Only the game's own pages (a browser always sends its page's origin; this keeps other websites out), over https or
// plain http: the mirrors also open as http://, and a player there could not join any group (16 Oct 2026).
// Any subdomain of the game's known sites, so a move to a new mirror or subdomain keeps working.
const ORIGINS = [/^https?:\/\/([a-z0-9-]+\.)*bondageprojects\.elementfx\.com$/, /^https?:\/\/([a-z0-9-]+\.)*bondageprojects\.com$/,
	/^https?:\/\/([a-z0-9-]+\.)*bondage-europe\.com$/, /^https?:\/\/([a-z0-9-]+\.)*bondage-asia\.com$/,
	/^http:\/\/localhost(:\d+)?$/, /^http:\/\/127\.0\.0\.1(:\d+)?$/];

const isNum = (n) => Number.isInteger(n) && n > 0 && n < 1e9;
const clean = (x, max) => (typeof x === 'string' ? x.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim().slice(0, max) : '');
const secret = () => {
	const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	const a = new Uint8Array(10);
	crypto.getRandomValues(a);
	return [...a].map((x) => abc[x % abc.length]).join('');
};
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), (c) => c.charCodeAt(0));

export default {
	async fetch(req, env) {
		const url = new URL(req.url);
		if (url.pathname === '/') return new Response('SlimeBeep group chat relay', { headers: { 'content-type': 'text/plain' } });
		if (url.pathname !== '/ws') return new Response('Not found', { status: 404 });
		if (req.headers.get('Upgrade') !== 'websocket') return new Response('Expected a WebSocket', { status: 426 });
		const origin = req.headers.get('Origin') || '';
		// ALLOW_ANY_ORIGIN is only ever set for local testing (npm run dev:test), never on the live relay.
		if (env.ALLOW_ANY_ORIGIN !== '1' && !ORIGINS.some((re) => re.test(origin))) return new Response('Forbidden', { status: 403 });
		const gid = url.searchParams.get('g') || '';
		if (!ID_RE.test(gid)) return new Response('Bad group', { status: 400 });
		return env.GROUP.get(env.GROUP.idFromName(gid)).fetch(req);
	},
};

export class Group extends DurableObject {
	constructor(ctx, env) {
		super(ctx, env);
		// Keep-alive pings answered without waking this group up (free, and not counted as a request).
		ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('{"t":"ping"}', '{"t":"pong"}'));
		ctx.blockConcurrencyWhile(async () => {
			this.meta = (await ctx.storage.get('meta')) || null;
			this.members = (await ctx.storage.get('members')) || {};
			this.invites = (await ctx.storage.get('invites')) || {};
			// The last message's number, from the newest message kept (no separate counter to write).
			const newest = await ctx.storage.list({ prefix: 'msg:', reverse: true, limit: 1 });
			this.seq = newest.size ? [...newest.values()][0].id : (await ctx.storage.get('seq')) || 0;
			// Today's count lives in memory only: one write less per message (it starts again if the group sleeps, which is fine).
			this.today = { day: '', n: 0 };
		});
	}

	async fetch(req) {
		const gid = new URL(req.url).searchParams.get('g');
		if (this.ctx.getWebSockets().length >= LIMITS.sockets) return new Response('Busy', { status: 503 });
		const [client, server] = Object.values(new WebSocketPair());
		this.ctx.acceptWebSocket(server);
		const nonce = b64url(crypto.getRandomValues(new Uint8Array(18)));
		server.serializeAttachment({ gid, nonce, member: null, hits: [] });
		server.send(JSON.stringify({ t: 'hello', nonce }));
		return new Response(null, { status: 101, webSocket: client });
	}

	async webSocketMessage(ws, raw) {
		let att = ws.deserializeAttachment();
		try {
			if (typeof raw !== 'string' || raw.length > 16000) return this.fail(ws, 'too big');
			// A burst limit per connection: LIMITS.burst messages in ten seconds.
			const now = Date.now();
			att.hits = (att.hits || []).filter((t) => now - t < 10000);
			att.hits.push(now);
			ws.serializeAttachment(att);
			if (att.hits.length > LIMITS.burst) return this.send(ws, { t: 'error', why: 'slow down' });
			let p;
			try { p = JSON.parse(raw); } catch (e) { return this.fail(ws, 'not JSON'); }
			if (!p || typeof p !== 'object' || Array.isArray(p) || typeof p.t !== 'string') return this.fail(ws, 'bad message');
			if (!att.member) {
				if (p.t !== 'auth') return this.fail(ws, 'sign in first');
				return await this.auth(ws, att, p);
			}
			const me = this.members[att.member];
			// Removed meanwhile: out.
			if (!me || !this.meta) return this.fail(ws, 'not a member');
			switch (p.t) {
				case 'say': return await this.say(att.member, p);
				case 'history': return this.history(ws, p.after);
				case 'invite': return await this.invite(ws, att.member, p);
				case 'kick': return await this.kick(att.member, p.member);
				case 'admin': return await this.setAdmin(att.member, p.member, p.on === true);
				case 'owner': return await this.setOwner(att.member, p.member);
				case 'rename': return await this.rename(att.member, p.name);
				case 'open': return await this.setOpen(att.member, p.on === true);
				case 'profile': return await this.profile(att.member, p);
				case 'gpic': return await this.groupPic(att.member, p.pic);
				case 'leave': return await this.leave(att.member);
				case 'disband': return await this.disband(att.member);
				default: return this.send(ws, { t: 'error', why: 'unknown' });
			}
		} catch (e) {
			this.send(ws, { t: 'error', why: 'server error' });
		}
	}

	webSocketClose(ws) { this.gone(ws); }
	webSocketError(ws) { this.gone(ws); }
	gone(ws) {
		const a = ws.deserializeAttachment();
		try { ws.close(); } catch (e) { /* already closed */ }
		// Someone went offline: everyone else's 🟢 list changes (nothing is written for this).
		if (a && a.member && this.meta) this.broadcast({ t: 'presence', online: this.online(ws) });
	}
	/** Members with a live, signed-in connection right now (`except`: one that is closing). */
	online(except = null) {
		const on = new Set();
		for (const ws of this.ctx.getWebSockets()) {
			if (ws === except) continue;
			const a = ws.deserializeAttachment();
			if (a && a.member && this.members[a.member]) on.add(a.member);
		}
		return [...on];
	}

	// ---- signing in, making, joining

	async auth(ws, att, p) {
		const member = p.member;
		if (!isNum(member) || !p.pub || !B64URL.test(p.pub.x || '') || !B64URL.test(p.pub.y || '') || !B64URL.test(p.sig || '')) return this.fail(ws, 'bad sign-in');
		const pub = { x: p.pub.x, y: p.pub.y };
		const ok = await verify(pub, p.sig, `${att.nonce}|${att.gid}|${member}`);
		if (!ok) return this.fail(ws, 'bad signature');
		const name = clean(p.name, LIMITS.name) || `#${member}`;
		if (p.create) {
			if (this.meta) return this.fail(ws, 'group exists');
			this.meta = { name: clean(p.create.name, LIMITS.name) || 'Group chat', owner: member, admins: [member], open: p.create.open === true, created: Date.now() };
			this.members = { [member]: { n: member, name, pub, joined: Date.now() } };
			await this.save();
			await this.note(`${name} made the group`);
		} else if (!this.meta) {
			return this.fail(ws, 'no such group');
		} else if (p.invite) {
			const inv = this.invites[p.invite];
			if (!SECRET_RE.test(p.invite) || !inv || inv.exp < Date.now()) return this.fail(ws, 'invite not valid');
			if (inv.member && inv.member !== member) return this.fail(ws, 'invite is for someone else');
			const known = this.members[member];
			if (known && !samePub(known.pub, pub) && !inv.member) return this.fail(ws, 'that member number is taken');
			if (!known && Object.keys(this.members).length >= LIMITS.members) return this.fail(ws, 'group is full');
			this.members[member] = { ...(known || { joined: Date.now() }), n: member, name, pub };
			if (inv.member || ++inv.uses >= LIMITS.openUses) delete this.invites[p.invite];
			await this.save();
			if (!known) await this.note(`${name} joined`);
		} else {
			const known = this.members[member];
			if (!known || !samePub(known.pub, pub)) return this.fail(ws, 'not a member');
			if (known.name !== name) { known.name = name; await this.save(); }
		}
		att.member = member;
		ws.serializeAttachment(att);
		this.send(ws, { t: 'welcome', me: member, roster: this.roster() });
		for (const m of Object.values(this.members)) if (m.pic) this.send(ws, { t: 'pic', n: m.n, data: m.pic });
		if (this.meta.pic) this.send(ws, { t: 'gpic', data: this.meta.pic });
		this.history(ws, p.after);
		this.broadcast({ t: 'roster', roster: this.roster() });
	}

	// ---- messages

	async say(member, p) {
		const text = clean(p.text, LIMITS.text);
		if (!text) return;
		// At most LIMITS.perDay messages a day per group, so one busy group can't use up the free plan.
		const day = new Date().toISOString().slice(0, 10);
		if (this.today.day !== day) this.today = { day, n: 0 };
		if (++this.today.n > LIMITS.perDay) return this.broadcast({ t: 'error', why: 'this group has sent enough messages for today; back tomorrow' });
		const m = this.members[member];
		await this.append({ from: member, name: m.name, text, ref: typeof p.ref === 'string' ? p.ref.slice(0, 24) : undefined });
	}

	async note(text) { await this.append({ sys: true, text }); }

	async append(msg) {
		this.seq += 1;
		const m = { id: this.seq, at: Date.now(), ...msg };
		// One row per message, and one old one deleted once there are more than LIMITS.keep: about two writes a message.
		await this.ctx.storage.put(`msg:${String(this.seq).padStart(10, '0')}`, m);
		// Only the last LIMITS.keep are kept.
		if (this.seq > LIMITS.keep) await this.ctx.storage.delete(`msg:${String(this.seq - LIMITS.keep).padStart(10, '0')}`);
		this.broadcast({ t: 'msg', m });
	}

	async history(ws, after) {
		const from = Number.isInteger(after) && after >= 0 ? after : 0;
		const list = await this.ctx.storage.list({ prefix: 'msg:', start: `msg:${String(from + 1).padStart(10, '0')}`, limit: LIMITS.keep });
		this.send(ws, { t: 'history', msgs: [...list.values()] });
	}

	// ---- members and roles

	async invite(ws, member, p) {
		const admin = this.meta.admins.includes(member);
		if (!admin && !this.meta.open) return this.send(ws, { t: 'error', why: 'only admins can invite here' });
		if (Object.keys(this.members).length >= LIMITS.members) return this.send(ws, { t: 'error', why: 'group is full' });
		const target = p.member == null ? null : p.member;
		if (target !== null && !isNum(target)) return this.send(ws, { t: 'error', why: 'bad member number' });
		// A new key for someone already in: only an admin can arrange that.
		if (target !== null && this.members[target] && !admin) return this.send(ws, { t: 'error', why: 'already a member' });
		// Old invites go first; at most 50 at a time.
		for (const [k, v] of Object.entries(this.invites)) if (v.exp < Date.now()) delete this.invites[k];
		const keys = Object.keys(this.invites);
		if (keys.length >= 50) delete this.invites[keys[0]];
		const code = secret();
		this.invites[code] = { member: target, by: member, exp: Date.now() + LIMITS.inviteDays * 864e5, uses: 0 };
		await this.save();
		this.send(ws, { t: 'invite', code, member: target, ref: typeof p.ref === 'string' ? p.ref.slice(0, 24) : undefined });
	}

	async kick(by, target) {
		const g = this.meta;
		if (!isNum(target) || !this.members[target] || target === g.owner || target === by) return;
		const byOwner = by === g.owner;
		if (!g.admins.includes(by) || (g.admins.includes(target) && !byOwner)) return;
		const name = this.members[target].name;
		delete this.members[target];
		g.admins = g.admins.filter((n) => n !== target);
		await this.save();
		await this.note(`${this.members[by].name} removed ${name}`);
		this.closeMember(target, 'removed');
		this.broadcast({ t: 'roster', roster: this.roster() });
	}

	async setAdmin(by, target, on) {
		const g = this.meta;
		if (!isNum(target) || !this.members[target] || target === g.owner) return;
		if (on && (!g.admins.includes(by) || g.admins.includes(target) || g.admins.length >= LIMITS.admins)) return;
		if (!on && (by !== g.owner || !g.admins.includes(target))) return;
		g.admins = on ? [...g.admins, target] : g.admins.filter((n) => n !== target);
		await this.save();
		await this.note(on ? `${this.members[by].name} made ${this.members[target].name} admin` : `${this.members[by].name} took admin from ${this.members[target].name}`);
		this.broadcast({ t: 'roster', roster: this.roster() });
	}

	async setOwner(by, target) {
		const g = this.meta;
		if (by !== g.owner || !isNum(target) || !this.members[target] || target === by) return;
		g.owner = target;
		if (!g.admins.includes(target)) g.admins.push(target);
		await this.save();
		await this.note(`${this.members[by].name} handed the group to ${this.members[target].name}`);
		this.broadcast({ t: 'roster', roster: this.roster() });
	}

	async rename(by, name) {
		const n = clean(name, LIMITS.name);
		if (!this.meta.admins.includes(by) || !n || n === this.meta.name) return;
		this.meta.name = n;
		await this.save();
		await this.note(`${this.members[by].name} renamed the group to "${n}"`);
		this.broadcast({ t: 'roster', roster: this.roster() });
	}

	async setOpen(by, on) {
		if (!this.meta.admins.includes(by) || this.meta.open === on) return;
		this.meta.open = on;
		await this.save();
		await this.note(on ? `${this.members[by].name} let everyone invite` : `${this.members[by].name} made invites admin-only`);
		this.broadcast({ t: 'roster', roster: this.roster() });
	}

	async profile(member, p) {
		const m = this.members[member];
		if (typeof p.name === 'string') m.name = clean(p.name, LIMITS.name) || m.name;
		if (p.pic === null) delete m.pic;
		else if (typeof p.pic === 'string' && p.pic.length <= LIMITS.pic && PIC_RE.test(p.pic)) m.pic = p.pic;
		await this.save();
		this.broadcast({ t: 'pic', n: member, data: m.pic || null });
		this.broadcast({ t: 'roster', roster: this.roster() });
	}

	/** The group's own picture: admins set or remove it (null). Kept in meta, sent to everyone. */
	async groupPic(by, pic) {
		if (!this.meta.admins.includes(by)) return;
		if (pic === null) { if (!this.meta.pic) return; delete this.meta.pic; }
		else if (typeof pic === 'string' && pic.length <= LIMITS.pic && PIC_RE.test(pic)) { if (pic === this.meta.pic) return; this.meta.pic = pic; }
		else return;
		await this.save();
		await this.note(pic ? `${this.members[by].name} changed the group picture` : `${this.members[by].name} removed the group picture`);
		this.broadcast({ t: 'gpic', data: this.meta.pic || null });
	}

	async leave(member) {
		const g = this.meta;
		const name = this.members[member].name;
		delete this.members[member];
		g.admins = g.admins.filter((n) => n !== member);
		const left = Object.values(this.members);
		if (!left.length) {
			// The last one out: the group goes, messages and all.
			this.closeMember(member, 'left');
			await this.ctx.storage.deleteAll();
			this.meta = null; this.members = {}; this.invites = {}; this.seq = 0;
			return;
		}
		if (g.owner === member) {
			// The group passes to an admin, or else whoever has been in it longest.
			g.owner = g.admins[0] || left.sort((a, b) => a.joined - b.joined)[0].n;
			if (!g.admins.includes(g.owner)) g.admins.push(g.owner);
		}
		await this.save();
		await this.note(`${name} left`);
		this.closeMember(member, 'left');
		this.broadcast({ t: 'roster', roster: this.roster() });
	}

	/** The owner deletes the group for everyone: messages, members and invites all go. */
	async disband(by) {
		if (!this.meta || by !== this.meta.owner) return;
		for (const ws of this.ctx.getWebSockets()) {
			this.send(ws, { t: 'gone', why: 'deleted' });
			try { ws.close(4000, 'deleted'); } catch (e) { /* gone */ }
		}
		await this.ctx.storage.deleteAll();
		this.meta = null; this.members = {}; this.invites = {}; this.seq = 0;
	}

	// ---- helpers

	roster() {
		const g = this.meta;
		return { name: g.name, owner: g.owner, admins: g.admins, open: g.open, online: this.online(),
			// kf: the start of each member's key, so a friend's SlimeBeep can check it against the one it knows.
			members: Object.values(this.members).map((m) => ({ n: m.n, name: m.name, kf: m.pub.x.slice(0, 16) })) };
	}
	async save() { await this.ctx.storage.put({ meta: this.meta, members: this.members, invites: this.invites }); }
	send(ws, x) { try { ws.send(JSON.stringify(x)); } catch (e) { /* gone */ } }
	broadcast(x) {
		const s = JSON.stringify(x);
		for (const ws of this.ctx.getWebSockets()) {
			const a = ws.deserializeAttachment();
			if (a && a.member && this.members[a.member]) try { ws.send(s); } catch (e) { /* gone */ }
		}
	}
	closeMember(member, why) {
		for (const ws of this.ctx.getWebSockets()) {
			const a = ws.deserializeAttachment();
			if (a && a.member === member) { this.send(ws, { t: 'gone', why }); try { ws.close(4000, why); } catch (e) { /* gone */ } }
		}
	}
	fail(ws, why) { this.send(ws, { t: 'error', why, fatal: true }); try { ws.close(4001, why); } catch (e) { /* gone */ } }
}

const samePub = (a, b) => !!a && !!b && a.x === b.x && a.y === b.y;

async function verify(pub, sig, text) {
	try {
		const key = await crypto.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', x: pub.x, y: pub.y, ext: true }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
		return await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, unb64url(sig), new TextEncoder().encode(text));
	} catch (e) {
		return false;
	}
}

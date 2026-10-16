/*
 * SlimeBeep: a bubble gum beep messenger for Bondage Club.
 *
 * Chats with each friend (built from the game's own beep log, so beeps sent from
 * the friend list show up here too), the online friends and where they are, and a
 * group beep to the friends you pick.
 *
 * This is the whole tool. Players install slimebeep.user.js, a small loader that
 * fetches this file fresh on every game load, so pushing a change here reaches
 * everybody on their next reload. Release with `node release.js <version>`, which
 * sets the same version here and in the loader.
 */
(function () {
	'use strict';

	const VERSION = '2.14.0';
	// Loaded once per page, whatever loads it.
	if (window.SlimeBeep) return;
	window.SlimeBeep = { version: VERSION };

	// The logo, inline so the button needs nothing from the network.
	const ICON = 'data:image/png;base64,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';

	/*
	 * Options (the ⚙), kept in this browser. `gap` is the wait between WaveBeeps in
	 * seconds, so the server doesn't drop them; `picked` is who was ticked last time;
	 * `pos` is where the slime was dragged to, as fractions of the window (null: bottom right).
	 */
	// `popups`: a card for each new beep; `desktop`: a system notification while the game tab is in the background;
	// `keep`: keep beeps in this browser across logins; `seenNews`: the news items (news.json) already shown.
	const DEFAULTS = { pos: null, gap: 1.5, shareRoom: true, remember: true, picked: [], sound: true, popups: true, desktop: false, keep: true, seenNews: null, lastVersion: null, night: false, themed: false };
	// From GitHub Pages, like slimebeep.js for FUSAM: updated within a minute of a push, so the news matches the version.
	const NEWS = 'https://proudkiller0015.github.io/slimebeep/news.json';
	const KEEP_MAX = 2000;
	const KEY = 'slimebeep.options';
	const opts = (() => {
		try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch (e) { return { ...DEFAULTS }; }
	})();
	const saveOpts = () => { try { localStorage.setItem(KEY, JSON.stringify(opts)); } catch (e) { /* private window: options last this visit */ } };

	/** @type {{ MemberNumber: number, MemberName: string, ChatRoomName?: string, ChatRoomSpace?: string, Private?: boolean, Type?: string }[]} */
	let friends = [];
	let tab = 'chats';
	let thread = null; // the member number whose chat is open
	let search = '';
	let sending = false;

	/*
	 * The beeps, kept by SlimeBeep. The game's own beep log (FriendListBeepLog) starts empty at every
	 * login; every beep in it is copied here, and with "keep" on the copies are saved in this browser
	 * per account, so chats survive a relog. The game's log is only ever read, never changed, apart
	 * from the same Read flag the game's own beep list sets.
	 */
	let hist = [];
	let histOwner = null;
	const histKeys = new Set();
	const live = new Map(); // key -> the game's own beep object, for its Read flag
	const histKey = () => `slimebeep.history.${Player.MemberNumber}`;

	/*
	 * Group chats run through SlimeBeep's relay (relay/ in the repository, on Cloudflare), not game
	 * beeps, so they work between people who aren't friends and keep the last 200 messages for whoever
	 * was offline. Each SlimeBeep signs in to its groups with its own key (made here, kept in this
	 * browser per account). The relay enforces the rules; everything that comes from it is still shown
	 * as plain text only.
	 *
	 * Hidden beeps (PROTO) are only used between friends now: "do you have SlimeBeep?", profile
	 * pictures, key fingerprints (so a fake #number in a group gets a ⚠), and group invites.
	 */
	const PROTO = 'SlimeBeep';
	const RELAY = 'wss://slimebeep-relay.slimebeep-relay.workers.dev';
	// A different relay for testing only (set by hand in the console); the real one otherwise.
	const relayUrl = () => { try { return localStorage.getItem('slimebeep.relay') || RELAY; } catch (e) { return RELAY; } };
	const LIMITS = { name: 40, text: 500, members: 40, admins: 10, groups: 30, perMinute: 60 };
	let groups = {}; // id -> { id, name, owner, admins: [n], open, members: [{ n, name, kf }], last, picv }
	let peers = new Set(); // friends known to have SlimeBeep
	let peerKeys = {}; // friend -> the start of their key, as their own SlimeBeep sent it
	let invitations = []; // [{ code, name, from, fromName, at }]: group invites from friends
	const gcKey = () => `slimebeep.gc2.${Player.MemberNumber}`;
	/*
	 * Offline beeps (like EBC's): the game only delivers a beep to someone online, so a beep to an offline
	 * friend waits here, kept in this browser per account, and goes out the moment the friend list shows
	 * them online (checked every minute while any wait). It needs you online then too.
	 */
	let waiting = []; // [{ id, n, text, at }]
	let friendsKnown = false; // the friend list has been read at least once
	const waitKey = () => `slimebeep.waiting.${Player.MemberNumber}`;
	const saveWaiting = () => { try { localStorage.setItem(waitKey(), JSON.stringify(waiting)); } catch (e) { /* this visit only */ } };
	const CODE_RE = /^SB-([a-z0-9]{8,24})-([A-Z2-9]{10})$/;
	const isId = (x) => typeof x === 'string' && /^[a-z0-9]{8,24}$/.test(x);
	const isNum = (n) => Number.isInteger(n) && n > 0 && n < 1e9;
	const newId = () => {
		const a = new Uint32Array(3);
		crypto.getRandomValues(a);
		return [...a].map((x) => x.toString(36)).join('').slice(0, 16).padEnd(8, '0');
	};
	// Plain text only: control characters out, trimmed, capped.
	const clean = (x, max) => (typeof x === 'string' ? x.replace(/[\u0000-\u0008\u000b-\u001f\u007f\uf124]/g, '').trim().slice(0, max) : '');
	const isFriend = (n) => !!(Player.FriendNames && typeof Player.FriendNames.has === 'function' && Player.FriendNames.has(n)) || friends.some((f) => f.MemberNumber === n);
	const myName = () => clean(Player.Nickname || Player.Name, LIMITS.name) || `#${Player.MemberNumber}`;
	const isAdmin = (g, n) => !!g && g.admins.includes(n);
	const isMember = (g, n) => !!g && g.members.some((m) => m.n === n);
	const canInvite = (g, n) => isMember(g, n) && (g.open || isAdmin(g, n));
	const memberName = (g, n) => {
		if (n === Player.MemberNumber) return 'You';
		const m = g && g.members.find((x) => x.n === n);
		return (m && m.name) || nameOf(n);
	};

	function loadGC() {
		for (const c of Object.values(conns)) { c.dead = true; try { if (c.ws) c.ws.close(); } catch (e) { /* gone */ } }
		for (const k of Object.keys(conns)) delete conns[k];
		groups = {};
		waiting = [];
		try {
			const w = JSON.parse(localStorage.getItem(waitKey()) || '[]');
			if (Array.isArray(w)) waiting = w.filter((x) => x && isId(x.id) && isNum(x.n) && typeof x.text === 'string').map((x) => ({ id: x.id, n: x.n, text: x.text.slice(0, 1000), at: Number(x.at) || Date.now() })).slice(0, 100);
		} catch (e) { /* none */ }
		peers = new Set();
		peerKeys = {};
		invitations = [];
		relayPics = {};
		try {
			const saved = JSON.parse(localStorage.getItem(gcKey()) || '{}');
			for (const g of Object.values(saved.groups || {})) {
				if (!g || !isId(g.id) || !Array.isArray(g.members)) continue;
				groups[g.id] = { id: g.id, name: clean(g.name, LIMITS.name) || 'Group chat', owner: isNum(g.owner) ? g.owner : 0,
					admins: Array.isArray(g.admins) ? g.admins.filter(isNum) : [], open: g.open === true,
					members: g.members.filter((m) => m && isNum(m.n)).map((m) => ({ n: m.n, name: clean(m.name, LIMITS.name), kf: typeof m.kf === 'string' ? m.kf.slice(0, 16) : '' })),
					last: Number.isInteger(g.last) ? g.last : 0, picv: typeof g.picv === 'string' ? g.picv : undefined };
			}
			for (const n of saved.peers || []) if (isNum(n)) peers.add(n);
			for (const [k, v] of Object.entries(saved.peerKeys || {})) if (isNum(Number(k)) && typeof v === 'string') peerKeys[Number(k)] = v.slice(0, 16);
			for (const i of saved.invitations || []) if (i && CODE_RE.test(i.code) && isNum(i.from)) invitations.push({ code: i.code, name: clean(i.name, LIMITS.name), from: i.from, fromName: clean(i.fromName, LIMITS.name), at: i.at });
			// Friends found to have SlimeBeep before group chats moved to the relay.
			const old = JSON.parse(localStorage.getItem(`slimebeep.gc.${Player.MemberNumber}`) || '{}');
			for (const n of old.peers || []) if (isNum(n)) peers.add(n);
		} catch (e) { /* unreadable: start fresh */ }
	}
	function saveGC() {
		try { localStorage.setItem(gcKey(), JSON.stringify({ groups, peers: [...peers], peerKeys, invitations: invitations.slice(-20) })); } catch (e) { /* the browser won't keep it */ }
	}
	const keyOf = (b) => (b.Id ? `id:${b.Id}` : `${b.MemberNumber}|${new Date(b.Time).getTime()}|${b.Sent ? 1 : 0}|${String(b.Message || '').slice(0, 40)}`);

	const $ = (id) => document.getElementById(id);

	/*
	 * Everything SlimeBeep takes from the game, and what stops working without it. Every use is checked
	 * on its own, so when a game update renames something only that part stops; this list says which,
	 * in the 🐞 report and once as a card. The same list is checked against the live site every day by
	 * .github/workflows/bc-check.yml, which fails (and emails) when the game changes under SlimeBeep.
	 */
	// typeof works on any global, var, let or function alike; each is written out so nothing is evaluated from text.
	const NEEDS = [
		['ServerSocket', () => typeof ServerSocket, 'everything (the connection to the game)'],
		['Player', () => typeof Player, 'everything (who you are)'],
		['ServerSend', () => typeof ServerSend, 'friend lists and beeps'],
		['FriendListBeepLog', () => typeof FriendListBeepLog, 'reading beeps'],
		['ServerSendBeepMessage', () => typeof ServerSendBeepMessage, 'sending beeps the usual way'],
		['ChatRoomSendLocal', () => typeof ChatRoomSendLocal, 'update notes in the room chat'],
		['ServerPlayerIsInChatRoom', () => typeof ServerPlayerIsInChatRoom, 'knowing you are in a room'],
		['PreferenceRegisterExtensionSetting', () => typeof PreferenceRegisterExtensionSetting, 'Settings > Extensions'],
		['DrawCheckbox', () => typeof DrawCheckbox, 'Settings > Extensions'],
		['MouseIn', () => typeof MouseIn, 'Settings > Extensions'],
	];
	const missing = () => NEEDS.filter(([, t]) => { try { return t() === 'undefined'; } catch (e) { return true; } });
	// SlimeBeep's own caught errors, the last few, for the 🐞 report; also in the console as before.
	const errors = [];
	function warn(e, where = '') {
		try {
			const msg = `${where ? `${where}: ` : ''}${(e && e.message) || String(e)}`.slice(0, 200);
			const at = e && e.stack ? String(e.stack).split('\n').find((l) => /slimebeep/i.test(l)) || '' : '';
			errors.push(`${new Date().toISOString().slice(11, 19)} ${msg}${at ? ` (${at.trim().slice(0, 120)})` : ''}`);
			if (errors.length > 10) errors.shift();
			console.warn('[SlimeBeep]', where, e);
		} catch (x) { /* never let a report break anything */ }
	}
	const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
	const loggedIn = () => typeof ServerSocket !== 'undefined' && ServerSocket && typeof Player !== 'undefined' && Player && Player.MemberNumber != null;
	/** The chat room you are in, or null. */
	const myRoom = () => (typeof ChatRoomData !== 'undefined' && ChatRoomData && ChatRoomData.Name) || null;
	const gameLog = () => (typeof FriendListBeepLog !== 'undefined' && Array.isArray(FriendListBeepLog) ? FriendListBeepLog : []);
	const log = () => hist;

	function loadHistory() {
		hist = [];
		histKeys.clear();
		live.clear();
		histOwner = Player.MemberNumber;
		loadGC();
		if (!opts.keep) return;
		try {
			const saved = JSON.parse(localStorage.getItem(histKey()) || '[]');
			if (Array.isArray(saved)) for (const h of saved) if (h && h.k && !histKeys.has(h.k) && (h.group ? !!groups[h.group] : !isSignal(h.Message))) { hist.push(h); histKeys.add(h.k); }
		} catch (e) { /* unreadable: start fresh */ }
	}

	function saveHistory() {
		if (!opts.keep) return;
		try {
			localStorage.setItem(histKey(), JSON.stringify(hist.slice(-KEEP_MAX)));
		} catch (e) {
			// Full: keep the newer half.
			hist = hist.slice(-Math.floor(KEEP_MAX / 2));
			try { localStorage.setItem(histKey(), JSON.stringify(hist)); } catch (e2) { /* the browser won't keep it */ }
		}
	}

	/** Copies new beeps from the game's log. Returns the incoming ones that are new since the last time. */
	function sync() {
		if (!loggedIn()) return [];
		if (histOwner !== Player.MemberNumber) loadHistory();
		const added = [];
		for (const b of gameLog()) {
			if (!b || typeof b !== 'object' || b.MemberNumber == null) continue;
			const k = keyOf(b);
			if (live.has(k)) continue;
			live.set(k, b);
			if (histKeys.has(k) || isSignal(b.Message)) continue;
			const h = { k, MemberNumber: b.MemberNumber, MemberName: b.MemberName, Sent: !!b.Sent, Time: new Date(b.Time).getTime() || Date.now(),
				Message: b.Message, ChatRoomName: b.ChatRoomName };
			hist.push(h);
			histKeys.add(k);
			added.push(h);
		}
		if (added.length) {
			hist.sort((a, b) => a.Time - b.Time);
			if (hist.length > KEEP_MAX) for (const h of hist.splice(0, hist.length - KEEP_MAX)) histKeys.delete(h.k);
			saveHistory();
		}
		return added.filter((h) => !h.Sent && !isReaction(h));
	}
	/** A beep's visible text, without the metadata the game appends. */
	/*
	 * A beep's text and its settings. Newer game versions put settings (name colour, message type) after
	 * a marker character at the end of a beep, with FriendListBeepParseMessage to read them; R132 has no
	 * such function and just cuts at the marker. So SlimeBeep reads it the same way itself, on any version.
	 */
	const MARK = '';
	function parseBeep(msg) {
		if (typeof msg !== 'string') return { text: '', meta: null };
		let text = msg, raw = null;
		const i = msg.indexOf(MARK);
		if (i >= 0) { text = msg.slice(0, i); raw = msg.slice(msg.lastIndexOf(MARK) + 1); }
		else {
			// The marker lost on the way (some add-ons strip odd characters): a last line that is a settings object.
			const m = /\n\s*(\{"messageType"[^\n]*\})\s*$/.exec(msg);
			if (m) { text = msg.slice(0, m.index); raw = m[1]; }
		}
		let meta = null;
		if (raw) try { const x = JSON.parse(raw); if (x && typeof x === 'object' && !Array.isArray(x)) meta = x; } catch (e) { /* not settings after all */ }
		return { text: text.trimEnd(), meta };
	}
	/*
	 * Other add-ons talk to each other over beeps too: "ReqRoom" (EBC), "KIKILINK/1 {...}" and the like.
	 * Those are machine data, not something a person wrote, so SlimeBeep never shows them: a beep that is
	 * a {...} or [...] block, a short code followed by one (NAME/1 {...}), or one joined-up word like ReqRoom.
	 * A one-word message a person types ("beep", "hi") still comes through.
	 */
	function isSignal(msg, typed = false) {
		if (typeof msg !== 'string') return false;
		const t = parseBeep(msg).text.trim();
		if (!t) return false;
		// A joined-up word only counts as a signal when it came as another add-on's own beep type.
		if (typed && /^[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]*)+$/.test(t)) return true;
		// Real data (it has to parse into something with named fields), alone or after one short code with no spaces.
		const m = /^([^\s{[]{0,40})\s*([[{][\s\S]*[\]}])$/.exec(t);
		if (!m) return false;
		try {
			const x = JSON.parse(m[2]);
			if (Array.isArray(x)) return m[1].length > 0 && x.length > 0;
			return !!x && typeof x === 'object' && Object.keys(x).length > 0;
		} catch (e) { return false; }
	}
	const textOf = (beep) => {
		if (beep.group) return beep.sys === 'left' ? `${beep.MemberName} left the group` : beep.text;
		if (typeof beep.Message !== 'string') return beep.ChatRoomName ? `📍 ${beep.ChatRoomName}` : '🔔 Beep!';
		return parseBeep(beep.Message).text || '🔔 Beep!';
	};
	const isReaction = (beep) => {
		const meta = typeof beep.Message === 'string' ? parseBeep(beep.Message).meta : null;
		return !!meta && meta.messageType === 'Reaction';
	};
	// Unread is the game's own flag, so reading a beep here or in the game's beep list is the same thing.
	// Beeps the game's list has use its own Read flag; ones only SlimeBeep caught (catchBeep) keep their own.
	const unread = (h) => {
		if (h.Sent || isReaction(h)) return false;
		const b = live.get(h.k);
		return b ? b.Read === false : !!h.unread;
	};
	const markRead = (h) => {
		const b = live.get(h.k);
		if (b && b.Read === false) b.Read = true;
		if (h.unread) { h.unread = false; saveHistory(); }
	};
	const nameOf = (n) => {
		const f = friends.find((x) => x.MemberNumber === n);
		if (f) return f.MemberName;
		const known = typeof Player !== 'undefined' && Player && Player.FriendNames && Player.FriendNames.get(n);
		if (known) return known;
		const b = [...log()].reverse().find((x) => x.MemberNumber === n && !x.Sent);
		return b ? b.MemberName : `#${n}`;
	};
	/*
	 * Roleplay actions in a bubble, like the game's emotes: *giggles* in italics. A message that is only
	 * an action gets a soft bubble of its own (sb-act). Escaped first, so it's still plain text.
	 */
	const isAction = (text) => /^\*{1,2}[^*\n]+\*{1,2}$/.test(String(text).trim());
	const rich = (text) => esc(text).replace(/\*{1,2}([^*\n]{1,300}?)\*{1,2}/g, '<i class="sb-emote">*$1*</i>');
	const timeOf = (t) => {
		const d = new Date(t);
		if (isNaN(d)) return '';
		const today = new Date().toDateString() === d.toDateString();
		return today ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString([], { day: 'numeric', month: 'short' });
	};
	// A soft colour per person, for their bubble avatar.
	const hue = (n) => (Number(n) * 137) % 360;
	/*
	 * Profile pictures, between SlimeBeep users. Yours is shrunk to a small square in your browser and
	 * sent in pieces over hidden beeps to SlimeBeep friends who ask for it. Only image data is ever kept
	 * or shown (never a web address), so a picture loads nothing from anywhere and can run nothing.
	 */
	const PFP_RE = /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/]+=*$/;
	const PFP_MAX = 6000;
	const PFP_CHUNK = 700;
	let pfps = null; // member number -> { v, data }
	function loadPfps() {
		if (pfps) return pfps;
		pfps = {};
		try {
			const saved = JSON.parse(localStorage.getItem('slimebeep.pfps') || '{}');
			for (const [k, x] of Object.entries(saved)) if (isNum(Number(k)) && x && isId(x.v) && typeof x.data === 'string' && x.data.length <= PFP_MAX && PFP_RE.test(x.data)) pfps[Number(k)] = { v: x.v, data: x.data };
		} catch (e) { /* unreadable: none */ }
		return pfps;
	}
	function savePfps() {
		const keys = Object.keys(pfps);
		// Only the newest few hundred are kept.
		for (const k of keys.slice(0, Math.max(0, keys.length - 300))) delete pfps[k];
		try { localStorage.setItem('slimebeep.pfps', JSON.stringify(pfps)); } catch (e) { /* the browser won't keep it */ }
	}
	const myPfp = () => (opts.pfp && isId(opts.pfp.v) && typeof opts.pfp.data === 'string' && PFP_RE.test(opts.pfp.data) ? opts.pfp : null);
	const pfpOf = (n) => (loggedIn() && n === Player.MemberNumber ? myPfp() : loadPfps()[n] || (relayPics[n] ? { data: relayPics[n] } : null)) || null;
	const avatar = (n, name) => {
		const pic = pfpOf(n);
		if (pic) return `<img class="sb-av sb-pic" src="${esc(pic.data)}" alt="">`;
		return `<span class="sb-av" style="background:hsl(${hue(n)} 85% 80%)">${esc(String(name || '?').trim().slice(0, 2))}</span>`;
	};

	const css = `
		#sb-toggle { position: fixed; z-index: 99999; width: 46px; height: 46px; border-radius: 50%; padding: 0; overflow: visible;
			border: 3px solid #fff; background: #ffd6ec; cursor: pointer; box-shadow: 0 3px 10px #ff4fa366; touch-action: none; }
		#sb-toggle img { width: 100%; height: 100%; display: block; border-radius: 50%; pointer-events: none; }
		#sb-toggle.dragging { cursor: grabbing; opacity: .8; }
		#sb-badge { position: absolute; top: -6px; right: -6px; min-width: 18px; height: 18px; padding: 0 4px; box-sizing: border-box;
			border-radius: 9px; background: #ff2e8a; color: #fff; font: bold 11px/18px sans-serif; text-align: center; border: 2px solid #fff; display: none; }
		#sb-panel { position: fixed; z-index: 99999; width: 340px; height: 480px; display: none; flex-direction: column; overflow: hidden;
			border-radius: 22px; background: #fff7fb; color: #4a2340; box-shadow: 0 8px 30px #c2186b55; border: 3px solid #ffc2e2;
			font: 13px "Trebuchet MS", "Segoe UI", sans-serif; color-scheme: light; }
		#sb-panel, #sb-panel * { box-sizing: border-box; text-align: left; line-height: 1.3; letter-spacing: normal; text-transform: none; }
		#sb-panel button { font: inherit; cursor: pointer; }
		#sb-panel textarea:focus, #sb-panel input:focus { outline: none; border-color: #ff7ab8 !important; box-shadow: 0 0 0 3px #ffd1e8; }
		#sb-panel input[type=checkbox] { accent-color: #ff4fa3; margin: 0 6px 0 0; vertical-align: middle; }
		.sb-head { display: flex; align-items: center; gap: 8px; padding: 10px 12px; color: #fff;
			background: linear-gradient(120deg, #ff6fb5, #ff9fd0 55%, #9fe8ff); text-shadow: 0 1px 2px #c2186b88; }
		.sb-head img { width: 30px; height: 30px; border-radius: 50%; background: #fff; border: 2px solid #fff; }
		.sb-head b { font-size: 16px; flex: 1; }
		.sb-head small { opacity: .85; font-weight: normal; font-size: 11px; }
		.sb-head button { border: none; background: #ffffff55; color: #fff; width: 28px; height: 28px; border-radius: 50%; font-size: 14px; }
		.sb-head button:hover { background: #ffffff88; }
		.sb-tabs { display: flex; gap: 3px; padding: 8px 8px 6px; background: #ffe6f3; }
		.sb-tabs button { flex: 1 1 auto; min-width: 0; white-space: nowrap; border: none; border-radius: 14px; padding: 5px 5px; background: #fff; color: #c2186b; text-align: center; }
		.sb-tabs button.on { background: #ff4fa3; color: #fff; box-shadow: 0 2px 6px #ff4fa366; }
		.sb-tabs button i { font-style: normal; background: #ff2e8a; color: #fff; border-radius: 8px; padding: 0 5px; margin-left: 4px; font-size: 10px; }
		.sb-tabs button.on i { background: #fff; color: #ff2e8a; }
		.sb-body { flex: 1; overflow-y: auto; padding: 6px 10px 10px; }
		.sb-body::-webkit-scrollbar { width: 6px; } .sb-body::-webkit-scrollbar-thumb { background: #ffb3d9; border-radius: 3px; }
		.sb-search { width: 100%; border: 2px solid #ffd1e8; border-radius: 14px; padding: 5px 10px; margin: 2px 0 6px; background: #fff; color: #4a2340; font: inherit; }
		.sb-row { display: flex; align-items: center; gap: 8px; padding: 7px 8px; margin: 4px 0; border-radius: 16px; background: #fff;
			border: 1px solid #ffe0ef; cursor: pointer; }
		.sb-row:hover { background: #fff0f8; border-color: #ffb3d9; }
		.sb-av { flex: none; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
			font-weight: bold; color: #6b2457; border: 2px solid #fff; box-shadow: 0 1px 3px #0002; }
		.sb-main { flex: 1; min-width: 0; }
		.sb-name { font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
		.sb-sub { color: #a0638a; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
		.sb-side { flex: none; text-align: right; font-size: 11px; color: #c08aaa; }
		.sb-dot { display: inline-block; min-width: 16px; height: 16px; border-radius: 8px; background: #ff2e8a; color: #fff;
			font-size: 10px; line-height: 16px; text-align: center; padding: 0 4px; margin-top: 3px; }
		.sb-on { width: 9px; height: 9px; border-radius: 50%; background: #5fe0a8; display: inline-block; margin-right: 4px; }
		.sb-off { width: 9px; height: 9px; border-radius: 50%; background: #d7c3cf; display: inline-block; margin-right: 4px; }
		.sb-row.offline { opacity: .6; }
		.sb-empty { text-align: center; color: #c08aaa; padding: 30px 10px; }
		.sb-thead { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: #ffe6f3; }
		.sb-thead button { border: none; background: #fff; color: #ff4fa3; width: 28px; height: 28px; border-radius: 50%; font-size: 15px; }
		.sb-msgs { flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 6px;
			background: radial-gradient(circle at 20% 10%, #fff 0, #fff7fb 60%); }
		.sb-b { max-width: 78%; padding: 7px 11px; border-radius: 18px; white-space: pre-wrap; word-wrap: break-word; }
		.sb-b.them { align-self: flex-start; background: #fff; border: 1px solid #ffd1e8; border-bottom-left-radius: 6px; }
		.sb-b.me { align-self: flex-end; background: linear-gradient(135deg, #ff6fb5, #ff4fa3); color: #fff; border-bottom-right-radius: 6px; }
		.sb-b em { display: block; font-style: normal; font-size: 10px; opacity: .7; margin-top: 2px; }
		.sb-b.me em { text-align: right; }
		.sb-b .sb-room { display: block; font-size: 11px; margin-top: 3px; opacity: .85; }
		.sb-emote { font-style: italic; opacity: .85; }
		.sb-joinroom { margin-left: 4px; padding: 1px 8px !important; font-size: 11px !important; }
		#sb-me { display: flex; cursor: pointer; }
		img.sb-pic { cursor: zoom-in; }
		#sb-zoom { position: fixed; inset: 0; z-index: 100002; background: #000a; display: flex; align-items: center; justify-content: center; cursor: zoom-out; }
		#sb-zoom img { width: min(240px, 70vw); height: min(240px, 70vw); border-radius: 50%; border: 4px solid #fff; box-shadow: 0 10px 40px #000a; background: #fff; }
		#sb-me .sb-av { width: 28px; height: 28px; border: 2px solid #fff; font-size: 11px; }
		#sb-crop { position: fixed; inset: 0; z-index: 100002; background: #0007; display: flex; align-items: center; justify-content: center; font-family: inherit; }
		#sb-crop .sb-crop-card { background: #fff; color: #5a2a48; border-radius: 18px; padding: 16px; display: flex; flex-direction: column; align-items: center; gap: 10px; box-shadow: 0 10px 40px #0008; max-width: calc(100vw - 32px); }
		#sb-crop .sb-crop-ring { border-radius: 50%; overflow: hidden; border: 3px solid #ff7ac0; background: repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 0 0 / 16px 16px; touch-action: none; }
		#sb-crop canvas { display: block; cursor: grab; }
		#sb-crop canvas:active { cursor: grabbing; }
		#sb-crop input[type=range] { width: 240px; accent-color: #ff4fa3; }
		#sb-crop .sb-crop-btns { display: flex; gap: 8px; }
		.sb-b.sb-act { font-style: italic; background: transparent !important; border: 1px dashed currentColor !important; color: inherit; opacity: .85; }
		.sb-b.sb-wait { opacity: .7; border: 2px dashed #ffb3d9; }
		.sb-b.sb-wait a { color: inherit; text-decoration: underline; }
		.sb-compose { display: flex; gap: 6px; align-items: flex-end; padding: 8px; background: #ffe6f3; }
		.sb-compose textarea { flex: 1; height: 38px; max-height: 100px; resize: none; border: 2px solid #ffd1e8; border-radius: 16px;
			padding: 8px 10px; background: #fff; color: #4a2340; font: inherit; }
		.sb-compose button { border: none; width: 38px; height: 38px; border-radius: 50%; background: #ff4fa3; color: #fff; font-size: 16px; flex: none; }
		.sb-compose button.pin { background: #fff; color: #c08aaa; }
		.sb-compose button.pin.on { background: #9fe8ff; color: #1f6b80; }
		.sb-compose button:disabled { opacity: .45; cursor: default; }
		.sb-group textarea { width: 100%; height: 70px; resize: vertical; border: 2px solid #ffd1e8; border-radius: 14px; padding: 8px 10px;
			background: #fff; color: #4a2340; font: inherit; }
		.sb-group label { display: flex; align-items: center; padding: 5px 8px; margin: 3px 0; border-radius: 12px; background: #fff; cursor: pointer; }
		.sb-pill { border: none; border-radius: 12px; padding: 4px 12px; background: #fff; color: #ff4fa3; border: 1px solid #ffb3d9; }
		.sb-go { border: none; border-radius: 14px; padding: 7px 18px; background: #ff4fa3; color: #fff; font-weight: bold; box-shadow: 0 2px 6px #ff4fa366; }
		.sb-go:disabled { opacity: .45; cursor: default; }
		.sb-line { display: flex; align-items: center; justify-content: space-between; gap: 6px; margin: 6px 0; }
		.sb-hint { color: #a0638a; font-size: 11px; }
		img.sb-pic { object-fit: cover; padding: 0; background: #fff; }
		.sb-gav { background: linear-gradient(135deg, #ffb3d9, #9fe8ff); font-size: 16px; }
		.sb-from { display: block; font-size: 11px; font-weight: bold; color: #c2186b; margin-bottom: 2px; }
		.sb-sys { align-self: center; font-size: 11px; color: #a0638a; background: #ffe6f3; padding: 2px 10px; border-radius: 10px; }
		.sb-thead > button#sb-leave { margin-left: auto; }
		html.sb-night .sb-gav { background: linear-gradient(135deg, #4f6bd8, #7a5cd6); }
		html.sb-night .sb-from { color: #8fb3ff; }
		html.sb-night .sb-sys { background: #1d2550; color: #8f9fd6; }
		#sb-cards { position: fixed; z-index: 100000; width: 280px; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
		.sb-card { pointer-events: auto; display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border-radius: 18px; cursor: pointer;
			background: #fff7fb; color: #4a2340; border: 2px solid #ffc2e2; box-shadow: 0 6px 20px #c2186b55; box-sizing: border-box;
			font: 13px "Trebuchet MS", "Segoe UI", sans-serif; text-align: left; line-height: 1.3; animation: sb-in .25s ease-out; }
		.sb-card.out { animation: sb-out .25s ease-in forwards; }
		.sb-card .sb-main { flex: 1; min-width: 0; }
		.sb-card .sb-main b { display: block; color: #c2186b; }
		.sb-card .sb-txt { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; word-break: break-word; }
		.sb-card small { display: block; color: #a0638a; font-size: 11px; margin-top: 2px; }
		.sb-card .sb-x { flex: none; border: none; background: none; color: #c08aaa; font-size: 14px; cursor: pointer; padding: 0 2px; }
		.sb-card.news { background: linear-gradient(120deg, #fff0f8, #eafbff); border-color: #9fe8ff; }
		@keyframes sb-in { from { opacity: 0; transform: translateY(10px) scale(.95); } }
		@keyframes sb-out { to { opacity: 0; transform: translateX(30px); } }
		/* 🌙 Night mode (asked for by Alyx): navy, with a night blue slime. Only SlimeBeep's own parts change. */
		html.sb-night #sb-toggle { background: #1a2142; border-color: #8fb3ff; box-shadow: 0 3px 12px #3b55c488; }
		html.sb-night #sb-toggle img, html.sb-night .sb-head img, html.sb-night .sb-card.news > img { filter: hue-rotate(-105deg) saturate(1.15) brightness(.92); }
		html.sb-night #sb-badge { background: #5b8cff; border-color: #1a2142; }
		html.sb-night #sb-panel { background: #141a33; color: #dfe6ff; border-color: #2f3b75; box-shadow: 0 8px 30px #0008; color-scheme: dark; }
		html.sb-night .sb-head { background: linear-gradient(120deg, #2b3a8f, #4f6bd8 55%, #7a5cd6); text-shadow: 0 1px 2px #0008; }
		html.sb-night .sb-tabs, html.sb-night .sb-thead, html.sb-night .sb-compose { background: #1c2450; }
		html.sb-night .sb-tabs button { background: #253064; color: #a9c1ff; }
		html.sb-night .sb-tabs button.on { background: #5b8cff; color: #fff; box-shadow: 0 2px 6px #5b8cff66; }
		html.sb-night .sb-tabs button i { background: #5b8cff; }
		html.sb-night .sb-tabs button.on i { background: #fff; color: #3b55c4; }
		html.sb-night .sb-row, html.sb-night .sb-group label, html.sb-night .sb-opts label { background: #1d2550; border-color: #2c3866; color: #dfe6ff; }
		html.sb-night .sb-row:hover { background: #253064; border-color: #5b8cff; }
		html.sb-night .sb-sub, html.sb-night .sb-hint, html.sb-night .sb-side, html.sb-night .sb-empty { color: #8f9fd6; }
		html.sb-night .sb-dot { background: #5b8cff; }
		html.sb-night .sb-av { border-color: #141a33; filter: saturate(.7) brightness(.85); }
		html.sb-night .sb-search, html.sb-night .sb-compose textarea, html.sb-night .sb-group textarea, html.sb-night .sb-opts input[type=number] {
			background: #10152b; color: #dfe6ff; border-color: #2f3b75; }
		html.sb-night #sb-panel textarea:focus, html.sb-night #sb-panel input:focus { border-color: #5b8cff !important; box-shadow: 0 0 0 3px #2b3a8f; }
		html.sb-night .sb-msgs { background: radial-gradient(circle at 20% 10%, #1d2550 0, #141a33 60%); }
		html.sb-night .sb-b.them { background: #222b55; border-color: #2f3b75; color: #dfe6ff; }
		html.sb-night .sb-b.me { background: linear-gradient(135deg, #4f6bd8, #3b55c4); }
		html.sb-night .sb-compose button, html.sb-night .sb-go { background: #5b8cff; box-shadow: none; }
		html.sb-night .sb-compose button.pin { background: #253064; color: #8f9fd6; }
		html.sb-night .sb-compose button.pin.on { background: #7a5cd6; color: #fff; }
		html.sb-night .sb-thead button { background: #253064; color: #a9c1ff; }
		html.sb-night .sb-pill { background: #1d2550; color: #a9c1ff; border-color: #2f3b75; }
		html.sb-night #sb-panel input[type=checkbox] { accent-color: #5b8cff; }
		html.sb-night .sb-line[style] { background: #141a33 !important; }
		html.sb-night .sb-card { background: #1a2142; color: #dfe6ff; border-color: #2f3b75; box-shadow: 0 6px 20px #0008; }
		html.sb-night .sb-card .sb-main b { color: #8fb3ff; }
		html.sb-night .sb-card small, html.sb-night .sb-card .sb-x { color: #8f9fd6; }
		html.sb-night .sb-card.news { background: linear-gradient(120deg, #1a2142, #241f4f); border-color: #7a5cd6; }
		html.sb-night #sb-toast { background: #dfe6ff; color: #1a2142; box-shadow: 0 4px 14px #0008; }
		html.sb-night .sb-body::-webkit-scrollbar-thumb { background: #2f3b75; }
		/*
		 * 🎨 Matching a theme add-on. Each keeps its colours in CSS variables (Themed: --tmd-* on the page,
		 * BCNeko: --bcn-* on the body); they're mapped onto SlimeBeep's own --sb-t-* here, on the body, where
		 * both are visible, and everything below uses those. Another theme add-on is one more mapping.
		 * After night mode, so it wins when both are on.
		 */
		html.sb-theme-themed body { --sb-t-main: var(--tmd-main); --sb-t-element: var(--tmd-element); --sb-t-element-hover: var(--tmd-element-hover);
			--sb-t-element-disabled: var(--tmd-element-disabled); --sb-t-accent: var(--tmd-accent); --sb-t-accent-hover: var(--tmd-accent-hover);
			--sb-t-accent-disabled: var(--tmd-accent-disabled); --sb-t-text: var(--tmd-text); --sb-t-text-disabled: var(--tmd-text-disabled); }
		html.sb-theme-bcneko body { --sb-t-main: var(--bcn-panel); --sb-t-element: var(--bcn-soft); --sb-t-element-hover: var(--bcn-border);
			--sb-t-element-disabled: var(--bcn-soft); --sb-t-accent: var(--bcn-accent); --sb-t-accent-hover: var(--bcn-accent);
			--sb-t-accent-disabled: var(--bcn-border); --sb-t-text: var(--bcn-text); --sb-t-text-disabled: var(--bcn-muted); }
		html.sb-themed #sb-toggle { background: var(--sb-t-element); border-color: var(--sb-t-accent); box-shadow: 0 3px 12px #0006; }
		html.sb-themed #sb-badge { background: var(--sb-t-accent); border-color: var(--sb-t-main); }
		html.sb-themed #sb-panel { background: var(--sb-t-main); color: var(--sb-t-text); border-color: var(--sb-t-element-hover); box-shadow: 0 8px 30px #0008; }
		html.sb-themed .sb-head { background: linear-gradient(120deg, var(--sb-t-accent), var(--sb-t-accent-hover)); color: var(--sb-t-text); text-shadow: 0 1px 2px #0008; }
		html.sb-themed .sb-head button { background: var(--sb-t-element); color: var(--sb-t-text); }
		html.sb-themed .sb-tabs, html.sb-themed .sb-thead, html.sb-themed .sb-compose { background: var(--sb-t-element-disabled); }
		html.sb-themed .sb-tabs button { background: var(--sb-t-element); color: var(--sb-t-text); }
		html.sb-themed .sb-tabs button.on { background: var(--sb-t-accent); color: var(--sb-t-text); box-shadow: none; }
		html.sb-themed .sb-tabs button i, html.sb-themed .sb-dot { background: var(--sb-t-accent-hover); color: var(--sb-t-text); }
		html.sb-themed .sb-tabs button.on i { background: var(--sb-t-text); color: var(--sb-t-accent); }
		html.sb-themed .sb-row, html.sb-themed .sb-group label, html.sb-themed .sb-opts label { background: var(--sb-t-element); border-color: var(--sb-t-element-hover); color: var(--sb-t-text); }
		html.sb-themed .sb-row:hover { background: var(--sb-t-element-hover); border-color: var(--sb-t-accent); }
		html.sb-themed .sb-sub, html.sb-themed .sb-hint, html.sb-themed .sb-side, html.sb-themed .sb-empty { color: var(--sb-t-text-disabled); }
		html.sb-themed .sb-search, html.sb-themed .sb-compose textarea, html.sb-themed .sb-group textarea, html.sb-themed .sb-opts input[type=number] {
			background: var(--sb-t-main); color: var(--sb-t-text); border-color: var(--sb-t-element-hover); }
		html.sb-themed #sb-panel textarea:focus, html.sb-themed #sb-panel input:focus { border-color: var(--sb-t-accent) !important; box-shadow: 0 0 0 3px var(--sb-t-accent-disabled); }
		html.sb-themed .sb-msgs { background: var(--sb-t-main); }
		html.sb-themed .sb-b.them { background: var(--sb-t-element); border-color: var(--sb-t-element-hover); color: var(--sb-t-text); }
		html.sb-themed .sb-b.me { background: var(--sb-t-accent); color: var(--sb-t-text); }
		html.sb-themed .sb-from { color: var(--sb-t-accent-hover); }
		html.sb-themed .sb-sys { background: var(--sb-t-element); color: var(--sb-t-text-disabled); }
		html.sb-themed .sb-gav { background: var(--sb-t-accent); }
		html.sb-themed .sb-compose button, html.sb-themed .sb-go { background: var(--sb-t-accent); color: var(--sb-t-text); box-shadow: none; }
		html.sb-themed .sb-compose button.pin { background: var(--sb-t-element); color: var(--sb-t-text-disabled); }
		html.sb-themed .sb-compose button.pin.on { background: var(--sb-t-accent-hover); color: var(--sb-t-text); }
		html.sb-themed .sb-thead button { background: var(--sb-t-element); color: var(--sb-t-text); }
		html.sb-themed .sb-pill { background: var(--sb-t-element); color: var(--sb-t-text); border-color: var(--sb-t-element-hover); }
		html.sb-themed #sb-panel input[type=checkbox] { accent-color: var(--sb-t-accent); }
		html.sb-themed .sb-line[style] { background: var(--sb-t-main) !important; }
		html.sb-themed .sb-card { background: var(--sb-t-main); color: var(--sb-t-text); border-color: var(--sb-t-element-hover); box-shadow: 0 6px 20px #0008; }
		html.sb-themed .sb-card .sb-main b { color: var(--sb-t-accent-hover); }
		html.sb-themed .sb-card small, html.sb-themed .sb-card .sb-x { color: var(--sb-t-text-disabled); }
		html.sb-themed .sb-card.news { background: var(--sb-t-element); border-color: var(--sb-t-accent); }
		html.sb-themed #sb-toast { background: var(--sb-t-element); color: var(--sb-t-text); box-shadow: 0 4px 14px #0008; }
		html.sb-themed .sb-body::-webkit-scrollbar-thumb { background: var(--sb-t-element-hover); }
		#sb-toast { position: fixed; z-index: 100000; padding: 8px 14px; border-radius: 16px; background: #4a2340; color: #fff;
			font: bold 13px "Trebuchet MS", "Segoe UI", sans-serif; box-shadow: 0 4px 14px #c2186b66; pointer-events: none;
			opacity: 0; transform: translateY(6px); transition: opacity .2s, transform .2s; white-space: nowrap; }
		#sb-toast.show { opacity: 1; transform: none; }
		#sb-toggle.boing { animation: sb-boing .45s; }
		@keyframes sb-boing { 30% { transform: scale(1.25, .8); } 60% { transform: scale(.9, 1.15); } }
		.sb-opts label { display: block; padding: 6px 8px; margin: 4px 0; border-radius: 12px; background: #fff; }
		.sb-opts input[type=number] { width: 54px; border: 1px solid #ffb3d9; border-radius: 8px; padding: 2px 4px; font: inherit; }
	`;

	function build() {
		// Listed with the game's mod SDK like other mods; SlimeBeep patches no game function, it only registers.
		try {
			if (window.bcModSdk && typeof window.bcModSdk.registerMod === 'function') {
				window.bcModSdk.registerMod({ name: 'SlimeBeep', fullName: 'SlimeBeep', version: VERSION, repository: 'https://github.com/Proudkiller0015/slimebeep' });
			}
		} catch (e) { warn(e, 'mod SDK'); }
		const style = document.createElement('style');
		style.textContent = css;
		document.head.appendChild(style);

		const toggle = document.createElement('button');
		toggle.id = 'sb-toggle';
		toggle.title = 'SlimeBeep (drag to move)';
		toggle.innerHTML = `<img src="${ICON}" alt="SlimeBeep"><span id="sb-badge"></span>`;
		document.body.appendChild(toggle);
		const toast = document.createElement('div');
		toast.id = 'sb-toast';
		document.body.appendChild(toast);
		const cards = document.createElement('div');
		cards.id = 'sb-cards';
		document.body.appendChild(cards);

		const panel = document.createElement('div');
		panel.id = 'sb-panel';
		panel.innerHTML = `
			<div class="sb-head">
				<img src="${ICON}" alt="">
				<b>SlimeBeep <small>v${VERSION}</small></b>
				<span id="sb-me"></span>
				<button id="sb-moon" title="Night mode">🌙</button>
				<button id="sb-gear" title="Options">⚙</button>
				<button id="sb-close" title="Close">✕</button>
			</div>
			<div id="sb-view" style="flex:1;display:flex;flex-direction:column;min-height:0"></div>`;
		document.body.appendChild(panel);

		// Drag to move; a press that barely moves is a click.
		let drag = null;
		toggle.addEventListener('pointerdown', (e) => {
			const r = toggle.getBoundingClientRect();
			drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, x0: e.clientX, y0: e.clientY, moved: false };
			toggle.setPointerCapture(e.pointerId);
		});
		toggle.addEventListener('pointermove', (e) => {
			if (!drag) return;
			if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 5) return;
			drag.moved = true;
			toggle.classList.add('dragging');
			opts.pos = { x: (e.clientX - drag.dx) / innerWidth, y: (e.clientY - drag.dy) / innerHeight };
			place();
		});
		toggle.addEventListener('pointerup', () => {
			if (!drag) return;
			const moved = drag.moved;
			drag = null;
			toggle.classList.remove('dragging');
			if (moved) return saveOpts();
			setOpen(panel.style.display !== 'flex');
		});
		addEventListener('resize', place);
		$('sb-close').addEventListener('click', () => setOpen(false));
		$('sb-moon').addEventListener('click', () => setNight(!opts.night));
		setNight(opts.night);
		$('sb-gear').addEventListener('click', () => { tab = tab === 'options' ? 'chats' : 'options'; thread = null; render(); });
		// A click on someone's picture shows it big (and doesn't also open what it sits on).
		panel.addEventListener('click', (e) => {
			const img = e.target.closest && e.target.closest('img.sb-pic');
			if (!img || img.closest('#sb-me')) return;
			e.preventDefault();
			e.stopPropagation();
			zoomPic(img.src);
		}, true);
		$('sb-me').addEventListener('click', () => { if (!loggedIn()) return; tab = 'options'; thread = null; render(); });
		// Typing in the panel must not reach the game's own key handlers.
		panel.addEventListener('keydown', (e) => e.stopPropagation());

		// Friends as the server reports them, whoever asked (the game asks too).
		if (loggedIn()) listen();
		place();
		setInterval(tick, 1000);
		news();
		registerSettings();
	}

	/*
	 * Listening to the server. Other add-ons sometimes take events over (EBC: Alyx's beeps reached only
	 * EBC, 16 Oct 2026), by removing the game's listeners or changing the data before the game sees it.
	 * So SlimeBeep listens underneath them all where the connection allows it (socket.io's catch-all
	 * listener, which removing an event's listeners leaves alone), copies each beep the moment it
	 * arrives, and checks every few seconds that it is still attached. It only ever listens.
	 */
	let listening = null; // the socket SlimeBeep listens on
	const seenBeeps = []; // the last few beeps as they arrived, for SlimeBeep.debug()
	function onServer(event, data) {
		try {
			if (event === 'AccountQueryResult') {
				if (!data || data.Query !== 'OnlineFriends' || !Array.isArray(data.Result)) return;
				friends = data.Result.filter((f) => f && f.MemberNumber !== Player.MemberNumber);
				friendsKnown = true;
				sendWaiting();
				if (isOpen() && tab !== 'chats') render();
			} else if (event === 'AccountBeep') {
				if (!data || typeof data !== 'object') return;
				// A copy, before the game or anyone else trims or changes it.
				const d = { MemberNumber: data.MemberNumber, MemberName: data.MemberName, BeepType: data.BeepType, Message: data.Message,
					ChatRoomName: data.ChatRoomName, ChatRoomSpace: data.ChatRoomSpace, Private: data.Private };
				seenBeeps.push({ at: new Date().toISOString(), from: d.MemberNumber, type: d.BeepType || '', text: typeof d.Message === 'string' ? d.Message.slice(0, 80) : null });
				if (seenBeeps.length > 20) seenBeeps.shift();
				if (d.BeepType === PROTO) onHidden(d);
				else catchBeep(d);
			}
		} catch (e) { warn(e); }
	}
	const anyListener = (event, data) => onServer(event, data);
	const beepListener = (data) => onServer('AccountBeep', data);
	const queryListener = (data) => onServer('AccountQueryResult', data);
	function listen() {
		if (!loggedIn() || !ServerSocket || typeof ServerSocket.on !== 'function') return;
		const sock = ServerSocket;
		const any = typeof sock.prependAny === 'function' ? 'prependAny' : typeof sock.onAny === 'function' ? 'onAny' : null;
		if (listening === sock) {
			// Still attached? Something may have cleared the listeners since.
			const has = any ? (typeof sock.listenersAny === 'function' ? sock.listenersAny().includes(anyListener) : true)
				: (typeof sock.listeners === 'function' ? sock.listeners('AccountBeep').includes(beepListener) : true);
			if (has) return;
		}
		listening = sock;
		if (any) {
			if (typeof sock.offAny === 'function') sock.offAny(anyListener);
			sock[any](anyListener);
		} else {
			if (typeof sock.off === 'function') { sock.off('AccountBeep', beepListener); sock.off('AccountQueryResult', queryListener); }
			sock.on('AccountBeep', beepListener);
			sock.on('AccountQueryResult', queryListener);
		}
	}
	/*
	 * For other add-ons (CRABS first): window.SlimeBeep.api, read-only. Everything handed out is a
	 * fresh copy, so nothing outside can change SlimeBeep's state. It tells who is in your SlimeBeep
	 * group chats, their roles, who's online, and which friends have SlimeBeep, with events when that
	 * changes. Message text isn't shared: that stays between the people in a chat. README "For other
	 * add-ons" documents it; apiVersion goes up when something changes in a way that breaks old use.
	 */
	const apiListeners = { group: new Set(), groupGone: new Set(), presence: new Set(), slimeBeepFriend: new Set() };
	function emit(type, data) {
		for (const fn of apiListeners[type] || []) {
			try { fn(JSON.parse(JSON.stringify(data))); } catch (e) { warn(e, `another add-on's ${type} listener`); }
		}
	}
	/** A group as other add-ons see it. */
	function groupView(g) {
		const me = loggedIn() ? Player.MemberNumber : 0;
		const online = new Set([...(g.online || []), me]);
		return {
			id: g.id, name: g.name, owner: g.owner, admins: [...g.admins], anyoneCanInvite: !!g.open, canInvite: canInvite(g, me) && g.members.length < LIMITS.members,
			members: g.members.map((m) => ({ memberNumber: m.n, name: m.n === me ? myName() : m.name, online: online.has(m.n),
				role: m.n === g.owner ? 'owner' : g.admins.includes(m.n) ? 'admin' : 'member' })),
		};
	}
	window.SlimeBeep.api = Object.freeze({
		apiVersion: 1,
		version: VERSION,
		/** Your SlimeBeep group chats: [{ id, name, owner, admins, anyoneCanInvite, members: [{ memberNumber, name, online, role }] }]. */
		groups: () => (loggedIn() ? Object.values(groups).map(groupView) : []),
		/** One group by id, or null. */
		group: (id) => (loggedIn() && groups[id] ? groupView(groups[id]) : null),
		/** The member numbers of friends known to have SlimeBeep. */
		slimeBeepFriends: () => [...peers],
		/** Whether this member number is a friend known to have SlimeBeep. */
		hasSlimeBeep: (memberNumber) => peers.has(memberNumber),
		/** Opens SlimeBeep on a group chat. */
		openGroup: (id) => { if (!groups[id]) return false; tab = 'groups'; thread = `g:${id}`; if (!isOpen()) setOpen(true); else render(); return true; },
		/** Invites someone to a group: a SlimeBeep friend gets an invite card, anyone else a code for them alone. Promise of { ok, sent } / { ok, code } / { ok: false, why }. */
		inviteToGroup: (id, memberNumber) => inviteToGroup(id, memberNumber),
		/** Opens SlimeBeep on "Invite <them> to…", listing the groups you can invite to. */
		openInvite: (memberNumber) => { if (!isNum(memberNumber)) return false; inviteFor = { n: memberNumber, results: {} }; thread = null; tab = 'invitefor'; if (!isOpen()) setOpen(true); else render(); return true; },
		/** For theme add-ons: SlimeBeep takes the running theme add-on's colours (true) or its own (false). Off unless switched on. */
		matchTheme: (on) => { setThemed(!!on); return !!applyThemed(); },
		/** { on, source }: whether SlimeBeep matches a theme add-on, and which one it found ('Themed', 'BCNeko' or null). */
		matchingTheme: () => ({ on: !!opts.themed, source: (themeSource() || {}).name || null }),
		/** Opens SlimeBeep on a chat with this member number. */
		openChat: (memberNumber) => { if (!isNum(memberNumber)) return false; thread = memberNumber; if (!isOpen()) setOpen(true); else render(); return true; },
		/**
		 * on('group' | 'groupGone' | 'presence' | 'slimeBeepFriend', fn): fn gets a copy each time; returns a function that stops it.
		 * group: a group was joined or changed (a group, as in groups()); groupGone: { id }; presence: a group whose
		 * online members changed; slimeBeepFriend: { memberNumber } of a friend just found to have SlimeBeep.
		 */
		on: (type, fn) => {
			if (!apiListeners[type] || typeof fn !== 'function') return () => {};
			apiListeners[type].add(fn);
			return () => apiListeners[type].delete(fn);
		},
	});

	window.SlimeBeep.debug = () => ({ version: VERSION, missing: missing().map(([k]) => k), listening: !!listening, catchAll: !!(listening && typeof listening.onAny === 'function'), lastBeeps: seenBeeps.slice() });

	// At most LIMITS.perMinute hidden beeps a minute from anyone; past that they are dropped.
	const recent = new Map();
	function allow(n) {
		const now = Date.now();
		const list = (recent.get(n) || []).filter((t) => now - t < 60000);
		list.push(now);
		recent.set(n, list);
		return list.length <= LIMITS.perMinute;
	}
	const ponged = new Map();

	const asked = new Map(); // who we asked for a picture, and when
	const sentPic = new Map(); // who we sent ours to, and when
	const pieces = new Map(); // member number -> { v, n, parts }
	/** The picture side of a hidden beep: their version (ask if new), a request for ours, or a piece of theirs. */
	function pictureNews(from, p) {
		const known = loadPfps()[from];
		if (p.pv === 0 && known) { delete pfps[from]; savePfps(); }
		if (isId(p.pv) && (!known || known.v !== p.pv) && Date.now() - (asked.get(from) || 0) > 60000) {
			asked.set(from, Date.now());
			sendHidden(from, { sb: 1, pfreq: 1 });
		}
		if (p.pfreq === 1) {
			const pic = myPfp();
			if (!pic || Date.now() - (sentPic.get(from) || 0) < 60000) return;
			sentPic.set(from, Date.now());
			const parts = Math.ceil(pic.data.length / PFP_CHUNK);
			for (let i = 0; i < parts; i++) sendHidden(from, { sb: 1, pf: { v: pic.v, i, n: parts, d: pic.data.slice(i * PFP_CHUNK, (i + 1) * PFP_CHUNK) } });
		}
		const pf = p.pf;
		if (pf && typeof pf === 'object' && isId(pf.v) && Number.isInteger(pf.i) && Number.isInteger(pf.n) && pf.n > 0 && pf.n <= Math.ceil(PFP_MAX / PFP_CHUNK) &&
			pf.i >= 0 && pf.i < pf.n && typeof pf.d === 'string' && pf.d.length <= PFP_CHUNK) {
			let got = pieces.get(from);
			if (!got || got.v !== pf.v || got.n !== pf.n) got = { v: pf.v, n: pf.n, parts: [] };
			got.parts[pf.i] = pf.d;
			pieces.set(from, got);
			if (got.parts.filter((x) => typeof x === 'string').length === got.n) {
				pieces.delete(from);
				const data = got.parts.join('');
				if (data.length <= PFP_MAX && PFP_RE.test(data)) {
					loadPfps()[from] = { v: got.v, data };
					savePfps();
					if (isOpen()) render(true);
				}
			}
		}
	}

	/*
	 * Your picture: picked from a file, then placed in the circle by you (drag to move, wheel or slider to
	 * zoom), shrunk to 48×48 and made small enough to send. The picked picture is kept (at most 320px, in
	 * this browser only) so "Adjust" can place it again later.
	 */
	const srcKey = () => `slimebeep.pfpsrc.${Player.MemberNumber}`;
	const loadSrc = () => { try { const d = localStorage.getItem(srcKey()); return d && /^data:image\/(webp|jpeg|png);base64,/.test(d) ? d : null; } catch (e) { return null; } };
	function setPicture(file) {
		if (!file || !/^image\//.test(file.type)) return notify('That is not a picture');
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => {
			try {
				// Kept smaller, so it fits in storage and the cropper stays quick.
				const k = Math.min(1, 320 / Math.max(img.naturalWidth, img.naturalHeight));
				const c = document.createElement('canvas');
				c.width = Math.max(1, Math.round(img.naturalWidth * k));
				c.height = Math.max(1, Math.round(img.naturalHeight * k));
				c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
				const src = c.toDataURL('image/jpeg', 0.9);
				try { localStorage.setItem(srcKey(), src); } catch (e) { /* this visit only */ }
				openCropper(src);
			} catch (e) { notify('That picture could not be read'); } finally { URL.revokeObjectURL(url); }
		};
		img.onerror = () => { URL.revokeObjectURL(url); notify('That picture could not be read'); };
		img.src = url;
	}
	function pickPicture() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.addEventListener('change', () => setPicture(input.files && input.files[0]));
		input.click();
	}
	/** Place the picture in the circle; Save makes it your picture. */
	function openCropper(src) {
		if ($('sb-crop')) $('sb-crop').remove();
		const SIZE = 240;
		const img = new Image();
		img.onload = () => {
			const w = img.naturalWidth, h = img.naturalHeight;
			const base = SIZE / Math.min(w, h); // zoom 1: the short side fills the circle
			let zoom = 1, x = 0, y = 0; // x, y: the picture's centre offset from the circle's, in screen px
			const box = document.createElement('div');
			box.id = 'sb-crop';
			box.innerHTML = `<div class="sb-crop-card">
				<b>Fit your picture in the circle</b>
				<div class="sb-crop-ring" style="width:${SIZE}px;height:${SIZE}px"><canvas width="${SIZE}" height="${SIZE}"></canvas></div>
				<span class="sb-hint">Drag to move it, scroll or slide to zoom.</span>
				<input type="range" min="1" max="4" step="0.01" value="1" aria-label="Zoom">
				<div class="sb-crop-btns"><button class="sb-pill" data-act="cancel">Cancel</button><button class="sb-go" data-act="save">Save</button></div>
			</div>`;
			document.body.appendChild(box);
			box.addEventListener('keydown', (e) => e.stopPropagation());
			const cv = box.querySelector('canvas'), ctx = cv.getContext('2d'), slider = box.querySelector('input');
			// Keeps the circle covered: the picture can't be dragged past its edges.
			const clampXY = () => {
				const sw = w * base * zoom, sh = h * base * zoom;
				x = Math.max(-(sw - SIZE) / 2, Math.min((sw - SIZE) / 2, x));
				y = Math.max(-(sh - SIZE) / 2, Math.min((sh - SIZE) / 2, y));
			};
			const draw = (to = ctx, size = SIZE) => {
				const k = size / SIZE, sw = w * base * zoom * k, sh = h * base * zoom * k;
				to.clearRect(0, 0, size, size);
				to.drawImage(img, size / 2 + x * k - sw / 2, size / 2 + y * k - sh / 2, sw, sh);
			};
			const setZoom = (z) => { zoom = Math.max(1, Math.min(4, z)); slider.value = String(zoom); clampXY(); draw(); };
			draw();
			let drag = null;
			cv.addEventListener('pointerdown', (e) => { drag = { px: e.clientX, py: e.clientY, x, y }; cv.setPointerCapture(e.pointerId); });
			cv.addEventListener('pointermove', (e) => { if (!drag) return; x = drag.x + e.clientX - drag.px; y = drag.y + e.clientY - drag.py; clampXY(); draw(); });
			cv.addEventListener('pointerup', () => { drag = null; });
			cv.addEventListener('wheel', (e) => { e.preventDefault(); setZoom(zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08)); }, { passive: false });
			slider.addEventListener('input', () => setZoom(Number(slider.value)));
			box.addEventListener('click', (e) => {
				const act = e.target.dataset && e.target.dataset.act;
				if (e.target === box || act === 'cancel') return box.remove();
				if (act !== 'save') return;
				const out = document.createElement('canvas');
				out.width = out.height = 48;
				const octx = out.getContext('2d');
				octx.imageSmoothingQuality = 'high';
				draw(octx, 48);
				let data = '';
				for (const q of [0.8, 0.6, 0.45, 0.3]) {
					data = out.toDataURL('image/webp', q);
					if (!data.startsWith('data:image/webp')) data = out.toDataURL('image/jpeg', q);
					if (data.length <= PFP_MAX) break;
				}
				if (data.length > PFP_MAX || !PFP_RE.test(data)) return notify('That picture is too big, try another');
				box.remove();
				setOpt('pfp', { v: newId(), data });
				pushPicture();
				showMe();
				notify('✓ New profile picture');
				if (isOpen()) render(true);
			});
			// Tests reach in here.
			openCropper.state = () => ({ zoom, x, y });
			openCropper.set = (z, nx, ny) => { x = nx; y = ny; setZoom(z); };
		};
		img.onerror = () => notify('That picture could not be read');
		img.src = src;
	}
	/** Your picture on the game's canvas (the Extensions page), in a circle. */
	const picImg = new Image();
	function drawMyPic(left, top, size) {
		const pic = myPfp();
		if (!pic || typeof MainCanvas === 'undefined' || !MainCanvas) return;
		if (picImg.src !== pic.data) picImg.src = pic.data;
		if (!picImg.complete || !picImg.naturalWidth) return;
		MainCanvas.save();
		MainCanvas.beginPath();
		MainCanvas.arc(left + size / 2, top + size / 2, size / 2, 0, Math.PI * 2);
		MainCanvas.clip();
		MainCanvas.drawImage(picImg, left, top, size, size);
		MainCanvas.restore();
	}
	/** A picture shown big, until clicked or Escape. */
	function zoomPic(src) {
		if (!PFP_RE.test(src)) return;
		if ($('sb-zoom')) $('sb-zoom').remove();
		const box = document.createElement('div');
		box.id = 'sb-zoom';
		const img = document.createElement('img');
		img.src = src;
		img.alt = '';
		box.appendChild(img);
		const close = () => { box.remove(); document.removeEventListener('keydown', onKey, true); };
		const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
		box.addEventListener('click', close);
		document.addEventListener('keydown', onKey, true);
		document.body.appendChild(box);
	}
	/** Your own picture (or initials) in the panel header; clicking it opens the options. */
	function showMe() {
		const me = $('sb-me');
		if (!me) return;
		me.innerHTML = loggedIn() ? avatar(Player.MemberNumber, myName()) : '';
		me.title = loggedIn() ? (myPfp() ? 'Your profile picture' : 'Choose a profile picture') : '';
	}

	/** A hidden SlimeBeep beep: a "do you have SlimeBeep?" ping, its answer, or something for a group chat. */
	function onHidden(d) {
		if (!loggedIn() || !isNum(d.MemberNumber) || typeof d.Message !== 'string' || d.Message.length > 1000) return;
		const from = d.MemberNumber;
		// The server says who sent it, so this can't be faked; strangers are ignored outright.
		if (from === Player.MemberNumber || !isFriend(from) || !allow(from)) return;
		if (histOwner !== Player.MemberNumber) loadHistory();
		let p;
		try { p = JSON.parse(d.Message); } catch (e) { return; }
		if (!p || typeof p !== 'object' || Array.isArray(p) || p.sb !== 1) return;
		if (!peers.has(from)) { peers.add(from); saveGC(); emit('slimeBeepFriend', { memberNumber: from }); }
		if (typeof p.kf === 'string' && /^[A-Za-z0-9_-]{16}$/.test(p.kf) && peerKeys[from] !== p.kf) { peerKeys[from] = p.kf; saveGC(); }
		pictureNews(from, p);
		if (p.pfreq === 1 || p.pf) return;
		if (p.ping === 1) {
			// Answer once a minute at most, so nobody can use SlimeBeep to bounce beeps around.
			if (Date.now() - (ponged.get(from) || 0) > 60000) { ponged.set(from, Date.now()); sendHidden(from, { sb: 1, pong: 1 }); }
			return;
		}
		if (p.pong === 1) { if (isOpen() && tab === 'newgc') render(true); return; }
		// A group invite from a friend: kept, and a card; joining is up to you.
		if (p.ginv && typeof p.ginv === 'object') {
			const m = CODE_RE.exec(typeof p.ginv.code === 'string' ? p.ginv.code : '');
			if (!m || groups[m[1]]) return;
			const name = clean(p.ginv.name, LIMITS.name) || 'Group chat';
			const fromName = clean(d.MemberName, LIMITS.name) || `#${from}`;
			invitations = [...invitations.filter((i) => !i.code.startsWith(`SB-${m[1]}-`)), { code: m[0], name, from, fromName, at: Date.now() }].slice(-20);
			saveGC();
			if (opts.sound) chime();
			card({ icon: avatar(from, fromName), title: `👥 ${name}`, text: `${fromName} invited you to a group chat. Tap to see it.`,
				onClick: () => { tab = 'groups'; thread = null; if (!isOpen()) setOpen(true); else render(); } });
			if (isOpen() && tab === 'groups' && thread === null) render(true);
		}
	}

	/*
	 * The relay side of group chats (relay/src/index.js says what the relay does and checks).
	 * One connection per group while you're logged in; quiet, it hibernates on the relay and costs
	 * nothing. A dropped connection comes back by itself, a little later each time (up to 5 minutes).
	 */
	const conns = {}; // group id -> { ws, ready, retry, queue, waiters, create, invite, onWelcome, onFail, dead, pinged }
	let relayPics = {}; // member number -> the picture a group shared
	let myKey = null;
	const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

	/** This account's key in this browser (made the first time it's needed). */
	async function getKey() {
		const me = Player.MemberNumber;
		if (myKey && myKey.owner === me) return myKey;
		const k = `slimebeep.key.${me}`;
		try {
			const saved = JSON.parse(localStorage.getItem(k) || 'null');
			if (saved && saved.d && saved.x && saved.y) {
				const priv = await crypto.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', x: saved.x, y: saved.y, d: saved.d, ext: true }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
				return (myKey = { owner: me, priv, pub: { x: saved.x, y: saved.y }, kf: saved.x.slice(0, 16) });
			}
		} catch (e) { /* make a new one */ }
		const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
		const jwk = await crypto.subtle.exportKey('jwk', pair.privateKey);
		try { localStorage.setItem(k, JSON.stringify({ x: jwk.x, y: jwk.y, d: jwk.d })); } catch (e) { /* this visit only */ }
		return (myKey = { owner: me, priv: pair.privateKey, pub: { x: jwk.x, y: jwk.y }, kf: jwk.x.slice(0, 16) });
	}

	function connectGroup(gid, extra = {}) {
		const old = conns[gid];
		if (old && !extra.create && !extra.invite && old.ws && old.ws.readyState <= 1) return old;
		if (old && old.ws) { old.dead = true; try { old.ws.close(); } catch (e) { /* gone */ } }
		const c = { ws: null, ready: false, retry: old ? old.retry || 0 : 0, queue: [], waiters: [], ...extra };
		conns[gid] = c;
		try { c.ws = new WebSocket(`${relayUrl()}/ws?g=${gid}`); } catch (e) { warn(e, 'relay'); return c; }
		c.ws.onmessage = (e) => {
			let p;
			try { p = JSON.parse(e.data); } catch (x) { return; }
			onRelay(gid, c, p).catch((x) => warn(x, 'relay'));
		};
		c.ws.onclose = () => {
			c.ready = false;
			if (c.dead || conns[gid] !== c) return;
			if (!groups[gid]) { if (c.onFail) c.onFail('could not reach the group'); delete conns[gid]; return; }
			// Back by itself: about 2 s, 4 s, ... up to 5 minutes, a little randomly so everyone doesn't come back at once.
			c.retry = Math.min((c.retry || 0) + 1, 8);
			const ms = Math.min(300000, 1000 * 2 ** c.retry) * (0.75 + Math.random() / 2);
			setTimeout(() => { if (conns[gid] === c && groups[gid] && loggedIn()) connectGroup(gid); }, ms);
		};
		return c;
	}
	function relaySend(gid, x) {
		const c = conns[gid] || connectGroup(gid);
		if (c.ready && c.ws && c.ws.readyState === 1) c.ws.send(JSON.stringify(x));
		else c.queue.push(x);
	}

	/** Everything the relay says, checked before use. */
	async function onRelay(gid, c, p) {
		if (!p || typeof p !== 'object' || conns[gid] !== c) return;
		const me = Player.MemberNumber;
		if (p.t === 'hello' && typeof p.nonce === 'string') {
			const k = await getKey();
			const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, k.priv, new TextEncoder().encode(`${p.nonce}|${gid}|${me}`));
			const g = groups[gid];
			c.ws.send(JSON.stringify({ t: 'auth', member: me, name: myName(), pub: k.pub, sig: b64url(sig), after: g ? g.last || 0 : 0,
				...(c.create ? { create: c.create } : {}), ...(c.invite ? { invite: c.invite } : {}) }));
			return;
		}
		if (p.t === 'welcome') {
			c.ready = true;
			c.retry = 0;
			takeRoster(gid, p.roster);
			const g = groups[gid];
			const pic = myPfp();
			if (g && (pic ? g.picv !== pic.v : g.picv)) {
				c.ws.send(JSON.stringify({ t: 'profile', pic: pic ? pic.data : null }));
				g.picv = pic ? pic.v : undefined;
				saveGC();
			}
			const done = c.onWelcome;
			c.create = c.invite = c.onWelcome = c.onFail = null;
			for (const x of c.queue.splice(0)) c.ws.send(JSON.stringify(x));
			if (done) done(gid);
			return;
		}
		if (p.t === 'roster') return takeRoster(gid, p.roster);
		if (p.t === 'presence') {
			if (groups[gid] && Array.isArray(p.online)) {
				groups[gid].online = p.online.filter(isNum).slice(0, LIMITS.members);
				emit('presence', groupView(groups[gid]));
				if (isOpen()) render(true);
			}
			return;
		}
		if (p.t === 'msg') return takeMsgs(gid, [p.m], true);
		if (p.t === 'history') return takeMsgs(gid, p.msgs, false);
		if (p.t === 'pic') {
			if (isNum(p.n) && (p.data === null || (typeof p.data === 'string' && p.data.length <= PFP_MAX && PFP_RE.test(p.data)))) {
				if (p.data) relayPics[p.n] = p.data; else delete relayPics[p.n];
				if (isOpen()) render(true);
			}
			return;
		}
		if (p.t === 'invite') {
			const cb = c.waiters.shift();
			if (cb) cb(typeof p.code === 'string' && /^[A-Z2-9]{10}$/.test(p.code) ? `SB-${gid}-${p.code}` : null);
			return;
		}
		const why = clean(p.why, 120);
		if (p.t === 'gone' || (p.t === 'error' && p.fatal)) {
			c.dead = true;
			if (c.onFail) { c.onFail(why); c.onFail = null; }
			if (groups[gid] && (p.t === 'gone' || /not a member|no such group/.test(why))) dropGroup(gid, why === 'left' ? null : `You're no longer in ${groups[gid].name}`);
			return;
		}
		if (p.t === 'error') {
			if (/invite|full|already a member|member number/.test(why) && c.waiters.length) c.waiters.shift()(null, why);
			notify(`⚠ ${why}`);
		}
	}

	/** A group's member list from the relay, made safe; you must be in it. */
	function takeRoster(gid, r) {
		if (!r || typeof r !== 'object' || !Array.isArray(r.members)) return;
		const old = groups[gid];
		const members = r.members.slice(0, LIMITS.members).filter((m) => m && isNum(m.n))
			.map((m) => ({ n: m.n, name: clean(m.name, LIMITS.name) || `#${m.n}`, kf: typeof m.kf === 'string' ? m.kf.slice(0, 16) : '' }));
		if (!members.some((m) => m.n === Player.MemberNumber)) return;
		if (!old && Object.keys(groups).length >= LIMITS.groups) return;
		groups[gid] = { id: gid, name: clean(r.name, LIMITS.name) || 'Group chat', owner: isNum(r.owner) ? r.owner : 0,
			admins: Array.isArray(r.admins) ? r.admins.filter(isNum).slice(0, LIMITS.admins) : [], open: r.open === true, members,
			online: Array.isArray(r.online) ? r.online.filter(isNum).slice(0, LIMITS.members) : old ? old.online || [] : [],
			last: old ? old.last || 0 : 0, picv: old ? old.picv : undefined };
		saveGC();
		emit('group', groupView(groups[gid]));
		if (isOpen()) render(true);
	}

	/** Messages from the relay: live ones, or what you missed while away (one card for those). */
	function takeMsgs(gid, msgs, live) {
		const g = groups[gid];
		if (!g || !Array.isArray(msgs)) return;
		const me = Player.MemberNumber;
		const fresh = [];
		for (const m of msgs.slice(-200)) {
			if (!m || !Number.isInteger(m.id) || m.id <= 0) continue;
			const k = `g:${gid}:${m.id}`;
			if (histKeys.has(k)) continue;
			const sys = m.sys === true;
			const from = sys ? 0 : isNum(m.from) ? m.from : 0;
			const text = clean(m.text, LIMITS.text + 100);
			if (!text) continue;
			const h = { k, group: gid, MemberNumber: from, MemberName: sys ? '' : clean(m.name, LIMITS.name) || `#${from}`, Sent: from === me,
				Time: Number(m.at) || Date.now(), text, sys: sys ? 'roster' : undefined, unread: !sys && from !== me };
			hist.push(h);
			histKeys.add(k);
			fresh.push(h);
			if (m.id > (g.last || 0)) g.last = m.id;
		}
		if (!fresh.length) return;
		hist.sort((a, b) => a.Time - b.Time);
		saveHistory();
		saveGC();
		const unseen = fresh.filter((h) => h.unread);
		if (unseen.length && !(isOpen() && thread === `g:${gid}` && !document.hidden)) {
			if (opts.sound) chime();
			if (live || unseen.length === 1) for (const h of unseen.slice(-3)) announce(h);
			else card({ icon: '<span class="sb-av sb-gav">👥</span>', title: `👥 ${g.name}`, text: `${unseen.length} new messages while you were away`,
				onClick: () => { thread = `g:${gid}`; if (!isOpen()) setOpen(true); else render(); } });
		}
		if (isOpen() && tab !== 'options' && tab !== 'wave') render(true);
	}

	function dropGroup(gid, note) {
		const g = groups[gid];
		delete groups[gid];
		const c = conns[gid];
		if (c) { c.dead = true; try { if (c.ws) c.ws.close(); } catch (e) { /* gone */ } delete conns[gid]; }
		hist = hist.filter((h) => h.group !== gid);
		histKeys.clear();
		for (const h of hist) histKeys.add(h.k);
		saveGC();
		saveHistory();
		if (note && g) card({ icon: '<span class="sb-av sb-gav">👥</span>', title: `👥 ${g.name}`, text: note });
		if (g) emit('groupGone', { id: gid });
		if (isOpen()) { if (thread === `g:${gid}`) thread = null; render(true); }
	}

	const sendGroup = (id, text) => relaySend(id, { t: 'say', text });
	function createGroup(name, picked, open, done) {
		const id = newId();
		connectGroup(id, { create: { name: clean(name, LIMITS.name) || 'Group chat', open: !!open },
			onWelcome: () => { for (const n of picked) inviteFriend(id, n); if (done) done(id); },
			onFail: (why) => notify(`⚠ Couldn't make the group${why ? `: ${why}` : ''}`) });
		return id;
	}
	function requestInvite(id, member, cb) {
		const c = conns[id] || connectGroup(id);
		c.waiters.push(cb);
		relaySend(id, { t: 'invite', member: member == null ? null : member });
	}
	/**
	 * Invites one person to one group: a SlimeBeep friend gets the invite as a card (a hidden beep),
	 * anyone else gets a code made for them alone, to pass on however you like. Resolves to
	 * { ok, sent: 'invite' } or { ok, code } or { ok: false, why }.
	 */
	function inviteToGroup(id, n) {
		const g = groups[id];
		if (!g) return Promise.resolve({ ok: false, why: 'no such group' });
		if (!isNum(n) || !loggedIn() || n === Player.MemberNumber) return Promise.resolve({ ok: false, why: 'bad member number' });
		if (isMember(g, n)) return Promise.resolve({ ok: false, why: 'already a member' });
		if (!canInvite(g, Player.MemberNumber)) return Promise.resolve({ ok: false, why: 'only admins can invite here' });
		if (g.members.length >= LIMITS.members) return Promise.resolve({ ok: false, why: 'group is full' });
		return new Promise((resolve) => {
			const timer = setTimeout(() => resolve({ ok: false, why: 'no answer from the group chat server' }), 10000);
			requestInvite(id, n, (code, why) => {
				clearTimeout(timer);
				if (!code) return resolve({ ok: false, why: why || 'refused' });
				// A friend gets it from you directly (a card, or a beep with the code); anyone else gets the code to pass on.
				if (isFriend(n)) resolve({ ok: true, sent: deliverInvite(n, code, g.name), code });
				else resolve({ ok: true, code });
			});
		});
	}

	/** An invite made for one friend, sent to them as a hidden beep (only friends get those). */
	function inviteFriend(id, n) {
		requestInvite(id, n, (code) => { if (code) deliverInvite(n, code, groups[id] ? groups[id].name : 'Group chat'); });
	}
	const INSTALL = 'https://proudkiller0015.github.io/slimebeep/install.html';
	/** A friend's invite: a card when they have SlimeBeep, otherwise a beep they can read without it. Returns how it went. */
	function deliverInvite(n, code, name) {
		if (peers.has(n)) {
			sendHidden(n, { sb: 1, ginv: { code, name } });
			return 'invite';
		}
		beep(n, `👥 ${myName()} invited you to the SlimeBeep group chat "${name}"! Get SlimeBeep at ${INSTALL} then paste this code in 👥 Groups: ${code}`, false);
		return 'beep';
	}
	function joinCode(raw, done) {
		const m = CODE_RE.exec(String(raw || '').trim());
		if (!m) return notify('That is not a SlimeBeep group code');
		const [, gid, code] = m;
		if (groups[gid]) { if (done) done(gid); return; }
		if (Object.keys(groups).length >= LIMITS.groups) return notify('You are in too many groups');
		notify('👥 Joining…');
		connectGroup(gid, { invite: code,
			onWelcome: () => {
				invitations = invitations.filter((i) => !i.code.startsWith(`SB-${gid}-`));
				saveGC();
				notify(`👥 Joined ${groups[gid] ? groups[gid].name : 'the group'}`);
				if (done) done(gid);
			},
			onFail: (why) => notify(`⚠ Couldn't join${why ? `: ${why}` : ''}`) });
	}
	function leaveGroup(id) {
		relaySend(id, { t: 'leave' });
		setTimeout(() => dropGroup(id, null), 600);
	}
	/** Your picture changed: every group gets the new one. */
	function pushPicture() {
		const pic = myPfp();
		for (const id of Object.keys(groups)) { relaySend(id, { t: 'profile', pic: pic ? pic.data : null }); groups[id].picv = pic ? pic.v : undefined; }
		saveGC();
	}
	let lastRelayCheck = 0;
	/** Every few seconds: connected to every group you're in, and a keep-alive every 4 minutes. */
	function relayTick() {
		if (!loggedIn() || Date.now() - lastRelayCheck < 5000) return;
		lastRelayCheck = Date.now();
		getKey().catch((e) => warn(e, 'key'));
		for (const id of Object.keys(groups)) if (!conns[id]) connectGroup(id);
		// Answered by the relay without waking the group (free).
		for (const c of Object.values(conns)) if (c.ready && c.ws && c.ws.readyState === 1 && Date.now() - (c.pinged || 0) > 240000) { c.pinged = Date.now(); c.ws.send('{"t":"ping"}'); }
	}
	/** A ✓ when a friend's key in a group is the one their own SlimeBeep sent you, a ⚠ when it isn't. */
	function keyMark(m) {
		if (m.n === Player.MemberNumber || !peerKeys[m.n] || !m.kf) return '';
		return peerKeys[m.n] === m.kf ? ' <span title="Checked: the same key their own SlimeBeep sent you">✓</span>'
			: ' <span title="Not the key their own SlimeBeep sent you: this may not really be them">⚠</span>';
	}

	// Hidden beeps go out one at a time, a little apart, so a group message never floods the server.
	const outbox = [];
	function sendHidden(n, payload) {
		// Every hidden beep says which picture you have now (pv), so the other side can ask for it.
		const pic = myPfp();
		const kf = myKey && myKey.owner === Player.MemberNumber ? myKey.kf : undefined;
		outbox.push([n, JSON.stringify({ ...payload, pv: pic ? pic.v : 0, ...(kf ? { kf } : {}) })]);
		if (outbox.length === 1) drain();
	}
	function drain() {
		if (!outbox.length) return;
		const [n, msg] = outbox[0];
		try { ServerSend('AccountBeep', { MemberNumber: n, BeepType: PROTO, IsSecret: true, Message: msg }); } catch (e) { warn(e); }
		setTimeout(() => { outbox.shift(); drain(); }, 250);
	}

	/** Asks online friends not yet known to have SlimeBeep whether they do (hidden, answered by their SlimeBeep). */
	function findPeers() {
		const ask = friends.filter((f) => !peers.has(f.MemberNumber)).slice(0, 40);
		for (const f of ask) sendHidden(f.MemberNumber, { sb: 1, ping: 1 });
		return ask.length;
	}
	/*
	 * Every incoming beep, straight from the server. The game's beep list (which the chats are built
	 * from) only takes plain beeps, and another add-on can handle a beep before the game does, so it
	 * never reaches that list (Alyx's beep, 16 Oct 2026: it only showed in EBC). A beep the game has
	 * not listed a moment later is added here instead. Leash beeps and raw data are left alone.
	 */
	function catchBeep(d) {
		if (!d || typeof d.MemberNumber !== 'number' || typeof d.MemberName !== 'string') return;
		const type = typeof d.BeepType === 'string' ? d.BeepType : '';
		if (/leash/i.test(type)) return;
		const msg = typeof d.Message === 'string' ? d.Message : undefined;
		// Another add-on's own signals (isSignal) are not beeps.
		if (isSignal(msg, !!type)) return;
		if (type && !parseBeep(msg).text) return;
		const at = Date.now();
		setTimeout(() => {
			try {
				const listed = gameLog().some((b) => b && b.MemberNumber === d.MemberNumber && !b.Sent &&
					(b.Message ?? undefined) === msg && Math.abs(new Date(b.Time).getTime() - at) < 15000);
				console.debug(`[SlimeBeep] beep from ${d.MemberName} (${d.MemberNumber}), type "${type}": ${listed ? 'in the game\'s beep list' : 'not in the game\'s beep list, kept by SlimeBeep'}`);
				if (listed || !loggedIn()) return;
				if (histOwner !== Player.MemberNumber) loadHistory();
				const h = { k: `raw:${d.MemberNumber}|${at}`, MemberNumber: d.MemberNumber, MemberName: d.MemberName, Sent: false, Time: at,
					Message: msg, ChatRoomName: d.ChatRoomName || undefined, unread: true };
				if (histKeys.has(h.k)) return;
				hist.push(h);
				histKeys.add(h.k);
				saveHistory();
				if (isReaction(h)) return;
				if (opts.sound) chime();
				announce(h);
				if (isOpen() && tab !== 'options' && tab !== 'wave') render(true);
			} catch (e) { warn(e); }
		}, 1500);
	}
	const askFriends = () => {
		if (!loggedIn()) return;
		listen();
		try { if (typeof ServerSend === 'function') ServerSend('AccountQuery', { Query: 'OnlineFriends' }); } catch (e) { warn(e, 'friends'); }
	};

	const isOpen = () => $('sb-panel').style.display === 'flex';
	function setOpen(on) {
		$('sb-panel').style.display = on ? 'flex' : 'none';
		if (on) { askFriends(); render(); }
		place();
	}

	/** The button where it was dragged to (kept on screen), and the panel beside it. */
	function place() {
		const t = $('sb-toggle'), panel = $('sb-panel');
		const size = t.offsetWidth || 46;
		const x = opts.pos ? opts.pos.x * innerWidth : innerWidth - size - 14;
		const y = opts.pos ? opts.pos.y * innerHeight : innerHeight - size - 14;
		const left = Math.max(0, Math.min(innerWidth - size, x));
		const top = Math.max(0, Math.min(innerHeight - size, y));
		t.style.left = `${left}px`;
		t.style.top = `${top}px`;
		placeCards();
		if (!isOpen()) return;
		const w = panel.offsetWidth, h = Math.min(480, innerHeight - 16);
		panel.style.height = `${h}px`;
		// Beside the button: above it if it fits, otherwise below, else as close as the window allows.
		panel.style.left = `${Math.max(8, Math.min(innerWidth - w - 8, left + size - w))}px`;
		const above = top - h - 10, below = top + size + 10;
		panel.style.top = `${above >= 8 ? above : below + h <= innerHeight - 8 ? below : Math.max(8, innerHeight - h - 8)}px`;
		placeCards();
	}

	/** Every second: new beeps update the badge and the open chat. */
	function tick() {
		// Whatever goes wrong in here stays in here: never an error into the game or other add-ons.
		try {
			updateNote();
			gameCheck();
			if (waiting.length && loggedIn() && Date.now() - (tick.asked || 0) > 60000) { tick.asked = Date.now(); askFriends(); }
			if (!tick.n || ++tick.n % 5 === 0) applyThemed();
			tick.n = tick.n || 1;
			// Listen from login on, not only once the panel has been opened.
			if (loggedIn()) listen();
			if (loggedIn() && histOwner === Player.MemberNumber) relayTick();
			const first = histOwner === null || (loggedIn() && histOwner !== Player.MemberNumber);
			const fresh = sync();
			const n = log().filter(unread).length;
			const badge = $('sb-badge');
			badge.textContent = n > 99 ? '99+' : String(n);
			badge.style.display = n ? 'block' : 'none';
			// The beeps already there at login are not news.
			if (first || !fresh.length) { if (fresh.length && isOpen()) render(true); return; }
			if (opts.sound) chime();
			for (const h of fresh.slice(-4)) announce(h);
			if (isOpen() && tab !== 'options' && tab !== 'wave') render(true);
		} catch (e) {
			if (!tick.warned) { tick.warned = true; warn(e); }
		}
	}

	/** A new beep: a card by the slime (click opens the chat), and a desktop notification if the game is in the background. */
	function announce(h) {
		// Already looking at that chat: it's right there.
		if (isOpen() && thread === h.MemberNumber && !document.hidden) return;
		const text = textOf(h);
		const room = h.ChatRoomName && typeof h.Message === 'string' ? `📍 in ${h.ChatRoomName}` : '';
		const g = h.group && groups[h.group];
		if (h.group && isOpen() && thread === `g:${h.group}` && !document.hidden) return;
		const open = () => { thread = g ? `g:${g.id}` : h.MemberNumber; renderThread.pin = undefined; if (!isOpen()) setOpen(true); else render(); };
		if (opts.popups) {
			card(g ? { icon: '<span class="sb-av sb-gav">👥</span>', title: `👥 ${g.name}`, text: h.announceText || `${h.MemberName}: ${text}`, onClick: open }
				: { icon: avatar(h.MemberNumber, h.MemberName), title: `💌 ${h.MemberName}`, text, sub: room, onClick: open });
		}
		if (opts.desktop && document.hidden && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
			try {
				const note = new Notification(`💌 ${h.MemberName}`, { body: room ? `${text}\n${room}` : text, icon: ICON, tag: `slimebeep-${h.MemberNumber}` });
				note.onclick = () => { focus(); open(); note.close(); };
			} catch (e) { /* the browser said no */ }
		}
	}

	/** A card in the stack by the slime; gone after `ms` (0: stays until closed). At most four at once. */
	function card({ icon, title, text, sub = '', onClick, ms = 7000, cls = '' }) {
		const box = $('sb-cards');
		const c = document.createElement('div');
		c.className = `sb-card ${cls}`;
		c.innerHTML = `${icon}<span class="sb-main"><b>${esc(title)}</b><span class="sb-txt">${esc(text)}</span>${sub ? `<small>${esc(sub)}</small>` : ''}</span><button class="sb-x" title="Dismiss">✕</button>`;
		const close = () => { c.classList.add('out'); setTimeout(() => { c.remove(); placeCards(); }, 250); };
		c.querySelector('.sb-x').addEventListener('click', (e) => { e.stopPropagation(); close(); });
		c.addEventListener('click', () => { close(); if (onClick) onClick(); });
		box.prepend(c);
		while (box.children.length > 4) box.lastChild.remove();
		placeCards();
		if (ms) setTimeout(close, ms);
	}

	/** The card stack beside the slime (or the panel, when it's open), kept inside the window. */
	function placeCards() {
		const box = $('sb-cards');
		if (!box || !box.children.length) return;
		const open = isOpen();
		const r = (open ? $('sb-panel') : $('sb-toggle')).getBoundingClientRect();
		const w = box.offsetWidth, h = box.offsetHeight;
		let left = open ? r.left - w - 10 : r.right - w;
		if (open && left < 8) left = r.right + 10;
		box.style.left = `${Math.max(8, Math.min(innerWidth - w - 8, left))}px`;
		const top = open ? r.bottom - h : r.top - h - 10 >= 8 ? r.top - h - 10 : r.bottom + 10;
		box.style.top = `${Math.max(8, Math.min(innerHeight - h - 8, top))}px`;
	}

	/*
	 * News from the repository (news.json): [{ "id": "...", "title": "...", "text": "...", "date": "..." }].
	 * Each item shows once per browser, and stays until closed. A first install only gets the newest one.
	 */
	let newsItems = [];

	/*
	 * After an update (or a first install), one small line in the room chat the next time you are
	 * in a room: the new version and, when news.json has an item with that version as its id, what's new.
	 * Only you see it.
	 */
	function updateNote() {
		if (opts.lastVersion === VERSION || !loggedIn() || typeof ChatRoomSendLocal !== 'function' || updateNote.pending) return;
		// In a room with its chat log on screen for a few seconds, and the news read (or given up on):
		// right after a login the game says "in a room" before the log exists, and a note sent then is lost.
		const log = document.getElementById('TextAreaChatLog');
		const inRoom = !!log && (typeof ServerPlayerIsInChatRoom === 'function' ? ServerPlayerIsInChatRoom() : !!myRoom());
		if (!inRoom) { updateNote.since = 0; return; }
		if (!updateNote.since) updateNote.since = Date.now();
		if (Date.now() - updateNote.since < 3000 || (!newsLoaded && Date.now() - started < 15000)) return;
		if (Date.now() - (updateNote.last || 0) < 10000) return;
		const item = newsItems.find((i) => i.id === VERSION);
		const first = !opts.lastVersion;
		const head = first ? `SlimeBeep v${esc(VERSION)} is ready!` : `SlimeBeep updated to v${esc(VERSION)}`;
		const body = item ? esc(item.text) : first ? 'Click the pink slime to beep your friends.' : '';
		updateNote.pending = true;
		updateNote.last = Date.now();
		ChatRoomSendLocal(`<div class="sb-update-note" data-v="${esc(VERSION)}" style="margin:2px 0;padding:4px 10px;border-radius:10px;background:#ffe6f3;color:#a3155c;border-left:4px solid #ff4fa3;font-size:.9em">` +
			`<img src="${ICON}" style="width:1.3em;height:1.3em;vertical-align:middle;border-radius:50%;margin-right:4px${opts.night ? ';filter:hue-rotate(-105deg)' : ''}" alt="">` +
			`<b>${head}</b>${body ? ` ${body}` : ''}</div>`);
		// Only counted as shown once it is really in the chat log; otherwise tried again (five times at most).
		setTimeout(() => {
			updateNote.pending = false;
			const shown = !!document.querySelector(`#TextAreaChatLog .sb-update-note[data-v="${CSS.escape(VERSION)}"]`);
			updateNote.tries = (updateNote.tries || 0) + 1;
			if (shown || updateNote.tries >= 5) { opts.lastVersion = VERSION; saveOpts(); }
		}, 1500);
	}
	/**
	 * Once logged in: if a game update removed something SlimeBeep uses, one card (per version and
	 * per set of missing parts) says what won't work until SlimeBeep is updated. Nothing else changes.
	 */
	function gameCheck() {
		if (gameCheck.done || !loggedIn()) return;
		gameCheck.done = true;
		const gone = missing();
		if (!gone.length) return;
		const sig = `${VERSION}:${gone.map(([k]) => k).join(',')}`;
		if (opts.gameWarned === sig) return;
		setOpt('gameWarned', sig);
		const what = [...new Set(gone.map(([, , w]) => w))].join(', ');
		card({ icon: `<img src="${ICON}" style="width:34px;height:34px;border-radius:50%;flex:none" alt="">`, title: '🫧 SlimeBeep',
			text: `A game update changed something SlimeBeep uses, so this may not work until SlimeBeep updates: ${what}. Everything else works as usual.`, ms: 0, cls: 'news' });
	}
	let newsLoaded = false;
	const started = Date.now();

	function news() {
		fetch(`${NEWS}?t=${Date.now()}`, { cache: 'no-store' })
			.then((r) => (r.ok ? r.json() : []))
			.then((items) => {
				const valid = Array.isArray(items) ? items.filter((i) => i && i.id && i.text) : [];
				newsItems = valid;
				if (!valid.length) return;
				if (!Array.isArray(opts.seenNews)) opts.seenNews = valid.slice(0, -1).map((i) => i.id);
				for (const i of valid.filter((x) => !opts.seenNews.includes(x.id)).slice(-3)) {
					card({ icon: `<img src="${ICON}" style="width:34px;height:34px;border-radius:50%;flex:none" alt="">`,
						title: i.title || '📢 SlimeBeep news', text: i.text, sub: i.date || '', ms: 0, cls: 'news' });
				}
				opts.seenNews = valid.map((i) => i.id);
				saveOpts();
			})
			.catch(() => { /* no news is fine */ })
			.finally(() => { newsLoaded = true; });
	}

	/** A soft two-note pop for a new beep. */
	function chime() {
		try {
			const ac = chime.ac || (chime.ac = new AudioContext());
			for (const [f, at] of [[880, 0], [1320, 0.09]]) {
				const o = ac.createOscillator(), g = ac.createGain();
				o.type = 'sine';
				o.frequency.value = f;
				g.gain.setValueAtTime(0.0001, ac.currentTime + at);
				g.gain.exponentialRampToValueAtTime(0.12, ac.currentTime + at + 0.02);
				g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + at + 0.18);
				o.connect(g).connect(ac.destination);
				o.start(ac.currentTime + at);
				o.stop(ac.currentTime + at + 0.2);
			}
		} catch (e) { /* no sound, no matter */ }
	}

	/** One chat per person, newest first: { n, name, last, unread }. */
	function chats() {
		const by = new Map();
		for (const b of log()) {
			if (b.group || isReaction(b)) continue;
			const c = by.get(b.MemberNumber) || { n: b.MemberNumber, name: null, last: null, unread: 0 };
			if (!b.Sent) c.name = b.MemberName;
			c.last = b;
			if (unread(b)) c.unread++;
			by.set(b.MemberNumber, c);
		}
		return [...by.values()].map((c) => ({ ...c, name: c.name || nameOf(c.n) })).sort((a, b) => new Date(b.last.Time) - new Date(a.last.Time));
	}

	const where = (f) => (!f ? 'Offline' : f.ChatRoomName ? (f.Private ? `🔒 ${f.ChatRoomName}` : `📍 ${f.ChatRoomName}`) : f.Private ? '🔒 Private room' : '🏠 Not in a room');

	function render(keepScroll) {
		const view = $('sb-view');
		showMe();
		if (!loggedIn()) {
			view.innerHTML = '<div class="sb-empty">💤 Log in and SlimeBeep wakes up.</div>';
			return;
		}
		if (thread !== null) return renderThread(keepScroll);
		const unreadChats = log().filter((h) => !h.group && unread(h)).length;
		const unreadGroups = log().filter((h) => h.group && unread(h)).length;
		const on = (t) => (tab === t || (t === 'groups' && tab === 'newgc') ? 'on' : '');
		// 💬 one-to-one chats, 👥 group chats, 💖 who's online, 🌊 WaveBeep: one beep to many friends.
		const tabs = `<div class="sb-tabs">
			<button data-tab="chats" class="${on('chats')}" title="Chats">💬 Chats${unreadChats ? `<i>${unreadChats}</i>` : ''}</button>
			<button data-tab="groups" class="${on('groups')}" title="Group chats">👥 Groups${unreadGroups ? `<i>${unreadGroups}</i>` : ''}</button>
			<button data-tab="friends" class="${on('friends')}" title="Friends online">💖${friends.length ? `<i>${friends.length}</i>` : ''}</button>
			<button data-tab="wave" class="${on('wave')}" title="WaveBeep: one beep to many friends">🌊 Wave</button>
			<button data-tab="bug" class="${on('bug')}" title="Report a bug">🐞</button>
		</div>`;
		const body = $('sb-body');
		const scroll = keepScroll && body ? body.scrollTop : 0;
		if (tab === 'options') view.innerHTML = tabs + `<div class="sb-body" id="sb-body">${optionsHtml()}</div>`;
		else if (tab === 'newgc') view.innerHTML = tabs + `<div class="sb-body sb-group" id="sb-body">${newGroupHtml()}</div>`;
		else if (tab === 'wave') view.innerHTML = tabs + `<div class="sb-body sb-group" id="sb-body">${groupHtml()}</div>`;
		else if (tab === 'bug') view.innerHTML = tabs + `<div class="sb-body sb-group" id="sb-body">${bugHtml()}</div>`;
		else if (tab === 'invitefor') view.innerHTML = tabs + `<div class="sb-body sb-group" id="sb-body">${inviteForHtml()}</div>`;
		else {
			const q = search.toLowerCase();
			const rows = tab === 'chats' ? chatRows(q) : tab === 'groups' ? groupRows(q) : friendRows(q);
			const what = { chats: 'chats', groups: 'group chats', friends: 'friends' }[tab] || 'chats';
			const empty = tab === 'chats' ? '🫧 No beeps yet. Pick someone in 💖 to say hi!'
				: tab === 'groups' ? (q ? 'No group by that name.' : '👥 No group chats yet. Make one with your SlimeBeep friends!')
				: q ? 'Nobody by that name.' : '🌙 None of your friends are online.';
			view.innerHTML = tabs + `<div class="sb-body" id="sb-body">
				${tab === 'groups' ? groupsTop() : ''}
				<input class="sb-search" id="sb-search" placeholder="🔍 Search ${what}…" value="${esc(search)}">
				${rows || `<div class="sb-empty">${empty}</div>`}
			</div>`;
			const s = $('sb-search');
			s.addEventListener('input', () => { search = s.value; render(); const again = $('sb-search'); again.focus(); again.setSelectionRange(search.length, search.length); });
		}
		if (keepScroll) $('sb-body').scrollTop = scroll;
		for (const b of view.querySelectorAll('[data-tab]')) b.addEventListener('click', () => { tab = b.dataset.tab; search = ''; render(); });
		for (const r of view.querySelectorAll('[data-open]')) r.addEventListener('click', () => {
			const v = r.dataset.open;
			thread = v.startsWith('g:') ? v : Number(v);
			renderThread.pin = undefined;
			render();
		});
		if ($('sb-newgc')) $('sb-newgc').addEventListener('click', () => { tab = 'newgc'; render(); });
		if (tab === 'groups' && $('sb-join')) wireGroupsTop();
		if (tab === 'newgc') wireNewGroup();
		if (tab === 'wave') wireGroup();
		if (tab === 'bug') wireBug();
		if (tab === 'invitefor') wireInviteFor();
		if (tab === 'options') wireOptions();
	}

	function chatRows(q) {
		const rows = chats().filter((c) => !q || c.name.toLowerCase().includes(q) || String(c.n).includes(q)).map((c) => {
			const online = friends.some((f) => f.MemberNumber === c.n);
			const text = textOf(c.last);
			return { time: new Date(c.last.Time).getTime(), html: `<div class="sb-row" data-open="${c.n}">${avatar(c.n, c.name)}
				<div class="sb-main"><div class="sb-name">${online ? '<span class="sb-on"></span>' : ''}${esc(c.name)}</div>
				<div class="sb-sub">${c.last.Sent ? 'You: ' : ''}${esc(text)}</div></div>
				<div class="sb-side">${timeOf(c.last.Time)}${c.unread ? `<br><span class="sb-dot">${c.unread}</span>` : ''}</div></div>` };
		});
		return rows.sort((a, b) => b.time - a.time).map((r) => r.html).join('');
	}

	/** The group chats, newest message first. */
	function groupRows(q) {
		const rows = [];
		for (const g of Object.values(groups)) {
			if (q && !g.name.toLowerCase().includes(q)) continue;
			const msgs = hist.filter((h) => h.group === g.id);
			const last = msgs[msgs.length - 1];
			const n = msgs.filter(unread).length;
			rows.push({ time: last ? last.Time : 0, html: `<div class="sb-row" data-open="g:${g.id}"><span class="sb-av sb-gav">👥</span>
				<div class="sb-main"><div class="sb-name">${esc(g.name)} <small style="font-weight:normal;color:#c08aaa">${g.members.length}</small></div>
				<div class="sb-sub">${last ? `${last.sys ? '' : `${last.Sent ? 'You' : esc(last.MemberName)}: `}${esc(textOf(last))}` : 'No messages yet'}</div></div>
				<div class="sb-side">${last ? timeOf(last.Time) : ''}${n ? `<br><span class="sb-dot">${n}</span>` : ''}</div></div>` });
		}
		return rows.sort((a, b) => b.time - a.time).map((r) => r.html).join('');
	}

	/** Friends to pick from: online ones, SlimeBeep users first and only they can be ticked. */
	function pickList(exclude = []) {
		return friends.filter((f) => !exclude.includes(f.MemberNumber))
			.sort((a, b) => Number(peers.has(b.MemberNumber)) - Number(peers.has(a.MemberNumber)) || a.MemberName.localeCompare(b.MemberName))
			.map((f) => {
				const has = peers.has(f.MemberNumber);
				return `<label><input type="checkbox" value="${f.MemberNumber}">${avatar(f.MemberNumber, f.MemberName)}
				<span class="sb-main" style="margin-left:8px"><span class="sb-name">${esc(f.MemberName)} ${has ? '🫧' : ''}</span>
				<span class="sb-sub" style="display:block">${has ? 'Has SlimeBeep: gets an invite card' : 'Gets a beep with the code and where to get SlimeBeep'}</span></span></label>`;
			}).join('') || '<div class="sb-empty">🌙 No online friends to add right now.</div>';
	}
	function wireFind() {
		$('sb-gc-find').addEventListener('click', () => {
			const n = findPeers();
			notify(n ? `🔍 Asking ${n} friend${n === 1 ? '' : 's'}…` : 'Everyone online is checked');
			setTimeout(() => { if (isOpen()) render(true); }, 2500 + n * 250);
		});
	}

	/** The top of 👥 Groups: invites from friends, and joining with a code. */
	function groupsTop() {
		const inv = invitations.filter((i) => !groups[CODE_RE.exec(i.code)[1]]).map((i, n) => `<div class="sb-row" style="cursor:default">${avatar(i.from, i.fromName)}
			<div class="sb-main"><div class="sb-name">${esc(i.name)}</div><div class="sb-sub">Invite from ${esc(i.fromName)}</div></div>
			<div class="sb-side" style="display:flex;gap:3px"><button class="sb-go" data-join="${n}">Join</button><button class="sb-pill" data-dismiss="${n}" title="Dismiss">✕</button></div></div>`).join('');
		return `<button class="sb-pill" id="sb-newgc" style="width:100%;margin:2px 0 6px">👥 New group chat</button>
			<div class="sb-line" style="margin:0 0 6px"><input class="sb-search" id="sb-join-code" placeholder="Have a code? SB-…" style="margin:0"><button class="sb-pill" id="sb-join">Join</button></div>
			${inv ? `<div class="sb-hint" style="margin:2px 2px 0">📨 Invitations</div>${inv}` : ''}`;
	}
	function wireGroupsTop() {
		const list = invitations.filter((i) => !groups[CODE_RE.exec(i.code)[1]]);
		for (const b of $('sb-view').querySelectorAll('[data-join]')) b.addEventListener('click', () => {
			const i = list[Number(b.dataset.join)];
			if (i) joinCode(i.code, (gid) => { thread = `g:${gid}`; render(); });
		});
		for (const b of $('sb-view').querySelectorAll('[data-dismiss]')) b.addEventListener('click', () => {
			const i = list[Number(b.dataset.dismiss)];
			invitations = invitations.filter((x) => x !== i);
			saveGC();
			render(true);
		});
		$('sb-join').addEventListener('click', () => joinCode($('sb-join-code').value, (gid) => { thread = `g:${gid}`; render(); }));
		$('sb-join-code').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('sb-join').click(); });
	}

	function newGroupHtml() {
		return `<div class="sb-line"><button class="sb-pill" id="sb-gc-back">‹ Back</button><b>👥 New group chat</b></div>
			<div class="sb-hint" style="margin:4px 0 6px">Up to ${LIMITS.members} people with SlimeBeep, friends or not. Tick friends to invite them now (🫧 have SlimeBeep already); anyone else can join with a code from the group's 👥 page.</div>
			<input class="sb-search" id="sb-gc-name" maxlength="${LIMITS.name}" placeholder="Group name (optional)">
			<label><input type="checkbox" id="sb-gc-open"><span>Anyone can invite<span class="sb-hint" style="display:block">Otherwise only you and the admins you pick can add people.</span></span></label>
			<div class="sb-line"><b>Invite friends</b><button class="sb-pill" id="sb-gc-find">🔍 Find SlimeBeep friends</button></div>
			${pickList()}
			<div class="sb-line" style="position:sticky;bottom:-10px;background:#fff7fb;padding:6px 0"><span id="sb-gc-count"></span><button class="sb-go" id="sb-gc-make">Create 👥</button></div>`;
	}

	function wireNewGroup() {
		const boxes = () => [...$('sb-body').querySelectorAll('label input[type=checkbox][value]:not(:disabled)')];
		const update = () => {
			const n = boxes().filter((b) => b.checked).length;
			$('sb-gc-count').textContent = n ? `${n} to invite` : 'Just you for now';
			for (const b of boxes()) if (!b.checked) b.disabled = n >= LIMITS.members - 1;
		};
		for (const b of boxes()) b.addEventListener('change', update);
		$('sb-gc-back').addEventListener('click', () => { tab = 'groups'; render(); });
		wireFind();
		$('sb-gc-make').addEventListener('click', () => {
			const picked = boxes().filter((b) => b.checked).map((b) => Number(b.value));
			const name = clean($('sb-gc-name').value, LIMITS.name) || 'Group chat';
			$('sb-gc-make').disabled = true;
			notify('👥 Making the group…');
			createGroup(name, picked, $('sb-gc-open').checked, (id) => {
				notify(`👥 ${name} created`);
				tab = 'groups';
				thread = `g:${id}`;
				render();
			});
			setTimeout(() => { if ($('sb-gc-make')) $('sb-gc-make').disabled = false; }, 8000);
		});
		update();
	}

	/** The last invite code made on the members page, under its button. */
	function showCode() {
		const out = $('sb-gm-out');
		const k = renderMembers.code;
		if (!out || !k || !renderMembers.open || k.id !== renderMembers.open) return;
		out.innerHTML = `<div class="sb-row" style="cursor:default;display:block"><code style="font-size:13px;user-select:all">${esc(k.code)}</code>
			<div class="sb-hint">${k.forWho ? `Only #${k.forWho} can use it, once.` : 'Anyone with it can join, for 7 days (20 people at most).'} They paste it in 👥 Groups.</div>
			<button class="sb-pill" id="sb-gm-copy" style="margin-top:4px">📋 Copy</button></div>`;
		$('sb-gm-copy').addEventListener('click', async () => {
			try { await navigator.clipboard.writeText(k.code); notify('📋 Code copied'); } catch (e) { notify('Select the code and copy it'); }
		});
	}

	/** The members page of a group: roles, inviting, and what you're allowed to change. */
	function renderMembers(id) {
		const g = groups[id];
		const me = Player.MemberNumber;
		const admin = isAdmin(g, me);
		const owner = g.owner === me;
		const view = $('sb-view');
		const on = (n) => n === me || (g.online || []).includes(n);
		const rows = g.members.slice().sort((a, b) => Number(on(b.n)) - Number(on(a.n)) || Number(b.n === g.owner) - Number(a.n === g.owner) || Number(isAdmin(g, b.n)) - Number(isAdmin(g, a.n)))
			.map((m) => {
				const n = m.n;
				const role = n === g.owner ? '👑 Owner' : isAdmin(g, n) ? '⭐ Admin' : 'Member';
				const acts = [];
				if (n !== me && n !== g.owner) {
					if (admin && !isAdmin(g, n) && g.admins.length < LIMITS.admins) acts.push(`<button class="sb-pill" data-act="up" data-n="${n}" title="Make admin">⭐</button>`);
					if (owner && isAdmin(g, n)) acts.push(`<button class="sb-pill" data-act="down" data-n="${n}" title="Take admin">✩</button>`);
					if ((admin && !isAdmin(g, n)) || owner) acts.push(`<button class="sb-pill" data-act="kick" data-n="${n}" title="Remove">✕</button>`);
					if (owner) acts.push(`<button class="sb-pill" data-act="own" data-n="${n}" title="Make owner">👑</button>`);
				}
				return `<div class="sb-row" style="cursor:default">${avatar(n, memberName(g, n))}
					<div class="sb-main"><div class="sb-name">${on(n) ? '<span class="sb-on" title="Online"></span>' : '<span class="sb-off" title="Offline"></span>'}${esc(memberName(g, n))}${keyMark(m)}${peers.has(n) ? ' 🫧' : ''}</div><div class="sb-sub">${role} · #${n}${on(n) ? '' : ' · offline'}</div></div>
					<div class="sb-side" style="display:flex;gap:3px">${acts.join('')}</div></div>`;
			}).join('');
		const invite = canInvite(g, me) && g.members.length < LIMITS.members;
		const memberNums = g.members.map((m) => m.n);
		view.innerHTML = `
			<div class="sb-thead"><button id="sb-back" title="Back to the chat">‹</button><span class="sb-av sb-gav">👥</span>
				<div class="sb-main"><div class="sb-name">${esc(g.name)}</div><div class="sb-sub">${g.members.length} / ${LIMITS.members} members</div></div></div>
			<div class="sb-body sb-group" id="sb-body">
				${admin ? `<div class="sb-line"><input class="sb-search" id="sb-gm-name" maxlength="${LIMITS.name}" value="${esc(g.name)}" style="margin:0"><button class="sb-pill" id="sb-gm-rename">Rename</button></div>
				<label><input type="checkbox" id="sb-gm-open" ${g.open ? 'checked' : ''}><span>Anyone can invite</span></label>` : `<div class="sb-hint">${g.open ? 'Anyone can invite people here.' : 'Only admins can invite people here.'}</div>`}
				${rows}
				${invite ? `<div class="sb-line"><b>🔗 Invite with a code</b></div>
				<div class="sb-hint">Works for anyone with SlimeBeep, friends or not. ${admin ? 'Put a member number to make it work for that one person only.' : ''}</div>
				<div class="sb-line">${admin ? '<input class="sb-search" id="sb-gm-for" placeholder="Member # (optional)" style="margin:0;width:150px">' : '<span></span>'}<button class="sb-go" id="sb-gm-code">Make a code</button></div>
				<div id="sb-gm-out"></div>
				<div class="sb-line"><b>Invite friends</b><button class="sb-pill" id="sb-gc-find">🔍 Find 🫧</button></div>${pickList(memberNums)}
				<div class="sb-line" style="position:sticky;bottom:-10px;background:#fff7fb;padding:6px 0"><span></span><button class="sb-go" id="sb-gm-add" disabled>Send invites</button></div>` : ''}
			</div>`;
		$('sb-back').addEventListener('click', () => { renderMembers.open = null; render(); });
		const act = (x) => { relaySend(id, x); };
		for (const b of view.querySelectorAll('[data-act]')) b.addEventListener('click', () => {
			const n = Number(b.dataset.n);
			if (b.dataset.act === 'up') act({ t: 'admin', member: n, on: true });
			if (b.dataset.act === 'down') act({ t: 'admin', member: n, on: false });
			if (b.dataset.act === 'kick') act({ t: 'kick', member: n });
			if (b.dataset.act === 'own') act({ t: 'owner', member: n });
		});
		if ($('sb-gm-rename')) $('sb-gm-rename').addEventListener('click', () => {
			const name = clean($('sb-gm-name').value, LIMITS.name);
			if (name && name !== g.name) act({ t: 'rename', name });
		});
		if ($('sb-gm-open')) $('sb-gm-open').addEventListener('change', (e) => act({ t: 'open', on: e.target.checked }));
		if (invite) {
			wireFind();
			$('sb-gm-code').addEventListener('click', () => {
				const want = $('sb-gm-for') ? Number($('sb-gm-for').value.replace(/\D/g, '')) : 0;
				const forWho = isNum(want) ? want : null;
				requestInvite(id, forWho, (code) => {
					if (!code) return;
					// Kept, so it stays on screen when the page redraws (someone joining, say).
					renderMembers.code = { id, code, forWho };
					showCode();
				});
			});
			showCode();
			const boxes = () => [...$('sb-body').querySelectorAll('label input[type=checkbox][value]:not(:disabled)')];
			const room = LIMITS.members - g.members.length;
			const update = () => {
				const n = boxes().filter((b) => b.checked).length;
				$('sb-gm-add').disabled = !n;
				for (const b of boxes()) if (!b.checked) b.disabled = n >= room;
			};
			for (const b of boxes()) b.addEventListener('change', update);
			$('sb-gm-add').addEventListener('click', () => {
				const picked = boxes().filter((b) => b.checked).map((b) => Number(b.value)).slice(0, room);
				for (const n of picked) inviteFriend(id, n);
				notify(`📨 ${picked.length} invite${picked.length === 1 ? '' : 's'} sent`);
				for (const b of boxes()) b.checked = false;
				update();
			});
		}
	}

	function renderGroupThread(keepScroll) {
		const id = thread.slice(2);
		const g = groups[id];
		if (!g) { thread = null; return render(); }
		if (renderMembers.open === id) return renderMembers(id);
		const view = $('sb-view');
		const msgs = hist.filter((h) => h.group === id).sort((a, b) => a.Time - b.Time);
		for (const h of msgs) markRead(h);
		const old = $('sb-msgs');
		const atBottom = !old || old.scrollHeight - old.scrollTop - old.clientHeight < 40;
		const draft = $('sb-text') ? $('sb-text').value : '';
		const names = g.members.filter((m) => m.n !== Player.MemberNumber).map((m) => memberName(g, m.n));
		const online = conns[id] && conns[id].ready;
		const here = new Set([...(g.online || []), Player.MemberNumber]).size;
		view.innerHTML = `
			<div class="sb-thead"><button id="sb-back" title="Back">‹</button><span class="sb-av sb-gav">👥</span>
				<div class="sb-main"><div class="sb-name">${esc(g.name)}</div>
				<div class="sb-sub" title="${esc(names.join(', '))}">${online ? `<span class="sb-on"></span>${here} online · ` : '⏳ connecting… · '}${g.members.length} members: You${names.length ? `, ${esc(names.join(', '))}` : ''}</div></div>
				<button id="sb-members" title="Members and invites">👥</button><button id="sb-leave" title="Leave the group">🚪</button></div>
			<div class="sb-msgs" id="sb-msgs">${msgs.length ? msgs.map((h) => (h.sys ? `<div class="sb-sys">${esc(textOf(h))}</div>`
				: `<div class="sb-b ${h.Sent ? 'me' : 'them'}${isAction(textOf(h)) ? ' sb-act' : ''}">${h.Sent ? '' : `<span class="sb-from">${esc(memberName(g, h.MemberNumber) || h.MemberName)}</span>`}${rich(textOf(h))}<em>${timeOf(h.Time)}</em></div>`)).join('')
				: '<div class="sb-empty">🫧 Say hi to the group!</div>'}</div>
			<div class="sb-compose">
				<textarea id="sb-text" maxlength="${LIMITS.text}" placeholder="Message ${esc(g.name)}…"></textarea>
				<button id="sb-send" title="Send (Enter)">➤</button>
			</div>`;
		const box = $('sb-msgs');
		if (!keepScroll || atBottom) box.scrollTop = box.scrollHeight;
		const ta = $('sb-text');
		ta.value = draft;
		$('sb-back').addEventListener('click', () => { thread = null; render(); });
		$('sb-members').addEventListener('click', () => { renderMembers.open = id; render(); });
		$('sb-leave').addEventListener('click', () => {
			if (renderGroupThread.confirm !== id) { renderGroupThread.confirm = id; notify('Press 🚪 again to leave'); setTimeout(() => { renderGroupThread.confirm = null; }, 3000); return; }
			leaveGroup(id);
			notify(`🚪 You left ${g.name}`);
			thread = null;
			render();
		});
		const send = () => {
			const text = clean(ta.value, LIMITS.text);
			if (!text) return;
			sendGroup(id, text);
			ta.value = '';
		};
		$('sb-send').addEventListener('click', send);
		ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
		if (!keepScroll || document.activeElement === document.body) ta.focus();
	}

	function friendRows(q) {
		const match = (name, n, room = '') => !q || name.toLowerCase().includes(q) || String(n).includes(q) || room.toLowerCase().includes(q);
		const on = friends.filter((f) => match(f.MemberName, f.MemberNumber, f.ChatRoomName || ''))
			.sort((a, b) => a.MemberName.localeCompare(b.MemberName))
			.map((f) => `<div class="sb-row" data-open="${f.MemberNumber}">${avatar(f.MemberNumber, f.MemberName)}
				<div class="sb-main"><div class="sb-name"><span class="sb-on"></span>${esc(f.MemberName)}${f.Type === 'Lover' ? ' 💞' : f.Type === 'Submissive' ? ' 🎀' : ''}${peers.has(f.MemberNumber) ? ' <span title="Has SlimeBeep">🫧</span>' : ''}</div>
				<div class="sb-sub">${esc(where(f))}${f.ChatRoomMemberCount ? ` · ${f.ChatRoomMemberCount}/${f.ChatRoomLimit || '?'}` : ''}</div></div>
				<div class="sb-side">#${f.MemberNumber}</div></div>`);
		// Everyone else on your friend list, greyed out: beeps only reach them once they're online.
		const onlineNums = new Set(friends.map((f) => f.MemberNumber));
		const all = Player.FriendNames && typeof Player.FriendNames.forEach === 'function' ? [...Player.FriendNames.entries()] : [];
		const off = all.filter(([n, name]) => isNum(n) && !onlineNums.has(n) && n !== Player.MemberNumber && match(String(name || ''), n))
			.sort((a, b) => String(a[1] || '').localeCompare(String(b[1] || '')))
			.map(([n, name]) => `<div class="sb-row offline" data-open="${n}">${avatar(n, name)}
				<div class="sb-main"><div class="sb-name"><span class="sb-off"></span>${esc(name || `#${n}`)}${peers.has(n) ? ' <span title="Has SlimeBeep">🫧</span>' : ''}</div>
				<div class="sb-sub">Offline</div></div><div class="sb-side">#${n}</div></div>`);
		return [...on, ...(off.length ? [`<div class="sb-hint" style="margin:8px 4px 2px">Offline (${off.length})</div>`, ...off] : [])].join('');
	}

	/** The room under a bubble: only when there is one, and only when it changed since that side's last beep. */
	function roomLine(b, msgs, i) {
		const room = typeof b.Message === 'string' && typeof b.ChatRoomName === 'string' ? b.ChatRoomName.trim() : '';
		if (!room) return '';
		const prev = msgs.slice(0, i).reverse().find((x) => x.Sent === b.Sent);
		if (prev && (prev.ChatRoomName || '').trim() === room) return '';
		return `<span class="sb-room">📍 ${b.Sent ? 'invited to' : 'in'} ${esc(room)}${b.Sent ? '' : ` <button class="sb-pill sb-joinroom" data-room="${esc(room)}">Join</button>`}</span>`;
	}

	/*
	 * Join the chat room a beep came from, the way the game's own chat search does: leave the room you're
	 * in (only when the game would let you walk out right now), then ask the server to join. The game
	 * itself takes you in when the server says yes, and its own messages say why when it doesn't.
	 */
	let joiningRoom = 0;
	async function joinRoom(name) {
		name = String(name || '').trim();
		if (!name || !loggedIn() || Date.now() - joiningRoom < 3000) return;
		if (myRoom() === name) return notify(`You're already in ${name}`);
		const inRoom = typeof ChatRoomData !== 'undefined' && ChatRoomData;
		if (inRoom) {
			if (typeof CurrentScreen !== 'undefined' && CurrentScreen !== 'ChatRoom') return notify('Go back to your room first, then join');
			if (typeof ChatRoomCanLeave === 'function' && !ChatRoomCanLeave()) return notify("You can't leave this room right now");
			if (typeof Player.IsSlow === 'function' && Player.IsSlow()) return notify("You're too slow to just walk out: leave the room first");
			if (typeof ChatRoomLeave !== 'function' || typeof CommonSetScreen !== 'function') return notify('⚠ The game changed: join from the room list');
		}
		joiningRoom = Date.now();
		try {
			if (inRoom) {
				ChatRoomLeave();
				CommonSetScreen('Online', 'ChatSearch');
			}
			notify(`📍 Joining ${name}…`);
			if (typeof ServerRoomJoin === 'function') {
				const r = await ServerRoomJoin(name);
				// A failure carries the server's answer (RoomFull, RoomLocked, CannotFindRoom…) as the error's name.
				if (r && r.error) {
					if (typeof ChatSearchSendToast === 'function') ChatSearchSendToast(r.error.name);
					notify(`⚠ Couldn't join ${name}${/^[A-Za-z]+$/.test(r.error.name || '') ? ` (${r.error.name.replace(/^Room|Error$/g, '').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()})` : ''}`);
				}
			} else if (typeof ServerSend === 'function') {
				ServerSend('ChatRoomJoin', { Name: name });
			}
		} catch (e) {
			warn(e, 'join room');
			notify(`⚠ Couldn't join ${name}`);
		}
	}

	function renderThread(keepScroll) {
		if (typeof thread === 'string') return renderGroupThread(keepScroll);
		const n = thread;
		const view = $('sb-view');
		const msgs = log().filter((b) => b.MemberNumber === n && !isReaction(b));
		// Opening the chat reads it, the same flag the game's own beep list uses.
		for (const b of msgs) markRead(b);
		const f = friends.find((x) => x.MemberNumber === n);
		const old = $('sb-msgs');
		const atBottom = !old || old.scrollHeight - old.scrollTop - old.clientHeight < 40;
		const draft = $('sb-text') ? $('sb-text').value : '';
		const room = myRoom();
		const pinOn = !!room && (renderThread.pin ?? opts.shareRoom);
		const waitingHere = waiting.filter((w) => w.n === n);
		const offline = isOffline(n);
		view.innerHTML = `
			<div class="sb-thead"><button id="sb-back" title="Back">‹</button>${avatar(n, nameOf(n))}
				<div class="sb-main"><div class="sb-name">${esc(nameOf(n))} <small style="font-weight:normal;color:#c08aaa">#${n}</small></div>
				<div class="sb-sub">${f ? '<span class="sb-on"></span>' : ''}${esc(where(f))}</div></div></div>
			<div class="sb-msgs" id="sb-msgs">${msgs.length ? msgs.map((b, i) => `<div class="sb-b ${b.Sent ? 'me' : 'them'}${isAction(textOf(b)) ? ' sb-act' : ''}">${rich(textOf(b))}` +
				`${roomLine(b, msgs, i)}<em>${timeOf(b.Time)}</em></div>`).join('')
				: (waitingHere.length ? '' : '<div class="sb-empty">🫧 Say hi!</div>')}${waitingHere.map((w) => `<div class="sb-b me sb-wait">${esc(w.text)}<em>⏳ sends when they're online · <a href="#" data-cancel="${esc(w.id)}">cancel</a></em></div>`).join('')}</div>
			<div class="sb-compose">
				<button class="pin ${pinOn ? 'on' : ''}" id="sb-pin" ${room ? '' : 'disabled'} title="${room ? `Let them join me: adds a button to join you in "${esc(room)}"` : "You're not in a chat room"}">📍</button>
				<textarea id="sb-text" maxlength="1000" placeholder="${offline ? `${esc(nameOf(n))} is offline: it'll wait for them…` : `Beep ${esc(nameOf(n))}…`}"></textarea>
				<button id="sb-send" title="Send (Enter)">➤</button>
			</div>`;
		const box = $('sb-msgs');
		if (!keepScroll || atBottom) box.scrollTop = box.scrollHeight;
		const ta = $('sb-text');
		ta.value = draft;
		$('sb-back').addEventListener('click', () => { thread = null; renderThread.pin = undefined; render(); });
		$('sb-pin').addEventListener('click', () => { renderThread.pin = !pinOn; render(true); });
		for (const b of view.querySelectorAll('.sb-joinroom')) b.addEventListener('click', (e) => { e.preventDefault(); joinRoom(b.dataset.room); });
		for (const a of view.querySelectorAll('[data-cancel]')) a.addEventListener('click', (e) => {
			e.preventDefault();
			waiting = waiting.filter((w) => w.id !== a.dataset.cancel);
			saveWaiting();
			render(true);
		});
		const send = () => {
			const text = ta.value.trim();
			if (!text) return;
			if (isOffline(n)) {
				queueBeep(n, text);
				ta.value = '';
				return render(true);
			}
			// Read now, not when the chat was drawn: a quick second Enter must not invite again.
			const invite = !!myRoom() && (renderThread.pin ?? opts.shareRoom);
			beep(n, text, invite);
			// An invite goes once; the next beeps in the chat are just beeps unless 📍 is pressed again.
			renderThread.pin = false;
			sync();
			notify(`✓ Beep sent to ${nameOf(n)}${invite ? ' 📍' : ''}`);
			ta.value = '';
			setTimeout(() => render(true), 50);
		};
		$('sb-send').addEventListener('click', send);
		ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
		if (!keepScroll || document.activeElement === document.body) ta.focus();
	}

	const isOffline = (n) => friendsKnown && isFriend(n) && !friends.some((f) => f.MemberNumber === n);
	/** A beep for an offline friend: kept until they're online. */
	function queueBeep(n, text) {
		if (waiting.length >= 100) return notify('⚠ Too many beeps waiting already');
		waiting.push({ id: newId(), n, text: text.slice(0, 1000), at: Date.now() });
		saveWaiting();
		notify(`⏳ ${nameOf(n)} is offline: it goes out when they're back`);
	}
	/** Sends every waiting beep whose friend is online now, a WaveBeep gap apart. */
	let sendingWaiting = false;
	async function sendWaiting() {
		if (sendingWaiting || !waiting.length || !loggedIn()) return;
		const ready = waiting.filter((w) => friends.some((f) => f.MemberNumber === w.n));
		if (!ready.length) return;
		sendingWaiting = true;
		try {
			for (const [i, w] of ready.entries()) {
				if (!waiting.includes(w)) continue; // cancelled meanwhile
				beep(w.n, w.text, false);
				waiting = waiting.filter((x) => x !== w);
				saveWaiting();
				if (i < ready.length - 1) await new Promise((r) => setTimeout(r, opts.gap * 1000));
			}
			sync();
			const names = [...new Set(ready.map((w) => nameOf(w.n)))];
			notify(`📨 Waiting beep${ready.length === 1 ? '' : 's'} sent to ${names.join(', ')}`);
			if (isOpen()) render(true);
		} finally { sendingWaiting = false; }
	}

	/** A short note that something happened, by the slime, and a bounce. */
	function notify(text) {
		const t = $('sb-toast'), s = $('sb-toggle');
		t.textContent = text;
		const r = isOpen() ? $('sb-panel').getBoundingClientRect() : s.getBoundingClientRect();
		t.classList.add('show');
		t.style.left = `${Math.max(8, Math.min(innerWidth - t.offsetWidth - 8, r.left + r.width / 2 - t.offsetWidth / 2))}px`;
		t.style.top = `${r.bottom + 8 + t.offsetHeight <= innerHeight ? r.bottom + 8 : Math.max(8, r.top - t.offsetHeight - 8)}px`;
		s.classList.remove('boing');
		void s.offsetWidth;
		s.classList.add('boing');
		clearTimeout(notify.timer);
		notify.timer = setTimeout(() => t.classList.remove('show'), 2200);
	}

	/** The game's own beep sender: same format, length limit and beep log as the friend list. */
	function beep(n, text, includeRoom) {
		try {
			if (typeof ServerSendBeepMessage === 'function') ServerSendBeepMessage(n, text, { includeRoom });
			else if (typeof ServerSend === 'function') ServerSend('AccountBeep', { MemberNumber: n, BeepType: '', IsSecret: !includeRoom, Message: text });
			else throw new Error('the game has no beep sender any more');
		} catch (e) { warn(e, 'beep'); notify('⚠ That beep could not be sent'); }
	}

	function groupHtml() {
		const room = myRoom();
		const picked = new Set(groupHtml.picked || opts.picked);
		const list = friends.slice().sort((a, b) => a.MemberName.localeCompare(b.MemberName)).map((f) =>
			`<label><input type="checkbox" value="${f.MemberNumber}" ${picked.has(f.MemberNumber) ? 'checked' : ''}>${avatar(f.MemberNumber, f.MemberName)}
			<span class="sb-main" style="margin-left:8px"><span class="sb-name">${esc(f.MemberName)}</span><span class="sb-sub" style="display:block">${esc(where(f))}</span></span></label>`).join('');
		return `<div class="sb-line" style="margin-top:2px"><b>🌊 WaveBeep</b></div><div class="sb-hint" style="margin:0 0 6px">One beep, sent to every friend you tick.</div>
			<textarea id="sb-gmsg" maxlength="1000" placeholder="Write your beep…">${esc(groupHtml.draft || '')}</textarea>
			<label title="Adds a button to your beep that takes them to the chat room you're in."><input type="checkbox" id="sb-groom" ${room ? '' : 'disabled'} ${room && (groupHtml.room ?? opts.shareRoom) ? 'checked' : ''}>
				<span>📍 Let them join me<span class="sb-hint" style="display:block">${room ? `They get a button to join you in "${esc(room)}".` : "You're not in a chat room, so there's nothing to join."}</span></span></label>
			<div class="sb-line"><b>Beep who?</b><span>${room && friends.some((f) => f.ChatRoomName === room) ? '<button class="sb-pill" id="sb-myroom" title="Only the friends in your room">📍 My room</button> ' : ''}<button class="sb-pill" id="sb-all">All</button> <button class="sb-pill" id="sb-none">None</button></span></div>
			${list || '<div class="sb-empty">🌙 None of your friends are online.</div>'}
			<div class="sb-line" style="position:sticky;bottom:-10px;background:#fff7fb;padding:6px 0"><span id="sb-gcount"></span><button class="sb-go" id="sb-gsend">Send 🌊</button></div>
			<div class="sb-hint" id="sb-gstatus"></div>`;
	}

	function wireGroup() {
		const boxes = () => [...$('sb-body').querySelectorAll('label input[type=checkbox]:not(#sb-groom)')];
		const chosen = () => boxes().filter((b) => b.checked).map((b) => Number(b.value));
		const count = () => {
			const n = chosen().length;
			groupHtml.picked = chosen();
			if (opts.remember) {
				// Friends who are offline now stay remembered for when they're back.
				const online = new Set(friends.map((f) => f.MemberNumber));
				opts.picked = [...new Set([...opts.picked.filter((m) => !online.has(m)), ...groupHtml.picked])];
				saveOpts();
			}
			$('sb-gcount').textContent = `${n} picked of ${friends.length} online`;
			$('sb-gsend').disabled = sending || n === 0;
		};
		for (const b of boxes()) b.addEventListener('change', count);
		$('sb-all').addEventListener('click', () => { for (const b of boxes()) b.checked = true; count(); });
		$('sb-none').addEventListener('click', () => { for (const b of boxes()) b.checked = false; count(); });
		// Only the friends in the same room as you.
		if ($('sb-myroom')) $('sb-myroom').addEventListener('click', () => {
			const here = new Set(friends.filter((f) => f.ChatRoomName && f.ChatRoomName === myRoom()).map((f) => f.MemberNumber));
			for (const b of boxes()) b.checked = here.has(Number(b.value));
			count();
		});
		$('sb-gmsg').addEventListener('input', (e) => { groupHtml.draft = e.target.value; });
		$('sb-groom').addEventListener('change', (e) => { groupHtml.room = e.target.checked; });
		$('sb-gsend').addEventListener('click', async () => {
			const msg = $('sb-gmsg').value.trim();
			const targets = chosen();
			const status = (t) => { const s = $('sb-gstatus'); if (s) s.textContent = t; };
			if (!msg) return status('Write a message first.');
			if (!targets.length || sending) return;
			sending = true;
			$('sb-gsend').disabled = true;
			const includeRoom = $('sb-groom').checked && !!myRoom();
			let done = 0;
			for (const n of targets) {
				beep(n, msg, includeRoom);
				done += 1;
				status(`🌊 Sending… ${done} / ${targets.length} (${nameOf(n)})`);
				if (done < targets.length) await new Promise((r) => setTimeout(r, opts.gap * 1000));
			}
			sending = false;
			groupHtml.draft = '';
			if ($('sb-gmsg')) $('sb-gmsg').value = '';
			status(`✨ Done: beeped ${done} friend${done === 1 ? '' : 's'}.`);
			notify(`✓ Beep sent to ${done === 1 ? nameOf(targets[0]) : `${done} friends`}`);
			if ($('sb-gsend')) count();
		});
		count();
	}

	/*
	 * SlimeBeep in the game's own Settings > Extensions, beside the other add-ons: the same options
	 * as the ⚙, shown over the settings screen. Registered through the game's API, so it is listed
	 * like any other extension and leaves the rest of the screen alone.
	 */
	/*
	 * SlimeBeep in the game's own Settings > Extensions, drawn the way the game draws its settings
	 * pages (and the other extensions theirs): a title, white checkboxes, buttons and the exit door,
	 * all on the game's canvas, so themes recolour it like the rest. Same options as the ⚙ tab.
	 */
	function registerSettings() {
		if (typeof PreferenceRegisterExtensionSetting !== 'function') return;
		if (typeof PreferenceExtensionsSettings === 'object' && PreferenceExtensionsSettings && PreferenceExtensionsSettings.SlimeBeep) return;
		const EXIT = [1815, 75, 90, 90];
		// Rows fit the 1000-high game screen with every option and button.
		const LEFT = 500, TOP = 190, ROW = 72;
		const boxes = [
			['night', 'Night mode (a night blue slime)', () => opts.night, (on) => setNight(on)],
			// Only with a theme add-on running (the owner: no toggle for something that isn't there).
			['themed', () => `Match my ${(themeSource() || {}).name || 'theme'} colours`, () => opts.themed, (on) => setThemed(on), () => !!themeSource()],
			['sound', 'Pop sound for new beeps', () => opts.sound, (on) => setOpt('sound', on)],
			['popups', 'A card by the slime for each new beep', () => opts.popups, (on) => setOpt('popups', on)],
			['desktop', 'Desktop notification when the game is in the background', () => opts.desktop, (on) => setDesktop(on)],
			['share', '"Let them join me" starts on', () => opts.shareRoom, (on) => setOpt('shareRoom', on)],
			['remember', 'Remember who I picked for WaveBeeps', () => opts.remember, (on) => { setOpt('remember', on); if (!on) setOpt('picked', []); }],
			['keep', 'Keep my beeps in this browser after I log out', () => opts.keep, (on) => setKeep(on)],
		];
		// The boxes on the page right now (some only show when they apply).
		const shown = () => boxes.filter((b) => !b[4] || b[4]());
		const gapY = () => TOP + shown().length * ROW;
		// Laid out again on every frame, since the list of boxes can change.
		const layout = () => {
			const g = gapY(), btnY = g + ROW;
			return { g, MINUS: [LEFT, g, 64, 64], PLUS: [LEFT + 80, g, 64, 64], RESET: [LEFT, btnY, 420, 64], CLEAR: [LEFT + 450, btnY, 420, 64],
				PIC: [LEFT, btnY + ROW, 420, 64], NOPIC: [LEFT + 450, btnY + ROW, 420, 64] };
		};
		const mouse = (r) => typeof MouseIn === 'function' && MouseIn(...r);
		PreferenceRegisterExtensionSetting({
			Identifier: 'SlimeBeep',
			ButtonText: 'SlimeBeep',
			Image: ICON,
			load: () => {
				// The ⚙ tab and this page show the same options; leave the panel on its chats.
				if (tab === 'options') { tab = 'chats'; if (isOpen()) render(); }
			},
			run: () => {
				try {
					DrawCharacter(Player, 50, 50, 0.9);
					MainCanvas.textAlign = 'left';
					DrawText(`- SlimeBeep Settings - v${VERSION}`, LEFT, 125, 'Black', 'Gray');
					const { g, MINUS, PLUS, RESET, CLEAR, PIC, NOPIC } = layout();
					shown().forEach(([, label, get], i) => DrawCheckbox(LEFT, TOP + i * ROW, 64, 64, typeof label === 'function' ? label() : label, !!get()));
					DrawButton(...MINUS, '-', 'White');
					DrawButton(...PLUS, '+', 'White');
					DrawText(`Wait ${opts.gap} seconds between WaveBeeps`, LEFT + 180, g + 33, 'Black', 'Gray');
					MainCanvas.textAlign = 'center';
					DrawButton(...RESET, 'Reset slime position', 'White');
					DrawButton(...CLEAR, `Clear kept beeps (${hist.length})`, 'White');
					DrawButton(...PIC, myPfp() ? 'Change profile picture' : 'Choose profile picture', 'White');
					drawMyPic(PIC[0] - 90, PIC[1], 64);
					if (myPfp()) DrawButton(...NOPIC, 'Remove profile picture', 'White');
					DrawButton(...EXIT, '', 'White', 'Icons/Exit.png');
				} catch (e) {
					// Drawing is the game's; never break its frame.
				} finally {
					if (typeof MainCanvas !== 'undefined' && MainCanvas) MainCanvas.textAlign = 'center';
				}
			},
			click: () => {
				try {
					if (mouse(EXIT)) { if (typeof PreferenceSubscreenExtensionsClear === 'function') PreferenceSubscreenExtensionsClear(); return; }
					const { MINUS, PLUS, RESET, CLEAR, PIC, NOPIC } = layout();
					shown().forEach(([, , get, set], i) => { if (mouse([LEFT, TOP + i * ROW, 64, 64])) set(!get()); });
					if (mouse(MINUS)) setOpt('gap', Math.max(1, opts.gap - 0.5));
					if (mouse(PLUS)) setOpt('gap', Math.min(10, opts.gap + 0.5));
					if (mouse(RESET)) { setOpt('pos', null); place(); }
					if (mouse(CLEAR)) clearKept();
					if (mouse(PIC)) pickPicture();
					if (myPfp() && mouse(NOPIC)) { setOpt('pfp', null); try { localStorage.removeItem(srcKey()); } catch (err) { /* fine */ } pushPicture(); }
				} catch (e) { warn(e); }
			},
			exit: () => true,
		});
	}

	/* The options, changed the same way from the ⚙ tab and from Settings > Extensions. */
	function setOpt(name, value) {
		opts[name] = value;
		saveOpts();
	}

	/** Desktop notifications: the browser asks once, and a "no" there turns this back off. */
	async function setDesktop(on) {
		setOpt('desktop', !!on);
		if (on && typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
			const answer = await Notification.requestPermission().catch(() => 'denied');
			if (answer !== 'granted') { setOpt('desktop', false); notify('The browser blocked notifications'); }
		}
		const box = $('sb-o-desktop');
		if (box) box.checked = opts.desktop;
	}

	function setKeep(on) {
		setOpt('keep', !!on);
		if (opts.keep) saveHistory();
		else try { localStorage.removeItem(histKey()); } catch (err) { /* nothing kept anyway */ }
	}

	/** Forget the kept beeps; this session's stay, as the game itself still has them. */
	function clearKept() {
		try { localStorage.removeItem(histKey()); } catch (err) { /* nothing kept anyway */ }
		hist = hist.filter((h) => live.has(h.k));
		histKeys.clear();
		for (const h of hist) histKeys.add(h.k);
		saveHistory();
		if (isOpen()) render();
	}

	/** 🌙 on or off: one class on the page, which only SlimeBeep's own styles look at. */
	/*
	 * The theme add-on that's running, if any: [id, name]. Themed puts --tmd-* on the page, BCNeko
	 * --bcn-* on the body. The first one found is used.
	 */
	const THEME_SOURCES = [
		['themed', 'Themed', () => getComputedStyle(document.documentElement).getPropertyValue('--tmd-main')],
		['bcneko', 'BCNeko', () => document.body && getComputedStyle(document.body).getPropertyValue('--bcn-panel')],
	];
	function themeSource() {
		for (const [id, name, probe] of THEME_SOURCES) {
			try { if (String(probe() || '').trim()) return { id, name }; } catch (e) { /* not this one */ }
		}
		return null;
	}
	/** A theme add-on's colours when asked for and one is there (checked again every few seconds: it may load later or stop). */
	function applyThemed() {
		const src = opts.themed ? themeSource() : null;
		const root = document.documentElement;
		root.classList.toggle('sb-themed', !!src);
		for (const [id] of THEME_SOURCES) root.classList.toggle(`sb-theme-${id}`, !!src && src.id === id);
		return src;
	}
	function setThemed(on) {
		setOpt('themed', !!on);
		applyThemed();
	}

	function setNight(on) {
		opts.night = !!on;
		saveOpts();
		document.documentElement.classList.toggle('sb-night', opts.night);
		const moon = $('sb-moon');
		if (moon) { moon.textContent = opts.night ? '☀️' : '🌙'; moon.title = opts.night ? 'Day mode' : 'Night mode'; }
		const box = $('sb-o-night');
		if (box) box.checked = opts.night;
	}

	/*
	 * 🐞 Bug reports. The player writes what went wrong; SlimeBeep adds what helps find it (its version,
	 * the game's, the browser, other mods, its own recent errors) and nothing about anyone else. It goes
	 * out how the player chooses: a GitHub issue, the clipboard, or a beep to SlimeQueenSamantha, which
	 * only arrives if she has them on her friend list (the game's beep rule).
	 */
	const OWNER = 255659; // SlimeQueenSamantha
	const ISSUES = 'https://github.com/Proudkiller0015/slimebeep/issues/new';
	function details(withNumber) {
		const mods = (() => {
			try {
				const sdk = window.bcModSdk;
				return sdk && typeof sdk.getModsInfo === 'function' ? sdk.getModsInfo().map((m) => `${m.name} ${m.version}`).join(', ') : '';
			} catch (e) { return ''; }
		})();
		const d = window.SlimeBeep && typeof window.SlimeBeep.debug === 'function' ? window.SlimeBeep.debug() : {};
		return [
			`SlimeBeep ${VERSION}`,
			`Game: ${typeof GameVersion === 'string' ? GameVersion : '?'}${typeof CurrentScreen === 'string' ? ` (screen: ${CurrentScreen})` : ''}`,
			`Browser: ${navigator.userAgent}`,
			withNumber && loggedIn() ? `Reported by: #${Player.MemberNumber}` : null,
			`Listening: ${d.listening ? 'yes' : 'no'}${d.catchAll ? ', catch-all' : ''}; groups: ${Object.keys(groups).length}; kept beeps: ${hist.length}`,
			mods ? `Other mods: ${mods}` : null,
			missing().length ? `Missing from the game: ${missing().map(([k]) => k).join(', ')}` : null,
			errors.length ? `Recent errors:\n${errors.map((x) => `- ${x}`).join('\n')}` : 'Recent errors: none',
		].filter(Boolean).join('\n');
	}
	function reportText() {
		const what = clean($('sb-bug-what').value, 1500);
		const how = clean($('sb-bug-how').value, 800);
		return { what, how, full: `What happened:\n${what || '(not filled in)'}\n\nWhat I was doing:\n${how || '(not filled in)'}\n\n---\n${details($('sb-bug-num').checked)}` };
	}

	function bugHtml() {
		const draft = bugHtml.draft || {};
		return `<div class="sb-line" style="margin-top:2px"><b>🐞 Report a bug</b></div>
			<div class="sb-hint" style="margin:0 0 6px">Tell SlimeQueenSamantha what went wrong. SlimeBeep adds its version and recent errors for you.</div>
			<textarea id="sb-bug-what" maxlength="1500" placeholder="What happened?">${esc(draft.what || '')}</textarea>
			<textarea id="sb-bug-how" maxlength="800" placeholder="What were you doing? (optional)" style="height:52px;margin-top:6px">${esc(draft.how || '')}</textarea>
			<label><input type="checkbox" id="sb-bug-num" ${draft.num === false ? '' : 'checked'}><span>Include my member number so she can beep me back</span></label>
			<details style="margin:6px 2px"><summary class="sb-hint" style="cursor:pointer">What gets added</summary><pre id="sb-bug-details" style="white-space:pre-wrap;font-size:11px;margin:4px 0 0">${esc(details(draft.num !== false))}</pre></details>
			<div class="sb-line" style="flex-wrap:wrap;justify-content:flex-start;gap:6px">
				<button class="sb-go" id="sb-bug-github" title="Opens a new bug report on GitHub, filled in (needs a GitHub account)">🐙 Open on GitHub</button>
				<button class="sb-pill" id="sb-bug-copy">📋 Copy</button>
				<button class="sb-pill" id="sb-bug-beep" title="Only arrives if SlimeQueenSamantha has you on her friend list">📨 Beep it to her</button>
			</div>
			<div class="sb-hint" id="sb-bug-status"></div>`;
	}

	function wireBug() {
		const keep = () => { bugHtml.draft = { what: $('sb-bug-what').value, how: $('sb-bug-how').value, num: $('sb-bug-num').checked }; };
		const status = (t) => { const x = $('sb-bug-status'); if (x) x.textContent = t; };
		for (const id of ['sb-bug-what', 'sb-bug-how']) $(id).addEventListener('input', keep);
		$('sb-bug-num').addEventListener('change', () => { keep(); $('sb-bug-details').textContent = details($('sb-bug-num').checked); });
		const ready = () => {
			const r = reportText();
			if (!r.what) { status('Write what happened first.'); $('sb-bug-what').focus(); return null; }
			return r;
		};
		$('sb-bug-github').addEventListener('click', () => {
			const r = ready();
			if (!r) return;
			const title = `Bug: ${r.what.split('\n')[0].slice(0, 70)}`;
			window.open(`${ISSUES}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(r.full)}`, '_blank', 'noopener');
			status('Opened on GitHub: check it and press "Create" there.');
		});
		$('sb-bug-copy').addEventListener('click', async () => {
			const r = ready();
			if (!r) return;
			try { await navigator.clipboard.writeText(r.full); status('📋 Copied. Paste it wherever you talk to SlimeQueenSamantha.'); }
			catch (e) { status('The browser would not copy it. Open "What gets added" and copy by hand.'); }
		});
		$('sb-bug-beep').addEventListener('click', () => {
			const r = ready();
			if (!r) return;
			if (!loggedIn()) return status('Log in first.');
			// One beep holds 1000 characters: the words first, then as much of the details as fits.
			const text = `🐞 SlimeBeep bug report\n${r.what}${r.how ? `\nDoing: ${r.how}` : ''}\n— ${details($('sb-bug-num').checked)}`.slice(0, 990);
			beep(OWNER, text, false);
			notify('🐞 Report beeped');
			status('Beeped to SlimeQueenSamantha. It only arrives if she has you on her friend list; if unsure, use GitHub or Copy too.');
		});
	}

	/* "Invite <them> to…": every group you can invite to, an Invite button each (opened by other add-ons too). */
	let inviteFor = null; // { n, results: { groupId: text } }
	function inviteForHtml() {
		if (!inviteFor) return '';
		const n = inviteFor.n;
		const name = nameOf(n);
		const list = Object.values(groups).filter((g) => canInvite(g, Player.MemberNumber));
		const rows = list.map((g) => {
			const res = inviteFor.results[g.id];
			const inside = isMember(g, n);
			return `<div class="sb-row" style="cursor:default;display:block"><div style="display:flex;align-items:center;gap:8px"><span class="sb-av sb-gav">👥</span>
				<div class="sb-main"><div class="sb-name">${esc(g.name)}</div><div class="sb-sub">${g.members.length} / ${LIMITS.members} members</div></div>
				${inside ? '<span class="sb-hint">Already in it</span>' : `<button class="sb-go" data-invite="${esc(g.id)}" ${res ? 'disabled' : ''}>Invite</button>`}</div>
				${res ? `<div class="sb-hint" style="margin-top:4px">${res}</div>` : ''}</div>`;
		}).join('');
		return `<div class="sb-line"><button class="sb-pill" id="sb-if-back">‹ Back</button><b>👥 Invite ${esc(name)}</b></div>
			<div class="sb-hint" style="margin:2px 0 6px">${isFriend(n) ? (peers.has(n) ? `${esc(name)} has SlimeBeep: they get an invite card.` : `${esc(name)} gets a beep with the code and where to get SlimeBeep.`) : `They get a code to paste in 👥 Groups, made for #${n} only.`}</div>
			${rows || '<div class="sb-empty">👥 No group chats you can invite to yet.</div>'}`;
	}
	function wireInviteFor() {
		$('sb-if-back').addEventListener('click', () => { inviteFor = null; tab = 'groups'; render(); });
		for (const b of $('sb-body').querySelectorAll('[data-invite]')) b.addEventListener('click', async () => {
			const id = b.dataset.invite;
			b.disabled = true;
			const r = await inviteToGroup(id, inviteFor.n);
			inviteFor.results[id] = r.ok ? (r.sent ? '📨 Invite sent!' : `Code: <code style="user-select:all">${esc(r.code)}</code> — give it to them (copied).`) : `⚠ ${esc(r.why)}`;
			if (r.ok && !r.sent) { try { await navigator.clipboard.writeText(r.code); } catch (e) { /* shown to copy by hand */ } }
			if (tab === 'invitefor') render(true);
		});
	}

	function optionsHtml() {
		return `<div class="sb-opts">
			<b style="display:block;margin:6px 2px">⚙ Options</b>
			<label style="display:flex;align-items:center;gap:8px">${avatar(Player.MemberNumber, myName())}<span style="flex:1">Profile picture<span class="sb-hint" style="display:block">SlimeBeep friends see it.</span></span>
				<button class="sb-pill" id="sb-o-pic">Choose</button>${myPfp() && loadSrc() ? '<button class="sb-pill" id="sb-o-fit">Adjust</button>' : ''}${myPfp() ? '<button class="sb-pill" id="sb-o-nopic">Remove</button>' : ''}</label>
			<label><input type="checkbox" id="sb-o-night" ${opts.night ? 'checked' : ''}>🌙 Night mode (a night blue slime)</label>
			<label><input type="checkbox" id="sb-o-sound" ${opts.sound ? 'checked' : ''}>Pop sound for new beeps</label>
			<label><input type="checkbox" id="sb-o-popups" ${opts.popups ? 'checked' : ''}>💌 A card by the slime for each new beep</label>
			<label><input type="checkbox" id="sb-o-desktop" ${opts.desktop ? 'checked' : ''}>🖥 Desktop notification when the game is in the background</label>
			<label><input type="checkbox" id="sb-o-keep" ${opts.keep ? 'checked' : ''}>🗂 Keep my beeps in this browser after I log out
				<span class="sb-hint" style="display:block">${hist.length} beeps kept. <button class="sb-pill" id="sb-o-clear">Clear them</button></span></label>
			<label><input type="checkbox" id="sb-o-share" ${opts.shareRoom ? 'checked' : ''}>📍 "Let them join me" starts on</label>
			<label><input type="checkbox" id="sb-o-remember" ${opts.remember ? 'checked' : ''}>Remember who I picked for WaveBeeps</label>
			<label>Wait <input type="number" id="sb-o-gap" min="1" max="10" step="0.5" value="${opts.gap}"> seconds between WaveBeeps</label>
			<label>Drag the slime to move it. <button class="sb-pill" id="sb-o-reset">Put it back</button></label>
			<div class="sb-hint" style="margin:10px 4px">SlimeBeep v${VERSION} updates itself: a reload always runs the newest version.</div>
		</div>`;
	}

	function wireOptions() {
		$('sb-o-pic').addEventListener('click', (e) => { e.preventDefault(); pickPicture(); });
		if ($('sb-o-fit')) $('sb-o-fit').addEventListener('click', (e) => { e.preventDefault(); const src = loadSrc(); if (src) openCropper(src); });
		if ($('sb-o-nopic')) $('sb-o-nopic').addEventListener('click', (e) => { e.preventDefault(); setOpt('pfp', null); try { localStorage.removeItem(srcKey()); } catch (err) { /* fine */ } pushPicture(); notify('Profile picture removed'); render(); });
		$('sb-o-night').addEventListener('change', (e) => setNight(e.target.checked));
		$('sb-o-sound').addEventListener('change', (e) => setOpt('sound', e.target.checked));
		$('sb-o-popups').addEventListener('change', (e) => setOpt('popups', e.target.checked));
		$('sb-o-desktop').addEventListener('change', (e) => setDesktop(e.target.checked));
		$('sb-o-keep').addEventListener('change', (e) => setKeep(e.target.checked));
		$('sb-o-clear').addEventListener('click', (e) => { e.preventDefault(); clearKept(); });
		$('sb-o-share').addEventListener('change', (e) => setOpt('shareRoom', e.target.checked));
		$('sb-o-remember').addEventListener('change', (e) => { setOpt('remember', e.target.checked); if (!opts.remember) setOpt('picked', []); });
		$('sb-o-gap').addEventListener('change', (e) => {
			setOpt('gap', Math.max(1, Math.min(10, Number(e.target.value) || DEFAULTS.gap)));
			e.target.value = opts.gap;
		});
		$('sb-o-reset').addEventListener('click', () => { setOpt('pos', null); place(); });
	}

	/*
	 * The installed loader fetches this file from raw.githubusercontent.com, which can hand out an old
	 * copy for a few minutes after an update. GitHub Pages (where FUSAM loads it) has the new one within
	 * a minute, so before starting, this copy asks Pages which version is current and, if that one is
	 * newer, runs it instead. Without an answer within 4 seconds, it just starts.
	 */
	const PAGES = 'https://proudkiller0015.github.io/slimebeep/slimebeep.js';
	const newer = (a, b) => {
		const x = a.split('.').map(Number), y = b.split('.').map(Number);
		for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0);
		return false;
	};
	function start() {
		try {
			build();
		} catch (e) {
			warn(e, 'could not start');
		}
	}
	if (window.SlimeBeepHopped) start();
	else {
		const ctl = typeof AbortController === 'function' ? new AbortController() : null;
		const timer = setTimeout(() => { if (ctl) ctl.abort(); }, 4000);
		fetch(`${PAGES}?t=${Date.now()}`, { cache: 'no-store', signal: ctl ? ctl.signal : undefined })
			.then((r) => (r.ok ? r.text() : ''))
			.then((code) => {
				clearTimeout(timer);
				const m = /const VERSION = '(\d+\.\d+\.\d+)'/.exec(code);
				if (!m || !newer(m[1], VERSION)) return start();
				// A newer SlimeBeep: it takes over from here (this one never builds anything).
				window.SlimeBeepHopped = true;
				delete window.SlimeBeep;
				const script = document.createElement('script');
				script.textContent = `${code}\n//# sourceURL=slimebeep.js`;
				document.head.appendChild(script);
				script.remove();
			})
			.catch(() => { clearTimeout(timer); start(); });
	}
})();

/**
 * SlimeBeep: a beep messenger for Bondage Club (chats, group chats, online friends, WaveBeep).
 *
 * The whole add-on is this file, served from GitHub Pages and loaded by FUSAM, the bookmarklet or
 * the slimebeep.user.js loader. Group chats and mailboxes use the relay in relay/.
 * Release with `node release.js <version>`.
 */
(function () {
	'use strict';
	/** URL this copy was loaded from, or '' when it was injected as text. Read by the start-up check. */
	const LOADED_FROM = (document.currentScript && document.currentScript.src) || '';

	const VERSION = '3.0.1';
	// Only one copy runs per page.
	if (window.SlimeBeep) {
		return;
	}
	window.SlimeBeep = { version: VERSION };

	/** The slime logo (toggle button, Extensions page), as a data URL. */
	const ICON =
		'data:image/png;base64,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';

	/** Default user options. The live values are in `opts`, saved in localStorage under KEY. */
	const DEFAULTS = {
		/** Toggle button position as window fractions {x, y}; null puts it bottom right. */
		pos: null,
		/** Seconds between beeps when a WaveBeep goes to several friends. */
		gap: 1.5,
		/** Whether 📍 (a join button for your room) starts switched on in a chat. */
		shareRoom: true,
		/** Whether WaveBeep keeps the ticked friends (`picked`) for next time. */
		remember: true,
		/** Member numbers ticked in WaveBeep. */
		picked: [],
		/** Chime for new messages. */
		sound: true,
		/** A card by the toggle for each new message. */
		popups: true,
		/** A system notification for new messages while the game tab is hidden. */
		desktop: false,
		/** Save chat history per account (see `hist`). */
		keep: true,
		/** Ids of news.json items already shown as cards. */
		seenNews: null,
		/** Last version that posted its update note in the room chat. */
		lastVersion: null,
		/** Night colours. */
		night: false,
		/** Follow a theme add-on's colours (Themed, BCNeko). */
		themed: false,
		/** Emoji for the picker's 🕘 tab, newest first. */
		recentEmoji: [],
		/** Chats that make no sound: 'n:<member number>' or 'g:<group id>'. */
		muted: [],
	};
	/** Release notes, shown as cards and in update notes. */
	const NEWS = 'https://proudkiller0015.github.io/slimebeep/news.json';
	/** Most entries kept in `hist`. */
	const KEEP_MAX = 2000;
	/** localStorage key of `opts` (shared by every account in this browser). */
	const KEY = 'slimebeep.options';
	const opts = (() => {
		try {
			return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
		} catch (e) {
			return { ...DEFAULTS };
		}
	})();
	const saveOpts = () => {
		try {
			localStorage.setItem(KEY, JSON.stringify(opts));
		} catch (e) {
			/* private window: options last this visit */
		}
	};

	/**
	 * Online friends, from the last OnlineFriends query.
	 * @type {{ MemberNumber: number, MemberName: string, ChatRoomName?: string, ChatRoomSpace?: string, Private?: boolean, Type?: string }[]}
	 */
	let friends = [];
	/** Open panel tab: 'chats', 'groups', 'friends', 'wave', 'bug', 'options', 'newgc' or 'invitefor'. */
	let tab = 'chats';
	/** Open chat: a member number, 'g:<group id>', or null for the lists. */
	let thread = null;
	/** Search box text on the list tabs. */
	let search = '';
	/** True while a WaveBeep is going out. */
	let sending = false;

	/**
	 * Every message shown in chats: beeps copied from the game's FriendListBeepLog (emptied at each
	 * login), group messages and mailbox beeps, oldest first. Each entry has a unique key `k`.
	 * Saved per account under histKey() when opts.keep is on.
	 */
	let hist = [];
	/** Member number `hist` was loaded for. */
	let histOwner = null;
	/** Keys of the entries in `hist`. */
	const histKeys = new Set();
	/** Key -> the game's own beep object, so opening a chat can set its Read flag. */
	const live = new Map();
	const histKey = () => `slimebeep.history.${Player.MemberNumber}`;

	/** BeepType of the hidden beeps SlimeBeep friends exchange (see onHidden). */
	const PROTO = 'SlimeBeep';
	/** The relay (group chats and mailboxes). */
	const RELAY = 'wss://slimebeep-relay.slimebeep-relay.workers.dev';
	/** RELAY, or a local relay set in localStorage 'slimebeep.relay' (the tests use this). */
	const relayUrl = () => {
		try {
			const local = localStorage.getItem('slimebeep.relay');
			return local && /^ws:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(local) ? local : RELAY;
		} catch (e) {
			return RELAY;
		}
	};
	/** Limits (the first four match the relay's). */
	const LIMITS = {
		/** Longest group or member name. */
		name: 40,
		/** Longest group message. */
		text: 500,
		/** Most members in a group. */
		members: 40,
		/** Most admins in a group. */
		admins: 10,
		/** Most groups you can be in. */
		groups: 30,
		/** Hidden beeps accepted from one friend per minute. */
		perMinute: 60,
	};
	/**
	 * Groups you are in, by id: { id, name, owner, admins, open, members: [{ n, name, kf }],
	 * online, last (newest message id seen), picv (your picture version sent there), pic }.
	 */
	let groups = {};
	/** Friends known to have SlimeBeep. */
	let peers = new Set();
	/** Friend -> first 16 chars of their public key, as their own SlimeBeep sent it. */
	let peerKeys = {};
	/** Group invites from friends not joined yet: [{ code, name, from, fromName, at }]. */
	let invitations = [];
	const gcKey = () => `slimebeep.gc2.${Player.MemberNumber}`;
	/**
	 * Beeps to offline friends not delivered yet, saved per account: [{ id, n, text, at }].
	 * mailWaiting leaves them in the friend's mailbox; otherwise sendWaiting sends them when the friend is online.
	 */
	let waiting = [];
	/** Whether an OnlineFriends answer has arrived, so `friends` can be trusted. */
	let friendsKnown = false;
	const waitKey = () => `slimebeep.waiting.${Player.MemberNumber}`;
	const saveWaiting = () => {
		try {
			localStorage.setItem(waitKey(), JSON.stringify(waiting));
		} catch (e) {
			/* this visit only */
		}
	};
	/** A group invite code: SB-<group id>-<invite secret>. */
	const CODE_RE = /^SB-([a-z0-9]{8,24})-([A-Z2-9]{10})$/;
	const isId = (x) => typeof x === 'string' && /^[a-z0-9]{8,24}$/.test(x);
	const isNum = (n) => Number.isInteger(n) && n > 0 && n < 1e9;
	/** A random id (8-16 lowercase letters and digits). */
	const newId = () => {
		const a = new Uint32Array(3);
		crypto.getRandomValues(a);
		return [...a]
			.map((x) => x.toString(36))
			.join('')
			.slice(0, 16)
			.padEnd(8, '0');
	};
	/** Text from outside, made safe to keep: control characters removed, trimmed, cut to `max`. */
	const clean = (x, max) =>
		typeof x === 'string'
			? x
					// eslint-disable-next-line no-control-regex -- removing control characters is the point
					.replace(/[\u0000-\u0008\u000b-\u001f\u007f\uf124]/g, '')
					.trim()
					.slice(0, max)
			: '';
	const isFriend = (n) =>
		!!(Player.FriendNames && typeof Player.FriendNames.has === 'function' && Player.FriendNames.has(n)) ||
		friends.some((f) => f.MemberNumber === n);
	const myName = () => clean(Player.Nickname || Player.Name, LIMITS.name) || `#${Player.MemberNumber}`;
	const isAdmin = (g, n) => !!g && g.admins.includes(n);
	const isMember = (g, n) => !!g && g.members.some((m) => m.n === n);
	const canInvite = (g, n) => isMember(g, n) && (g.open || isAdmin(g, n));
	const memberName = (g, n) => {
		if (n === Player.MemberNumber) {
			return 'You';
		}
		const m = g && g.members.find((x) => x.n === n);
		return (m && m.name) || nameOf(n);
	};

	/** Loads groups, peers, peer keys, invitations and waiting beeps for the logged-in account. */
	function loadGC() {
		for (const c of Object.values(conns)) {
			c.dead = true;
			try {
				if (c.ws) {
					c.ws.close();
				}
			} catch (e) {
				/* gone */
			}
		}
		for (const k of Object.keys(conns)) {
			delete conns[k];
		}
		groups = {};
		waiting = [];
		try {
			const w = JSON.parse(localStorage.getItem(waitKey()) || '[]');
			if (Array.isArray(w)) {
				waiting = w
					.filter((x) => x && isId(x.id) && isNum(x.n) && typeof x.text === 'string')
					.map((x) => ({ id: x.id, n: x.n, text: x.text.slice(0, 1000), at: Number(x.at) || Date.now() }))
					.slice(0, 100);
			}
		} catch (e) {
			/* none */
		}
		peers = new Set();
		peerKeys = {};
		invitations = [];
		relayPics = {};
		try {
			const saved = JSON.parse(localStorage.getItem(gcKey()) || '{}');
			for (const g of Object.values(saved.groups || {})) {
				if (!g || !isId(g.id) || !Array.isArray(g.members)) {
					continue;
				}
				groups[g.id] = {
					id: g.id,
					name: clean(g.name, LIMITS.name) || 'Group chat',
					owner: isNum(g.owner) ? g.owner : 0,
					admins: Array.isArray(g.admins) ? g.admins.filter(isNum) : [],
					open: g.open === true,
					members: g.members
						.filter((m) => m && isNum(m.n))
						.map((m) => ({ n: m.n, name: clean(m.name, LIMITS.name), kf: typeof m.kf === 'string' ? m.kf.slice(0, 16) : '' })),
					last: Number.isInteger(g.last) ? g.last : 0,
					picv: typeof g.picv === 'string' ? g.picv : undefined,
					pic: typeof g.pic === 'string' && g.pic.length <= PFP_MAX && PFP_RE.test(g.pic) ? g.pic : undefined,
				};
			}
			for (const n of saved.peers || []) {
				if (isNum(n)) {
					peers.add(n);
				}
			}
			for (const [k, v] of Object.entries(saved.peerKeys || {})) {
				if (isNum(Number(k)) && typeof v === 'string') {
					peerKeys[Number(k)] = v.slice(0, 16);
				}
			}
			for (const i of saved.invitations || []) {
				if (i && CODE_RE.test(i.code) && isNum(i.from)) {
					invitations.push({
						code: i.code,
						name: clean(i.name, LIMITS.name),
						from: i.from,
						fromName: clean(i.fromName, LIMITS.name),
						at: i.at,
					});
				}
			}
			// Peers saved under the older storage key.
			const old = JSON.parse(localStorage.getItem(`slimebeep.gc.${Player.MemberNumber}`) || '{}');
			for (const n of old.peers || []) {
				if (isNum(n)) {
					peers.add(n);
				}
			}
		} catch (e) {
			/* unreadable: start fresh */
		}
	}
	/** Saves groups, peers, peer keys and invitations for the logged-in account. */
	function saveGC() {
		try {
			localStorage.setItem(gcKey(), JSON.stringify({ groups, peers: [...peers], peerKeys, invitations: invitations.slice(-20) }));
		} catch (e) {
			/* the browser won't keep it */
		}
	}
	/** The `hist` key of a game beep: its Id, or its sender, time, direction and start of text. */
	const keyOf = (b) =>
		b.Id ? `id:${b.Id}` : `${b.MemberNumber}|${new Date(b.Time).getTime()}|${b.Sent ? 1 : 0}|${String(b.Message || '').slice(0, 40)}`;

	const $ = (id) => document.getElementById(id);

	/**
	 * Game globals SlimeBeep uses: [name, typeof check, what stops working without it]. Shown by the
	 * 🐞 report and a one-time card when missing; .github/workflows/bc-check.yml checks the live game daily.
	 */
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
	const missing = () =>
		NEEDS.filter(([, t]) => {
			try {
				return t() === 'undefined';
			} catch (e) {
				return true;
			}
		});
	/** The last 10 caught errors, for the 🐞 report. */
	const errors = [];
	/** Logs a caught error to the console and to `errors`. */
	function warn(e, where = '') {
		try {
			const msg = `${where ? `${where}: ` : ''}${(e && e.message) || String(e)}`.slice(0, 200);
			const at =
				e && e.stack
					? String(e.stack)
							.split('\n')
							.find((l) => /slimebeep/i.test(l)) || ''
					: '';
			errors.push(`${new Date().toISOString().slice(11, 19)} ${msg}${at ? ` (${at.trim().slice(0, 120)})` : ''}`);
			if (errors.length > 10) {
				errors.shift();
			}
			console.warn('[SlimeBeep]', where, e);
		} catch (x) {
			/* ignore */
		}
	}
	/** Text escaped for HTML (content and quoted attributes). */
	const esc = (t) =>
		String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
	/** HTML that can be inserted as is: built by `html`, or markup made from escaped text and marked with trustedHtml. */
	class SafeHtml {
		/** @param {string} value */
		constructor(value) {
			this.value = value;
		}
		toString() {
			return this.value;
		}
	}
	/** One value inserted into `html`: SafeHtml as is, arrays one after another, null/undefined/false as nothing, the rest escaped. */
	const htmlPart = (v) => {
		if (v instanceof SafeHtml) {
			return v.value;
		}
		if (Array.isArray(v)) {
			return v.map(htmlPart).join('');
		}
		if (v === null || v === undefined || v === false) {
			return '';
		}
		return esc(v);
	};
	/** Tag for HTML templates: every inserted value is escaped unless it is SafeHtml, so text can never become markup. */
	const html = (strings, ...values) =>
		new SafeHtml(strings.reduce((out, s, i) => out + s + (i < values.length ? htmlPart(values[i]) : ''), ''));
	/** Marks markup assembled from already-escaped text as safe. Used only by rich(). */
	const trustedHtml = (s) => new SafeHtml(s);
	const loggedIn = () =>
		typeof ServerSocket !== 'undefined' && ServerSocket && typeof Player !== 'undefined' && Player && Player.MemberNumber != null;
	/** Name of the chat room you are in, or null. */
	const myRoom = () => (typeof ChatRoomData !== 'undefined' && ChatRoomData && ChatRoomData.Name) || null;
	const gameLog = () => (typeof FriendListBeepLog !== 'undefined' && Array.isArray(FriendListBeepLog) ? FriendListBeepLog : []);
	const log = () => hist;

	/** Loads `hist` (and the group state) for the logged-in account. */
	function loadHistory() {
		hist = [];
		histKeys.clear();
		live.clear();
		histOwner = Player.MemberNumber;
		loadGC();
		if (!opts.keep) {
			return;
		}
		try {
			const saved = JSON.parse(localStorage.getItem(histKey()) || '[]');
			if (Array.isArray(saved)) {
				for (const h of saved) {
					if (h && h.k && !histKeys.has(h.k) && (h.group ? !!groups[h.group] : !isSignal(h.Message))) {
						hist.push(h);
						histKeys.add(h.k);
					}
				}
			}
		} catch (e) {
			/* unreadable: start fresh */
		}
	}

	/** Saves `hist` when opts.keep is on; if storage is full, drops the older half. */
	function saveHistory() {
		if (!opts.keep) {
			return;
		}
		try {
			localStorage.setItem(histKey(), JSON.stringify(hist.slice(-KEEP_MAX)));
		} catch (e) {
			hist = hist.slice(-Math.floor(KEEP_MAX / 2));
			try {
				localStorage.setItem(histKey(), JSON.stringify(hist));
			} catch (e2) {
				/* the browser won't keep it */
			}
		}
	}

	/**
	 * Copies beeps from the game's log into `hist`.
	 * @returns {object[]} the received beeps added this time (no reactions)
	 */
	function sync() {
		if (!loggedIn()) {
			return [];
		}
		if (histOwner !== Player.MemberNumber) {
			loadHistory();
		}
		const added = [];
		for (const b of gameLog()) {
			if (!b || typeof b !== 'object' || b.MemberNumber == null) {
				continue;
			}
			const k = keyOf(b);
			if (live.has(k)) {
				continue;
			}
			live.set(k, b);
			if (histKeys.has(k) || isSignal(b.Message)) {
				continue;
			}
			const h = {
				k,
				MemberNumber: b.MemberNumber,
				MemberName: b.MemberName,
				Sent: !!b.Sent,
				Time: new Date(b.Time).getTime() || Date.now(),
				Message: b.Message,
				ChatRoomName: b.ChatRoomName,
			};
			hist.push(h);
			histKeys.add(k);
			added.push(h);
		}
		if (added.length) {
			hist.sort((a, b) => a.Time - b.Time);
			if (hist.length > KEEP_MAX) {
				for (const h of hist.splice(0, hist.length - KEEP_MAX)) {
					histKeys.delete(h.k);
				}
			}
			saveHistory();
		}
		return added.filter((h) => !h.Sent && !isReaction(h));
	}
	/** Character after which the game appends a beep's settings (JSON: name colour, message type). */
	const MARK = '';
	/**
	 * Splits a beep's message into its text and the settings the game appended after MARK.
	 * @returns {{ text: string, meta: object|null }}
	 */
	function parseBeep(msg) {
		if (typeof msg !== 'string') {
			return { text: '', meta: null };
		}
		let text = msg,
			raw = null;
		const i = msg.indexOf(MARK);
		if (i >= 0) {
			text = msg.slice(0, i);
			raw = msg.slice(msg.lastIndexOf(MARK) + 1);
		} else {
			// MARK stripped by another add-on: a last line holding the settings object.
			const m = /\n\s*(\{"messageType"[^\n]*\})\s*$/.exec(msg);
			if (m) {
				text = msg.slice(0, m.index);
				raw = m[1];
			}
		}
		let meta = null;
		if (raw) {
			try {
				const x = JSON.parse(raw);
				if (x && typeof x === 'object' && !Array.isArray(x)) {
					meta = x;
				}
			} catch (e) {
				/* not settings */
			}
		}
		return { text: text.trimEnd(), meta };
	}
	/**
	 * Whether a beep is another add-on's data rather than a message (never shown): a JSON object or
	 * array, optionally after a short tag ("KIKILINK/1 {...}"), or, with `typed` (the beep had its own
	 * BeepType), a CamelCase word like "ReqRoom".
	 */
	function isSignal(msg, typed = false) {
		if (typeof msg !== 'string') {
			return false;
		}
		const t = parseBeep(msg).text.trim();
		if (!t) {
			return false;
		}
		if (typed && /^[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]*)+$/.test(t)) {
			return true;
		}
		// It has to parse into a non-empty object (or array after a tag).
		const m = /^([^\s{[]{0,40})\s*([[{][\s\S]*[\]}])$/.exec(t);
		if (!m) {
			return false;
		}
		try {
			const x = JSON.parse(m[2]);
			if (Array.isArray(x)) {
				return m[1].length > 0 && x.length > 0;
			}
			return !!x && typeof x === 'object' && Object.keys(x).length > 0;
		} catch (e) {
			return false;
		}
	}
	/** What a `hist` entry shows as its text. */
	const textOf = (entry) => {
		if (entry.group) {
			return entry.sys === 'left' ? `${entry.MemberName} left the group` : entry.text;
		}
		if (typeof entry.Message !== 'string') {
			return entry.ChatRoomName ? `📍 ${entry.ChatRoomName}` : '🔔 Beep!';
		}
		return parseBeep(entry.Message).text || '🔔 Beep!';
	};
	/** Whether a beep is a reaction (the game's messageType 'Reaction'); those are not listed. */
	const isReaction = (entry) => {
		const meta = typeof entry.Message === 'string' ? parseBeep(entry.Message).meta : null;
		return !!meta && meta.messageType === 'Reaction';
	};
	/** Whether a received entry is unread: the game's Read flag when the game has the beep, else `h.unread`. */
	const unread = (h) => {
		if (h.Sent || isReaction(h)) {
			return false;
		}
		const b = live.get(h.k);
		return b ? b.Read === false : !!h.unread;
	};
	/** Marks an entry read, in the game's log too. */
	const markRead = (h) => {
		const b = live.get(h.k);
		if (b && b.Read === false) {
			b.Read = true;
		}
		if (h.unread) {
			h.unread = false;
			saveHistory();
		}
	};
	/** A member's name: from the online friends, the friend list, or the last beep they sent. */
	const nameOf = (n) => {
		const f = friends.find((x) => x.MemberNumber === n);
		if (f) {
			return f.MemberName;
		}
		const known = typeof Player !== 'undefined' && Player && Player.FriendNames && Player.FriendNames.get(n);
		if (known) {
			return known;
		}
		const b = [...log()].reverse().find((x) => x.MemberNumber === n && !x.Sent);
		return b ? b.MemberName : `#${n}`;
	};
	/** Whether a message is only an *action* (it gets the sb-act bubble). */
	const isAction = (text) => /^\*{1,2}[^*\n]+\*{1,2}$/.test(String(text).trim());
	/** Group invite codes inside a text. */
	const CODE_IN = /SB-[a-z0-9]{8,24}-[A-Z2-9]{10}/g;
	/** A message as HTML: escaped, with *actions* in italics, clickable links (new tab) and a Join button after group codes. */
	const rich = (text) =>
		trustedHtml(
			esc(text)
				.replace(/\*{1,2}([^*\n]{1,300}?)\*{1,2}/g, '<i class="sb-emote">*$1*</i>')
				.replace(/\bhttps?:\/\/[^\s<>"']+/g, (url) => {
					const tail = (/(?:[.,!?:;)\]]|&#39;|&quot;)+$/.exec(url) || [''])[0];
					const link = url.slice(0, url.length - tail.length);
					return `<a class="sb-link" href="${link}" target="_blank" rel="noopener noreferrer nofollow">${link}</a>${tail}`;
				})
				.replace(
					CODE_IN,
					(code) =>
						`${code} <button class="sb-pill sb-joincode" data-code="${code}">${groups[CODE_RE.exec(code)[1]] ? 'Open' : 'Join'}</button>`,
				),
		);
	/** A time as hh:mm today, or as a date. */
	const timeOf = (t) => {
		const d = new Date(t);
		if (isNaN(d)) {
			return '';
		}
		const today = new Date().toDateString() === d.toDateString();
		return today
			? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
			: d.toLocaleDateString([], { day: 'numeric', month: 'short' });
	};
	/** Hue of a member's letter avatar. */
	const hue = (n) => (Number(n) * 137) % 360;
	/** A profile picture: only image data URLs are accepted (never a web address). */
	const PFP_RE = /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/]+=*$/;
	/** Longest picture data URL accepted (a 128 px picture, smaller if needed). */
	const PFP_MAX = 12000;
	/** Characters of picture per hidden beep. */
	const PFP_CHUNK = 900;
	/** Friends' pictures received by hidden beeps: member number -> { v: version id, data }. Lazy, see loadPfps. */
	let pfps = null;
	/** `pfps`, loaded from localStorage on first use. */
	function loadPfps() {
		if (pfps) {
			return pfps;
		}
		pfps = {};
		try {
			const saved = JSON.parse(localStorage.getItem('slimebeep.pfps') || '{}');
			for (const [k, x] of Object.entries(saved)) {
				if (isNum(Number(k)) && x && isId(x.v) && typeof x.data === 'string' && x.data.length <= PFP_MAX && PFP_RE.test(x.data)) {
					pfps[Number(k)] = { v: x.v, data: x.data };
				}
			}
		} catch (e) {
			/* unreadable: none */
		}
		return pfps;
	}
	/** Saves `pfps`, keeping the last 300. */
	function savePfps() {
		const keys = Object.keys(pfps);
		for (const k of keys.slice(0, Math.max(0, keys.length - 300))) {
			delete pfps[k];
		}
		try {
			localStorage.setItem('slimebeep.pfps', JSON.stringify(pfps));
		} catch (e) {
			/* the browser won't keep it */
		}
	}
	/** Your own picture { v, data }, or null. */
	const myPfp = () => (opts.pfp && isId(opts.pfp.v) && typeof opts.pfp.data === 'string' && PFP_RE.test(opts.pfp.data) ? opts.pfp : null);
	/** A member's picture: yours, a friend's from `pfps`, or one a group shared (`relayPics`). */
	const pfpOf = (n) =>
		(loggedIn() && n === Player.MemberNumber ? myPfp() : loadPfps()[n] || (relayPics[n] ? { data: relayPics[n] } : null)) || null;
	/** A group's avatar HTML: its picture or 👥. */
	const groupAv = (g) => (g.pic ? html`<img class="sb-av sb-pic" src="${g.pic}" alt="">` : html`<span class="sb-av sb-gav">👥</span>`);
	/** The slime logo as a card icon. */
	const logoIcon = () => html`<img src="${ICON}" style="width:34px;height:34px;border-radius:50%;flex:none" alt="">`;
	/** A member's avatar HTML: their picture or their initials. */
	const avatar = (n, name) => {
		const pic = pfpOf(n);
		if (pic) {
			return html`<img class="sb-av sb-pic" src="${pic.data}" alt="">`;
		}
		const initials = String(name || '?')
			.trim()
			.slice(0, 2);
		return html`<span class="sb-av" style="background:hsl(${hue(n)} 85% 80%)">${initials}</span>`;
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
		.sb-link { color: inherit; text-decoration: underline; word-break: break-all; }
		.sb-joincode { margin-left: 2px; padding: 1px 8px !important; font-size: 11px !important; }
		.sb-bcjoin { margin-left: 6px; padding: 1px 8px; border: 0; border-radius: 10px; background: #ff7ac0; color: #fff; font: bold 12px sans-serif; cursor: pointer; }
		.sb-bcjoin:hover { background: #e85aa6; }
		.sb-joinroom { margin-left: 4px; padding: 1px 8px !important; font-size: 11px !important; }
		#sb-me { display: flex; cursor: pointer; }
		img.sb-pic { cursor: zoom-in; }
		#sb-zoom { position: absolute; inset: 0; z-index: 5; background: #0008; backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; cursor: zoom-out; }
		#sb-zoom img { width: 220px; height: 220px; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 10px 40px #000a; background: #fff; }
		#sb-me .sb-av { width: 28px; height: 28px; border: 2px solid #fff; font-size: 11px; }
		#sb-crop, #sb-ask { position: absolute; inset: 0; z-index: 5; background: #fff8; backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; font-family: inherit; }
		#sb-crop .sb-crop-card, #sb-ask .sb-crop-card { background: #fff; color: #5a2a48; border-radius: 18px; padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 10px; box-shadow: 0 10px 40px #0008; max-width: calc(100% - 24px); }
		#sb-crop .sb-crop-ring { border-radius: 50%; overflow: hidden; border: 3px solid #ff7ac0; background: repeating-conic-gradient(#eee 0 25%, #fff 0 50%) 0 0 / 16px 16px; touch-action: none; }
		/* The game styles every canvas as its full-screen one (absolute, 100% wide); not this one. */
		#sb-crop canvas { display: block; cursor: grab; position: static; inset: auto; margin: 0; padding: 0; width: 200px !important; height: 200px !important; max-width: none; }
		#sb-crop canvas:active { cursor: grabbing; }
		#sb-crop input[type=range] { width: 200px; accent-color: #ff4fa3; }
		#sb-ask { align-items: flex-start; padding-top: 70px; }
		#sb-ask .sb-warn { background: #ffe1e1; color: #b00020; border: 2px solid #e5303f; border-radius: 12px; padding: 10px 12px; font-weight: 700; font-size: 13px; line-height: 1.35; text-align: center; }
		#sb-ask [data-act=quit], #sb-ask .sb-danger { background: #e5303f; }
		#sb-crop .sb-crop-btns, #sb-ask .sb-crop-btns { display: flex; gap: 8px; }
		#sb-crop .sb-crop-card { position: relative; }
		#sb-crop .sb-crop-x { position: absolute; top: 6px; right: 6px; width: 26px; height: 26px; border-radius: 50%; border: none; background: #ffe3f1; color: #c2387f; cursor: pointer; }
		.sb-b.sb-act { font-style: italic; background: transparent !important; border: 1px dashed currentColor !important; color: inherit; opacity: .85; }
		.sb-b.sb-wait { opacity: .7; border: 2px dashed #ffb3d9; }
		.sb-b.sb-wait a { color: inherit; text-decoration: underline; }
		#sb-emoji { position: absolute; left: 8px; right: 8px; bottom: 60px; z-index: 4; height: 210px; display: flex; flex-direction: column;
			background: #fff; border: 2px solid #ffd1e8; border-radius: 14px; box-shadow: 0 6px 20px #ff4fa333; overflow: hidden; }
		.sb-emo-tabs { display: flex; gap: 2px; padding: 4px; background: #ffe6f3; }
		.sb-emo-tabs button { border: none; background: transparent; border-radius: 8px; font-size: 17px; width: 34px; height: 30px; cursor: pointer; }
		.sb-emo-tabs button.on { background: #fff; box-shadow: 0 1px 4px #ff4fa344; }
		.sb-emo-tabs button[data-eclose] { margin-left: auto; font-size: 13px; color: #c08aaa; }
		.sb-emo-grid { flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(34px, 1fr)); padding: 4px; }
		.sb-emo-grid button { border: none; background: transparent; font-size: 21px; height: 36px; border-radius: 8px; cursor: pointer; }
		.sb-emo-grid button:hover { background: #ffe6f3; }
		html.sb-night #sb-emoji { background: #1a2142; border-color: #2f3b75; }
		html.sb-night .sb-emo-tabs { background: #1c2450; }
		html.sb-night .sb-emo-tabs button.on, html.sb-night .sb-emo-grid button:hover { background: #253064; }
		html.sb-themed #sb-emoji { background: var(--sb-t-main); border-color: var(--sb-t-element-hover); }
		html.sb-themed .sb-emo-tabs { background: var(--sb-t-element-disabled); }
		html.sb-themed .sb-emo-tabs button.on, html.sb-themed .sb-emo-grid button:hover { background: var(--sb-t-element); }
		.sb-cmd { display: flex; flex-direction: column; gap: 1px; font-size: 12px; padding: 4px 6px; border-radius: 8px; background: #fff3f9; text-align: left; }
		.sb-cmd code { font-weight: 700; color: #c2387f; }
		html.sb-night .sb-cmd { background: #1d2550; }
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
		.sb-thead > button#sb-mute { flex: none; font-size: 13px; }
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
		/* Night mode (html.sb-night): navy colours and a blue slime. */
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
		/* Theme matching (html.sb-themed): a theme add-on's variables mapped onto --sb-t-*; after night mode so it wins. */
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
		#sb-quit { font-size: 13px; }
		.sb-opts input[type=number] { width: 54px; border: 1px solid #ffb3d9; border-radius: 8px; padding: 2px 4px; font: inherit; }
	`;

	/** Creates the toggle, panel, toast and card stack, wires them up and starts the 1 s tick. */
	function build() {
		// Registered with the mod SDK for its mod list only; no game function is hooked.
		try {
			if (window.bcModSdk && typeof window.bcModSdk.registerMod === 'function') {
				window.bcModSdk.registerMod({
					name: 'SlimeBeep',
					fullName: 'SlimeBeep',
					version: VERSION,
					repository: 'https://github.com/Proudkiller0015/slimebeep',
				});
			}
		} catch (e) {
			warn(e, 'mod SDK');
		}
		const style = document.createElement('style');
		style.id = 'sb-style';
		style.textContent = css;
		document.head.appendChild(style);

		const toggle = document.createElement('button');
		toggle.id = 'sb-toggle';
		toggle.title = 'SlimeBeep (drag to move)';
		toggle.innerHTML = html`<img src="${ICON}" alt="SlimeBeep"><span id="sb-badge"></span>`;
		document.body.appendChild(toggle);
		const toast = document.createElement('div');
		toast.id = 'sb-toast';
		document.body.appendChild(toast);
		const cards = document.createElement('div');
		cards.id = 'sb-cards';
		document.body.appendChild(cards);

		const panel = document.createElement('div');
		panel.id = 'sb-panel';
		panel.innerHTML = html`
			<div class="sb-head">
				<img src="${ICON}" alt="">
				<b>SlimeBeep <small>v${VERSION}</small></b>
				<span id="sb-me"></span>
				<button id="sb-moon" title="Night mode">🌙</button>
				<button id="sb-gear" title="Options">⚙</button>
				<button id="sb-quit" title="Quit SlimeBeep until you reload">⏻</button>
				<button id="sb-close" title="Close">✕</button>
			</div>
			<div id="sb-view" style="flex:1;display:flex;flex-direction:column;min-height:0"></div>`;
		document.body.appendChild(panel);

		/** Toggle drag in progress: pointer offset, start point and whether it moved past the click threshold. */
		let drag = null;
		/** Ends a drag (saving the position when `save`); returns whether it was a move rather than a click. */
		const endDrag = (save) => {
			if (!drag) {
				return;
			}
			const moved = drag.moved;
			drag = null;
			toggle.classList.remove('dragging');
			if (moved && save) {
				saveOpts();
			}
			return moved;
		};
		toggle.addEventListener('pointerdown', (e) => {
			if (e.button !== 0) {
				return;
			}
			const r = toggle.getBoundingClientRect();
			drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, x0: e.clientX, y0: e.clientY, moved: false };
			try {
				toggle.setPointerCapture(e.pointerId);
			} catch (err) {
				/* works without capture */
			}
		});
		toggle.addEventListener('pointermove', (e) => {
			if (!drag) {
				return;
			}
			// The release was lost (another window took it): stop instead of following the pointer.
			if (!(e.buttons & 1)) {
				return endDrag(true);
			}
			if (!drag.moved && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 8) {
				return;
			}
			drag.moved = true;
			toggle.classList.add('dragging');
			opts.pos = { x: (e.clientX - drag.dx) / innerWidth, y: (e.clientY - drag.dy) / innerHeight };
			place();
		});
		toggle.addEventListener('pointerup', (e) => {
			if (!drag || e.button !== 0) {
				return;
			}
			if (endDrag(true)) {
				return;
			}
			setOpen(panel.style.display !== 'flex');
		});
		toggle.addEventListener('pointercancel', () => endDrag(true));
		toggle.addEventListener('lostpointercapture', () => endDrag(true));
		addEventListener('blur', () => endDrag(true));
		addEventListener('resize', place);
		$('sb-quit').addEventListener('click', askQuit);
		$('sb-close').addEventListener('click', () => setOpen(false));
		$('sb-moon').addEventListener('click', () => setNight(!opts.night));
		setNight(opts.night);
		$('sb-gear').addEventListener('click', () => {
			tab = tab === 'options' ? 'chats' : 'options';
			thread = null;
			render();
		});
		// Join buttons on group codes inside messages.
		panel.addEventListener(
			'click',
			(e) => {
				const join = e.target.closest && e.target.closest('button.sb-joincode');
				if (join) {
					e.preventDefault();
					e.stopPropagation();
					return joinCode(join.dataset.code, openJoined);
				}
			},
			true,
		);
		// A click on a picture zooms it instead of opening the row it is in.
		panel.addEventListener(
			'click',
			(e) => {
				const img = e.target.closest && e.target.closest('img.sb-pic');
				if (!img || img.closest('#sb-me')) {
					return;
				}
				e.preventDefault();
				e.stopPropagation();
				zoomPic(img.src);
			},
			true,
		);
		$('sb-me').addEventListener('click', () => {
			if (!loggedIn()) {
				return;
			}
			tab = 'options';
			thread = null;
			render();
		});
		// Keys typed in the panel stay out of the game's key handlers.
		panel.addEventListener('keydown', (e) => e.stopPropagation());
		panel.addEventListener(
			'pointerdown',
			() => {
				lastPanelTouch = Date.now();
			},
			true,
		);
		toggle.addEventListener(
			'pointerdown',
			() => {
				lastPanelTouch = Date.now();
			},
			true,
		);

		if (loggedIn()) {
			listen();
		}
		place();
		tickTimer = setInterval(tick, 1000);
		news();
		registerSettings();
	}

	/** The ServerSocket our listeners are attached to (see listen). */
	let listening = null;
	/** Set by quit(); stops every timer callback and late reply from doing anything. */
	let stopped = false;
	/** The 1 s tick interval, cleared by quit(). */
	let tickTimer = null;
	/** Asks before quitting (⏻), in a box inside the panel. */
	function askQuit() {
		if (stopped || $('sb-ask')) {
			return;
		}
		const box = document.createElement('div');
		box.id = 'sb-ask';
		box.innerHTML = html`<div class="sb-crop-card">
			<b>Turn SlimeBeep off?</b>
			<div class="sb-warn">⚠ To get it back you'll have to <u>reload the game</u> and <u>click your SlimeBeep bookmark again</u> (with the userscript it comes back on its own after the reload).</div>
			<span class="sb-hint" style="text-align:center">Your chats and settings stay.</span>
			<div class="sb-crop-btns"><button class="sb-pill" data-act="keep">Keep it on</button><button class="sb-go" data-act="quit">⏻ Turn off</button></div>
		</div>`;
		const close = () => {
			box.remove();
			document.removeEventListener('keydown', onKey, true);
		};
		const onKey = (e) => {
			if (e.key === 'Escape') {
				e.stopPropagation();
				close();
			}
		};
		box.addEventListener('click', (e) => {
			const act = e.target.dataset && e.target.dataset.act;
			if (act === 'quit') {
				close();
				quit();
			} else if (act === 'keep' || e.target === box) {
				close();
			}
		});
		document.addEventListener('keydown', onKey, true);
		$('sb-panel').appendChild(box);
	}
	/**
	 * Removes SlimeBeep from the page until the next load: DOM, style, listeners, timers and relay
	 * connections. Saved data is kept.
	 */
	function quit() {
		if (stopped) {
			return;
		}
		stopped = true;
		try {
			clearInterval(tickTimer);
		} catch (e) {
			/* gone */
		}
		try {
			removeEventListener('resize', place);
		} catch (e) {
			/* gone */
		}
		try {
			const sock = listening;
			if (sock) {
				if (typeof sock.offAny === 'function') {
					sock.offAny(anyListener);
				}
				if (typeof sock.off === 'function') {
					sock.off('AccountBeep', beepListener);
					sock.off('AccountQueryResult', queryListener);
				}
			}
		} catch (e) {
			/* gone */
		}
		listening = null;
		for (const c of Object.values(conns)) {
			c.dead = true;
			try {
				if (c.ws) {
					c.ws.close();
				}
			} catch (e) {
				/* gone */
			}
		}
		for (const b of document.querySelectorAll('.sb-bcjoin')) {
			b.remove();
		}
		for (const id of ['sb-toggle', 'sb-panel', 'sb-toast', 'sb-cards', 'sb-crop', 'sb-zoom', 'sb-ask', 'sb-emoji', 'sb-style']) {
			const el = $(id);
			if (el) {
				el.remove();
			}
		}
		const root = document.documentElement;
		for (const k of [...root.classList]) {
			if (/^sb-/.test(k)) {
				root.classList.remove(k);
			}
		}
		for (const set of Object.values(apiListeners)) {
			set.clear();
		}
		delete window.SlimeBeep;
		console.info('[SlimeBeep] quit until the next reload');
	}
	/** The last 20 beeps received (sender, type, start of text), for SlimeBeep.debug(). */
	const seenBeeps = [];
	/** Handles the two server messages SlimeBeep reads: AccountBeep and the OnlineFriends answer. Others are ignored. */
	function onServer(event, data) {
		try {
			if (event === 'AccountQueryResult') {
				if (!data || data.Query !== 'OnlineFriends' || !Array.isArray(data.Result)) {
					return;
				}
				friends = data.Result.filter((f) => f && f.MemberNumber !== Player.MemberNumber);
				friendsKnown = true;
				sendWaiting();
				if (isOpen() && tab !== 'chats') {
					render();
				}
			} else if (event === 'AccountBeep') {
				if (!data || typeof data !== 'object') {
					return;
				}
				// Copied before the game or another add-on changes it.
				const d = {
					MemberNumber: data.MemberNumber,
					MemberName: data.MemberName,
					BeepType: data.BeepType,
					Message: data.Message,
					ChatRoomName: data.ChatRoomName,
					ChatRoomSpace: data.ChatRoomSpace,
					Private: data.Private,
				};
				seenBeeps.push({
					at: new Date().toISOString(),
					from: d.MemberNumber,
					type: d.BeepType || '',
					text: typeof d.Message === 'string' ? d.Message.slice(0, 80) : null,
				});
				if (seenBeeps.length > 20) {
					seenBeeps.shift();
				}
				if (d.BeepType === PROTO) {
					onHidden(d);
				} else {
					catchBeep(d);
				}
			}
		} catch (e) {
			warn(e);
		}
	}
	/** Catch-all socket listener; onServer keeps only AccountBeep and AccountQueryResult. */
	const anyListener = (event, data) => onServer(event, data);
	/** Per-event listeners, for a socket without a catch-all. */
	const beepListener = (data) => onServer('AccountBeep', data);
	const queryListener = (data) => onServer('AccountQueryResult', data);
	/**
	 * Attaches the listeners to ServerSocket (called every tick, re-attaching if they were removed).
	 * The catch-all goes first (prependAny) so a beep is read before another add-on can remove the
	 * game's listener for it or change it; it survives other code removing per-event listeners.
	 */
	/** Whether our listener is still attached to `sock` (true when the socket can't tell). */
	function stillListening(sock, any) {
		if (any) {
			return typeof sock.listenersAny === 'function' ? sock.listenersAny().includes(anyListener) : true;
		}
		return typeof sock.listeners === 'function' ? sock.listeners('AccountBeep').includes(beepListener) : true;
	}
	function listen() {
		if (!loggedIn() || !ServerSocket || typeof ServerSocket.on !== 'function') {
			return;
		}
		const sock = ServerSocket;
		let any = null;
		if (typeof sock.prependAny === 'function') {
			any = 'prependAny';
		} else if (typeof sock.onAny === 'function') {
			any = 'onAny';
		}
		if (listening === sock && stillListening(sock, any)) {
			return;
		}
		listening = sock;
		if (any) {
			if (typeof sock.offAny === 'function') {
				sock.offAny(anyListener);
			}
			sock[any](anyListener);
		} else {
			if (typeof sock.off === 'function') {
				sock.off('AccountBeep', beepListener);
				sock.off('AccountQueryResult', queryListener);
			}
			sock.on('AccountBeep', beepListener);
			sock.on('AccountQueryResult', queryListener);
		}
	}
	/** Other add-ons' listeners for api.on(), by event type. */
	const apiListeners = { group: new Set(), groupGone: new Set(), presence: new Set(), slimeBeepFriend: new Set() };
	/** Calls an api.on() event's listeners, each with its own copy of `data`. */
	function emit(type, data) {
		for (const fn of apiListeners[type] || []) {
			try {
				fn(JSON.parse(JSON.stringify(data)));
			} catch (e) {
				warn(e, `another add-on's ${type} listener`);
			}
		}
	}
	/** A member's role in a group: 'owner', 'admin' or 'member'. */
	function roleOf(g, n) {
		if (n === g.owner) {
			return 'owner';
		}
		return g.admins.includes(n) ? 'admin' : 'member';
	}
	/** A group as the API hands it out (see API.md). */
	function groupView(g) {
		const me = loggedIn() ? Player.MemberNumber : 0;
		const online = new Set([...(g.online || []), me]);
		return {
			id: g.id,
			name: g.name,
			owner: g.owner,
			admins: [...g.admins],
			anyoneCanInvite: !!g.open,
			canInvite: canInvite(g, me) && g.members.length < LIMITS.members,
			members: g.members.map((m) => ({
				memberNumber: m.n,
				name: m.n === me ? myName() : m.name,
				online: online.has(m.n),
				role: roleOf(g, m.n),
			})),
			picture: g.pic || null,
		};
	}
	/**
	 * The API for other add-ons, documented in API.md. Read-only: everything returned is a copy, and
	 * message text is never exposed. apiVersion changes only on a breaking change.
	 */
	window.SlimeBeep.api = Object.freeze({
		apiVersion: 1,
		version: VERSION,
		/** Your group chats, as groupView. */
		groups: () => (loggedIn() ? Object.values(groups).map(groupView) : []),
		/** One group by id, or null. */
		group: (id) => (loggedIn() && groups[id] ? groupView(groups[id]) : null),
		/** The member numbers of friends known to have SlimeBeep. */
		slimeBeepFriends: () => [...peers],
		/** Whether this member number is a friend known to have SlimeBeep. */
		hasSlimeBeep: (memberNumber) => peers.has(memberNumber),
		/** Opens SlimeBeep on a group chat. */
		openGroup: (id) => {
			if (!groups[id]) {
				return false;
			}
			tab = 'groups';
			thread = `g:${id}`;
			if (!isOpen()) {
				setOpen(true);
			} else {
				render();
			}
			return true;
		},
		/** Invites someone to a group: a SlimeBeep friend gets an invite card, anyone else a code for them alone. Promise of { ok, sent } / { ok, code } / { ok: false, why }. */
		inviteToGroup: (id, memberNumber) => inviteToGroup(id, memberNumber),
		/** Opens SlimeBeep on "Invite <them> to…", listing the groups you can invite to. */
		openInvite: (memberNumber) => {
			if (!isNum(memberNumber)) {
				return false;
			}
			inviteFor = { n: memberNumber, results: {} };
			thread = null;
			tab = 'invitefor';
			if (!isOpen()) {
				setOpen(true);
			} else {
				render();
			}
			return true;
		},
		/** For theme add-ons: SlimeBeep takes the running theme add-on's colours (true) or its own (false). Off unless switched on. */
		matchTheme: (on) => {
			setThemed(!!on);
			return !!applyThemed();
		},
		/** { on, source }: whether SlimeBeep matches a theme add-on, and which one it found ('Themed', 'BCNeko' or null). */
		matchingTheme: () => ({ on: !!opts.themed, source: (themeSource() || {}).name || null }),
		/** Opens SlimeBeep on a chat with this member number. */
		openChat: (memberNumber) => {
			if (!isNum(memberNumber)) {
				return false;
			}
			thread = memberNumber;
			if (!isOpen()) {
				setOpen(true);
			} else {
				render();
			}
			return true;
		},
		/**
		 * on('group' | 'groupGone' | 'presence' | 'slimeBeepFriend', fn): fn gets a copy each time; returns a function that stops it.
		 * group: a group was joined or changed (a group, as in groups()); groupGone: { id }; presence: a group whose
		 * online members changed; slimeBeepFriend: { memberNumber } of a friend just found to have SlimeBeep.
		 */
		on: (type, fn) => {
			if (!apiListeners[type] || typeof fn !== 'function') {
				return () => {};
			}
			apiListeners[type].add(fn);
			return () => apiListeners[type].delete(fn);
		},
	});

	/** State for bug reports, typed in the console. */
	window.SlimeBeep.debug = () => ({
		version: VERSION,
		missing: missing().map(([k]) => k),
		listening: !!listening,
		catchAll: !!(listening && typeof listening.onAny === 'function'),
		lastBeeps: seenBeeps.slice(),
	});

	/** Member number -> times of their recent hidden beeps (see allow). */
	const hiddenBeepTimes = new Map();
	/** Whether a hidden beep from `n` is accepted: at most LIMITS.perMinute a minute. */
	function allow(n) {
		const now = Date.now();
		const list = (hiddenBeepTimes.get(n) || []).filter((t) => now - t < 60000);
		list.push(now);
		hiddenBeepTimes.set(n, list);
		return list.length <= LIMITS.perMinute;
	}
	/** Member number -> when we last answered their ping. */
	const ponged = new Map();

	/** Member number -> when we last asked them for their picture. */
	const asked = new Map();
	/** Member number -> when we last sent them ours. */
	const sentPic = new Map();
	/** Member number -> a picture being received in pieces: { v, n: piece count, parts }. */
	const pieces = new Map();
	/**
	 * Picture fields of a hidden beep: `pv` (their picture version; 0 = none) makes us ask for a new one,
	 * `pfreq` asks for ours, `pf` is one piece of theirs.
	 */
	function pictureNews(from, p) {
		const known = loadPfps()[from];
		if (p.pv === 0 && known) {
			delete pfps[from];
			savePfps();
		}
		if (isId(p.pv) && (!known || known.v !== p.pv) && Date.now() - (asked.get(from) || 0) > 60000) {
			asked.set(from, Date.now());
			sendHidden(from, { sb: 1, pfreq: 1 });
		}
		if (p.pfreq === 1) {
			const pic = myPfp();
			if (!pic || Date.now() - (sentPic.get(from) || 0) < 60000) {
				return;
			}
			sentPic.set(from, Date.now());
			const parts = Math.ceil(pic.data.length / PFP_CHUNK);
			// 250 ms apart.
			for (let i = 0; i < parts; i++) {
				setTimeout(
					() => sendHidden(from, { sb: 1, pf: { v: pic.v, i, n: parts, d: pic.data.slice(i * PFP_CHUNK, (i + 1) * PFP_CHUNK) } }),
					i * 250,
				);
			}
		}
		const pf = p.pf;
		if (
			pf &&
			typeof pf === 'object' &&
			isId(pf.v) &&
			Number.isInteger(pf.i) &&
			Number.isInteger(pf.n) &&
			pf.n > 0 &&
			pf.n <= Math.ceil(PFP_MAX / PFP_CHUNK) &&
			pf.i >= 0 &&
			pf.i < pf.n &&
			typeof pf.d === 'string' &&
			pf.d.length <= PFP_CHUNK
		) {
			let got = pieces.get(from);
			if (!got || got.v !== pf.v || got.n !== pf.n) {
				got = { v: pf.v, n: pf.n, parts: [] };
			}
			got.parts[pf.i] = pf.d;
			pieces.set(from, got);
			if (got.parts.filter((x) => typeof x === 'string').length === got.n) {
				pieces.delete(from);
				const data = got.parts.join('');
				if (data.length <= PFP_MAX && PFP_RE.test(data)) {
					loadPfps()[from] = { v: got.v, data };
					savePfps();
					if (isOpen()) {
						render(true);
					}
				}
			}
		}
	}

	/** localStorage key of your picture's uncropped source (max 320 px), kept for "Adjust". */
	const srcKey = () => `slimebeep.pfpsrc.${Player.MemberNumber}`;
	/** Your picture's uncropped source, or null. */
	const loadSrc = () => {
		try {
			const d = localStorage.getItem(srcKey());
			return d && /^data:image\/(webp|jpeg|png);base64,/.test(d) ? d : null;
		} catch (e) {
			return null;
		}
	};
	/**
	 * Reads a picked image file, scales it to at most 320 px and opens the cropper on it.
	 * @param {File} file
	 * @param {?function(string)} onSave  gets the cropped picture instead of it becoming yours (group pictures)
	 * @param {string} title  the cropper's heading
	 */
	function setPicture(file, onSave = null, title = '') {
		if (!file || !/^image\//.test(file.type)) {
			return notify('That is not a picture');
		}
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => {
			try {
				const k = Math.min(1, 320 / Math.max(img.naturalWidth, img.naturalHeight));
				const c = document.createElement('canvas');
				c.width = Math.max(1, Math.round(img.naturalWidth * k));
				c.height = Math.max(1, Math.round(img.naturalHeight * k));
				c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
				const src = c.toDataURL('image/jpeg', 0.9);
				if (!onSave) {
					try {
						localStorage.setItem(srcKey(), src);
					} catch (e) {
						/* this visit only */
					}
				}
				openCropper(src, onSave, title);
			} catch (e) {
				notify('That picture could not be read');
			} finally {
				URL.revokeObjectURL(url);
			}
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			notify('That picture could not be read');
		};
		img.src = url;
	}
	/** Opens the file picker, then setPicture. */
	function pickPicture(onSave = null, title = '') {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.addEventListener('change', () => setPicture(input.files && input.files[0], onSave, title));
		input.click();
	}
	/**
	 * The cropper: drag and zoom `src` inside a circle. Save makes the result (128 px, under PFP_MAX)
	 * your picture, or passes it to `onSave`.
	 */
	function openCropper(src, onSave = null, title = '') {
		if ($('sb-crop')) {
			$('sb-crop').remove();
		}
		const SIZE = 200;
		const img = new Image();
		img.onload = () => {
			const w = img.naturalWidth,
				h = img.naturalHeight;
			const base = SIZE / Math.min(w, h); // zoom 1: the short side fills the circle
			let zoom = 1,
				x = 0,
				y = 0; // x, y: the picture's centre offset from the circle's, in screen px
			const box = document.createElement('div');
			box.id = 'sb-crop';
			box.innerHTML = html`<div class="sb-crop-card">
				<button class="sb-crop-x" data-act="cancel" title="Close">✕</button>
				<b>${title || 'Fit your picture in the circle'}</b>
				<div class="sb-crop-ring" style="width:${SIZE}px;height:${SIZE}px"><canvas width="${SIZE}" height="${SIZE}"></canvas></div>
				<span class="sb-hint">Drag to move it, scroll or slide to zoom.</span>
				<input type="range" min="1" max="4" step="0.01" value="1" aria-label="Zoom">
				<div class="sb-crop-btns"><button class="sb-pill" data-act="cancel">Cancel</button><button class="sb-go" data-act="save">Save</button></div>
			</div>`;
			if (!isOpen()) {
				setOpen(true);
			}
			$('sb-panel').appendChild(box);
			// Closed by Cancel, ✕, a click outside the card, Escape, or the panel closing.
			const onKey = (e) => {
				if (e.key === 'Escape' && document.body.contains(box)) {
					e.stopPropagation();
					box.remove();
				}
			};
			document.addEventListener('keydown', onKey, true);
			new MutationObserver((m, obs) => {
				if (!document.body.contains(box)) {
					document.removeEventListener('keydown', onKey, true);
					obs.disconnect();
				}
			}).observe($('sb-panel'), { childList: true });
			box.addEventListener('keydown', (e) => e.stopPropagation());
			const cv = box.querySelector('canvas'),
				ctx = cv.getContext('2d'),
				slider = box.querySelector('input');
			// The picture always covers the whole circle.
			const clampXY = () => {
				const sw = w * base * zoom,
					sh = h * base * zoom;
				x = Math.max(-(sw - SIZE) / 2, Math.min((sw - SIZE) / 2, x));
				y = Math.max(-(sh - SIZE) / 2, Math.min((sh - SIZE) / 2, y));
			};
			const draw = (to = ctx, size = SIZE) => {
				const k = size / SIZE,
					sw = w * base * zoom * k,
					sh = h * base * zoom * k;
				to.clearRect(0, 0, size, size);
				to.drawImage(img, size / 2 + x * k - sw / 2, size / 2 + y * k - sh / 2, sw, sh);
			};
			const setZoom = (z) => {
				zoom = Math.max(1, Math.min(4, z));
				slider.value = String(zoom);
				clampXY();
				draw();
			};
			draw();
			let drag = null;
			cv.addEventListener('pointerdown', (e) => {
				drag = { px: e.clientX, py: e.clientY, x, y };
				cv.setPointerCapture(e.pointerId);
			});
			cv.addEventListener('pointermove', (e) => {
				if (!drag) {
					return;
				}
				x = drag.x + e.clientX - drag.px;
				y = drag.y + e.clientY - drag.py;
				clampXY();
				draw();
			});
			cv.addEventListener('pointerup', () => {
				drag = null;
			});
			cv.addEventListener(
				'wheel',
				(e) => {
					e.preventDefault();
					setZoom(zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08));
				},
				{ passive: false },
			);
			slider.addEventListener('input', () => setZoom(Number(slider.value)));
			box.addEventListener('click', (e) => {
				const act = e.target.dataset && e.target.dataset.act;
				if (e.target === box || act === 'cancel') {
					return box.remove();
				}
				if (act !== 'save') {
					return;
				}
				let data = '';
				for (const size of [128, 96, 64]) {
					const out = document.createElement('canvas');
					out.width = out.height = size;
					const octx = out.getContext('2d');
					octx.imageSmoothingQuality = 'high';
					draw(octx, size);
					for (const q of [0.9, 0.8, 0.65, 0.5]) {
						data = out.toDataURL('image/webp', q);
						if (!data.startsWith('data:image/webp')) {
							data = out.toDataURL('image/jpeg', q);
						}
						if (data.length <= PFP_MAX) {
							break;
						}
					}
					if (data.length <= PFP_MAX) {
						break;
					}
				}
				if (data.length > PFP_MAX || !PFP_RE.test(data)) {
					return notify('That picture is too big, try another');
				}
				box.remove();
				if (onSave) {
					return onSave(data);
				}
				setOpt('pfp', { v: newId(), data });
				pushPicture();
				showMe();
				notify('✓ New profile picture');
				if (isOpen()) {
					render(true);
				}
			});
			// For the tests.
			openCropper.state = () => ({ zoom, x, y });
			openCropper.set = (z, nx, ny) => {
				x = nx;
				y = ny;
				setZoom(z);
			};
		};
		img.onerror = () => notify('That picture could not be read');
		img.src = src;
	}
	/** Image element drawMyPic draws from. */
	const picImg = new Image();
	/** Draws your picture in a circle on the game's canvas (Extensions page). */
	function drawMyPic(left, top, size) {
		const pic = myPfp();
		if (!pic || typeof MainCanvas === 'undefined' || !MainCanvas) {
			return;
		}
		if (picImg.src !== pic.data) {
			picImg.src = pic.data;
		}
		if (!picImg.complete || !picImg.naturalWidth) {
			return;
		}
		MainCanvas.save();
		MainCanvas.beginPath();
		MainCanvas.arc(left + size / 2, top + size / 2, size / 2, 0, Math.PI * 2);
		MainCanvas.clip();
		MainCanvas.drawImage(picImg, left, top, size, size);
		MainCanvas.restore();
	}
	/** A picture shown big, until clicked or Escape. */
	function zoomPic(src) {
		if (!PFP_RE.test(src)) {
			return;
		}
		if ($('sb-zoom')) {
			$('sb-zoom').remove();
		}
		const box = document.createElement('div');
		box.id = 'sb-zoom';
		const img = document.createElement('img');
		img.src = src;
		img.alt = '';
		box.appendChild(img);
		const close = () => {
			box.remove();
			document.removeEventListener('keydown', onKey, true);
		};
		const onKey = (e) => {
			if (e.key === 'Escape') {
				e.stopPropagation();
				close();
			}
		};
		box.addEventListener('click', close);
		document.addEventListener('keydown', onKey, true);
		if (!isOpen()) {
			setOpen(true);
		}
		$('sb-panel').appendChild(box);
	}
	/** Your own picture (or initials) in the panel header; clicking it opens the options. */
	function showMe() {
		const me = $('sb-me');
		if (!me) {
			return;
		}
		me.innerHTML = html`${loggedIn() && avatar(Player.MemberNumber, myName())}`;
		if (!loggedIn()) {
			me.title = '';
		} else {
			me.title = myPfp() ? 'Your profile picture' : 'Choose a profile picture';
		}
	}

	/**
	 * A hidden beep (BeepType PROTO) from a friend: JSON with `sb: 1` and any of `kf` (their key start),
	 * picture fields (pictureNews), `ping`/`pong` (SlimeBeep check) or `ginv` (group invite).
	 * Ignored from non-friends; the sender's member number comes from the game server.
	 */
	function onHidden(d) {
		if (!loggedIn() || !isNum(d.MemberNumber) || typeof d.Message !== 'string' || d.Message.length > 1000) {
			return;
		}
		const from = d.MemberNumber;
		if (from === Player.MemberNumber || !isFriend(from) || !allow(from)) {
			return;
		}
		if (histOwner !== Player.MemberNumber) {
			loadHistory();
		}
		let p;
		try {
			p = JSON.parse(d.Message);
		} catch (e) {
			return;
		}
		if (!p || typeof p !== 'object' || Array.isArray(p) || p.sb !== 1) {
			return;
		}

		// Any hidden beep shows the sender has SlimeBeep.
		if (!peers.has(from)) {
			foundPeer(from);
		}
		if (typeof p.kf === 'string' && /^[A-Za-z0-9_-]{16}$/.test(p.kf) && peerKeys[from] !== p.kf) {
			peerKeys[from] = p.kf;
			saveGC();
		}
		pictureNews(from, p);
		if (p.ping === 1) {
			answerPing(from);
		}
		if (p.ginv && typeof p.ginv === 'object') {
			takeInvite(from, d.MemberName, p.ginv);
		}
	}
	/** Records a friend as having SlimeBeep and redraws, so the 🫧 by their name shows. */
	function foundPeer(n) {
		peers.add(n);
		saveGC();
		emit('slimeBeepFriend', { memberNumber: n });
		if (isOpen()) {
			render(true);
		}
	}
	/** Answers a friend's "do you have SlimeBeep?" with a pong, at most once a minute per friend. */
	function answerPing(n) {
		if (Date.now() - (ponged.get(n) || 0) < 60000) {
			return;
		}
		ponged.set(n, Date.now());
		sendHidden(n, { sb: 1, pong: 1 });
	}
	/** Keeps a friend's group invite in `invitations` and shows a card; nothing is joined automatically. */
	function takeInvite(from, senderName, ginv) {
		const m = CODE_RE.exec(typeof ginv.code === 'string' ? ginv.code : '');
		if (!m || groups[m[1]]) {
			return;
		}
		const name = clean(ginv.name, LIMITS.name) || 'Group chat';
		const fromName = clean(senderName, LIMITS.name) || `#${from}`;
		invitations = [
			...invitations.filter((i) => !i.code.startsWith(`SB-${m[1]}-`)),
			{ code: m[0], name, from, fromName, at: Date.now() },
		].slice(-20);
		saveGC();
		if (opts.sound && !isMuted(`n:${from}`)) {
			chime();
		}
		card({
			icon: avatar(from, fromName),
			title: `👥 ${name}`,
			text: `${fromName} invited you to a group chat. Tap to see it.`,
			onClick: () => {
				tab = 'groups';
				thread = null;
				if (!isOpen()) {
					setOpen(true);
				} else {
					render();
				}
			},
		});
		if (isOpen() && tab === 'groups' && thread === null) {
			render(true);
		}
	}

	/**
	 * One relay connection per group (reconnects with backoff, up to 5 min), by group id:
	 * { ws, ready (signed in), retry (reconnect count), queue (messages waiting for sign-in),
	 * waiters (invite callbacks), create/invite (sent with the sign-in), onWelcome/onFail,
	 * dead (closed on purpose), pinged (last keep-alive) }.
	 */
	const conns = {};
	/** Member number -> picture shared in a group (for members who aren't friends). */
	let relayPics = {};
	/** This account's key: { owner, priv, pub: { x, y }, kf }. See getKey. */
	let myKey = null;
	const b64url = (buf) =>
		btoa(String.fromCharCode(...new Uint8Array(buf)))
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');

	/** Whether this page can sign in to the relay: WebCrypto (crypto.subtle) exists only on https pages. */
	const secure = () => typeof crypto !== 'undefined' && !!crypto.subtle;
	/** This page's address over https. */
	const httpsUrl = () => location.href.replace(/^http:/, 'https:');
	/** On an http page: tells the player, once per visit, that group chats and mailboxes need the https address. */
	function needHttps() {
		if (needHttps.told) {
			return;
		}
		needHttps.told = true;
		card({
			icon: logoIcon(),
			title: '🔒 SlimeBeep',
			text: 'Group chats need the secure (https) address of the game. Tap to open it; you will log in again there.',
			ms: 0,
			cls: 'news',
			onClick: () => {
				location.href = httpsUrl();
			},
		});
	}

	/**
	 * Opens a signed connection to `owner`'s mailbox on the relay. Mailboxes hold beeps for offline
	 * SlimeBeep friends, addressed to the recipient's key start (peerKeys); see relay/src/index.js.
	 * @param {number} owner  the mailbox's member number (yours to read, a friend's to leave a beep)
	 * @param {function(object, WebSocket)} onMsg  gets every message from the relay
	 * @returns {Promise<WebSocket>} resolves once signed in
	 */
	function mailOpen(owner, onMsg) {
		return new Promise((resolve, reject) => {
			let ws = null,
				done = false;
			const fin = (err) => {
				if (done) {
					return;
				}
				done = true;
				clearTimeout(timer);
				if (!err) {
					return resolve(ws);
				}
				try {
					if (ws) {
						ws.close();
					}
				} catch (e) {
					/* gone */
				}
				reject(new Error(err));
			};
			const timer = setTimeout(() => fin('no answer'), 10000);
			try {
				ws = new WebSocket(`${relayUrl()}/ws?m=${owner}`);
			} catch (e) {
				return fin('could not connect');
			}
			ws.onmessage = async (e) => {
				let p;
				try {
					p = JSON.parse(e.data);
				} catch (x) {
					return;
				}
				if (!p || typeof p !== 'object') {
					return;
				}
				if (p.t === 'hello' && typeof p.nonce === 'string') {
					try {
						const k = await getKey();
						const me = Player.MemberNumber;
						const signed = `${p.nonce}|mbox:${owner}|${me}`;
						const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, k.priv, new TextEncoder().encode(signed));
						ws.send(JSON.stringify({ t: 'auth', member: me, name: myName(), pub: k.pub, sig: b64url(sig) }));
					} catch (x) {
						fin('could not sign in');
					}
					return;
				}
				if (p.t === 'error' && p.fatal) {
					return fin(clean(p.why, 80) || 'refused');
				}
				if (p.t === 'welcome' || p.t === 'mail') {
					fin(null);
				}
				if (onMsg) {
					try {
						onMsg(p, ws);
					} catch (x) {
						warn(x, 'mail');
					}
				}
			};
			ws.onclose = () => fin('closed');
		});
	}
	/** True while mailWaiting runs. */
	let mailing = false;
	/**
	 * Leaves `waiting` beeps for SlimeBeep friends in their mailboxes; delivered ones move to `hist` (📬).
	 * A beep is retried after 10 minutes, or straight away with `now`.
	 */
	async function mailWaiting(now = false) {
		if (mailing || stopped || !loggedIn() || !waiting.length || !secure()) {
			return;
		}
		const due = waiting.filter((w) => peers.has(w.n) && peerKeys[w.n] && (now || Date.now() - (w.tried || 0) > 600000));
		if (!due.length) {
			return;
		}
		mailing = true;
		try {
			for (const n of [...new Set(due.map((w) => w.n))]) {
				const mine = due.filter((w) => w.n === n).slice(0, 15);
				for (const w of mine) {
					w.tried = Date.now();
				}
				const answers = new Map();
				let ws;
				try {
					ws = await mailOpen(n, (p) => {
						if ((p.t === 'ok' || p.t === 'error') && typeof p.ref === 'string') {
							answers.set(p.ref, p.t === 'ok');
						}
					});
				} catch (e) {
					continue;
				}
				for (const w of mine) {
					ws.send(JSON.stringify({ t: 'put', kf: peerKeys[n], text: w.text, ref: w.id }));
				}
				const t0 = Date.now();
				while (Date.now() - t0 < 8000 && mine.some((w) => !answers.has(w.id))) {
					await new Promise((r) => setTimeout(r, 100));
				}
				try {
					ws.close();
				} catch (e) {
					/* gone */
				}
				const left = mine.filter((w) => answers.get(w.id) === true && waiting.includes(w));
				if (!left.length) {
					continue;
				}
				waiting = waiting.filter((w) => !left.includes(w));
				for (const w of left) {
					const k = `mail:${w.id}`;
					if (histKeys.has(k)) {
						continue;
					}
					hist.push({ k, MemberNumber: n, MemberName: nameOf(n), Sent: true, Time: w.at, Message: w.text, mail: true });
					histKeys.add(k);
				}
				hist.sort((a, b) => a.Time - b.Time);
				saveHistory();
				saveWaiting();
				notify(`📬 Left in ${nameOf(n)}'s mailbox: they get it when they log in`);
				if (isOpen()) {
					render(true);
				}
			}
		} finally {
			mailing = false;
		}
	}
	/** When your mailbox was last checked. */
	let mailChecked = 0;
	/** True while checkMail runs. */
	let mailBusy = false;
	/** Fetches your mailbox (at login, then every 5 minutes from relayTick). */
	async function checkMail() {
		if (mailBusy || stopped || !loggedIn() || !secure()) {
			return;
		}
		mailBusy = true;
		mailChecked = Date.now();
		try {
			const ws = await mailOpen(Player.MemberNumber, (p, sock) => {
				if (p.t === 'mail') {
					takeMail(p.list, sock);
				}
			});
			setTimeout(() => {
				try {
					ws.close();
				} catch (e) {
					/* gone */
				}
			}, 3000);
		} catch (e) {
			/* tried again next time */
		} finally {
			mailBusy = false;
		}
	}
	/** Adds mailbox beeps to `hist` and acks them. Beeps from non-friends or with a wrong sender key are dropped. */
	function takeMail(list, sock) {
		if (!Array.isArray(list) || !list.length) {
			return;
		}
		const ids = [],
			fresh = [];
		for (const m of list.slice(0, 100)) {
			if (!m || typeof m.id !== 'string' || !/^[A-Z2-9]{10}$/.test(m.id)) {
				continue;
			}
			ids.push(m.id);
			const from = m.from;
			if (!isNum(from) || from === Player.MemberNumber || !isFriend(from)) {
				continue;
			}
			// Signed with another key than the one their own SlimeBeep sent us: not from them.
			const known = peerKeys[from];
			if (known && known !== m.fromKf) {
				continue;
			}
			const text = typeof m.text === 'string' ? m.text.slice(0, 1000) : '';
			const k = `mail:${m.id}`;
			if (!text.trim() || histKeys.has(k)) {
				continue;
			}
			const h = {
				k,
				MemberNumber: from,
				MemberName: nameOf(from) || clean(m.name, LIMITS.name) || `#${from}`,
				Sent: false,
				Time: Number(m.at) || Date.now(),
				Message: text,
				mail: true,
				unread: true,
				...(known ? {} : { unchecked: true }),
			};
			hist.push(h);
			histKeys.add(k);
			fresh.push(h);
		}
		if (fresh.length) {
			hist.sort((a, b) => a.Time - b.Time);
			saveHistory();
			ding(fresh);
			for (const h of fresh.slice(-3)) {
				announce(h);
			}
			if (isOpen() && tab !== 'options' && tab !== 'wave') {
				render(true);
			}
		}
		if (ids.length) {
			try {
				sock.send(JSON.stringify({ t: 'ack', ids }));
			} catch (e) {
				/* again next time */
			}
		}
	}

	/**
	 * This account's signing key in this browser, stored as JWK fields under slimebeep.key.<member number>;
	 * made on first use. `kf` is the first 16 chars of the public x, the fingerprint friends compare.
	 */
	async function getKey() {
		const me = Player.MemberNumber;
		if (myKey && myKey.owner === me) {
			return myKey;
		}
		const k = `slimebeep.key.${me}`;
		if (!secure()) {
			throw new Error('no WebCrypto on this page (http)');
		}
		try {
			const saved = JSON.parse(localStorage.getItem(k) || 'null');
			if (saved && saved.d && saved.x && saved.y) {
				const priv = await crypto.subtle.importKey(
					'jwk',
					{ kty: 'EC', crv: 'P-256', x: saved.x, y: saved.y, d: saved.d, ext: true },
					{ name: 'ECDSA', namedCurve: 'P-256' },
					false,
					['sign'],
				);
				return (myKey = { owner: me, priv, pub: { x: saved.x, y: saved.y }, kf: saved.x.slice(0, 16) });
			}
		} catch (e) {
			/* make a new one */
		}
		const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
		const jwk = await crypto.subtle.exportKey('jwk', pair.privateKey);
		try {
			localStorage.setItem(k, JSON.stringify({ x: jwk.x, y: jwk.y, d: jwk.d }));
		} catch (e) {
			/* this visit only */
		}
		return (myKey = { owner: me, priv: pair.privateKey, pub: { x: jwk.x, y: jwk.y }, kf: jwk.x.slice(0, 16) });
	}

	/**
	 * Opens (or returns) the relay connection for a group. `extra` sets fields of the connection record
	 * (see `conns`), such as `create` or `invite` for the sign-in.
	 */
	function connectGroup(gid, extra = {}) {
		if (stopped || !secure()) {
			return { ws: null, ready: false, queue: [], waiters: [], dead: true };
		}
		const old = conns[gid];
		if (old && !extra.create && !extra.invite && old.ws && old.ws.readyState <= 1) {
			return old;
		}
		if (old && old.ws) {
			old.dead = true;
			try {
				old.ws.close();
			} catch (e) {
				/* gone */
			}
		}
		const c = { ws: null, ready: false, retry: old ? old.retry || 0 : 0, queue: [], waiters: [], ...extra };
		conns[gid] = c;
		try {
			c.ws = new WebSocket(`${relayUrl()}/ws?g=${gid}`);
		} catch (e) {
			warn(e, 'relay');
			return c;
		}
		c.ws.onmessage = (e) => {
			let p;
			try {
				p = JSON.parse(e.data);
			} catch (x) {
				return;
			}
			onRelay(gid, c, p).catch((x) => warn(x, 'relay'));
		};
		c.ws.onclose = () => {
			c.ready = false;
			if (c.dead || conns[gid] !== c) {
				return;
			}
			if (!groups[gid]) {
				if (c.onFail) {
					c.onFail('could not reach the group');
				}
				delete conns[gid];
				return;
			}
			// Reconnect after ~2 s, 4 s, 8 s... up to 5 min, with jitter.
			c.retry = Math.min((c.retry || 0) + 1, 8);
			const ms = Math.min(300000, 1000 * 2 ** c.retry) * (0.75 + Math.random() / 2);
			setTimeout(() => {
				if (conns[gid] === c && groups[gid] && loggedIn()) {
					connectGroup(gid);
				}
			}, ms);
		};
		return c;
	}
	/** Sends to a group's relay connection, or queues it until signed in. */
	function relaySend(gid, x) {
		const c = conns[gid] || connectGroup(gid);
		if (c.ready && c.ws && c.ws.readyState === 1) {
			c.ws.send(JSON.stringify(x));
		} else {
			c.queue.push(x);
		}
	}

	/** Handles one message from a group's relay connection (sign-in, roster, messages, pictures, invites, errors). */
	async function onRelay(gid, c, p) {
		if (!p || typeof p !== 'object' || conns[gid] !== c) {
			return;
		}
		const me = Player.MemberNumber;
		if (p.t === 'hello' && typeof p.nonce === 'string') {
			const k = await getKey();
			const signed = `${p.nonce}|${gid}|${me}`;
			const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, k.priv, new TextEncoder().encode(signed));
			const g = groups[gid];
			c.ws.send(
				JSON.stringify({
					t: 'auth',
					member: me,
					name: myName(),
					pub: k.pub,
					sig: b64url(sig),
					after: g ? g.last || 0 : 0,
					...(c.create ? { create: c.create } : {}),
					...(c.invite ? { invite: c.invite } : {}),
				}),
			);
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
			for (const x of c.queue.splice(0)) {
				c.ws.send(JSON.stringify(x));
			}
			if (done) {
				done(gid);
			}
			return;
		}
		if (p.t === 'roster') {
			return takeRoster(gid, p.roster);
		}
		if (p.t === 'presence') {
			if (groups[gid] && Array.isArray(p.online)) {
				groups[gid].online = p.online.filter(isNum).slice(0, LIMITS.members);
				emit('presence', groupView(groups[gid]));
				if (isOpen()) {
					render(true);
				}
			}
			return;
		}
		if (p.t === 'msg') {
			return takeMsgs(gid, [p.m], true);
		}
		if (p.t === 'history') {
			return takeMsgs(gid, p.msgs, false);
		}
		if (p.t === 'pic') {
			if (isNum(p.n) && (p.data === null || (typeof p.data === 'string' && p.data.length <= PFP_MAX && PFP_RE.test(p.data)))) {
				if (p.data) {
					relayPics[p.n] = p.data;
				} else {
					delete relayPics[p.n];
				}
				if (isOpen()) {
					render(true);
				}
			}
			return;
		}
		if (p.t === 'gpic') {
			const g = groups[gid];
			if (g && (p.data === null || (typeof p.data === 'string' && p.data.length <= PFP_MAX && PFP_RE.test(p.data)))) {
				if (p.data) {
					g.pic = p.data;
				} else {
					delete g.pic;
				}
				saveGC();
				emit('group', groupView(g));
				if (isOpen()) {
					render(true);
				}
			}
			return;
		}
		if (p.t === 'invite') {
			const cb = c.waiters.shift();
			if (cb) {
				cb(typeof p.code === 'string' && /^[A-Z2-9]{10}$/.test(p.code) ? `SB-${gid}-${p.code}` : null);
			}
			return;
		}
		const why = clean(p.why, 120);
		if (p.t === 'gone' || (p.t === 'error' && p.fatal)) {
			c.dead = true;
			if (c.onFail) {
				c.onFail(why);
				c.onFail = null;
			}
			if (groups[gid] && (p.t === 'gone' || /not a member|no such group/.test(why))) {
				let note = `You're no longer in ${groups[gid].name}`;
				if (why === 'left') {
					note = null;
				} else if (why === 'deleted') {
					note = `${groups[gid].name} was deleted by its owner`;
				}
				dropGroup(gid, note);
			}
			return;
		}
		if (p.t === 'error') {
			if (/invite|full|already a member|member number/.test(why) && c.waiters.length) {
				c.waiters.shift()(null, why);
			}
			notify(`⚠ ${why}`);
		}
	}

	/** Stores a group's roster from the relay (cleaned); ignored if you are not in it. */
	function takeRoster(gid, r) {
		if (!r || typeof r !== 'object' || !Array.isArray(r.members)) {
			return;
		}
		const old = groups[gid];
		const members = r.members
			.slice(0, LIMITS.members)
			.filter((m) => m && isNum(m.n))
			.map((m) => ({ n: m.n, name: clean(m.name, LIMITS.name) || `#${m.n}`, kf: typeof m.kf === 'string' ? m.kf.slice(0, 16) : '' }));
		if (!members.some((m) => m.n === Player.MemberNumber)) {
			return;
		}
		if (!old && Object.keys(groups).length >= LIMITS.groups) {
			return;
		}
		groups[gid] = {
			id: gid,
			name: clean(r.name, LIMITS.name) || 'Group chat',
			owner: isNum(r.owner) ? r.owner : 0,
			admins: Array.isArray(r.admins) ? r.admins.filter(isNum).slice(0, LIMITS.admins) : [],
			open: r.open === true,
			members,
			online: Array.isArray(r.online) ? r.online.filter(isNum).slice(0, LIMITS.members) : (old && old.online) || [],
			last: old ? old.last || 0 : 0,
			picv: old ? old.picv : undefined,
			pic: old ? old.pic : undefined,
		};
		saveGC();
		emit('group', groupView(groups[gid]));
		if (isOpen()) {
			render(true);
		}
	}

	/**
	 * Adds group messages to `hist`. `isLive`: they just arrived (a card each); otherwise they are history
	 * from the sign-in (one card for all).
	 */
	function takeMsgs(gid, msgs, isLive) {
		const g = groups[gid];
		if (!g || !Array.isArray(msgs)) {
			return;
		}
		const me = Player.MemberNumber;
		const fresh = [];
		for (const m of msgs.slice(-200)) {
			if (!m || !Number.isInteger(m.id) || m.id <= 0) {
				continue;
			}
			const k = `g:${gid}:${m.id}`;
			if (histKeys.has(k)) {
				continue;
			}
			const sys = m.sys === true;
			const from = !sys && isNum(m.from) ? m.from : 0;
			const text = clean(m.text, LIMITS.text + 100);
			if (!text) {
				continue;
			}
			const h = {
				k,
				group: gid,
				MemberNumber: from,
				MemberName: sys ? '' : clean(m.name, LIMITS.name) || `#${from}`,
				Sent: from === me,
				Time: Number(m.at) || Date.now(),
				text,
				sys: sys ? 'roster' : undefined,
				unread: !sys && from !== me,
			};
			hist.push(h);
			histKeys.add(k);
			fresh.push(h);
			if (m.id > (g.last || 0)) {
				g.last = m.id;
			}
		}
		if (!fresh.length) {
			return;
		}
		hist.sort((a, b) => a.Time - b.Time);
		saveHistory();
		saveGC();
		const unseen = fresh.filter((h) => h.unread);
		if (unseen.length && !(isOpen() && thread === `g:${gid}` && !document.hidden)) {
			ding(unseen);
			if (isLive || unseen.length === 1) {
				for (const h of unseen.slice(-3)) {
					announce(h);
				}
			} else {
				card({
					icon: groupAv({}),
					title: `👥 ${g.name}`,
					text: `${unseen.length} new messages while you were away`,
					onClick: () => {
						thread = `g:${gid}`;
						if (!isOpen()) {
							setOpen(true);
						} else {
							render();
						}
					},
				});
			}
		}
		if (isOpen() && tab !== 'options' && tab !== 'wave') {
			render(true);
		}
	}

	/** Forgets a group (left, removed or deleted): connection, state and messages; `note` shows as a card. */
	function dropGroup(gid, note) {
		const g = groups[gid];
		delete groups[gid];
		const c = conns[gid];
		if (c) {
			c.dead = true;
			try {
				if (c.ws) {
					c.ws.close();
				}
			} catch (e) {
				/* gone */
			}
			delete conns[gid];
		}
		hist = hist.filter((h) => h.group !== gid);
		histKeys.clear();
		for (const h of hist) {
			histKeys.add(h.k);
		}
		saveGC();
		saveHistory();
		if (note && g) {
			card({ icon: groupAv({}), title: `👥 ${g.name}`, text: note });
		}
		if (g) {
			emit('groupGone', { id: gid });
		}
		if (isOpen()) {
			if (thread === `g:${gid}`) {
				thread = null;
			}
			render(true);
		}
	}

	const sendGroup = (id, text) => relaySend(id, { t: 'say', text });
	/**
	 * Makes a group on the relay and invites the `picked` friends.
	 * @param {boolean} open  anyone in it can invite (else admins only)
	 * @param {function(string)} done  gets the new group id once it exists
	 */
	function createGroup(name, picked, open, done) {
		if (!secure()) {
			return needHttps();
		}
		const id = newId();
		connectGroup(id, {
			create: { name: clean(name, LIMITS.name) || 'Group chat', open: !!open },
			onWelcome: () => {
				for (const n of picked) {
					inviteFriend(id, n);
				}
				if (done) {
					done(id);
				}
			},
			onFail: (why) => notify(`⚠ Couldn't make the group${why ? `: ${why}` : ''}`),
		});
		return id;
	}
	/** Asks the relay for an invite code, for one member number (or anyone with `member` null); `cb(code, why)`. */
	function requestInvite(id, member, cb) {
		const c = conns[id] || connectGroup(id);
		c.waiters.push(cb);
		relaySend(id, { t: 'invite', member: member == null ? null : member });
	}
	/**
	 * Invites one member to a group with a code made for them alone. Friends get it delivered
	 * (deliverInvite); for anyone else the code is returned to pass on.
	 * @returns {Promise<{ ok: boolean, sent?: string, code?: string, why?: string }>}
	 */
	function inviteToGroup(id, n) {
		const g = groups[id];
		if (!g) {
			return Promise.resolve({ ok: false, why: 'no such group' });
		}
		if (!isNum(n) || !loggedIn() || n === Player.MemberNumber) {
			return Promise.resolve({ ok: false, why: 'bad member number' });
		}
		if (isMember(g, n)) {
			return Promise.resolve({ ok: false, why: 'already a member' });
		}
		if (!canInvite(g, Player.MemberNumber)) {
			return Promise.resolve({ ok: false, why: 'only admins can invite here' });
		}
		if (g.members.length >= LIMITS.members) {
			return Promise.resolve({ ok: false, why: 'group is full' });
		}
		return new Promise((resolve) => {
			const timer = setTimeout(() => resolve({ ok: false, why: 'no answer from the group chat server' }), 10000);
			requestInvite(id, n, (code, why) => {
				clearTimeout(timer);
				if (!code) {
					return resolve({ ok: false, why: why || 'refused' });
				}
				if (isFriend(n)) {
					resolve({ ok: true, sent: deliverInvite(n, code, g.name), code });
				} else {
					resolve({ ok: true, code });
				}
			});
		});
	}

	/** Invites a friend to a group (a code for them, then deliverInvite). */
	function inviteFriend(id, n) {
		requestInvite(id, n, (code) => {
			if (code) {
				deliverInvite(n, code, groups[id] ? groups[id].name : 'Group chat');
			}
		});
	}
	/** Most invite beeps to friends without SlimeBeep per minute. */
	const PLAIN_MAX = 3;
	/** Milliseconds between those beeps. */
	const PLAIN_GAP = 3000;
	/** Times of the invite beeps sent in the last minute. */
	const plainSent = [];
	/** When the last scheduled invite beep goes out. */
	let plainAt = 0;
	/**
	 * Delivers a friend's invite code: a hidden invite card if they have SlimeBeep, else a plain beep
	 * with the code (rate limited by PLAIN_MAX / PLAIN_GAP).
	 * @returns {'invite'|'beep'|'later'} 'later': over the limit, nothing sent
	 */
	function deliverInvite(n, code, name) {
		if (peers.has(n)) {
			sendHidden(n, { sb: 1, ginv: { code, name } });
			return 'invite';
		}
		const now = Date.now();
		while (plainSent.length && now - plainSent[0] > 60000) {
			plainSent.shift();
		}
		if (plainSent.length >= PLAIN_MAX) {
			notify(`⏳ ${nameOf(n)} has no SlimeBeep: invite beeps like that go ${PLAIN_MAX} a minute, try again shortly`);
			return 'later';
		}
		plainSent.push(now);
		plainAt = Math.max(now, plainAt + PLAIN_GAP);
		setTimeout(
			() => beep(n, `👥 Come join my group chat "${name}" on SlimeBeep (a BC add-on, ask me where to get it). Group code: ${code}`, false),
			plainAt - now,
		);
		return 'beep';
	}
	/** Disables pick-list boxes past PLAIN_MAX ticked friends without SlimeBeep (or all unticked ones when `full`). */
	function capPlain(boxes, full) {
		const plain = boxes.filter((b) => b.checked && !peers.has(Number(b.value))).length;
		for (const b of boxes) {
			if (b.checked) {
				continue;
			}
			const capped = !peers.has(Number(b.value)) && plain >= PLAIN_MAX;
			b.disabled = full || capped;
			b.title = capped ? `${PLAIN_MAX} friends without SlimeBeep at a time (they get a beep each)` : '';
		}
	}
	/** Opens a group's chat (after joining it). */
	const openJoined = (gid) => {
		tab = 'groups';
		thread = `g:${gid}`;
		if (!isOpen()) {
			setOpen(true);
		} else {
			render();
		}
	};
	/** Adds a Join button after group codes in the game's chat log; each message is scanned once (data-sb-seen). */
	function joinButtonsInChat() {
		const chatLog = document.getElementById('TextAreaChatLog');
		if (!chatLog) {
			return;
		}
		for (const el of chatLog.querySelectorAll('.ChatMessage:not([data-sb-seen])')) {
			el.dataset.sbSeen = '1';
			const codes = [...new Set(String(el.textContent || '').match(CODE_IN) || [])].slice(0, 3);
			for (const code of codes) {
				const b = document.createElement('button');
				b.className = 'sb-bcjoin';
				b.textContent = groups[CODE_RE.exec(code)[1]] ? '👥 Open in SlimeBeep' : '👥 Join';
				b.title = `SlimeBeep group ${code}`;
				b.addEventListener('click', (e) => {
					e.preventDefault();
					e.stopPropagation();
					joinCode(code, openJoined);
				});
				el.appendChild(b);
			}
		}
	}
	/** Joins a group with an invite code (SB-…); `done(gid)` runs once in, or at once if already a member. */
	function joinCode(raw, done) {
		const m = CODE_RE.exec(String(raw || '').trim());
		if (!m) {
			return notify('That is not a SlimeBeep group code');
		}
		if (!secure()) {
			return needHttps();
		}
		const [, gid, code] = m;
		if (groups[gid]) {
			if (done) {
				done(gid);
			}
			return;
		}
		if (Object.keys(groups).length >= LIMITS.groups) {
			return notify('You are in too many groups');
		}
		notify('👥 Joining…');
		connectGroup(gid, {
			invite: code,
			onWelcome: () => {
				invitations = invitations.filter((i) => !i.code.startsWith(`SB-${gid}-`));
				saveGC();
				notify(`👥 Joined ${groups[gid] ? groups[gid].name : 'the group'}`);
				if (done) {
					done(gid);
				}
			},
			onFail: (why) => notify(`⚠ Couldn't join${why ? `: ${why}` : ''}`),
		});
	}
	/** Leaves a group on the relay, then forgets it here. */
	function leaveGroup(id) {
		relaySend(id, { t: 'leave' });
		setTimeout(() => dropGroup(id, null), 600);
	}
	/** Deletes a group for everyone (the relay accepts it from the owner only). */
	function deleteGroup(id) {
		relaySend(id, { t: 'disband' });
		setTimeout(() => dropGroup(id, null), 600);
	}
	/** The 🚪 box: leave the group, or (owner) delete it. */
	function askGroup(id) {
		const g = groups[id];
		if (!g || $('sb-ask')) {
			return;
		}
		const owner = g.owner === Player.MemberNumber;
		const others = g.members.filter((m) => m.n !== Player.MemberNumber).length;
		let leaveHint = "You're the only one in it, so leaving deletes it.";
		if (others) {
			leaveHint = owner
				? 'If you leave, the group stays and passes to an admin (or whoever has been in it longest).'
				: 'You can come back only with a new invite.';
		}
		const box = document.createElement('div');
		box.id = 'sb-ask';
		const canDelete = owner && others > 0;
		box.innerHTML = html`<div class="sb-crop-card">
			<b>${g.name}</b>
			<span class="sb-hint" style="text-align:center">${leaveHint}</span>
			${canDelete && html`<div class="sb-warn">Delete removes the group and all its messages <u>for everyone</u>. It can't be undone.</div>`}
			<div class="sb-crop-btns" style="flex-wrap:wrap;justify-content:center"><button class="sb-pill" data-act="keep">Cancel</button><button class="sb-go" data-act="leave">🚪 Leave</button>${canDelete && html`<button class="sb-go sb-danger" data-act="delete">🗑 Delete group</button>`}</div>
		</div>`;
		const close = () => {
			box.remove();
			document.removeEventListener('keydown', onKey, true);
		};
		const onKey = (e) => {
			if (e.key === 'Escape') {
				e.stopPropagation();
				close();
			}
		};
		box.addEventListener('click', (e) => {
			const act = e.target.dataset && e.target.dataset.act;
			if (act === 'keep' || e.target === box) {
				return close();
			}
			if (act !== 'leave' && act !== 'delete') {
				return;
			}
			close();
			if (act === 'delete') {
				deleteGroup(id);
				notify(`🗑 ${g.name} was deleted`);
			} else {
				leaveGroup(id);
				notify(`🚪 You left ${g.name}`);
			}
			thread = null;
			render();
		});
		document.addEventListener('keydown', onKey, true);
		$('sb-panel').appendChild(box);
	}
	/** Sends your current picture to every group. */
	function pushPicture() {
		const pic = myPfp();
		for (const id of Object.keys(groups)) {
			relaySend(id, { t: 'profile', pic: pic ? pic.data : null });
			groups[id].picv = pic ? pic.v : undefined;
		}
		saveGC();
	}
	/** When relayTick last ran. */
	let lastRelayCheck = 0;
	/** Every 5 s: connects to each group, checks the mailbox, sends waiting mail and keep-alives (every 4 min). */
	function relayTick() {
		if (!loggedIn() || Date.now() - lastRelayCheck < 5000) {
			return;
		}
		lastRelayCheck = Date.now();
		if (!secure()) {
			return;
		}
		getKey().catch((e) => warn(e, 'key'));
		for (const id of Object.keys(groups)) {
			if (!conns[id]) {
				connectGroup(id);
			}
		}
		if (Date.now() - mailChecked > 300000) {
			checkMail();
		}
		mailWaiting();
		// '{"t":"ping"}' is answered by the relay's auto-response.
		for (const c of Object.values(conns)) {
			if (c.ready && c.ws && c.ws.readyState === 1 && Date.now() - (c.pinged || 0) > 240000) {
				c.pinged = Date.now();
				c.ws.send('{"t":"ping"}');
			}
		}
	}
	/** ✓ if a group member's key matches the one their own SlimeBeep sent you, ⚠ if not, '' if unknown. */
	function keyMark(m) {
		if (m.n === Player.MemberNumber || !peerKeys[m.n] || !m.kf) {
			return '';
		}
		return peerKeys[m.n] === m.kf
			? html` <span title="Checked: the same key their own SlimeBeep sent you">✓</span>`
			: html` <span title="Not the key their own SlimeBeep sent you: this may not really be them">⚠</span>`;
	}

	/** Hidden beeps waiting to go out, sent 250 ms apart by drain: [member number, message]. */
	const outbox = [];
	/** Queues a hidden beep to a friend; every one also carries your picture version (`pv`) and key start (`kf`). */
	function sendHidden(n, payload) {
		if (stopped) {
			return;
		}
		const pic = myPfp();
		const kf = myKey && myKey.owner === Player.MemberNumber ? myKey.kf : undefined;
		outbox.push([n, JSON.stringify({ ...payload, pv: pic ? pic.v : 0, ...(kf ? { kf } : {}) })]);
		if (outbox.length === 1) {
			drain();
		}
	}
	/** Sends the next hidden beep in `outbox`. */
	function drain() {
		if (!outbox.length) {
			return;
		}
		const [n, msg] = outbox[0];
		try {
			ServerSend('AccountBeep', { MemberNumber: n, BeepType: PROTO, IsSecret: true, Message: msg });
		} catch (e) {
			warn(e);
		}
		setTimeout(() => {
			outbox.shift();
			drain();
		}, 250);
	}

	/** Asks online friends not yet known to have SlimeBeep whether they do (hidden, answered by their SlimeBeep). */
	function findPeers() {
		const ask = friends.filter((f) => !peers.has(f.MemberNumber)).slice(0, 40);
		for (const f of ask) {
			sendHidden(f.MemberNumber, { sb: 1, ping: 1 });
		}
		return ask.length;
	}
	/**
	 * A beep from the server. If the game's beep log has not listed it 1.5 s later (another add-on took
	 * it, or its BeepType kept it out), it is added to `hist` here. Leash beeps and add-on data are skipped.
	 */
	function catchBeep(d) {
		if (!d || typeof d.MemberNumber !== 'number' || typeof d.MemberName !== 'string') {
			return;
		}
		const type = typeof d.BeepType === 'string' ? d.BeepType : '';
		if (/leash/i.test(type)) {
			return;
		}
		const msg = typeof d.Message === 'string' ? d.Message : undefined;
		if (isSignal(msg, !!type)) {
			return;
		}
		if (type && !parseBeep(msg).text) {
			return;
		}
		const at = Date.now();
		setTimeout(() => {
			try {
				const listed = gameLog().some(
					(b) =>
						b &&
						b.MemberNumber === d.MemberNumber &&
						!b.Sent &&
						(b.Message ?? undefined) === msg &&
						Math.abs(new Date(b.Time).getTime() - at) < 15000,
				);
				console.debug(
					`[SlimeBeep] beep from ${d.MemberName} (${d.MemberNumber}), type "${type}": ${listed ? "in the game's beep list" : "not in the game's beep list, kept by SlimeBeep"}`,
				);
				if (listed || !loggedIn()) {
					return;
				}
				if (histOwner !== Player.MemberNumber) {
					loadHistory();
				}
				const k = `raw:${d.MemberNumber}|${at}`;
				if (histKeys.has(k)) {
					return;
				}
				const h = {
					k,
					MemberNumber: d.MemberNumber,
					MemberName: d.MemberName,
					Sent: false,
					Time: at,
					Message: msg,
					ChatRoomName: d.ChatRoomName || undefined,
					unread: true,
				};
				hist.push(h);
				histKeys.add(k);
				saveHistory();
				if (isReaction(h)) {
					return;
				}
				ding([h]);
				announce(h);
				if (isOpen() && tab !== 'options' && tab !== 'wave') {
					render(true);
				}
			} catch (e) {
				warn(e);
			}
		}, 1500);
	}
	/** Asks the server for the online friends (answered through onServer). */
	const askFriends = () => {
		if (!loggedIn()) {
			return;
		}
		listen();
		try {
			if (typeof ServerSend === 'function') {
				ServerSend('AccountQuery', { Query: 'OnlineFriends' });
			}
		} catch (e) {
			warn(e, 'friends');
		}
	};

	/** Whether the panel is open. */
	const isOpen = () => $('sb-panel').style.display === 'flex';
	/** Opens or closes the panel. */
	function setOpen(on) {
		if (!on) {
			for (const id of ['sb-crop', 'sb-zoom', 'sb-ask', 'sb-emoji']) {
				if ($(id)) {
					$(id).remove();
				}
			}
		}
		$('sb-panel').style.display = on ? 'flex' : 'none';
		if (on) {
			askFriends();
			render();
		}
		place();
	}

	/** Positions the toggle (opts.pos, kept on screen) and the panel next to it. */
	function place() {
		const t = $('sb-toggle'),
			panel = $('sb-panel');
		const size = t.offsetWidth || 46;
		const x = opts.pos ? opts.pos.x * innerWidth : innerWidth - size - 14;
		const y = opts.pos ? opts.pos.y * innerHeight : innerHeight - size - 14;
		const left = Math.max(0, Math.min(innerWidth - size, x));
		const top = Math.max(0, Math.min(innerHeight - size, y));
		t.style.left = `${left}px`;
		t.style.top = `${top}px`;
		placeCards();
		if (!isOpen()) {
			return;
		}
		const w = panel.offsetWidth,
			h = Math.min(480, innerHeight - 16);
		panel.style.height = `${h}px`;
		// Above the toggle if it fits, else below, else clamped to the window.
		panel.style.left = `${Math.max(8, Math.min(innerWidth - w - 8, left + size - w))}px`;
		const above = top - h - 10;
		const below = top + size + 10;
		let panelTop = Math.max(8, innerHeight - h - 8);
		if (above >= 8) {
			panelTop = above;
		} else if (below + h <= innerHeight - 8) {
			panelTop = below;
		}
		panel.style.top = `${panelTop}px`;
		placeCards();
	}

	/** Runs every second: listeners, relay, update note, new beeps (badge, sound, cards, redraw). */
	function tick() {
		try {
			updateNote();
			gameCheck();
			if (waiting.length && loggedIn() && Date.now() - (tick.asked || 0) > 60000) {
				tick.asked = Date.now();
				askFriends();
			}
			if (!tick.n || ++tick.n % 5 === 0) {
				applyThemed();
			}
			if (loggedIn()) {
				joinButtonsInChat();
			}
			tick.n = tick.n || 1;
			if (loggedIn()) {
				listen();
			}
			if (loggedIn() && histOwner === Player.MemberNumber) {
				relayTick();
			}
			const first = histOwner === null || (loggedIn() && histOwner !== Player.MemberNumber);
			const fresh = sync();
			const n = log().filter(unread).length;
			const badge = $('sb-badge');
			badge.textContent = n > 99 ? '99+' : String(n);
			badge.style.display = n ? 'block' : 'none';
			// Beeps already in the log at login get no card or sound.
			if (first || !fresh.length) {
				if (fresh.length && isOpen()) {
					render(true);
				}
				return;
			}
			ding(fresh);
			for (const h of fresh.slice(-4)) {
				announce(h);
			}
			if (isOpen() && tab !== 'options' && tab !== 'wave') {
				render(true);
			}
		} catch (e) {
			if (!tick.warned) {
				tick.warned = true;
				warn(e);
			}
		}
	}

	/** Shows a new message: a card (unless that chat is open) and, with opts.desktop, a system notification. */
	function announce(h) {
		if (isOpen() && thread === h.MemberNumber && !document.hidden) {
			return;
		}
		const text = textOf(h);
		const room = h.ChatRoomName && typeof h.Message === 'string' ? `📍 in ${h.ChatRoomName}` : '';
		const g = h.group && groups[h.group];
		if (h.group && isOpen() && thread === `g:${h.group}` && !document.hidden) {
			return;
		}
		const open = () => {
			thread = g ? `g:${g.id}` : h.MemberNumber;
			renderThread.pin = undefined;
			if (!isOpen()) {
				setOpen(true);
			} else {
				render();
			}
		};
		if (opts.popups) {
			card(
				g
					? { icon: groupAv(g), title: `👥 ${g.name}`, text: h.announceText || `${h.MemberName}: ${text}`, onClick: open }
					: { icon: avatar(h.MemberNumber, h.MemberName), title: `💌 ${h.MemberName}`, text, sub: room, onClick: open },
			);
		}
		if (opts.desktop && document.hidden && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
			try {
				const note = new Notification(`💌 ${h.MemberName}`, {
					body: room ? `${text}\n${room}` : text,
					icon: ICON,
					tag: `slimebeep-${h.MemberNumber}`,
				});
				note.onclick = () => {
					focus();
					open();
					note.close();
				};
			} catch (e) {
				/* the browser said no */
			}
		}
	}

	/** Adds a card to the stack (at most 4); it closes after `ms`, or stays with 0. */
	function card({ icon, title, text, sub = '', onClick, ms = 7000, cls = '' }) {
		if (stopped) {
			return;
		}
		const box = $('sb-cards');
		const c = document.createElement('div');
		c.className = `sb-card ${cls}`;
		c.innerHTML = html`${icon}<span class="sb-main"><b>${title}</b><span class="sb-txt">${text}</span>${sub && html`<small>${sub}</small>`}</span><button class="sb-x" title="Dismiss">✕</button>`;
		const close = () => {
			c.classList.add('out');
			setTimeout(() => {
				c.remove();
				placeCards();
			}, 250);
		};
		c.querySelector('.sb-x').addEventListener('click', (e) => {
			e.stopPropagation();
			close();
		});
		c.addEventListener('click', () => {
			close();
			if (onClick) {
				onClick();
			}
		});
		box.prepend(c);
		while (box.children.length > 4) {
			box.lastChild.remove();
		}
		placeCards();
		if (ms) {
			setTimeout(close, ms);
		}
	}

	/** Positions the card stack next to the toggle, or the panel when open. */
	function placeCards() {
		const box = $('sb-cards');
		if (!box || !box.children.length) {
			return;
		}
		const open = isOpen();
		const r = (open ? $('sb-panel') : $('sb-toggle')).getBoundingClientRect();
		const w = box.offsetWidth,
			h = box.offsetHeight;
		let left = open ? r.left - w - 10 : r.right - w;
		if (open && left < 8) {
			left = r.right + 10;
		}
		box.style.left = `${Math.max(8, Math.min(innerWidth - w - 8, left))}px`;
		let top = r.bottom + 10;
		if (open) {
			top = r.bottom - h;
		} else if (r.top - h - 10 >= 8) {
			top = r.top - h - 10;
		}
		box.style.top = `${Math.max(8, Math.min(innerHeight - h - 8, top))}px`;
	}

	/** news.json items: [{ id, title, text, date }]. */
	let newsItems = [];

	/**
	 * After an update or first install, posts a local note (only you see it) in the room chat with the
	 * version and its news.json item. Waits until the chat log has been up 3 s and the news has loaded,
	 * and retries up to 5 times until the note is really in the log.
	 */
	function updateNote() {
		if (opts.lastVersion === VERSION || !loggedIn() || typeof ChatRoomSendLocal !== 'function' || updateNote.pending) {
			return;
		}
		const chatLog = document.getElementById('TextAreaChatLog');
		const inRoom = !!chatLog && (typeof ServerPlayerIsInChatRoom === 'function' ? ServerPlayerIsInChatRoom() : !!myRoom());
		if (!inRoom) {
			updateNote.since = 0;
			return;
		}
		if (!updateNote.since) {
			updateNote.since = Date.now();
		}
		if (Date.now() - updateNote.since < 3000 || (!newsLoaded && Date.now() - started < 15000)) {
			return;
		}
		if (Date.now() - (updateNote.last || 0) < 10000) {
			return;
		}
		const item = newsItems.find((i) => i.id === VERSION);
		const first = !opts.lastVersion;
		const head = first ? `SlimeBeep v${VERSION} is ready!` : `SlimeBeep updated to v${VERSION}`;
		let body = first ? 'Click the pink slime to beep your friends.' : '';
		if (item) {
			body = item.text;
		}
		updateNote.pending = true;
		updateNote.last = Date.now();
		const iconStyle = `width:1.3em;height:1.3em;vertical-align:middle;border-radius:50%;margin-right:4px${opts.night ? ';filter:hue-rotate(-105deg)' : ''}`;
		ChatRoomSendLocal(
			String(
				html`<div class="sb-update-note" data-v="${VERSION}" style="margin:2px 0;padding:4px 10px;border-radius:10px;background:#ffe6f3;color:#a3155c;border-left:4px solid #ff4fa3;font-size:.9em"><img src="${ICON}" style="${iconStyle}" alt=""><b>${head}</b>${body && ` ${body}`}</div>`,
			),
		);
		setTimeout(() => {
			updateNote.pending = false;
			const shown = !!document.querySelector(`#TextAreaChatLog .sb-update-note[data-v="${CSS.escape(VERSION)}"]`);
			updateNote.tries = (updateNote.tries || 0) + 1;
			if (shown || updateNote.tries >= 5) {
				opts.lastVersion = VERSION;
				saveOpts();
			}
		}, 1500);
	}
	/** Once per load: a card listing what won't work if game globals in NEEDS are missing (once per version and set). */
	function gameCheck() {
		if (gameCheck.done || !loggedIn()) {
			return;
		}
		gameCheck.done = true;
		const gone = missing();
		if (!gone.length) {
			return;
		}
		const sig = `${VERSION}:${gone.map(([k]) => k).join(',')}`;
		if (opts.gameWarned === sig) {
			return;
		}
		setOpt('gameWarned', sig);
		const what = [...new Set(gone.map(([, , w]) => w))].join(', ');
		card({
			icon: logoIcon(),
			title: '🫧 SlimeBeep',
			text: `A game update changed something SlimeBeep uses, so this may not work until SlimeBeep updates: ${what}. Everything else works as usual.`,
			ms: 0,
			cls: 'news',
		});
	}
	/** Whether news() has finished (loaded or failed). */
	let newsLoaded = false;
	/** Load time, for updateNote's wait. */
	const started = Date.now();

	/** Loads news.json and shows unseen items as cards (a first install gets only the newest). */
	function news() {
		fetch(`${NEWS}?t=${Date.now()}`, { cache: 'no-store' })
			.then((r) => (r.ok ? r.json() : []))
			.then((items) => {
				const valid = Array.isArray(items) ? items.filter((i) => i && i.id && i.text) : [];
				newsItems = valid;
				if (!valid.length) {
					return;
				}
				if (!Array.isArray(opts.seenNews)) {
					opts.seenNews = valid.slice(0, -1).map((i) => i.id);
				}
				for (const i of valid.filter((x) => !opts.seenNews.includes(x.id)).slice(-3)) {
					card({
						icon: logoIcon(),
						title: i.title || '📢 SlimeBeep news',
						text: i.text,
						sub: i.date || '',
						ms: 0,
						cls: 'news',
					});
				}
				opts.seenNews = valid.map((i) => i.id);
				saveOpts();
			})
			.catch(() => {
				/* no news */
			})
			.finally(() => {
				newsLoaded = true;
			});
	}

	/** The opts.muted key of a message's chat. */
	const muteKey = (h) => (h.group ? `g:${h.group}` : `n:${h.MemberNumber}`);
	/** Whether a chat is muted (no sound; cards and unread counts still come). */
	const isMuted = (key) => Array.isArray(opts.muted) && opts.muted.includes(key);
	/** Chimes for new messages unless all of them are from muted chats. */
	const ding = (list) => {
		if (opts.sound && list.some((h) => !isMuted(muteKey(h)))) {
			chime();
		}
	};
	/** Mutes or unmutes a chat. */
	function toggleMute(key, name) {
		const on = !isMuted(key);
		setOpt('muted', [...(Array.isArray(opts.muted) ? opts.muted : []).filter((k) => k !== key), ...(on ? [key] : [])].slice(-500));
		notify(on ? `🔕 No sound for ${name}` : `🔔 Sound back on for ${name}`);
		if (isOpen()) {
			render(true);
		}
	}
	/** The 🔔/🔕 button for a chat header. */
	const muteButton = (key) =>
		html`<button id="sb-mute" title="${isMuted(key) ? 'Muted: no sound for this chat. Click for sound again' : 'Mute: no sound for this chat'}">${isMuted(key) ? '🔕' : '🔔'}</button>`;
	/** Plays a short two-note sound. */
	function chime() {
		try {
			const ac = chime.ac || (chime.ac = new AudioContext());
			for (const [f, at] of [
				[880, 0],
				[1320, 0.09],
			]) {
				const o = ac.createOscillator(),
					g = ac.createGain();
				o.type = 'sine';
				o.frequency.value = f;
				g.gain.setValueAtTime(0.0001, ac.currentTime + at);
				g.gain.exponentialRampToValueAtTime(0.12, ac.currentTime + at + 0.02);
				g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + at + 0.18);
				o.connect(g).connect(ac.destination);
				o.start(ac.currentTime + at);
				o.stop(ac.currentTime + at + 0.2);
			}
		} catch (e) {
			/* no sound, no matter */
		}
	}

	/** One-to-one chats from `hist`, newest first: [{ n, name, last (newest entry), unread (count) }]. */
	function chats() {
		const by = new Map();
		for (const b of log()) {
			if (b.group || isReaction(b)) {
				continue;
			}
			const c = by.get(b.MemberNumber) || { n: b.MemberNumber, name: null, last: null, unread: 0 };
			if (!b.Sent) {
				c.name = b.MemberName;
			}
			c.last = b;
			if (unread(b)) {
				c.unread++;
			}
			by.set(b.MemberNumber, c);
		}
		return [...by.values()]
			.map((c) => ({ ...c, name: c.name || nameOf(c.n) }))
			.sort((a, b) => new Date(b.last.Time) - new Date(a.last.Time));
	}

	/** Where an online friend is, for the lists. */
	const where = (f) => {
		if (!f) {
			return 'Offline';
		}
		if (f.ChatRoomName) {
			return `${f.Private ? '🔒' : '📍'} ${f.ChatRoomName}`;
		}
		return f.Private ? '🔒 Private room' : '🏠 Not in a room';
	};

	/** Redraws the panel for the current `tab` and `thread`; `keepScroll` keeps an open chat's scroll position. */
	function render(keepScroll) {
		if (stopped) {
			return;
		}
		const view = $('sb-view');
		// The emoji picker closes when no chat box is left after the redraw.
		setTimeout(() => {
			if (!$('sb-text')) {
				closeEmoji();
			}
		}, 0);
		showMe();
		if (!loggedIn()) {
			view.innerHTML = html`<div class="sb-empty">💤 Log in and SlimeBeep wakes up.</div>`;
			return;
		}
		if (thread !== null) {
			return renderThread(keepScroll);
		}
		const unreadChats = log().filter((h) => !h.group && unread(h)).length;
		const unreadGroups = log().filter((h) => h.group && unread(h)).length;
		const on = (t) => (tab === t || (t === 'groups' && tab === 'newgc') ? 'on' : '');
		const count = (n) => n > 0 && html`<i>${n}</i>`;
		const tabs = html`<div class="sb-tabs">
			<button data-tab="chats" class="${on('chats')}" title="Chats">💬 Chats${count(unreadChats)}</button>
			<button data-tab="groups" class="${on('groups')}" title="Group chats">👥 Groups${count(unreadGroups)}</button>
			<button data-tab="friends" class="${on('friends')}" title="Friends online">💖${count(friends.length)}</button>
			<button data-tab="wave" class="${on('wave')}" title="WaveBeep: one beep to many friends">🌊 Wave</button>
			<button data-tab="bug" class="${on('bug')}" title="Report a bug">🐞</button>
		</div>`;
		const body = $('sb-body');
		const scroll = keepScroll && body ? body.scrollTop : 0;
		if (tab === 'options') {
			view.innerHTML = html`${tabs}<div class="sb-body" id="sb-body">${optionsHtml()}</div>`;
		} else if (tab === 'newgc') {
			view.innerHTML = html`${tabs}<div class="sb-body sb-group" id="sb-body">${newGroupHtml()}</div>`;
		} else if (tab === 'wave') {
			view.innerHTML = html`${tabs}<div class="sb-body sb-group" id="sb-body">${groupHtml()}</div>`;
		} else if (tab === 'bug') {
			view.innerHTML = html`${tabs}<div class="sb-body sb-group" id="sb-body">${bugHtml()}</div>`;
		} else if (tab === 'invitefor') {
			view.innerHTML = html`${tabs}<div class="sb-body sb-group" id="sb-body">${inviteForHtml()}</div>`;
		} else {
			const q = search.toLowerCase();
			const list = {
				chats: {
					rows: chatRows,
					what: 'chats',
					empty: '🫧 No beeps yet. Pick someone in 💖 to say hi!',
					none: '🫧 No beeps yet. Pick someone in 💖 to say hi!',
				},
				groups: {
					rows: groupRows,
					what: 'group chats',
					empty: '👥 No group chats yet. Make one with your SlimeBeep friends!',
					none: 'No group by that name.',
				},
				friends: { rows: friendRows, what: 'friends', empty: '🌙 None of your friends are online.', none: 'Nobody by that name.' },
			}[tab] || { rows: friendRows, what: 'chats', empty: '🌙 None of your friends are online.', none: 'Nobody by that name.' };
			const rows = list.rows(q);
			const what = list.what;
			const empty = q ? list.none : list.empty;
			view.innerHTML = html`${tabs}<div class="sb-body" id="sb-body">
				${tab === 'groups' && groupsTop()}
				<input class="sb-search" id="sb-search" placeholder="🔍 Search ${what}…" value="${search}">
				${rows.length ? rows : html`<div class="sb-empty">${empty}</div>`}
			</div>`;
			const s = $('sb-search');
			s.addEventListener('input', () => {
				search = s.value;
				render();
				const again = $('sb-search');
				again.focus();
				again.setSelectionRange(search.length, search.length);
			});
		}
		if (keepScroll) {
			$('sb-body').scrollTop = scroll;
		}
		for (const b of view.querySelectorAll('[data-tab]')) {
			b.addEventListener('click', () => {
				tab = b.dataset.tab;
				search = '';
				render();
			});
		}
		for (const r of view.querySelectorAll('[data-open]')) {
			r.addEventListener('click', () => {
				const v = r.dataset.open;
				thread = v.startsWith('g:') ? v : Number(v);
				renderThread.pin = undefined;
				render();
			});
		}
		if ($('sb-newgc')) {
			$('sb-newgc').addEventListener('click', () => {
				tab = 'newgc';
				render();
			});
		}
		if (tab === 'groups' && $('sb-join')) {
			wireGroupsTop();
		}
		if (tab === 'newgc') {
			wireNewGroup();
		}
		if (tab === 'wave') {
			wireGroup();
		}
		if (tab === 'bug') {
			wireBug();
		}
		if (tab === 'invitefor') {
			wireInviteFor();
		}
		if (tab === 'options') {
			wireOptions();
		}
	}

	/** Rows of the 💬 Chats tab, filtered by search `q`. */
	function chatRows(q) {
		const rows = chats()
			.filter((c) => !q || c.name.toLowerCase().includes(q) || String(c.n).includes(q))
			.map((c) => {
				const online = friends.some((f) => f.MemberNumber === c.n);
				const text = textOf(c.last);
				return {
					time: new Date(c.last.Time).getTime(),
					html: html`<div class="sb-row" data-open="${c.n}">${avatar(c.n, c.name)}
				<div class="sb-main"><div class="sb-name">${online && html`<span class="sb-on"></span>`}${c.name}</div>
				<div class="sb-sub">${c.last.Sent && 'You: '}${text}</div></div>
				<div class="sb-side">${timeOf(c.last.Time)}${c.unread > 0 && html`<br><span class="sb-dot">${c.unread}</span>`}</div></div>`,
				};
			});
		return rows.sort((a, b) => b.time - a.time).map((r) => r.html);
	}

	/** Rows of the 👥 Groups tab, newest message first, filtered by `q`. */
	function groupRows(q) {
		const rows = [];
		for (const g of Object.values(groups)) {
			if (q && !g.name.toLowerCase().includes(q)) {
				continue;
			}
			const msgs = hist.filter((h) => h.group === g.id);
			const last = msgs[msgs.length - 1];
			const n = msgs.filter(unread).length;
			rows.push({
				time: last ? last.Time : 0,
				html: html`<div class="sb-row" data-open="g:${g.id}">${groupAv(g)}
				<div class="sb-main"><div class="sb-name">${g.name} <small style="font-weight:normal;color:#c08aaa">${g.members.length}</small></div>
				<div class="sb-sub">${lastLine(last)}</div></div>
				<div class="sb-side">${last && timeOf(last.Time)}${n > 0 && html`<br><span class="sb-dot">${n}</span>`}</div></div>`,
			});
		}
		return rows.sort((a, b) => b.time - a.time).map((r) => r.html);
	}
	/** The preview line of a group: "Name: text" of its last message. */
	function lastLine(last) {
		if (!last) {
			return 'No messages yet';
		}
		if (last.sys) {
			return textOf(last);
		}
		return `${last.Sent ? 'You' : last.MemberName}: ${textOf(last)}`;
	}

	/** Checkbox list of online friends (SlimeBeep users first) for inviting, without the member numbers in `exclude`. */
	function pickList(exclude = []) {
		const rows = friends
			.filter((f) => !exclude.includes(f.MemberNumber))
			.sort((a, b) => Number(peers.has(b.MemberNumber)) - Number(peers.has(a.MemberNumber)) || a.MemberName.localeCompare(b.MemberName))
			.map((f) => {
				const has = peers.has(f.MemberNumber);
				return html`<label><input type="checkbox" value="${f.MemberNumber}">${avatar(f.MemberNumber, f.MemberName)}
				<span class="sb-main" style="margin-left:8px"><span class="sb-name">${f.MemberName} ${has && '🫧'}</span>
				<span class="sb-sub" style="display:block">${has ? 'Has SlimeBeep: gets an invite card' : `Gets a beep with the code (${PLAIN_MAX} like that at a time)`}</span></span></label>`;
			});
		return rows.length ? rows : html`<div class="sb-empty">🌙 No online friends to add right now.</div>`;
	}
	/** Wires the 🔍 button that asks friends whether they have SlimeBeep (findPeers). */
	function wireFind() {
		$('sb-gc-find').addEventListener('click', () => {
			const n = findPeers();
			notify(n ? `🔍 Asking ${n} friend${n === 1 ? '' : 's'}…` : 'Everyone online is checked');
			setTimeout(
				() => {
					if (isOpen()) {
						render(true);
					}
				},
				2500 + n * 250,
			);
		});
	}

	/** HTML for the top of 👥 Groups: pending invitations and the join-by-code box. */
	function groupsTop() {
		const inv = invitations
			.filter((i) => !groups[CODE_RE.exec(i.code)[1]])
			.map(
				(i, n) => html`<div class="sb-row" style="cursor:default">${avatar(i.from, i.fromName)}
			<div class="sb-main"><div class="sb-name">${i.name}</div><div class="sb-sub">Invite from ${i.fromName}</div></div>
			<div class="sb-side" style="display:flex;gap:3px"><button class="sb-go" data-join="${n}">Join</button><button class="sb-pill" data-dismiss="${n}" title="Dismiss">✕</button></div></div>`,
			);
		const httpNote =
			!secure() &&
			html`<div class="sb-hint" style="margin:0 2px 6px">🔒 Group chats need the game's secure address: <a href="${httpsUrl()}">open it with https</a> (you'll log in again there).</div>`;
		return html`${httpNote}<button class="sb-pill" id="sb-newgc" style="width:100%;margin:2px 0 6px">👥 New group chat</button>
			<div class="sb-line" style="margin:0 0 6px"><input class="sb-search" id="sb-join-code" placeholder="Have a code? SB-…" style="margin:0"><button class="sb-pill" id="sb-join">Join</button></div>
			${inv.length > 0 && html`<div class="sb-hint" style="margin:2px 2px 0">📨 Invitations</div>${inv}`}`;
	}
	/** Wires groupsTop's buttons. */
	function wireGroupsTop() {
		const list = invitations.filter((i) => !groups[CODE_RE.exec(i.code)[1]]);
		for (const b of $('sb-view').querySelectorAll('[data-join]')) {
			b.addEventListener('click', () => {
				const i = list[Number(b.dataset.join)];
				if (i) {
					joinCode(i.code, (gid) => {
						thread = `g:${gid}`;
						render();
					});
				}
			});
		}
		for (const b of $('sb-view').querySelectorAll('[data-dismiss]')) {
			b.addEventListener('click', () => {
				const i = list[Number(b.dataset.dismiss)];
				invitations = invitations.filter((x) => x !== i);
				saveGC();
				render(true);
			});
		}
		$('sb-join').addEventListener('click', () =>
			joinCode($('sb-join-code').value, (gid) => {
				thread = `g:${gid}`;
				render();
			}),
		);
		$('sb-join-code').addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				$('sb-join').click();
			}
		});
	}

	/** HTML of the new group form. */
	function newGroupHtml() {
		return html`<div class="sb-line"><button class="sb-pill" id="sb-gc-back">‹ Back</button><b>👥 New group chat</b></div>
			<div class="sb-hint" style="margin:4px 0 6px">Up to ${LIMITS.members} people with SlimeBeep, friends or not. Tick friends to invite them now (🫧 have SlimeBeep already); anyone else can join with a code from the group's 👥 page.</div>
			<input class="sb-search" id="sb-gc-name" maxlength="${LIMITS.name}" placeholder="Group name (optional)">
			<label><input type="checkbox" id="sb-gc-open"><span>Anyone can invite<span class="sb-hint" style="display:block">Otherwise only you and the admins you pick can add people.</span></span></label>
			<div class="sb-line"><b>Invite friends</b><button class="sb-pill" id="sb-gc-find">🔍 Find SlimeBeep friends</button></div>
			${pickList()}
			<div class="sb-line" style="position:sticky;bottom:-10px;background:#fff7fb;padding:6px 0"><span id="sb-gc-count"></span><button class="sb-go" id="sb-gc-make">Create 👥</button></div>`;
	}

	/** Wires the new group form. */
	function wireNewGroup() {
		const boxes = () => [...$('sb-body').querySelectorAll('label input[type=checkbox][value]:not(:disabled)')];
		const update = () => {
			const n = boxes().filter((b) => b.checked).length;
			$('sb-gc-count').textContent = n ? `${n} to invite` : 'Just you for now';
			capPlain(boxes(), n >= LIMITS.members - 1);
		};
		for (const b of boxes()) {
			b.addEventListener('change', update);
		}
		$('sb-gc-back').addEventListener('click', () => {
			tab = 'groups';
			render();
		});
		wireFind();
		$('sb-gc-make').addEventListener('click', () => {
			const picked = boxes()
				.filter((b) => b.checked)
				.map((b) => Number(b.value));
			const name = clean($('sb-gc-name').value, LIMITS.name) || 'Group chat';
			$('sb-gc-make').disabled = true;
			notify('👥 Making the group…');
			createGroup(name, picked, $('sb-gc-open').checked, (id) => {
				notify(`👥 ${name} created`);
				tab = 'groups';
				thread = `g:${id}`;
				render();
			});
			setTimeout(() => {
				if ($('sb-gc-make')) {
					$('sb-gc-make').disabled = false;
				}
			}, 8000);
		});
		update();
	}

	/** Shows the last invite code made on the members page (renderMembers.code). */
	function showCode() {
		const out = $('sb-gm-out');
		const k = renderMembers.code;
		if (!out || !k || !renderMembers.open || k.id !== renderMembers.open) {
			return;
		}
		out.innerHTML = html`<div class="sb-row" style="cursor:default;display:block"><code style="font-size:13px;user-select:all">${k.code}</code>
			<div class="sb-hint">${k.forWho ? `Only #${k.forWho} can use it, once.` : 'Anyone with it can join, for 7 days (20 people at most).'} They paste it in 👥 Groups.</div>
			<button class="sb-pill" id="sb-gm-copy" style="margin-top:4px">📋 Copy</button></div>`;
		$('sb-gm-copy').addEventListener('click', async () => {
			try {
				await navigator.clipboard.writeText(k.code);
				notify('📋 Code copied');
			} catch (e) {
				notify('Select the code and copy it');
			}
		});
	}

	/** A group's members page: roles, name, picture, invite settings, invite codes and friend invites. */
	function renderMembers(id) {
		const g = groups[id];
		const me = Player.MemberNumber;
		const admin = isAdmin(g, me);
		const owner = g.owner === me;
		const view = $('sb-view');
		// Typed text and focus survive the redraw.
		const typing = {};
		for (const k of ['sb-gm-name', 'sb-gm-for']) {
			if ($(k) && $(k).dataset.touched) {
				typing[k] = $(k).value;
			}
		}
		const focused = document.activeElement && document.activeElement.id;
		const on = (n) => n === me || (g.online || []).includes(n);
		const rows = g.members
			.slice()
			.sort(
				(a, b) =>
					Number(on(b.n)) - Number(on(a.n)) ||
					Number(b.n === g.owner) - Number(a.n === g.owner) ||
					Number(isAdmin(g, b.n)) - Number(isAdmin(g, a.n)),
			)
			.map((m) => {
				const n = m.n;
				const role = { owner: '👑 Owner', admin: '⭐ Admin', member: 'Member' }[roleOf(g, n)];
				const acts = [];
				if (n !== me && n !== g.owner) {
					if (admin && !isAdmin(g, n) && g.admins.length < LIMITS.admins) {
						acts.push(html`<button class="sb-pill" data-act="up" data-n="${n}" title="Make admin">⭐</button>`);
					}
					if (owner && isAdmin(g, n)) {
						acts.push(html`<button class="sb-pill" data-act="down" data-n="${n}" title="Take admin">✩</button>`);
					}
					if ((admin && !isAdmin(g, n)) || owner) {
						acts.push(html`<button class="sb-pill" data-act="kick" data-n="${n}" title="Remove">✕</button>`);
					}
					if (owner) {
						acts.push(html`<button class="sb-pill" data-act="own" data-n="${n}" title="Make owner">👑</button>`);
					}
				}
				const dot = on(n) ? html`<span class="sb-on" title="Online"></span>` : html`<span class="sb-off" title="Offline"></span>`;
				return html`<div class="sb-row" style="cursor:default">${avatar(n, memberName(g, n))}
					<div class="sb-main"><div class="sb-name">${dot}${memberName(g, n)}${keyMark(m)}${peers.has(n) && ' 🫧'}</div><div class="sb-sub">${role} · #${n}${!on(n) && ' · offline'}</div></div>
					<div class="sb-side" style="display:flex;gap:3px">${acts}</div></div>`;
			});
		const invite = canInvite(g, me) && g.members.length < LIMITS.members;
		const memberNums = g.members.map((m) => m.n);
		const settings = admin
			? html`<div class="sb-line"><input class="sb-search" id="sb-gm-name" maxlength="${LIMITS.name}" value="${g.name}" style="margin:0"><button class="sb-pill" id="sb-gm-rename">Rename</button></div>
				<div class="sb-line"><span>🖼 Group picture</span><span style="display:flex;gap:4px">${g.pic && html`<button class="sb-pill" id="sb-gm-picoff">Remove</button>`}<button class="sb-pill" id="sb-gm-pic">${g.pic ? 'Change' : 'Add'}</button></span></div>
				<label><input type="checkbox" id="sb-gm-open" ${g.open && 'checked'}><span>Anyone can invite</span></label>`
			: html`<div class="sb-hint">${g.open ? 'Anyone can invite people here.' : 'Only admins can invite people here.'}</div>`;
		const inviting =
			invite &&
			html`<div class="sb-line"><b>🔗 Invite with a code</b></div>
				<div class="sb-hint">Works for anyone with SlimeBeep, friends or not. ${admin && 'Put a member number to make it work for that one person only.'}</div>
				<div class="sb-line">${admin ? html`<input class="sb-search" id="sb-gm-for" placeholder="Member # (optional)" style="margin:0;width:150px">` : html`<span></span>`}<button class="sb-go" id="sb-gm-code">Make a code</button></div>
				<div id="sb-gm-out"></div>
				<div class="sb-line"><b>Invite friends</b><button class="sb-pill" id="sb-gc-find">🔍 Find 🫧</button></div>${pickList(memberNums)}
				<div class="sb-line" style="position:sticky;bottom:-10px;background:#fff7fb;padding:6px 0"><span></span><button class="sb-go" id="sb-gm-add" disabled>Send invites</button></div>`;
		view.innerHTML = html`
			<div class="sb-thead"><button id="sb-back" title="Back to the chat">‹</button>${groupAv(g)}
				<div class="sb-main"><div class="sb-name">${g.name}</div><div class="sb-sub">${g.members.length} / ${LIMITS.members} members</div></div></div>
			<div class="sb-body sb-group" id="sb-body">
				${settings}
				${rows}
				${inviting}
			</div>`;
		for (const k of ['sb-gm-name', 'sb-gm-for']) {
			const el = $(k);
			if (!el) {
				continue;
			}
			if (k in typing) {
				el.value = typing[k];
				el.dataset.touched = '1';
			}
			el.addEventListener('input', () => {
				el.dataset.touched = '1';
			});
			if (focused === k) {
				el.focus();
			}
		}
		$('sb-back').addEventListener('click', () => {
			renderMembers.open = null;
			render();
		});
		const act = (x) => {
			relaySend(id, x);
		};
		for (const b of view.querySelectorAll('[data-act]')) {
			b.addEventListener('click', () => {
				const n = Number(b.dataset.n);
				if (b.dataset.act === 'up') {
					act({ t: 'admin', member: n, on: true });
				}
				if (b.dataset.act === 'down') {
					act({ t: 'admin', member: n, on: false });
				}
				if (b.dataset.act === 'kick') {
					act({ t: 'kick', member: n });
				}
				if (b.dataset.act === 'own') {
					act({ t: 'owner', member: n });
				}
			});
		}
		if ($('sb-gm-rename')) {
			$('sb-gm-rename').addEventListener('click', () => {
				const name = clean($('sb-gm-name').value, LIMITS.name);
				if (name && name !== g.name) {
					act({ t: 'rename', name });
				}
			});
		}
		if ($('sb-gm-open')) {
			$('sb-gm-open').addEventListener('change', (e) => act({ t: 'open', on: e.target.checked }));
		}
		if ($('sb-gm-pic')) {
			$('sb-gm-pic').addEventListener('click', () =>
				pickPicture((data) => {
					act({ t: 'gpic', pic: data });
					notify('✓ Group picture sent');
				}, 'Fit the group picture in the circle'),
			);
		}
		if ($('sb-gm-picoff')) {
			$('sb-gm-picoff').addEventListener('click', () => act({ t: 'gpic', pic: null }));
		}
		if (invite) {
			wireFind();
			$('sb-gm-code').addEventListener('click', () => {
				const want = $('sb-gm-for') ? Number($('sb-gm-for').value.replace(/\D/g, '')) : 0;
				const forWho = isNum(want) ? want : null;
				requestInvite(id, forWho, (code) => {
					if (!code) {
						return;
					}
					// Kept across redraws.
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
				capPlain(boxes(), n >= room);
			};
			for (const b of boxes()) {
				b.addEventListener('change', update);
			}
			$('sb-gm-add').addEventListener('click', () => {
				const picked = boxes()
					.filter((b) => b.checked)
					.map((b) => Number(b.value))
					.slice(0, room);
				for (const n of picked) {
					inviteFriend(id, n);
				}
				notify(`📨 ${picked.length} invite${picked.length === 1 ? '' : 's'} sent`);
				for (const b of boxes()) {
					b.checked = false;
				}
				update();
			});
		}
	}

	/** Draws an open group chat. */
	function renderGroupThread(keepScroll) {
		const mayFocus = wantsFocus();
		const id = thread.slice(2);
		const g = groups[id];
		if (!g) {
			thread = null;
			return render();
		}
		if (renderMembers.open === id) {
			return renderMembers(id);
		}
		const view = $('sb-view');
		const msgs = hist.filter((h) => h.group === id).sort((a, b) => a.Time - b.Time);
		for (const h of msgs) {
			markRead(h);
		}
		const old = $('sb-msgs');
		const atBottom = !old || old.scrollHeight - old.scrollTop - old.clientHeight < 40;
		const draft = $('sb-text') ? $('sb-text').value : '';
		const names = g.members.filter((m) => m.n !== Player.MemberNumber).map((m) => memberName(g, m.n));
		const online = conns[id] && conns[id].ready;
		const here = new Set([...(g.online || []), Player.MemberNumber]).size;
		const status = online ? html`<span class="sb-on"></span>${here} online · ` : '⏳ connecting… · ';
		const bubble = (h) => {
			if (h.sys) {
				return html`<div class="sb-sys">${textOf(h)}</div>`;
			}
			const from = !h.Sent && html`<span class="sb-from">${memberName(g, h.MemberNumber) || h.MemberName}</span>`;
			return html`<div class="sb-b ${h.Sent ? 'me' : 'them'}${isAction(textOf(h)) && ' sb-act'}">${from}${rich(textOf(h))}<em>${timeOf(h.Time)}</em></div>`;
		};
		view.innerHTML = html`
			<div class="sb-thead"><button id="sb-back" title="Back">‹</button>${groupAv(g)}
				<div class="sb-main"><div class="sb-name">${g.name}</div>
				<div class="sb-sub" title="${names.join(', ')}">${status}${g.members.length} members: You${names.length > 0 && `, ${names.join(', ')}`}</div></div>
				${muteButton(`g:${id}`)}<button id="sb-members" title="Members and invites">👥</button><button id="sb-leave" title="${g.owner === Player.MemberNumber ? 'Leave or delete the group' : 'Leave the group'}">🚪</button></div>
			<div class="sb-msgs" id="sb-msgs">${msgs.length ? msgs.map(bubble) : html`<div class="sb-empty">🫧 Say hi to the group!</div>`}</div>
			<div class="sb-compose">
				<button class="pin" id="sb-emo" title="Emoji">😊</button>
				<textarea id="sb-text" maxlength="${LIMITS.text}" placeholder="Message ${g.name}… (/help)"></textarea>
				<button id="sb-send" title="Send (Enter)">➤</button>
			</div>`;
		const box = $('sb-msgs');
		if (!keepScroll || atBottom) {
			box.scrollTop = box.scrollHeight;
		}
		const ta = $('sb-text');
		ta.value = draft;
		$('sb-back').addEventListener('click', () => {
			thread = null;
			render();
		});
		$('sb-members').addEventListener('click', () => {
			renderMembers.open = id;
			render();
		});
		$('sb-mute').addEventListener('click', () => toggleMute(`g:${id}`, g.name));
		$('sb-leave').addEventListener('click', () => askGroup(id));
		$('sb-emo').addEventListener('click', () => toggleEmoji());
		const send = () => {
			const typed = command(ta.value);
			if (typed === null) {
				ta.value = '';
				return;
			}
			const text = clean(typed, LIMITS.text);
			if (!text) {
				return;
			}
			closeEmoji();
			sendGroup(id, text);
			ta.value = '';
		};
		$('sb-send').addEventListener('click', send);
		ta.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				send();
			}
		});
		if (mayFocus) {
			ta.focus();
		}
	}

	/** Rows of the 💖 tab: online friends, then offline ones greyed out, filtered by `q`. */
	function friendRows(q) {
		const match = (name, n, room = '') => !q || name.toLowerCase().includes(q) || String(n).includes(q) || room.toLowerCase().includes(q);
		const on = friends
			.filter((f) => match(f.MemberName, f.MemberNumber, f.ChatRoomName || ''))
			.sort((a, b) => a.MemberName.localeCompare(b.MemberName))
			.map(
				(f) => html`<div class="sb-row" data-open="${f.MemberNumber}">${avatar(f.MemberNumber, f.MemberName)}
				<div class="sb-main"><div class="sb-name"><span class="sb-on"></span>${f.MemberName}${{ Lover: ' 💞', Submissive: ' 🎀' }[f.Type]}${peers.has(f.MemberNumber) && html` <span title="Has SlimeBeep">🫧</span>`}</div>
				<div class="sb-sub">${where(f)}${f.ChatRoomMemberCount > 0 && ` · ${f.ChatRoomMemberCount}/${f.ChatRoomLimit || '?'}`}</div></div>
				<div class="sb-side">#${f.MemberNumber}</div></div>`,
			);
		const onlineNums = new Set(friends.map((f) => f.MemberNumber));
		const all = Player.FriendNames && typeof Player.FriendNames.forEach === 'function' ? [...Player.FriendNames.entries()] : [];
		const off = all
			.filter(([n, name]) => isNum(n) && !onlineNums.has(n) && n !== Player.MemberNumber && match(String(name || ''), n))
			.sort((a, b) => String(a[1] || '').localeCompare(String(b[1] || '')))
			.map(
				([n, name]) => html`<div class="sb-row offline" data-open="${n}">${avatar(n, name)}
				<div class="sb-main"><div class="sb-name"><span class="sb-off"></span>${name || `#${n}`}${peers.has(n) && html` <span title="Has SlimeBeep">🫧</span>`}</div>
				<div class="sb-sub">Offline</div></div><div class="sb-side">#${n}</div></div>`,
			);
		if (!off.length) {
			return on;
		}
		return [...on, html`<div class="sb-hint" style="margin:8px 4px 2px">Offline (${off.length})</div>`, ...off];
	}

	/** The 📍 room line under a beep (with Join), shown when the room differs from that side's previous beep. */
	function roomLine(b, msgs, i) {
		const room = typeof b.Message === 'string' && typeof b.ChatRoomName === 'string' ? b.ChatRoomName.trim() : '';
		if (!room) {
			return '';
		}
		const prev = msgs
			.slice(0, i)
			.reverse()
			.find((x) => x.Sent === b.Sent);
		if (prev && (prev.ChatRoomName || '').trim() === room) {
			return '';
		}
		const join = !b.Sent && html` <button class="sb-pill sb-joinroom" data-room="${room}">Join</button>`;
		return html`<span class="sb-room">📍 ${b.Sent ? 'invited to' : 'in'} ${room}${join}</span>`;
	}

	/** When joinRoom last ran (one try per 3 s). */
	let joiningRoom = 0;
	/**
	 * Joins a chat room like the game's chat search: leaves the current room if the game allows it now,
	 * then sends ServerRoomJoin; the game handles the answer.
	 */
	async function joinRoom(roomName) {
		const name = String(roomName || '').trim();
		if (!name || !loggedIn() || Date.now() - joiningRoom < 3000) {
			return;
		}
		if (myRoom() === name) {
			return notify(`You're already in ${name}`);
		}
		const inRoom = typeof ChatRoomData !== 'undefined' && ChatRoomData;
		if (inRoom) {
			if (typeof CurrentScreen !== 'undefined' && CurrentScreen !== 'ChatRoom') {
				return notify('Go back to your room first, then join');
			}
			if (typeof ChatRoomCanLeave === 'function' && !ChatRoomCanLeave()) {
				return notify("You can't leave this room right now");
			}
			if (typeof Player.IsSlow === 'function' && Player.IsSlow()) {
				return notify("You're too slow to just walk out: leave the room first");
			}
			if (typeof ChatRoomLeave !== 'function' || typeof CommonSetScreen !== 'function') {
				return notify('⚠ The game changed: join from the room list');
			}
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
				// On failure, the error's name is the server's answer (RoomFull, RoomLocked, CannotFindRoom…).
				if (r && r.error) {
					if (typeof ChatSearchSendToast === 'function') {
						ChatSearchSendToast(r.error.name);
					}
					notify(
						`⚠ Couldn't join ${name}${
							/^[A-Za-z]+$/.test(r.error.name || '')
								? ` (${r.error.name
										.replace(/^Room|Error$/g, '')
										.replace(/([a-z])([A-Z])/g, '$1 $2')
										.toLowerCase()})`
								: ''
						}`,
					);
				}
			} else if (typeof ServerSend === 'function') {
				ServerSend('ChatRoomJoin', { Name: name });
			}
		} catch (e) {
			warn(e, 'join room');
			notify(`⚠ Couldn't join ${name}`);
		}
	}

	/** Draws an open chat (one-to-one, or hands over to renderGroupThread). */
	function renderThread(keepScroll) {
		if (typeof thread === 'string') {
			return renderGroupThread(keepScroll);
		}
		const mayFocus = wantsFocus();
		const n = thread;
		const view = $('sb-view');
		const msgs = log().filter((b) => b.MemberNumber === n && !isReaction(b));
		// Opening the chat marks it read (in the game's log too).
		for (const b of msgs) {
			markRead(b);
		}
		const f = friends.find((x) => x.MemberNumber === n);
		const old = $('sb-msgs');
		const atBottom = !old || old.scrollHeight - old.scrollTop - old.clientHeight < 40;
		const draft = $('sb-text') ? $('sb-text').value : '';
		const room = myRoom();
		const pinOn = !!room && (renderThread.pin ?? opts.shareRoom);
		const waitingHere = waiting.filter((w) => w.n === n);
		const offline = isOffline(n);
		const mailMark = (b) => {
			if (!b.mail) {
				return '';
			}
			const title = b.Sent
				? 'Left in their SlimeBeep mailbox while they were offline'
				: 'Left in your SlimeBeep mailbox while you were offline';
			return html`<span title="${title}">📬</span> `;
		};
		const uncheckedMark = (b) =>
			b.unchecked && html`<span title="Their SlimeBeep has not told yours its key yet, so who sent this could not be checked">⚠</span> `;
		let bubbles = !waitingHere.length && html`<div class="sb-empty">🫧 Say hi!</div>`;
		if (msgs.length) {
			bubbles = msgs.map(
				(b, i) =>
					html`<div class="sb-b ${b.Sent ? 'me' : 'them'}${isAction(textOf(b)) && ' sb-act'}">${rich(textOf(b))}${roomLine(b, msgs, i)}<em>${mailMark(b)}${uncheckedMark(b)}${timeOf(b.Time)}</em></div>`,
			);
		}
		const waitingBubbles = waitingHere.map(
			(w) =>
				html`<div class="sb-b me sb-wait">${w.text}<em>⏳ sends when they're online · <a href="#" data-cancel="${w.id}">cancel</a></em></div>`,
		);
		const pinTitle = room ? `Let them join me: adds a button to join you in "${room}"` : "You're not in a chat room";
		const placeholder = offline ? `${nameOf(n)} is offline: it'll wait for them…` : `Beep ${nameOf(n)}… (/help)`;
		view.innerHTML = html`
			<div class="sb-thead"><button id="sb-back" title="Back">‹</button>${avatar(n, nameOf(n))}
				<div class="sb-main"><div class="sb-name">${nameOf(n)} <small style="font-weight:normal;color:#c08aaa">#${n}</small></div>
				<div class="sb-sub">${f && html`<span class="sb-on"></span>`}${where(f)}</div></div>${muteButton(`n:${n}`)}</div>
			<div class="sb-msgs" id="sb-msgs">${bubbles}${waitingBubbles}</div>
			<div class="sb-compose">
				<button class="pin ${pinOn && 'on'}" id="sb-pin" ${!room && 'disabled'} title="${pinTitle}">📍</button>
				<button class="pin" id="sb-emo" title="Emoji">😊</button>
				<textarea id="sb-text" maxlength="1000" placeholder="${placeholder}"></textarea>
				<button id="sb-send" title="Send (Enter)">➤</button>
			</div>`;
		const box = $('sb-msgs');
		if (!keepScroll || atBottom) {
			box.scrollTop = box.scrollHeight;
		}
		const ta = $('sb-text');
		ta.value = draft;
		$('sb-back').addEventListener('click', () => {
			thread = null;
			renderThread.pin = undefined;
			render();
		});
		$('sb-pin').addEventListener('click', () => {
			renderThread.pin = !pinOn;
			render(true);
		});
		$('sb-mute').addEventListener('click', () => toggleMute(`n:${n}`, nameOf(n)));
		for (const b of view.querySelectorAll('.sb-joinroom')) {
			b.addEventListener('click', (e) => {
				e.preventDefault();
				joinRoom(b.dataset.room);
			});
		}
		for (const a of view.querySelectorAll('[data-cancel]')) {
			a.addEventListener('click', (e) => {
				e.preventDefault();
				waiting = waiting.filter((w) => w.id !== a.dataset.cancel);
				saveWaiting();
				render(true);
			});
		}
		$('sb-emo').addEventListener('click', () => toggleEmoji());
		const send = () => {
			const typed = command(ta.value);
			if (typed === null) {
				ta.value = '';
				return;
			}
			const text = typed.trim();
			if (!text) {
				return;
			}
			closeEmoji();
			if (isOffline(n)) {
				queueBeep(n, text);
				ta.value = '';
				return render(true);
			}
			// Read at send time so a quick second Enter doesn't add the room again.
			const invite = !!myRoom() && (renderThread.pin ?? opts.shareRoom);
			beep(n, text, invite);
			// 📍 applies to one beep.
			renderThread.pin = false;
			sync();
			notify(`✓ Beep sent to ${nameOf(n)}${invite ? ' 📍' : ''}`);
			ta.value = '';
			setTimeout(() => render(true), 50);
		};
		$('sb-send').addEventListener('click', send);
		ta.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				send();
			}
		});
		if (mayFocus) {
			ta.focus();
		}
	}

	/** Whether a friend is known to be offline. */
	const isOffline = (n) => friendsKnown && isFriend(n) && !friends.some((f) => f.MemberNumber === n);
	/** Adds a beep for an offline friend to `waiting` and tries their mailbox. */
	function queueBeep(n, text) {
		if (waiting.length >= 100) {
			return notify('⚠ Too many beeps waiting already');
		}
		waiting.push({ id: newId(), n, text: text.slice(0, 1000), at: Date.now() });
		saveWaiting();
		notify(`⏳ ${nameOf(n)} is offline: it goes out when they're back`);
		mailWaiting(true);
	}
	/** True while sendWaiting runs. */
	let sendingWaiting = false;
	/** Sends the `waiting` beeps whose friend is now online, opts.gap seconds apart. */
	async function sendWaiting() {
		if (sendingWaiting || !waiting.length || !loggedIn()) {
			return;
		}
		const ready = waiting.filter((w) => friends.some((f) => f.MemberNumber === w.n));
		if (!ready.length) {
			return;
		}
		sendingWaiting = true;
		try {
			for (const [i, w] of ready.entries()) {
				if (!waiting.includes(w)) {
					continue;
				} // cancelled meanwhile
				beep(w.n, w.text, false);
				waiting = waiting.filter((x) => x !== w);
				saveWaiting();
				if (i < ready.length - 1) {
					await new Promise((r) => setTimeout(r, opts.gap * 1000));
				}
			}
			sync();
			const names = [...new Set(ready.map((w) => nameOf(w.n)))];
			notify(`📨 Waiting beep${ready.length === 1 ? '' : 's'} sent to ${names.join(', ')}`);
			if (isOpen()) {
				render(true);
			}
		} finally {
			sendingWaiting = false;
		}
	}

	/** Emoji picker tabs: tab icon -> space-separated emoji. */
	const EMOJI = {
		'😊': '😀 😁 😂 🤣 😊 😇 🙂 😉 😍 🥰 😘 😋 😛 😜 🤪 😏 😌 😴 🥺 😳 😱 😭 😢 😤 😡 🤬 🙄 😬 🤔 🤭 🤫 😶 😈 👿 🤤 🥵 🥴 😵 🤯 🥳 😎 🤓 🫠 🫣 🫢',
		'❤️': '❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💖 💗 💓 💕 💞 💘 💝 💔 ❣️ 💋 💌 💐 🌹 🌸 💍 🔥 ✨ 💫 ⭐ 🌟',
		'👋': '👋 🤚 ✋ 🖐️ 👌 🤌 ✌️ 🤞 🫰 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 🫶 👐 🤲 🙏 💪 🫦 👀 👅 💅 🤗',
		'🐱': '🐱 😺 😸 😻 😼 🙀 🐶 🐰 🐇 🦊 🐺 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🐔 🐧 🐦 🦋 🐝 🐞 🐙 🦄 🐉 🐍 🦇',
		'🎀': '🎀 🎁 🎉 🎈 🎂 🍰 🧁 🍭 🍬 🍫 🍓 🍒 🍑 🍆 🍌 🍷 🍸 🍹 🧋 ☕ 🍵 🍕 🍔 🍟 🌮 🍣 🍜 🔗 ⛓️ 🔒 🔑 🗝️ 🪢 🧸 👑 💎 🕯️ 🎶 🎮',
	};
	/** opts.recentEmoji, validated. */
	const loadRecent = () =>
		Array.isArray(opts.recentEmoji) ? opts.recentEmoji.filter((e) => typeof e === 'string' && e.length <= 16).slice(0, 24) : [];
	/** Open emoji tab; null opens 🕘 when there are recent ones. */
	let emojiTab = null;
	/** Closes the emoji picker. */
	function closeEmoji() {
		const el = $('sb-emoji');
		if (el) {
			el.remove();
		}
	}
	/** Opens or closes the emoji picker. */
	function toggleEmoji() {
		if ($('sb-emoji')) {
			return closeEmoji();
		}
		const box = document.createElement('div');
		box.id = 'sb-emoji';
		emojiTab = null; // opens on 🕘 when there are any
		$('sb-panel').appendChild(box);
		drawEmoji();
	}
	/** Draws the picker; a click inserts the emoji at the cursor. */
	function drawEmoji() {
		const box = $('sb-emoji');
		if (!box) {
			return;
		}
		const recentEmoji = loadRecent();
		const tabs = [...(recentEmoji.length ? ['🕘'] : []), ...Object.keys(EMOJI)];
		if (!tabs.includes(emojiTab)) {
			emojiTab = tabs[0];
		}
		const list = emojiTab === '🕘' ? recentEmoji : EMOJI[emojiTab].split(' ');
		box.innerHTML = html`<div class="sb-emo-tabs">${tabs.map((t) => html`<button data-etab="${t}" class="${t === emojiTab && 'on'}">${t}</button>`)}<button data-eclose="1" title="Close">✕</button></div>
			<div class="sb-emo-grid">${list.map((e) => html`<button data-emo="${e}">${e}</button>`)}</div>`;
		box.onclick = (ev) => {
			const b = ev.target.closest('button');
			if (!b) {
				return;
			}
			if (b.dataset.eclose) {
				return closeEmoji();
			}
			if (b.dataset.etab) {
				emojiTab = b.dataset.etab;
				return drawEmoji();
			}
			const e = b.dataset.emo;
			const ta = $('sb-text');
			if (!e || !ta) {
				return;
			}
			const at = ta.selectionStart ?? ta.value.length,
				end = ta.selectionEnd ?? at;
			if (ta.value.length + e.length > Number(ta.maxLength || 1000)) {
				return;
			}
			ta.value = ta.value.slice(0, at) + e + ta.value.slice(end);
			ta.selectionStart = ta.selectionEnd = at + e.length;
			ta.focus();
			setOpt('recentEmoji', [e, ...recentEmoji.filter((x) => x !== e)].slice(0, 24));
		};
	}

	/** Chat commands for /help: [usage, description]. */
	const COMMANDS = [
		['/me <action>', 'Does an action: /me waves sends *waves*'],
		['/shrug [text]', 'Adds ¯\\_(ツ)_/¯'],
		['/roll [sides]', 'Rolls a die (6 sides unless you say): *rolls a d20: 13*'],
		['/flip', 'Flips a coin'],
		['/help', 'This list'],
		['//text', 'Sends a message that starts with /'],
	];
	/**
	 * Applies a chat command to typed text.
	 * @returns {?string} the text to send, or null for nothing (/help, or an unknown command)
	 */
	function command(raw) {
		const text = String(raw || '').trim();
		if (!text.startsWith('/')) {
			return raw;
		}
		if (text.startsWith('//')) {
			return text.slice(1);
		}
		const m = /^\/(\w+)\s*([\s\S]*)$/.exec(text);
		const name = m ? m[1].toLowerCase() : '',
			rest = m ? m[2].trim() : '';
		switch (name) {
			case 'me':
			case 'action':
			case 'emote':
				if (!rest) {
					notify('/me what? Like: /me waves');
					return null;
				}
				return `*${rest.replace(/^\*+|\*+$/g, '')}*`;
			case 'shrug':
				return `${rest ? `${rest} ` : ''}¯\\_(ツ)_/¯`;
			case 'roll':
			case 'dice': {
				const sides = Math.max(2, Math.min(1000, parseInt(rest, 10) || 6));
				const n = 1 + Math.floor((crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32) * sides);
				return `*rolls a d${sides}: ${n}* 🎲`;
			}
			case 'flip':
			case 'coin':
				return `*flips a coin: ${crypto.getRandomValues(new Uint8Array(1))[0] & 1 ? 'heads' : 'tails'}* 🪙`;
			case 'help':
			case 'commands':
				showHelp();
				return null;
			default:
				notify(`Unknown command /${name || '?'}: try /help`);
				return null;
		}
	}
	/** Shows the /help box in the panel. */
	function showHelp() {
		if ($('sb-ask')) {
			return;
		}
		const box = document.createElement('div');
		box.id = 'sb-ask';
		box.innerHTML = html`<div class="sb-crop-card" style="align-items:stretch">
			<b style="text-align:center">💬 Chat commands</b>
			${COMMANDS.map(([c, d]) => html`<div class="sb-cmd"><code>${c}</code><span>${d}</span></div>`)}
			<span class="sb-hint" style="text-align:center">😊 opens the emoji. *giggles* shows as an action.</span>
			<div class="sb-crop-btns" style="justify-content:center"><button class="sb-go" data-act="keep">Got it</button></div>
		</div>`;
		const close = () => {
			box.remove();
			document.removeEventListener('keydown', onKey, true);
			if ($('sb-text')) {
				$('sb-text').focus();
			}
		};
		const onKey = (e) => {
			if (e.key === 'Escape') {
				e.stopPropagation();
				close();
			}
		};
		box.addEventListener('click', (e) => {
			if (e.target === box || (e.target.dataset && e.target.dataset.act === 'keep')) {
				close();
			}
		});
		document.addEventListener('keydown', onKey, true);
		$('sb-panel').appendChild(box);
	}

	/** Last pointerdown on the panel or toggle. */
	let lastPanelTouch = 0;
	/**
	 * Whether a redraw may focus SlimeBeep's chat box: only if focus is already in the panel or it was
	 * touched in the last 1.5 s, so it never takes the cursor from the game's chat input.
	 */
	function wantsFocus() {
		const a = document.activeElement,
			panel = $('sb-panel');
		if (a && a !== document.body && panel && panel.contains(a)) {
			return true;
		}
		if (a && a !== document.body) {
			return false;
		} // focus is elsewhere, e.g. the game's chat
		return Date.now() - lastPanelTouch < 1500;
	}

	/** Shows a short toast by the toggle. */
	function notify(text) {
		if (stopped) {
			return;
		}
		const t = $('sb-toast'),
			s = $('sb-toggle');
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

	/** Sends a beep with the game's own ServerSendBeepMessage (its format, limits and beep log); `includeRoom` adds your room. */
	function beep(n, text, includeRoom) {
		if (stopped) {
			return;
		}
		try {
			if (typeof ServerSendBeepMessage === 'function') {
				ServerSendBeepMessage(n, text, { includeRoom });
			} else if (typeof ServerSend === 'function') {
				ServerSend('AccountBeep', { MemberNumber: n, BeepType: '', IsSecret: !includeRoom, Message: text });
			} else {
				throw new Error('the game has no beep sender any more');
			}
		} catch (e) {
			warn(e, 'beep');
			notify('⚠ That beep could not be sent');
		}
	}

	/** HTML of the 🌊 WaveBeep tab. */
	function groupHtml() {
		const room = myRoom();
		const picked = new Set(groupHtml.picked || opts.picked);
		const list = friends
			.slice()
			.sort((a, b) => a.MemberName.localeCompare(b.MemberName))
			.map(
				(f) =>
					html`<label><input type="checkbox" value="${f.MemberNumber}" ${picked.has(f.MemberNumber) && 'checked'}>${avatar(f.MemberNumber, f.MemberName)}
			<span class="sb-main" style="margin-left:8px"><span class="sb-name">${f.MemberName}</span><span class="sb-sub" style="display:block">${where(f)}</span></span></label>`,
			);
		const roomHint = room ? `They get a button to join you in "${room}".` : "You're not in a chat room, so there's nothing to join.";
		const myRoomButton =
			room &&
			friends.some((f) => f.ChatRoomName === room) &&
			html`<button class="sb-pill" id="sb-myroom" title="Only the friends in your room">📍 My room</button> `;
		return html`<div class="sb-line" style="margin-top:2px"><b>🌊 WaveBeep</b></div><div class="sb-hint" style="margin:0 0 6px">One beep, sent to every friend you tick.</div>
			<textarea id="sb-gmsg" maxlength="1000" placeholder="Write your beep…">${groupHtml.draft || ''}</textarea>
			<label title="Adds a button to your beep that takes them to the chat room you're in."><input type="checkbox" id="sb-groom" ${!room && 'disabled'} ${room && (groupHtml.room ?? opts.shareRoom) && 'checked'}>
				<span>📍 Let them join me<span class="sb-hint" style="display:block">${roomHint}</span></span></label>
			<div class="sb-line"><b>Beep who?</b><span>${myRoomButton}<button class="sb-pill" id="sb-all">All</button> <button class="sb-pill" id="sb-none">None</button></span></div>
			${list.length ? list : html`<div class="sb-empty">🌙 None of your friends are online.</div>`}
			<div class="sb-line" style="position:sticky;bottom:-10px;background:#fff7fb;padding:6px 0"><span id="sb-gcount"></span><button class="sb-go" id="sb-gsend">Send 🌊</button></div>
			<div class="sb-hint" id="sb-gstatus"></div>`;
	}

	/** Wires the WaveBeep tab and sends the beeps, opts.gap seconds apart. */
	function wireGroup() {
		const boxes = () => [...$('sb-body').querySelectorAll('label input[type=checkbox]:not(#sb-groom)')];
		const chosen = () =>
			boxes()
				.filter((b) => b.checked)
				.map((b) => Number(b.value));
		const count = () => {
			const n = chosen().length;
			groupHtml.picked = chosen();
			if (opts.remember) {
				// Offline friends stay in `picked`.
				const online = new Set(friends.map((f) => f.MemberNumber));
				opts.picked = [...new Set([...opts.picked.filter((m) => !online.has(m)), ...groupHtml.picked])];
				saveOpts();
			}
			$('sb-gcount').textContent = `${n} picked of ${friends.length} online`;
			$('sb-gsend').disabled = sending || n === 0;
		};
		for (const b of boxes()) {
			b.addEventListener('change', count);
		}
		$('sb-all').addEventListener('click', () => {
			for (const b of boxes()) {
				b.checked = true;
			}
			count();
		});
		$('sb-none').addEventListener('click', () => {
			for (const b of boxes()) {
				b.checked = false;
			}
			count();
		});
		// 📍 My room: ticks only the friends in your room.
		if ($('sb-myroom')) {
			$('sb-myroom').addEventListener('click', () => {
				const here = new Set(friends.filter((f) => f.ChatRoomName && f.ChatRoomName === myRoom()).map((f) => f.MemberNumber));
				for (const b of boxes()) {
					b.checked = here.has(Number(b.value));
				}
				count();
			});
		}
		$('sb-gmsg').addEventListener('input', (e) => {
			groupHtml.draft = e.target.value;
		});
		$('sb-groom').addEventListener('change', (e) => {
			groupHtml.room = e.target.checked;
		});
		$('sb-gsend').addEventListener('click', async () => {
			const msg = $('sb-gmsg').value.trim();
			const targets = chosen();
			const status = (t) => {
				const s = $('sb-gstatus');
				if (s) {
					s.textContent = t;
				}
			};
			if (!msg) {
				return status('Write a message first.');
			}
			if (!targets.length || sending) {
				return;
			}
			sending = true;
			$('sb-gsend').disabled = true;
			const includeRoom = $('sb-groom').checked && !!myRoom();
			let done = 0;
			for (const n of targets) {
				beep(n, msg, includeRoom);
				done += 1;
				status(`🌊 Sending… ${done} / ${targets.length} (${nameOf(n)})`);
				if (done < targets.length) {
					await new Promise((r) => setTimeout(r, opts.gap * 1000));
				}
			}
			sending = false;
			groupHtml.draft = '';
			if ($('sb-gmsg')) {
				$('sb-gmsg').value = '';
			}
			status(`✨ Done: beeped ${done} friend${done === 1 ? '' : 's'}.`);
			notify(`✓ Beep sent to ${done === 1 ? nameOf(targets[0]) : `${done} friends`}`);
			if ($('sb-gsend')) {
				count();
			}
		});
		count();
	}

	/**
	 * Registers SlimeBeep's page in the game's Settings > Extensions, drawn on the game's canvas with its
	 * own checkbox and button helpers. Same options as the ⚙ tab.
	 */
	function registerSettings() {
		if (typeof PreferenceRegisterExtensionSetting !== 'function') {
			return;
		}
		if (typeof PreferenceExtensionsSettings === 'object' && PreferenceExtensionsSettings && PreferenceExtensionsSettings.SlimeBeep) {
			return;
		}
		const EXIT = [1815, 75, 90, 90];
		const LEFT = 500,
			TOP = 190,
			ROW = 72;
		const boxes = [
			['night', 'Night mode (a night blue slime)', () => opts.night, (on) => setNight(on)],
			// Listed only while a theme add-on is running.
			[
				'themed',
				() => `Match my ${(themeSource() || {}).name || 'theme'} colours`,
				() => opts.themed,
				(on) => setThemed(on),
				() => !!themeSource(),
			],
			['sound', 'Pop sound for new beeps', () => opts.sound, (on) => setOpt('sound', on)],
			['popups', 'A card by the slime for each new beep', () => opts.popups, (on) => setOpt('popups', on)],
			['desktop', 'Desktop notification when the game is in the background', () => opts.desktop, (on) => setDesktop(on)],
			['share', '"Let them join me" starts on', () => opts.shareRoom, (on) => setOpt('shareRoom', on)],
			[
				'remember',
				'Remember who I picked for WaveBeeps',
				() => opts.remember,
				(on) => {
					setOpt('remember', on);
					if (!on) {
						setOpt('picked', []);
					}
				},
			],
			['keep', 'Keep my beeps in this browser after I log out', () => opts.keep, (on) => setKeep(on)],
		];
		// Boxes shown right now (an entry's 5th item decides).
		const shown = () => boxes.filter((b) => !b[4] || b[4]());
		const gapY = () => TOP + shown().length * ROW;
		// Recomputed every frame: the shown boxes can change.
		const layout = () => {
			const g = gapY(),
				btnY = g + ROW;
			return {
				g,
				MINUS: [LEFT, g, 64, 64],
				PLUS: [LEFT + 80, g, 64, 64],
				RESET: [LEFT, btnY, 420, 64],
				CLEAR: [LEFT + 450, btnY, 420, 64],
				PIC: [LEFT, btnY + ROW, 420, 64],
				NOPIC: [LEFT + 450, btnY + ROW, 420, 64],
			};
		};
		const mouse = (r) => typeof MouseIn === 'function' && MouseIn(...r);
		PreferenceRegisterExtensionSetting({
			Identifier: 'SlimeBeep',
			ButtonText: 'SlimeBeep',
			Image: ICON,
			load: () => {
				// Leaves the panel's ⚙ tab so both don't show the same options.
				if (tab === 'options') {
					tab = 'chats';
					if (isOpen()) {
						render();
					}
				}
			},
			run: () => {
				try {
					DrawCharacter(Player, 50, 50, 0.9);
					if (stopped) {
						DrawText('SlimeBeep is off until you reload the game.', 1100, 300, 'Black', 'Gray');
						DrawText('Then click your SlimeBeep bookmark again (the userscript starts it on its own).', 1100, 370, '#B00020', 'Gray');
						DrawButton(...EXIT, '', 'White', 'Icons/Exit.png');
						return;
					}
					MainCanvas.textAlign = 'left';
					DrawText(`- SlimeBeep Settings - v${VERSION}`, LEFT, 125, 'Black', 'Gray');
					const { g, MINUS, PLUS, RESET, CLEAR, PIC, NOPIC } = layout();
					shown().forEach(([, label, get], i) =>
						DrawCheckbox(LEFT, TOP + i * ROW, 64, 64, typeof label === 'function' ? label() : label, !!get()),
					);
					DrawButton(...MINUS, '-', 'White');
					DrawButton(...PLUS, '+', 'White');
					DrawText(`Wait ${opts.gap} seconds between WaveBeeps`, LEFT + 180, g + 33, 'Black', 'Gray');
					MainCanvas.textAlign = 'center';
					DrawButton(...RESET, 'Reset slime position', 'White');
					DrawButton(...CLEAR, `Clear kept beeps (${hist.length})`, 'White');
					DrawButton(...PIC, myPfp() ? 'Change profile picture' : 'Choose profile picture', 'White');
					drawMyPic(PIC[0] - 90, PIC[1], 64);
					if (myPfp()) {
						DrawButton(...NOPIC, 'Remove profile picture', 'White');
					}
					DrawButton(...EXIT, '', 'White', 'Icons/Exit.png');
				} catch (e) {
					// Never throw inside the game's draw loop.
				} finally {
					if (typeof MainCanvas !== 'undefined' && MainCanvas) {
						MainCanvas.textAlign = 'center';
					}
				}
			},
			click: () => {
				try {
					if (mouse(EXIT)) {
						if (typeof PreferenceSubscreenExtensionsClear === 'function') {
							PreferenceSubscreenExtensionsClear();
						}
						return;
					}
					if (stopped) {
						return;
					}
					const { MINUS, PLUS, RESET, CLEAR, PIC, NOPIC } = layout();
					shown().forEach(([, , get, set], i) => {
						if (mouse([LEFT, TOP + i * ROW, 64, 64])) {
							set(!get());
						}
					});
					if (mouse(MINUS)) {
						setOpt('gap', Math.max(1, opts.gap - 0.5));
					}
					if (mouse(PLUS)) {
						setOpt('gap', Math.min(10, opts.gap + 0.5));
					}
					if (mouse(RESET)) {
						setOpt('pos', null);
						place();
					}
					if (mouse(CLEAR)) {
						clearKept();
					}
					if (mouse(PIC)) {
						pickPicture();
					}
					if (myPfp() && mouse(NOPIC)) {
						setOpt('pfp', null);
						try {
							localStorage.removeItem(srcKey());
						} catch (err) {
							/* fine */
						}
						pushPicture();
					}
				} catch (e) {
					warn(e);
				}
			},
			exit: () => true,
		});
	}

	/* The options, changed the same way from the ⚙ tab and from Settings > Extensions. */
	/** Sets and saves one option. */
	function setOpt(name, value) {
		opts[name] = value;
		saveOpts();
	}

	/** Turns desktop notifications on or off; asks the browser for permission and turns off if refused. */
	async function setDesktop(on) {
		setOpt('desktop', !!on);
		if (on && typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
			const answer = await Notification.requestPermission().catch(() => 'denied');
			if (answer !== 'granted') {
				setOpt('desktop', false);
				notify('The browser blocked notifications');
			}
		}
		const box = $('sb-o-desktop');
		if (box) {
			box.checked = opts.desktop;
		}
	}

	/** Turns saving of chat history on or off. */
	function setKeep(on) {
		setOpt('keep', !!on);
		if (opts.keep) {
			saveHistory();
		} else {
			try {
				localStorage.removeItem(histKey());
			} catch (err) {
				/* nothing kept anyway */
			}
		}
	}

	/** Deletes the saved history (this session's beeps stay, the game still has them). */
	function clearKept() {
		try {
			localStorage.removeItem(histKey());
		} catch (err) {
			/* nothing kept anyway */
		}
		hist = hist.filter((h) => live.has(h.k));
		histKeys.clear();
		for (const h of hist) {
			histKeys.add(h.k);
		}
		saveHistory();
		if (isOpen()) {
			render();
		}
	}

	/** Supported theme add-ons: [id, name, probe returning one of its CSS variables]. */
	const THEME_SOURCES = [
		['themed', 'Themed', () => getComputedStyle(document.documentElement).getPropertyValue('--tmd-main')],
		['bcneko', 'BCNeko', () => document.body && getComputedStyle(document.body).getPropertyValue('--bcn-panel')],
	];
	/** The first running theme add-on: { id, name }, or null. */
	function themeSource() {
		for (const [id, name, probe] of THEME_SOURCES) {
			try {
				if (String(probe() || '').trim()) {
					return { id, name };
				}
			} catch (e) {
				/* not this one */
			}
		}
		return null;
	}
	/** Sets the classes that map a theme add-on's colours onto SlimeBeep's (re-run every 5 s from tick). Returns the source. */
	function applyThemed() {
		const src = opts.themed ? themeSource() : null;
		const root = document.documentElement;
		root.classList.toggle('sb-themed', !!src);
		for (const [id] of THEME_SOURCES) {
			root.classList.toggle(`sb-theme-${id}`, !!src && src.id === id);
		}
		return src;
	}
	/** Turns theme matching on or off. */
	function setThemed(on) {
		setOpt('themed', !!on);
		applyThemed();
	}

	/** Turns night mode on or off (the sb-night class on <html>). */
	function setNight(on) {
		opts.night = !!on;
		saveOpts();
		document.documentElement.classList.toggle('sb-night', opts.night);
		const moon = $('sb-moon');
		if (moon) {
			moon.textContent = opts.night ? '☀️' : '🌙';
			moon.title = opts.night ? 'Day mode' : 'Night mode';
		}
		const box = $('sb-o-night');
		if (box) {
			box.checked = opts.night;
		}
	}

	/** Member number that 🐞 reports can be beeped to (SlimeQueenSamantha). */
	const OWNER = 255659;
	/** New GitHub issue page, for 🐞 reports. */
	const ISSUES = 'https://github.com/Proudkiller0015/slimebeep/issues/new';
	/** Report details: versions, browser, other mods, recent errors (and your member number with `withNumber`). */
	function details(withNumber) {
		const mods = (() => {
			try {
				const sdk = window.bcModSdk;
				return sdk && typeof sdk.getModsInfo === 'function'
					? sdk
							.getModsInfo()
							.map((m) => `${m.name} ${m.version}`)
							.join(', ')
					: '';
			} catch (e) {
				return '';
			}
		})();
		const d = window.SlimeBeep && typeof window.SlimeBeep.debug === 'function' ? window.SlimeBeep.debug() : {};
		return [
			`SlimeBeep ${VERSION}`,
			`Game: ${typeof GameVersion === 'string' ? GameVersion : '?'}${typeof CurrentScreen === 'string' ? ` (screen: ${CurrentScreen})` : ''}`,
			`Browser: ${navigator.userAgent}`,
			withNumber && loggedIn() ? `Reported by: #${Player.MemberNumber}` : null,
			`Listening: ${d.listening ? 'yes' : 'no'}${d.catchAll ? ', catch-all' : ''}; groups: ${Object.keys(groups).length}; kept beeps: ${hist.length}`,
			mods ? `Other mods: ${mods}` : null,
			missing().length
				? `Missing from the game: ${missing()
						.map(([k]) => k)
						.join(', ')}`
				: null,
			errors.length ? `Recent errors:\n${errors.map((x) => `- ${x}`).join('\n')}` : 'Recent errors: none',
		]
			.filter(Boolean)
			.join('\n');
	}
	/** The full 🐞 report: what the player wrote, then details(). */
	function reportText() {
		const what = clean($('sb-bug-what').value, 1500);
		const how = clean($('sb-bug-how').value, 800);
		return {
			what,
			how,
			full: `What happened:\n${what || '(not filled in)'}\n\nWhat I was doing:\n${how || '(not filled in)'}\n\n---\n${details($('sb-bug-num').checked)}`,
		};
	}

	/** HTML of the 🐞 tab. */
	function bugHtml() {
		const draft = bugHtml.draft || {};
		return html`<div class="sb-line" style="margin-top:2px"><b>🐞 Report a bug</b></div>
			<div class="sb-hint" style="margin:0 0 6px">Tell SlimeQueenSamantha what went wrong. SlimeBeep adds its version and recent errors for you.</div>
			<textarea id="sb-bug-what" maxlength="1500" placeholder="What happened?">${draft.what || ''}</textarea>
			<textarea id="sb-bug-how" maxlength="800" placeholder="What were you doing? (optional)" style="height:52px;margin-top:6px">${draft.how || ''}</textarea>
			<label><input type="checkbox" id="sb-bug-num" ${draft.num !== false && 'checked'}><span>Include my member number so she can beep me back</span></label>
			<details style="margin:6px 2px"><summary class="sb-hint" style="cursor:pointer">What gets added</summary><pre id="sb-bug-details" style="white-space:pre-wrap;font-size:11px;margin:4px 0 0">${details(draft.num !== false)}</pre></details>
			<div class="sb-line" style="flex-wrap:wrap;justify-content:flex-start;gap:6px">
				<button class="sb-go" id="sb-bug-github" title="Opens a new bug report on GitHub, filled in (needs a GitHub account)">🐙 Open on GitHub</button>
				<button class="sb-pill" id="sb-bug-copy">📋 Copy</button>
				<button class="sb-pill" id="sb-bug-beep" title="Only arrives if SlimeQueenSamantha has you on her friend list">📨 Beep it to her</button>
			</div>
			<div class="sb-hint" id="sb-bug-status"></div>`;
	}

	/** Wires the 🐞 tab: open a GitHub issue, copy, or beep the report. */
	function wireBug() {
		const keep = () => {
			bugHtml.draft = { what: $('sb-bug-what').value, how: $('sb-bug-how').value, num: $('sb-bug-num').checked };
		};
		const status = (t) => {
			const x = $('sb-bug-status');
			if (x) {
				x.textContent = t;
			}
		};
		for (const id of ['sb-bug-what', 'sb-bug-how']) {
			$(id).addEventListener('input', keep);
		}
		$('sb-bug-num').addEventListener('change', () => {
			keep();
			$('sb-bug-details').textContent = details($('sb-bug-num').checked);
		});
		const ready = () => {
			const r = reportText();
			if (!r.what) {
				status('Write what happened first.');
				$('sb-bug-what').focus();
				return null;
			}
			return r;
		};
		$('sb-bug-github').addEventListener('click', () => {
			const r = ready();
			if (!r) {
				return;
			}
			const title = `Bug: ${r.what.split('\n')[0].slice(0, 70)}`;
			window.open(`${ISSUES}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(r.full)}`, '_blank', 'noopener');
			status('Opened on GitHub: check it and press "Create" there.');
		});
		$('sb-bug-copy').addEventListener('click', async () => {
			const r = ready();
			if (!r) {
				return;
			}
			try {
				await navigator.clipboard.writeText(r.full);
				status('📋 Copied. Paste it wherever you talk to SlimeQueenSamantha.');
			} catch (e) {
				status('The browser would not copy it. Open "What gets added" and copy by hand.');
			}
		});
		$('sb-bug-beep').addEventListener('click', () => {
			const r = ready();
			if (!r) {
				return;
			}
			if (!loggedIn()) {
				return status('Log in first.');
			}
			// A beep holds 1000 characters: the description first, then as many details as fit.
			const text = `🐞 SlimeBeep bug report\n${r.what}${r.how ? `\nDoing: ${r.how}` : ''}\n— ${details($('sb-bug-num').checked)}`.slice(
				0,
				990,
			);
			beep(OWNER, text, false);
			notify('🐞 Report beeped');
			status('Beeped to SlimeQueenSamantha. It only arrives if she has you on her friend list; if unsure, use GitHub or Copy too.');
		});
	}

	/* "Invite <them> to…": every group you can invite to, an Invite button each (opened by other add-ons too). */
	/** State of the "Invite <member> to…" page (api.openInvite): { n, results: group id -> result text }. */
	let inviteFor = null;
	/** HTML of the "Invite <member> to…" page. */
	function inviteForHtml() {
		if (!inviteFor) {
			return html``;
		}
		const n = inviteFor.n;
		const name = nameOf(n);
		let how = `They get a code to paste in 👥 Groups, made for #${n} only.`;
		if (isFriend(n)) {
			how = peers.has(n) ? `${name} has SlimeBeep: they get an invite card.` : `${name} gets a beep with the code.`;
		}
		const list = Object.values(groups).filter((g) => canInvite(g, Player.MemberNumber));
		const rows = list.map((g) => {
			const res = inviteFor.results[g.id];
			const action = isMember(g, n)
				? html`<span class="sb-hint">Already in it</span>`
				: html`<button class="sb-go" data-invite="${g.id}" ${res && 'disabled'}>Invite</button>`;
			return html`<div class="sb-row" style="cursor:default;display:block"><div style="display:flex;align-items:center;gap:8px">${groupAv(g)}
				<div class="sb-main"><div class="sb-name">${g.name}</div><div class="sb-sub">${g.members.length} / ${LIMITS.members} members</div></div>
				${action}</div>
				${res && html`<div class="sb-hint" style="margin-top:4px">${res}</div>`}</div>`;
		});
		return html`<div class="sb-line"><button class="sb-pill" id="sb-if-back">‹ Back</button><b>👥 Invite ${name}</b></div>
			<div class="sb-hint" style="margin:2px 0 6px">${how}</div>
			${rows.length ? rows : html`<div class="sb-empty">👥 No group chats you can invite to yet.</div>`}`;
	}
	/** Wires the "Invite <member> to…" page. */
	function wireInviteFor() {
		$('sb-if-back').addEventListener('click', () => {
			inviteFor = null;
			tab = 'groups';
			render();
		});
		for (const b of $('sb-body').querySelectorAll('[data-invite]')) {
			b.addEventListener('click', async () => {
				const id = b.dataset.invite;
				b.disabled = true;
				const r = await inviteToGroup(id, inviteFor.n);
				if (!r.ok) {
					inviteFor.results[id] = `⚠ ${r.why}`;
				} else if (r.sent) {
					inviteFor.results[id] = '📨 Invite sent!';
				} else {
					inviteFor.results[id] = html`Code: <code style="user-select:all">${r.code}</code> — give it to them (copied).`;
				}
				if (r.ok && !r.sent) {
					try {
						await navigator.clipboard.writeText(r.code);
					} catch (e) {
						/* shown to copy by hand */
					}
				}
				if (tab === 'invitefor') {
					render(true);
				}
			});
		}
	}

	/** HTML of the ⚙ tab. */
	function optionsHtml() {
		const checked = (on) => on && 'checked';
		return html`<div class="sb-opts">
			<b style="display:block;margin:6px 2px">⚙ Options</b>
			<label style="display:flex;align-items:center;gap:8px">${avatar(Player.MemberNumber, myName())}<span style="flex:1">Profile picture<span class="sb-hint" style="display:block">SlimeBeep friends see it.</span></span>
				<button class="sb-pill" id="sb-o-pic">Choose</button>${myPfp() && loadSrc() && html`<button class="sb-pill" id="sb-o-fit">Adjust</button>`}${myPfp() && html`<button class="sb-pill" id="sb-o-nopic">Remove</button>`}</label>
			<label><input type="checkbox" id="sb-o-night" ${checked(opts.night)}>🌙 Night mode (a night blue slime)</label>
			<label><input type="checkbox" id="sb-o-sound" ${checked(opts.sound)}>Pop sound for new beeps</label>
			<label><input type="checkbox" id="sb-o-popups" ${checked(opts.popups)}>💌 A card by the slime for each new beep</label>
			<label><input type="checkbox" id="sb-o-desktop" ${checked(opts.desktop)}>🖥 Desktop notification when the game is in the background</label>
			<label><input type="checkbox" id="sb-o-keep" ${checked(opts.keep)}>🗂 Keep my beeps in this browser after I log out
				<span class="sb-hint" style="display:block">${hist.length} beeps kept. <button class="sb-pill" id="sb-o-clear">Clear them</button></span></label>
			<label><input type="checkbox" id="sb-o-share" ${checked(opts.shareRoom)}>📍 "Let them join me" starts on</label>
			<label><input type="checkbox" id="sb-o-remember" ${checked(opts.remember)}>Remember who I picked for WaveBeeps</label>
			<label>Wait <input type="number" id="sb-o-gap" min="1" max="10" step="0.5" value="${opts.gap}"> seconds between WaveBeeps</label>
			<label>Drag the slime to move it. <button class="sb-pill" id="sb-o-reset">Put it back</button></label>
			<div class="sb-hint" style="margin:10px 4px">SlimeBeep v${VERSION} updates itself: a reload always runs the newest version.</div>
		</div>`;
	}

	/** Wires the ⚙ tab. */
	function wireOptions() {
		$('sb-o-pic').addEventListener('click', (e) => {
			e.preventDefault();
			pickPicture();
		});
		if ($('sb-o-fit')) {
			$('sb-o-fit').addEventListener('click', (e) => {
				e.preventDefault();
				const src = loadSrc();
				if (src) {
					openCropper(src);
				}
			});
		}
		if ($('sb-o-nopic')) {
			$('sb-o-nopic').addEventListener('click', (e) => {
				e.preventDefault();
				setOpt('pfp', null);
				try {
					localStorage.removeItem(srcKey());
				} catch (err) {
					/* fine */
				}
				pushPicture();
				notify('Profile picture removed');
				render();
			});
		}
		$('sb-o-night').addEventListener('change', (e) => setNight(e.target.checked));
		$('sb-o-sound').addEventListener('change', (e) => setOpt('sound', e.target.checked));
		$('sb-o-popups').addEventListener('change', (e) => setOpt('popups', e.target.checked));
		$('sb-o-desktop').addEventListener('change', (e) => setDesktop(e.target.checked));
		$('sb-o-keep').addEventListener('change', (e) => setKeep(e.target.checked));
		$('sb-o-clear').addEventListener('click', (e) => {
			e.preventDefault();
			clearKept();
		});
		$('sb-o-share').addEventListener('change', (e) => setOpt('shareRoom', e.target.checked));
		$('sb-o-remember').addEventListener('change', (e) => {
			setOpt('remember', e.target.checked);
			if (!opts.remember) {
				setOpt('picked', []);
			}
		});
		$('sb-o-gap').addEventListener('change', (e) => {
			setOpt('gap', Math.max(1, Math.min(10, Number(e.target.value) || DEFAULTS.gap)));
			e.target.value = opts.gap;
		});
		$('sb-o-reset').addEventListener('click', () => {
			setOpt('pos', null);
			place();
		});
	}

	/**
	 * Start-up. A copy loaded from PAGES (FUSAM, the bookmarklet) starts at once. Otherwise (the
	 * userscript loader reads raw.githubusercontent.com, which can serve an old copy for a few minutes)
	 * it asks PAGES for the current version first and runs that one instead if it is newer; with no answer
	 * within 4 s it starts as is.
	 */
	const PAGES = 'https://proudkiller0015.github.io/slimebeep/slimebeep.js';
	/** Whether version string `a` is newer than `b`. */
	const newer = (a, b) => {
		const x = a.split('.').map(Number),
			y = b.split('.').map(Number);
		for (let i = 0; i < 3; i++) {
			if ((x[i] || 0) !== (y[i] || 0)) {
				return (x[i] || 0) > (y[i] || 0);
			}
		}
		return false;
	};
	/** Builds SlimeBeep. */
	function start() {
		try {
			build();
		} catch (e) {
			warn(e, 'could not start');
		}
	}
	if (window.SlimeBeepHopped || LOADED_FROM.startsWith('https://proudkiller0015.github.io/slimebeep/')) {
		start();
	} else {
		const ctl = typeof AbortController === 'function' ? new AbortController() : null;
		const timer = setTimeout(() => {
			if (ctl) {
				ctl.abort();
			}
		}, 4000);
		fetch(`${PAGES}?t=${Date.now()}`, { cache: 'no-store', signal: ctl ? ctl.signal : undefined })
			.then((r) => (r.ok ? r.text() : ''))
			.then((code) => {
				clearTimeout(timer);
				const m = /const VERSION = '(\d+\.\d+\.\d+)'/.exec(code);
				if (!m || !newer(m[1], VERSION)) {
					return start();
				}
				// Run the newer copy instead of this one.
				window.SlimeBeepHopped = true;
				delete window.SlimeBeep;
				const script = document.createElement('script');
				script.textContent = `${code}\n//# sourceURL=slimebeep.js`;
				document.head.appendChild(script);
				script.remove();
			})
			.catch(() => {
				clearTimeout(timer);
				start();
			});
	}
})();

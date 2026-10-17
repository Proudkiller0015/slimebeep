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
	const LOADED_FROM = (document.currentScript instanceof HTMLScriptElement && document.currentScript.src) || '';

	const VERSION = '3.0.6';
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
		/** @type {{ x: number, y: number } | null} Toggle button position as window fractions; null puts it bottom right. */
		pos: null,
		/** @type {{ x: number, y: number, w: number, h: number } | null} The window's place and size in px once moved or resized; null keeps it by the slime at its usual size. */
		win: null,
		/** Seconds between beeps when a WaveBeep goes to several friends. */
		gap: 1.5,
		/** Whether 📍 (a join button for your room) starts switched on in a chat. */
		shareRoom: false,
		/** Whether WaveBeep keeps the ticked friends (`picked`) for next time. */
		remember: true,
		/** @type {number[]} Member numbers ticked in WaveBeep. */
		picked: [],
		/** Chime for new messages. */
		sound: true,
		/** A card by the toggle for each new message. */
		popups: true,
		/** A system notification for new messages while the game tab is hidden. */
		desktop: false,
		/** Save chat history per account (see `hist`). */
		keep: true,
		/** @type {string[] | null} Ids of news.json items already shown as cards (null before the first load). */
		seenNews: null,
		/** @type {string | null} Last version that posted its update note in the room chat. */
		lastVersion: null,
		/** Night colours. */
		night: false,
		/** Follow a theme add-on's colours (Themed, BCNeko). */
		themed: false,
		/** @type {string[]} Emoji for the picker's 🕘 tab, newest first. */
		recentEmoji: [],
		/** @type {string[]} Chats that make no sound: 'n:<member number>' or 'g:<group id>'. */
		muted: [],
		/** @type {Picture | null} Your profile picture. */
		pfp: null,
		/** Version and missing game parts already warned about by gameCheck. */
		gameWarned: '',
	};
	/** @typedef {typeof DEFAULTS} Options */
	/** Release notes, shown as cards and in update notes. */
	const NEWS = 'https://proudkiller0015.github.io/slimebeep/news.json';
	/** Most entries kept in `hist`. */
	const KEEP_MAX = 2000;
	/** localStorage key of `opts` (shared by every account in this browser). */
	const KEY = 'slimebeep.options';
	/** @type {Options} The live options. */
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
	 * An online friend, as the server's OnlineFriends answer lists them.
	 * @typedef {object} Friend
	 * @property {number} MemberNumber
	 * @property {string} MemberName
	 * @property {string} [ChatRoomName] the room they are in
	 * @property {string} [ChatRoomSpace]
	 * @property {number} [ChatRoomMemberCount]
	 * @property {number} [ChatRoomLimit]
	 * @property {boolean} [Private] in a private room
	 * @property {string} [Type] 'Friend', 'Lover', 'Submissive'...
	 */
	/** @type {Friend[]} Online friends, from the last OnlineFriends answer. */
	let friends = [];
	/** Open panel tab: 'chats', 'groups', 'friends', 'wave', 'bug', 'options', 'newgc' or 'invitefor'. */
	let tab = 'chats';
	/** @type {number | string | null} Open chat: a member number, 'g:<group id>', or null for the lists. */
	let thread = null;
	/** Search box text on the list tabs. */
	let search = '';
	/** True while a WaveBeep is going out. */
	let sending = false;

	/**
	 * A message in a chat (an entry of `hist`).
	 * @typedef {object} HistEntry
	 * @property {string} k unique key: the game beep's (keyOf), 'g:<group>:<id>', 'raw:...' or 'mail:<id>'
	 * @property {number} MemberNumber one-to-one: the other person; group: the sender (0 for system lines)
	 * @property {string} MemberName
	 * @property {boolean} Sent sent by you
	 * @property {number} Time when, in ms
	 * @property {string} [Message] a beep's message, as the game keeps it (may carry settings after MARK)
	 * @property {string} [ChatRoomName] the room a beep was sent from
	 * @property {string} [group] the group id, for group messages
	 * @property {string} [text] a group message's text
	 * @property {string} [sys] a group's system line: 'roster' or 'left'
	 * @property {boolean} [unread] for entries the game's log doesn't have (group, caught and mailbox ones)
	 * @property {boolean} [mail] went through a mailbox
	 * @property {boolean} [unchecked] mailbox beep whose sender key could not be checked
	 * @property {string} [announceText] the card text, when different from the message
	 */
	/**
	 * Every message shown in chats: beeps copied from the game's FriendListBeepLog (emptied at each
	 * login), group messages and mailbox beeps, oldest first. Saved per account under histKey() when
	 * opts.keep is on.
	 * @type {HistEntry[]}
	 */
	let hist = [];
	/** @type {number | null} Member number `hist` was loaded for. */
	let histOwner = null;
	/** @type {Set<string>} Keys of the entries in `hist`. */
	const histKeys = new Set();
	/** @type {Map<string, BcBeepLogEntry>} Key -> the game's own beep, so opening a chat can set its Read flag. */
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
	 * A member of a group, as the relay's roster lists them.
	 * @typedef {object} GroupMember
	 * @property {number} n member number
	 * @property {string} name
	 * @property {string} kf the first 16 chars of the key they signed in with
	 */
	/**
	 * A group chat you are in.
	 * @typedef {object} Group
	 * @property {string} id
	 * @property {string} name
	 * @property {number} owner member number
	 * @property {number[]} admins member numbers (the owner included)
	 * @property {boolean} open anyone in it can invite
	 * @property {GroupMember[]} members
	 * @property {number[]} [online] members connected right now
	 * @property {number} last id of the newest message received
	 * @property {string} [picv] version of your picture already sent to it
	 * @property {string} [pic] the group's picture (a data URL)
	 */
	/** @type {Record<string, Group>} Groups you are in, by id. */
	let groups = {};
	/** @type {Set<number>} Friends known to have SlimeBeep. */
	let peers = new Set();
	/** @type {Record<number, string>} Friend -> first 16 chars of their public key, as their own SlimeBeep sent it. */
	let peerKeys = {};
	/**
	 * A group invite from a friend, not joined yet.
	 * @typedef {object} Invitation
	 * @property {string} code SB-<group id>-<secret>
	 * @property {string} name the group's name
	 * @property {number} from who invited you
	 * @property {string} fromName
	 * @property {number} at when, in ms
	 */
	/** @type {Invitation[]} Group invites from friends, not joined yet. */
	let invitations = [];
	const gcKey = () => `slimebeep.gc2.${Player.MemberNumber}`;
	/**
	 * A beep to an offline friend, not delivered yet.
	 * @typedef {object} WaitingBeep
	 * @property {string} id
	 * @property {number} n the friend's member number
	 * @property {string} text
	 * @property {number} at when it was written, in ms
	 * @property {number} [tried] last mailbox attempt, in ms (not saved)
	 */
	/**
	 * Beeps to offline friends not delivered yet, saved per account. mailWaiting leaves them in the
	 * friend's mailbox; otherwise sendWaiting sends them when the friend is online.
	 * @type {WaitingBeep[]}
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
	/**
	 * Whether `x` is an id made by newId (also group ids).
	 * @param {unknown} x
	 * @returns {x is string}
	 */
	const isId = (x) => typeof x === 'string' && /^[a-z0-9]{8,24}$/.test(x);
	/**
	 * Whether `n` is a plausible member number.
	 * @param {unknown} n
	 * @returns {n is number}
	 */
	const isNum = (n) => Number.isInteger(n) && /** @type {number} */ (n) > 0 && /** @type {number} */ (n) < 1e9;
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
	/**
	 * Text from outside, made safe to keep: control characters removed, trimmed, cut to `max`.
	 * @param {unknown} x
	 * @param {number} max
	 * @returns {string} '' for anything but a string
	 */
	const clean = (x, max) =>
		typeof x === 'string'
			? x
					// eslint-disable-next-line no-control-regex -- removing control characters is the point
					.replace(/[\u0000-\u0008\u000b-\u001f\u007f\uf124]/g, '')
					.trim()
					.slice(0, max)
			: '';
	/**
	 * Whether a member is on your friend list. FriendNames only knows the friends whose names the game has
	 * seen (a beep, the online list), so FriendList (every friend's number) is checked first.
	 * @param {number} n
	 */
	const isFriend = (n) =>
		(Array.isArray(Player.FriendList) && Player.FriendList.includes(n)) ||
		!!(Player.FriendNames && typeof Player.FriendNames.has === 'function' && Player.FriendNames.has(n)) ||
		friends.some((f) => f.MemberNumber === n);
	/** Your name, as groups and mailboxes see it. */
	const myName = () => clean(Player.Nickname || Player.Name, LIMITS.name) || `#${Player.MemberNumber}`;
	/**
	 * @param {Group | undefined} g
	 * @param {number} n
	 */
	const isAdmin = (g, n) => !!g && g.admins.includes(n);
	/**
	 * @param {Group | undefined} g
	 * @param {number} n
	 */
	const isMember = (g, n) => !!g && g.members.some((m) => m.n === n);
	/**
	 * Whether member `n` may invite people to `g`.
	 * @param {Group} g
	 * @param {number} n
	 */
	const canInvite = (g, n) => isMember(g, n) && (g.open || isAdmin(g, n));
	/**
	 * A member's name as shown in a group ('You' for yourself).
	 * @param {Group | undefined} g
	 * @param {number} n
	 * @returns {string}
	 */
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
			/** @type {unknown} */
			const w = JSON.parse(localStorage.getItem(waitKey()) || '[]');
			if (Array.isArray(w)) {
				waiting = /** @type {Partial<WaitingBeep>[]} */ (w)
					.filter((x) => x && isId(x.id) && isNum(x.n) && typeof x.text === 'string')
					.map((x) => ({ id: String(x.id), n: Number(x.n), text: String(x.text).slice(0, 1000), at: Number(x.at) || Date.now() }))
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
			/** @type {{ groups?: Record<string, Partial<Group>>, peers?: unknown[], peerKeys?: Record<string, unknown>, invitations?: Partial<Invitation>[] }} */
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
					last: Number.isInteger(g.last) ? Number(g.last) : 0,
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
				if (i && typeof i.code === 'string' && CODE_RE.test(i.code) && isNum(i.from)) {
					invitations.push({
						code: i.code,
						name: clean(i.name, LIMITS.name),
						from: i.from,
						fromName: clean(i.fromName, LIMITS.name),
						at: Number(i.at) || 0,
					});
				}
			}
			// Peers saved under the older storage key.
			/** @type {{ peers?: unknown[] }} */
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
	/**
	 * The `hist` key of a game beep: its Id, or its sender, time, direction and start of text.
	 * @param {BcBeepLogEntry} b
	 */
	const keyOf = (b) =>
		b.Id ? `id:${b.Id}` : `${b.MemberNumber}|${new Date(b.Time).getTime()}|${b.Sent ? 1 : 0}|${String(b.Message || '').slice(0, 40)}`;

	/**
	 * An element of SlimeBeep's own UI by id. build() and the render functions create them, so code that can
	 * run before they exist checks the result first.
	 * @param {string} id
	 * @returns {HTMLElement}
	 */
	const $ = (id) => /** @type {HTMLElement} */ (document.getElementById(id));
	/**
	 * An <input> or <textarea> of SlimeBeep's UI by id (value, checked, disabled).
	 * @param {string} id
	 * @returns {HTMLInputElement}
	 */
	const $input = (id) => /** @type {HTMLInputElement} */ (document.getElementById(id));

	/**
	 * Game globals SlimeBeep uses: [name, typeof check, what stops working without it]. Shown by the
	 * 🐞 report and a one-time card when missing; .github/workflows/bc-check.yml checks the live game daily.
	 */
	/** @type {[string, () => string, string][]} */
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
	/** The NEEDS entries the game doesn't have (any more). */
	const missing = () =>
		NEEDS.filter(([, t]) => {
			try {
				return t() === 'undefined';
			} catch (e) {
				return true;
			}
		});
	/** @type {string[]} The last 10 caught errors, for the 🐞 report. */
	const errors = [];
	/**
	 * Logs a caught error to the console and to `errors`.
	 * @param {unknown} e
	 * @param {string} [where] what was being done
	 */
	function warn(e, where = '') {
		try {
			const err = e instanceof Error ? e : null;
			const msg = `${where ? `${where}: ` : ''}${(err && err.message) || String(e)}`.slice(0, 200);
			const at =
				err && err.stack
					? String(err.stack)
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
	/** @type {Record<string, string>} */
	const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
	/**
	 * Text escaped for HTML (content and quoted attributes).
	 * @param {unknown} t
	 * @returns {string}
	 */
	const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);
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
	/**
	 * One value inserted into `html`: SafeHtml as is, arrays one after another, null/undefined/false as nothing, the rest escaped.
	 * @param {HtmlValue} v
	 * @returns {string}
	 */
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
	/**
	 * Tag for HTML templates: every inserted value is escaped unless it is SafeHtml, so text can never become markup.
	 * @param {TemplateStringsArray} strings
	 * @param {...HtmlValue} values
	 * @returns {SafeHtml}
	 */
	const html = (strings, ...values) =>
		new SafeHtml(strings.reduce((out, s, i) => out + s + (i < values.length ? htmlPart(values[i]) : ''), ''));
	/**
	 * Marks markup assembled from already-escaped text as safe. Used only by rich().
	 * @param {string} s
	 */
	const trustedHtml = (s) => new SafeHtml(s);
	/**
	 * Puts HTML into one of SlimeBeep's elements. The only place that sets innerHTML: it takes SafeHtml
	 * only, so everything shown went through `html` (and its escaping) first.
	 * @param {Element} el
	 * @param {SafeHtml} content
	 */
	function setHtml(el, content) {
		// eslint-disable-next-line no-unsanitized/property -- content is SafeHtml, escaped by `html`
		el.innerHTML = content.value;
	}
	/**
	 * The HTML elements under `root` that match `selector`.
	 * @param {ParentNode} root
	 * @param {string} selector
	 * @returns {HTMLElement[]}
	 */
	const $$ = (root, selector) => /** @type {HTMLElement[]} */ ([...root.querySelectorAll(selector)]);
	/**
	 * The <input> elements under `root` that match `selector`.
	 * @param {ParentNode} root
	 * @param {string} selector
	 * @returns {HTMLInputElement[]}
	 */
	const $$inputs = (root, selector) => /** @type {HTMLInputElement[]} */ ([...root.querySelectorAll(selector)]);
	/**
	 * The element an event happened on (SlimeBeep only listens on its own elements).
	 * @param {Event} e
	 * @returns {HTMLElement}
	 */
	const targetOf = (e) => /** @type {HTMLElement} */ (e.target);
	/**
	 * The <input> or <textarea> an event happened on.
	 * @param {Event} e
	 * @returns {HTMLInputElement}
	 */
	const inputOf = (e) => /** @type {HTMLInputElement} */ (e.target);
	/** Whether a player is logged in. */
	const loggedIn = () =>
		typeof ServerSocket !== 'undefined' && ServerSocket && typeof Player !== 'undefined' && Player && Player.MemberNumber != null;
	/** Name of the chat room you are in, or null. */
	const myRoom = () => (typeof ChatRoomData !== 'undefined' && ChatRoomData && ChatRoomData.Name) || null;
	/** The game's beep log ([] when missing). */
	const gameLog = () => (typeof FriendListBeepLog !== 'undefined' && Array.isArray(FriendListBeepLog) ? FriendListBeepLog : []);
	/** The chat history. */
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
	 * @returns {HistEntry[]} the received beeps added this time (no reactions)
	 */
	function sync() {
		if (!loggedIn()) {
			return [];
		}
		if (histOwner !== Player.MemberNumber) {
			loadHistory();
		}
		/** @type {HistEntry[]} */
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
			/** @type {HistEntry} */
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
	 * A beep's settings, as the game appends them.
	 * @typedef {object} BeepMeta
	 * @property {string} [messageType] 'Message', 'Reply', 'Reaction'...
	 */
	/**
	 * Splits a beep's message into its text and the settings the game appended after MARK.
	 * @param {unknown} msg
	 * @returns {{ text: string, meta: BeepMeta | null }}
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
	 * array, optionally after a short tag ("KIKILINK/1 {...}"), or, when the beep had its own BeepType,
	 * a CamelCase word like "ReqRoom". BCT's beeps (BeepType "bctBeep") carry any single word, such as
	 * "Friends" and "BFLockAcc".
	 * @param {unknown} msg
	 * @param {string} [type] the beep's BeepType
	 */
	function isSignal(msg, type = '') {
		if (typeof msg !== 'string') {
			return false;
		}
		const t = parseBeep(msg).text.trim();
		if (!t) {
			return false;
		}
		if (type && /^[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]*)+$/.test(t)) {
			return true;
		}
		if (type === 'bctBeep' && /^[A-Za-z]\w*$/.test(t)) {
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
	/**
	 * What a `hist` entry shows as its text.
	 * @param {HistEntry} entry
	 * @returns {string}
	 */
	const textOf = (entry) => {
		if (entry.group) {
			return entry.sys === 'left' ? `${entry.MemberName} left the group` : entry.text || '';
		}
		if (typeof entry.Message !== 'string') {
			return entry.ChatRoomName ? `📍 ${entry.ChatRoomName}` : '🔔 Beep!';
		}
		return parseBeep(entry.Message).text || '🔔 Beep!';
	};
	/**
	 * Whether a beep is a reaction (the game's messageType 'Reaction'); those are not listed.
	 * @param {HistEntry} entry
	 */
	const isReaction = (entry) => {
		const meta = typeof entry.Message === 'string' ? parseBeep(entry.Message).meta : null;
		return !!meta && meta.messageType === 'Reaction';
	};
	/**
	 * Whether a received entry is unread: the game's Read flag when the game has the beep, else `h.unread`.
	 * @param {HistEntry} h
	 */
	const unread = (h) => {
		if (h.Sent || isReaction(h)) {
			return false;
		}
		const b = live.get(h.k);
		return b ? b.Read === false : !!h.unread;
	};
	/**
	 * Marks an entry read, in the game's log too.
	 * @param {HistEntry} h
	 */
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
	/**
	 * A member's name: from the online friends, the friend list, or the last beep they sent.
	 * @param {number} n
	 * @returns {string}
	 */
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
	/**
	 * Whether a message is only an *action* (it gets the sb-act bubble).
	 * @param {string} text
	 */
	const isAction = (text) => /^\*{1,2}[^*\n]+\*{1,2}$/.test(String(text).trim());
	/** Group invite codes inside a text. */
	const CODE_IN = /SB-[a-z0-9]{8,24}-[A-Z2-9]{10}/g;
	/**
	 * A message as HTML: escaped, with *actions* in italics, clickable links (new tab) and a Join button after group codes.
	 * @param {string} text
	 */
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
					(code) => `${code} <button class="sb-pill sb-joincode" data-code="${code}">${groups[codeGroup(code)] ? 'Open' : 'Join'}</button>`,
				),
		);
	/**
	 * The group id inside an invite code ('' if it isn't one).
	 * @param {string} code
	 */
	const codeGroup = (code) => {
		const m = CODE_RE.exec(code);
		return m ? m[1] : '';
	};
	/**
	 * A time as hh:mm today, or as a date.
	 * @param {number | string | Date} t
	 */
	const timeOf = (t) => {
		const d = new Date(t);
		if (isNaN(d.getTime())) {
			return '';
		}
		const today = new Date().toDateString() === d.toDateString();
		return today
			? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
			: d.toLocaleDateString([], { day: 'numeric', month: 'short' });
	};
	/**
	 * Hue of a member's letter avatar.
	 * @param {number} n
	 */
	const hue = (n) => (Number(n) * 137) % 360;
	/** A profile picture: only image data URLs are accepted (never a web address). */
	const PFP_RE = /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/]+=*$/;
	/** Longest picture data URL accepted (a 128 px picture, smaller if needed). */
	const PFP_MAX = 12000;
	/** Characters of picture per hidden beep. */
	const PFP_CHUNK = 900;
	/**
	 * A profile picture.
	 * @typedef {object} Picture
	 * @property {string} v version id (a new one for each new picture)
	 * @property {string} data an image data URL (PFP_RE)
	 */
	/** @type {Record<number, Picture> | null} Friends' pictures received by hidden beeps. Lazy, see loadPfps. */
	let pfps = null;
	/**
	 * `pfps`, loaded from localStorage on first use.
	 * @returns {Record<number, Picture>}
	 */
	function loadPfps() {
		if (pfps) {
			return pfps;
		}
		/** @type {Record<number, Picture>} */
		const loaded = {};
		pfps = loaded;
		try {
			/** @type {Record<string, Partial<Picture>>} */
			const saved = JSON.parse(localStorage.getItem('slimebeep.pfps') || '{}');
			for (const [k, x] of Object.entries(saved)) {
				if (isNum(Number(k)) && x && isId(x.v) && typeof x.data === 'string' && x.data.length <= PFP_MAX && PFP_RE.test(x.data)) {
					loaded[Number(k)] = { v: x.v, data: x.data };
				}
			}
		} catch (e) {
			/* unreadable: none */
		}
		return loaded;
	}
	/** Saves `pfps`, keeping the last 300. */
	function savePfps() {
		const all = loadPfps();
		const keys = Object.keys(all).map(Number);
		for (const k of keys.slice(0, Math.max(0, keys.length - 300))) {
			delete all[k];
		}
		try {
			localStorage.setItem('slimebeep.pfps', JSON.stringify(all));
		} catch (e) {
			/* the browser won't keep it */
		}
	}
	/**
	 * Your own picture, or null.
	 * @returns {Picture | null}
	 */
	const myPfp = () => (opts.pfp && isId(opts.pfp.v) && typeof opts.pfp.data === 'string' && PFP_RE.test(opts.pfp.data) ? opts.pfp : null);
	/**
	 * A member's picture: yours, a friend's from `pfps`, or one a group shared (`relayPics`).
	 * @param {number} n
	 * @returns {{ data: string } | null}
	 */
	const pfpOf = (n) =>
		(loggedIn() && n === Player.MemberNumber ? myPfp() : loadPfps()[n] || (relayPics[n] ? { data: relayPics[n] } : null)) || null;
	/**
	 * A group's avatar HTML: its picture or 👥.
	 * @param {{ pic?: string }} g
	 */
	const groupAv = (g) => (g.pic ? html`<img class="sb-av sb-pic" src="${g.pic}" alt="">` : html`<span class="sb-av sb-gav">👥</span>`);
	/** The slime logo as a card icon. */
	const logoIcon = () => html`<img src="${ICON}" style="width:34px;height:34px;border-radius:50%;flex:none" alt="">`;
	/**
	 * A member's avatar HTML: their picture or their initials.
	 * @param {number} n
	 * @param {string} [name]
	 */
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

	/**
	 * A drawn icon (24 x 24 grid, stroked in the text colour). Symbols like ✕ or ⏻ sit off-centre in
	 * some fonts; these are centred everywhere.
	 * @param {number} size in px
	 * @param {SafeHtml} shape the paths
	 */
	const svgIcon = (size, shape) =>
		html`<svg class="sb-ic" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${shape}</svg>`;
	/** The icons of SlimeBeep's round buttons. */
	const ICONS = {
		close: svgIcon(14, html`<path d="M6 6l12 12M18 6 6 18"/>`),
		power: svgIcon(15, html`<path d="M12 3v8M7 6.6a7.5 7.5 0 1 0 10 0"/>`),
		// A cog with eight teeth around a hole.
		gear: svgIcon(
			17,
			html`<path d="M18.9 9.9L21.9 10.4L21.9 13.6L18.9 14.1L18.4 15.4L20.1 17.9L17.9 20.1L15.4 18.4L14.1 18.9L13.6 21.9L10.4 21.9L9.9 18.9L8.6 18.4L6.1 20.1L3.9 17.9L5.6 15.4L5.1 14.1L2.1 13.6L2.1 10.4L5.1 9.9L5.6 8.6L3.9 6.1L6.1 3.9L8.6 5.6L9.9 5.1L10.4 2.1L13.6 2.1L14.1 5.1L15.4 5.6L17.9 3.9L20.1 6.1L18.4 8.6Z" stroke-width="2.2"/><circle cx="12" cy="12" r="3" stroke-width="2.2"/>`,
		),
		send: svgIcon(18, html`<path d="M4 11.5 20 4l-6.5 16-2.6-6.4z" fill="currentColor"/>`),
		back: svgIcon(22, html`<path d="M15 4.5 7.5 12l7.5 7.5" stroke-width="3.2"/>`),
	};
	const css = `
		#sb-toggle { position: fixed; z-index: 100000; width: 46px; height: 46px; border-radius: 50%; padding: 0; overflow: visible;
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
		.sb-head { cursor: move; touch-action: none; user-select: none; }
		/* Resize edges and corners of the window. */
		.sb-rs { position: absolute; z-index: 3; touch-action: none; }
		.sb-rs[data-rs="n"], .sb-rs[data-rs="s"] { left: 14px; right: 14px; height: 6px; cursor: ns-resize; }
		.sb-rs[data-rs="e"], .sb-rs[data-rs="w"] { top: 14px; bottom: 14px; width: 6px; cursor: ew-resize; }
		.sb-rs[data-rs="nw"], .sb-rs[data-rs="ne"], .sb-rs[data-rs="sw"], .sb-rs[data-rs="se"] { width: 14px; height: 14px; }
		.sb-rs[data-rs="n"], .sb-rs[data-rs="nw"], .sb-rs[data-rs="ne"] { top: 0; }
		.sb-rs[data-rs="s"], .sb-rs[data-rs="sw"], .sb-rs[data-rs="se"] { bottom: 0; }
		.sb-rs[data-rs="w"], .sb-rs[data-rs="nw"], .sb-rs[data-rs="sw"] { left: 0; }
		.sb-rs[data-rs="e"], .sb-rs[data-rs="ne"], .sb-rs[data-rs="se"] { right: 0; }
		.sb-rs[data-rs="nw"], .sb-rs[data-rs="se"] { cursor: nwse-resize; }
		.sb-rs[data-rs="ne"], .sb-rs[data-rs="sw"] { cursor: nesw-resize; }
		.sb-head button, .sb-thead button, .sb-compose button, .sb-emo-tabs button, .sb-emo-grid button { padding: 0; display: inline-flex; align-items: center; justify-content: center; line-height: 1; }
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
		.sb-thead #sb-back { width: 36px; height: 36px; flex: none; }
		/* Pages and add-ons can style every svg; the icons stay put. Clicks go to their button. */
		svg.sb-ic { display: block; position: static; flex: none; margin: 0; padding: 0; opacity: 1; transform: none; overflow: visible; pointer-events: none; }
		.sb-card .sb-x { display: inline-flex; align-items: center; justify-content: center; }
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
		/* Pictures in the window zoom when clicked; yours at the top opens ⚙ instead. */
		#sb-panel img.sb-pic { cursor: zoom-in; }
		#sb-panel #sb-me img.sb-pic { cursor: pointer; }
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
		#sb-crop .sb-crop-x { position: absolute; top: 6px; right: 6px; width: 26px; height: 26px; border-radius: 50%; border: none; background: #ffe3f1; color: #c2387f; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; padding: 0; }
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
		html.sb-night #sb-toggle img, html.sb-night .sb-head > img, html.sb-night .sb-card.news > img { filter: hue-rotate(-105deg) saturate(1.15) brightness(.92); }
		html.sb-night #sb-badge { background: #5b8cff; border-color: #1a2142; }
		html.sb-night #sb-panel { background: #141a33; color: #dfe6ff; border-color: #2f3b75; box-shadow: 0 8px 30px #0008; color-scheme: dark; }
		html.sb-night .sb-head { background: linear-gradient(120deg, #2b3a8f, #4f6bd8 55%, #7a5cd6); text-shadow: 0 1px 2px #0008; }
		html.sb-night .sb-tabs, html.sb-night .sb-thead, html.sb-night .sb-compose { background: #1c2450; }
		html.sb-night .sb-tabs button { background: #253064; color: #a9c1ff; }
		html.sb-night .sb-tabs button.on { background: #5b8cff; color: #fff; box-shadow: 0 2px 6px #5b8cff66; }
		html.sb-night .sb-tabs button i { background: #5b8cff; }
		html.sb-night .sb-tabs button.on i { background: #fff; color: #3b55c4; }
		html.sb-night .sb-row, html.sb-night .sb-group label, html.sb-night .sb-opts label, html.sb-night .sb-opts .sb-opt-pic { background: #1d2550; border-color: #2c3866; color: #dfe6ff; }
		html.sb-night .sb-row:hover { background: #253064; border-color: #5b8cff; }
		html.sb-night .sb-sub, html.sb-night .sb-hint, html.sb-night .sb-side, html.sb-night .sb-empty { color: #8f9fd6; }
		html.sb-night .sb-dot { background: #5b8cff; }
		html.sb-night .sb-av { border-color: #141a33; }
		html.sb-night .sb-av:not(.sb-pic) { filter: saturate(.7) brightness(.85); }
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
		html.sb-themed .sb-row, html.sb-themed .sb-group label, html.sb-themed .sb-opts label, html.sb-themed .sb-opts .sb-opt-pic { background: var(--sb-t-element); border-color: var(--sb-t-element-hover); color: var(--sb-t-text); }
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
		.sb-opts label, .sb-opts .sb-opt-pic { display: block; padding: 6px 8px; margin: 4px 0; border-radius: 12px; background: #fff; }
		.sb-opts .sb-opt-pic { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
		.sb-opt-pic-buttons { display: flex; flex-wrap: wrap; gap: 6px; width: 100%; }
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
		setHtml(toggle, html`<img src="${ICON}" alt="SlimeBeep"><span id="sb-badge"></span>`);
		document.body.appendChild(toggle);
		const toast = document.createElement('div');
		toast.id = 'sb-toast';
		document.body.appendChild(toast);
		const cards = document.createElement('div');
		cards.id = 'sb-cards';
		document.body.appendChild(cards);

		const panel = document.createElement('div');
		panel.id = 'sb-panel';
		setHtml(
			panel,
			html`
			<div class="sb-head">
				<img src="${ICON}" alt="">
				<b>SlimeBeep <small>v${VERSION}</small></b>
				<span id="sb-me"></span>
				<button id="sb-moon" title="Night mode">🌙</button>
				<button id="sb-gear" title="Options">${ICONS.gear}</button>
				<button id="sb-quit" title="Quit SlimeBeep until you reload">${ICONS.power}</button>
				<button id="sb-close" title="Close">${ICONS.close}</button>
			</div>
			<div id="sb-view" style="flex:1;display:flex;flex-direction:column;min-height:0"></div>
			${['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'].map((d) => html`<div class="sb-rs" data-rs="${d}" title="Drag to resize (double-click: usual size)"></div>`)}`,
		);
		document.body.appendChild(panel);
		wireWindow(panel);

		/** @type {{ dx: number, dy: number, x0: number, y0: number, lastX: number, lastY: number, moved: boolean } | null} Toggle drag in progress: pointer offset, start point, last point, whether it moved. */
		let drag = null;
		/**
		 * Ends a drag (saving the position when `save`).
		 * @param {boolean} save
		 * @returns {boolean} whether it was a move rather than a click
		 */
		const endDrag = (save) => {
			if (!drag) {
				return false;
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
			drag = {
				dx: e.clientX - r.left,
				dy: e.clientY - r.top,
				x0: e.clientX,
				y0: e.clientY,
				lastX: e.clientX,
				lastY: e.clientY,
				moved: false,
			};
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
				endDrag(true);
				return;
			}
			// Outside the window some browsers report the pointer far off, even wrapped around to the other
			// edge: the pointer is kept inside the window, and a jump of half the window is no real move.
			const x = Math.max(0, Math.min(innerWidth, e.clientX));
			const y = Math.max(0, Math.min(innerHeight, e.clientY));
			if (Math.abs(x - drag.lastX) > innerWidth / 2 || Math.abs(y - drag.lastY) > innerHeight / 2) {
				return;
			}
			drag.lastX = x;
			drag.lastY = y;
			if (!drag.moved && Math.hypot(x - drag.x0, y - drag.y0) < 8) {
				return;
			}
			if (!drag.moved && isOpen() && !opts.win) {
				const pr = panel.getBoundingClientRect();
				opts.win = { x: Math.round(pr.left), y: Math.round(pr.top), w: Math.round(pr.width), h: Math.round(pr.height) };
			}
			drag.moved = true;
			toggle.classList.add('dragging');
			opts.pos = { x: (x - drag.dx) / innerWidth, y: (y - drag.dy) / innerHeight };
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
				const join = targetOf(e).closest('button.sb-joincode');
				if (join instanceof HTMLElement) {
					e.preventDefault();
					e.stopPropagation();
					joinCode(join.dataset.code || '', openJoined);
				}
			},
			true,
		);
		// A click on a picture zooms it instead of opening the row it is in.
		panel.addEventListener(
			'click',
			(e) => {
				const img = targetOf(e).closest('img.sb-pic');
				if (!(img instanceof HTMLImageElement) || img.closest('#sb-me')) {
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

	/** @type {BcSocket | null} The ServerSocket our listeners are attached to (see listen). */
	let listening = null;
	/** Set by quit(); stops every timer callback and late reply from doing anything. */
	let stopped = false;
	/** @type {ReturnType<typeof setInterval> | undefined} The 1 s tick interval, cleared by quit(). */
	let tickTimer;
	/** Asks before quitting (⏻), in a box inside the panel. */
	function askQuit() {
		if (stopped || $('sb-ask')) {
			return;
		}
		const box = document.createElement('div');
		box.id = 'sb-ask';
		setHtml(
			box,
			html`<div class="sb-crop-card">
			<b>Turn SlimeBeep off?</b>
			<div class="sb-warn">⚠ To get it back you'll have to <u>reload the game</u> and <u>click your SlimeBeep bookmark again</u> (with the userscript it comes back on its own after the reload).</div>
			<span class="sb-hint" style="text-align:center">Your chats and settings stay.</span>
			<div class="sb-crop-btns"><button class="sb-pill" data-act="keep">Keep it on</button><button class="sb-go" data-act="quit">⏻ Turn off</button></div>
		</div>`,
		);
		const close = () => {
			box.remove();
			document.removeEventListener('keydown', onKey, true);
		};
		/** @param {KeyboardEvent} e */
		/** @param {KeyboardEvent} e */
		const onKey = (e) => {
			if (e.key === 'Escape') {
				e.stopPropagation();
				close();
			}
		};
		box.addEventListener('click', (e) => {
			const act = targetOf(e).dataset.act;
			if (act === 'quit') {
				close();
				quit();
			} else if (act === 'keep' || targetOf(e) === box) {
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
		for (const b of $$(document, '.sb-bcjoin')) {
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
	/** @type {{ at: string, from: number, type: string, text: string | null }[]} The last 20 beeps received, for SlimeBeep.debug(). */
	const seenBeeps = [];
	/**
	 * A beep as the server sends it (AccountBeep).
	 * @typedef {object} ServerBeep
	 * @property {number} MemberNumber the sender
	 * @property {string} MemberName
	 * @property {string} [BeepType] '' for a plain beep; PROTO for SlimeBeep's hidden ones; other add-ons use their own
	 * @property {string} [Message]
	 * @property {string} [ChatRoomName] the sender's room, when they shared it
	 * @property {string} [ChatRoomSpace]
	 * @property {boolean} [Private]
	 */
	/**
	 * Handles the two server messages SlimeBeep reads: AccountBeep and the OnlineFriends answer. Others are ignored.
	 * @param {string} event
	 * @param {unknown} data
	 */
	function onServer(event, data) {
		try {
			if (event === 'AccountQueryResult') {
				const answer = /** @type {{ Query?: string, Result?: Friend[] } | null} */ (data);
				if (!answer || answer.Query !== 'OnlineFriends' || !Array.isArray(answer.Result)) {
					return;
				}
				friends = answer.Result.filter((f) => f && f.MemberNumber !== Player.MemberNumber);
				friendsKnown = true;
				sendWaiting();
				if (isOpen() && tab !== 'chats') {
					render();
				}
			} else if (event === 'AccountBeep') {
				if (!data || typeof data !== 'object') {
					return;
				}
				const beepData = /** @type {ServerBeep} */ (data);
				// Copied before the game or another add-on changes it.
				/** @type {ServerBeep} */
				const d = {
					MemberNumber: beepData.MemberNumber,
					MemberName: beepData.MemberName,
					BeepType: beepData.BeepType,
					Message: beepData.Message,
					ChatRoomName: beepData.ChatRoomName,
					ChatRoomSpace: beepData.ChatRoomSpace,
					Private: beepData.Private,
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
	/**
	 * Catch-all socket listener; onServer keeps only AccountBeep and AccountQueryResult.
	 * @param {string} event
	 * @param {unknown} data
	 */
	const anyListener = (event, data) => onServer(event, data);
	/**
	 * Per-event listener, for a socket without a catch-all.
	 * @param {unknown} data
	 */
	const beepListener = (data) => onServer('AccountBeep', data);
	/**
	 * Per-event listener, for a socket without a catch-all.
	 * @param {unknown} data
	 */
	const queryListener = (data) => onServer('AccountQueryResult', data);
	/**
	 * Whether our listener is still attached to `sock` (true when the socket can't tell).
	 * @param {BcSocket} sock
	 * @param {boolean} catchAll whether we listen with the catch-all
	 */
	function stillListening(sock, catchAll) {
		if (catchAll) {
			return sock.listenersAny ? sock.listenersAny().includes(anyListener) : true;
		}
		return sock.listeners ? sock.listeners('AccountBeep').includes(beepListener) : true;
	}
	/**
	 * Attaches the listeners to ServerSocket (called every tick, re-attaching if they were removed).
	 * The catch-all goes first (prependAny) so a beep is read before another add-on can remove the
	 * game's listener for it or change it; it survives other code removing per-event listeners.
	 */
	function listen() {
		if (!loggedIn() || !ServerSocket || typeof ServerSocket.on !== 'function') {
			return;
		}
		const sock = ServerSocket;
		const catchAll = sock.prependAny || sock.onAny;
		if (listening === sock && stillListening(sock, !!catchAll)) {
			return;
		}
		listening = sock;
		if (catchAll) {
			if (sock.offAny) {
				sock.offAny(anyListener);
			}
			catchAll.call(sock, anyListener);
		} else {
			if (typeof sock.off === 'function') {
				sock.off('AccountBeep', beepListener);
				sock.off('AccountQueryResult', queryListener);
			}
			sock.on('AccountBeep', beepListener);
			sock.on('AccountQueryResult', queryListener);
		}
	}
	/** @typedef {'group' | 'groupGone' | 'presence' | 'slimeBeepFriend'} ApiEvent */
	/** @type {Record<ApiEvent, Set<(data: unknown) => void>>} Other add-ons' listeners for api.on(), by event. */
	const apiListeners = { group: new Set(), groupGone: new Set(), presence: new Set(), slimeBeepFriend: new Set() };
	/**
	 * Calls an api.on() event's listeners, each with its own copy of `data`.
	 * @param {ApiEvent} type
	 * @param {object} data
	 */
	function emit(type, data) {
		for (const fn of apiListeners[type]) {
			try {
				fn(JSON.parse(JSON.stringify(data)));
			} catch (e) {
				warn(e, `another add-on's ${type} listener`);
			}
		}
	}
	/**
	 * A member's role in a group.
	 * @param {Group} g
	 * @param {number} n
	 * @returns {'owner' | 'admin' | 'member'}
	 */
	function roleOf(g, n) {
		if (n === g.owner) {
			return 'owner';
		}
		return g.admins.includes(n) ? 'admin' : 'member';
	}
	/**
	 * A group as the API hands it out (see API.md).
	 * @param {Group} g
	 */
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
		/**
		 * One group by id, or null.
		 * @param {string} id
		 */
		group: (id) => (loggedIn() && groups[id] ? groupView(groups[id]) : null),
		/** The member numbers of friends known to have SlimeBeep. */
		slimeBeepFriends: () => [...peers],
		/**
		 * Whether this member number is a friend known to have SlimeBeep.
		 * @param {number} memberNumber
		 */
		hasSlimeBeep: (memberNumber) => peers.has(memberNumber),
		/**
		 * Opens SlimeBeep on a group chat.
		 * @param {string} id
		 */
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
		/**
		 * Invites someone to a group (see inviteToGroup).
		 * @param {string} id
		 * @param {number} memberNumber
		 */
		inviteToGroup: (id, memberNumber) => inviteToGroup(id, memberNumber),
		/**
		 * Opens SlimeBeep on "Invite <them> to…", listing the groups you can invite to.
		 * @param {number} memberNumber
		 */
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
		/**
		 * For theme add-ons: SlimeBeep takes the running theme add-on's colours (true) or its own (false). Off unless switched on.
		 * @param {boolean} on
		 */
		matchTheme: (on) => {
			setThemed(!!on);
			return !!applyThemed();
		},
		/** { on, source }: whether SlimeBeep matches a theme add-on, and which one it found ('Themed', 'BCNeko' or null). */
		matchingTheme: () => ({ on: !!opts.themed, source: themeSource()?.name || null }),
		/**
		 * Opens SlimeBeep on a chat with this member number.
		 * @param {number} memberNumber
		 */
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
		 * @param {string} type
		 * @param {(data: unknown) => void} fn
		 * @returns {() => void}
		 */
		on: (type, fn) => {
			if (!(type in apiListeners) || typeof fn !== 'function') {
				return () => {};
			}
			const set = apiListeners[/** @type {ApiEvent} */ (type)];
			set.add(fn);
			return () => {
				set.delete(fn);
			};
		},
	});

	/** State for bug reports, typed in the console. */
	window.SlimeBeep.debug = () => ({
		version: VERSION,
		missing: missing().map(([k]) => k),
		listening: !!listening,
		catchAll: !!(listening && (listening.prependAny || listening.onAny)),
		lastBeeps: seenBeeps.slice(),
	});

	/** @type {Map<number, number[]>} Member number -> times of their recent hidden beeps (see allow). */
	const hiddenBeepTimes = new Map();
	/**
	 * Whether a hidden beep from `n` is accepted: at most LIMITS.perMinute a minute.
	 * @param {number} n
	 */
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
	/** @type {Map<number, { v: string, n: number, parts: string[] }>} Member number -> a picture being received in pieces. */
	const pieces = new Map();
	/**
	 * A hidden beep's content (JSON). Every one has `sb: 1`, your picture version `pv` and key start `kf`.
	 * @typedef {object} HiddenPayload
	 * @property {number} sb always 1
	 * @property {string} [kf] the sender's key start
	 * @property {string | 0} [pv] the sender's picture version; 0 = no picture
	 * @property {1} [pfreq] asks for your picture
	 * @property {{ v: string, i: number, n: number, d: string }} [pf] piece `i` of `n` of picture version `v`
	 * @property {1} [ping] "do you have SlimeBeep?"
	 * @property {1} [pong] the answer
	 * @property {{ code: string, name: string }} [ginv] a group invite
	 */
	/**
	 * Picture fields of a hidden beep: `pv` (their picture version; 0 = none) makes us ask for a new one,
	 * `pfreq` asks for ours, `pf` is one piece of theirs.
	 * @param {number} from
	 * @param {Partial<HiddenPayload>} p
	 */
	function pictureNews(from, p) {
		const known = loadPfps()[from];
		if (p.pv === 0 && known) {
			delete loadPfps()[from];
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
			if (got.parts.filter((part) => typeof part === 'string').length === got.n) {
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
	/** @typedef {((data: string) => void) | null} PictureSaver gets a cropped picture instead of it becoming yours (group pictures) */
	/**
	 * Reads a picked image file, scales it to at most 320 px and opens the cropper on it.
	 * @param {File | null | undefined} file
	 * @param {PictureSaver} [onSave]
	 * @param {string} [title] the cropper's heading
	 */
	function setPicture(file, onSave = null, title = '') {
		if (!file || !/^image\//.test(file.type)) {
			notify('That is not a picture');
			return;
		}
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => {
			try {
				const k = Math.min(1, 320 / Math.max(img.naturalWidth, img.naturalHeight));
				const c = document.createElement('canvas');
				c.width = Math.max(1, Math.round(img.naturalWidth * k));
				c.height = Math.max(1, Math.round(img.naturalHeight * k));
				/** @type {CanvasRenderingContext2D} */ (c.getContext('2d')).drawImage(img, 0, 0, c.width, c.height);
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
	/**
	 * Opens the file picker, then setPicture.
	 * @param {PictureSaver} [onSave]
	 * @param {string} [title]
	 */
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
	 * @param {string} src an image data URL
	 * @param {PictureSaver} [onSave]
	 * @param {string} [title]
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
			setHtml(
				box,
				html`<div class="sb-crop-card">
				<button class="sb-crop-x" data-act="cancel" title="Close">${ICONS.close}</button>
				<b>${title || 'Fit your picture in the circle'}</b>
				<div class="sb-crop-ring" style="width:${SIZE}px;height:${SIZE}px"><canvas width="${SIZE}" height="${SIZE}"></canvas></div>
				<span class="sb-hint">Drag to move it, scroll or slide to zoom.</span>
				<input type="range" min="1" max="4" step="0.01" value="1" aria-label="Zoom">
				<div class="sb-crop-btns"><button class="sb-pill" data-act="cancel">Cancel</button><button class="sb-go" data-act="save">Save</button></div>
			</div>`,
			);
			if (!isOpen()) {
				setOpen(true);
			}
			$('sb-panel').appendChild(box);
			// Closed by Cancel, ✕, a click outside the card, Escape, or the panel closing.
			/** @param {KeyboardEvent} e */
			/** @param {KeyboardEvent} e */
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
			const cv = /** @type {HTMLCanvasElement} */ (box.querySelector('canvas'));
			const ctx = /** @type {CanvasRenderingContext2D} */ (cv.getContext('2d'));
			const slider = /** @type {HTMLInputElement} */ (box.querySelector('input'));
			// The picture always covers the whole circle.
			const clampXY = () => {
				const sw = w * base * zoom,
					sh = h * base * zoom;
				x = Math.max(-(sw - SIZE) / 2, Math.min((sw - SIZE) / 2, x));
				y = Math.max(-(sh - SIZE) / 2, Math.min((sh - SIZE) / 2, y));
			};
			/**
			 * Draws the picture as placed now, onto the cropper or onto the output canvas.
			 * @param {CanvasRenderingContext2D} [to]
			 * @param {number} [size]
			 */
			const draw = (to = ctx, size = SIZE) => {
				const k = size / SIZE,
					sw = w * base * zoom * k,
					sh = h * base * zoom * k;
				to.clearRect(0, 0, size, size);
				to.drawImage(img, size / 2 + x * k - sw / 2, size / 2 + y * k - sh / 2, sw, sh);
			};
			/** @param {number} z */
			const setZoom = (z) => {
				zoom = Math.max(1, Math.min(4, z));
				slider.value = String(zoom);
				clampXY();
				draw();
			};
			draw();
			/** @type {{ px: number, py: number, x: number, y: number } | null} Drag start: pointer and picture position. */
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
				const act = targetOf(e).dataset.act;
				if (targetOf(e) === box || act === 'cancel') {
					box.remove();
					return;
				}
				if (act !== 'save') {
					return;
				}
				let data = '';
				for (const size of [128, 96, 64]) {
					const out = document.createElement('canvas');
					out.width = out.height = size;
					const octx = /** @type {CanvasRenderingContext2D} */ (out.getContext('2d'));
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
					notify('That picture is too big, try another');
					return;
				}
				box.remove();
				if (onSave) {
					onSave(data);
					return;
				}
				setOpt('pfp', { v: newId(), data });
				pushPicture();
				showMe();
				notify('✓ New profile picture');
				if (isOpen()) {
					render(true);
				}
			});
		};
		img.onerror = () => notify('That picture could not be read');
		img.src = src;
	}
	/** Image element drawMyPic draws from. */
	const picImg = new Image();
	/**
	 * Draws your picture in a circle on the game's canvas (Extensions page).
	 * @param {number} left
	 * @param {number} top
	 * @param {number} size
	 */
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
	/**
	 * A picture shown big, until clicked or Escape.
	 * @param {string} src an image data URL
	 */
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
		/** @param {KeyboardEvent} e */
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
		setHtml(me, html`${loggedIn() && avatar(Player.MemberNumber, myName())}`);
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
	 * @param {ServerBeep} d
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
		/** @type {Partial<HiddenPayload> | null} */
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
	/**
	 * Records a friend as having SlimeBeep and redraws, so the 🫧 by their name shows.
	 * @param {number} n
	 */
	function foundPeer(n) {
		peers.add(n);
		saveGC();
		emit('slimeBeepFriend', { memberNumber: n });
		if (isOpen()) {
			render(true);
		}
	}
	/**
	 * Answers a friend's "do you have SlimeBeep?" with a pong, at most once a minute per friend.
	 * @param {number} n
	 */
	function answerPing(n) {
		if (Date.now() - (ponged.get(n) || 0) < 60000) {
			return;
		}
		ponged.set(n, Date.now());
		sendHidden(n, { sb: 1, pong: 1 });
	}
	/**
	 * Keeps a friend's group invite in `invitations` and shows a card; nothing is joined automatically.
	 * @param {number} from
	 * @param {string} senderName
	 * @param {{ code?: unknown, name?: unknown }} ginv
	 * @param {boolean} [quiet] no card or sound (the invite came in a beep, which has its own)
	 */
	function takeInvite(from, senderName, ginv, quiet = false) {
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
		if (quiet) {
			if (isOpen() && tab === 'groups' && thread === null) {
				render(true);
			}
			return;
		}
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
	 * A message from the relay (JSON). Which fields are set depends on `t`; see relay/src/index.js.
	 * @typedef {object} RelayMessage
	 * @property {string} t 'hello', 'welcome', 'roster', 'presence', 'msg', 'history', 'pic', 'gpic', 'invite', 'gone', 'error', 'ok', 'mail'
	 * @property {string} [nonce] hello: what to sign
	 * @property {RelayRoster} [roster] welcome, roster
	 * @property {number[]} [online] presence
	 * @property {RelayGroupMessage} [m] msg
	 * @property {RelayGroupMessage[]} [msgs] history
	 * @property {number} [n] pic: whose picture
	 * @property {string | null} [data] pic, gpic: the picture, or null when removed
	 * @property {string} [code] invite: the new secret
	 * @property {string} [why] error, gone
	 * @property {boolean} [fatal] error: the connection is closed
	 * @property {string} [ref] ok, error: the id sent with the request
	 * @property {MailItem[]} [list] mail
	 */
	/**
	 * A group's roster as the relay sends it.
	 * @typedef {object} RelayRoster
	 * @property {string} name
	 * @property {number} owner
	 * @property {number[]} admins
	 * @property {boolean} open
	 * @property {number[]} online
	 * @property {GroupMember[]} members
	 */
	/**
	 * A stored group message.
	 * @typedef {object} RelayGroupMessage
	 * @property {number} id
	 * @property {number} at
	 * @property {number} [from]
	 * @property {string} [name]
	 * @property {string} text
	 * @property {boolean} [sys] a system line ("X joined")
	 */
	/**
	 * A beep left in a mailbox.
	 * @typedef {object} MailItem
	 * @property {string} id
	 * @property {number} from
	 * @property {string} name
	 * @property {string} fromKf the start of the key the sender signed in with
	 * @property {string} text
	 * @property {number} at
	 */
	/**
	 * A relay connection to one group.
	 * @typedef {object} Conn
	 * @property {WebSocket | null} ws
	 * @property {boolean} ready signed in
	 * @property {number} [retry] reconnects so far (for the backoff)
	 * @property {object[]} queue messages waiting for the sign-in
	 * @property {((code: string | null, why?: string) => void)[]} waiters callbacks of invite requests, in order
	 * @property {{ name: string, open: boolean }} [create] makes the group on sign-in
	 * @property {string} [invite] joins with this invite secret on sign-in
	 * @property {(gid: string) => void} [onWelcome] called once signed in
	 * @property {(why: string) => void} [onFail] called if the sign-in fails
	 * @property {boolean} [dead] closed on purpose (no reconnect)
	 * @property {number} [pinged] last keep-alive
	 */
	/** @type {Record<string, Conn>} One relay connection per group (reconnects with backoff, up to 5 min), by group id. */
	const conns = {};
	/** @type {Record<number, string>} Member number -> picture shared in a group (for members who aren't friends). */
	let relayPics = {};
	/**
	 * This account's signing key in this browser.
	 * @typedef {object} KeyPair
	 * @property {number} owner member number
	 * @property {CryptoKey} priv
	 * @property {{ x: string, y: string }} pub
	 * @property {string} kf the first 16 chars of pub.x
	 */
	/** @type {KeyPair | null} Cached result of getKey. */
	let myKey = null;
	/**
	 * Bytes as base64url (no padding).
	 * @param {ArrayBuffer} buf
	 */
	const b64url = (buf) =>
		btoa(String.fromCharCode(...new Uint8Array(buf)))
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');

	/** Whether this page can sign in to the relay: WebCrypto (crypto.subtle) exists only on https pages. */
	const secure = () => typeof crypto !== 'undefined' && !!crypto.subtle;
	/** This page's address over https. */
	const httpsUrl = () => location.href.replace(/^http:/, 'https:');
	/** Whether needHttps has shown its card. */
	let httpsTold = false;
	/** On an http page: tells the player, once per visit, that group chats and mailboxes need the https address. */
	function needHttps() {
		if (httpsTold) {
			return;
		}
		httpsTold = true;
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
	 * @param {number} owner the mailbox's member number (yours to read, a friend's to leave a beep)
	 * @param {(p: RelayMessage, ws: WebSocket) => void} onMsg gets every message from the relay
	 * @returns {Promise<WebSocket>} resolves once signed in
	 */
	function mailOpen(owner, onMsg) {
		return new Promise((resolve, reject) => {
			/** @type {WebSocket | null} */
			let ws = null;
			let done = false;
			/** @param {string | null} err why it failed, or null once signed in */
			const fin = (err) => {
				if (done) {
					return;
				}
				done = true;
				clearTimeout(timer);
				if (!err && ws) {
					resolve(ws);
					return;
				}
				try {
					if (ws) {
						ws.close();
					}
				} catch (e) {
					/* gone */
				}
				reject(new Error(err || 'closed'));
			};
			const timer = setTimeout(() => fin('no answer'), 10000);
			/** @type {WebSocket} */
			let sock;
			try {
				sock = new WebSocket(`${relayUrl()}/ws?m=${owner}`);
			} catch (e) {
				fin('could not connect');
				return;
			}
			ws = sock;
			sock.onmessage = async (e) => {
				/** @type {RelayMessage | null} */
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
						sock.send(JSON.stringify({ t: 'auth', member: me, name: myName(), pub: k.pub, sig: b64url(sig) }));
					} catch (x) {
						fin('could not sign in');
					}
					return;
				}
				if (p.t === 'error' && p.fatal) {
					fin(clean(p.why, 80) || 'refused');
					return;
				}
				if (p.t === 'welcome' || p.t === 'mail') {
					fin(null);
				}
				try {
					onMsg(p, sock);
				} catch (x) {
					warn(x, 'mail');
				}
			};
			sock.onclose = () => fin('closed');
		});
	}
	/** True while mailWaiting runs. */
	let mailing = false;
	/**
	 * Leaves `waiting` beeps for SlimeBeep friends in their mailboxes; delivered ones move to `hist` (📬).
	 * A beep is retried after 10 minutes, or straight away with `now`.
	 * @param {boolean} [now]
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
				/** @type {Map<string, boolean>} beep id -> left in the mailbox */
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
	/**
	 * Adds mailbox beeps to `hist` and acks them. Beeps from non-friends or with a wrong sender key are dropped.
	 * @param {MailItem[] | undefined} list
	 * @param {WebSocket} sock
	 */
	function takeMail(list, sock) {
		if (!Array.isArray(list) || !list.length) {
			return;
		}
		/** @type {string[]} */
		const ids = [];
		/** @type {HistEntry[]} */
		const fresh = [];
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
		const x = jwk.x || '';
		const y = jwk.y || '';
		return (myKey = { owner: me, priv: pair.privateKey, pub: { x, y }, kf: x.slice(0, 16) });
	}

	/**
	 * Opens (or returns) the relay connection for a group.
	 * @param {string} gid
	 * @param {Partial<Conn>} [extra] fields for the connection record, such as `create` or `invite` for the sign-in
	 * @returns {Conn}
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
		/** @type {Conn} */
		const c = { ws: null, ready: false, retry: old ? old.retry || 0 : 0, queue: [], waiters: [], ...extra };
		conns[gid] = c;
		/** @type {WebSocket} */
		let sock;
		try {
			sock = new WebSocket(`${relayUrl()}/ws?g=${gid}`);
		} catch (e) {
			warn(e, 'relay');
			return c;
		}
		c.ws = sock;
		sock.onmessage = (e) => {
			/** @type {RelayMessage} */
			let p;
			try {
				p = JSON.parse(e.data);
			} catch (x) {
				return;
			}
			onRelay(gid, c, p).catch((x) => warn(x, 'relay'));
		};
		sock.onclose = () => {
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
	/**
	 * Sends to a group's relay connection, or queues it until signed in.
	 * @param {string} gid
	 * @param {object} x the message (JSON)
	 */
	function relaySend(gid, x) {
		const c = conns[gid] || connectGroup(gid);
		if (c.ready && c.ws && c.ws.readyState === 1) {
			c.ws.send(JSON.stringify(x));
		} else {
			c.queue.push(x);
		}
	}

	/**
	 * Handles one message from a group's relay connection (sign-in, roster, messages, pictures, invites, errors).
	 * @param {string} gid
	 * @param {Conn} c
	 * @param {RelayMessage} p
	 */
	async function onRelay(gid, c, p) {
		if (!p || typeof p !== 'object' || conns[gid] !== c) {
			return;
		}
		const me = Player.MemberNumber;
		const ws = c.ws;
		if (!ws) {
			return;
		}
		if (p.t === 'hello' && typeof p.nonce === 'string') {
			const k = await getKey();
			const signed = `${p.nonce}|${gid}|${me}`;
			const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, k.priv, new TextEncoder().encode(signed));
			const g = groups[gid];
			ws.send(
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
				ws.send(JSON.stringify({ t: 'profile', pic: pic ? pic.data : null }));
				g.picv = pic ? pic.v : undefined;
				saveGC();
			}
			const done = c.onWelcome;
			c.create = undefined;
			c.invite = undefined;
			c.onWelcome = undefined;
			c.onFail = undefined;
			for (const x of c.queue.splice(0)) {
				ws.send(JSON.stringify(x));
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
			if (p.m) {
				takeMsgs(gid, [p.m], true);
			}
			return;
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
				c.onFail = undefined;
			}
			if (groups[gid] && (p.t === 'gone' || /not a member|no such group/.test(why))) {
				/** @type {string | null} */
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
			const waiter = /invite|full|already a member|member number/.test(why) && c.waiters.shift();
			if (waiter) {
				waiter(null, why);
			}
			notify(`⚠ ${why}`);
		}
	}

	/**
	 * Stores a group's roster from the relay (cleaned); ignored if you are not in it.
	 * @param {string} gid
	 * @param {Partial<RelayRoster> | undefined} r
	 */
	function takeRoster(gid, r) {
		if (!r || typeof r !== 'object' || !Array.isArray(r.members)) {
			return;
		}
		const old = groups[gid];
		const members = r.members
			.slice(0, LIMITS.members)
			.filter((m) => m && isNum(m.n))
			.map((m) => ({ n: m.n, name: clean(m.name, LIMITS.name) || `#${m.n}`, kf: typeof m.kf === 'string' ? m.kf.slice(0, 16) : '' }));
		const rosterOnline = r.online;
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
			online: Array.isArray(rosterOnline) ? rosterOnline.filter(isNum).slice(0, LIMITS.members) : (old && old.online) || [],
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
	 * Adds group messages to `hist`.
	 * @param {string} gid
	 * @param {RelayGroupMessage[] | undefined} msgs
	 * @param {boolean} isLive they just arrived (a card each); otherwise history from the sign-in (one card for all)
	 */
	function takeMsgs(gid, msgs, isLive) {
		const g = groups[gid];
		if (!g || !Array.isArray(msgs)) {
			return;
		}
		const me = Player.MemberNumber;
		/** @type {HistEntry[]} */
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
			/** @type {HistEntry} */
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

	/**
	 * Forgets a group (left, removed or deleted): connection, state and messages.
	 * @param {string} gid
	 * @param {string | null} note shown as a card
	 */
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

	/**
	 * Sends a message to a group.
	 * @param {string} id
	 * @param {string} text
	 */
	const sendGroup = (id, text) => relaySend(id, { t: 'say', text });
	/**
	 * Makes a group on the relay and invites the `picked` friends.
	 * @param {string} name
	 * @param {number[]} picked
	 * @param {boolean} open anyone in it can invite (else admins only)
	 * @param {(id: string) => void} done gets the new group id once it exists
	 */
	function createGroup(name, picked, open, done) {
		if (!secure()) {
			needHttps();
			return;
		}
		const id = newId();
		connectGroup(id, {
			create: { name: clean(name, LIMITS.name) || 'Group chat', open: !!open },
			onWelcome: () => {
				inviteAll(id, picked);
				if (done) {
					done(id);
				}
			},
			onFail: (why) => notify(`⚠ Couldn't make the group${why ? `: ${why}` : ''}`),
		});
	}
	/**
	 * Asks the relay for an invite code.
	 * @param {string} id the group
	 * @param {number | null} member the only member number it works for, or null for anyone
	 * @param {(code: string | null, why?: string) => void} cb
	 */
	function requestInvite(id, member, cb) {
		const c = conns[id] || connectGroup(id);
		c.waiters.push(cb);
		relaySend(id, { t: 'invite', member: member == null ? null : member });
	}
	/**
	 * Invites one member to a group with a code made for them alone. Friends get it delivered
	 * (deliverInvite); for anyone else the code is returned to pass on.
	 * @param {string} id
	 * @param {number} n
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

	/**
	 * Invites friends to a group (inviteToGroup each), then says in one note how it went.
	 * @param {string} id
	 * @param {number[]} picked
	 */
	async function inviteAll(id, picked) {
		const results = await Promise.all(picked.map((n) => inviteToGroup(id, n)));
		const sent = picked.filter((n, i) => results[i].ok && results[i].sent && results[i].sent !== 'later');
		const later = picked.filter((n, i) => results[i].sent === 'later');
		const failed = picked.filter((n, i) => !results[i].ok);
		const notes = [];
		if (sent.length) {
			notes.push(`📨 ${sent.length} invite${sent.length === 1 ? '' : 's'} sent`);
		}
		if (later.length) {
			notes.push(`⏳ ${later.map(nameOf).join(', ')}: no SlimeBeep, so try again in a minute`);
		}
		if (failed.length) {
			const why = results[picked.indexOf(failed[0])].why;
			notes.push(`⚠ No invite for ${failed.map(nameOf).join(', ')}${why ? `: ${why}` : ''}`);
		}
		if (notes.length) {
			notify(notes.join(' · '));
		}
	}
	/** Most invite beeps to friends without SlimeBeep per minute. */
	const PLAIN_MAX = 3;
	/** Milliseconds between invite beeps to friends without SlimeBeep. */
	const PLAIN_GAP = 3000;
	/** Milliseconds between invite beeps to friends with SlimeBeep. */
	const PEER_GAP = 1000;
	/** @type {number[]} Times of the invite beeps to friends without SlimeBeep sent in the last minute. */
	const plainSent = [];
	/** When the last scheduled invite beep goes out. */
	let inviteAt = 0;
	/**
	 * Delivers a friend's invite code in a beep, which shows in both chats: friends with SlimeBeep get it
	 * as an invite too (inviteFromBeep), the others get a word on where to find SlimeBeep (at most
	 * PLAIN_MAX a minute). Invite beeps go out PLAIN_GAP / PEER_GAP apart.
	 * @param {number} n
	 * @param {string} code
	 * @param {string} name the group's name
	 * @returns {'invite'|'beep'|'later'} 'invite' to a friend with SlimeBeep; 'later': over the limit, nothing sent
	 */
	function deliverInvite(n, code, name) {
		const peer = peers.has(n);
		const now = Date.now();
		if (!peer) {
			while (plainSent.length && now - plainSent[0] > 60000) {
				plainSent.shift();
			}
			if (plainSent.length >= PLAIN_MAX) {
				return 'later';
			}
			plainSent.push(now);
		}
		inviteAt = Math.max(now, inviteAt + (peer ? PEER_GAP : PLAIN_GAP));
		const text = peer
			? `👥 Join my group chat "${name}": ${code}`
			: `👥 Come join my group chat "${name}" on SlimeBeep (a BC add-on, in FUSAM's Addon Manager). Group code: ${code}`;
		setTimeout(() => beep(n, text, false), inviteAt - now);
		return peer ? 'invite' : 'beep';
	}
	/**
	 * Disables pick-list boxes past PLAIN_MAX ticked friends without SlimeBeep (or all unticked ones when `full`).
	 * @param {HTMLInputElement[]} boxes
	 * @param {boolean} full
	 */
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
	/**
	 * Opens a group's chat (after joining it).
	 * @param {string} gid
	 */
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
		for (const el of $$(chatLog, '.ChatMessage:not([data-sb-seen])')) {
			el.dataset.sbSeen = '1';
			const codes = [...new Set(String(el.textContent || '').match(CODE_IN) || [])].slice(0, 3);
			for (const code of codes) {
				const b = document.createElement('button');
				b.className = 'sb-bcjoin';
				b.textContent = groups[codeGroup(code)] ? '👥 Open in SlimeBeep' : '👥 Join';
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
	/**
	 * Joins a group with an invite code (SB-…).
	 * @param {string} raw the code as typed or pasted
	 * @param {(gid: string) => void} [done] runs once in, or at once if already a member
	 */
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
	/**
	 * Leaves a group on the relay, then forgets it here.
	 * @param {string} id
	 */
	function leaveGroup(id) {
		relaySend(id, { t: 'leave' });
		setTimeout(() => dropGroup(id, null), 600);
	}
	/**
	 * Deletes a group for everyone (the relay accepts it from the owner only).
	 * @param {string} id
	 */
	function deleteGroup(id) {
		relaySend(id, { t: 'disband' });
		setTimeout(() => dropGroup(id, null), 600);
	}
	/**
	 * The 🚪 box: leave the group, or (owner) delete it.
	 * @param {string} id
	 */
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
		setHtml(
			box,
			html`<div class="sb-crop-card">
			<b>${g.name}</b>
			<span class="sb-hint" style="text-align:center">${leaveHint}</span>
			${canDelete && html`<div class="sb-warn">Delete removes the group and all its messages <u>for everyone</u>. It can't be undone.</div>`}
			<div class="sb-crop-btns" style="flex-wrap:wrap;justify-content:center"><button class="sb-pill" data-act="keep">Cancel</button><button class="sb-go" data-act="leave">🚪 Leave</button>${canDelete && html`<button class="sb-go sb-danger" data-act="delete">🗑 Delete group</button>`}</div>
		</div>`,
		);
		const close = () => {
			box.remove();
			document.removeEventListener('keydown', onKey, true);
		};
		/** @param {KeyboardEvent} e */
		const onKey = (e) => {
			if (e.key === 'Escape') {
				e.stopPropagation();
				close();
			}
		};
		box.addEventListener('click', (e) => {
			const act = targetOf(e).dataset.act;
			if (act === 'keep' || targetOf(e) === box) {
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
	/**
	 * ✓ if a group member's key matches the one their own SlimeBeep sent you, ⚠ if not, nothing if unknown.
	 * @param {GroupMember} m
	 */
	function keyMark(m) {
		if (m.n === Player.MemberNumber || !peerKeys[m.n] || !m.kf) {
			return '';
		}
		return peerKeys[m.n] === m.kf
			? html` <span title="Checked: the same key their own SlimeBeep sent you">✓</span>`
			: html` <span title="Not the key their own SlimeBeep sent you: this may not really be them">⚠</span>`;
	}

	/** @type {[number, string][]} Hidden beeps waiting to go out, sent 250 ms apart by drain: [member number, message]. */
	const outbox = [];
	/**
	 * Queues a hidden beep to a friend; every one also carries your picture version (`pv`) and key start (`kf`).
	 * @param {number} n
	 * @param {HiddenPayload} payload
	 */
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
	 * @param {ServerBeep} d
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
		if (isSignal(msg, type)) {
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
				inviteFromBeep(h);
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
	/**
	 * Opens or closes the panel.
	 * @param {boolean} on
	 */
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

	/** Positions the toggle (opts.pos, kept on screen) and the window (opts.win, or next to the toggle). */
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
		const r = windowRect(left, top, size);
		panel.style.left = `${r.x}px`;
		panel.style.top = `${r.y}px`;
		panel.style.width = `${r.w}px`;
		panel.style.height = `${r.h}px`;
		placeCards();
	}

	/** The window's usual size, and the smallest it can be made (narrower squeezes the tabs). */
	const WIN = { w: 340, h: 480, minW: 340, minH: 320 };
	/**
	 * `v` kept between `lo` and `hi` (`lo` wins when they cross, as in a window smaller than the minimum).
	 * @param {number} v
	 * @param {number} lo
	 * @param {number} hi
	 */
	const fit = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
	/**
	 * Where the window goes: opts.win (kept inside the browser window), else by the toggle at the usual
	 * size, above it if it fits, else below, else as low as fits.
	 * @param {number} left the toggle's place
	 * @param {number} top
	 * @param {number} size the toggle's size
	 * @returns {{ x: number, y: number, w: number, h: number }}
	 */
	function windowRect(left, top, size) {
		const win = opts.win;
		if (win && [win.x, win.y, win.w, win.h].every(Number.isFinite)) {
			const w = Math.round(fit(win.w, Math.min(WIN.minW, innerWidth - 16), innerWidth - 16));
			const h = Math.round(fit(win.h, Math.min(WIN.minH, innerHeight - 16), innerHeight - 16));
			return { x: Math.round(fit(win.x, 8, innerWidth - w - 8)), y: Math.round(fit(win.y, 8, innerHeight - h - 8)), w, h };
		}
		const w = Math.min(WIN.w, innerWidth - 16);
		const h = Math.min(WIN.h, innerHeight - 16);
		const above = top - h - 10;
		const below = top + size + 10;
		let y = Math.max(8, innerHeight - h - 8);
		if (above >= 8) {
			y = above;
		} else if (below + h <= innerHeight - 8) {
			y = below;
		}
		return { x: Math.max(8, Math.min(innerWidth - w - 8, left + size - w)), y, w, h };
	}
	/**
	 * Makes the window move by its header and resize by its edges and corners, like a desktop window;
	 * the result is saved in opts.win. Double-clicking an edge gives back the usual size.
	 * @param {HTMLElement} panel
	 */
	function wireWindow(panel) {
		/** @type {{ mode: string, x0: number, y0: number, lastX: number, lastY: number, r: DOMRect } | null} The move or resize in progress ('move', or the edges: 'n', 'se'...). */
		let op = null;
		const head = /** @type {HTMLElement} */ (panel.querySelector('.sb-head'));
		/**
		 * @param {PointerEvent} e
		 * @param {string} mode
		 * @param {HTMLElement} el gets the pointer capture
		 */
		const begin = (e, mode, el) => {
			e.preventDefault();
			op = { mode, x0: e.clientX, y0: e.clientY, lastX: e.clientX, lastY: e.clientY, r: panel.getBoundingClientRect() };
			try {
				el.setPointerCapture(e.pointerId);
			} catch (err) {
				/* works without capture */
			}
		};
		/** @param {PointerEvent} e */
		const move = (e) => {
			if (!op) {
				return;
			}
			if (!(e.buttons & 1)) {
				end();
				return;
			}
			// As with the slime: the pointer is kept inside the window, and a jump of half of it is no real move.
			const x = fit(e.clientX, 0, innerWidth);
			const y = fit(e.clientY, 0, innerHeight);
			if (Math.abs(x - op.lastX) > innerWidth / 2 || Math.abs(y - op.lastY) > innerHeight / 2) {
				return;
			}
			op.lastX = x;
			op.lastY = y;
			const dx = x - op.x0;
			const dy = y - op.y0;
			const r = op.r;
			let left = r.left;
			let top = r.top;
			let right = r.right;
			let bottom = r.bottom;
			if (op.mode === 'move') {
				left = fit(r.left + dx, 8, innerWidth - r.width - 8);
				top = fit(r.top + dy, 8, innerHeight - r.height - 8);
				right = left + r.width;
				bottom = top + r.height;
			} else {
				if (op.mode.includes('w')) {
					left = fit(r.left + dx, 8, right - WIN.minW);
				}
				if (op.mode.includes('e')) {
					right = fit(r.right + dx, left + WIN.minW, innerWidth - 8);
				}
				if (op.mode.includes('n')) {
					top = fit(r.top + dy, 8, bottom - WIN.minH);
				}
				if (op.mode.includes('s')) {
					bottom = fit(r.bottom + dy, top + WIN.minH, innerHeight - 8);
				}
			}
			opts.win = { x: Math.round(left), y: Math.round(top), w: Math.round(right - left), h: Math.round(bottom - top) };
			panel.style.left = `${opts.win.x}px`;
			panel.style.top = `${opts.win.y}px`;
			panel.style.width = `${opts.win.w}px`;
			panel.style.height = `${opts.win.h}px`;
			placeCards();
		};
		/** Ends a move or resize and saves where the window is. */
		const end = () => {
			if (!op) {
				return;
			}
			op = null;
			saveOpts();
			place();
		};
		head.addEventListener('pointerdown', (e) => {
			if (e.button === 0 && !targetOf(e).closest('button')) {
				begin(e, 'move', head);
			}
		});
		const handles = $$(panel, '.sb-rs');
		for (const el of [head, ...handles]) {
			el.addEventListener('pointermove', move);
			el.addEventListener('pointerup', end);
			el.addEventListener('pointercancel', end);
			el.addEventListener('lostpointercapture', end);
		}
		for (const g of handles) {
			g.addEventListener('pointerdown', (e) => {
				if (e.button === 0) {
					begin(e, g.dataset.rs || 'se', g);
				}
			});
			g.addEventListener('dblclick', () => {
				const r = panel.getBoundingClientRect();
				setOpt('win', { x: Math.round(r.left), y: Math.round(r.top), w: WIN.w, h: WIN.h });
				place();
			});
		}
	}

	/** Ticks since start (theme matching runs every 5th). */
	let tickCount = 0;
	/** Whether a tick error was already logged (only the first one is). */
	let tickWarned = false;
	/** When the friend list was last asked for while beeps wait. */
	let friendsAskedAt = 0;
	/** Runs every second: listeners, relay, update note, new beeps (badge, sound, cards, redraw). */
	function tick() {
		try {
			updateNote();
			gameCheck();
			if (waiting.length && loggedIn() && Date.now() - (friendsAskedAt || 0) > 60000) {
				friendsAskedAt = Date.now();
				askFriends();
			}
			if (!tickCount || ++tickCount % 5 === 0) {
				applyThemed();
			}
			if (loggedIn()) {
				joinButtonsInChat();
			}
			tickCount = tickCount || 1;
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
			fresh.forEach(inviteFromBeep);
			for (const h of fresh.slice(-4)) {
				announce(h);
			}
			if (isOpen() && tab !== 'options' && tab !== 'wave') {
				render(true);
			}
		} catch (e) {
			if (!tickWarned) {
				tickWarned = true;
				warn(e);
			}
		}
	}

	/**
	 * A friend's beep with a group code in it (how SlimeBeep sends invites) is kept with the invitations,
	 * as an invite card would be. Codes from strangers only get the Join button in the chat.
	 * @param {HistEntry} h
	 */
	function inviteFromBeep(h) {
		if (h.group || h.Sent || typeof h.Message !== 'string' || !isFriend(h.MemberNumber)) {
			return;
		}
		const text = parseBeep(h.Message).text;
		const code = (text.match(CODE_IN) || [])[0];
		if (code) {
			takeInvite(h.MemberNumber, h.MemberName, { code, name: (/group chat "(.*)"/.exec(text) || [])[1] }, true);
		}
	}
	/**
	 * Shows a new message: a card (unless that chat is open) and, with opts.desktop, a system notification.
	 * @param {HistEntry} h
	 */
	function announce(h) {
		if (!h.group && isOpen() && thread === h.MemberNumber && !document.hidden) {
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
			threadPin = undefined;
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

	/**
	 * A card by the toggle.
	 * @typedef {object} CardOptions
	 * @property {SafeHtml} icon
	 * @property {string} title
	 * @property {string} text
	 * @property {string} [sub] a small line under the text
	 * @property {() => void} [onClick]
	 * @property {number} [ms] how long it stays; 0 until closed
	 * @property {string} [cls] an extra class ('news')
	 */
	/**
	 * Adds a card to the stack (at most 4).
	 * @param {CardOptions} options
	 */
	function card({ icon, title, text, sub = '', onClick, ms = 7000, cls = '' }) {
		if (stopped) {
			return;
		}
		const box = $('sb-cards');
		const c = document.createElement('div');
		c.className = `sb-card ${cls}`;
		setHtml(
			c,
			html`${icon}<span class="sb-main"><b>${title}</b><span class="sb-txt">${text}</span>${sub && html`<small>${sub}</small>`}</span><button class="sb-x" title="Dismiss">${ICONS.close}</button>`,
		);
		const close = () => {
			c.classList.add('out');
			setTimeout(() => {
				c.remove();
				placeCards();
			}, 250);
		};
		/** @type {HTMLElement} */ (c.querySelector('.sb-x')).addEventListener('click', (e) => {
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
		while (box.lastElementChild && box.children.length > 4) {
			box.lastElementChild.remove();
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

	/**
	 * An item of news.json.
	 * @typedef {object} NewsItem
	 * @property {string} id a version, for its update note, or any id
	 * @property {string} [title]
	 * @property {string} text
	 * @property {string} [date]
	 */
	/** @type {NewsItem[]} The items of news.json. */
	let newsItems = [];

	/** When the chat log appeared (0: not in a room). */
	let noteRoomSince = 0;
	/** Update notes posted so far without showing up in the log. */
	let noteTries = 0;
	/** True while a posted note is being checked. */
	let notePending = false;
	/** When the last note was posted. */
	let noteLastTry = 0;
	/**
	 * After an update or first install, posts a local note (only you see it) in the room chat with the
	 * version and its news.json item. Waits until the chat log has been up 3 s and the news has loaded,
	 * and retries up to 5 times until the note is really in the log.
	 */
	function updateNote() {
		if (opts.lastVersion === VERSION || !loggedIn() || typeof ChatRoomSendLocal !== 'function' || notePending) {
			return;
		}
		const chatLog = document.getElementById('TextAreaChatLog');
		const inRoom = !!chatLog && (typeof ServerPlayerIsInChatRoom === 'function' ? ServerPlayerIsInChatRoom() : !!myRoom());
		if (!inRoom) {
			noteRoomSince = 0;
			return;
		}
		if (!noteRoomSince) {
			noteRoomSince = Date.now();
		}
		if (Date.now() - noteRoomSince < 3000 || (!newsLoaded && Date.now() - started < 15000)) {
			return;
		}
		if (Date.now() - (noteLastTry || 0) < 10000) {
			return;
		}
		const item = newsItems.find((i) => i.id === VERSION);
		const first = !opts.lastVersion;
		const head = first ? `SlimeBeep v${VERSION} is ready!` : `SlimeBeep updated to v${VERSION}`;
		let body = first ? 'Click the pink slime to beep your friends.' : '';
		if (item) {
			body = item.text;
		}
		notePending = true;
		noteLastTry = Date.now();
		const iconStyle = `width:1.3em;height:1.3em;vertical-align:middle;border-radius:50%;margin-right:4px${opts.night ? ';filter:hue-rotate(-105deg)' : ''}`;
		ChatRoomSendLocal(
			String(
				html`<div class="sb-update-note" data-v="${VERSION}" style="margin:2px 0;padding:4px 10px;border-radius:10px;background:#ffe6f3;color:#a3155c;border-left:4px solid #ff4fa3;font-size:.9em"><img src="${ICON}" style="${iconStyle}" alt=""><b>${head}</b>${body && ` ${body}`}</div>`,
			),
		);
		setTimeout(() => {
			notePending = false;
			const shown = !!document.querySelector(`#TextAreaChatLog .sb-update-note[data-v="${CSS.escape(VERSION)}"]`);
			noteTries = (noteTries || 0) + 1;
			if (shown || noteTries >= 5) {
				opts.lastVersion = VERSION;
				saveOpts();
			}
		}, 1500);
	}
	/** Whether gameCheck has run. */
	let gameChecked = false;
	/** Once per load: a card listing what won't work if game globals in NEEDS are missing (once per version and set). */
	function gameCheck() {
		if (gameChecked || !loggedIn()) {
			return;
		}
		gameChecked = true;
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
				const seen = Array.isArray(opts.seenNews) ? opts.seenNews : valid.slice(0, -1).map((i) => i.id);
				for (const i of valid.filter((x) => !seen.includes(x.id)).slice(-3)) {
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

	/**
	 * The opts.muted key of a message's chat.
	 * @param {HistEntry} h
	 */
	const muteKey = (h) => (h.group ? `g:${h.group}` : `n:${h.MemberNumber}`);
	/**
	 * Whether a chat is muted (no sound; cards and unread counts still come).
	 * @param {string} key
	 */
	const isMuted = (key) => Array.isArray(opts.muted) && opts.muted.includes(key);
	/**
	 * Chimes for new messages unless all of them are from muted chats.
	 * @param {HistEntry[]} list
	 */
	const ding = (list) => {
		if (opts.sound && list.some((h) => !isMuted(muteKey(h)))) {
			chime();
		}
	};
	/**
	 * Mutes or unmutes a chat.
	 * @param {string} key a muteKey
	 * @param {string} name for the toast
	 */
	function toggleMute(key, name) {
		const on = !isMuted(key);
		setOpt('muted', [...(Array.isArray(opts.muted) ? opts.muted : []).filter((k) => k !== key), ...(on ? [key] : [])].slice(-500));
		notify(on ? `🔕 No sound for ${name}` : `🔔 Sound back on for ${name}`);
		if (isOpen()) {
			render(true);
		}
	}
	/**
	 * The 🔔/🔕 button for a chat header.
	 * @param {string} key
	 */
	const muteButton = (key) =>
		html`<button id="sb-mute" title="${isMuted(key) ? 'Muted: no sound for this chat. Click for sound again' : 'Mute: no sound for this chat'}">${isMuted(key) ? '🔕' : '🔔'}</button>`;
	/** @type {AudioContext | null} Made on the first chime. */
	let audioCtx = null;
	/** Plays a short two-note sound. */
	function chime() {
		try {
			const ac = audioCtx || (audioCtx = new AudioContext());
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

	/**
	 * One-to-one chats from `hist`, newest first.
	 * @returns {{ n: number, name: string, last: HistEntry, unread: number }[]}
	 */
	function chats() {
		/** @type {Map<number, { n: number, name: string | null, last: HistEntry, unread: number }>} */
		const by = new Map();
		for (const b of log()) {
			if (b.group || isReaction(b)) {
				continue;
			}
			const c = by.get(b.MemberNumber) || { n: b.MemberNumber, name: null, last: b, unread: 0 };
			if (!b.Sent) {
				c.name = b.MemberName;
			}
			c.last = b;
			if (unread(b)) {
				c.unread++;
			}
			by.set(b.MemberNumber, c);
		}
		return [...by.values()].map((c) => ({ ...c, name: c.name || nameOf(c.n) })).sort((a, b) => b.last.Time - a.last.Time);
	}

	/**
	 * Where an online friend is, for the lists.
	 * @param {Friend | undefined} f
	 */
	const where = (f) => {
		if (!f) {
			return 'Offline';
		}
		if (f.ChatRoomName) {
			return `${f.Private ? '🔒' : '📍'} ${f.ChatRoomName}`;
		}
		return f.Private ? '🔒 Private room' : '🏠 Not in a room';
	};

	/**
	 * Redraws the panel for the current `tab` and `thread`.
	 * @param {boolean} [keepScroll] keep the scroll position (a redraw for new data, not navigation)
	 * @returns {void}
	 */
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
			setHtml(view, html`<div class="sb-empty">💤 Log in and SlimeBeep wakes up.</div>`);
			return;
		}
		if (thread !== null) {
			renderThread(keepScroll);
			return;
		}
		const unreadChats = log().filter((h) => !h.group && unread(h)).length;
		const unreadGroups = log().filter((h) => h.group && unread(h)).length;
		/** @param {string} t */
		const on = (t) => (tab === t || (t === 'groups' && tab === 'newgc') ? 'on' : '');
		/** @param {number} n */
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
		const page = pageState(tab);
		if (tab === 'options') {
			setHtml(view, html`${tabs}<div class="sb-body" id="sb-body">${optionsHtml()}</div>`);
		} else if (tab === 'newgc') {
			setHtml(view, html`${tabs}<div class="sb-body sb-group" id="sb-body">${newGroupHtml()}</div>`);
		} else if (tab === 'wave') {
			setHtml(view, html`${tabs}<div class="sb-body sb-group" id="sb-body">${groupHtml()}</div>`);
		} else if (tab === 'bug') {
			setHtml(view, html`${tabs}<div class="sb-body sb-group" id="sb-body">${bugHtml()}</div>`);
		} else if (tab === 'invitefor') {
			setHtml(view, html`${tabs}<div class="sb-body sb-group" id="sb-body">${inviteForHtml()}</div>`);
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
			setHtml(
				view,
				html`${tabs}<div class="sb-body" id="sb-body">
				${tab === 'groups' && groupsTop()}
				<input class="sb-search" id="sb-search" placeholder="🔍 Search ${what}…" value="${search}">
				${rows.length ? rows : html`<div class="sb-empty">${empty}</div>`}
			</div>`,
			);
			const s = $input('sb-search');
			s.addEventListener('input', () => {
				search = s.value;
				render();
				const again = $input('sb-search');
				again.focus();
				again.setSelectionRange(search.length, search.length);
			});
		}
		if (keepScroll) {
			$('sb-body').scrollTop = scroll;
		}
		for (const b of $$(view, '[data-tab]')) {
			b.addEventListener('click', () => {
				tab = b.dataset.tab || 'chats';
				search = '';
				render();
			});
		}
		for (const r of $$(view, '[data-open]')) {
			r.addEventListener('click', () => {
				const v = r.dataset.open || '';
				thread = v.startsWith('g:') ? v : Number(v);
				threadPin = undefined;
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
		restorePage(tab, page);
	}

	/**
	 * Where a page in #sb-body was: its scroll position and the values of its ticked boxes.
	 * @typedef {{ scroll: number, ticked: string[] }} PageState
	 */
	/**
	 * The state of the page in #sb-body, if that page is `key` (so the coming draw is a redraw for new
	 * data, not navigation).
	 * @param {string} key
	 * @returns {PageState | null}
	 */
	function pageState(key) {
		const body = $('sb-body');
		if (!body || body.dataset.page !== key) {
			return null;
		}
		return { scroll: body.scrollTop, ticked: $$inputs(body, 'label input[type=checkbox][value]:checked').map((b) => b.value) };
	}
	/**
	 * Marks the new #sb-body as page `key` and puts back what pageState saved. Ticks go back through a
	 * change event, so counts and buttons follow.
	 * @param {string} key
	 * @param {PageState | null} state
	 */
	function restorePage(key, state) {
		const body = $('sb-body');
		if (!body) {
			return;
		}
		body.dataset.page = key;
		if (!state) {
			return;
		}
		for (const b of $$inputs(body, 'label input[type=checkbox][value]')) {
			if (!b.checked && !b.disabled && state.ticked.includes(b.value)) {
				b.checked = true;
				b.dispatchEvent(new Event('change'));
			}
		}
		body.scrollTop = state.scroll;
	}

	/**
	 * Rows of the 💬 Chats tab, filtered by search `q`.
	 * @param {string} q
	 */
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

	/**
	 * Rows of the 👥 Groups tab, newest message first, filtered by `q`.
	 * @param {string} q
	 */
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
	/**
	 * The preview line of a group: "Name: text" of its last message.
	 * @param {HistEntry | undefined} last
	 */
	function lastLine(last) {
		if (!last) {
			return 'No messages yet';
		}
		if (last.sys) {
			return textOf(last);
		}
		return `${last.Sent ? 'You' : last.MemberName}: ${textOf(last)}`;
	}

	/**
	 * Checkbox list of online friends (SlimeBeep users first) for inviting.
	 * @param {number[]} [exclude] member numbers left out
	 */
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
			.filter((i) => !groups[codeGroup(i.code)])
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
		const list = invitations.filter((i) => !groups[codeGroup(i.code)]);
		for (const b of $$($('sb-view'), '[data-join]')) {
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
		for (const b of $$($('sb-view'), '[data-dismiss]')) {
			b.addEventListener('click', () => {
				const i = list[Number(b.dataset.dismiss)];
				invitations = invitations.filter((x) => x !== i);
				saveGC();
				render(true);
			});
		}
		$('sb-join').addEventListener('click', () =>
			joinCode($input('sb-join-code').value, (gid) => {
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
		const boxes = () => $$inputs($('sb-body'), 'label input[type=checkbox][value]:not(:disabled)');
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
			const name = clean($input('sb-gc-name').value, LIMITS.name) || 'Group chat';
			$input('sb-gc-make').disabled = true;
			notify('👥 Making the group…');
			createGroup(name, picked, $input('sb-gc-open').checked, (id) => {
				notify(`👥 ${name} created`);
				tab = 'groups';
				thread = `g:${id}`;
				render();
			});
			setTimeout(() => {
				if ($('sb-gc-make')) {
					$input('sb-gc-make').disabled = false;
				}
			}, 8000);
		});
		update();
	}

	/** Shows the last invite code made on the members page (lastCode). */
	function showCode() {
		const out = $('sb-gm-out');
		const k = lastCode;
		if (!out || !k || !membersOpen || k.id !== membersOpen) {
			return;
		}
		setHtml(
			out,
			html`<div class="sb-row" style="cursor:default;display:block"><code style="font-size:13px;user-select:all">${k.code}</code>
			<div class="sb-hint">${k.forWho ? `Only #${k.forWho} can use it, once.` : 'Anyone with it can join, for 7 days (20 people at most).'} They paste it in 👥 Groups.</div>
			<button class="sb-pill" id="sb-gm-copy" style="margin-top:4px">📋 Copy</button></div>`,
		);
		$('sb-gm-copy').addEventListener('click', async () => {
			try {
				await navigator.clipboard.writeText(k.code);
				notify('📋 Code copied');
			} catch (e) {
				notify('Select the code and copy it');
			}
		});
	}

	/** @type {string | null} Group whose members page is open. */
	let membersOpen = null;
	/** @type {{ id: string, code: string, forWho: number | null } | null} The last invite code made on a members page. */
	let lastCode = null;
	/**
	 * A group's members page: roles, name, picture, invite settings, invite codes and friend invites.
	 * @param {string} id
	 */
	function renderMembers(id) {
		const g = groups[id];
		const me = Player.MemberNumber;
		const admin = isAdmin(g, me);
		const owner = g.owner === me;
		const view = $('sb-view');
		// Typed text and focus survive the redraw.
		/** @type {Record<string, string>} */
		const typing = {};
		for (const k of ['sb-gm-name', 'sb-gm-for']) {
			if ($(k) && $(k).dataset.touched) {
				typing[k] = $input(k).value;
			}
		}
		const focused = document.activeElement && document.activeElement.id;
		const page = pageState(`m:${id}`);
		/** @param {number} n */
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
		setHtml(
			view,
			html`
			<div class="sb-thead"><button id="sb-back" title="Back to the chat">${ICONS.back}</button>${groupAv(g)}
				<div class="sb-main"><div class="sb-name">${g.name}</div><div class="sb-sub">${g.members.length} / ${LIMITS.members} members</div></div></div>
			<div class="sb-body sb-group" id="sb-body">
				${settings}
				${rows}
				${inviting}
			</div>`,
		);
		for (const k of ['sb-gm-name', 'sb-gm-for']) {
			const el = $input(k);
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
			membersOpen = null;
			render();
		});
		/** @param {object} x a message for the relay */
		const act = (x) => {
			relaySend(id, x);
		};
		for (const b of $$(view, '[data-act]')) {
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
				const name = clean($input('sb-gm-name').value, LIMITS.name);
				if (name && name !== g.name) {
					act({ t: 'rename', name });
				}
			});
		}
		if ($('sb-gm-open')) {
			$('sb-gm-open').addEventListener('change', (e) => act({ t: 'open', on: inputOf(e).checked }));
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
				const want = $input('sb-gm-for') ? Number($input('sb-gm-for').value.replace(/\D/g, '')) : 0;
				const forWho = isNum(want) ? want : null;
				requestInvite(id, forWho, (code) => {
					if (!code) {
						return;
					}
					// Kept across redraws.
					lastCode = { id, code, forWho };
					showCode();
				});
			});
			showCode();
			const boxes = () => $$inputs($('sb-body'), 'label input[type=checkbox][value]:not(:disabled)');
			const room = LIMITS.members - g.members.length;
			const update = () => {
				const n = boxes().filter((b) => b.checked).length;
				$input('sb-gm-add').disabled = !n;
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
				inviteAll(id, picked);
				for (const b of boxes()) {
					b.checked = false;
				}
				update();
			});
		}
		restorePage(`m:${id}`, page);
	}

	/**
	 * Draws an open group chat.
	 * @param {boolean} [keepScroll]
	 * @returns {void}
	 */
	function renderGroupThread(keepScroll) {
		const mayFocus = wantsFocus();
		const id = String(thread).slice(2);
		const g = groups[id];
		if (!g) {
			thread = null;
			return render();
		}
		if (membersOpen === id) {
			return renderMembers(id);
		}
		const view = $('sb-view');
		const msgs = hist.filter((h) => h.group === id).sort((a, b) => a.Time - b.Time);
		for (const h of msgs) {
			markRead(h);
		}
		const old = $('sb-msgs');
		const atBottom = !old || old.scrollHeight - old.scrollTop - old.clientHeight < 40;
		const draft = $input('sb-text') ? $input('sb-text').value : '';
		const names = g.members.filter((m) => m.n !== Player.MemberNumber).map((m) => memberName(g, m.n));
		const online = conns[id] && conns[id].ready;
		const here = new Set([...(g.online || []), Player.MemberNumber]).size;
		const status = online ? html`<span class="sb-on"></span>${here} online · ` : '⏳ connecting… · ';
		/** @param {HistEntry} h */
		const bubble = (h) => {
			if (h.sys) {
				return html`<div class="sb-sys">${textOf(h)}</div>`;
			}
			const from = !h.Sent && html`<span class="sb-from">${memberName(g, h.MemberNumber) || h.MemberName}</span>`;
			return html`<div class="sb-b ${h.Sent ? 'me' : 'them'}${isAction(textOf(h)) && ' sb-act'}">${from}${rich(textOf(h))}<em>${timeOf(h.Time)}</em></div>`;
		};
		setHtml(
			view,
			html`
			<div class="sb-thead"><button id="sb-back" title="Back">${ICONS.back}</button>${groupAv(g)}
				<div class="sb-main"><div class="sb-name">${g.name}</div>
				<div class="sb-sub" title="${names.join(', ')}">${status}${g.members.length} members: You${names.length > 0 && `, ${names.join(', ')}`}</div></div>
				${muteButton(`g:${id}`)}<button id="sb-members" title="Members and invites">👥</button><button id="sb-leave" title="${g.owner === Player.MemberNumber ? 'Leave or delete the group' : 'Leave the group'}">🚪</button></div>
			<div class="sb-msgs" id="sb-msgs">${msgs.length ? msgs.map(bubble) : html`<div class="sb-empty">🫧 Say hi to the group!</div>`}</div>
			<div class="sb-compose">
				<button class="pin" id="sb-emo" title="Emoji">😊</button>
				<textarea id="sb-text" maxlength="${LIMITS.text}" placeholder="Message ${g.name}… (/help)"></textarea>
				<button id="sb-send" title="Send (Enter)">${ICONS.send}</button>
			</div>`,
		);
		const box = $('sb-msgs');
		if (!keepScroll || atBottom) {
			box.scrollTop = box.scrollHeight;
		}
		const ta = $input('sb-text');
		ta.value = draft;
		$('sb-back').addEventListener('click', () => {
			thread = null;
			render();
		});
		$('sb-members').addEventListener('click', () => {
			membersOpen = id;
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

	/**
	 * Rows of the 💖 tab: online friends, then offline ones greyed out, filtered by `q`.
	 * @param {string} q
	 */
	function friendRows(q) {
		/**
		 * @param {string} name
		 * @param {number} n
		 * @param {string} [room]
		 */
		const match = (name, n, room = '') => !q || name.toLowerCase().includes(q) || String(n).includes(q) || room.toLowerCase().includes(q);
		const on = friends
			.filter((f) => match(f.MemberName, f.MemberNumber, f.ChatRoomName || ''))
			.sort((a, b) => a.MemberName.localeCompare(b.MemberName))
			.map(
				(f) => html`<div class="sb-row" data-open="${f.MemberNumber}">${avatar(f.MemberNumber, f.MemberName)}
				<div class="sb-main"><div class="sb-name"><span class="sb-on"></span>${f.MemberName}${{ Lover: ' 💞', Submissive: ' 🎀' }[f.Type || '']}${peers.has(f.MemberNumber) && html` <span title="Has SlimeBeep">🫧</span>`}</div>
				<div class="sb-sub">${where(f)}${!!f.ChatRoomMemberCount && ` · ${f.ChatRoomMemberCount}/${f.ChatRoomLimit || '?'}`}</div></div>
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

	/**
	 * The 📍 room line under a beep (with Join), shown when the room differs from that side's previous beep.
	 * @param {HistEntry} b
	 * @param {HistEntry[]} msgs the chat
	 * @param {number} i b's index in msgs
	 */
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
	 * @param {string} roomName
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
						ChatSearchSendToast(r.error.name || '');
					}
					notify(
						`⚠ Couldn't join ${name}${
							/^[A-Za-z]+$/.test(r.error.name || '')
								? ` (${String(r.error.name)
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

	/** @type {boolean | undefined} 📍 set for the next beep in the open chat (undefined: opts.shareRoom). */
	let threadPin;
	/**
	 * Draws an open chat (one-to-one, or hands over to renderGroupThread).
	 * @param {boolean} [keepScroll]
	 * @returns {void}
	 */
	function renderThread(keepScroll) {
		if (typeof thread === 'string') {
			renderGroupThread(keepScroll);
			return;
		}
		const mayFocus = wantsFocus();
		const n = Number(thread);
		const view = $('sb-view');
		const msgs = log().filter((b) => b.MemberNumber === n && !b.group && !isReaction(b));
		// Opening the chat marks it read (in the game's log too).
		for (const b of msgs) {
			markRead(b);
		}
		const f = friends.find((x) => x.MemberNumber === n);
		const old = $('sb-msgs');
		const atBottom = !old || old.scrollHeight - old.scrollTop - old.clientHeight < 40;
		const draft = $input('sb-text') ? $input('sb-text').value : '';
		const room = myRoom();
		const pinOn = !!room && (threadPin ?? opts.shareRoom);
		const waitingHere = waiting.filter((w) => w.n === n);
		const offline = isOffline(n);
		/** @param {HistEntry} b */
		const mailMark = (b) => {
			if (!b.mail) {
				return '';
			}
			const title = b.Sent
				? 'Left in their SlimeBeep mailbox while they were offline'
				: 'Left in your SlimeBeep mailbox while you were offline';
			return html`<span title="${title}">📬</span> `;
		};
		/** @param {HistEntry} b */
		const uncheckedMark = (b) =>
			b.unchecked && html`<span title="Their SlimeBeep has not told yours its key yet, so who sent this could not be checked">⚠</span> `;
		/** @type {HtmlValue} */
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
		setHtml(
			view,
			html`
			<div class="sb-thead"><button id="sb-back" title="Back">${ICONS.back}</button>${avatar(n, nameOf(n))}
				<div class="sb-main"><div class="sb-name">${nameOf(n)} <small style="font-weight:normal;color:#c08aaa">#${n}</small></div>
				<div class="sb-sub">${f && html`<span class="sb-on"></span>`}${where(f)}</div></div>${muteButton(`n:${n}`)}</div>
			<div class="sb-msgs" id="sb-msgs">${bubbles}${waitingBubbles}</div>
			<div class="sb-compose">
				<button class="pin ${pinOn && 'on'}" id="sb-pin" ${!room && 'disabled'} title="${pinTitle}">📍</button>
				<button class="pin" id="sb-emo" title="Emoji">😊</button>
				<textarea id="sb-text" maxlength="1000" placeholder="${placeholder}"></textarea>
				<button id="sb-send" title="Send (Enter)">${ICONS.send}</button>
			</div>`,
		);
		const box = $('sb-msgs');
		if (!keepScroll || atBottom) {
			box.scrollTop = box.scrollHeight;
		}
		const ta = $input('sb-text');
		ta.value = draft;
		$('sb-back').addEventListener('click', () => {
			thread = null;
			threadPin = undefined;
			render();
		});
		$('sb-pin').addEventListener('click', () => {
			threadPin = !pinOn;
			render(true);
		});
		$('sb-mute').addEventListener('click', () => toggleMute(`n:${n}`, nameOf(n)));
		for (const b of $$(view, '.sb-joinroom')) {
			b.addEventListener('click', (e) => {
				e.preventDefault();
				joinRoom(b.dataset.room || '');
			});
		}
		for (const a of $$(view, '[data-cancel]')) {
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
			const invite = !!myRoom() && (threadPin ?? opts.shareRoom);
			beep(n, text, invite);
			// 📍 applies to one beep.
			threadPin = false;
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

	/**
	 * Whether a friend is known to be offline.
	 * @param {number} n
	 */
	const isOffline = (n) => friendsKnown && isFriend(n) && !friends.some((f) => f.MemberNumber === n);
	/**
	 * Adds a beep for an offline friend to `waiting` and tries their mailbox.
	 * @param {number} n
	 * @param {string} text
	 */
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
	/** @type {string | null} Open emoji tab; null opens 🕘 when there are recent ones. */
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
		const open = emojiTab !== null && tabs.includes(emojiTab) ? emojiTab : tabs[0];
		emojiTab = open;
		const list = open === '🕘' ? recentEmoji : EMOJI[/** @type {keyof typeof EMOJI} */ (open)].split(' ');
		setHtml(
			box,
			html`<div class="sb-emo-tabs">${tabs.map((t) => html`<button data-etab="${t}" class="${t === emojiTab && 'on'}">${t}</button>`)}<button data-eclose="1" title="Close">${ICONS.close}</button></div>
			<div class="sb-emo-grid">${list.map((e) => html`<button data-emo="${e}">${e}</button>`)}</div>`,
		);
		box.onclick = (ev) => {
			const b = targetOf(ev).closest('button');
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
			const ta = $input('sb-text');
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
	 * @param {string} raw
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
		setHtml(
			box,
			html`<div class="sb-crop-card" style="align-items:stretch">
			<b style="text-align:center">💬 Chat commands</b>
			${COMMANDS.map(([c, d]) => html`<div class="sb-cmd"><code>${c}</code><span>${d}</span></div>`)}
			<span class="sb-hint" style="text-align:center">😊 opens the emoji. *giggles* shows as an action.</span>
			<div class="sb-crop-btns" style="justify-content:center"><button class="sb-go" data-act="keep">Got it</button></div>
		</div>`,
		);
		const close = () => {
			box.remove();
			document.removeEventListener('keydown', onKey, true);
			if ($('sb-text')) {
				$('sb-text').focus();
			}
		};
		/** @param {KeyboardEvent} e */
		const onKey = (e) => {
			if (e.key === 'Escape') {
				e.stopPropagation();
				close();
			}
		};
		box.addEventListener('click', (e) => {
			if (targetOf(e) === box || targetOf(e).dataset.act === 'keep') {
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

	/** @type {ReturnType<typeof setTimeout> | undefined} Hides the toast. */
	let toastTimer;
	/**
	 * Shows a short toast by the toggle.
	 * @param {string} text
	 */
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
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
	}

	/**
	 * Sends a beep with the game's own ServerSendBeepMessage (its format, limits and beep log).
	 * @param {number} n
	 * @param {string} text
	 * @param {boolean} includeRoom adds your room
	 */
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

	/** @type {number[] | undefined} Friends ticked on the WaveBeep tab since it was opened. */
	let waveTicked;
	/** The WaveBeep text being written. */
	let waveText = '';
	/** @type {boolean | undefined} The WaveBeep 📍 box (undefined: opts.shareRoom). */
	let waveRoom;
	/** HTML of the 🌊 WaveBeep tab. */
	function groupHtml() {
		const room = myRoom();
		const picked = new Set(waveTicked || opts.picked);
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
			<textarea id="sb-gmsg" maxlength="1000" placeholder="Write your beep…">${waveText || ''}</textarea>
			<label title="Adds a button to your beep that takes them to the chat room you're in."><input type="checkbox" id="sb-groom" ${!room && 'disabled'} ${room && (waveRoom ?? opts.shareRoom) && 'checked'}>
				<span>📍 Let them join me<span class="sb-hint" style="display:block">${roomHint}</span></span></label>
			<div class="sb-line"><b>Beep who?</b><span>${myRoomButton}<button class="sb-pill" id="sb-all">All</button> <button class="sb-pill" id="sb-none">None</button></span></div>
			${list.length ? list : html`<div class="sb-empty">🌙 None of your friends are online.</div>`}
			<div class="sb-line" style="position:sticky;bottom:-10px;background:#fff7fb;padding:6px 0"><span id="sb-gcount"></span><button class="sb-go" id="sb-gsend">Send 🌊</button></div>
			<div class="sb-hint" id="sb-gstatus"></div>`;
	}

	/** Wires the WaveBeep tab and sends the beeps, opts.gap seconds apart. */
	function wireGroup() {
		const boxes = () => $$inputs($('sb-body'), 'label input[type=checkbox]:not(#sb-groom)');
		const chosen = () =>
			boxes()
				.filter((b) => b.checked)
				.map((b) => Number(b.value));
		const count = () => {
			const n = chosen().length;
			waveTicked = chosen();
			if (opts.remember) {
				// Offline friends stay in `picked`.
				const online = new Set(friends.map((f) => f.MemberNumber));
				opts.picked = [...new Set([...opts.picked.filter((m) => !online.has(m)), ...waveTicked])];
				saveOpts();
			}
			$('sb-gcount').textContent = `${n} picked of ${friends.length} online`;
			$input('sb-gsend').disabled = sending || n === 0;
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
			waveText = inputOf(e).value;
		});
		$('sb-groom').addEventListener('change', (e) => {
			waveRoom = inputOf(e).checked;
		});
		$('sb-gsend').addEventListener('click', async () => {
			const msg = $input('sb-gmsg').value.trim();
			const targets = chosen();
			/** @param {string} t */
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
			$input('sb-gsend').disabled = true;
			const includeRoom = $input('sb-groom').checked && !!myRoom();
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
			waveText = '';
			if ($('sb-gmsg')) {
				$input('sb-gmsg').value = '';
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
		/** @typedef {[number, number, number, number]} Rect x, y, width, height on the canvas */
		/** @type {Rect} */
		const EXIT = [1815, 75, 90, 90];
		const LEFT = 500,
			TOP = 190,
			ROW = 72;
		/** @type {[string, string | (() => string), () => unknown, (on: boolean) => void, (() => boolean)?][]} id, label, get, set, shown */
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
			['popups', 'Show new beeps in a pop-up (click to reply)', () => opts.popups, (on) => setOpt('popups', on)],
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
		/**
		 * Recomputed every frame: the shown boxes can change.
		 * @returns {{ g: number, MINUS: Rect, PLUS: Rect, RESET: Rect, CLEAR: Rect, PIC: Rect, NOPIC: Rect }}
		 */
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
		/** @param {Rect} r */
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
					// The game centres button labels with the current textAlign.
					MainCanvas.textAlign = 'center';
					DrawButton(...MINUS, '-', 'White');
					DrawButton(...PLUS, '+', 'White');
					MainCanvas.textAlign = 'left';
					DrawText(`Wait ${opts.gap} seconds between WaveBeeps`, LEFT + 180, g + 33, 'Black', 'Gray');
					MainCanvas.textAlign = 'center';
					DrawButton(...RESET, 'Reset position and size', 'White');
					DrawButton(...CLEAR, `Clear kept beeps (${hist.length})`, 'White');
					DrawButton(...PIC, myPfp() ? 'Change profile picture' : 'Choose profile picture', 'White');
					drawMyPic(NOPIC[0] + NOPIC[2] + 20, PIC[1], 64);
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
						setOpt('win', null);
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
	/**
	 * Sets and saves one option.
	 * @template {keyof Options} K
	 * @param {K} name
	 * @param {Options[K]} value
	 */
	function setOpt(name, value) {
		opts[name] = value;
		saveOpts();
	}

	/**
	 * Turns desktop notifications on or off; asks the browser for permission and turns off if refused.
	 * @param {boolean} on
	 */
	async function setDesktop(on) {
		setOpt('desktop', !!on);
		if (on && typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
			const answer = await Notification.requestPermission().catch(() => 'denied');
			if (answer !== 'granted') {
				setOpt('desktop', false);
				notify('The browser blocked notifications');
			}
		}
		const box = $input('sb-o-desktop');
		if (box) {
			box.checked = opts.desktop;
		}
	}

	/**
	 * Turns saving of chat history on or off.
	 * @param {boolean} on
	 */
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
	/** @type {[string, string, () => unknown][]} */
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
	/**
	 * Turns theme matching on or off.
	 * @param {boolean} on
	 */
	function setThemed(on) {
		setOpt('themed', !!on);
		applyThemed();
	}

	/**
	 * Turns night mode on or off (the sb-night class on <html>).
	 * @param {boolean} on
	 */
	function setNight(on) {
		opts.night = !!on;
		saveOpts();
		document.documentElement.classList.toggle('sb-night', opts.night);
		const moon = $('sb-moon');
		if (moon) {
			moon.textContent = opts.night ? '☀️' : '🌙';
			moon.title = opts.night ? 'Day mode' : 'Night mode';
		}
		const box = $input('sb-o-night');
		if (box) {
			box.checked = opts.night;
		}
	}

	/** Member number that 🐞 reports can be beeped to (SlimeQueenSamantha). */
	const OWNER = 255659;
	/** New GitHub issue page, for 🐞 reports. */
	const ISSUES = 'https://github.com/Proudkiller0015/slimebeep/issues/new';
	/**
	 * Report details: versions, browser, other mods, recent errors.
	 * @param {boolean} withNumber adds your member number
	 */
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
		const what = clean($input('sb-bug-what').value, 1500);
		const how = clean($input('sb-bug-how').value, 800);
		return {
			what,
			how,
			full: `What happened:\n${what || '(not filled in)'}\n\nWhat I was doing:\n${how || '(not filled in)'}\n\n---\n${details($input('sb-bug-num').checked)}`,
		};
	}

	/** @type {{ what?: string, how?: string, num?: boolean }} The bug report being written. */
	let bugDraft = {};
	/** HTML of the 🐞 tab. */
	function bugHtml() {
		const draft = bugDraft || {};
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
			bugDraft = { what: $input('sb-bug-what').value, how: $input('sb-bug-how').value, num: $input('sb-bug-num').checked };
		};
		/** @param {string} t */
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
			$('sb-bug-details').textContent = details($input('sb-bug-num').checked);
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
			const text =
				`🐞 SlimeBeep bug report\n${r.what}${r.how ? `\nDoing: ${r.how}` : ''}\n— ${details($input('sb-bug-num').checked)}`.slice(0, 990);
			beep(OWNER, text, false);
			notify('🐞 Report beeped');
			status('Beeped to SlimeQueenSamantha. It only arrives if she has you on her friend list; if unsure, use GitHub or Copy too.');
		});
	}

	/* "Invite <them> to…": every group you can invite to, an Invite button each (opened by other add-ons too). */
	/** @type {{ n: number, results: Record<string, HtmlValue> } | null} State of the "Invite <member> to…" page (api.openInvite). */
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
		const results = inviteFor.results;
		const list = Object.values(groups).filter((g) => canInvite(g, Player.MemberNumber));
		const rows = list.map((g) => {
			const res = results[g.id];
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
		for (const b of $$inputs($('sb-body'), '[data-invite]')) {
			b.addEventListener('click', async () => {
				const id = b.dataset.invite || '';
				const page = inviteFor;
				if (!page) {
					return;
				}
				b.disabled = true;
				const r = await inviteToGroup(id, page.n);
				if (!r.ok) {
					page.results[id] = `⚠ ${r.why}`;
				} else if (r.sent === 'later') {
					page.results[id] = `⏳ ${nameOf(page.n)} has no SlimeBeep: invite beeps like that go ${PLAIN_MAX} a minute, try again in one.`;
				} else if (r.sent) {
					page.results[id] = '📨 Invite sent!';
				} else {
					page.results[id] = html`Code: <code style="user-select:all">${r.code}</code> — give it to them (copied).`;
				}
				if (r.ok && !r.sent) {
					try {
						await navigator.clipboard.writeText(r.code || '');
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
		/** @param {boolean} on */
		const checked = (on) => on && 'checked';
		return html`<div class="sb-opts">
			<b style="display:block;margin:6px 2px">⚙ Options</b>
			<div class="sb-opt-pic">${avatar(Player.MemberNumber, myName())}<span style="flex:1;min-width:0">Profile picture<span class="sb-hint" style="display:block">SlimeBeep friends see it.</span></span>
				<span class="sb-opt-pic-buttons"><button class="sb-pill" id="sb-o-pic">Choose</button>${myPfp() && loadSrc() && html`<button class="sb-pill" id="sb-o-fit">Adjust</button>`}${myPfp() && html`<button class="sb-pill" id="sb-o-nopic">Remove</button>`}</span></div>
			<label><input type="checkbox" id="sb-o-night" ${checked(opts.night)}>🌙 Night mode (a night blue slime)</label>
			<label><input type="checkbox" id="sb-o-sound" ${checked(opts.sound)}>Pop sound for new beeps</label>
			<label><input type="checkbox" id="sb-o-popups" ${checked(opts.popups)}>💌 Show new beeps in a pop-up (click to reply)</label>
			<label><input type="checkbox" id="sb-o-desktop" ${checked(opts.desktop)}>🖥 Desktop notification when the game is in the background</label>
			<label><input type="checkbox" id="sb-o-keep" ${checked(opts.keep)}>🗂 Keep my beeps in this browser after I log out
				<span class="sb-hint" style="display:block">${hist.length} beeps kept. <button class="sb-pill" id="sb-o-clear">Clear them</button></span></label>
			<label><input type="checkbox" id="sb-o-share" ${checked(opts.shareRoom)}>📍 "Let them join me" starts on</label>
			<label><input type="checkbox" id="sb-o-remember" ${checked(opts.remember)}>Remember who I picked for WaveBeeps</label>
			<label>Wait <input type="number" id="sb-o-gap" min="1" max="10" step="0.5" value="${opts.gap}"> seconds between WaveBeeps</label>
			<label>Drag the slime to move it, the window by its top bar, and the window's edges to resize it. <button class="sb-pill" id="sb-o-reset">Put it back</button></label>
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
		$('sb-o-night').addEventListener('change', (e) => setNight(inputOf(e).checked));
		$('sb-o-sound').addEventListener('change', (e) => setOpt('sound', inputOf(e).checked));
		$('sb-o-popups').addEventListener('change', (e) => setOpt('popups', inputOf(e).checked));
		$('sb-o-desktop').addEventListener('change', (e) => setDesktop(inputOf(e).checked));
		$('sb-o-keep').addEventListener('change', (e) => setKeep(inputOf(e).checked));
		$('sb-o-clear').addEventListener('click', (e) => {
			e.preventDefault();
			clearKept();
		});
		$('sb-o-share').addEventListener('change', (e) => setOpt('shareRoom', inputOf(e).checked));
		$('sb-o-remember').addEventListener('change', (e) => {
			setOpt('remember', inputOf(e).checked);
			if (!opts.remember) {
				setOpt('picked', []);
			}
		});
		$('sb-o-gap').addEventListener('change', (e) => {
			setOpt('gap', Math.max(1, Math.min(10, Number(inputOf(e).value) || DEFAULTS.gap)));
			inputOf(e).value = String(opts.gap);
		});
		$('sb-o-reset').addEventListener('click', () => {
			setOpt('pos', null);
			setOpt('win', null);
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
	/**
	 * Whether version string `a` is newer than `b`.
	 * @param {string} a
	 * @param {string} b
	 */
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

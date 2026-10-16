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

	const VERSION = '2.3.2';
	// Loaded once per page, whatever loads it.
	if (window.SlimeBeep) return;
	window.SlimeBeep = { version: VERSION };

	// The logo, inline so the button needs nothing from the network.
	const ICON = 'data:image/png;base64,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';

	/*
	 * Options (the ⚙), kept in this browser. `gap` is the wait between group beeps in
	 * seconds, so the server doesn't drop them; `picked` is who was ticked last time;
	 * `pos` is where the slime was dragged to, as fractions of the window (null: bottom right).
	 */
	// `popups`: a card for each new beep; `desktop`: a system notification while the game tab is in the background;
	// `keep`: keep beeps in this browser across logins; `seenNews`: the news items (news.json) already shown.
	const DEFAULTS = { pos: null, gap: 1.5, shareRoom: true, remember: true, picked: [], sound: true, popups: true, desktop: false, keep: true, seenNews: null, lastVersion: null, night: false };
	const NEWS = 'https://raw.githubusercontent.com/Proudkiller0015/slimebeep/main/news.json';
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
	const keyOf = (b) => (b.Id ? `id:${b.Id}` : `${b.MemberNumber}|${new Date(b.Time).getTime()}|${b.Sent ? 1 : 0}|${String(b.Message || '').slice(0, 40)}`);

	const $ = (id) => document.getElementById(id);
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
		if (!opts.keep) return;
		try {
			const saved = JSON.parse(localStorage.getItem(histKey()) || '[]');
			if (Array.isArray(saved)) for (const h of saved) if (h && h.k && !histKeys.has(h.k)) { hist.push(h); histKeys.add(h.k); }
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
			if (histKeys.has(k)) continue;
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
	const textOf = (beep) => {
		if (typeof beep.Message !== 'string') return beep.ChatRoomName ? `📍 ${beep.ChatRoomName}` : '🔔 Beep!';
		return typeof FriendListBeepParseMessage === 'function' ? FriendListBeepParseMessage(beep.Message).text : beep.Message;
	};
	const isReaction = (beep) => {
		if (typeof beep.Message !== 'string' || typeof FriendListBeepParseMessage !== 'function') return false;
		const meta = FriendListBeepParseMessage(beep.Message).metadata;
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
	const timeOf = (t) => {
		const d = new Date(t);
		if (isNaN(d)) return '';
		const today = new Date().toDateString() === d.toDateString();
		return today ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString([], { day: 'numeric', month: 'short' });
	};
	// A soft colour per person, for their bubble avatar.
	const hue = (n) => (Number(n) * 137) % 360;
	const avatar = (n, name) => `<span class="sb-av" style="background:hsl(${hue(n)} 85% 80%)">${esc(String(name || '?').trim().slice(0, 2))}</span>`;

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
		.sb-tabs { display: flex; gap: 4px; padding: 8px 10px 6px; background: #ffe6f3; }
		.sb-tabs button { flex: 1; border: none; border-radius: 14px; padding: 5px 0; background: #fff; color: #c2186b; text-align: center; }
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
		// Typing in the panel must not reach the game's own key handlers.
		panel.addEventListener('keydown', (e) => e.stopPropagation());

		// Friends as the server reports them, whoever asked (the game asks too).
		if (loggedIn()) listen();
		place();
		setInterval(tick, 1000);
		news();
		registerSettings();
	}

	let listening = false;
	function listen() {
		if (listening || !loggedIn() || typeof ServerSocket.on !== 'function') return;
		listening = true;
		// Only listens; an error in here is caught so the game's own handlers and other add-ons carry on.
		ServerSocket.on('AccountQueryResult', (data) => {
			try {
				if (!data || data.Query !== 'OnlineFriends' || !Array.isArray(data.Result)) return;
				friends = data.Result.filter((f) => f && f.MemberNumber !== Player.MemberNumber);
				if (isOpen() && tab !== 'chats') render();
			} catch (e) { console.warn('[SlimeBeep]', e); }
		});
		ServerSocket.on('AccountBeep', (data) => {
			try { catchBeep(data); } catch (e) { console.warn('[SlimeBeep]', e); }
		});
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
		if (type && msg && /^\s*[[{]/.test(msg)) return;
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
				if (isOpen() && tab !== 'options' && tab !== 'group') render(true);
			} catch (e) { console.warn('[SlimeBeep]', e); }
		}, 1500);
	}
	const askFriends = () => { if (loggedIn()) { listen(); ServerSend('AccountQuery', { Query: 'OnlineFriends' }); } };

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
			// Listen from login on, not only once the panel has been opened.
			if (loggedIn()) listen();
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
			if (isOpen() && tab !== 'options' && tab !== 'group') render(true);
		} catch (e) {
			if (!tick.warned) { tick.warned = true; console.warn('[SlimeBeep]', e); }
		}
	}

	/** A new beep: a card by the slime (click opens the chat), and a desktop notification if the game is in the background. */
	function announce(h) {
		// Already looking at that chat: it's right there.
		if (isOpen() && thread === h.MemberNumber && !document.hidden) return;
		const text = textOf(h);
		const room = h.ChatRoomName && typeof h.Message === 'string' ? `📍 in ${h.ChatRoomName}` : '';
		const open = () => { thread = h.MemberNumber; renderThread.pin = undefined; if (!isOpen()) setOpen(true); else render(); };
		if (opts.popups) card({ icon: avatar(h.MemberNumber, h.MemberName), title: `💌 ${h.MemberName}`, text, sub: room, onClick: open });
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
		if (opts.lastVersion === VERSION || !loggedIn() || typeof ChatRoomSendLocal !== 'function') return;
		if (typeof ServerPlayerIsInChatRoom === 'function' ? !ServerPlayerIsInChatRoom() : !myRoom()) return;
		const item = newsItems.find((i) => i.id === VERSION);
		const first = !opts.lastVersion;
		const head = first ? `SlimeBeep v${esc(VERSION)} is ready!` : `SlimeBeep updated to v${esc(VERSION)}`;
		const body = item ? esc(item.text) : first ? 'Click the pink slime to beep your friends.' : '';
		ChatRoomSendLocal(`<div style="margin:2px 0;padding:4px 10px;border-radius:10px;background:#ffe6f3;color:#a3155c;border-left:4px solid #ff4fa3;font-size:.9em">` +
			`<img src="${ICON}" style="width:1.3em;height:1.3em;vertical-align:middle;border-radius:50%;margin-right:4px${opts.night ? ';filter:hue-rotate(-105deg)' : ''}" alt="">` +
			`<b>${head}</b>${body ? ` ${body}` : ''}</div>`);
		opts.lastVersion = VERSION;
		saveOpts();
	}

	function news() {
		fetch(NEWS, { cache: 'no-store' })
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
			.catch(() => { /* no news is fine */ });
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
			if (isReaction(b)) continue;
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
		if (!loggedIn()) {
			view.innerHTML = '<div class="sb-empty">💤 Log in and SlimeBeep wakes up.</div>';
			return;
		}
		if (thread !== null) return renderThread(keepScroll);
		const unreadAll = log().filter(unread).length;
		const tabs = `<div class="sb-tabs">
			<button data-tab="chats" class="${tab === 'chats' ? 'on' : ''}">💬 Chats${unreadAll ? `<i>${unreadAll}</i>` : ''}</button>
			<button data-tab="friends" class="${tab === 'friends' ? 'on' : ''}">💖 Friends<i>${friends.length}</i></button>
			<button data-tab="group" class="${tab === 'group' ? 'on' : ''}">📣 Group</button>
		</div>`;
		const body = $('sb-body');
		const scroll = keepScroll && body ? body.scrollTop : 0;
		if (tab === 'options') view.innerHTML = tabs + `<div class="sb-body" id="sb-body">${optionsHtml()}</div>`;
		else if (tab === 'group') view.innerHTML = tabs + `<div class="sb-body sb-group" id="sb-body">${groupHtml()}</div>`;
		else {
			const q = search.toLowerCase();
			const rows = tab === 'chats' ? chatRows(q) : friendRows(q);
			view.innerHTML = tabs + `<div class="sb-body" id="sb-body">
				<input class="sb-search" id="sb-search" placeholder="🔍 Search ${tab === 'chats' ? 'chats' : 'friends'}…" value="${esc(search)}">
				${rows || `<div class="sb-empty">${tab === 'chats' ? '🫧 No beeps yet. Pick someone in 💖 Friends to say hi!' : q ? 'Nobody by that name.' : '🌙 None of your friends are online.'}</div>`}
			</div>`;
			const s = $('sb-search');
			s.addEventListener('input', () => { search = s.value; render(); const again = $('sb-search'); again.focus(); again.setSelectionRange(search.length, search.length); });
		}
		if (keepScroll) $('sb-body').scrollTop = scroll;
		for (const b of view.querySelectorAll('[data-tab]')) b.addEventListener('click', () => { tab = b.dataset.tab; search = ''; render(); });
		for (const r of view.querySelectorAll('[data-open]')) r.addEventListener('click', () => { thread = Number(r.dataset.open); renderThread.pin = undefined; render(); });
		if (tab === 'group') wireGroup();
		if (tab === 'options') wireOptions();
	}

	function chatRows(q) {
		return chats().filter((c) => !q || c.name.toLowerCase().includes(q) || String(c.n).includes(q)).map((c) => {
			const online = friends.some((f) => f.MemberNumber === c.n);
			const text = textOf(c.last);
			return `<div class="sb-row" data-open="${c.n}">${avatar(c.n, c.name)}
				<div class="sb-main"><div class="sb-name">${online ? '<span class="sb-on"></span>' : ''}${esc(c.name)}</div>
				<div class="sb-sub">${c.last.Sent ? 'You: ' : ''}${esc(text)}</div></div>
				<div class="sb-side">${timeOf(c.last.Time)}${c.unread ? `<br><span class="sb-dot">${c.unread}</span>` : ''}</div></div>`;
		}).join('');
	}

	function friendRows(q) {
		return friends.filter((f) => !q || f.MemberName.toLowerCase().includes(q) || String(f.MemberNumber).includes(q) ||
			(f.ChatRoomName || '').toLowerCase().includes(q))
			.sort((a, b) => a.MemberName.localeCompare(b.MemberName))
			.map((f) => `<div class="sb-row" data-open="${f.MemberNumber}">${avatar(f.MemberNumber, f.MemberName)}
				<div class="sb-main"><div class="sb-name"><span class="sb-on"></span>${esc(f.MemberName)}${f.Type === 'Lover' ? ' 💞' : f.Type === 'Submissive' ? ' 🎀' : ''}</div>
				<div class="sb-sub">${esc(where(f))}${f.ChatRoomMemberCount ? ` · ${f.ChatRoomMemberCount}/${f.ChatRoomLimit || '?'}` : ''}</div></div>
				<div class="sb-side">#${f.MemberNumber}</div></div>`).join('');
	}

	/** The room under a bubble: only when there is one, and only when it changed since that side's last beep. */
	function roomLine(b, msgs, i) {
		const room = typeof b.Message === 'string' && typeof b.ChatRoomName === 'string' ? b.ChatRoomName.trim() : '';
		if (!room) return '';
		const prev = msgs.slice(0, i).reverse().find((x) => x.Sent === b.Sent);
		if (prev && (prev.ChatRoomName || '').trim() === room) return '';
		return `<span class="sb-room">📍 ${b.Sent ? 'invited to' : 'in'} ${esc(room)}</span>`;
	}

	function renderThread(keepScroll) {
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
		view.innerHTML = `
			<div class="sb-thead"><button id="sb-back" title="Back">‹</button>${avatar(n, nameOf(n))}
				<div class="sb-main"><div class="sb-name">${esc(nameOf(n))} <small style="font-weight:normal;color:#c08aaa">#${n}</small></div>
				<div class="sb-sub">${f ? '<span class="sb-on"></span>' : ''}${esc(where(f))}</div></div></div>
			<div class="sb-msgs" id="sb-msgs">${msgs.length ? msgs.map((b, i) => `<div class="sb-b ${b.Sent ? 'me' : 'them'}">${esc(textOf(b))}` +
				`${roomLine(b, msgs, i)}<em>${timeOf(b.Time)}</em></div>`).join('')
				: '<div class="sb-empty">🫧 Say hi!</div>'}</div>
			<div class="sb-compose">
				<button class="pin ${pinOn ? 'on' : ''}" id="sb-pin" ${room ? '' : 'disabled'} title="${room ? `Let them join me: adds a button to join you in "${esc(room)}"` : "You're not in a chat room"}">📍</button>
				<textarea id="sb-text" maxlength="1000" placeholder="Beep ${esc(nameOf(n))}…"></textarea>
				<button id="sb-send" title="Send (Enter)">➤</button>
			</div>`;
		const box = $('sb-msgs');
		if (!keepScroll || atBottom) box.scrollTop = box.scrollHeight;
		const ta = $('sb-text');
		ta.value = draft;
		$('sb-back').addEventListener('click', () => { thread = null; renderThread.pin = undefined; render(); });
		$('sb-pin').addEventListener('click', () => { renderThread.pin = !pinOn; render(true); });
		const send = () => {
			const text = ta.value.trim();
			if (!text) return;
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
		if (typeof ServerSendBeepMessage === 'function') ServerSendBeepMessage(n, text, { includeRoom });
		else ServerSend('AccountBeep', { MemberNumber: n, BeepType: '', IsSecret: !includeRoom, Message: text });
	}

	function groupHtml() {
		const room = myRoom();
		const picked = new Set(groupHtml.picked || opts.picked);
		const list = friends.slice().sort((a, b) => a.MemberName.localeCompare(b.MemberName)).map((f) =>
			`<label><input type="checkbox" value="${f.MemberNumber}" ${picked.has(f.MemberNumber) ? 'checked' : ''}>${avatar(f.MemberNumber, f.MemberName)}
			<span class="sb-main" style="margin-left:8px"><span class="sb-name">${esc(f.MemberName)}</span><span class="sb-sub" style="display:block">${esc(where(f))}</span></span></label>`).join('');
		return `<div class="sb-hint" style="margin:4px 0 6px">One beep, sent to every friend you tick.</div>
			<textarea id="sb-gmsg" maxlength="1000" placeholder="Write your beep…">${esc(groupHtml.draft || '')}</textarea>
			<label title="Adds a button to your beep that takes them to the chat room you're in."><input type="checkbox" id="sb-groom" ${room ? '' : 'disabled'} ${room && (groupHtml.room ?? opts.shareRoom) ? 'checked' : ''}>
				<span>📍 Let them join me<span class="sb-hint" style="display:block">${room ? `They get a button to join you in "${esc(room)}".` : "You're not in a chat room, so there's nothing to join."}</span></span></label>
			<div class="sb-line"><b>Beep who?</b><span><button class="sb-pill" id="sb-all">All</button> <button class="sb-pill" id="sb-none">None</button></span></div>
			${list || '<div class="sb-empty">🌙 None of your friends are online.</div>'}
			<div class="sb-line" style="position:sticky;bottom:-10px;background:#fff7fb;padding:6px 0"><span id="sb-gcount"></span><button class="sb-go" id="sb-gsend">Send 📣</button></div>
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
				status(`📣 Sending… ${done} / ${targets.length} (${nameOf(n)})`);
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
		const LEFT = 500, TOP = 200, ROW = 85;
		const boxes = [
			['night', 'Night mode (a night blue slime)', () => opts.night, (on) => setNight(on)],
			['sound', 'Pop sound for new beeps', () => opts.sound, (on) => setOpt('sound', on)],
			['popups', 'A card by the slime for each new beep', () => opts.popups, (on) => setOpt('popups', on)],
			['desktop', 'Desktop notification when the game is in the background', () => opts.desktop, (on) => setDesktop(on)],
			['share', '"Let them join me" starts on', () => opts.shareRoom, (on) => setOpt('shareRoom', on)],
			['remember', 'Remember who I picked for group beeps', () => opts.remember, (on) => { setOpt('remember', on); if (!on) setOpt('picked', []); }],
			['keep', 'Keep my beeps in this browser after I log out', () => opts.keep, (on) => setKeep(on)],
		];
		const gapY = TOP + boxes.length * ROW;
		const btnY = gapY + ROW;
		const MINUS = [LEFT, gapY, 64, 64], PLUS = [LEFT + 80, gapY, 64, 64];
		const RESET = [LEFT, btnY, 420, 64], CLEAR = [LEFT + 450, btnY, 420, 64];
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
					boxes.forEach(([, label, get], i) => DrawCheckbox(LEFT, TOP + i * ROW, 64, 64, label, !!get()));
					DrawButton(...MINUS, '-', 'White');
					DrawButton(...PLUS, '+', 'White');
					DrawText(`Wait ${opts.gap} seconds between group beeps`, LEFT + 180, gapY + 33, 'Black', 'Gray');
					MainCanvas.textAlign = 'center';
					DrawButton(...RESET, 'Reset slime position', 'White');
					DrawButton(...CLEAR, `Clear kept beeps (${hist.length})`, 'White');
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
					boxes.forEach(([, , get, set], i) => { if (mouse([LEFT, TOP + i * ROW, 64, 64])) set(!get()); });
					if (mouse(MINUS)) setOpt('gap', Math.max(1, opts.gap - 0.5));
					if (mouse(PLUS)) setOpt('gap', Math.min(10, opts.gap + 0.5));
					if (mouse(RESET)) { setOpt('pos', null); place(); }
					if (mouse(CLEAR)) clearKept();
				} catch (e) { console.warn('[SlimeBeep]', e); }
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
	function setNight(on) {
		opts.night = !!on;
		saveOpts();
		document.documentElement.classList.toggle('sb-night', opts.night);
		const moon = $('sb-moon');
		if (moon) { moon.textContent = opts.night ? '☀️' : '🌙'; moon.title = opts.night ? 'Day mode' : 'Night mode'; }
		const box = $('sb-o-night');
		if (box) box.checked = opts.night;
	}

	function optionsHtml() {
		return `<div class="sb-opts">
			<b style="display:block;margin:6px 2px">⚙ Options</b>
			<label><input type="checkbox" id="sb-o-night" ${opts.night ? 'checked' : ''}>🌙 Night mode (a night blue slime)</label>
			<label><input type="checkbox" id="sb-o-sound" ${opts.sound ? 'checked' : ''}>Pop sound for new beeps</label>
			<label><input type="checkbox" id="sb-o-popups" ${opts.popups ? 'checked' : ''}>💌 A card by the slime for each new beep</label>
			<label><input type="checkbox" id="sb-o-desktop" ${opts.desktop ? 'checked' : ''}>🖥 Desktop notification when the game is in the background</label>
			<label><input type="checkbox" id="sb-o-keep" ${opts.keep ? 'checked' : ''}>🗂 Keep my beeps in this browser after I log out
				<span class="sb-hint" style="display:block">${hist.length} beeps kept. <button class="sb-pill" id="sb-o-clear">Clear them</button></span></label>
			<label><input type="checkbox" id="sb-o-share" ${opts.shareRoom ? 'checked' : ''}>📍 "Let them join me" starts on</label>
			<label><input type="checkbox" id="sb-o-remember" ${opts.remember ? 'checked' : ''}>Remember who I picked for group beeps</label>
			<label>Wait <input type="number" id="sb-o-gap" min="1" max="10" step="0.5" value="${opts.gap}"> seconds between group beeps</label>
			<label>Drag the slime to move it. <button class="sb-pill" id="sb-o-reset">Put it back</button></label>
			<div class="sb-hint" style="margin:10px 4px">SlimeBeep v${VERSION} updates itself: a reload always runs the newest version.</div>
		</div>`;
	}

	function wireOptions() {
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

	try {
		build();
	} catch (e) {
		console.warn('[SlimeBeep] could not start:', e);
	}
})();

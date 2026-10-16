// Headless test: stubs the game's socket, beep log and beep sender, drives the real panel.
//   node test.js [--shots]   (--shots saves a picture of each view next to this folder)
const puppeteer = require('C:/Users/Sam_0/Documents/Project/bc-plushies/node_modules/puppeteer-core');
const src = require('fs').readFileSync(__dirname + '/slimebeep.js', 'utf8');
const SHOTS = process.argv.includes('--shots');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = 0;
const check = (ok, what) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`); if (!ok) failed++; };

(async () => {
	const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
	const p = await b.newPage();
	await p.setViewport({ width: 1200, height: 800 });
	// news.json is served by the test, never the live one.
	let newsBody = '[]';
	await p.setRequestInterception(true);
	p.on('request', (r) => (r.url().includes('/news.json') ? r.respond({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: newsBody }) : r.continue()));
	await p.goto('https://example.com/');
	const stub = () => {
		const handlers = {};
		window.Player = { MemberNumber: 1, FriendNames: new Map([[11, 'Ann'], [12, 'Bea'], [13, 'Cat'], [14, 'Dee']]) };
		window.ChatRoomData = { Name: 'Velvet Lounge' };
		const SEP = '\u2063';
		window.FriendListBeepParseMessage = (m) => { const i = m.lastIndexOf(SEP); return i < 0 ? { text: m, metadata: null } : { text: m.slice(0, i), metadata: JSON.parse(m.slice(i + 1)) }; };
		const t = (min) => new Date(Date.now() - min * 60000);
		window.FriendListBeepLog = [
			{ MemberNumber: 11, MemberName: 'Ann', Sent: false, Read: true, Time: t(50), Message: 'hiii' + SEP + '{"messageType":"Message"}' },
			{ MemberNumber: 11, MemberName: 'Ann', Sent: true, Read: true, Time: t(45), Message: 'hey Ann <3' },
			{ MemberNumber: 13, MemberName: 'Cat', Sent: false, Read: false, Time: t(5), Message: 'come to my room!', ChatRoomName: 'Cat Cafe' },
			{ MemberNumber: 13, MemberName: 'Cat', Sent: false, Read: false, Time: t(4), Message: '<b>not bold</b>' },
			{ MemberNumber: 12, MemberName: 'Bea', Sent: false, Read: false, Time: t(3), Message: '👍' + SEP + '{"messageType":"Reaction"}' },
		];
		window.beeps = [];
		// Like socket.io: event listeners plus catch-all ones, which an add-on can clear.
		let anyFns = [];
		window.ServerSocket = {
			on: (ev, fn) => { (handlers[ev] = handlers[ev] || []).push(fn); }, once() {},
			off: (ev, fn) => { handlers[ev] = (handlers[ev] || []).filter((f) => f !== fn); },
			listeners: (ev) => (handlers[ev] || []).slice(),
			removeAllListeners: (ev) => { handlers[ev] = []; },
			onAny: (fn) => { anyFns.push(fn); }, prependAny: (fn) => { anyFns.unshift(fn); },
			offAny: (fn) => { anyFns = anyFns.filter((f) => f !== fn); }, listenersAny: () => anyFns.slice(),
		};
		window.fire = (ev, d) => { anyFns.forEach((fn) => fn(ev, d)); (handlers[ev] || []).forEach((fn) => fn(d)); };
		window.hidden = [];
		window.ServerSend = (ev, data) => {
			if (ev === 'AccountBeep') hidden.push(data);
			if (ev === 'AccountQuery') setTimeout(() => fire('AccountQueryResult', ({ Query: 'OnlineFriends', Result: [
				{ MemberNumber: 11, MemberName: 'Ann', ChatRoomName: 'Pokepark', Type: 'Friend', ChatRoomMemberCount: 4, ChatRoomLimit: 10 },
				{ MemberNumber: 12, MemberName: 'Bea', Private: true, Type: 'Lover' },
				{ MemberNumber: 13, MemberName: 'Cat', ChatRoomName: 'Cat Cafe', Type: 'Friend' }] })), 30);
		};
		window.ServerSendBeepMessage = (n, m, o) => {
			beeps.push([n, m, o.includeRoom]);
			FriendListBeepLog.push({ MemberNumber: n, MemberName: Player.FriendNames.get(n), Sent: true, Read: true, Time: new Date(), Message: m, ChatRoomName: o.includeRoom ? ChatRoomData.Name : undefined });
		};
		window.local = []; window.ServerPlayerIsInChatRoom = () => true; window.ChatRoomSendLocal = (c) => local.push(c);
		window.PreferenceExtensionsSettings = {};
		window.PreferenceRegisterExtensionSetting = (x) => { if (PreferenceExtensionsSettings[x.Identifier]) throw new Error('twice'); PreferenceExtensionsSettings[x.Identifier] = x; };
		window.cleared = 0; window.PreferenceSubscreenExtensionsClear = () => { cleared++; };
		// A stand-in for the game's 2000x1000 canvas: draws what the real Draw* calls would, roughly, to look at.
		window.MouseX = 0; window.MouseY = 0;
		window.MouseIn = (l, t, w, h) => MouseX >= l && MouseX <= l + w && MouseY >= t && MouseY <= t + h;
		const cv = document.createElement('canvas'); cv.width = 2000; cv.height = 1000; cv.id = 'MainCanvas';
		cv.style.cssText = 'position:fixed;left:0;top:0;width:1200px;height:600px;background:#eee;z-index:1';
		document.body.appendChild(cv);
		window.MainCanvas = cv.getContext('2d');
		window.drawn = [];
		window.DrawCharacter = () => { MainCanvas.fillStyle = '#c9c'; MainCanvas.fillRect(100, 100, 350, 850); };
		window.DrawText = (t, x, y, c) => { drawn.push(t); MainCanvas.font = '36px Arial'; MainCanvas.fillStyle = c; MainCanvas.textBaseline = 'middle'; MainCanvas.fillText(t, x, y); };
		window.DrawButton = (l, t, w, h, label, color, img) => { drawn.push(label || img || ''); MainCanvas.fillStyle = color; MainCanvas.fillRect(l, t, w, h); MainCanvas.strokeRect(l, t, w, h);
			if (label) { const a = MainCanvas.textAlign; MainCanvas.textAlign = 'center'; DrawText(label, l + w / 2, t + h / 2, 'Black'); MainCanvas.textAlign = a; }
			if (img === 'Icons/Checked.png') { MainCanvas.fillStyle = '#393'; MainCanvas.fillRect(l + 16, t + 16, w - 32, h - 32); } };
		window.DrawCheckbox = (l, t, w, h, text, on) => { DrawText(text, l + 100, t + 33, 'Black'); DrawButton(l, t, w, h, '', 'White', on ? 'Icons/Checked.png' : ''); };
		let gameKeys = 0; document.addEventListener('keydown', () => gameKeys++); window.gameKeys = () => gameKeys;
	};
	const shot = async (name) => { if (SHOTS) await p.screenshot({ path: `${__dirname}/../sb-${name}.png` }); };
	await p.evaluate(stub);
	await p.addScriptTag({ content: src });
	await p.addScriptTag({ content: src });
	check(await p.$$eval('#sb-toggle', (e) => e.length) === 1, 'loaded twice, one button');
	await wait(1200);
	const notes = await p.evaluate(() => local);
	check(notes.length === 1 && /SlimeBeep v[\d.]+ is ready/.test(notes[0]), 'a first install says hello once in the room chat');
	check(await p.evaluate(() => Object.keys(PreferenceExtensionsSettings).join() === 'SlimeBeep' && PreferenceExtensionsSettings.SlimeBeep.Image.startsWith('data:image/png')),
		'listed once in Settings > Extensions, with the slime icon');
	const page = await p.evaluate(() => { const x = PreferenceExtensionsSettings.SlimeBeep; x.load(); x.run(); return drawn.join(' | ') + (document.querySelector('#sb-ext') ? ' FLOATING' : ''); });
	check(/SlimeBeep Settings/.test(page) && /Pop sound/.test(page) && /Icons\/Exit\.png/.test(page) && !/FLOATING/.test(page),
		'its settings page is drawn on the game canvas like the others (title, checkboxes, exit), no floating window');
	check(await p.evaluate(() => MainCanvas.textAlign === 'center'), 'and it leaves the canvas text alignment as it found it');
	await shot('settings');
	// Click the second checkbox (pop sound): the rows start at 200 and are 85 apart.
	await p.evaluate(() => { MouseX = 520; MouseY = 200 + 85 + 20; PreferenceExtensionsSettings.SlimeBeep.click(); });
	check(await p.evaluate(() => JSON.parse(localStorage.getItem('slimebeep.options')).sound === false), 'clicking a checkbox there changes and saves it');
	await p.evaluate(() => { PreferenceExtensionsSettings.SlimeBeep.click(); });
	await p.evaluate(() => { MouseX = 1850; MouseY = 100; PreferenceExtensionsSettings.SlimeBeep.click(); });
	check(await p.evaluate(() => cleared === 1), 'the exit door leaves it');
	await p.evaluate(() => { document.getElementById('MainCanvas').remove(); });
	await wait(1200);
	check(await p.$eval('#sb-badge', (e) => e.textContent) === '2', 'badge counts 2 unread (a reaction does not count)');

	await p.click('#sb-toggle');
	await wait(200);
	const chats = await p.$$eval('#sb-body .sb-row', (rows) => rows.map((r) => r.querySelector('.sb-name').textContent + '|' + r.querySelector('.sb-sub').textContent));
	check(chats.length === 2 && /Cat/.test(chats[0]) && /Ann/.test(chats[1]), `chats newest first, the reaction-only chat left out (${chats.join(', ')})`);
	check(/You: hey Ann/.test(chats[1]), 'your own last beep shows as "You:", metadata stripped');
	check(await p.$eval('.sb-head', (e) => /v2\.\d+\.\d+/.test(e.textContent)), 'header shows the version');
	await shot('chats');

	await p.click('#sb-body .sb-row');
	await wait(200);
	const bubbles = await p.$$eval('.sb-b', (e) => e.map((x) => x.className + ':' + x.firstChild.textContent));
	check(bubbles.length === 2 && bubbles[1].includes('<b>not bold</b>'), 'opening Cat shows her beeps, HTML shown as text');
	check(await p.$eval('.sb-room', (e) => e.textContent).then((t) => /Cat Cafe/.test(t)), "her room invite shows under the bubble");
	await wait(1100);
	check(await p.$eval('#sb-badge', (e) => e.style.display) === 'none', 'reading the chat clears the badge');
	await p.type('#sb-text', 'on my way!');
	await p.keyboard.press('Enter');
	await wait(300);
	check(JSON.stringify(await p.evaluate(() => beeps)) === JSON.stringify([[13, 'on my way!', true]]), 'Enter sends to Cat with my room');
	check(await p.$$eval('.sb-b.me', (e) => e.length) === 1, 'and it shows as my bubble');
	check(await p.$eval('#sb-toast', (e) => e.classList.contains('show') && e.textContent), 'and a toast says so: ' + await p.$eval('#sb-toast', (e) => e.textContent));
	check(await p.evaluate(() => gameKeys()) === 0, 'typing never reached the game');
	await shot('thread');
	await p.click('#sb-moon');
	check(await p.evaluate(() => document.documentElement.classList.contains('sb-night') && JSON.parse(localStorage.getItem('slimebeep.options')).night), '🌙 turns night mode on and remembers it');
	await shot('night');
	await p.click('#sb-moon');

	// A beep arriving while the chat is open shows up by itself.
	await p.evaluate(() => FriendListBeepLog.push({ MemberNumber: 13, MemberName: 'Cat', Sent: false, Read: false, Time: new Date(), Message: 'yay!' }));
	await wait(1300);
	check(await p.$$eval('.sb-b.them', (e) => e.map((x) => x.firstChild.textContent)).then((t) => t.includes('yay!')), 'a new beep appears in the open chat');
	check(await p.$$eval('.sb-card', (e) => e.length) === 0, 'no card for a beep in the chat you are reading');
	await p.type('#sb-text', 'second');
	await p.keyboard.press('Enter');
	await wait(300);
	check((await p.evaluate(() => beeps)).slice(-1)[0][2] === false, '📍 invites once, then the next beep is plain');
	await p.click('#sb-pin');
	await p.type('#sb-text', 'third');
	await p.keyboard.press('Enter');
	await p.type('#sb-text', 'fourth');
	await p.keyboard.press('Enter');
	await wait(300);
	check(JSON.stringify((await p.evaluate(() => beeps)).slice(-2).map((x) => x[2])) === '[true,false]', 'even a quick second Enter sends no invite');
	const rooms = await p.$$eval('.sb-b.me', (e) => e.map((x) => (x.querySelector('.sb-room') || {}).textContent || '-'));
	check(rooms.filter((r) => r !== '-').length === 2, `the room line only shows when it changes (${rooms.join(' | ')})`);
	await p.click('#sb-back');
	await p.evaluate(() => FriendListBeepLog.push({ MemberNumber: 11, MemberName: 'Ann', Sent: false, Read: false, Time: new Date(), Message: 'psst, over here' }));
	await wait(1300);
	const cardText = await p.$$eval('.sb-card', (e) => e.map((x) => x.textContent));
	await shot('card');
	check(cardText.length === 1 && /Ann.*psst/.test(cardText[0]), `a new beep pops a card (${cardText})`);
	await p.click('.sb-card');
	await wait(300);
	check(await p.$eval('.sb-thead', (e) => /Ann/.test(e.textContent)), 'clicking the card opens that chat');
	// Beeps another add-on handles before the game (EBC): not in the game's list, so SlimeBeep keeps them itself.
	await p.click('#sb-back');
	await p.evaluate(() => {
		// An add-on that takes beeps over: clears every beep listener and empties the message for the rest.
		ServerSocket.removeAllListeners('AccountBeep');
		ServerSocket.on('AccountBeep', (d) => { d.Message = ''; });
		fire('AccountBeep', { MemberNumber: 14, MemberName: 'Dee', BeepType: 'EBC', Message: 'beep' });
		fire('AccountBeep', { MemberNumber: 14, MemberName: 'Dee', BeepType: 'Leash', Message: 'come here' });
		fire('AccountBeep', { MemberNumber: 14, MemberName: 'Dee', BeepType: 'Sync', Message: '{"data":1}' });
		// A plain one the game lists itself, as it normally does: no double.
		fire('AccountBeep', { MemberNumber: 12, MemberName: 'Bea', BeepType: '', Message: 'hello from Bea' });
		FriendListBeepLog.push({ MemberNumber: 12, MemberName: 'Bea', Sent: false, Read: false, Time: new Date(), Message: 'hello from Bea', Id: 'b1' });
	});
	await wait(2200);
	const rows = await p.$$eval('#sb-body .sb-row', (e) => e.map((x) => x.querySelector('.sb-name').textContent + ':' + x.querySelector('.sb-sub').textContent));
	check(rows.some((r) => /Dee:beep$/.test(r)), `a beep the game never listed (EBC) shows up in the chats (${rows})`);
	check(!rows.some((r) => /come here|data/.test(r)), 'leash beeps and raw data are left out');
	check(rows.filter((r) => /Bea/.test(r)).length === 1, 'a beep the game did list is not doubled');
	check(await p.$$eval('.sb-card', (e) => e.some((x) => /Dee/.test(x.textContent))), 'and the EBC beep popped a card');
	await p.click('#sb-body .sb-row');

	await p.click('#sb-back');
	await p.click('[data-tab=friends]');
	await wait(200);
	const fr = await p.$$eval('#sb-body .sb-row', (rows) => rows.map((r) => r.textContent.replace(/\s+/g, ' ').trim()));
	check(fr.length === 3 && /Ann.*Pokepark.*4\/10/.test(fr[0]) && /Bea.*💞.*Private/.test(fr[1]), `friends with where they are (${fr.join(' / ')})`);
	await p.type('#sb-search', 'cafe');
	await wait(100);
	check(await p.$$eval('#sb-body .sb-row', (e) => e.length) === 1, 'search finds by room name too');
	await shot('friends');

	await p.click('[data-tab=group]');
	await wait(200);
	await p.click('#sb-body label:nth-of-type(2) input');
	await p.click('#sb-body label:nth-of-type(4) input');
	await p.type('#sb-gmsg', 'Party in 10!');
	await p.click('#sb-gear');
	await p.$eval('#sb-o-gap', (e) => { e.value = '1'; e.dispatchEvent(new Event('change')); });
	await p.click('[data-tab=group]');
	await wait(100);
	check(await p.$eval('#sb-gmsg', (e) => e.value) === 'Party in 10!', 'the group draft survives a trip to options');
	await shot('group');
	await p.click('#sb-gsend');
	await wait(1500);
	const sent = (await p.evaluate(() => beeps)).slice(-2);
	check(JSON.stringify(sent) === JSON.stringify([[11, 'Party in 10!', true], [13, 'Party in 10!', true]]), `group beep to Ann and Cat (${JSON.stringify(sent)})`);

	// ---- Group chats: SlimeBeep users only, roles, passing on, and nothing a stranger or a forgery can do.
	await p.evaluate(() => { hidden.length = 0; });
	const hide = (from, name, payload) => p.evaluate((f, n, pl) => fire('AccountBeep', { MemberNumber: f, MemberName: n, BeepType: 'SlimeBeep', Message: JSON.stringify(pl) }), from, name, payload);
	await hide(11, 'Ann', { sb: 1, pong: 1 });
	await hide(13, 'Cat', { sb: 1, ping: 1 });
	await wait(400);
	check(JSON.stringify(await p.evaluate(() => hidden.map((h) => [h.MemberNumber, JSON.parse(h.Message).pong]))) === '[[13,1]]', 'a ping from a SlimeBeep friend gets a hidden answer');
	await hide(13, 'Cat', { sb: 1, ping: 1 });
	await wait(400);
	check(await p.evaluate(() => hidden.length) === 1, 'but only once a minute, so nobody can bounce beeps off you');
	// Ann (owner) adds me, Cat and Zed (#99, not my friend) to a group.
	const roster = (v, extra = {}) => ({ name: 'Slime Squad', v, owner: 11, open: false, members: [11, 1, 13, 99], admins: [11], inv: { 1: 11, 13: 11, 99: 11 }, ...extra });
	await hide(11, 'Ann', { sb: 1, gid: 'squad0001', m: 'msg000001', a: 11, an: 'Ann', roster: roster(1), add: [[99, 'Zed']] });
	await wait(300);
	check(await p.$$eval('.sb-card', (e) => e.some((x) => /Slime Squad/.test(x.textContent) && /Ann added you/.test(x.textContent))), 'being added to a group pops a card');
	await hide(13, 'Cat', { sb: 1, gid: 'squad0001', m: 'msg000002', a: 13, an: 'Cat', t: 'hiii <img src=x onerror="window.pwned=1">' });
	await hide(11, 'Ann', { sb: 1, gid: 'squad0001', m: 'msg000003', a: 99, an: 'Zed', t: 'hello from a friend of a friend', via: [99, 11] });
	await hide(13, 'Cat', { sb: 1, gid: 'squad0001', m: 'msg000004', a: 99, an: 'Zed', t: 'FORGED: Cat is no admin', via: [99, 13] });
	await hide(14, 'Dee', { sb: 1, gid: 'squad0001', m: 'msg000005', a: 14, an: 'Dee', t: 'FORGED: Dee is not in the group' });
	await hide(13, 'Cat', { sb: 1, gid: 'squad0001', m: 'msg000006', a: 13, an: 'Cat', roster: roster(2, { members: [13, 1], admins: [13], owner: 13 }) });
	await hide(11, 'Ann', { sb: 1, gid: 'squad0001', m: 'msg000007', a: 11, an: 'Ann', roster: roster(1, { name: 'REPLAYED' }) });
	await p.evaluate(() => fire('AccountBeep', { MemberNumber: 77, MemberName: 'Stranger', BeepType: 'SlimeBeep', Message: JSON.stringify({ sb: 1, gid: 'squad0001', m: 'msg000008', a: 77, t: 'FORGED: not even a friend' }) }));
	await wait(300);
	await p.click('#sb-back').catch(() => {});
	await p.click('[data-tab=chats]');
	await wait(200);
	await p.click('[data-open="g:squad0001"]');
	await wait(200);
	const gc = await p.$eval('#sb-msgs', (e) => e.textContent);
	check(/hiii <img/.test(gc) && await p.evaluate(() => !window.pwned && !document.querySelector('#sb-msgs img')), 'a member’s message shows, and HTML in it stays text');
	check(/friend of a friend/.test(gc), 'a non-friend member’s message arrives passed on by an admin');
	check(!/FORGED/.test(gc), 'forgeries are dropped: passed on by a non-admin, from a non-member, a stranger, a member taking the group over');
	check(await p.$eval('.sb-thead .sb-name', (e) => e.textContent) === 'Slime Squad', 'an old member list replayed does nothing');
	// Sending: to the members who are my friends (Ann, Cat), never to Zed directly.
	await p.evaluate(() => { hidden.length = 0; });
	await p.type('#sb-text', 'hi squad');
	await p.keyboard.press('Enter');
	await wait(900);
	const out = await p.evaluate(() => hidden.map((h) => h.MemberNumber).sort());
	check(JSON.stringify(out) === '[11,13]', `a group message goes as hidden beeps to the members who are my friends (${out})`);
	check(await p.evaluate(() => hidden.every((h) => h.BeepType === 'SlimeBeep' && h.IsSecret === true)), 'as SlimeBeep beeps the game never shows');
	// Members page: I'm a plain member, so no admin buttons.
	await p.click('#sb-members');
	await wait(150);
	check(await p.$$eval('[data-act]', (e) => e.length) === 0 && /👑 Owner/.test(await p.$eval('#sb-body', (e) => e.textContent)), 'a member sees the roles but no admin buttons');
	await p.click('#sb-back');
	// Ann makes me admin: now I pass Cat's messages on to my friends in the group who haven't got them.
	await hide(11, 'Ann', { sb: 1, gid: 'squad0001', m: 'msg000009', a: 11, an: 'Ann', roster: roster(3, { admins: [11, 1] }) });
	await wait(200);
	await p.evaluate(() => { hidden.length = 0; });
	await hide(13, 'Cat', { sb: 1, gid: 'squad0001', m: 'msg000010', a: 13, an: 'Cat', t: 'pass this on', via: [13] });
	await wait(800);
	check(JSON.stringify(await p.evaluate(() => hidden.map((h) => h.MemberNumber)))  === '[11]', 'as admin I pass a message on to members who are my friends and don’t have it');
	await p.click('#sb-members');
	await wait(150);
	check(await p.$$eval('[data-act=up]', (e) => e.length) === 2 && await p.$$eval('[data-act=kick]', (e) => e.length) === 2 && await p.$$eval('[data-act=down]', (e) => e.length) === 0, 'as admin I can promote and remove plain members, but not demote anyone or touch the owner');
	await shot('members');
	await p.click('#sb-back');
	await p.click('#sb-back');
	// A new group from the UI: only SlimeBeep friends can be picked.
	await p.click('#sb-newgc');
	await wait(150);
	check(JSON.stringify(await p.$$eval('#sb-body label input[value]:not(:disabled)', (e) => e.map((x) => x.value))) === '["11","13"]', 'only friends with SlimeBeep can be picked');
	await p.type('#sb-gc-name', 'Night Owls');
	await p.click('#sb-body label input[value="13"]');
	await p.evaluate(() => { hidden.length = 0; });
	await p.click('#sb-gc-make');
	await wait(600);
	const made = await p.evaluate(() => hidden.map((h) => [h.MemberNumber, JSON.parse(h.Message).roster]));
	check(made.length === 1 && made[0][0] === 13 && made[0][1].members.join() === '1,13' && made[0][1].owner === 1, 'creating a group sends Cat the member list, with me as owner');
	await shot('gc');
	await p.click('#sb-back');

	// ---- Profile pictures: real image data only, from SlimeBeep friends, in pieces.
	const pic = await p.evaluate(() => { const c = document.createElement('canvas'); c.width = c.height = 48; const x = c.getContext('2d'); x.fillStyle = '#3c9'; x.fillRect(0, 0, 48, 48); return c.toDataURL('image/webp', 0.8); });
	await p.evaluate(() => { hidden.length = 0; });
	await hide(11, 'Ann', { sb: 1, pong: 1, pv: 'annpic0001' });
	await wait(500);
	check(await p.evaluate(() => hidden.some((h) => h.MemberNumber === 11 && JSON.parse(h.Message).pfreq === 1)), 'a friend with a new picture gets asked for it');
	const chunks = [];
	for (let i = 0; i < pic.length; i += 700) chunks.push(pic.slice(i, i + 700));
	for (let i = 0; i < chunks.length; i++) await hide(11, 'Ann', { sb: 1, pf: { v: 'annpic0001', i, n: chunks.length, d: chunks[i] } });
	// Things that are not pictures, from Cat: an SVG (can carry script), a javascript: link, a web address.
	for (const bad of ['data:image/svg+xml;base64,PHN2Zz48c2NyaXB0PmFsZXJ0KDEpPC9zY3JpcHQ+PC9zdmc+', 'javascript:alert(1)', 'https://evil.example/track.png']) {
		await hide(13, 'Cat', { sb: 1, pf: { v: 'catpic0001', i: 0, n: 1, d: bad } });
	}
	await wait(300);
	const pics = await p.evaluate(() => JSON.parse(localStorage.getItem('slimebeep.pfps') || '{}'));
	check(pics[11] && pics[11].data === pic, "Ann's picture arrives in pieces and is kept");
	check(!pics[13], 'an SVG, a javascript: link or a web address is never taken as a picture');
	await p.click('[data-tab=friends]');
	await wait(200);
	check(await p.$$eval('#sb-body img.sb-pic', (e) => e.length === 1 && e[0].src.startsWith('data:image/webp')), "Ann's picture shows in place of her initials");
	await shot('pfp');
	// Mine: Cat asks, and gets it in pieces.
	await p.evaluate((d) => { const o = JSON.parse(localStorage.getItem('slimebeep.options')); o.pfp = { v: 'mypic00001', data: d }; localStorage.setItem('slimebeep.options', JSON.stringify(o)); }, pic);
	await p.reload();
	await p.evaluate(stub);
	await p.addScriptTag({ content: src });
	await wait(1200);
	await p.evaluate(() => { hidden.length = 0; });
	await hide(13, 'Cat', { sb: 1, pfreq: 1 });
	await wait(300 + chunks.length * 300);
	const mine = await p.evaluate(() => hidden.map((h) => JSON.parse(h.Message)).filter((m) => m.pf).sort((a, b) => a.pf.i - b.pf.i).map((m) => m.pf.d).join(''));
	check(mine === pic, 'a SlimeBeep friend who asks gets my picture');
	check(await p.evaluate(() => hidden.every((h) => JSON.parse(h.Message).pv === 'mypic00001')), 'and every hidden beep says which picture I have');
	// Choosing one: the file picker, a big PNG in, a small square picture out.
	await p.click('#sb-toggle');
	await wait(200);
	await p.click('#sb-gear');
	await wait(150);
	const [chooser] = await Promise.all([p.waitForFileChooser(), p.click('#sb-o-pic')]);
	await chooser.accept([__dirname + '/icon-256.png']);
	await wait(800);
	const chosen = await p.evaluate(() => JSON.parse(localStorage.getItem('slimebeep.options')).pfp);
	check(chosen && chosen.v !== 'mypic00001' && /^data:image\/(webp|jpeg);base64,/.test(chosen.data) && chosen.data.length <= 6000, `choosing a picture shrinks it to send (${chosen && chosen.data.length} characters)`);
	await shot('mypic');
	await p.click('#sb-gear');


	// Drag; the spot and the picks survive a reload.
	const r = await p.$eval('#sb-toggle', (e) => { const x = e.getBoundingClientRect(); return { x: x.x + 20, y: x.y + 20 }; });
	await p.mouse.move(r.x, r.y); await p.mouse.down(); await p.mouse.move(300, 200, { steps: 8 }); await p.mouse.up();
	const at = await p.$eval('#sb-toggle', (e) => [e.style.left, e.style.top]);
	check(at[0] === '280px' && at[1] === '180px', `dragged to ${at}`);
	const inside = await p.$eval('#sb-panel', (e) => { const x = e.getBoundingClientRect(); return x.left >= 0 && x.top >= 0 && x.right <= innerWidth && x.bottom <= innerHeight; });
	check(inside, 'the panel stays inside the window');
	newsBody = JSON.stringify([{ id: 'old', text: 'old news' }, { id: 'n1', title: '📢 Hi', text: 'SlimeBeep can now keep your beeps!' }]);
	await p.reload();
	await p.evaluate(stub);
	// A new login: the game's log starts empty again.
	await p.evaluate(() => { FriendListBeepLog.length = 0; });
	await p.addScriptTag({ content: src });
	await wait(1500);
	const newsCards = await p.$$eval('.sb-card.news', (e) => e.map((x) => x.textContent));
	await shot('news');
	check(newsCards.length === 1 && /keep your beeps/.test(newsCards[0]), `a first install sees only the newest news item (${newsCards})`);
	check(await p.$$eval('.sb-card:not(.news)', (e) => e.length) === 0, 'beeps from before the reload pop no cards');
	check(JSON.stringify(await p.$eval('#sb-toggle', (e) => [e.style.left, e.style.top])) === JSON.stringify(at), 'the spot survives a reload');
	await p.click('#sb-toggle');
	await wait(200);
	await p.click('[data-tab=group]');
	await wait(100);
	check(JSON.stringify(await p.$$eval('#sb-body label input:checked:not(#sb-groom)', (e) => e.map((x) => x.value))) === '["11","13"]', 'and so do the picks');
	await p.click('[data-tab=chats]');
	await wait(200);
	const kept = await p.$$eval('#sb-body .sb-row .sb-name', (e) => e.map((x) => x.textContent));
	check(['Ann', 'Bea', 'Cat', 'Dee', 'Slime Squad', 'Night Owls'].every((n) => kept.some((t) => t.includes(n))), `chats and group chats survive a relog, the EBC one too (${kept})`);
	await p.reload();
	await p.evaluate(stub);
	await p.addScriptTag({ content: src });
	await wait(1500);
	check(await p.$$eval('.sb-card.news', (e) => e.length) === 0, 'news shows once');
	check(await p.evaluate(() => local.length) === 0, 'and the room note does not repeat for the same version');
	// A new version is pushed: one note, with its news item.
	await p.evaluate(() => { const o = JSON.parse(localStorage.getItem('slimebeep.options')); o.lastVersion = '0.0.1'; localStorage.setItem('slimebeep.options', JSON.stringify(o)); });
	const ver = src.match(/const VERSION = '([^']+)'/)[1];
	newsBody = JSON.stringify([{ id: ver, text: 'Shiny new things.' }]);
	await p.reload();
	await p.evaluate(stub);
	await p.addScriptTag({ content: src });
	await wait(1800);
	const upd = await p.evaluate(() => local);
	check(upd.length === 1 && upd[0].includes(`updated to v${ver}`) && upd[0].includes('Shiny new things.'), `after an update, one room note with what's new`);
	await shot('reload');
	await b.close();
	console.log(failed ? `\n${failed} FAILED` : '\nall passed');
	process.exit(failed ? 1 : 0);
})();

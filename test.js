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
		window.ServerSocket = { on: (ev, fn) => { (handlers[ev] = handlers[ev] || []).push(fn); }, once() {} };
		window.ServerSend = (ev, data) => {
			if (ev === 'AccountQuery') setTimeout(() => (handlers.AccountQueryResult || []).forEach((fn) => fn({ Query: 'OnlineFriends', Result: [
				{ MemberNumber: 11, MemberName: 'Ann', ChatRoomName: 'Pokepark', Type: 'Friend', ChatRoomMemberCount: 4, ChatRoomLimit: 10 },
				{ MemberNumber: 12, MemberName: 'Bea', Private: true, Type: 'Lover' },
				{ MemberNumber: 13, MemberName: 'Cat', ChatRoomName: 'Cat Cafe', Type: 'Friend' }] })), 30);
		};
		window.ServerSendBeepMessage = (n, m, o) => {
			beeps.push([n, m, o.includeRoom]);
			FriendListBeepLog.push({ MemberNumber: n, MemberName: Player.FriendNames.get(n), Sent: true, Read: true, Time: new Date(), Message: m, ChatRoomName: o.includeRoom ? ChatRoomData.Name : undefined });
		};
		let gameKeys = 0; document.addEventListener('keydown', () => gameKeys++); window.gameKeys = () => gameKeys;
	};
	const shot = async (name) => { if (SHOTS) await p.screenshot({ path: `${__dirname}/../sb-${name}.png` }); };
	await p.evaluate(stub);
	await p.addScriptTag({ content: src });
	await p.addScriptTag({ content: src });
	check(await p.$$eval('#sb-toggle', (e) => e.length) === 1, 'loaded twice, one button');
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

	// A beep arriving while the chat is open shows up by itself.
	await p.evaluate(() => FriendListBeepLog.push({ MemberNumber: 13, MemberName: 'Cat', Sent: false, Read: false, Time: new Date(), Message: 'yay!' }));
	await wait(1300);
	check(await p.$$eval('.sb-b.them', (e) => e.map((x) => x.firstChild.textContent)).then((t) => t.includes('yay!')), 'a new beep appears in the open chat');

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
	const sent = (await p.evaluate(() => beeps)).slice(1);
	check(JSON.stringify(sent) === JSON.stringify([[11, 'Party in 10!', true], [13, 'Party in 10!', true]]), `group beep to Ann and Cat (${JSON.stringify(sent)})`);

	// Drag; the spot and the picks survive a reload.
	const r = await p.$eval('#sb-toggle', (e) => { const x = e.getBoundingClientRect(); return { x: x.x + 20, y: x.y + 20 }; });
	await p.mouse.move(r.x, r.y); await p.mouse.down(); await p.mouse.move(300, 200, { steps: 8 }); await p.mouse.up();
	const at = await p.$eval('#sb-toggle', (e) => [e.style.left, e.style.top]);
	check(at[0] === '280px' && at[1] === '180px', `dragged to ${at}`);
	const inside = await p.$eval('#sb-panel', (e) => { const x = e.getBoundingClientRect(); return x.left >= 0 && x.top >= 0 && x.right <= innerWidth && x.bottom <= innerHeight; });
	check(inside, 'the panel stays inside the window');
	await p.reload();
	await p.evaluate(stub);
	await p.addScriptTag({ content: src });
	check(JSON.stringify(await p.$eval('#sb-toggle', (e) => [e.style.left, e.style.top])) === JSON.stringify(at), 'the spot survives a reload');
	await p.click('#sb-toggle');
	await wait(200);
	await p.click('[data-tab=group]');
	await wait(100);
	check(JSON.stringify(await p.$$eval('#sb-body label input:checked:not(#sb-groom)', (e) => e.map((x) => x.value))) === '["11","13"]', 'and so do the picks');
	await shot('reload');
	await b.close();
	console.log(failed ? `\n${failed} FAILED` : '\nall passed');
	process.exit(failed ? 1 : 0);
})();

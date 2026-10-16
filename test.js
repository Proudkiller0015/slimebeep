// Headless test: stubs the game's socket and beep sender, drives the real box.
const puppeteer = require('C:/Users/Sam_0/Documents/Project/bc-plushies/node_modules/puppeteer-core');
const src = require('fs').readFileSync(__dirname + '/slimebeep.js', 'utf8');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
	const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
	const p = await b.newPage();
	await p.setViewport({ width: 1200, height: 800 });
	await p.goto('https://example.com/');
	const stub = () => {
		window.sent = []; window.beeps = []; const handlers = {};
		window.Player = { MemberNumber: 1 };
		window.ChatRoomData = { Name: 'Velvet Lounge' };
		window.ServerSocket = { once: (ev, fn) => { handlers[ev] = fn; } };
		window.ServerSend = (ev, data) => { sent.push([ev, data]); if (ev === 'AccountQuery') setTimeout(() => handlers.AccountQueryResult({ Query: 'OnlineFriends', Result: [
			{ MemberNumber: 11, MemberName: 'Ann' }, { MemberNumber: 12, MemberName: 'Bea' }, { MemberNumber: 13, MemberName: 'Cat' }] }), 50); };
		window.ServerSendBeepMessage = (n, m, o) => beeps.push([n, m, o.includeRoom]);
		let gameKeys = 0; document.addEventListener('keydown', () => gameKeys++); window.gameKeys = () => gameKeys;
	};
	await p.evaluate(stub);
	await p.addScriptTag({ content: src });
	await p.addScriptTag({ content: src }); // twice: still one button
	const out = { buttons: await p.$$eval('#ba-toggle', (e) => e.length) };
	await p.click('#ba-toggle');
	await wait(200);
	out.count1 = await p.$eval('#ba-count', (e) => e.textContent);
	out.hint = await p.$eval('#ba-room-hint', (e) => e.textContent);
	await p.click('#ba-list label:nth-child(1) input');
	await p.click('#ba-list label:nth-child(3) input');
	await p.click('#ba-gear');
	await p.$eval('#ba-o-gap', (e) => { e.value = '1'; e.dispatchEvent(new Event('change')); });
	await p.type('#ba-msg', 'Hello friends!');
	const t0 = Date.now();
	await p.click('#ba-send');
	await wait(1500);
	out.count2 = await p.$eval('#ba-count', (e) => e.textContent);
	out.beeps = await p.evaluate(() => beeps);
	out.status = await p.$eval('#ba-status', (e) => e.textContent);
	out.keysLeaked = await p.evaluate(() => gameKeys());
	// Drag the button to the top left; it stays there after a reload.
	const r = await p.$eval('#ba-toggle', (e) => { const b = e.getBoundingClientRect(); return { x: b.x + 20, y: b.y + 20 }; });
	await p.mouse.move(r.x, r.y); await p.mouse.down(); await p.mouse.move(300, 200, { steps: 8 }); await p.mouse.up();
	out.boxStillOpen = await p.$eval('#ba-box', (e) => e.style.display);
	out.dragged = await p.$eval('#ba-toggle', (e) => [e.style.left, e.style.top]);
	await p.reload();
	await p.evaluate(stub);
	await p.addScriptTag({ content: src });
	out.afterReload = await p.$eval('#ba-toggle', (e) => [e.style.left, e.style.top]);
	await p.click('#ba-toggle');
	await wait(200);
	out.remembered = await p.$$eval('#ba-list input:checked', (e) => e.map((x) => x.value));
	out.gapKept = await p.$eval('#ba-o-gap', (e) => e.value);
	out.boxPos = await p.$eval('#ba-box', (e) => { const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.right) <= innerWidth && b.bottom <= innerHeight && b.x >= 0 && b.y >= 0]; });
	await p.screenshot({ path: __dirname + '/../beep-shot.png' });
	console.log(JSON.stringify(out, null, 1));
	await b.close();
})();

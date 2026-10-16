// Headless test: stubs the game's socket and beep sender, drives the real box.
const puppeteer = require('C:/Users/Sam_0/Documents/Project/bc-plushies/node_modules/puppeteer-core');
const src = require('fs').readFileSync(__dirname + '/slimebeep.user.js', 'utf8');
(async () => {
	const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
	const p = await b.newPage();
	await p.setContent('<html><head></head><body></body></html>');
	await p.evaluate(() => {
		window.sent = []; window.beeps = []; const handlers = {};
		window.Player = { MemberNumber: 1 };
		window.ServerSocket = { once: (ev, fn) => { handlers[ev] = fn; } };
		window.ServerSend = (ev, data) => { sent.push([ev, data]); if (ev === 'AccountQuery') setTimeout(() => handlers.AccountQueryResult({ Query: 'OnlineFriends', Result: [
			{ MemberNumber: 11, MemberName: 'Ann' }, { MemberNumber: 12, MemberName: 'Bea' }, { MemberNumber: 13, MemberName: 'Cat' }] }), 50); };
		window.ServerSendBeepMessage = (n, m, o) => beeps.push([n, m, o.includeRoom]);
		let gameKeys = 0; document.addEventListener('keydown', () => gameKeys++); window.gameKeys = () => gameKeys;
	});
	await p.addScriptTag({ content: src });
	await p.click('#ba-toggle');
	await new Promise((r) => setTimeout(r, 200));
	const count1 = await p.$eval('#ba-count', (e) => e.textContent);
	await p.click('#ba-who');
	await p.click('#ba-list label:nth-child(2) input'); // untick Bea
	await p.type('#ba-msg', 'Birthday party at 8!');
	await p.click('#ba-send');
	await new Promise((r) => setTimeout(r, 2000));
	console.log(JSON.stringify({ count1, count2: await p.$eval('#ba-count', (e) => e.textContent), beeps: await p.evaluate(() => beeps),
		status: await p.$eval('#ba-status', (e) => e.textContent), keysLeaked: await p.evaluate(() => gameKeys()) }));
	await b.close();
})();

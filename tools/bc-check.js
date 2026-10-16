// Daily check that the live game still has everything SlimeBeep uses (run by .github/workflows/bc-check.yml).
//   node tools/bc-check.js            (CHROME_PATH=... for a Chrome somewhere else)
// Finds the newest game version (R132, R133, ...), loads it, checks every game function SlimeBeep
// needs, starts SlimeBeep in it, and checks the group chat relay answers the game's site. Fails
// (exit 1, so GitHub emails the repository owner) when any of that breaks.
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const SITE = 'https://www.bondageprojects.elementfx.com';
const RELAY = 'wss://slimebeep-relay.slimebeep-relay.workers.dev';
const CHROME = process.env.CHROME_PATH || (process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : '/usr/bin/google-chrome');
// The same names as NEEDS in slimebeep.js.
const NEEDS = ['ServerSocket', 'Player', 'ServerSend', 'FriendListBeepLog', 'ServerSendBeepMessage', 'ChatRoomSendLocal',
	'ServerPlayerIsInChatRoom', 'PreferenceRegisterExtensionSetting', 'DrawCheckbox', 'MouseIn'];

async function newestVersion() {
	let best = null;
	let misses = 0;
	for (let n = 130; n < 200 && misses < 4; n++) {
		const r = await fetch(`${SITE}/R${n}/BondageClub/index.html`, { method: 'HEAD' }).catch(() => null);
		if (r && r.ok) { best = n; misses = 0; } else misses++;
	}
	return best;
}

(async () => {
	const problems = [];
	const n = await newestVersion();
	if (!n) { console.log('FAIL could not find the game at all'); process.exit(1); }
	const url = `${SITE}/R${n}/BondageClub/`;
	console.log(`game: R${n} (${url})`);
	const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
	const p = await b.newPage();
	const errors = [];
	p.on('pageerror', (e) => { if (/SlimeBeep|slimebeep/i.test(`${e.message} ${e.stack}`)) errors.push(e.message); });
	await p.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
	const missing = await p.evaluate((names) => names.filter((k) => { try { return (0, eval)(`typeof ${k}`) === 'undefined'; } catch (e) { return true; } }), NEEDS);
	for (const k of missing) problems.push(`the game no longer has ${k}`);
	// SlimeBeep itself, from the repository, started in the real game page.
	const src = fs.readFileSync(path.join(__dirname, '..', 'slimebeep.js'), 'utf8');
	await p.addScriptTag({ content: src });
	await new Promise((r) => setTimeout(r, 3000));
	const sb = await p.evaluate(() => ({ version: window.SlimeBeep && window.SlimeBeep.version, button: !!document.getElementById('sb-toggle'),
		missing: window.SlimeBeep && window.SlimeBeep.debug ? window.SlimeBeep.debug().missing : null }));
	if (!sb.version || !sb.button) problems.push('SlimeBeep did not start in the game page');
	for (const e of errors) problems.push(`SlimeBeep error: ${e}`);
	// The relay, as the game's site sees it.
	const relay = await p.evaluate((u) => new Promise((res) => {
		const w = new WebSocket(`${u}/ws?g=dailycheck01`);
		w.onmessage = (e) => { res(/"hello"/.test(e.data) ? 'ok' : 'odd answer'); w.close(); };
		w.onerror = () => res('refused');
		setTimeout(() => res('timeout'), 15000);
	}), RELAY);
	if (relay !== 'ok') problems.push(`the group chat relay: ${relay}`);
	await b.close();
	console.log(`SlimeBeep ${sb.version} started: ${sb.button}; relay: ${relay}`);
	if (problems.length) {
		for (const x of problems) console.log(`FAIL ${x}`);
		process.exit(1);
	}
	console.log('all good');
})().catch((e) => { console.log(`FAIL ${e.message}`); process.exit(1); });

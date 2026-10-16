// Headless test: stubs the game's socket, beep log and beep sender, drives the real panel.
//   node test.js [--shots]   (--shots saves a picture of each view next to this folder)
const puppeteer = require('C:/Users/Sam_0/Documents/Project/bc-plushies/node_modules/puppeteer-core');
const src = require('fs').readFileSync(`${__dirname}/slimebeep.js`, 'utf8');
const SHOTS = process.argv.includes('--shots');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// Other SlimeBeep users, played from here against the relay.
const RELAY_URL = process.env.RELAY || 'ws://localhost:8787';
const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
/** The messages in a relay reply: one for 'msg', all of a 'history', none otherwise. */
const messagesOf = (x) => {
	if (x.t === 'msg') {
		return [x.m];
	}
	return x.t === 'history' ? x.msgs : [];
};
async function relayUser(member, name) {
	const k = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
	const jwk = await crypto.subtle.exportKey('jwk', k.publicKey);
	return { member, name, k, pub: { x: jwk.x, y: jwk.y } };
}
async function relayJoin(gid, who, fields = {}) {
	const ws = new WebSocket(`${RELAY_URL}/ws?g=${gid}`, { headers: { Origin: 'https://www.bondageprojects.elementfx.com' } });
	const c = { ws, got: [], closed: null };
	ws.onmessage = (e) => c.got.push(JSON.parse(e.data));
	ws.onclose = () => {
		c.closed = true;
	};
	await new Promise((res) => {
		const t = setInterval(() => {
			if (c.got.length || c.closed) {
				clearInterval(t);
				res();
			}
		}, 20);
	});
	const hello = c.got.find((x) => x.t === 'hello');
	const sig = await crypto.subtle.sign(
		{ name: 'ECDSA', hash: 'SHA-256' },
		who.k.privateKey,
		new TextEncoder().encode(`${hello.nonce}|${gid}|${who.member}`),
	);
	ws.send(JSON.stringify({ t: 'auth', member: who.member, name: who.name, pub: who.pub, sig: b64url(sig), ...fields }));
	await new Promise((r) => setTimeout(r, 400));
	c.send = (x) => ws.send(JSON.stringify(x));
	c.say = (text) => c.send({ t: 'say', text });
	c.last = (t) => [...c.got].reverse().find((x) => x.t === t);
	c.texts = () => c.got.flatMap(messagesOf).map((m) => m.text);
	c.welcome = c.last('welcome');
	return c;
}
const waitFor = async (fn, ms) => {
	const end = Date.now() + ms;
	while (Date.now() < end) {
		if (await fn()) {
			return true;
		}
		await new Promise((r) => setTimeout(r, 150));
	}
	return false;
};
let failed = 0;
const check = (ok, what) => {
	console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`);
	if (!ok) {
		failed++;
	}
};

(async () => {
	// The test page is a public one; Chrome would block it from the local test relay.
	const b = await puppeteer.launch({
		executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
		headless: 'new',
		args: ['--disable-features=LocalNetworkAccessChecks,BlockInsecurePrivateNetworkRequests,PrivateNetworkAccessRespectPreflightResults'],
	});
	const p = await b.newPage();
	await p.setViewport({ width: 1200, height: 800 });
	// news.json is served by the test, never the live one.
	let newsBody = '[]';
	// What GitHub Pages answers for slimebeep.js (null: not found, so the copy under test just starts).
	let pagesBody = null;
	await p.setRequestInterception(true);
	// GitHub Pages (slimebeep.js, news.json) is served from the test; everything else goes through.
	const cors = { 'Access-Control-Allow-Origin': '*' };
	p.on('request', (r) => {
		if (r.url().includes('github.io/slimebeep/slimebeep.js')) {
			if (!pagesBody) {
				return r.respond({ status: 404, headers: cors, body: '' });
			}
			return r.respond({ status: 200, contentType: 'application/javascript', headers: cors, body: pagesBody });
		}
		if (r.url().includes('/news.json')) {
			return r.respond({ status: 200, contentType: 'application/json', headers: cors, body: newsBody });
		}
		return r.continue();
	});
	await p.goto('https://example.com/');
	const stub = () => {
		// The game's own rule for every canvas (CSS/Styles.css), which SlimeBeep's canvases must survive.
		if (!document.getElementById('game-css')) {
			const gs = document.createElement('style');
			gs.id = 'game-css';
			gs.textContent =
				'canvas { padding: 0; margin: auto; outline: none; display: block; top: 0; bottom: 0; left: 0; right: 0; position: absolute; width: 100%; }';
			document.head.appendChild(gs);
		}
		const handlers = {};
		window.Player = {
			MemberNumber: 1,
			FriendNames: new Map([
				[11, 'Ann'],
				[12, 'Bea'],
				[13, 'Cat'],
				[14, 'Dee'],
			]),
		};
		window.ChatRoomData = { Name: 'Velvet Lounge' };
		// The real game's settings marker, after a new line.
		const SEP = '\uf124';
		window.FriendListBeepParseMessage = (m) => {
			const i = m.lastIndexOf(SEP);
			return i < 0 ? { text: m, metadata: null } : { text: m.slice(0, i).trimEnd(), metadata: JSON.parse(m.slice(i + 1)) };
		};
		const t = (min) => new Date(Date.now() - min * 60000);
		window.FriendListBeepLog = [
			{ MemberNumber: 11, MemberName: 'Ann', Sent: false, Read: true, Time: t(50), Message: `hiii\n${SEP}{"messageType":"Message"}` },
			{ MemberNumber: 11, MemberName: 'Ann', Sent: true, Read: true, Time: t(45), Message: 'hey Ann <3' },
			{ MemberNumber: 13, MemberName: 'Cat', Sent: false, Read: false, Time: t(5), Message: 'come to my room!', ChatRoomName: 'Cat Cafe' },
			{ MemberNumber: 13, MemberName: 'Cat', Sent: false, Read: false, Time: t(4), Message: '<b>not bold</b>' },
			{ MemberNumber: 12, MemberName: 'Bea', Sent: false, Read: false, Time: t(3), Message: `👍\n${SEP}{"messageType":"Reaction"}` },
		];
		window.beeps = [];
		// Like socket.io: event listeners plus catch-all ones, which an add-on can clear.
		let anyFns = [];
		window.ServerSocket = {
			on: (ev, fn) => {
				(handlers[ev] = handlers[ev] || []).push(fn);
			},
			once() {},
			off: (ev, fn) => {
				handlers[ev] = (handlers[ev] || []).filter((f) => f !== fn);
			},
			listeners: (ev) => (handlers[ev] || []).slice(),
			removeAllListeners: (ev) => {
				handlers[ev] = [];
			},
			onAny: (fn) => {
				anyFns.push(fn);
			},
			prependAny: (fn) => {
				anyFns.unshift(fn);
			},
			offAny: (fn) => {
				anyFns = anyFns.filter((f) => f !== fn);
			},
			listenersAny: () => anyFns.slice(),
		};
		window.fire = (ev, d) => {
			anyFns.forEach((fn) => fn(ev, d));
			(handlers[ev] || []).forEach((fn) => fn(d));
		};
		window.hidden = [];
		window.ServerSend = (ev, data) => {
			if (ev === 'AccountBeep') {
				hidden.push(data);
			}
			if (ev === 'AccountQuery') {
				setTimeout(
					() =>
						fire('AccountQueryResult', {
							Query: 'OnlineFriends',
							Result: [
								{
									MemberNumber: 11,
									MemberName: 'Ann',
									ChatRoomName: 'Pokepark',
									Type: 'Friend',
									ChatRoomMemberCount: 4,
									ChatRoomLimit: 10,
								},
								{ MemberNumber: 12, MemberName: 'Bea', Private: true, Type: 'Lover' },
								{ MemberNumber: 13, MemberName: 'Cat', ChatRoomName: 'Cat Cafe', Type: 'Friend' },
							],
						}),
					30,
				);
			}
		};
		window.ServerSendBeepMessage = (n, m, o) => {
			beeps.push([n, m, o.includeRoom]);
			FriendListBeepLog.push({
				MemberNumber: n,
				MemberName: Player.FriendNames.get(n),
				Sent: true,
				Read: true,
				Time: new Date(),
				Message: m,
				ChatRoomName: o.includeRoom ? ChatRoomData.Name : undefined,
			});
		};
		// The room's chat log, as the game makes it a moment after entering a room; local notes land in it.
		window.local = [];
		window.ServerPlayerIsInChatRoom = () => true;
		window.ChatRoomSendLocal = (c) => {
			local.push(c);
			const log = document.getElementById('TextAreaChatLog');
			if (log) {
				const d = document.createElement('div');
				d.innerHTML = c;
				log.appendChild(d);
			}
		};
		window.makeLog = () => {
			if (!document.getElementById('TextAreaChatLog')) {
				const l = document.createElement('div');
				l.id = 'TextAreaChatLog';
				l.style.display = 'none';
				document.body.appendChild(l);
			}
		};
		window.PreferenceExtensionsSettings = {};
		window.PreferenceRegisterExtensionSetting = (x) => {
			if (PreferenceExtensionsSettings[x.Identifier]) {
				throw new Error('twice');
			}
			PreferenceExtensionsSettings[x.Identifier] = x;
		};
		window.cleared = 0;
		window.PreferenceSubscreenExtensionsClear = () => {
			cleared++;
		};
		// A stand-in for the game's 2000x1000 canvas: draws what the real Draw* calls would, roughly, to look at.
		window.MouseX = 0;
		window.MouseY = 0;
		window.MouseIn = (l, t, w, h) => MouseX >= l && MouseX <= l + w && MouseY >= t && MouseY <= t + h;
		const cv = document.createElement('canvas');
		cv.width = 2000;
		cv.height = 1000;
		cv.id = 'MainCanvas';
		cv.style.cssText = 'position:fixed;left:0;top:0;width:1200px;height:600px;background:#eee;z-index:1';
		document.body.appendChild(cv);
		window.MainCanvas = cv.getContext('2d');
		window.drawn = [];
		window.DrawCharacter = () => {
			MainCanvas.fillStyle = '#c9c';
			MainCanvas.fillRect(100, 100, 350, 850);
		};
		window.DrawText = (t, x, y, c) => {
			drawn.push(t);
			MainCanvas.font = '36px Arial';
			MainCanvas.fillStyle = c;
			MainCanvas.textBaseline = 'middle';
			MainCanvas.fillText(t, x, y);
		};
		window.DrawButton = (l, t, w, h, label, color, img) => {
			drawn.push(label || img || '');
			MainCanvas.fillStyle = color;
			MainCanvas.fillRect(l, t, w, h);
			MainCanvas.strokeRect(l, t, w, h);
			if (label) {
				const a = MainCanvas.textAlign;
				MainCanvas.textAlign = 'center';
				DrawText(label, l + w / 2, t + h / 2, 'Black');
				MainCanvas.textAlign = a;
			}
			if (img === 'Icons/Checked.png') {
				MainCanvas.fillStyle = '#393';
				MainCanvas.fillRect(l + 16, t + 16, w - 32, h - 32);
			}
		};
		window.DrawCheckbox = (l, t, w, h, text, on) => {
			DrawText(text, l + 100, t + 33, 'Black');
			DrawButton(l, t, w, h, '', 'White', on ? 'Icons/Checked.png' : '');
		};
		let gameKeys = 0;
		document.addEventListener('keydown', () => gameKeys++);
		window.gameKeys = () => gameKeys;
	};
	// A click that survives the panel redrawing under it (someone coming online, say).
	const tap = async (sel) => {
		for (let i = 0; i < 10; i++) {
			if (
				await p
					.$eval(sel, (e) => {
						e.click();
						return true;
					})
					.catch(() => false)
			) {
				return;
			}
			await wait(100);
		}
		throw new Error(`no ${sel}`);
	};
	const shot = async (name) => {
		if (SHOTS) {
			await p.screenshot({ path: `${__dirname}/../sb-${name}.png` });
		}
	};
	await p.evaluate(stub);
	await p.addScriptTag({ content: src });
	await p.addScriptTag({ content: src });
	await wait(400);
	check((await p.$$eval('#sb-toggle', (e) => e.length)) === 1, 'loaded twice, one button');
	await wait(1500);
	check((await p.evaluate(() => local.length)) === 0, 'no update note before the chat log exists (just after login)');
	await p.evaluate(() => makeLog());
	await wait(5200);
	const notes = await p.evaluate(() => local);
	check(notes.length === 1 && /SlimeBeep v[\d.]+ is ready/.test(notes[0]), 'a first install says hello once in the room chat');
	check(
		await p.evaluate(
			() =>
				Object.keys(PreferenceExtensionsSettings).join() === 'SlimeBeep' &&
				PreferenceExtensionsSettings.SlimeBeep.Image.startsWith('data:image/png'),
		),
		'listed once in Settings > Extensions, with the slime icon',
	);
	const page = await p.evaluate(() => {
		const x = PreferenceExtensionsSettings.SlimeBeep;
		x.load();
		x.run();
		return drawn.join(' | ') + (document.querySelector('#sb-ext') ? ' FLOATING' : '');
	});
	check(
		/SlimeBeep Settings/.test(page) && /Pop sound/.test(page) && /Icons\/Exit\.png/.test(page) && !/FLOATING/.test(page),
		'its settings page is drawn on the game canvas like the others (title, checkboxes, exit), no floating window',
	);
	check(await p.evaluate(() => MainCanvas.textAlign === 'center'), 'and it leaves the canvas text alignment as it found it');
	await shot('settings');
	check(
		await p.evaluate(() => {
			const ys = [];
			const real = DrawButton;
			window.DrawButton = (l, tp, w, h, ...r) => {
				ys.push(tp + h);
				return real(l, tp, w, h, ...r);
			};
			PreferenceExtensionsSettings.SlimeBeep.run();
			window.DrawButton = real;
			return Math.max(...ys) <= 1000;
		}),
		'everything on the settings page fits the game screen',
	);
	// Click the second checkbox (pop sound, after night mode; no theme add-on, so no theme box): rows start at 190, 72 apart.
	check(!/Match my/.test(page), 'without a theme add-on there is no theme toggle');
	await p.evaluate(() => {
		MouseX = 520;
		MouseY = 190 + 72 + 20;
		PreferenceExtensionsSettings.SlimeBeep.click();
	});
	check(
		await p.evaluate(() => JSON.parse(localStorage.getItem('slimebeep.options')).sound === false),
		'clicking a checkbox there changes and saves it',
	);
	await p.evaluate(() => {
		PreferenceExtensionsSettings.SlimeBeep.click();
	});
	await p.evaluate(() => {
		MouseX = 1850;
		MouseY = 100;
		PreferenceExtensionsSettings.SlimeBeep.click();
	});
	check(await p.evaluate(() => cleared === 1), 'the exit door leaves it');
	await p.evaluate(() => {
		document.getElementById('MainCanvas').remove();
	});
	await wait(1200);
	check((await p.$eval('#sb-badge', (e) => e.textContent)) === '2', 'badge counts 2 unread (a reaction does not count)');

	await p.click('#sb-toggle');
	await wait(200);
	const chats = await p.$$eval('#sb-body .sb-row', (rows) =>
		rows.map((r) => `${r.querySelector('.sb-name').textContent}|${r.querySelector('.sb-sub').textContent}`),
	);
	check(
		chats.length === 2 && /Cat/.test(chats[0]) && /Ann/.test(chats[1]),
		`chats newest first, the reaction-only chat left out (${chats.join(', ')})`,
	);
	check(/You: hey Ann/.test(chats[1]), 'your own last beep shows as "You:", metadata stripped');
	check(await p.$eval('.sb-head', (e) => /v\d+\.\d+\.\d+/.test(e.textContent)), 'header shows the version');
	await shot('chats');

	await p.click('#sb-body .sb-row');
	await wait(200);
	const bubbles = await p.$$eval('.sb-b', (e) => e.map((x) => `${x.className}:${x.firstChild.textContent}`));
	check(bubbles.length === 2 && bubbles[1].includes('<b>not bold</b>'), 'opening Cat shows her beeps, HTML shown as text');
	check(await p.$eval('.sb-room', (e) => e.textContent).then((t) => /Cat Cafe/.test(t)), 'her room invite shows under the bubble');
	await wait(1100);
	check((await p.$eval('#sb-badge', (e) => e.style.display)) === 'none', 'reading the chat clears the badge');
	await p.type('#sb-text', 'on my way!');
	await p.keyboard.press('Enter');
	await wait(300);
	check(JSON.stringify(await p.evaluate(() => beeps)) === JSON.stringify([[13, 'on my way!', true]]), 'Enter sends to Cat with my room');
	check((await p.$$eval('.sb-b.me', (e) => e.length)) === 1, 'and it shows as my bubble');
	check(
		await p.$eval('#sb-toast', (e) => e.classList.contains('show') && e.textContent),
		`and a toast says so: ${await p.$eval('#sb-toast', (e) => e.textContent)}`,
	);
	check((await p.evaluate(() => gameKeys())) === 0, 'typing never reached the game');
	await shot('thread');
	await p.click('#sb-moon');
	check(
		await p.evaluate(
			() => document.documentElement.classList.contains('sb-night') && JSON.parse(localStorage.getItem('slimebeep.options')).night,
		),
		'🌙 turns night mode on and remembers it',
	);
	await shot('night');
	await p.click('#sb-moon');

	// A beep arriving while the chat is open shows up by itself.
	await p.evaluate(() =>
		FriendListBeepLog.push({ MemberNumber: 13, MemberName: 'Cat', Sent: false, Read: false, Time: new Date(), Message: 'yay!' }),
	);
	await wait(1300);
	check(
		await p.$$eval('.sb-b.them', (e) => e.map((x) => x.firstChild.textContent)).then((t) => t.includes('yay!')),
		'a new beep appears in the open chat',
	);
	check((await p.$$eval('.sb-card', (e) => e.length)) === 0, 'no card for a beep in the chat you are reading');
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
	check(
		JSON.stringify((await p.evaluate(() => beeps)).slice(-2).map((x) => x[2])) === '[true,false]',
		'even a quick second Enter sends no invite',
	);
	const rooms = await p.$$eval('.sb-b.me', (e) => e.map((x) => (x.querySelector('.sb-room') || {}).textContent || '-'));
	check(rooms.filter((r) => r !== '-').length === 2, `the room line only shows when it changes (${rooms.join(' | ')})`);
	await tap('#sb-back');
	await p.evaluate(() =>
		FriendListBeepLog.push({ MemberNumber: 11, MemberName: 'Ann', Sent: false, Read: false, Time: new Date(), Message: 'psst, over here' }),
	);
	await wait(1300);
	const cardText = await p.$$eval('.sb-card', (e) => e.map((x) => x.textContent));
	await shot('card');
	check(cardText.length === 1 && /Ann.*psst/.test(cardText[0]), `a new beep pops a card (${cardText})`);
	await p.click('.sb-card');
	await wait(300);
	check(await p.$eval('.sb-thead', (e) => /Ann/.test(e.textContent)), 'clicking the card opens that chat');
	// R132: no FriendListBeepParseMessage, but beeps from newer clients carry settings after the marker.
	await p.evaluate(() => {
		delete window.FriendListBeepParseMessage;
		FriendListBeepLog.push({
			MemberNumber: 12,
			MemberName: 'Bea',
			Sent: false,
			Read: false,
			Time: new Date(),
			Message: 'what\n{"messageType":"Message","messageColor":"#F4CC00"}',
		});
		FriendListBeepLog.push({
			MemberNumber: 12,
			MemberName: 'Bea',
			Sent: false,
			Read: true,
			Time: new Date(),
			Message: 'lost marker\n{"messageType":"Message","messageColor":"#F4CC00"}',
		});
		fire('AccountBeep', { MemberNumber: 13, MemberName: 'Cat', BeepType: 'EBC', Message: 'ReqRoom' });
		fire('AccountBeep', { MemberNumber: 13, MemberName: 'Cat', BeepType: '', Message: 'KIKILINK/1 {"t":"pq","i":"-9fa1-9ce98fb5ea95"}' });
		FriendListBeepLog.push({
			MemberNumber: 13,
			MemberName: 'Cat',
			Sent: false,
			Read: false,
			Time: new Date(),
			Message: 'KIKILINK/1 {"t":"pq","i":"x"}',
		});
		FriendListBeepLog.push({ MemberNumber: 13, MemberName: 'Cat', Sent: false, Read: false, Time: new Date(), Message: 'lol {hug}' });
		for (const m of ['<3', 'hi', 'HiHi', '[3]', '{}', 'LoveYou']) {
			FriendListBeepLog.push({ MemberNumber: 13, MemberName: 'Cat', Sent: false, Read: false, Time: new Date(), Message: m });
		}
	});
	await wait(2200);
	await tap('#sb-back');
	await p.click('[data-open="12"]');
	await wait(200);
	const bea = await p.$eval('#sb-msgs', (e) => e.textContent);
	check(
		/what/.test(bea) && /lost marker/.test(bea) && !/messageType/.test(bea),
		'on R132 the beep settings are cut off, not shown as text',
	);
	await tap('#sb-back');
	await p.click('[data-open="13"]');
	await wait(200);
	const cat = await p.$eval('#sb-msgs', (e) => e.textContent);
	check(!/ReqRoom|KIKILINK/.test(cat), "other add-ons' signals (ReqRoom, KIKILINK/1 {...}) are not shown as beeps");
	const catBubbles = await p.$$eval('.sb-b.them', (e) => e.map((x) => x.firstChild.textContent));
	check(
		['lol {hug}', '<3', 'hi', 'HiHi', '[3]', '{}', 'LoveYou'].every((m) => catBubbles.includes(m)),
		`but short and playful beeps always show (${catBubbles.slice(-7).join(' | ')})`,
	);
	await tap('#sb-back');

	// Beeps another add-on handles before the game (EBC): not in the game's list, so SlimeBeep keeps them itself.
	await p.evaluate(() => {
		// An add-on that takes beeps over: clears every beep listener and empties the message for the rest.
		ServerSocket.removeAllListeners('AccountBeep');
		ServerSocket.on('AccountBeep', (d) => {
			d.Message = '';
		});
		fire('AccountBeep', { MemberNumber: 14, MemberName: 'Dee', BeepType: 'EBC', Message: 'beep' });
		fire('AccountBeep', { MemberNumber: 14, MemberName: 'Dee', BeepType: 'Leash', Message: 'come here' });
		fire('AccountBeep', { MemberNumber: 14, MemberName: 'Dee', BeepType: 'Sync', Message: '{"data":1}' });
		// A plain one the game lists itself, as it normally does: no double.
		fire('AccountBeep', { MemberNumber: 12, MemberName: 'Bea', BeepType: '', Message: 'hello from Bea' });
		FriendListBeepLog.push({
			MemberNumber: 12,
			MemberName: 'Bea',
			Sent: false,
			Read: false,
			Time: new Date(),
			Message: 'hello from Bea',
			Id: 'b1',
		});
	});
	await wait(2200);
	const rows = await p.$$eval('#sb-body .sb-row', (e) =>
		e.map((x) => `${x.querySelector('.sb-name').textContent}:${x.querySelector('.sb-sub').textContent}`),
	);
	check(
		rows.some((r) => /Dee:beep$/.test(r)),
		`a beep the game never listed (EBC) shows up in the chats (${rows})`,
	);
	check(!rows.some((r) => /come here|data/.test(r)), 'leash beeps and raw data are left out');
	check(rows.filter((r) => /Bea/.test(r)).length === 1, 'a beep the game did list is not doubled');
	check(await p.$$eval('.sb-card', (e) => e.some((x) => /Dee/.test(x.textContent))), 'and the EBC beep popped a card');
	await p.click('#sb-body .sb-row');

	await tap('#sb-back');
	await p.click('[data-tab=friends]');
	await wait(200);
	const fr = await p.$$eval('#sb-body .sb-row', (rows) => rows.map((r) => r.textContent.replace(/\s+/g, ' ').trim()));
	check(
		fr.length === 4 && /Ann.*Pokepark.*4\/10/.test(fr[0]) && /Bea.*💞.*Private/.test(fr[1]),
		`friends with where they are (${fr.join(' / ')})`,
	);
	check(
		/Dee.*Offline/.test(fr[3] || '') && (await p.$$eval('#sb-body .sb-row.offline', (e) => e.length)) === 1,
		'offline friends are listed after, greyed out',
	);
	await p.type('#sb-search', 'cafe');
	await wait(100);
	check((await p.$$eval('#sb-body .sb-row', (e) => e.length)) === 1, 'search finds by room name too');
	await shot('friends');

	await p.click('[data-tab=wave]');
	await wait(200);
	// 📍 My room: only friends in your room (Velvet Lounge here: nobody; put Cat there for a moment).
	check((await p.$('#sb-myroom')) === null, 'no "My room" button when no friend is in your room');
	await p.evaluate(() => {
		ChatRoomData.Name = 'Cat Cafe';
	});
	await p.click('[data-tab=friends]');
	await p.click('[data-tab=wave]');
	await wait(150);
	await p.click('#sb-myroom');
	check(
		JSON.stringify(await p.$$eval('#sb-body label input:checked:not(#sb-groom)', (e) => e.map((x) => x.value))) === '["13"]',
		'"My room" ticks just the friends in your room',
	);
	await p.click('#sb-none');
	await p.evaluate(() => {
		ChatRoomData.Name = 'Velvet Lounge';
	});
	await p.click('[data-tab=friends]');
	await p.click('[data-tab=wave]');
	await wait(150);
	await p.click('#sb-body label:nth-of-type(2) input');
	await p.click('#sb-body label:nth-of-type(4) input');
	await p.type('#sb-gmsg', 'Party in 10!');
	await p.click('#sb-gear');
	await p.$eval('#sb-o-gap', (e) => {
		e.value = '1';
		e.dispatchEvent(new Event('change'));
	});
	await p.click('[data-tab=wave]');
	await wait(100);
	check((await p.$eval('#sb-gmsg', (e) => e.value)) === 'Party in 10!', 'the group draft survives a trip to options');
	await shot('group');
	await p.click('#sb-gsend');
	await wait(1500);
	const sent = (await p.evaluate(() => beeps)).slice(-2);
	check(
		JSON.stringify(sent) ===
			JSON.stringify([
				[11, 'Party in 10!', true],
				[13, 'Party in 10!', true],
			]),
		`group beep to Ann and Cat (${JSON.stringify(sent)})`,
	);

	// ---- Group chats: SlimeBeep users only, roles, passing on, and nothing a stranger or a forgery can do.
	await p.evaluate(() => {
		hidden.length = 0;
	});
	const hide = (from, name, payload) =>
		p.evaluate(
			(f, n, pl) => fire('AccountBeep', { MemberNumber: f, MemberName: n, BeepType: 'SlimeBeep', Message: JSON.stringify(pl) }),
			from,
			name,
			payload,
		);
	const api0 = await p.evaluate(() => {
		const a = window.SlimeBeep.api;
		window.apiEvents = [];
		a.on('slimeBeepFriend', (e) => apiEvents.push(['friend', e.memberNumber]));
		a.on('group', (g) => apiEvents.push(['group', g.name, g.members.map((m) => `${m.memberNumber}:${m.role}:${m.online}`).join(',')]));
		a.on('presence', (g) => apiEvents.push(['presence', g.name]));
		let frozen = false;
		try {
			a.groups = null;
		} catch (e) {
			frozen = true;
		}
		return { v: a.apiVersion, frozen: frozen || a.groups !== null, fns: Object.keys(a).sort().join(',') };
	});
	check(
		api0.v === 1 &&
			api0.frozen &&
			api0.fns ===
				'apiVersion,group,groups,hasSlimeBeep,inviteToGroup,matchTheme,matchingTheme,on,openChat,openGroup,openInvite,slimeBeepFriends,version',
		`window.SlimeBeep.api is there for other add-ons, and can't be changed (${api0.fns})`,
	);
	await hide(11, 'Ann', { sb: 1, pong: 1 });
	await hide(13, 'Cat', { sb: 1, ping: 1 });
	await wait(400);
	check(
		JSON.stringify(await p.evaluate(() => hidden.map((h) => [h.MemberNumber, JSON.parse(h.Message).pong]))) === '[[13,1]]',
		'a ping from a SlimeBeep friend gets a hidden answer',
	);
	check(
		await p.evaluate(
			() =>
				SlimeBeep.api.hasSlimeBeep(11) &&
				SlimeBeep.api.slimeBeepFriends().includes(13) &&
				apiEvents.some((e) => e[0] === 'friend' && e[1] === 11),
		),
		'other add-ons can ask which friends have SlimeBeep, and hear when one is found',
	);
	await hide(13, 'Cat', { sb: 1, ping: 1 });
	await wait(400);
	check((await p.evaluate(() => hidden.length)) === 1, 'but only once a minute, so nobody can bounce beeps off you');
	// ---- Group chats through the relay (cd relay && npm run dev:test), friends or not.
	const relayUp = await fetch(`${RELAY_URL.replace(/^ws/, 'http')}/`)
		.then((r) => r.ok)
		.catch(() => false);
	if (!relayUp) {
		console.log('skip group chats: no relay running (cd relay && npm run dev:test)');
	} else {
		await p.evaluate((u) => localStorage.setItem('slimebeep.relay', u), RELAY_URL);
		const ann = await relayUser(11, 'Ann'),
			zed = await relayUser(99, 'Zed'),
			cat = await relayUser(13, 'Cat');
		// Ann's own SlimeBeep told us her key; Cat's told us one the "Cat" who joins below doesn't have.
		await hide(11, 'Ann', { sb: 1, pong: 1, kf: ann.pub.x.slice(0, 16) });
		await hide(13, 'Cat', { sb: 1, pong: 1, kf: 'AAAAAAAAAAAAAAAA' });
		await p.click('#sb-back').catch(() => {});
		await p.click('[data-tab=groups]');
		await wait(150);
		await p.click('#sb-newgc');
		await wait(150);
		await p.type('#sb-gc-name', 'Slime Squad');
		await p.click('#sb-body label input[value="11"]');
		await p.evaluate(() => {
			hidden.length = 0;
		});
		await p.click('#sb-gc-make');
		const opened = await waitFor(
			() => p.evaluate(() => /Slime Squad/.test((document.querySelector('.sb-thead') || {}).textContent || '')),
			8000,
		);
		check(opened, 'a new group is made on the relay and opens');
		await wait(600);
		const inv = await p.evaluate(() => hidden.map((h) => JSON.parse(h.Message)).find((m) => m.ginv));
		check(
			inv && /^SB-[a-z0-9]+-[A-Z2-9]{10}$/.test(inv.ginv.code) && inv.ginv.name === 'Slime Squad',
			'Ann, a SlimeBeep friend, gets her invite as a hidden beep',
		);
		const [, gid, code] = /^SB-([a-z0-9]+)-([A-Z2-9]+)$/.exec(inv.ginv.code);
		// Other add-ons inviting: Bea is a friend without SlimeBeep, so a beep with her code (no link);
		// Cat (has SlimeBeep) gets a card; Zed (#99) is no friend, so the code comes back to pass on.
		const viaApi = await p.evaluate(async (g) => {
			hidden.length = 0;
			beeps.length = 0;
			const bea = await SlimeBeep.api.inviteToGroup(g, 12);
			const zed = await SlimeBeep.api.inviteToGroup(g, 99);
			const cat = await SlimeBeep.api.inviteToGroup(g, 13);
			await new Promise((r) => setTimeout(r, 500));
			const card = hidden.map((h) => JSON.parse(h.Message)).find((m) => m.ginv);
			return {
				bea,
				beaBeep: beeps.find((b) => b[0] === 12),
				zed,
				cat,
				catCard: hidden.some((h) => h.MemberNumber === 13 && /ginv/.test(h.Message)) && !!card,
				me: await SlimeBeep.api.inviteToGroup(g, 1),
				canInvite: SlimeBeep.api.group(g).canInvite,
			};
		}, gid);
		check(
			viaApi.bea.ok &&
				viaApi.bea.sent === 'beep' &&
				viaApi.beaBeep &&
				viaApi.beaBeep[1].includes(viaApi.bea.code) &&
				/ask me where to get it/.test(viaApi.beaBeep[1]) &&
				!/https?:/.test(viaApi.beaBeep[1]),
			`a friend without SlimeBeep gets a normal beep with her code, and no link in it (the owner: nothing like an ad) (${viaApi.beaBeep && viaApi.beaBeep[1].slice(0, 90)})`,
		);
		check(viaApi.cat.ok && viaApi.cat.sent === 'invite' && viaApi.catCard, 'a SlimeBeep friend gets an invite card');
		// Invite beeps to friends without SlimeBeep: 3 a minute, a few seconds apart (Bea's above was the first).
		const many = await p.evaluate(async (g) => {
			const out = [];
			const times = [];
			let seen = beeps.length;
			const watch = setInterval(() => {
				for (; seen < beeps.length; seen++) {
					if (/Group code/.test(beeps[seen][1])) {
						times.push(Date.now());
					}
				}
			}, 50);
			for (const n of [14, 12, 14]) {
				out.push((await SlimeBeep.api.inviteToGroup(g, n)).sent);
			}
			await new Promise((r) => setTimeout(r, 7000));
			clearInterval(watch);
			return { out, gaps: times.slice(1).map((t, i) => t - times[i]) };
		}, gid);
		check(
			many.out.join() === 'beep,beep,later' && many.gaps.length === 1 && many.gaps.every((d) => d >= 2500),
			`invite beeps to friends without SlimeBeep go 3 a minute, ~3 s apart (${JSON.stringify(many)})`,
		);
		check(
			viaApi.zed.ok && !viaApi.zed.sent && /^SB-[a-z0-9]+-[A-Z2-9]{10}$/.test(viaApi.zed.code),
			'someone who is no friend: the code comes back, to pass on',
		);
		check(!viaApi.me.ok && viaApi.canInvite === true, `inviting yourself is refused, and groups() says you can invite (${viaApi.me.why})`);
		// openInvite: SlimeBeep's own "Invite Dee to…" screen.
		await p.evaluate(() => SlimeBeep.api.openInvite(14));
		await wait(200);
		check(
			/Invite Dee/.test(await p.$eval('#sb-body', (e) => e.textContent)) && (await p.$$eval('[data-invite]', (e) => e.length)) === 1,
			'api.openInvite opens "Invite Dee to…" with each group you can invite to',
		);
		await p.click('[data-invite]');
		const shown = await waitFor(() => p.evaluate(() => /Invite sent/.test(document.querySelector('#sb-body').textContent)), 4000);
		check(
			shown && (await p.evaluate(() => beeps.some((b) => b[0] === 14 && /SB-/.test(b[1])))),
			'pressing Invite there beeps Dee, a friend, her code',
		);
		await p.evaluate((g) => SlimeBeep.api.openGroup(g), gid);
		await wait(200);
		const a = await relayJoin(gid, ann, { invite: code });
		check(!!a.welcome, 'Ann joins with it');
		a.say('hi from Ann <img src=x onerror="window.pwned=1">');
		await wait(700);
		const t1 = await p.$eval('#sb-msgs', (e) => e.textContent);
		check(
			/hi from Ann <img/.test(t1) &&
				/Ann joined/.test(t1) &&
				(await p.evaluate(() => !window.pwned && !document.querySelector('#sb-msgs img'))),
			"Ann's message and her joining show up, HTML as plain text",
		);
		await p.type('#sb-text', 'hello group');
		await p.keyboard.press('Enter');
		await wait(700);
		check(a.texts().includes('hello group'), 'my message reaches Ann');
		// A code for anyone: Zed, nobody's friend, joins with it.
		await p.click('#sb-members');
		await wait(200);
		await p.click('#sb-gm-code');
		await waitFor(() => p.evaluate(() => !!document.querySelector('#sb-gm-out code')), 4000);
		const openCode = await p.$eval('#sb-gm-out code', (e) => e.textContent);
		const z = await relayJoin(gid, zed, { invite: openCode.split('-').pop() });
		check(!!z.welcome, 'Zed, a friend of nobody here, joins with a code');
		await wait(400);
		const apiG = await p.evaluate(() => {
			const g = SlimeBeep.api.groups().find((x) => x.name === 'Slime Squad');
			const copy = SlimeBeep.api.groups()[0];
			copy.members.length = 0;
			return { g, untouched: SlimeBeep.api.groups()[0].members.length > 0, events: apiEvents.filter((e) => e[0] !== 'friend') };
		});
		const roles = apiG.g
			? apiG.g.members
					.map((m) => `${m.memberNumber}:${m.role}:${m.online}`)
					.sort()
					.join(',')
			: '';
		check(
			roles === ['1:owner:true', '11:member:true', '99:member:true'].sort().join(','),
			`other add-ons see the group's members, roles and who's online (${roles})`,
		);
		check(
			apiG.untouched && apiG.events.some((e) => e[0] === 'group' && e[1] === 'Slime Squad'),
			'they get copies (changing one changes nothing) and hear when the group changes',
		);
		// A code for #13 only: someone with a different key than Cat's own SlimeBeep sent joins as #13.
		await p.type('#sb-gm-for', '13');
		await p.$eval('#sb-gm-code', (b) => b.scrollIntoView({ block: 'center' }));
		await p.click('#sb-gm-code');
		await wait(700);
		const catCode = await p.$eval('#sb-gm-out code', (e) => e.textContent);
		const c = await relayJoin(gid, cat, { invite: catCode.split('-').pop() });
		await wait(500);
		check(
			!!c.welcome && /Only #13/.test(await p.$eval('#sb-gm-out', (e) => e.textContent)),
			'a code for one member number works for that number',
		);
		const rows = await p.$$eval('#sb-body .sb-row .sb-name', (e) => e.map((x) => x.textContent));
		check(
			rows.some((r) => /Ann.*✓/.test(r)) && rows.some((r) => /Cat.*⚠/.test(r)) && rows.some((r) => /Zed/.test(r) && !/[✓⚠]/.test(r)),
			`the key check: ✓ for Ann, ⚠ for a "Cat" whose key is not the one Cat's SlimeBeep sent, nothing for strangers (${rows.join(' | ')})`,
		);
		await shot('members');
		z.say('hi, I am a friend of nobody here');
		await tap('#sb-back');
		await wait(500);
		check(/friend of nobody/.test(await p.$eval('#sb-msgs', (e) => e.textContent)), "Zed's message arrives");
		// Away: two messages while the page is gone, and SlimeBeep catches up when it's back.
		await tap('#sb-back');
		await p.reload();
		a.say('while you were away 1');
		a.say('while you were away 2');
		await wait(300);
		await p.evaluate(stub);
		await p.evaluate(() => makeLog());
		await p.addScriptTag({ content: src });
		const caught = await waitFor(
			() =>
				p.evaluate(() =>
					[...document.querySelectorAll('.sb-card')].some((x) =>
						/new messages while you were away|while you were away 2/.test(x.textContent),
					),
				),
			12000,
		);
		check(caught, 'coming back, what was said while away arrives, with a card');
		await p.click('#sb-toggle');
		await wait(200);
		await p.click('[data-tab=groups]');
		await wait(200);
		check(
			/Slime Squad/.test(await p.$eval('#sb-body', (e) => e.textContent)) &&
				(await p.$$eval('#sb-body .sb-dot', (e) => e.some((x) => Number(x.textContent) >= 2))),
			'and Slime Squad shows them as unread',
		);
		// A friend's invite to another group: it waits in 👥 Groups until you join.
		const gid2 = `owls${Date.now().toString(36)}`;
		const a2 = await relayJoin(gid2, ann, { create: { name: 'Night Owls', open: false } });
		a2.send({ t: 'invite', member: 1 });
		await wait(400);
		const code2 = a2.last('invite').code;
		await hide(11, 'Ann', { sb: 1, ginv: { code: `SB-${gid2}-${code2}`, name: 'Night Owls' } });
		await wait(300);
		await p.click('[data-tab=groups]');
		await wait(200);
		check(/Invite from Ann/.test(await p.$eval('#sb-body', (e) => e.textContent)), "a friend's invite waits in 👥 Groups");
		await shot('gc');
		await p.click('[data-join="0"]');
		const joined = await waitFor(
			() => p.evaluate(() => /Night Owls/.test((document.querySelector('.sb-thead') || {}).textContent || '')),
			6000,
		);
		check(joined, 'Join takes you into the group');
		// Owner things: I remove Zed from Slime Squad, and he is out.
		await tap('#sb-back');
		await p.click(`[data-open="g:${gid}"]`);
		await wait(200);
		await p.click('#sb-members');
		await wait(200);
		// The group picture: picked, placed in the circle, and everyone in the group gets it.
		const myPicBefore = await p.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('slimebeep.options') || '{}').pfp || null));
		const [chooser] = await Promise.all([p.waitForFileChooser(), p.click('#sb-gm-pic')]);
		await chooser.accept([`${__dirname}/icon-128.png`]);
		await waitFor(() => p.evaluate(() => !!document.querySelector('#sb-crop [data-act=save]')), 4000);
		check(/group picture/.test(await p.$eval('#sb-crop', (e) => e.textContent)), 'Add opens the cropper for the group picture');
		await p.click('#sb-crop [data-act=save]');
		const gotPic = await waitFor(() => !!a.last('gpic') && /^data:image\/(webp|jpeg)/.test(a.last('gpic').data || ''), 4000);
		check(gotPic, 'Ann gets the group picture');
		await wait(300);
		const picShown = await p.evaluate(
			(g) => ({
				head: !!document.querySelector('.sb-thead img.sb-pic'),
				api: /^data:image/.test(SlimeBeep.api.group(g).picture || ''),
				mine: JSON.stringify(JSON.parse(localStorage.getItem('slimebeep.options') || '{}').pfp || null),
			}),
			gid,
		);
		check(
			picShown.head && picShown.api && picShown.mine === myPicBefore,
			`it shows on the group, other add-ons see it, and it is not your own picture (${JSON.stringify(picShown)})`,
		);
		await shot('group-pic');
		await p.click('[data-act=kick][data-n="99"]');
		await wait(700);
		check(!!z.last('gone') && z.closed, 'removing Zed closes his connection');
		await tap('#sb-back');
		await tap('#sb-back');

		// Links you can click, and a group code with a button, in a chat.
		const sqCode = `SB-${gid}-ABCDEFGH23`;
		await p.evaluate((code) => {
			FriendListBeepLog.push({
				MemberNumber: 12,
				MemberName: 'Bea',
				Sent: false,
				Read: false,
				Time: new Date(),
				Message: `look https://example.com/a?b=1&c=2. and ${code} <b>x</b> javascript:alert(1)`,
			});
			SlimeBeep.api.openChat(12);
		}, sqCode);
		await wait(1300);
		const links = await p.evaluate(() => ({
			a: [...document.querySelectorAll('#sb-msgs .sb-b:last-child a.sb-link')].map((x) => [x.getAttribute('href'), x.target, x.rel]),
			btn: [...document.querySelectorAll('#sb-msgs .sb-b:last-child button.sb-joincode')].map((x) => [x.dataset.code, x.textContent]),
			bold: !!document.querySelector('#sb-msgs .sb-b:last-child b'),
		}));
		check(
			links.a.length === 1 &&
				links.a[0][0] === 'https://example.com/a?b=1&c=2' &&
				links.a[0][1] === '_blank' &&
				/noopener/.test(links.a[0][2]) &&
				!links.bold,
			`a web link is clickable (new tab, the full stop left out), HTML stays text, javascript: is not a link (${JSON.stringify(links.a)})`,
		);
		check(
			links.btn.length === 1 && links.btn[0][0] === sqCode && links.btn[0][1] === 'Open',
			`a group code gets a button (Open: already in it) (${JSON.stringify(links.btn)})`,
		);
		await p.click('#sb-msgs .sb-b:last-child button.sb-joincode');
		await wait(300);
		check(await p.evaluate(() => /Slime Squad/.test(document.querySelector('.sb-thead').textContent)), 'and it opens the group');
		await tap('#sb-back');

		// The game's own chat: a Join button after a group code, for SlimeBeep users.
		await p.evaluate((code) => {
			makeLog();
			const log = document.getElementById('TextAreaChatLog');
			log.style.display = '';
			log.insertAdjacentHTML(
				'beforeend',
				`<div class="ChatMessage ChatMessageBeep sb-t">Beep from Ann: come join ${code}</div><div class="ChatMessage sb-t">nothing here</div>`,
			);
		}, sqCode);
		await wait(1500);
		const bc = await p.evaluate(() => [...document.querySelectorAll('#TextAreaChatLog .sb-bcjoin')].map((b) => b.textContent));
		check(bc.length === 1 && /Open in SlimeBeep/.test(bc[0]), `a code in the game's chat gets a button (${bc})`);
		await wait(1200);
		check((await p.$$eval('#TextAreaChatLog .sb-bcjoin', (e) => e.length)) === 1, 'once only');
		await p.click('#TextAreaChatLog .sb-bcjoin');
		await wait(300);
		check(
			await p.evaluate(() => /Slime Squad/.test((document.querySelector('.sb-thead') || {}).textContent || '')),
			'clicking it opens the group in SlimeBeep',
		);
		await p.evaluate(() => {
			for (const x of document.querySelectorAll('#TextAreaChatLog .sb-t')) {
				x.remove();
			}
			document.getElementById('TextAreaChatLog').style.display = 'none';
		});
		await tap('#sb-back');
	}

	// ---- The bubble only moves while the left button is held: a lost release must not leave it following the mouse.
	{
		const r = await p.evaluate(() => {
			const t = document.getElementById('sb-toggle');
			const at = () => `${t.style.left},${t.style.top}`;
			const before = at();
			const box = t.getBoundingClientRect();
			const ev = (type, x, y, extra) =>
				t.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX: x, clientY: y, pointerId: 1, ...extra }));
			ev('pointerdown', box.left + 5, box.top + 5, { button: 0, buttons: 1 });
			// The release never arrives; the mouse then passes over with no button held.
			ev('pointermove', box.left - 200, box.top - 200, { button: -1, buttons: 0 });
			ev('pointermove', box.left - 250, box.top - 250, { button: -1, buttons: 0 });
			const afterLost = at();
			ev('pointerdown', box.left + 5, box.top + 5, { button: 2, buttons: 2 });
			ev('pointermove', box.left - 200, box.top - 200, { button: -1, buttons: 2 });
			const afterRight = at();
			ev('pointerup', box.left - 200, box.top - 200, { button: 2, buttons: 0 });
			return { before, afterLost, afterRight };
		});
		check(r.afterLost === r.before && r.afterRight === r.before, `the bubble stays put without a held left button (${JSON.stringify(r)})`);
	}

	// ---- 🎨 Theme add-ons: off by default, a toggle on the Extensions page only when one is running,
	// and SlimeBeep's colours follow Themed's (--tmd-* on the page) or BCNeko's (--bcn-* on the body).
	{
		const r = await p.evaluate(async () => {
			const out = { start: SlimeBeep.api.matchingTheme() };
			const settingsTexts = () => {
				const seen = [];
				const real = window.DrawText;
				window.DrawText = (txt, ...rest) => {
					seen.push(String(txt));
					return real(txt, ...rest);
				};
				PreferenceExtensionsSettings.SlimeBeep.run();
				window.DrawText = real;
				return seen.join(' | ');
			};
			const st = document.createElement('style');
			st.textContent =
				':root { --tmd-main: #102030; --tmd-element: #203040; --tmd-element-hover: #304050; --tmd-element-disabled: #0a1520; --tmd-accent: #aa3366; --tmd-accent-hover: #cc4488; --tmd-accent-disabled: #551a33; --tmd-text: #eeeeee; --tmd-text-disabled: #999999; }';
			document.head.appendChild(st);
			out.themedLabel = /Match my Themed colours/.test(settingsTexts());
			out.notYet = !document.documentElement.classList.contains('sb-themed');
			// Its box is the second one (after night mode): ticking it there.
			MouseX = 520;
			MouseY = 190 + 72 + 20;
			PreferenceExtensionsSettings.SlimeBeep.click();
			out.on = SlimeBeep.api.matchingTheme();
			out.panelBg = getComputedStyle(document.getElementById('sb-panel')).backgroundColor;
			// Themed goes, BCNeko is there instead: its colours, without touching the setting.
			st.remove();
			for (const [k, v] of [
				['--bcn-panel', '#fff0e0'],
				['--bcn-soft', '#ffe0c0'],
				['--bcn-accent', '#ff8800'],
				['--bcn-border', '#ddaa77'],
				['--bcn-text', '#332211'],
				['--bcn-muted', '#776655'],
			]) {
				document.body.style.setProperty(k, v);
			}
			await new Promise((res) => setTimeout(res, 6000));
			out.nekoLabel = /Match my BCNeko colours/.test(settingsTexts());
			out.nekoBg = getComputedStyle(document.getElementById('sb-panel')).backgroundColor;
			out.off = SlimeBeep.api.matchTheme(false);
			out.offBg = getComputedStyle(document.getElementById('sb-panel')).backgroundColor;
			for (const k of ['--bcn-panel', '--bcn-soft', '--bcn-accent', '--bcn-border', '--bcn-text', '--bcn-muted']) {
				document.body.style.removeProperty(k);
			}
			return out;
		});
		check(r.start.on === false && r.start.source === null, `off by default, and no theme add-on found (${JSON.stringify(r.start)})`);
		check(r.themedLabel && r.notYet, 'with Themed running, the toggle shows up (still off)');
		check(
			r.on.on && r.on.source === 'Themed' && r.panelBg === 'rgb(16, 32, 48)',
			`ticked: SlimeBeep takes Themed's colours (${r.panelBg})`,
		);
		check(r.nekoLabel && r.nekoBg === 'rgb(255, 240, 224)', `with BCNeko instead, it follows BCNeko (${r.nekoBg})`);
		check(r.off === false && r.offBg !== 'rgb(255, 240, 224)', 'api.matchTheme(false) (for theme add-ons) turns it back off');
	}

	// ---- ⏻ Quit: everything goes until the next reload, and the bookmarklet can start it again.
	{
		const r = await p.evaluate(async () => {
			document.getElementById('sb-quit').click();
			const asked =
				!!document.querySelector('#sb-ask') &&
				!!document.getElementById('sb-toggle') &&
				/bookmark again/.test(document.querySelector('#sb-ask .sb-warn').textContent);
			document.querySelector('#sb-ask [data-act=keep]').click();
			const kept = !document.querySelector('#sb-ask') && !!document.getElementById('sb-toggle');
			document.getElementById('sb-quit').click();
			document.querySelector('#sb-ask [data-act=quit]').click();
			await new Promise((res) => setTimeout(res, 300));
			if (!asked || !kept) {
				return { left: ['no confirm'], asked, kept };
			}
			const left = [...document.querySelectorAll('[id^="sb-"]')].map((e) => e.id);
			fire('AccountBeep', { MemberNumber: 11, MemberName: 'Ann', BeepType: '', Message: 'still there?' });
			await new Promise((res) => setTimeout(res, 300));
			return {
				left,
				api: typeof window.SlimeBeep,
				cls: [...document.documentElement.classList].filter((c) => c.startsWith('sb-')),
				cards: !!document.getElementById('sb-cards'),
			};
		});
		check(
			r.left.length === 0 && r.api === 'undefined' && r.cls.length === 0 && !r.cards,
			`⏻ Quit removes SlimeBeep completely until a reload (${JSON.stringify(r)})`,
		);
		await p.addScriptTag({ content: src });
		await wait(1500);
		check(!!(await p.$('#sb-toggle')), 'and starting it again (the bookmarklet) brings it back');
	}

	// ---- An old copy (the raw link lagging) finds a newer one on GitHub Pages: the newer one runs, once.
	{
		const ver = src.match(/const VERSION = '([^']+)'/)[1];
		const [a1, b1, c1] = ver.split('.').map(Number);
		pagesBody = src.replace(`const VERSION = '${ver}'`, `const VERSION = '${a1}.${b1}.${c1 + 1}'`);
		await p.reload();
		await p.evaluate(stub);
		await p.evaluate(() => makeLog());
		await p.addScriptTag({ content: src });
		await wait(1500);
		const hop = await p.evaluate(() => ({
			v: window.SlimeBeep && window.SlimeBeep.version,
			buttons: document.querySelectorAll('#sb-toggle').length,
		}));
		check(
			hop.v === `${a1}.${b1}.${c1 + 1}` && hop.buttons === 1,
			`an old copy hands over to the newer one on Pages, which runs once (${hop.v}, ${hop.buttons} button)`,
		);
		// Loaded from Pages itself (FUSAM, the bookmarklet): it starts straight away and fetches no code.
		pagesBody = src;
		const asked = [];
		const note = (r) => {
			if (/slimebeep\.js\?t=/.test(r.url())) {
				asked.push(r.url());
			}
		};
		p.on('request', note);
		await p.reload();
		await p.evaluate(stub);
		await p.evaluate(() => makeLog());
		await p.addScriptTag({ url: 'https://proudkiller0015.github.io/slimebeep/slimebeep.js?v=1' });
		await wait(1500);
		p.off('request', note);
		check(
			asked.length === 0 && !!(await p.$('#sb-toggle')) && (await p.evaluate(() => !window.SlimeBeepHopped)),
			`loaded from Pages, it starts without fetching its code again (${asked.length} fetches)`,
		);
		pagesBody = null;
		await p.reload();
		await p.evaluate(stub);
		await p.evaluate(() => makeLog());
		await p.addScriptTag({ content: src });
		await wait(800);
		await p.click('#sb-toggle');
		await wait(200);
	}

	// ---- Profile pictures: real image data only, from SlimeBeep friends, in pieces.
	const pic = await p.evaluate(() => {
		const c = document.createElement('canvas');
		c.width = c.height = 48;
		const x = c.getContext('2d');
		x.fillStyle = '#3c9';
		x.fillRect(0, 0, 48, 48);
		return c.toDataURL('image/webp', 0.8);
	});
	await p.evaluate(() => {
		hidden.length = 0;
	});
	await hide(11, 'Ann', { sb: 1, pong: 1, pv: 'annpic0001' });
	await wait(500);
	check(
		await p.evaluate(() => hidden.some((h) => h.MemberNumber === 11 && JSON.parse(h.Message).pfreq === 1)),
		'a friend with a new picture gets asked for it',
	);
	const chunks = [];
	for (let i = 0; i < pic.length; i += 700) {
		chunks.push(pic.slice(i, i + 700));
	}
	for (let i = 0; i < chunks.length; i++) {
		await hide(11, 'Ann', { sb: 1, pf: { v: 'annpic0001', i, n: chunks.length, d: chunks[i] } });
	}
	// Things that are not pictures, from Cat: an SVG (can carry script), a javascript: link, a web address.
	for (const bad of [
		'data:image/svg+xml;base64,PHN2Zz48c2NyaXB0PmFsZXJ0KDEpPC9zY3JpcHQ+PC9zdmc+',
		'javascript:alert(1)',
		'https://evil.example/track.png',
	]) {
		await hide(13, 'Cat', { sb: 1, pf: { v: 'catpic0001', i: 0, n: 1, d: bad } });
	}
	await wait(300);
	const pics = await p.evaluate(() => JSON.parse(localStorage.getItem('slimebeep.pfps') || '{}'));
	check(pics[11] && pics[11].data === pic, "Ann's picture arrives in pieces and is kept");
	check(!pics[13], 'an SVG, a javascript: link or a web address is never taken as a picture');
	await p.click('[data-tab=friends]');
	await wait(200);
	check(
		await p.$$eval('#sb-body img.sb-pic', (e) => e.length === 1 && e[0].src.startsWith('data:image/webp')),
		"Ann's picture shows in place of her initials",
	);
	await shot('pfp');
	// Mine: Cat asks, and gets it in pieces.
	await p.evaluate((d) => {
		const o = JSON.parse(localStorage.getItem('slimebeep.options'));
		o.pfp = { v: 'mypic00001', data: d };
		localStorage.setItem('slimebeep.options', JSON.stringify(o));
	}, pic);
	await p.reload();
	await p.evaluate(stub);
	await p.addScriptTag({ content: src });
	await wait(1200);
	await p.evaluate(() => {
		hidden.length = 0;
	});
	await hide(13, 'Cat', { sb: 1, pfreq: 1 });
	await wait(300 + chunks.length * 300);
	const mine = await p.evaluate(() =>
		hidden
			.map((h) => JSON.parse(h.Message))
			.filter((m) => m.pf)
			.sort((a, b) => a.pf.i - b.pf.i)
			.map((m) => m.pf.d)
			.join(''),
	);
	check(mine === pic, 'a SlimeBeep friend who asks gets my picture');
	check(
		await p.evaluate(() => hidden.every((h) => JSON.parse(h.Message).pv === 'mypic00001')),
		'and every hidden beep says which picture I have',
	);
	// Choosing one: the file picker, a big PNG in, a small square picture out.
	await p.click('#sb-toggle');
	await wait(200);
	await p.click('#sb-gear');
	await wait(150);
	const [chooser] = await Promise.all([p.waitForFileChooser(), p.click('#sb-o-pic')]);
	await chooser.accept([`${__dirname}/icon-256.png`]);
	await wait(800);
	// The cropper: place it in the circle, then Save.
	check(!!(await p.$('#sb-crop canvas')), 'choosing a picture opens the circle to place it in');
	check(
		await p.evaluate(() => {
			const c = document.querySelector('#sb-crop canvas').getBoundingClientRect(),
				r = document.querySelector('#sb-crop .sb-crop-ring').getBoundingClientRect();
			return Math.abs(c.left - r.left - 3) < 2 && Math.abs(c.top - r.top - 3) < 2 && Math.round(c.width) === 200;
		}),
		'the picture sits exactly in the circle, even with the game styling every canvas',
	);
	check(
		await p.evaluate(() => {
			const c = document.getElementById('sb-crop').getBoundingClientRect(),
				pn = document.getElementById('sb-panel').getBoundingClientRect();
			return document.getElementById('sb-crop').parentElement.id === 'sb-panel' && c.width <= pn.width + 1 && c.height <= pn.height + 1;
		}),
		'and it stays inside the SlimeBeep panel, not over the game',
	);
	const before = await p.evaluate(() => JSON.parse(localStorage.getItem('slimebeep.options')).pfp.v);
	const ring = await (await p.$('#sb-crop canvas')).boundingBox();
	await p.evaluate(() => {
		const r = document.querySelector('#sb-crop input');
		r.value = '2';
		r.dispatchEvent(new Event('input'));
	});
	await p.mouse.move(ring.x + 120, ring.y + 120);
	await p.mouse.down();
	await p.mouse.move(ring.x + 160, ring.y + 100, { steps: 4 });
	await p.mouse.up();
	await shot('cropper');
	await p.click('#sb-crop [data-act=save]');
	await wait(300);
	check(
		!(await p.$('#sb-crop')) && (await p.evaluate((v) => JSON.parse(localStorage.getItem('slimebeep.options')).pfp.v !== v, before)),
		'zooming, dragging and Save make it the picture',
	);
	check(await p.$eval('#sb-me', (e) => !!e.querySelector('img.sb-pic')), 'my own picture shows in the SlimeBeep header');
	check(!!(await p.$('#sb-o-fit')), 'and an Adjust button can place it again');
	await p.evaluate(() => {
		const i = document.querySelector('.sb-opts img.sb-pic');
		i.click();
	});
	await wait(150);
	check(!!(await p.$('#sb-zoom img')), 'clicking a picture shows it big');
	await p.click('#sb-zoom');
	check(!(await p.$('#sb-zoom')), 'and a click closes it');
	await p.click('#sb-o-fit');
	await wait(300);
	check(!!(await p.$('#sb-crop canvas')), 'Adjust opens the circle again');
	await p.keyboard.press('Escape');
	await wait(100);
	check(!(await p.$('#sb-crop')), 'Escape closes the picture window');
	await p.click('#sb-o-fit');
	await wait(300);
	await p.click('#sb-crop .sb-crop-x');
	check(!(await p.$('#sb-crop')), 'and so does its ✕');
	const chosen = await p.evaluate(() => JSON.parse(localStorage.getItem('slimebeep.options')).pfp);
	check(
		chosen && chosen.v !== 'mypic00001' && /^data:image\/(webp|jpeg);base64,/.test(chosen.data) && chosen.data.length <= 12000,
		`choosing a picture shrinks it to send (${chosen && chosen.data.length} characters)`,
	);
	check(
		(await p.evaluate(
			(d) =>
				new Promise((res) => {
					const i = new Image();
					i.onload = () => res(i.naturalWidth);
					i.src = d;
				}),
			chosen.data,
		)) === 128,
		'at 128×128, sharp enough to zoom on',
	);
	await shot('mypic');
	await p.click('#sb-gear');

	// ---- 🐞 Bug report: the player's words plus SlimeBeep's own details, out to GitHub, the clipboard or a beep.
	await p.evaluate(() => {
		window.GameVersion = 'R132';
		window.opened = [];
		window.open = (u) => {
			opened.push(u);
			return null;
		};
		// Something that breaks inside SlimeBeep: caught, and remembered for the report.
		fire('AccountBeep', {
			get MemberNumber() {
				throw new Error('boom from a weird beep');
			},
		});
	});
	await p.click('#sb-back').catch(() => {});
	await p.click('[data-tab=bug]');
	await wait(150);
	await p.click('#sb-bug-github');
	check(/Write what happened first/.test(await p.$eval('#sb-bug-status', (e) => e.textContent)), 'an empty report is not sent');
	await p.type('#sb-bug-what', 'The slime vanished after a relog');
	await p.type('#sb-bug-how', 'Logging back in');
	const det = await p.$eval('#sb-bug-details', (e) => e.textContent);
	check(
		/SlimeBeep \d+\.\d+\.\d+/.test(det) && /Game: R132/.test(det) && /boom from a weird beep/.test(det) && /Reported by: #1/.test(det),
		'the report adds version, game version, member number and the error SlimeBeep caught',
	);
	check(!/\bAnn\b|\bCat\b|\bBea\b|hiii|Squad/.test(det), "and nothing about anyone else's chats");
	await p.click('#sb-bug-github');
	const url = await p.evaluate(() => opened[0] || '');
	check(
		url.startsWith('https://github.com/Proudkiller0015/slimebeep/issues/new?title=Bug%3A%20The%20slime%20vanished') &&
			decodeURIComponent(url).includes('Logging back in'),
		'Open on GitHub fills in a new issue',
	);
	await p.click('#sb-bug-num');
	check(!/Reported by/.test(await p.$eval('#sb-bug-details', (e) => e.textContent)), 'the member number can be left out');
	await p.evaluate(() => {
		beeps.length = 0;
	});
	await p.click('#sb-bug-beep');
	const bugBeep = await p.evaluate(() => beeps[0]);
	check(
		bugBeep && bugBeep[0] === 255659 && /SlimeBeep bug report/.test(bugBeep[1]) && bugBeep[1].length <= 1000,
		'Beep it to her sends one beep to SlimeQueenSamantha',
	);
	await shot('bug');

	// ---- Actions like *giggles*: italics in the bubble, a soft bubble when the whole beep is one, still plain text.
	{
		await p.evaluate(() => {
			FriendListBeepLog.push({
				MemberNumber: 11,
				MemberName: 'Ann',
				Sent: false,
				Read: true,
				Time: new Date(),
				Message: 'hi *giggles* there',
			});
			FriendListBeepLog.push({ MemberNumber: 11, MemberName: 'Ann', Sent: false, Read: true, Time: new Date(), Message: '*waves at you*' });
			FriendListBeepLog.push({
				MemberNumber: 11,
				MemberName: 'Ann',
				Sent: false,
				Read: true,
				Time: new Date(),
				Message: '*<img src=x onerror=window.pwned2=1>*',
			});
		});
		await wait(1200);
		await p.evaluate(() => SlimeBeep.api.openChat(11));
		await wait(250);
		const r = await p.evaluate(() => {
			const bubbles = [...document.querySelectorAll('#sb-msgs .sb-b')];
			const find = (t) => bubbles.find((b) => b.textContent.includes(t));
			return {
				inline: !!find('hi *giggles* there')?.querySelector('i.sb-emote'),
				whole: !!find('*waves at you*')?.classList.contains('sb-act'),
				safe: !window.pwned2 && !document.querySelector('#sb-msgs img'),
			};
		});
		check(r.inline && r.whole, '*giggles* shows in italics, and a beep that is only an action gets a soft bubble');
		check(r.safe, 'and it is still plain text (HTML inside stars does nothing)');
		await tap('#sb-back');
	}

	// ---- 📍 Join: a beep from a room has a Join button that leaves your room and joins theirs.
	{
		await p.evaluate(() => {
			window.joins = [];
			window.left = 0;
			window.screens = [];
			window.ChatRoomCanLeave = () => true;
			window.ChatRoomLeave = () => {
				left++;
				window.ChatRoomData = null;
			};
			window.CommonSetScreen = (a, b) => screens.push(`${a}/${b}`);
			window.CurrentScreen = 'ChatRoom';
			window.ServerRoomJoin = async (n) => {
				joins.push(n);
				return n === 'Full Room' ? { value: null, error: { name: 'RoomFull' } } : { value: n, error: null };
			};
			FriendListBeepLog.push({
				MemberNumber: 11,
				MemberName: 'Ann',
				Sent: false,
				Read: true,
				Time: new Date(),
				Message: 'come play!',
				ChatRoomName: 'Pokepark',
			});
		});
		await wait(1200);
		await p.evaluate(() => SlimeBeep.api.openChat(11));
		await wait(250);
		const btn = await p.$('.sb-joinroom[data-room="Pokepark"]');
		check(!!btn, 'a beep from a room has a Join button');
		await btn.click();
		await wait(300);
		const r = await p.evaluate(() => ({ joins, left, screens }));
		check(
			r.left === 1 && r.screens[0] === 'Online/ChatSearch' && r.joins[0] === 'Pokepark',
			`Join leaves my room and asks to join theirs (${JSON.stringify(r)})`,
		);
		await p.evaluate(() => {
			window.ChatRoomData = { Name: 'Velvet Lounge' };
			delete window.ChatRoomCanLeave;
			delete window.ChatRoomLeave;
			delete window.CommonSetScreen;
			delete window.ServerRoomJoin;
			delete window.CurrentScreen;
		});
		await tap('#sb-back');
	}

	// ---- Typing in the game's chat while a SlimeBeep chat is open: redraws never take the cursor.
	{
		await p.evaluate(() => {
			SlimeBeep.api.openChat(11);
		});
		await wait(250);
		await p.evaluate(() => {
			const g = document.createElement('textarea');
			g.id = 'InputChat';
			document.body.appendChild(g);
		});
		await p.click('#InputChat');
		await p.type('#InputChat', 'hello room');
		await p.evaluate(() => {
			FriendListBeepLog.push({ MemberNumber: 11, MemberName: 'Ann', Sent: false, Read: false, Time: new Date(), Message: 'pssst' });
			fire('AccountBeep', { MemberNumber: 11, MemberName: 'Ann', BeepType: '', Message: 'pssst' });
			fire('AccountQueryResult', {
				Query: 'OnlineFriends',
				Result: [{ MemberNumber: 11, MemberName: 'Ann', ChatRoomName: 'Pokepark', Type: 'Friend' }],
			});
		});
		await wait(1500);
		await p.keyboard.type(' still here');
		const r = await p.evaluate(() => ({
			active: document.activeElement.id,
			game: document.getElementById('InputChat').value,
			mine: document.getElementById('sb-text') ? document.getElementById('sb-text').value : null,
		}));
		check(
			r.active === 'InputChat' && r.game === 'hello room still here' && !r.mine,
			`typing in the game's chat stays there while SlimeBeep redraws (${JSON.stringify(r)})`,
		);
		await p.evaluate(() => document.getElementById('InputChat').remove());
		await tap('#sb-back');
	}

	// ---- 😊 Emoji and commands in a chat box.
	{
		await p.evaluate(() => {
			beeps.length = 0;
			SlimeBeep.api.openChat(11);
		});
		await wait(250);
		await p.type('#sb-text', 'hi ');
		await p.click('#sb-emo');
		await wait(100);
		check(!!(await p.$('#sb-emoji .sb-emo-grid button')), '😊 opens the emoji picker');
		await p.click('#sb-emoji [data-emo="🥰"]');
		await p.click('#sb-emoji [data-etab="🐱"]');
		await p.click('#sb-emoji [data-emo="🐱"]');
		check((await p.$eval('#sb-text', (e) => e.value)) === 'hi 🥰🐱', 'emoji go in where the cursor is');
		await p.click('#sb-emoji [data-eclose]');
		await p.click('#sb-emo');
		await wait(100);
		check(
			(await p.$$eval('#sb-emoji [data-etab]', (e) => e[0].dataset.etab)) === '🕘' &&
				(await p.$$eval('#sb-emoji .sb-emo-grid button', (e) =>
					e
						.map((x) => x.dataset.emo)
						.slice(0, 2)
						.join(),
				)) === '🐱,🥰',
			'the ones used last come first under 🕘',
		);
		await p.click('#sb-text');
		await p.keyboard.press('Enter');
		await wait(200);
		check(!(await p.$('#sb-emoji')), 'sending closes the picker');
		const typeSend = async (txt) => {
			await p.click('#sb-text');
			await p.type('#sb-text', txt);
			await p.keyboard.press('Enter');
			await wait(150);
		};
		await typeSend('/me waves happily');
		await typeSend('/roll 20');
		await typeSend('/shrug oh well');
		await typeSend('/nope');
		await typeSend('//slash');
		const sent = await p.evaluate(() => beeps.map((b) => b[1]));
		check(
			sent[0] === 'hi 🥰🐱' &&
				sent[1] === '*waves happily*' &&
				/^\*rolls a d20: ([1-9]|1\d|20)\* 🎲$/.test(sent[2]) &&
				sent[3] === 'oh well ¯\\_(ツ)_/¯' &&
				sent[4] === '/slash' &&
				sent.length === 5,
			`/me, /roll, /shrug work, a typo'd command is never sent, //text sends /text (${JSON.stringify(sent)})`,
		);
		await typeSend('/help');
		check(
			/\/me/.test(await p.$eval('#sb-ask', (e) => e.textContent)) && (await p.evaluate(() => beeps.length)) === 5,
			'/help shows the commands and sends nothing',
		);
		await shot('help');
		await p.click('#sb-ask [data-act=keep]');
		await tap('#sb-back');
	}

	// ---- Offline beeps: to a friend who's offline, a beep waits and goes out when they come online.
	{
		await p.evaluate(() => {
			beeps.length = 0;
			SlimeBeep.api.openChat(14);
		});
		await wait(250);
		check(/offline/.test(await p.$eval('#sb-text', (e) => e.placeholder)), 'the chat with an offline friend says the beep will wait');
		await p.type('#sb-text', 'see you later');
		await p.keyboard.press('Enter');
		await p.type('#sb-text', 'oops, never mind');
		await p.keyboard.press('Enter');
		await wait(300);
		check(
			(await p.evaluate(() => beeps.length)) === 0 && (await p.$$eval('.sb-b.sb-wait', (e) => e.length)) === 2,
			'nothing is sent; both wait in the chat',
		);
		await p.evaluate(() => [...document.querySelectorAll('[data-cancel]')][1].click());
		await wait(200);
		check(
			(await p.$$eval('.sb-b.sb-wait', (e) => e.map((x) => x.firstChild.textContent).join())) === 'see you later',
			'a waiting beep can be cancelled',
		);
		// Still waiting after a reload.
		await p.reload();
		await p.evaluate(stub);
		await p.evaluate(() => makeLog());
		await p.addScriptTag({ content: src });
		await wait(1500);
		await p.evaluate(() => {
			document.getElementById('sb-toggle').click();
		});
		await wait(300);
		await p.evaluate(() => SlimeBeep.api.openChat(14));
		await wait(250);
		check((await p.$$eval('.sb-b.sb-wait', (e) => e.length)) === 1, 'it is still waiting after a reload');
		// Dee comes online.
		await p.evaluate(() =>
			fire('AccountQueryResult', {
				Query: 'OnlineFriends',
				Result: [
					{ MemberNumber: 11, MemberName: 'Ann', ChatRoomName: 'Pokepark', Type: 'Friend' },
					{ MemberNumber: 14, MemberName: 'Dee', Type: 'Friend' },
				],
			}),
		);
		await wait(600);
		const sent = await p.evaluate(() => beeps.slice());
		check(
			sent.length === 1 && sent[0][0] === 14 && sent[0][1] === 'see you later',
			`once Dee is online, it goes out (${JSON.stringify(sent)})`,
		);
		check(
			(await p.$$eval('.sb-b.sb-wait', (e) => e.length)) === 0 &&
				(await p.evaluate(() => JSON.parse(localStorage.getItem('slimebeep.waiting.1')).length === 0)),
			'and it is no longer waiting',
		);
		await tap('#sb-back');
	}

	// ---- 📬 Mailboxes: a beep for an offline SlimeBeep friend is left on the relay; theirs come in the same way.
	{
		/** A mailbox connection from this test, signed by `who` as member `as`. */
		const mailConnect = async (owner, who, as = who.member) => {
			const ws = new WebSocket(`${RELAY_URL}/ws?m=${owner}`, { headers: { Origin: 'https://www.bondageprojects.elementfx.com' } });
			const c = { ws, got: [] };
			ws.onmessage = (e) => c.got.push(JSON.parse(e.data));
			await waitFor(() => c.got.length > 0, 4000);
			const sig = await crypto.subtle.sign(
				{ name: 'ECDSA', hash: 'SHA-256' },
				who.k.privateKey,
				new TextEncoder().encode(`${c.got[0].nonce}|mbox:${owner}|${as}`),
			);
			ws.send(JSON.stringify({ t: 'auth', member: as, name: who.name, pub: who.pub, sig: Buffer.from(sig).toString('base64url') }));
			await waitFor(() => c.got.length > 1, 4000);
			c.last = (t) => [...c.got].reverse().find((x) => x.t === t);
			return c;
		};
		const cat = await relayUser(13, 'Cat'),
			eve = await relayUser(66, 'Eve');
		// Cat has SlimeBeep (her key start came with a hidden beep) and is offline.
		await hide(13, 'Cat', { sb: 1, pong: 1, kf: cat.pub.x.slice(0, 16) });
		await p.evaluate(() => {
			beeps.length = 0;
			fire('AccountQueryResult', { Query: 'OnlineFriends', Result: [{ MemberNumber: 11, MemberName: 'Ann', Type: 'Friend' }] });
		});
		await wait(300);
		await p.evaluate(() => SlimeBeep.api.openChat(13));
		await wait(250);
		await p.type('#sb-text', 'left for you');
		await p.keyboard.press('Enter');
		const mailed = await waitFor(
			() =>
				p.evaluate(() =>
					[...document.querySelectorAll('.sb-b.me')].some((b) => /left for you/.test(b.textContent) && /📬/.test(b.textContent)),
				),
			8000,
		);
		check(
			mailed &&
				(await p.evaluate(
					() =>
						beeps.length === 0 &&
						!document.querySelector('.sb-b.sb-wait') &&
						JSON.parse(localStorage.getItem('slimebeep.waiting.1')).length === 0,
				)),
			'a beep for an offline SlimeBeep friend is left in their mailbox (📬), not kept waiting here and no game beep',
		);
		const myKf = await p.evaluate(() => JSON.parse(localStorage.getItem('slimebeep.key.1')).x.slice(0, 16));
		const catBox = await mailConnect(13, cat);
		const inbox = catBox.last('mail') ? catBox.last('mail').list : [];
		check(
			inbox.length === 1 && inbox[0].text === 'left for you' && inbox[0].from === 1 && inbox[0].fromKf === myKf,
			`Cat's SlimeBeep finds it in her mailbox (${JSON.stringify(inbox)})`,
		);
		catBox.send = (x) => catBox.ws.send(JSON.stringify(x));
		catBox.send({ t: 'ack', ids: inbox.map((m) => m.id) });
		await tap('#sb-back');
		// Logging in again: SlimeBeep checks the mailbox. While the page is reloading (no SlimeBeep yet),
		// Cat leaves one for me and Eve, pretending to be Cat (signing as #13 with her own key), leaves another.
		await p.reload();
		await p.evaluate(stub);
		await p.evaluate(() => makeLog());
		const toMe = await mailConnect(1, cat);
		toMe.ws.send(JSON.stringify({ t: 'put', kf: myKf, text: 'hello from your mailbox', ref: 'm1' }));
		const fake = await mailConnect(1, eve, 13);
		fake.ws.send(JSON.stringify({ t: 'put', kf: myKf, text: 'I am totally Cat', ref: 'm2' }));
		await wait(500);
		check(toMe.last('ok') && fake.last('ok'), 'both are left in my mailbox');
		for (const c of [catBox, toMe, fake]) {
			c.ws.close();
		}
		await p.addScriptTag({ content: src });
		const came = await waitFor(
			() => p.evaluate(() => [...document.querySelectorAll('.sb-card')].some((x) => /hello from your mailbox/.test(x.textContent))),
			12000,
		);
		check(came, "after logging in, Cat's mailbox beep pops a card");
		if (await p.evaluate(() => document.getElementById('sb-panel').style.display !== 'flex')) {
			await p.click('#sb-toggle');
		}
		await p.evaluate(() => SlimeBeep.api.openChat(13));
		await wait(300);
		const thread = await p.$eval('#sb-msgs', (e) => e.textContent);
		check(
			/hello from your mailbox/.test(thread) && /📬/.test(thread) && !/totally Cat/.test(thread),
			"it is in Cat's chat with 📬, and Eve's fake (signed with another key than Cat's) is thrown away",
		);
		await tap('#sb-back');
	}

	// ---- 🔕 Mute one chat: no sound for it (cards still come); others still ding.
	{
		await p.evaluate(() => {
			window.dings = 0;
			const real = AudioContext.prototype.createOscillator;
			AudioContext.prototype.createOscillator = function (...a) {
				window.dings++;
				return real.apply(this, a);
			};
			SlimeBeep.api.openChat(12);
		});
		await wait(250);
		await p.click('#sb-mute');
		await wait(200);
		check((await p.$eval('#sb-mute', (e) => e.textContent)) === '🔕', 'the 🔔 in a chat mutes it (🔕)');
		await tap('#sb-back');
		const beepFrom = (n, name, text) =>
			p.evaluate(
				(a, b, c) =>
					FriendListBeepLog.push({
						MemberNumber: a,
						MemberName: b,
						Sent: false,
						Read: false,
						Time: new Date(),
						Message: c,
						Id: `mute${Math.random()}`,
					}),
				n,
				name,
				text,
			);
		await beepFrom(12, 'Bea', 'shh, muted');
		await wait(1800);
		const muted = await p.evaluate(() => ({
			dings: window.dings,
			card: [...document.querySelectorAll('.sb-card')].some((x) => /shh, muted/.test(x.textContent)),
		}));
		check(muted.dings === 0 && muted.card, `a beep from a muted chat makes no sound but still pops its card (${JSON.stringify(muted)})`);
		await beepFrom(11, 'Ann', 'not muted');
		await wait(1800);
		check((await p.evaluate(() => window.dings)) > 0, 'a beep from anyone else still dings');
		await p.evaluate(() => SlimeBeep.api.openChat(12));
		await wait(250);
		await p.click('#sb-mute');
		await wait(200);
		check(
			(await p.$eval('#sb-mute', (e) => e.textContent)) === '🔔' &&
				(await p.evaluate(() => JSON.parse(localStorage.getItem('slimebeep.options')).muted.length === 0)),
			'and pressing it again brings the sound back',
		);
		await tap('#sb-back');
	}

	// Drag; the spot and the picks survive a reload.
	const r = await p.$eval('#sb-toggle', (e) => {
		const x = e.getBoundingClientRect();
		return { x: x.x + 20, y: x.y + 20 };
	});
	await p.mouse.move(r.x, r.y);
	await p.mouse.down();
	await p.mouse.move(300, 200, { steps: 8 });
	await p.mouse.up();
	const at = await p.$eval('#sb-toggle', (e) => [e.style.left, e.style.top]);
	check(Math.abs(parseFloat(at[0]) - 280) < 4 && Math.abs(parseFloat(at[1]) - 180) < 4, `dragged to ${at}`);
	const inside = await p.$eval('#sb-panel', (e) => {
		const x = e.getBoundingClientRect();
		return x.left >= 0 && x.top >= 0 && x.right <= innerWidth && x.bottom <= innerHeight;
	});
	check(inside, 'the panel stays inside the window');
	newsBody = JSON.stringify([
		{ id: 'old', text: 'old news' },
		{ id: 'n1', title: '📢 Hi', text: 'SlimeBeep can now keep your beeps!' },
	]);
	await p.reload();
	await p.evaluate(stub);
	// A new login: the game's log starts empty again.
	await p.evaluate(() => {
		FriendListBeepLog.length = 0;
	});
	await p.addScriptTag({ content: src });
	await wait(1500);
	const newsCards = await p.$$eval('.sb-card.news', (e) => e.map((x) => x.textContent));
	await shot('news');
	check(newsCards.length === 1 && /keep your beeps/.test(newsCards[0]), `a first install sees only the newest news item (${newsCards})`);
	check((await p.$$eval('.sb-card:not(.news)', (e) => e.length)) === 0, 'beeps from before the reload pop no cards');
	check(
		JSON.stringify(await p.$eval('#sb-toggle', (e) => [e.style.left, e.style.top])) === JSON.stringify(at),
		'the spot survives a reload',
	);
	await p.click('#sb-toggle');
	await wait(200);
	await p.click('[data-tab=wave]');
	await wait(100);
	check(
		JSON.stringify(await p.$$eval('#sb-body label input:checked:not(#sb-groom)', (e) => e.map((x) => x.value))) === '["11","13"]',
		'and so do the picks',
	);
	await p.click('[data-tab=chats]');
	await wait(200);
	const kept = await p.$$eval('#sb-body .sb-row .sb-name', (e) => e.map((x) => x.textContent));
	check(
		['Ann', 'Bea', 'Cat', 'Dee'].every((n) => kept.some((t) => t.includes(n))) && !kept.some((t) => /Squad|Owls/.test(t)),
		`chats survive a relog, the EBC one too, and group chats are not among them (${kept})`,
	);
	await p.click('[data-tab=groups]');
	await wait(150);
	const keptGroups = await p.$$eval('#sb-body .sb-row .sb-name', (e) => e.map((x) => x.textContent));
	check(
		['Slime Squad', 'Night Owls'].every((n) => keptGroups.some((t) => t.includes(n))),
		`group chats survive a relog in 👥 Groups (${keptGroups})`,
	);
	// 🚪 in a group: a member can only leave; the owner can also delete it for everyone.
	{
		const openGroup = async (name) => {
			await p.evaluate((n) => [...document.querySelectorAll('#sb-body .sb-row')].find((r) => r.textContent.includes(n)).click(), name);
			await wait(300);
		};
		await openGroup('Night Owls');
		await p.click('#sb-leave');
		await wait(150);
		const member = await p.evaluate(() => ({
			leave: !!document.querySelector('#sb-ask [data-act=leave]'),
			del: !!document.querySelector('#sb-ask [data-act=delete]'),
		}));
		check(member.leave && !member.del, `in someone else's group, 🚪 offers Leave but not Delete (${JSON.stringify(member)})`);
		await p.click('#sb-ask [data-act=keep]');
		check(!(await p.$('#sb-ask')) && /Night Owls/.test(await p.$eval('.sb-thead', (e) => e.textContent)), 'Cancel changes nothing');
		await tap('#sb-back');
		await openGroup('Slime Squad');
		await p.click('#sb-leave');
		await wait(150);
		check(
			!!(await p.$('#sb-ask [data-act=delete]')) && /for everyone/.test(await p.$eval('#sb-ask', (e) => e.textContent)),
			'my own group: 🚪 also offers Delete, with a warning',
		);
		await p.click('#sb-ask [data-act=delete]');
		await wait(1200);
		await p.click('[data-tab=groups]');
		await wait(150);
		const after = await p.$$eval('#sb-body .sb-row .sb-name', (e) => e.map((x) => x.textContent));
		check(
			!after.some((t) => t.includes('Slime Squad')) && after.some((t) => t.includes('Night Owls')),
			`Delete removes the group (${after})`,
		);
	}
	await p.reload();
	await p.evaluate(stub);
	await p.evaluate(() => makeLog());
	await p.addScriptTag({ content: src });
	await wait(4500);
	check((await p.$$eval('.sb-card.news', (e) => e.length)) === 0, 'news shows once');
	check((await p.evaluate(() => local.length)) === 0, 'and the room note does not repeat for the same version');
	// A new version is pushed: one note, with its news item.
	await p.evaluate(() => {
		const o = JSON.parse(localStorage.getItem('slimebeep.options'));
		o.lastVersion = '0.0.1';
		localStorage.setItem('slimebeep.options', JSON.stringify(o));
	});
	const ver = src.match(/const VERSION = '([^']+)'/)[1];
	newsBody = JSON.stringify([{ id: ver, text: 'Shiny new things.' }]);
	await p.reload();
	await p.evaluate(stub);
	// The first try is lost (the game drops it), so SlimeBeep tries again.
	await p.evaluate(() => {
		makeLog();
		const real = ChatRoomSendLocal;
		let n = 0;
		window.ChatRoomSendLocal = (c) => {
			if (n++ === 0) {
				return;
			}
			real(c);
		};
	});
	await p.addScriptTag({ content: src });
	await wait(16000);
	const upd = await p.evaluate(() => local);
	check(
		upd.length === 1 && upd[0].includes(`updated to v${ver}`) && upd[0].includes('Shiny new things.'),
		`after an update, one room note with what's new, even when the first try was lost`,
	);
	await shot('reload');

	// ---- A plain http:// page (no crypto.subtle): group chats and mailboxes say to use the https address and
	// never connect; beeps work as usual.
	{
		const ann = await relayUser(11, 'Ann');
		const gid = `http${Date.now().toString(36)}`;
		const host = await relayJoin(gid, ann, { create: { name: 'Plain HTTP', open: true } });
		host.send({ t: 'invite' });
		await wait(400);
		const code = `SB-${gid}-${host.last('invite').code}`;
		await p.reload();
		await p.evaluate(stub);
		await p.evaluate(() => {
			Object.defineProperty(Crypto.prototype, 'subtle', { get: () => undefined, configurable: true });
			window.relaySockets = 0;
			const Real = window.WebSocket;
			window.WebSocket = function (...a) {
				window.relaySockets++;
				return new Real(...a);
			};
			makeLog();
		});
		await p.addScriptTag({ content: src });
		await wait(6500);
		if (await p.evaluate(() => document.getElementById('sb-panel').style.display !== 'flex')) {
			await p.click('#sb-toggle');
		}
		await wait(200);
		await p.click('[data-tab=groups]');
		await wait(200);
		const note = await p.evaluate(() => {
			const a = [...document.querySelectorAll('#sb-body a')].find((x) => /https/.test(x.textContent));
			return a ? a.getAttribute('href') : null;
		});
		check(!!note && note.startsWith('https:'), `the Groups tab links to the https address (${note})`);
		await p.type('#sb-join-code', code);
		await p.click('#sb-join');
		await wait(1500);
		const r = await p.evaluate(
			(g) => ({
				joined: !!SlimeBeep.api.group(g),
				card: [...document.querySelectorAll('.sb-card')].some((c) => /secure \(https\)/.test(c.textContent)),
				sockets: window.relaySockets,
			}),
			gid,
		);
		check(
			!r.joined && r.card && r.sockets === 0,
			`joining says to open the https address and nothing connects to the relay (${JSON.stringify(r)})`,
		);
		await p.evaluate(() => {
			beeps.length = 0;
			fire('AccountQueryResult', { Query: 'OnlineFriends', Result: [{ MemberNumber: 11, MemberName: 'Ann', Type: 'Friend' }] });
			SlimeBeep.api.openChat(11);
		});
		await wait(300);
		await p.type('#sb-text', 'still beeping');
		await p.keyboard.press('Enter');
		await wait(500);
		check(await p.evaluate(() => beeps.some((b) => b[0] === 11 && b[1] === 'still beeping')), 'beeps work as usual');
		host.ws.close();
	}
	await b.close();
	console.log(failed ? `\n${failed} FAILED` : '\nall passed');
	process.exit(failed ? 1 : 0);
})();

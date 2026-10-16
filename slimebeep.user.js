// ==UserScript==
// @name         SlimeBeep
// @namespace    https://github.com/Proudkiller0015/slimebeep
// @version      2.0.0
// @description  A simple beep tool: send one beep to the online friends you pick in Bondage Club. Always runs the newest version.
// @icon         https://raw.githubusercontent.com/Proudkiller0015/slimebeep/main/icon-64.png
// @homepageURL  https://github.com/Proudkiller0015/slimebeep
// @downloadURL  https://raw.githubusercontent.com/Proudkiller0015/slimebeep/main/slimebeep.user.js
// @updateURL    https://raw.githubusercontent.com/Proudkiller0015/slimebeep/main/slimebeep.user.js
// @match        https://www.bondageprojects.elementfx.com/*
// @match        https://bondageprojects.elementfx.com/*
// @match        https://bondageprojects.com/*
// @match        https://www.bondageprojects.com/*
// @match        https://www.bondage-europe.com/*
// @match        http://localhost:8130/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

/*
 * The SlimeBeep loader. It never needs updating: on every game load it fetches the
 * newest SlimeBeep from GitHub (slimebeep.js) and runs it, so an update reaches
 * everybody the next time they reload or log in.
 */
(function () {
	'use strict';

	const SOURCE = 'https://raw.githubusercontent.com/Proudkiller0015/slimebeep/main/slimebeep.js';
	// GitHub may hand out a copy up to five minutes old, so an update lands within about five minutes.
	fetch(`${SOURCE}?t=${Math.floor(Date.now() / 60000)}`, { cache: 'no-store' })
		.then((res) => {
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return res.text();
		})
		.then((code) => {
			const script = document.createElement('script');
			script.textContent = `${code}
//# sourceURL=slimebeep.js`;
			document.head.appendChild(script);
			script.remove();
		})
		.catch((err) => console.warn('[SlimeBeep] could not load:', err.message));
})();

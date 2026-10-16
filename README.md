<p align="center"><img src="icon-128.png" alt="SlimeBeep" width="128"></p>

# SlimeBeep

A simple beep tool for [Bondage Club](https://www.bondageprojects.elementfx.com/): pick the online friends you want and send them all the same beep.

## Install

1. Install a userscript manager: [Violentmonkey](https://violentmonkey.github.io/) or [Tampermonkey](https://www.tampermonkey.net/).
2. Click **[Install SlimeBeep](https://raw.githubusercontent.com/Proudkiller0015/slimebeep/main/slimebeep.user.js)** and confirm.
3. Reload Bondage Club and log in.

## Use

- Click the pink slime button at the bottom right.
- Drag the slime anywhere you like; it stays there.
- Write your message (up to 1000 characters).
- **Let them join me** (in a chat room) adds a button to the beep that takes them to your room.
- Tick the online friends you want to beep (or **All** / **None**).
- Press **Send**. Beeps go out one at a time, 1.5 seconds apart.
- **⚙ Options:** the wait between beeps, whether "Let them join me" starts ticked, remembering who you picked, and putting the slime back in its corner.

## Updates

You install once. The installed script is a tiny loader that fetches the newest SlimeBeep from this repository every time the game loads, so any change pushed here reaches everybody on their next reload or relog. The tool itself is [`slimebeep.js`](slimebeep.js); bump `VERSION` in it when you change it (the box shows it next to the name).

<p align="center"><img src="icon-128.png" alt="SlimeBeep" width="128"></p>

# SlimeBeep

A bubble gum beep messenger for [Bondage Club](https://www.bondageprojects.elementfx.com/): chat with each friend, see who's online and where, and send one beep to a group.

## Install

1. Install a userscript manager: [Violentmonkey](https://violentmonkey.github.io/) or [Tampermonkey](https://www.tampermonkey.net/).
2. Click **[Install SlimeBeep](https://raw.githubusercontent.com/Proudkiller0015/slimebeep/main/slimebeep.user.js)** and confirm.
3. Reload Bondage Club and log in.

## Use

Click the pink slime (drag it anywhere you like; it stays there). A pink dot on it counts unread beeps.

- **💬 Chats:** a chat with each person you've beeped with, newest first. Open one to see your beeps as chat bubbles and reply (Enter sends, Shift+Enter is a new line). 📍 adds a button to join you in your current chat room.
- **💖 Friends:** who's online and which room they're in. Search by name, number or room; click someone to beep them.
- **📣 Group:** one beep to every friend you tick (**All** / **None**), sent one at a time.
- **⚙ Options:** pop sound for new beeps, whether 📍 starts on, remembering who you picked, the wait between group beeps, and putting the slime back in its corner.

Every beep you send pops up a "✓ Beep sent" note by the slime.

## Updates

You install once. The installed script is a tiny loader that fetches the newest SlimeBeep from this repository every time the game loads, so any change pushed here reaches everybody on their next reload or relog. The tool itself is [`slimebeep.js`](slimebeep.js); release with `node release.js <x.y.z>`, which puts the same version in the tool (shown in its header) and the loader.

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
- **👥 Group chats:** up to 40 people, all with SlimeBeep (🫧 marks friends who have it; **Find SlimeBeep friends** asks). Start one from 💬 Chats. The owner 👑 and admins ⭐ add and remove people, promote, and rename; turn on **Anyone can invite** to let every member add their friends. Messages stay inside SlimeBeep, the game never shows them, and they reach friends of friends because admins (and whoever invited someone) pass them on.
- **🖼 Profile picture:** pick one in ⚙ (or Settings > Extensions). It's shrunk to a small square and only SlimeBeep friends get it, as image data, never a web link.
- **🌙 Night mode:** the moon in the header (or ⚙) switches to navy with a night blue slime.
- **Settings > Extensions:** SlimeBeep is listed there too, with the same options.
- **⚙ Options:** pop sound for new beeps, whether 📍 starts on, remembering who you picked, the wait between group beeps, and putting the slime back in its corner.

Every beep you send pops up a "✓ Beep sent" note by the slime. A new beep pops a 💌 card (click it to reply), with an optional desktop notification when the game is in the background. Your chats are kept in your browser, per account, so they're still there after you log out (⚙ can turn that off or clear them).

## Updates in the room chat

After an update, a small pink line in the room chat (only you see it) says SlimeBeep was updated, with the `news.json` item whose `id` is that version.

## News

[`news.json`](news.json) holds announcements. Add an item (a new `id`, a `title` and a `text`) and push: every player sees it once, as a card by the slime, on their next reload. Nobody has to update anything.

## Updates

You install once. The installed script is a tiny loader that fetches the newest SlimeBeep from this repository every time the game loads, so any change pushed here reaches everybody on their next reload or relog. The tool itself is [`slimebeep.js`](slimebeep.js); release with `node release.js <x.y.z>`, which sets the version shown in its header. The installed loader never changes, so nobody ever has to reinstall.

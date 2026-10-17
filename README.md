<p align="center"><img src="icon-128.png" alt="SlimeBeep" width="128"></p>

# SlimeBeep

Made by **SlimeQueenSamantha**.

A bubble gum beep messenger for [Bondage Club](https://www.bondageprojects.elementfx.com/): chat with each friend, see who's online and where, and send one beep to a group.

## Install

**Easiest: [the install page](https://proudkiller0015.github.io/slimebeep/install.html)** has every way. Pick one.

- **🧩 FUSAM:** open FUSAM's **Addon Manager** (its button is on the login screen and in the game's Preferences), find **SlimeBeep**, set **Account** (or **Browser**) to **beta** and reload the game.
- **🔖 Bookmark, no extension needed:** drag the SlimeBeep button from the install page onto your bookmarks bar, then click it whenever you're in Bondage Club.
- **🐒 Userscript:** with [Violentmonkey](https://violentmonkey.github.io/) or [Tampermonkey](https://www.tampermonkey.net/), click **[Install SlimeBeep](https://raw.githubusercontent.com/Proudkiller0015/slimebeep/main/slimebeep.user.js)** and confirm. It starts with the game every time.

All of them run the same SlimeBeep and always load its newest version, so there's nothing to update by hand.

## Use

Click the pink slime (drag it anywhere you like; it stays there). A pink dot on it counts unread beeps.

- **💬 Chats:** a chat with each person you've beeped with, newest first. Open one to see your beeps as chat bubbles and reply (Enter sends, Shift+Enter is a new line). 📍 adds a button to join you in your current chat room.
- **💖 Friends:** who's online and which room they're in. Search by name, number or room; click someone to beep them.
- **🌊 WaveBeep:** one beep to every friend you tick (**All** / **None**, or **📍 My room** for just the friends in your room), sent one at a time.
- **👥 Groups:** group chats of up to 40 people with SlimeBeep, **friends or not**. Make one with **New group chat**; invite SlimeBeep friends with one click (🫧 marks who has it) or make an **invite code** for anyone, who pastes it in 👥 Groups. Messages you missed while offline are waiting when you're back. 🟢 shows who's online. The owner 👑 and admins ⭐ add and remove people, promote and rename; **Anyone can invite** lets every member add people. For friends, ✓ means the person in the group has the same key their own SlimeBeep sent you (⚠ if not).
- **🖼 Profile picture:** pick one in ⚙ (or Settings > Extensions). It's shrunk to a small square and only SlimeBeep friends get it, as image data, never a web link.
- **🖼 Profile pictures:** choose one in ⚙, then drag and zoom it to fit the circle (**Adjust** places it again later). Yours shows in SlimeBeep's header; click anyone's picture to see it big.
- **📍 Join:** a beep sent from a chat room has a **Join** button that takes you there.
- **🚪 Leave or delete a group:** the 🚪 at the top of a group chat. Anyone can leave; the owner can also delete the group for everyone.
- **⏻ Quit:** the ⏻ button in SlimeBeep's header removes it until you reload, as if you'd never started it. With the bookmarklet, reload and don't click it; with the userscript, turn it off there to stop it for good.
- **😊 Emoji and commands:** the 😊 by the chat box opens emoji (your last ones first). Commands: `/me waves`, `/shrug`, `/roll 20`, `/flip`, `/help`.
- **✨ Actions:** `*giggles*` shows in italics, and a beep that's only an action gets a soft bubble of its own.
- **📬 Offline beeps:** beep a friend who's offline and, if they have SlimeBeep, it's left in their SlimeBeep mailbox (📬): they get it when they log in, even if you're gone by then. Only their own SlimeBeep can read it. For friends without SlimeBeep (or if the mailbox can't be reached) it waits here instead and goes out the moment they're back online (you need to be online then too); cancel it any time before.
- **🔕 Mute a chat:** the 🔔 at the top of any chat or group chat turns its sound off (its cards still come). Press it again for sound.
- **🔗 Links and codes:** web links in chats can be clicked (they open in a new tab), and a group code gets a **Join** button, in SlimeBeep and in the room chat.
- **🖼 Pictures and GIFs:** a picture link shows the picture under it, and so do Tenor and Giphy links. Pictures from Tenor, Giphy, imgur, Discord, catbox, Reddit and Twitter show straight away; from any other site SlimeBeep asks first (**Show** once, or **Always trust** that site), because loading a picture tells its site who looked. ⚙ can forget the trusted sites.
- **🎵 Music:** 🎵 in SlimeBeep's header opens a small music player you can drag anywhere. Paste a YouTube link or a sound file link (mp3, ogg, m4a, flac, wav… from catbox, file.garden, Discord, Dropbox or any site) and it plays, without opening YouTube; more songs wait in a queue (⏮ ⏭), and the volume is yours. Song links in chats get a **▶ Play** button that plays them for you only. **Listen along:** open a chat and press **Share** in the player; that friend (if they have SlimeBeep) or everyone in the group gets a **Listen along** button, and whoever presses it hears your song in time with you. You control it; they can leave whenever they like. Nothing ever plays unless you press Play or Listen along.
- **⬇ Jump to present:** scrolled up to read older messages, you stay there when new ones come in; the button at the bottom says how many and takes you down.
- **🖼 Group pictures:** admins set one on the group's 👥 page.
- **🎨 Theme add-ons:** with Themed or BCNeko running, SlimeBeep's page in Settings > Extensions offers **Match my … colours** (off unless you turn it on).
- **🌙 Night mode:** the moon in the header (or ⚙) switches to navy with a night blue slime.
- **Settings > Extensions:** SlimeBeep is listed there too, with the same options.
- **🐞 Bug:** report a problem. SlimeBeep adds its version, the game's version and its own recent errors (nothing about your chats), then you open it on GitHub, copy it, or beep it to SlimeQueenSamantha.
- **⚙ Options:** pop sound for new beeps, whether 📍 starts on, remembering who you picked, the wait between group beeps, and putting the slime back in its corner.

Every beep you send pops up a "✓ Beep sent" note by the slime. A new beep pops a 💌 card (click it to reply), with an optional desktop notification when the game is in the background. Your chats are kept in your browser, per account, so they're still there after you log out (⚙ can turn that off or clear them).

## For other add-ons

SlimeBeep has an API at `window.SlimeBeep.api` (groups, friends with SlimeBeep, opening chats, invites, theme matching, events). It's all in **[API.md](API.md)**.

## What is stored, and where

SlimeBeep runs its own small server on Cloudflare (a Worker with Durable Objects, free plan; the code is in the `relay/` folder). It stores:

- **Group chats:** each group's name, members and roles, open invite codes (7 days), the last 200 messages, the group's and members' pictures, and the song the group is listening to (its link and where it is, kept 12 hours; never the sound).
- **Mailboxes:** beeps left for a SlimeBeep friend who was offline, until they read them (at most 14 days).

That's all. Beeps to someone online are ordinary game beeps and never touch the server. In your browser, SlimeBeep keeps your chat history (if **keep** is on), options, friends' pictures and your sign-in key.

Group chats and mailboxes need the game's https address (signing in uses the browser's WebCrypto, which plain http pages don't have); everything else works on either. The server only accepts connections from the Bondage Club sites and enforces every rule itself (roles, sizes, rate limits). Nobody can post as someone else: each SlimeBeep signs in with its own key, and a mailbox beep can only be read by the key it was addressed to.

## Updates in the room chat

After an update, a small pink line in the room chat (only you see it) says SlimeBeep was updated, with the `news.json` item whose `id` is that version.

## News

[`news.json`](news.json) holds announcements. Add an item (a new `id`, a `title` and a `text`) and push: every player sees it once, as a card by the slime, on their next reload. Nobody has to update anything.

## Updates

You install once. The installed script is a tiny loader that fetches the newest SlimeBeep from this repository every time the game loads, so any change pushed here reaches everybody on their next reload or relog. The tool itself is [`slimebeep.js`](slimebeep.js); release with `node release.js <x.y.z>`, which sets the version shown in its header. The installed loader never changes, so nobody ever has to reinstall.

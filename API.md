# SlimeBeep API (for other add-ons)

SlimeBeep has a small API at `window.SlimeBeep.api` for other mods. It's there once SlimeBeep has loaded. It also registers with the game's mod SDK as `SlimeBeep`, so `bcModSdk.getModsInfo()` lists it.

Everything it hands out is a fresh copy, so changing it changes nothing in SlimeBeep. Message text (beeps, group chats, mailboxes) is never shared through the API; group chats and mailboxes are end-to-end encrypted.

## Checking for SlimeBeep

```js
const sb = window.SlimeBeep?.api;
if (sb && sb.apiVersion === 1) {
	// use it
}
```

`apiVersion` only goes up if something changes in a way that breaks existing use. New functions and events are added without changing it. `sb.version` is the SlimeBeep version (like `'3.0.0'`).

## Groups

```js
sb.groups();
// [{ id, name, owner, admins: [memberNumber], anyoneCanInvite, canInvite,
//    members: [{ memberNumber, name, online, role: 'owner' | 'admin' | 'member' }],
//    picture }]   // the group's picture (a data: image) or null
sb.group(id);              // one group, or null
```

`canInvite` says whether the player may invite to that group (admins, or everyone when the group lets anyone invite). `groups()` is empty until the player is logged in.

## Friends with SlimeBeep

```js
sb.slimeBeepFriends();     // member numbers of friends known to have SlimeBeep
sb.hasSlimeBeep(12345);    // true / false
```

## Opening SlimeBeep

```js
sb.openGroup(id);          // opens SlimeBeep on that group chat
sb.openChat(12345);        // opens SlimeBeep on a chat with that member
sb.openInvite(12345);      // opens "Invite them to…", listing the groups you can invite to
sb.openSettings();         // opens SlimeBeep's page in the game's Settings > Extensions
```

## Do not disturb

```js
sb.doNotDisturb();         // true while it's on: no SlimeBeep sounds, pop-ups or desktop notifications
sb.setDoNotDisturb(true);  // on (false: off); returns whether it is on
```

Messages still arrive while it's on, and show as unread.

## Music

```js
sb.nowPlaying();
// null, or { title, url, youtube, playing, position, duration,   // seconds; duration 0 until known
//            listeningAlongWith,   // the host's name while listening along, else null
//            sharedIn }            // the chat you share it with (a name), else null
sb.playSong('https://youtu.be/…'); // plays a YouTube or sound file link for this player only; false if it isn't one
```

`playSong` never shares anything: sharing and listening along stay the player's own choice in the player.

## Inviting

```js
await sb.inviteToGroup(id, 12345);
// a friend with SlimeBeep gets a beep with the code,
// shown to them as an invite:                         { ok: true, sent: 'invite', code: 'SB-…' }
// a friend without it gets a beep with the code:       { ok: true, sent: 'beep', code: 'SB-…' }
// ...but past 3 of those a minute, no beep is sent:    { ok: true, sent: 'later', code: 'SB-…' }
// anyone else gets a code made for them alone:        { ok: true, code: 'SB-…' }  (show or copy it)
// not allowed / full / already in it:                 { ok: false, why }
```

Invites go out as normal beeps, so they show in both players' chats. The one to a friend without SlimeBeep has no link in it, and at most 3 of those go out a minute, a few seconds apart; invite beeps to SlimeBeep friends go a second apart. Inviting many people never turns into a burst of beeps. With `sent: 'later'` the code still works: try again in a minute, or pass the code on yourself.

## Theme add-ons

SlimeBeep can take a theme add-on's colours (Themed and BCNeko are supported). It's off unless switched on.

```js
sb.matchTheme(true);       // returns whether a theme add-on was found to match
sb.matchTheme(false);      // back to SlimeBeep's own colours
sb.matchingTheme();        // { on, source: 'Themed' | 'BCNeko' | null }
```

## A panel of your own

```js
const panel = sb.addPanel({
	id: 'my-addon', // a-z, 0-9, dash
	icon: '🧩', // the tab's button
	title: 'My add-on',
	mount(el) {
		// fill el once; SlimeBeep keeps it between redraws, so its state stays
		el.innerHTML = '<div class="sb-row">Hello</div>';
	},
});
panel.open(); // shows it (also sb.openPanel('my-addon'))
panel.remove();
```

The panel gets its own tab in SlimeBeep's window and follows SlimeBeep's look (day, night and the game themes) when
it uses SlimeBeep's classes: `sb-row` (a card row), `sb-name` / `sb-sub` (its lines), `sb-pill` (small button),
`sb-go` (main button), `sb-search` (text box), `sb-hint` (small grey text) and `sb-empty` (a centred note). At most
three add-ons can add a panel. `addPanel` answers null for a bad id or when there's no room.

## Proving who the player is

```js
const proof = await sb.proveIdentity('my-addon.example');
// { memberNumber, time, pub: { x, y }, sig, rk }   or null when not logged in
```

For an add-on with its own server. `sig` is an ECDSA P-256 / SHA-256 signature (base64url, raw r|s) of
`slimebeep-proof|<audience>|<memberNumber>|<time>` by the account's SlimeBeep key, whose public half is `pub`
(JWK x and y, base64url). `audience` names your server (a-z, 0-9, dot, dash), so a proof made for one server
is no use on another. Check the time is recent, remember `pub` for that member number the first time, and
afterwards accept only that key. SlimeBeep keys come back from the account backup after a browser wipe; when
an account does move to new keys, `rk` is the old key (`x`, `y`) and its signature of
`rekey|<memberNumber>|<new x>|<new y>`, so a server that knows the old key can follow it. Nothing else
SlimeBeep signs starts with `slimebeep-proof|`.

## Events

```js
const stop = sb.on('presence', (group) => { /* online members of a group changed */ });
sb.on('group', (group) => { /* a group was joined or changed (members, roles, name) */ });
sb.on('groupGone', ({ id }) => { /* left or removed from a group */ });
sb.on('slimeBeepFriend', ({ memberNumber }) => { /* a friend was just found to have SlimeBeep */ });
stop(); // stops that listener
```

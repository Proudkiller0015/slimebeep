# SlimeBeep API (for other add-ons)

SlimeBeep has a small API at `window.SlimeBeep.api` for other mods. It's there once SlimeBeep has loaded. It also registers with the game's mod SDK as `SlimeBeep`, so `bcModSdk.getModsInfo()` lists it.

Everything it hands out is a fresh copy, so changing it changes nothing in SlimeBeep. Group chat message text is never shared.

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
```

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

## Events

```js
const stop = sb.on('presence', (group) => { /* online members of a group changed */ });
sb.on('group', (group) => { /* a group was joined or changed (members, roles, name) */ });
sb.on('groupGone', ({ id }) => { /* left or removed from a group */ });
sb.on('slimeBeepFriend', ({ memberNumber }) => { /* a friend was just found to have SlimeBeep */ });
stop(); // stops that listener
```

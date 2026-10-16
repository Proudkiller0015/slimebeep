// Sets the version of the tool (shown in its header and in the update note in the room chat).
//   node release.js 2.3.0
// Only slimebeep.js changes. The installed loader (slimebeep.user.js) is never touched by a
// release: it fetches slimebeep.js on every load, so nobody has to reinstall anything.
const fs = require('fs');
const v = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(v || '')) { console.error('usage: node release.js <x.y.z>'); process.exit(1); }
const file = __dirname + '/slimebeep.js';
const s = fs.readFileSync(file, 'utf8');
if (!/const VERSION = '[^']*';/.test(s)) throw new Error('no VERSION in slimebeep.js');
fs.writeFileSync(file, s.replace(/const VERSION = '[^']*';/, `const VERSION = '${v}';`));
console.log(`SlimeBeep ${v}: add a news.json item with id "${v}" for the room note, then commit and push.`);

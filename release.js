// Sets one version everywhere: the tool (what its header shows) and the installed loader.
//   node release.js 2.1.0
const fs = require('fs');
const v = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(v || '')) { console.error('usage: node release.js <x.y.z>'); process.exit(1); }
const edit = (file, re, to) => {
	const s = fs.readFileSync(file, 'utf8');
	if (!re.test(s)) throw new Error(`no version in ${file}`);
	fs.writeFileSync(file, s.replace(re, to));
};
edit(__dirname + '/slimebeep.js', /const VERSION = '[^']*';/, `const VERSION = '${v}';`);
edit(__dirname + '/slimebeep.user.js', /(\/\/ @version\s+)\S+/, `$1${v}`);
console.log(`SlimeBeep ${v}: commit and push to release.`);

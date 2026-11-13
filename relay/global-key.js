// Gives the relay the key Global's stored messages are sealed with (the GLOBAL_KEY secret). Run it once,
// before or right after the deploy that brings Global:
//   node global-key.js
// The key goes straight to Cloudflare and is never printed or kept here. Running it again makes a new key,
// and the messages Global already stored can't be opened any more (new ones are fine), so it asks first.
const { execSync } = require('child_process');
const crypto = require('crypto');
const readline = require('readline');

const run = () => {
	const key = crypto.randomBytes(32).toString('base64url');
	execSync('npx wrangler secret put GLOBAL_KEY', { cwd: __dirname, input: key, stdio: ['pipe', 'inherit', 'inherit'] });
	console.log('GLOBAL_KEY set. Global can store messages now.');
};

const listed = execSync('npx wrangler secret list', { cwd: __dirname, encoding: 'utf8' });
if (!/"GLOBAL_KEY"/.test(listed)) {
	run();
} else {
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
	rl.question("GLOBAL_KEY is already set. A new one makes Global's stored messages unreadable. Replace it? (yes/no) ", (a) => {
		rl.close();
		if (a.trim().toLowerCase() === 'yes') {
			run();
		} else {
			console.log('Kept the current key.');
		}
	});
}

// The relay operator's tools, for a member locked out of a group nobody else can invite them back to.
//   node operator.js on                      makes a key, keeps it in .operator-key and gives it to the relay
//   node operator.js invite <group> <member> a code for that member number (the group from any SB-<group>-... code)
//   node operator.js off                     takes the key away from the relay, so the invite endpoint is gone again
const { execSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const KEY_FILE = path.join(__dirname, '.operator-key');
const RELAY = process.env.RELAY_HTTP || 'https://slimebeep-relay.slimebeep-relay.workers.dev';
const [cmd, group, member] = process.argv.slice(2);

/** Runs a wrangler command here, with `input` on its standard input. */
const wrangler = (args, input) => execSync(`npx wrangler ${args}`, { cwd: __dirname, input, stdio: ['pipe', 'inherit', 'inherit'] });

(async () => {
	if (cmd === 'on') {
		const key = crypto.randomBytes(32).toString('base64url');
		fs.writeFileSync(KEY_FILE, key, { mode: 0o600 });
		wrangler('secret put OPERATOR_KEY', key);
		console.log('Operator key set. Make codes with: node operator.js invite <group> <member>');
	} else if (cmd === 'invite') {
		const gid = String(group || '')
			.replace(/^SB-/, '')
			.split('-')[0];
		const n = Number(member);
		if (!/^[a-z0-9]{8,24}$/.test(gid) || !Number.isInteger(n) || n <= 0) {
			throw new Error('usage: node operator.js invite <group or SB- code> <member number>');
		}
		if (!fs.existsSync(KEY_FILE)) {
			throw new Error('no operator key: run node operator.js on first');
		}
		const res = await fetch(`${RELAY}/op/invite`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${fs.readFileSync(KEY_FILE, 'utf8').trim()}`, 'content-type': 'application/json' },
			body: JSON.stringify({ g: gid, member: n }),
		});
		if (!res.ok) {
			throw new Error(`${res.status} ${await res.text()} (a 404 means the relay has no operator key, or not this one)`);
		}
		const { code, listed, owner } = await res.json();
		console.log(`SB-${gid}-${code}`);
		console.log(
			`For #${n} only, valid 7 days. ${listed ? `#${n} is listed there${owner ? ' as the owner' : ''}: joining with it swaps in the new keys.` : `#${n} is not in that group yet.`}`,
		);
	} else if (cmd === 'off') {
		wrangler('secret delete OPERATOR_KEY', 'y\n');
		fs.rmSync(KEY_FILE, { force: true });
		console.log('Operator key removed: the invite endpoint answers 404 again.');
	} else {
		console.log('usage: node operator.js on | invite <group> <member> | off');
	}
})().catch((e) => {
	console.error(e.message);
	process.exit(1);
});

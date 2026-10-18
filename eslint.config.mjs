import js from '@eslint/js';
import globals from 'globals';
import noUnsanitized from 'eslint-plugin-no-unsanitized';
import prettier from 'eslint-config-prettier';

/** Game globals SlimeBeep reads (declared with types in types/bc.d.ts). */
const gameGlobals = Object.fromEntries(
	[
		'Player',
		'ServerSocket',
		'ServerSend',
		'ServerSendBeepMessage',
		'ServerRoomJoin',
		'ServerPlayerIsInChatRoom',
		'FriendListBeepLog',
		'ChatRoomData',
		'ChatRoomCharacter',
		'ChatRoomSendWhisper',
		'ToastManager',
		'ChatRoomSendLocal',
		'ChatRoomCanLeave',
		'ChatRoomLeave',
		'ChatSearchSendToast',
		'CommonSetScreen',
		'CurrentScreen',
		'GameVersion',
		'PreferenceRegisterExtensionSetting',
		'PreferenceSubscreenExtensionsOpen',
		'PreferenceExtensionsSettings',
		'PreferenceSubscreenExtensionsClear',
		'DrawCheckbox',
		'DrawButton',
		'DrawText',
		'DrawCharacter',
		'MainCanvas',
		'MouseIn',
	].map((name) => [name, 'readonly']),
);

/** Helpers the test page defines in its stub (test.js), used inside page.evaluate callbacks. */
const testPageGlobals = Object.fromEntries(
	[
		'SlimeBeep',
		'fire',
		'buttons',
		'openedSettings',
		'settingsClick',
		'toasts',
		'beeps',
		'hidden',
		'chats',
		'local',
		'cleared',
		'drawn',
		'makeLog',
		'gameKeys',
		'apiEvents',
		'opened',
		'screens',
		'joins',
		'left',
		'MouseX',
		'MouseY',
	].map((name) => [name, 'writable']),
);

/** Style and safety rules for all of SlimeBeep's code. */
const rules = {
	curly: ['error', 'all'],
	eqeqeq: ['error', 'always', { null: 'ignore' }],
	'max-statements-per-line': ['error', { max: 1 }],
	'no-var': 'error',
	'prefer-const': 'error',
	'no-unused-vars': ['error', { args: 'after-used', caughtErrors: 'none' }],
	'no-shadow': 'error',
	'no-param-reassign': 'error',
	'no-implied-eval': 'error',
	'no-new-func': 'error',
	'no-eval': 'error',
	'object-shorthand': 'error',
	'prefer-template': 'error',
	'no-else-return': 'error',
	'no-nested-ternary': 'error',
};

export default [
	js.configs.recommended,
	// Formatting is Prettier's; it is turned off here first so the rules below (curly included) still apply.
	prettier,
	{
		files: ['slimebeep.js'],
		languageOptions: { ecmaVersion: 2022, sourceType: 'script', globals: { ...globals.browser, ...gameGlobals, bcModSdk: 'readonly' } },
		plugins: { 'no-unsanitized': noUnsanitized },
		rules: {
			...rules,
			// HTML is only built with the html tag (which escapes every inserted value) or esc().
			'no-unsanitized/property': ['error', { escape: { taggedTemplates: ['html'], methods: ['esc'] } }],
			'no-unsanitized/method': ['error', { escape: { taggedTemplates: ['html'], methods: ['esc'] } }],
		},
	},
	{
		files: ['relay/src/index.js'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: { ...globals.serviceworker, WebSocketPair: 'readonly', WebSocketRequestResponsePair: 'readonly' },
		},
		rules,
	},
	{
		files: ['test.js', 'relay/test-relay.js', 'relay/e2e-peer.js'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'commonjs',
			globals: { ...globals.node, ...globals.browser, ...gameGlobals, ...testPageGlobals },
		},
		// page.evaluate callbacks run inside the test page, not in the scope around them, so reusing a name there is not shadowing.
		rules: { ...rules, 'no-shadow': 'off' },
	},
];

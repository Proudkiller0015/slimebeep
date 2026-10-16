/*
 * The parts of Bondage Club that SlimeBeep uses, with the game's own signatures (Scripts/, Screens/ in the
 * game's repository). Any of them can be missing after a game update, which is why slimebeep.js checks
 * `typeof X === 'function'` before calling them (see NEEDS).
 */

/** The logged-in player (only the fields SlimeBeep reads). */
interface BcPlayer {
	MemberNumber: number;
	Name: string;
	Nickname?: string;
	/** Friend list: member number -> name. */
	FriendNames: Map<number, string>;
	/** Every friend's member number. */
	FriendList?: number[];
	IsSlow(): boolean;
}

/** A beep in the game's beep log, as FriendListBeepLog keeps it. */
interface BcBeepLogEntry {
	Id?: string;
	MemberNumber: number;
	MemberName: string;
	Sent: boolean;
	Read?: boolean;
	Time: Date | string | number;
	Message?: string;
	ChatRoomName?: string;
	ChatRoomSpace?: string;
	Private?: boolean;
}

/** The game's socket.io connection (only the methods SlimeBeep uses). */
interface BcSocket {
	on(event: string, fn: (data: unknown) => void): void;
	off(event: string, fn: (data: unknown) => void): void;
	onAny?(fn: (event: string, data: unknown) => void): void;
	prependAny?(fn: (event: string, data: unknown) => void): void;
	offAny?(fn: (event: string, data: unknown) => void): void;
	listenersAny?(): ((event: string, data: unknown) => void)[];
	listeners?(event: string): ((data: unknown) => void)[];
}

/** An entry for Settings > Extensions (Scripts/Preference.js). */
interface BcExtensionSetting {
	Identifier: string;
	ButtonText: string | (() => string);
	Image?: string | (() => string);
	load?: () => void;
	run: () => void;
	click: () => void;
	exit: () => boolean | void;
	unload?: () => void;
}

/** The answer of ServerRoomJoin. */
interface BcRoomJoinResult {
	ok: boolean;
	error?: { name?: string; message?: string };
}

declare var Player: BcPlayer;
declare var ServerSocket: BcSocket;
declare var FriendListBeepLog: BcBeepLogEntry[];
declare var ChatRoomData: { Name: string } | null;
declare var CurrentScreen: string;
declare var GameVersion: string;
declare var MainCanvas: CanvasRenderingContext2D;
declare var PreferenceExtensionsSettings: Record<string, BcExtensionSetting>;

declare function ServerSend(message: string, data: object): void;
declare function ServerSendBeepMessage(target: number, msg: string, options?: { includeRoom?: boolean }): void;
declare function ServerPlayerIsInChatRoom(): boolean;
declare function ServerRoomJoin(roomName: string): Promise<BcRoomJoinResult>;
declare function ChatRoomSendLocal(content: string, timeout?: number): void;
declare function ChatRoomCanLeave(): boolean;
declare function ChatRoomLeave(clearCharacters?: boolean): void;
declare function ChatSearchSendToast(type: string): void;
declare function CommonSetScreen(module: string, screen: string): Promise<void>;
declare function PreferenceRegisterExtensionSetting(setting: BcExtensionSetting): void;
declare function PreferenceSubscreenExtensionsClear(): Promise<void>;
declare function MouseIn(left: number, top: number, width: number, height: number): boolean;
declare function DrawText(text: string, x: number, y: number, color: string, backColor?: string): void;
declare function DrawButton(
	left: number,
	top: number,
	width: number,
	height: number,
	label: string,
	color: string,
	image?: string | null,
	hoveringText?: string | null,
	disabled?: boolean,
): void;
declare function DrawCheckbox(
	left: number,
	top: number,
	width: number,
	height: number,
	text: string,
	isChecked: boolean,
	disabled?: boolean,
	textColor?: string,
): void;
declare function DrawCharacter(c: BcPlayer, x: number, y: number, zoom: number): void;

/** What SlimeBeep puts on window, and the mod SDK it registers with. */
interface Window {
	SlimeBeep?: { version: string; api?: object; debug?: () => { listening?: boolean; catchAll?: boolean } };
	SlimeBeepHopped?: boolean;
	bcModSdk?: {
		registerMod(info: { name: string; fullName: string; version: string; repository?: string }): unknown;
		getModsInfo?(): { name: string; fullName: string; version: string }[];
	};
}

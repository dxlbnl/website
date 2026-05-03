export type ShareState =
	| 'idle'
	| 'offering'
	| 'waiting'
	| 'approving'
	| 'guest-setup'
	| 'guest-init'
	| 'guest-answering'
	| 'guest-waiting'
	| 'connecting'
	| 'connected'
	| 'denied'
	| 'error';

export type MsgText = {
	kind: 'text';
	id: string;
	content: string;
	secret: boolean;
	dir: 'out' | 'in';
	ts: Date;
};

export type MsgFile = {
	kind: 'file';
	id: string;
	name: string;
	size: number;
	mimeType: string;
	dir: 'out' | 'in';
	ts: Date;
	progress: number;
	blobUrl?: string;
	textPreview?: string;
};

export type ChatEntry = MsgText | MsgFile;

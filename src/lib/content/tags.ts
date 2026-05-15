// Controlled tag vocabulary. Every `tags` entry in content/**/*.md frontmatter
// must appear here with this exact casing — keeps tag filtering and the
// keywords meta consistent. Add new tags here first, then use them in content.

export const TAG_GROUPS = {
	stack: [
		'SvelteKit',
		'TypeScript',
		'WebRTC',
		'mdsvex',
		'SSE',
		'GraphQL',
		'Hasura',
		'Houdini',
		'Nginx',
		'Supabase',
		'Zod'
	],
	domain: [
		'Real-time',
		'Security',
		'SSO',
		'Offline-First',
		'Testing',
		'Open Source',
		'Design',
		'Engineering',
		'AI',
		'Talk'
	],
	hardware: [
		'Hardware',
		'Eurorack',
		'Power Supply',
		'Audio Interface',
		'Recorder',
		'USB-C',
		'USB',
		'PD',
		'PCB',
		'Utility',
		'Distrans AR-1'
	]
} as const;

export const ALL_TAGS = [
	...TAG_GROUPS.stack,
	...TAG_GROUPS.domain,
	...TAG_GROUPS.hardware
] as const;

export type Tag = (typeof ALL_TAGS)[number];

export function isTag(value: string): value is Tag {
	return (ALL_TAGS as readonly string[]).includes(value);
}

// Note `kind` badge values — uppercase, used for the category label on notes.
export const NOTE_KINDS = ['BUILD', 'HARDWARE', 'TALK', 'PROJECT-LOG', 'OPEN-SOURCE'] as const;

export type NoteKind = (typeof NOTE_KINDS)[number];

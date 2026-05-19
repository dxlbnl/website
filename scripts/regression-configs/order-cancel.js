// scripts/regression-configs/order-cancel.js
// Selector map for /order/cancel/ — first page through the regression workflow.

export default {
	pageSlug: 'order-cancel',
	liveUrl: 'https://www.dexterlabs.nl/order/cancel/',
	localUrl: 'http://localhost:5174/order/cancel/',
	description:
		'Findings below are grouped by route surface, each tagged with the ' +
		'`<LibraryComponent props>` instance responsible. Ignored properties per surface ' +
		'(library-canon decisions like "parent Stack owns spacing") are listed in the ' +
		'config — they are not regressions, just intentional library defaults.',
	components: [
		// Eyebrow is split: the LED + text wrapper is a flex container (layout),
		// the text itself inherits text styling from its element (text only).
		{
			name: 'eyebrow wrapper (LED + label)',
			component: 'Inline',
			live: '.wrap .label',
			local: '.inline',
			propertyGroups: ['layout'],
			ignore: ['width'] // wrapper width is a downstream effect of body width, not a library bug
		},
		{
			name: 'eyebrow text',
			component: 'Text',
			props: 'variant="eyebrow"',
			live: '.wrap .label',
			local: '.inline .eyebrow',
			propertyGroups: ['text'],
			ignore: ['margin-bottom'] // library design: parent Stack owns spacing
		},
		{
			name: 'h1 heading',
			component: 'Heading',
			props: 'level={1}',
			live: '.wrap h1',
			local: '.stack h1.h1',
			propertyGroups: ['text', 'layout'],
			ignore: ['margin-bottom', 'width'] // parent Stack owns spacing; width is downstream
		},
		{
			name: 'body paragraph',
			component: 'Text',
			props: 'color="dim"',
			live: '.wrap p',
			local: '.body-text',
			propertyGroups: ['text', 'layout'],
			ignore: ['margin-bottom', 'width']
		},
		{
			name: 'back link',
			component: 'Button',
			props: 'as="a" variant="back"',
			live: '.btn-back',
			local: 'a.btn.btn-back',
			propertyGroups: ['text', 'layout'],
			ignore: ['width'] // back link on local stretches to row width; downstream of layout
		},
		{
			name: 'signature container',
			component: 'Grid',
			props: 'cols={2}',
			live: '.sig',
			local: '.grid-layout',
			propertyGroups: ['layout', 'border'],
			ignore: ['width']
		},
		{
			name: 'signature label — SIGNED',
			component: 'Text',
			props: 'variant="eyebrow"',
			live: '.sig > div:first-child .label',
			local: '.grid-layout > .stack:first-child .eyebrow',
			propertyGroups: ['text'],
			ignore: ['margin-bottom']
		},
		{
			name: 'signature hand — SIGNED',
			component: 'Text',
			props: 'variant="lede" color="ink"',
			live: '.sig > div:first-child .hand',
			local: '.grid-layout > .stack:first-child .body-lede',
			propertyGroups: ['text']
		},
		{
			name: 'signature label — SHIPPED BY',
			component: 'Text',
			props: 'variant="eyebrow"',
			live: '.sig > div:nth-child(2) .label',
			local: '.grid-layout > .stack:nth-child(2) .eyebrow',
			propertyGroups: ['text'],
			ignore: ['margin-bottom']
		},
		{
			name: 'signature hand — SHIPPED BY',
			component: 'Text',
			props: 'variant="lede" color="ink"',
			live: '.sig > div:nth-child(2) .hand',
			local: '.grid-layout > .stack:nth-child(2) .body-lede',
			propertyGroups: ['text']
		},
		{
			name: 'page wrap',
			component: 'Container',
			props: 'size="lg"',
			live: '.wrap',
			local: '.container-wrap',
			propertyGroups: ['layout'],
			ignore: ['display', 'width', 'gap'] // Container shape vs hand-rolled wrap differ structurally
		}
	]
};

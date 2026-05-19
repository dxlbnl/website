// scripts/regression-configs/order-cancel.js
// Selector map for /order/cancel/ — first page through the regression workflow.
// See plan at ~/.claude/plans/in-order-to-get-wild-glade.md.

export default {
	pageSlug: 'order-cancel',
	liveUrl: 'https://www.dexterlabs.nl/order/cancel/',
	localUrl: 'http://localhost:5174/order/cancel/',
	description:
		'Pattern note: the migrated page composes the hero block by hand ' +
		'(Inline + Heading + Text + Button). Production uses no equivalent of a hero ' +
		'pattern either. The library ships `PageHero` for this surface — once it grows an ' +
		'`eyebrowContent` snippet prop (mirroring `headingContent`), the route should ' +
		'switch to `<PageHero eyebrowContent={...} heading="..." lede="..." border={false} />` ' +
		'with the `<Led /> ORDER CANCELLED` inside the eyebrow snippet.',
	components: [
		{
			name: 'eyebrow label',
			live: '.wrap .label',
			local: '.inline .eyebrow'
		},
		{
			name: 'h1 heading',
			live: '.wrap h1',
			local: '.stack h1.h1'
		},
		{
			name: 'body paragraph',
			live: '.wrap p',
			local: '.body-text'
		},
		{
			name: 'back link',
			live: '.btn-back',
			local: 'a.btn.btn-back'
		},
		{
			name: 'signature container',
			live: '.sig',
			local: '.spread'
		},
		{
			name: 'signature label — SIGNED',
			live: '.sig > div:first-child .label',
			local: '.spread > .stack:first-child .eyebrow'
		},
		{
			name: 'signature hand — SIGNED',
			live: '.sig > div:first-child .hand',
			local: '.spread > .stack:first-child .body-lede'
		},
		{
			name: 'signature label — SHIPPED BY',
			live: '.sig > div:nth-child(2) .label',
			local: '.spread > .stack:nth-child(2) .eyebrow'
		},
		{
			name: 'signature hand — SHIPPED BY',
			live: '.sig > div:nth-child(2) .hand',
			local: '.spread > .stack:nth-child(2) .body-lede'
		},
		{
			name: 'page wrap',
			live: '.wrap',
			local: '.container-wrap'
		}
	]
};

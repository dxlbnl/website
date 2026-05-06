import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const getOrigin = () => {
	if (process.env.VERCEL_ENV === 'production') return 'https://www.dexterlabs.nl';
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
	return 'https://www.dexterlabs.nl';
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extension: '.md',
			smartypants: true
			// We'll handle component mapping in the page component for more control
		})
	],
	kit: {
		adapter: adapter({
			// default options are shown. On some platforms
			// these options are set automatically - see below
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: false,
			strict: true
		}),
		prerender: {
			origin: getOrigin(),
			handleHttpError: ({ path, message }) => {
				if (path.startsWith('/_vercel/image')) return;
				throw new Error(message);
			},
			handleUnseenRoutes: 'ignore'
		},
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'script-src': ['self'],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'data:', 'blob:'],
				'connect-src': ['self'],
				'font-src': ['self'],
				'object-src': ['none'],
				'base-uri': ['self'],
				'frame-ancestors': ['none']
			}
		}
	},
	extensions: ['.svelte', '.svx', '.md']
};

export default config;

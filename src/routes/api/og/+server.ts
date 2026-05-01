import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import sharp from 'sharp';

const CONFIG = {
	height: 630,
	width: 1200,
	fontPath: '/fonts/JetBrainsMono-Bold.ttf',
	logoPath: '/logo.png'
};

const PALETTE = {
	bg: '#0b0d0c',
	bgElev: '#141817',
	ink: '#d6e2dc',
	inkDim: '#a4b0a9',
	inkFaint: '#7a8580',
	amber: '#ffb347',
	rule: '#1d2321'
};

// Cached per serverless instance
let fontCache: ArrayBuffer | null = null;

async function fetchAssetAsBase64(
	fetch: (input: string | URL | Request, init?: RequestInit) => Promise<Response>,
	path: string,
	defaultContentType = 'image/png'
) {
	try {
		const res = await fetch(path);
		if (!res.ok) return '';
		const buffer = await res.arrayBuffer();
		const contentType = res.headers.get('content-type') || defaultContentType;
		return `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`;
	} catch {
		return '';
	}
}

export const GET = async ({ url, fetch }) => {
	const title = url.searchParams.get('title') ?? 'DEXTERLABS';
	const subtitle = url.searchParams.get('subtitle') ?? 'HARDWARE // SOFTWARE // EXPERIMENTS';
	const cta = url.searchParams.get('cta');
	const rawImageUrl = url.searchParams.get('image');

	// Prefer JPEGs for background images to speed up OG fetch
	const imageUrl = rawImageUrl ? rawImageUrl.replace(/\.webp$/, '.jpg') : null;

	if (!fontCache) {
		const res = await fetch(CONFIG.fontPath);
		if (!res.ok) throw new Error('Failed to load font');
		fontCache = await res.arrayBuffer();
	}

	const [bgImageBase64, logoBase64] = await Promise.all([
		imageUrl ? fetchAssetAsBase64(fetch, imageUrl, 'image/jpeg') : Promise.resolve(''),
		fetchAssetAsBase64(fetch, CONFIG.logoPath)
	]);

	const backgroundStyle = bgImageBase64
		? {
				backgroundImage: `linear-gradient(to top, ${PALETTE.bg} 0%, rgba(11, 13, 12, 0.3) 100%), url(${bgImageBase64})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center'
			}
		: { backgroundColor: PALETTE.bg };

	const node = {
		type: 'div',
		props: {
			style: {
				height: '100%',
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'flex-start',
				justifyContent: 'center',
				...backgroundStyle,
				color: PALETTE.ink,
				fontFamily: "'JetBrains Mono', monospace",
				padding: '80px',
				position: 'relative'
			},
			children: [
				// Brand Logo
				logoBase64 && {
					type: 'img',
					props: {
						src: logoBase64,
						style: {
							position: 'absolute',
							top: '40px',
							left: '40px',
							width: '80px',
							height: '80px',
							objectFit: 'contain'
						}
					}
				},
				// Main Content Container
				{
					type: 'div',
					props: {
						style: {
							display: 'flex',
							flexDirection: 'column',
							width: '100%',
							marginTop: '80px'
						},
						children: [
							// Header / Breadcrumb
							{
								type: 'div',
								props: {
									style: {
										fontSize: '20px',
										letterSpacing: '3px',
										color: PALETTE.inkFaint,
										textTransform: 'uppercase',
										marginBottom: '32px',
										display: 'flex'
									},
									children: '// DEXTERLABS · WORKBENCH · 2026'
								}
							},
							// Title
							{
								type: 'div',
								props: {
									style: {
										fontSize: '90px',
										fontWeight: 700,
										lineHeight: 1,
										letterSpacing: '-3px',
										marginBottom: '24px',
										color: PALETTE.ink,
										display: 'flex'
									},
									children: title.toUpperCase()
								}
							},
							// Subtitle
							{
								type: 'div',
								props: {
									style: {
										fontSize: '32px',
										color: PALETTE.inkDim,
										lineHeight: 1.4,
										maxWidth: '800px',
										display: 'flex'
									},
									children: subtitle
								}
							}
						]
					}
				},
				// Call to Action
				cta && {
					type: 'div',
					props: {
						style: {
							position: 'absolute',
							bottom: '80px',
							right: '80px',
							display: 'flex',
							padding: '16px 32px',
							background: PALETTE.amber,
							color: PALETTE.bg,
							fontSize: '24px',
							fontWeight: 700,
							textTransform: 'uppercase',
							letterSpacing: '2px',
							borderRadius: '2px'
						},
						children: cta
					}
				}
			].filter(Boolean)
		}
	};

	const svg = await satori(node, {
		fonts: [{ name: 'JetBrains Mono', data: fontCache, style: 'normal', weight: 700 }],
		height: CONFIG.height,
		width: CONFIG.width
	});

	const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: CONFIG.width } });
	const imageData = resvg.render();
	const pngBuffer = imageData.asPng();

	const compressedBuffer = await sharp(pngBuffer)
		.jpeg({ quality: 80, progressive: true })
		.toBuffer();

	return new Response(Buffer.from(compressedBuffer), {
		headers: {
			'content-type': 'image/jpeg',
			'cache-control': 'public, immutable, no-transform, max-age=31536000'
		}
	});
};

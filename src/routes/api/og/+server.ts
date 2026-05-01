import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import sharp from 'sharp';

const height = 630;
const width = 1200;

// Cached per serverless instance — cold start pays one self-hosted fetch, warm requests are free
let fontCache: ArrayBuffer | null = null;

export const GET = async ({ url, fetch }) => {
	const title = url.searchParams.get('title') ?? 'DEXTERLABS';
	const subtitle = url.searchParams.get('subtitle') ?? 'HARDWARE // SOFTWARE // EXPERIMENTS';
	const rawImageUrl = url.searchParams.get('image');
	const imageUrl = rawImageUrl ? rawImageUrl.replace(/\.webp$/, '.jpg') : null;

	if (!fontCache) {
		const res = await fetch('/fonts/JetBrainsMono-Bold.ttf');
		if (!res.ok) throw new Error('Failed to load font');
		fontCache = await res.arrayBuffer();
	}

	// Fetch logo and bg image in parallel
	const [bgImageBase64, logoBase64] = await Promise.all([
		imageUrl
			? (async () => {
				try {
					const fetchUrl = imageUrl.startsWith(url.origin)
						? imageUrl.replace(url.origin, '')
						: imageUrl;
					const res = await fetch(fetchUrl);
					if (!res.ok) return '';
					const buffer = await res.arrayBuffer();
					const contentType = res.headers.get('content-type') || 'image/jpeg';
					return `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`;
				} catch {
					return '';
				}
			})()
			: Promise.resolve(''),
		(async () => {
			try {
				const res = await fetch('/logo.png');
				if (!res.ok) return '';
				const buffer = await res.arrayBuffer();
				return `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
			} catch {
				return '';
			}
		})()
	]);

	const backgroundStyle = bgImageBase64
		? {
			backgroundImage: `linear-gradient(to top, rgba(11, 13, 12, 1) 0%, rgba(11, 13, 12, 0.3) 100%), url(${bgImageBase64})`,
			backgroundSize: 'cover',
			backgroundPosition: 'center'
		}
		: { backgroundColor: '#0b0d0c' };

	// Native satori object tree — no satori-html, no React
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
				color: '#d6e2dc',
				fontFamily: "'JetBrains Mono', monospace",
				padding: '80px',
				position: 'relative'
			},
			children: [
				...(logoBase64
					? [
						{
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
						}
					]
					: []),
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
							{
								type: 'div',
								props: {
									style: {
										fontSize: '20px',
										letterSpacing: '3px',
										color: '#4a524e',
										textTransform: 'uppercase',
										marginBottom: '32px',
										display: 'flex'
									},
									children: '// DEXTERLABS · WORKBENCH · 2026'
								}
							},
							{
								type: 'div',
								props: {
									style: {
										fontSize: '90px',
										fontWeight: 700,
										lineHeight: 1,
										letterSpacing: '-3px',
										marginBottom: '24px',
										color: '#d6e2dc',
										display: 'flex'
									},
									children: title.toUpperCase()
								}
							},
							{
								type: 'div',
								props: {
									style: {
										fontSize: '32px',
										color: '#8a968f',
										lineHeight: 1.4,
										maxWidth: '800px',
										display: 'flex'
									},
									children: subtitle
								}
							}
						]
					}
				}
			]
		}
	};

	const svg = await satori(node, {
		fonts: [{ name: 'JetBrains Mono', data: fontCache, style: 'normal', weight: 700 }],
		height,
		width
	});

	const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } });
	const imageData = resvg.render();
	const pngBuffer = imageData.asPng();

	// Compress with sharp as JPEG for much smaller file size
	const compressedBuffer = await sharp(pngBuffer).jpeg({ quality: 80, progressive: true }).toBuffer();

	return new Response(Buffer.from(compressedBuffer), {
		headers: {
			'content-type': 'image/jpeg',
			'cache-control': 'public, immutable, no-transform, max-age=31536000'
		}
	});
};


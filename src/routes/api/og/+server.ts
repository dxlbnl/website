import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { html as toReactNode } from 'satori-html';

const height = 630;
const width = 1200;

export const GET = async ({ url, fetch }) => {
	const title = url.searchParams.get('title') ?? 'DEXTERLABS';
	const subtitle = url.searchParams.get('subtitle') ?? 'HARDWARE // SOFTWARE // EXPERIMENTS';
	const rawImageUrl = url.searchParams.get('image');
	// Support falling back to a jpg for Satori compatibility
	const imageUrl = rawImageUrl ? rawImageUrl.replace(/\.webp$/, '.jpg') : null;

	let bgImageBase64 = '';
	if (imageUrl) {
		try {
			// Strip origin for internal SvelteKit fetch
			const fetchUrl = imageUrl.startsWith(url.origin) ? imageUrl.replace(url.origin, '') : imageUrl;
			const res = await fetch(fetchUrl);
			if (res.ok) {
				const buffer = await res.arrayBuffer();
				const contentType = res.headers.get('content-type') || 'image/jpeg';
				bgImageBase64 = `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`;
			}
		} catch (e) {
			console.error('Failed to process OG background image:', e);
		}
	}

	let logoBase64 = '';
	try {
		const res = await fetch('/logo.png');
		if (res.ok) {
			const buffer = await res.arrayBuffer();
			logoBase64 = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
		}
	} catch (e) {
		console.error('Failed to process OG logo:', e);
	}

	// Fetch JetBrains Mono (TTF format is required by satori)
	const fontData = await fetch('https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono@2.242/fonts/ttf/JetBrainsMono-Bold.ttf')
		.then((res) => {
			if (!res.ok) throw new Error(`Failed to fetch font: ${res.statusText}`);
			return res.arrayBuffer();
		});

	const backgroundStyle = bgImageBase64
		? `background-image: linear-gradient(to top, rgba(11, 13, 12, 1) 0%, rgba(11, 13, 12, 0.3) 100%), url(${bgImageBase64}); background-size: cover; background-position: center;`
		: 'background-color: #0b0d0c;';

	const html = toReactNode(`
		<div style="
			height: 100%;
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			justify-content: center;
			${backgroundStyle}
			color: #d6e2dc;
			font-family: 'JetBrains Mono', monospace;
			padding: 80px;
			position: relative;
		">
			${logoBase64 ? `<img src="${logoBase64}" style="position: absolute; top: 40px; left: 40px; width: 80px; height: 80px; object-fit: contain; display: flex;" />` : ''}

			<div style="display: flex; flex-direction: column; width: 100%; margin-top: 80px;">
				<div style="font-size: 20px; letter-spacing: 3px; color: #4a524e; text-transform: uppercase; margin-bottom: 32px; display: flex;">
					// DEXTERLABS · WORKBENCH · 2026
				</div>
				
				<div style="font-size: 90px; font-weight: 700; line-height: 1; letter-spacing: -3px; margin-bottom: 24px; color: #d6e2dc; display: flex;">
					${title.toUpperCase()}
				</div>
				
				<div style="font-size: 32px; color: #8a968f; line-height: 1.4; max-width: 800px; display: flex;">
					${subtitle}
				</div>
			</div>
		</div>
	`);

	const svg = await satori(html, {
		fonts: [
			{
				name: 'JetBrains Mono',
				data: fontData,
				style: 'normal',
				weight: 700
			}
		],
		height,
		width
	});

	const resvg = new Resvg(svg, {
		fitTo: {
			mode: 'width',
			value: width,
		},
	});

	const image = resvg.render();

	return new Response(new Uint8Array(image.asPng()), {
		headers: {
			'content-type': 'image/png',
			'cache-control': 'public, immutable, no-transform, max-age=31536000',
		},
	});
};

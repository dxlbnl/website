import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const validExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];

async function optimizeDir(contentDir, staticDir) {
	await fs.mkdir(staticDir, { recursive: true });

	const entries = await fs.readdir(contentDir, { withFileTypes: true });

	for (const entry of entries) {
		if (!entry.isDirectory()) continue;

		const slug = entry.name;
		const mediaDir = path.join(contentDir, slug, 'media');
		const targetDir = path.join(staticDir, slug);

		try {
			await fs.access(mediaDir);
		} catch {
			continue;
		}

		await fs.mkdir(targetDir, { recursive: true });

		const images = await fs.readdir(mediaDir);
		for (const image of images) {
			if (image.startsWith('.')) continue;

			const ext = path.extname(image).toLowerCase();
			if (!validExts.includes(ext)) continue;

			const inputPath = path.join(mediaDir, image);
			const filename = path.parse(image).name;
			const outputPath = path.join(targetDir, `${filename}.webp`);

			console.log(`[OPTIMIZE] ${slug}/${image} >> ${outputPath}`);

			await sharp(inputPath)
				.resize({ width: 1600, withoutEnlargement: true })
				.webp({ quality: 80, effort: 6 })
				.toFile(outputPath);
		}
	}
}

async function optimize() {
	await optimizeDir('content/notes', 'static/images/notes');
	await optimizeDir('content/products', 'static/images/products');
	console.log('✓ Optimization complete.');
}

optimize().catch((err) => {
	console.error('✗ Optimization failed:', err);
	process.exit(1);
});

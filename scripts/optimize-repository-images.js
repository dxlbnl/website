import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

async function optimize() {
	const contentDir = 'content/repository';
	const staticDir = 'static/images/repository';

	// Ensure static directory exists
	await fs.mkdir(staticDir, { recursive: true });

	const logs = await fs.readdir(contentDir, { withFileTypes: true });

	for (const log of logs) {
		if (!log.isDirectory()) continue;

		const slug = log.name;
		const mediaDir = path.join(contentDir, slug, 'media');
		const targetDir = path.join(staticDir, slug);

		try {
			await fs.access(mediaDir);
		} catch {
			// console.log(`No media found for ${slug}`);
			continue;
		}

		await fs.mkdir(targetDir, { recursive: true });

		const images = await fs.readdir(mediaDir);
		for (const image of images) {
			if (image.startsWith('.')) continue;

			const inputPath = path.join(mediaDir, image);
			const ext = path.extname(image).toLowerCase();
			const validExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
			
			if (!validExts.includes(ext)) continue;

			const filename = path.parse(image).name;
			const outputPath = path.join(targetDir, `${filename}.webp`);

			console.log(`[OPTIMIZE] ${slug}/${image} >> ${outputPath}`);
			
			await sharp(inputPath)
				.resize({ width: 1600, withoutEnlargement: true }) // Limit size for web
				.webp({ quality: 80, effort: 6 }) // High quality, good compression
				.toFile(outputPath);
		}
	}
	console.log('✓ Optimization complete.');
}

optimize().catch((err) => {
	console.error('✗ Optimization failed:', err);
	process.exit(1);
});

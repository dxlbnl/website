import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const validExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];

async function optimizeFile(inputPath, outputPath, logInfo) {
	try {
		await fs.access(outputPath);
		console.log(`[SKIP] ${logInfo} (already exists)`);
		return;
	} catch {
		// File does not exist, proceed
	}

	console.log(`[OPTIMIZE] ${logInfo} >> ${outputPath}`);
	await sharp(inputPath)
		.resize({ width: 1600, withoutEnlargement: true })
		.webp({ quality: 80, effort: 6 })
		.toFile(outputPath);
}

async function optimizeDir(contentDir, staticDir) {
	await fs.mkdir(staticDir, { recursive: true });

	const entries = await fs.readdir(contentDir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(contentDir, entry.name);
		
		if (entry.isFile()) {
			const ext = path.extname(entry.name).toLowerCase();
			if (!validExts.includes(ext)) continue;

			const outputPath = path.join(staticDir, `${path.parse(entry.name).name}.webp`);
			await optimizeFile(fullPath, outputPath, entry.name);
		} else if (entry.isDirectory()) {
			if (entry.name === 'media') {
				// Shared media folder (flat structure)
				const images = await fs.readdir(fullPath);
				for (const image of images) {
					const ext = path.extname(image).toLowerCase();
					if (!validExts.includes(ext)) continue;

					const outputPath = path.join(staticDir, `${path.parse(image).name}.webp`);
					await optimizeFile(path.join(fullPath, image), outputPath, `media/${image}`);
				}
			} else {
				// Nested structure (slug/media)
				const slug = entry.name;
				const mediaDir = path.join(fullPath, 'media');
				const targetDir = path.join(staticDir, slug);

				try {
					await fs.access(mediaDir);
				} catch {
					continue;
				}

				await fs.mkdir(targetDir, { recursive: true });
				const images = await fs.readdir(mediaDir);
				for (const image of images) {
					const ext = path.extname(image).toLowerCase();
					if (!validExts.includes(ext)) continue;

					const outputPath = path.join(targetDir, `${path.parse(image).name}.webp`);
					await optimizeFile(path.join(mediaDir, image), outputPath, `${slug}/media/${image}`);
				}
			}
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

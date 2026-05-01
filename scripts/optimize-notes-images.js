import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const validExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];

async function optimizeFile(inputPath, outDir, baseName, logInfo) {
	const webpPath = path.join(outDir, `${baseName}.webp`);
	const jpgPath = path.join(outDir, `${baseName}.jpg`);

	let doWebp = true;
	let doJpg = true;

	try {
		await fs.access(webpPath);
		doWebp = false;
	} catch {
		// Nothing
	}
	try {
		await fs.access(jpgPath);
		doJpg = false;
	} catch {
		// Nothing
	}

	if (!doWebp && !doJpg) {
		console.log(`[SKIP] ${logInfo} (already exists)`);
		return;
	}

	console.log(`[OPTIMIZE] ${logInfo} >> ${outDir}/${baseName}.{webp,jpg}`);
	const pipeline = sharp(inputPath).resize({ width: 1600, withoutEnlargement: true });

	if (doWebp) {
		await pipeline.clone().webp({ quality: 80, effort: 6 }).toFile(webpPath);
	}
	if (doJpg) {
		await pipeline.clone().jpeg({ quality: 70 }).toFile(jpgPath);
	}
}

async function optimizeDir(contentDir, staticDir) {
	await fs.mkdir(staticDir, { recursive: true });

	const entries = await fs.readdir(contentDir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(contentDir, entry.name);

		if (entry.isFile()) {
			const ext = path.extname(entry.name).toLowerCase();
			if (!validExts.includes(ext)) continue;

			const baseName = path.parse(entry.name).name;
			await optimizeFile(fullPath, staticDir, baseName, entry.name);
		} else if (entry.isDirectory()) {
			if (entry.name === 'media') {
				// Shared media folder (flat structure)
				const images = await fs.readdir(fullPath);
				for (const image of images) {
					const ext = path.extname(image).toLowerCase();
					if (!validExts.includes(ext)) continue;

					const baseName = path.parse(image).name;
					await optimizeFile(path.join(fullPath, image), staticDir, baseName, `media/${image}`);
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

					const baseName = path.parse(image).name;
					await optimizeFile(
						path.join(mediaDir, image),
						targetDir,
						baseName,
						`${slug}/media/${image}`
					);
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

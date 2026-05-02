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
				// Slug directory (e.g. content/notes/001-...)
				const slug = entry.name;
				const targetDir = path.join(staticDir, slug);
				await fs.mkdir(targetDir, { recursive: true });

				const files = await fs.readdir(fullPath);
				for (const file of files) {
					const ext = path.extname(file).toLowerCase();
					if (!validExts.includes(ext)) continue;

					const baseName = path.parse(file).name;
					await optimizeFile(path.join(fullPath, file), targetDir, baseName, `${slug}/${file}`);
				}
			}
		}
	}
}

async function optimize() {
	await optimizeDir('content/notes', 'static/images/notes');
	await optimizeDir('content/products', 'static/images/products');
	await optimizeDir('content/mailings', 'static/images/mailings');
	console.log('✓ Optimization complete.');
}

optimize().catch((err) => {
	console.error('✗ Optimization failed:', err);
	process.exit(1);
});

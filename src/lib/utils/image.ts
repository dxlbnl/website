/**
 * Resolves a relative media path from a log entry to its optimized static path.
 * Example: 'media/photo.png' -> '/images/notes/note-slug/photo.webp'
 */
export function resolveLogImage(path: string, slug: string): string {
  if (!path || !slug) return path;
  if (path.startsWith("http") || path.startsWith("/")) return path;

  const filename = path.split("/").pop()?.split(".")[0];
  return `/images/notes/${slug}/${filename}.webp`;
}

/**
 * Resolves a relative media path for a product to its optimized static path.
 * Example: 'media/photo.png' -> '/images/products/product-id/photo.webp'
 */
export function resolveProductImage(path: string, id: string): string {
  if (!path || !id) return path;

  if (path.startsWith("media/") || path.startsWith("./media/")) {
    const filename = path.split("/").pop()?.split(".")[0];
    return `/images/products/${filename}.webp`;
  }

  return path;
}

export function resolveProjectImage(path: string): string {
  if (!path) return path;
  if (path.startsWith("http") || path.startsWith("/")) return path;
  if (path.startsWith("media/") || path.startsWith("./media/")) {
    const filename = path.split("/").pop()?.split(".")[0];
    return `/images/projects/${filename}.webp`;
  }
  return path;
}

export function vercelImg(path: string, width: number, quality = 80): string {
  if (import.meta.env.DEV) return path;
  return `/_vercel/image?url=${encodeURIComponent(path)}&w=${width}&q=${quality}`;
}

export function vercelSrcset(path: string, widths: number[], quality = 80): string {
  if (import.meta.env.DEV) return path;
  return widths.map((w) => `${vercelImg(path, w, quality)} ${w}w`).join(", ");
}

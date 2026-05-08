import type { ProductFrontmatter } from "$lib/types";
import type { PageServerLoad } from "./$types";

export const prerender = false;

type ProductModule = { metadata: ProductFrontmatter };
const productModules = import.meta.glob<ProductModule>("/content/products/*.md");

export const load: PageServerLoad = async ({ url }) => {
  const productId = url.searchParams.get("product");
  let product: ProductFrontmatter | undefined;

  if (productId) {
    const loadProduct = productModules[`/content/products/${productId}.md`];
    if (loadProduct) {
      product = (await loadProduct()).metadata;
    }
  }

  return { product };
};

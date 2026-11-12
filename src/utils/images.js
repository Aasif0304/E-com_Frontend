import { getAssetUrl } from "../api/axios";

/**
 * Resolve all image URLs for a product or cart item.
 * Prefers `image_urls` when non-empty, falling back to `[image_url]`,
 * and prefixes relative paths (e.g. `/img/...`) with `API_BASE_URL`.
 */
export function getProductImages(product) {
  if (!product) return [];
  const rawPaths = product.image_urls?.length
    ? product.image_urls
    : product.image_url
      ? [product.image_url]
      : [];

  return rawPaths.filter(Boolean).map(getAssetUrl);
}

/**
 * Return the resolved primary image URL for a product or cart item, or "".
 */
export function getPrimaryProductImage(product) {
  return getProductImages(product)[0] || "";
}


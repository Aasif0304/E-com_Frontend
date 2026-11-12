/**
 * Check whether a product matches a search query across name, ID,
 * description, category, or brand.
 */
export function matchesProductSearch(product, query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return true;

  const idStr = String(product?.id ?? "").toLowerCase();
  const categoryName = (
    product?.category?.name ||
    product?.category_name ||
    ""
  ).toLowerCase();

  return (
    idStr === q ||
    idStr.includes(q) ||
    Boolean(product?.name?.toLowerCase().includes(q)) ||
    Boolean(product?.brand?.toLowerCase().includes(q)) ||
    Boolean(product?.description?.toLowerCase().includes(q)) ||
    Boolean(categoryName.includes(q))
  );
}


import type { Product } from "@/types/product";

export function isCollectionIndexable(path: string, products: Product[]) {
  const normalized = path.replace(/^\//, "");
  if (!normalized.startsWith("collections/")) return true;
  const slug = normalized.slice("collections/".length);
  return products.some(product => !product.demo && product.collections.some(value => value === slug));
}

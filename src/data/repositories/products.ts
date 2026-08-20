import { products, getProduct } from "@/data/fixtures/products";
import type { CollectionSlug, Product } from "@/types/product";

export interface ProductRepository { getAll(): Promise<Product[]>; getBySlug(slug: string): Promise<Product | null>; getByCollection(collection: CollectionSlug): Promise<Product[]>; }
export const fixtureProductRepository: ProductRepository = {
  async getAll() { return products; }, async getBySlug(slug) { return getProduct(slug) || null; }, async getByCollection(collection) { return products.filter((p) => p.collections.includes(collection)); },
};

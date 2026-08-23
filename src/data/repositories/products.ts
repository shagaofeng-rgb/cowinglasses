import "server-only";
import { asc, eq, inArray } from "drizzle-orm";
import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { productMedia, productOptionValues, productOptions, products as productTable, productSkus } from "@/db/schema";
import { products as fixtureProducts } from "@/data/fixtures/products";
import type { CollectionSlug, Product } from "@/types/product";

export interface ProductRepository {
  getAll(): Promise<Product[]>;
  getBySlug(slug: string): Promise<Product | null>;
  getByCollection(collection: CollectionSlug): Promise<Product[]>;
}

/** Public catalogue boundary with a safe fallback before Neon catalogue import. */
export const fixtureProductRepository: ProductRepository = {
  async getAll() { return fixtureProducts; },
  async getBySlug(slug) { return fixtureProducts.find((product) => product.slug === slug) ?? null; },
  async getByCollection(collection) { return fixtureProducts.filter((product) => product.collections.includes(collection)); },
};

type DatabaseProduct = typeof productTable.$inferSelect;

export async function getStoreProducts(): Promise<Product[]> {
  if (!isDatabaseConfigured()) return fixtureProducts;
  try {
    const db = getDatabase();
    const records = await db.select().from(productTable).where(eq(productTable.status, "active")).orderBy(asc(productTable.publishedAt), asc(productTable.createdAt));
    if (!records.length) return fixtureProducts;

    const productIds = records.map((record) => record.id);
    const [skus, options, media] = await Promise.all([
      db.select().from(productSkus).where(inArray(productSkus.productId, productIds)).orderBy(asc(productSkus.createdAt)),
      db.select().from(productOptions).where(inArray(productOptions.productId, productIds)).orderBy(asc(productOptions.position)),
      db.select().from(productMedia).where(inArray(productMedia.productId, productIds)).orderBy(asc(productMedia.position)),
    ]);
    const optionIds = options.map((option) => option.id);
    const optionValues = optionIds.length ? await db.select().from(productOptionValues).where(inArray(productOptionValues.optionId, optionIds)).orderBy(asc(productOptionValues.position)) : [];
    return records.map((record) => toStoreProduct(record, skus, options, optionValues, media));
  } catch (error) {
    console.error("读取商城商品目录失败，已使用静态安全回退。", error);
    return fixtureProducts;
  }
}

export async function getStoreProduct(slug: string): Promise<Product | null> {
  return (await getStoreProducts()).find((product) => product.slug === slug) ?? null;
}

function toStoreProduct(record: DatabaseProduct, skus: Array<typeof productSkus.$inferSelect>, options: Array<typeof productOptions.$inferSelect>, optionValues: Array<typeof productOptionValues.$inferSelect>, media: Array<typeof productMedia.$inferSelect>): Product {
  const fallback = fixtureProducts.find((product) => product.slug === record.slug);
  const productSkusForRecord = skus.filter((sku) => sku.productId === record.id && sku.isActive);
  const option = options.find((candidate) => candidate.productId === record.id && candidate.name.toLowerCase() === "color");
  const values = option ? optionValues.filter((value) => value.optionId === option.id) : [];
  const mediaForRecord = media.filter((item) => item.productId === record.id);
  const firstSku = productSkusForRecord[0];
  const colors = productSkusForRecord.map((sku, index) => {
    const selectedValue = values.find((value) => sku.optionValueIds.includes(value.id));
    const skuMedia = mediaForRecord.filter((item) => item.skuId === sku.id && item.mediaType === "image").map((item) => item.url);
    const fallbackColor = fallback?.colors[index] ?? fallback?.colors[0];
    return { id: fallbackColor?.id ?? sku.id, skuId: sku.id, name: { en: selectedValue?.value ?? fallbackColor?.name.en ?? "Standard" }, hex: selectedValue?.swatchValue ?? fallbackColor?.hex ?? "#202225", images: skuMedia.length ? skuMedia : fallbackColor?.images ?? [], available: true };
  });
  const primaryImage = mediaForRecord.find((item) => item.mediaType === "image")?.url ?? colors[0]?.images[0] ?? fallback?.heroImage ?? "/images/demo/product-pro-v2.png";
  const detailImages = mediaForRecord.filter((item) => item.mediaType === "detail").map((item) => item.url);

  return {
    id: fallback?.id ?? record.slug, slug: record.slug, demo: false, usdPrice: Number(firstSku?.price ?? fallback?.usdPrice ?? 0), compareAtUsdPrice: firstSku?.compareAtPrice ? Number(firstSku.compareAtPrice) : fallback?.compareAtUsdPrice, heroImage: primaryImage,
    name: { en: record.name }, tagline: { en: record.shortDescription ?? fallback?.tagline.en ?? "Product configuration confirmed by sales before payment." }, description: { en: record.description ?? fallback?.description.en ?? "Product information is confirmed by sales before payment." },
    collections: fallback?.collections ?? ["everyday"], features: fallback?.features ?? [], frameStyle: fallback?.frameStyle ?? "wayfarer", lensType: fallback?.lensType ?? "clear",
    colors: colors.length ? colors : (fallback?.colors ?? [{ id: record.slug, skuId: firstSku?.id, name: { en: "Standard" }, hex: "#202225", images: [primaryImage], available: true }]),
    detailImages: detailImages.length ? detailImages : fallback?.detailImages, technicalDiagram: mediaForRecord.find((item) => item.mediaType === "diagram")?.url ?? fallback?.technicalDiagram,
    camera: fallback?.camera, translationNote: fallback?.translationNote, prescriptionNote: fallback?.prescriptionNote,
    specifications: fallback?.specifications ?? [{ label: { en: "Product information" }, value: { en: "Configuration is confirmed by sales before payment." } }], inTheBox: fallback?.inTheBox ?? [{ en: "Final contents are confirmed by sales with your order request." }], compatibility: fallback?.compatibility ?? { en: "Contact sales to confirm configuration and compatibility." }, faq: fallback?.faq ?? [],
    seo: { title: { en: record.seoTitle ?? fallback?.seo.title.en ?? `${record.name} | CoWin` }, description: { en: record.seoDescription ?? fallback?.seo.description.en ?? `${record.name}.` } },
  };
}

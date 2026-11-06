import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { retryDatabaseRead } from "@/db/read-retry";
import { and, asc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { inventoryLevels, productMedia, productOptionValues, productOptions, products as productTable, productSkus } from "@/db/schema";
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

export const storeCatalogueTag = "storefront-catalogue";

const loadCachedStoreProducts = unstable_cache(
  () => retryDatabaseRead(loadStoreProducts),
  [storeCatalogueTag, process.env.VERCEL_GIT_COMMIT_SHA ?? "local"],
  { tags: [storeCatalogueTag], revalidate: 7200 },
);

const quoteOnlyFixtures = fixtureProducts.map((product) => ({
  ...product,
  colors: product.colors.map((color) => ({ ...color, available: false })),
}));

export const getStoreProducts = cache(async () => {
  if (!isDatabaseConfigured()) return quoteOnlyFixtures;
  return loadCachedStoreProducts();
});

async function loadStoreProducts(): Promise<Product[]> {
  if (!isDatabaseConfigured()) return quoteOnlyFixtures;
  try {
    const db = getDatabase();
    const records = await db.select().from(productTable).where(eq(productTable.status, "active")).orderBy(asc(productTable.publishedAt), asc(productTable.createdAt));
    if (!records.length) return [];

    const productIds = records.map((record) => record.id);
    const [skus, options, media, stock] = await Promise.all([
      db.select().from(productSkus).where(inArray(productSkus.productId, productIds)).orderBy(asc(productSkus.createdAt), asc(productSkus.id)),
      db.select().from(productOptions).where(inArray(productOptions.productId, productIds)).orderBy(asc(productOptions.position)),
      db.select().from(productMedia).where(inArray(productMedia.productId, productIds)).orderBy(asc(productMedia.position)),
      db.select({
        skuId: inventoryLevels.skuId,
        quantity: sql<number>`greatest(0, max(${inventoryLevels.onHand} - ${inventoryLevels.reserved}))`.mapWith(Number),
      }).from(inventoryLevels)
        .innerJoin(productSkus, eq(productSkus.id, inventoryLevels.skuId))
        .where(and(inArray(productSkus.productId, productIds), isNotNull(inventoryLevels.verifiedAt)))
        .groupBy(inventoryLevels.skuId),
    ]);
    const optionIds = options.map((option) => option.id);
    const optionValues = optionIds.length ? await db.select().from(productOptionValues).where(inArray(productOptionValues.optionId, optionIds)).orderBy(asc(productOptionValues.position)) : [];
    const stockBySku = new Map(stock.map((row) => [row.skuId, row.quantity]));
    return records.map((record) => toStoreProduct(record, skus, options, optionValues, media, stockBySku));
  } catch (error) {
    console.error("读取商城商品目录失败。", error);
    throw error;
  }
}

export async function getStoreProduct(slug: string): Promise<Product | null> {
  return (await getStoreProducts()).find((product) => product.slug === slug) ?? null;
}

function toStoreProduct(record: DatabaseProduct, skus: Array<typeof productSkus.$inferSelect>, options: Array<typeof productOptions.$inferSelect>, optionValues: Array<typeof productOptionValues.$inferSelect>, media: Array<typeof productMedia.$inferSelect>, stockBySku: ReadonlyMap<string, number>): Product {
  const fallback = fixtureProducts.find((product) => product.slug === record.slug);
  const productSkusForRecord = skus.filter((sku) => sku.productId === record.id && sku.isActive);
  const option = options.find((candidate) => candidate.productId === record.id && candidate.name.toLowerCase() === "color");
  const values = option ? optionValues.filter((value) => value.optionId === option.id) : [];
  const mediaForRecord = media.filter((item) => item.productId === record.id);
  const firstSku = productSkusForRecord.find((sku) => (stockBySku.get(sku.id) ?? 0) > 0) ?? productSkusForRecord[0];
  const colors = productSkusForRecord.map((sku, index) => {
    const selectedValue = values.find((value) => sku.optionValueIds.includes(value.id));
    const skuMedia = mediaForRecord.filter((item) => item.skuId === sku.id && item.mediaType === "image").map((item) => item.url);
    const fallbackColor = selectedValue
      ? fallback?.colors.find((color) => color.name.en.toLowerCase() === selectedValue.value.toLowerCase())
      : fallback?.colors[index];
    const availableQuantity = stockBySku.get(sku.id);
    return {
      id: fallbackColor?.id ?? sku.id,
      skuId: sku.id,
      name: { ...fallbackColor?.name, en: selectedValue?.value ?? fallbackColor?.name.en ?? "Standard" },
      hex: selectedValue?.swatchValue ?? fallbackColor?.hex ?? "#202225",
      images: skuMedia.length ? skuMedia : fallbackColor?.images ?? [],
      available: (availableQuantity ?? 0) > 0,
      availableQuantity,
      usdPrice: Number(sku.price),
      compareAtUsdPrice: sku.compareAtPrice === null ? undefined : Number(sku.compareAtPrice),
    };
  });
  const primaryImage = mediaForRecord.find((item) => item.mediaType === "image")?.url ?? colors[0]?.images[0] ?? fallback?.heroImage ?? "/images/demo/product-pro-v2.png";
  const detailImages = mediaForRecord.filter((item) => item.mediaType === "detail").map((item) => item.url);

  return {
    id: fallback?.id ?? record.slug, slug: record.slug, demo: false, usdPrice: Number(firstSku?.price ?? fallback?.usdPrice ?? 0), compareAtUsdPrice: firstSku?.compareAtPrice ? Number(firstSku.compareAtPrice) : fallback?.compareAtUsdPrice, heroImage: primaryImage,
    name: { en: record.name }, tagline: { en: record.shortDescription ?? fallback?.tagline.en ?? "Product configuration confirmed by sales before payment." }, description: { en: record.description ?? fallback?.description.en ?? "Product information is confirmed by sales before payment." },
    collections: fallback?.collections ?? ["everyday"], features: fallback?.features ?? [], frameStyle: fallback?.frameStyle ?? "wayfarer", lensType: fallback?.lensType ?? "clear",
    colors: colors.length ? colors : (fallback?.colors ?? [{ id: record.slug, name: { en: "Standard" }, hex: "#202225", images: [primaryImage] }])
      .map((color) => ({ ...color, available: false, skuId: undefined })),
    detailImages: detailImages.length ? detailImages : fallback?.detailImages, technicalDiagram: mediaForRecord.find((item) => item.mediaType === "diagram")?.url ?? fallback?.technicalDiagram,
    camera: fallback?.camera, translationNote: fallback?.translationNote, prescriptionNote: fallback?.prescriptionNote,
    specifications: fallback?.specifications ?? [{ label: { en: "Product information" }, value: { en: "Configuration is confirmed by sales before payment." } }], inTheBox: fallback?.inTheBox ?? [{ en: "Final contents are confirmed by sales with your order request." }], compatibility: fallback?.compatibility ?? { en: "Contact sales to confirm configuration and compatibility." }, faq: fallback?.faq ?? [],
    seo: { title: { en: record.seoTitle ?? fallback?.seo.title.en ?? `${record.name} | CoWin` }, description: { en: record.seoDescription ?? fallback?.seo.description.en ?? `${record.name}.` } },
  };
}

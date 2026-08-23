import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { products as catalogue } from "../src/data/fixtures/products";
import { productMedia, productOptionValues, productOptions, products, productSkus } from "../src/db/schema";

function skuCode(slug: string, color: string, index: number) {
  const normalized = color.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${slug.toUpperCase()}-${normalized || index + 1}`.slice(0, 128);
}

async function seedCatalogue() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL 未配置，不能导入商城目录。");
  const client = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
  const db = drizzle(client);
  let created = 0;
  let skipped = 0;

  try {
    for (const product of catalogue.filter((item) => !item.demo)) {
      const existing = await db.select({ id: products.id }).from(products).where(eq(products.slug, product.slug)).limit(1);
      if (existing[0]) {
        skipped += 1;
        continue;
      }

      await db.transaction(async (transaction) => {
        const [createdProduct] = await transaction.insert(products).values({
          name: product.name.en,
          slug: product.slug,
          shortDescription: product.tagline.en,
          description: product.description.en,
          status: "active",
          seoTitle: product.seo.title.en,
          seoDescription: product.seo.description.en,
          publishedAt: new Date(),
        }).returning({ id: products.id });
        if (!createdProduct) throw new Error(`无法创建商品 ${product.slug}`);

        const [colorOption] = await transaction.insert(productOptions).values({ productId: createdProduct.id, name: "Color", position: 0 }).returning({ id: productOptions.id });
        if (!colorOption) throw new Error(`无法创建颜色规格 ${product.slug}`);

        for (const [index, color] of product.colors.entries()) {
          const [optionValue] = await transaction.insert(productOptionValues).values({ optionId: colorOption.id, value: color.name.en, swatchValue: color.hex, position: index }).returning({ id: productOptionValues.id });
          if (!optionValue) throw new Error(`无法创建颜色 ${product.slug}`);
          const [sku] = await transaction.insert(productSkus).values({
            productId: createdProduct.id,
            sku: skuCode(product.slug, color.name.en, index),
            optionValueIds: [optionValue.id],
            price: product.usdPrice.toFixed(2),
            compareAtPrice: product.compareAtUsdPrice?.toFixed(2),
            isActive: color.available,
          }).returning({ id: productSkus.id });
          if (!sku) throw new Error(`无法创建 SKU ${product.slug}`);

          const images = color.images.length ? color.images : [product.heroImage];
          await transaction.insert(productMedia).values(images.map((url, position) => ({
            productId: createdProduct.id,
            skuId: sku.id,
            url,
            altText: `${product.name.en} ${color.name.en}`,
            mediaType: "image",
            position: index * 100 + position,
          })));
        }

        if (product.technicalDiagram) await transaction.insert(productMedia).values({ productId: createdProduct.id, url: product.technicalDiagram, altText: `${product.name.en} dimensions`, mediaType: "diagram", position: 9000 });
        if (product.detailImages?.length) await transaction.insert(productMedia).values(product.detailImages.map((url, position) => ({ productId: createdProduct.id, url, altText: `${product.name.en} detail ${position + 1}`, mediaType: "detail", position: 10000 + position })));
      });
      created += 1;
    }
    console.info(`商城目录导入完成：新增 ${created}，已存在跳过 ${skipped}。`);
  } finally {
    await client.end({ timeout: 5 });
  }
}

seedCatalogue().catch((error) => {
  console.error("商城目录导入失败", error);
  process.exitCode = 1;
});

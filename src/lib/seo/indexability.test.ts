import assert from "node:assert/strict";
import test from "node:test";
import { products } from "@/data/fixtures/products";
import { getProductLanguageAlternates, getProductSearchLocales, isProductLocaleIndexable } from "@/lib/seo/product-indexability";
import { indexableStorefrontPaths, noIndexStorefrontPaths } from "@/lib/seo/sitemap-config";

test("demo catalogue entries are not eligible for search indexing", () => {
  const demo = products.find((product) => product.demo);
  assert.ok(demo);
  assert.deepEqual(getProductSearchLocales(demo), []);
});

test("English-only product data produces one canonical search locale", () => {
  const product = products.find((entry) => !entry.demo && entry.name.en === "G200 Sport Audio Glasses");
  assert.ok(product);
  assert.equal(isProductLocaleIndexable(product, "en"), true);
  assert.equal(isProductLocaleIndexable(product, "ar"), false);
  assert.deepEqual(getProductSearchLocales(product), ["en"]);
  assert.deepEqual(getProductLanguageAlternates(product), { en: "/en/products/g200-sport-audio-glasses" });
});

test("transactional routes are excluded from sitemap configuration", () => {
  const publicPaths: readonly string[] = indexableStorefrontPaths;
  assert.equal(publicPaths.includes("/cart"), false);
  assert.equal(publicPaths.includes("/checkout"), false);
  assert.equal(publicPaths.includes("/account"), false);
  assert.equal(noIndexStorefrontPaths.has("cart"), true);
});

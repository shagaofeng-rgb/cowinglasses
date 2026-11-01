import assert from "node:assert/strict";
import test from "node:test";
import { products } from "@/data/fixtures/products";
import { getProductLanguageAlternates, getProductSearchLocales, isProductLocaleIndexable } from "@/lib/seo/product-indexability";
import { indexableStorefrontPaths, noIndexStorefrontPaths } from "@/lib/seo/sitemap-config";
import { legacyStorefrontRedirects } from "@/lib/seo/legacy-redirects";
import { isCollectionIndexable } from "@/lib/seo/collection-indexability";
import { learning, collectionTitles } from "@/messages/learning";
import { locales } from "@/types/localization";

test("learning pages have complete translated search-facing content", () => {
  for (const locale of locales) {
    for (const kind of ["how", "lens", "app"] as const) {
      const guide = learning[locale][kind];
      assert.equal(guide.steps.length, 3);
      assert.ok(guide.steps.every(([title, body]) => title.trim() && body.trim()));
      if (locale !== "en") {
        assert.notEqual(guide.title, learning.en[kind].title);
        assert.notEqual(guide.intro, learning.en[kind].intro);
      }
    }
    assert.deepEqual(Object.keys(collectionTitles[locale]), Object.keys(collectionTitles.en));
  }
});

test("empty and demo-only collections stay out of search until real products are assigned", () => {
  assert.equal(isCollectionIndexable("/collections/photochromic-sun", []), false);
  assert.equal(isCollectionIndexable("collections/photochromic-sun", products.filter(p => p.demo)), false);
  const live = products.find(p => !p.demo);
  assert.ok(live);
  assert.equal(isCollectionIndexable(`collections/${live.collections[0]}`, [live]), true);
  assert.equal(isCollectionIndexable("/shop", []), true);
});

test("legacy redirects only map confirmed same-content paths to existing destinations", () => {
  assert.equal(legacyStorefrontRedirects.length, 10);
  for (const rule of legacyStorefrontRedirects) {
    assert.equal(rule.destination, `/en${rule.source}`);
    assert.equal(rule.permanent, true);
    assert.ok((indexableStorefrontPaths as readonly string[]).includes(rule.source));
  }
  assert.ok(!legacyStorefrontRedirects.some(rule => ["/$", "/&"].includes(rule.source)));
});

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

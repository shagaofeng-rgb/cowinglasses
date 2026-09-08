import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getPublishedArticles } from "@/data/repositories/articles";
import { getStoreProducts } from "@/data/repositories/products";
import { locales } from "@/types/localization";
import { getProductSearchLocales } from "@/lib/seo/product-indexability";
import { indexableStorefrontPaths } from "@/lib/seo/sitemap-config";
export const revalidate = 300;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [catalogue, localizedArticles] = await Promise.all([
    getStoreProducts(),
    Promise.all(locales.map(async (locale) => ({
      locale,
      articles: [...await getPublishedArticles("news", locale), ...await getPublishedArticles("blog", locale)]
        .filter((article) => locale === "en" || article.contentLocale === locale),
    }))),
  ]);
  const contentUpdatedAt = new Date(siteConfig.contentUpdatedAt);

  return [
    ...locales.flatMap((locale) => indexableStorefrontPaths.map((path) => ({
      url: `${siteConfig.url}/${locale}${path}`,
      lastModified: contentUpdatedAt,
    }))),
    ...catalogue
      .filter((product) => !product.demo)
      .flatMap((product) => getProductSearchLocales(product).map((locale) => ({
        url: `${siteConfig.url}/${locale}/products/${product.slug}`,
        lastModified: contentUpdatedAt,
      }))),
    ...localizedArticles.flatMap(({ locale, articles }) => articles.map((article) => ({
      url: `${siteConfig.url}/${locale}/${article.type}/${article.slug}`,
      lastModified: article.updatedAt,
    }))),
  ];
}

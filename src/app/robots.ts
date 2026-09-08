import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getPublishedArticles } from "@/data/repositories/articles";
import { locales } from "@/types/localization";

export const revalidate = 300;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const cutoff = Date.now() - 2 * 86_400_000;
  const hasFreshNews = (await Promise.all(locales.map((locale) => getPublishedArticles("news", locale))))
    .flat()
    .some((article) => article.publishedAt && article.publishedAt.getTime() >= cutoff);

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] },
    sitemap: [
      `${siteConfig.url}/sitemap.xml`,
      ...(hasFreshNews ? [`${siteConfig.url}/news-sitemap.xml`] : []),
    ],
  };
}

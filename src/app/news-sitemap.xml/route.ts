import { siteConfig } from "@/config/site";
import { getPublishedArticles } from "@/data/repositories/articles";
import { locales } from "@/types/localization";

export const dynamic = "force-dynamic";

function xml(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;"); }

export async function GET() {
  const cutoff = Date.now() - 2 * 86_400_000;
  const localized = await Promise.all(locales.map(async (locale) => ({ locale, articles: (await getPublishedArticles("news", locale)).filter((article) => article.publishedAt && article.publishedAt.getTime() >= cutoff && (locale === "en" || article.contentLocale === locale)) })));
  const urls = localized.flatMap(({ locale, articles }) => articles.map((article) => `<url><loc>${xml(`${siteConfig.url}/${locale}/news/${article.slug}`)}</loc><news:news><news:publication><news:name>CoWin Glasses</news:name><news:language>${locale}</news:language></news:publication><news:publication_date>${article.publishedAt!.toISOString()}</news:publication_date><news:title>${xml(article.title)}</news:title></news:news></url>`));
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls.join("")}</urlset>`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } });
}

import { siteConfig } from "@/config/site";
import { getPublishedArticle, getPublishedArticles } from "@/data/repositories/articles";

export const dynamic = "force-dynamic";

function xml(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;"); }

export async function GET() {
  const summaries = (await getPublishedArticles("news", "en")).slice(0, 50);
  const articles = await Promise.all(summaries.map(async (article) => await getPublishedArticle("news", article.slug, "en") ?? article));
  const items = articles.map((article) => { const link = `${siteConfig.url}/en/news/${article.slug}`; const source = article.sources[0]; return `<item><title>${xml(article.title)}</title><link>${xml(link)}</link><guid isPermaLink="true">${xml(link)}</guid><description>${xml(article.excerpt || "")}</description><pubDate>${(article.publishedAt ?? article.updatedAt).toUTCString()}</pubDate><category>Smart Eyewear News</category>${source ? `<source url="${xml(source.url)}">${xml(source.name)}</source>` : ""}</item>`; }).join("");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>CoWin Glasses News</title><link>${xml(`${siteConfig.url}/en/news`)}</link><description>Verified smart-eyewear, connectivity and creator-technology news.</description><language>en</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}</channel></rss>`;
  return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } });
}

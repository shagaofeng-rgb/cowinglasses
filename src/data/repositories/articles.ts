import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { and, asc, desc, eq, inArray, lte } from "drizzle-orm";
import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { retryDatabaseRead } from "@/db/read-retry";
import { articleSources, contentArticles, contentArticleTranslations } from "@/db/schema";
import type { Locale } from "@/types/localization";

export type PublicArticleType = "news" | "blog";
export type PublicArticleSource = typeof articleSources.$inferSelect;
export type PublicArticleSummary = {
  id: string; type: string; title: string; slug: string; excerpt: string | null;
  imageUrl: string | null; imageAlt: string | null; authorName: string;
  publishedAt: Date | null; updatedAt: Date; contentLocale: Locale;
};
export type PublicArticle = PublicArticleSummary & {
  body: string | null; seoTitle: string | null; seoDescription: string | null;
  seoKeywords: string | null; editorialDisclaimer: string | null;
  keyTakeaways: string[]; sources: PublicArticleSource[];
};

export const publicEditorialTag = "public-editorial";
const editorialCacheOptions = { tags: [publicEditorialTag], revalidate: 7200 };
const deployment = process.env.VERCEL_GIT_COMMIT_SHA ?? "local";
const article = contentArticles;
const translation = contentArticleTranslations;
const summaryColumns = {
  id: article.id, type: article.type, slug: article.slug, title: article.title,
  excerpt: article.excerpt, imageUrl: article.imageUrl, imageAlt: article.imageAlt,
  authorName: article.authorName, publishedAt: article.publishedAt, updatedAt: article.updatedAt,
};

function isPublicArticle() {
  return and(eq(article.status, "published"), lte(article.publishedAt, new Date()), inArray(article.type, ["news", "blog"]));
}

async function loadIndex() {
  const db = getDatabase();
  const entries = await db.select(summaryColumns).from(article)
    .where(isPublicArticle()).orderBy(desc(article.publishedAt), desc(article.updatedAt));
  const newsIds = entries.filter((entry) => entry.type === "news").slice(0, 50).map((entry) => entry.id);
  const [translations, feedSources] = await Promise.all([
    entries.length ? db.select({
      articleId: translation.articleId, locale: translation.locale, title: translation.title, excerpt: translation.excerpt,
    }).from(translation).where(inArray(translation.articleId, entries.map((entry) => entry.id))) : [],
    newsIds.length ? db.selectDistinctOn([articleSources.articleId], {
      articleId: articleSources.articleId, name: articleSources.name, url: articleSources.url,
    }).from(articleSources).where(inArray(articleSources.articleId, newsIds))
      .orderBy(asc(articleSources.articleId), desc(articleSources.isPrimary), asc(articleSources.id)) : [],
  ]);
  return { entries, translations, feedSources };
}

async function loadDetail(id: string) {
  const db = getDatabase();
  const [entry] = await db.select({
    ...summaryColumns, body: article.body, seoTitle: article.seoTitle, seoDescription: article.seoDescription,
    seoKeywords: article.seoKeywords, editorialDisclaimer: article.editorialDisclaimer,
  }).from(article).where(and(isPublicArticle(), eq(article.id, id)));
  if (!entry) return null;
  const [translations, sources] = await Promise.all([
    db.select({
      locale: translation.locale, title: translation.title, excerpt: translation.excerpt, body: translation.body,
      seoTitle: translation.seoTitle, seoDescription: translation.seoDescription, seoKeywords: translation.seoKeywords,
      keyTakeaways: translation.keyTakeaways,
    }).from(translation).where(eq(translation.articleId, id)),
    db.select().from(articleSources).where(eq(articleSources.articleId, id)).orderBy(desc(articleSources.isPrimary)),
  ]);
  return { entry, translations, sources };
}

const cachedIndex = unstable_cache(
  () => retryDatabaseRead(loadIndex),
  [publicEditorialTag, "index", deployment],
  editorialCacheOptions,
);
const cachedDetail = unstable_cache(
  ([id]: [id: string, revision: string]) => retryDatabaseRead(() => loadDetail(id)),
  [publicEditorialTag, "detail", deployment],
  editorialCacheOptions,
);
const getIndex = cache(async () => isDatabaseConfigured() ? cachedIndex() : null);

type EditorialIndex = Awaited<ReturnType<typeof loadIndex>>;
type SummaryRow = Awaited<ReturnType<typeof loadIndex>>["entries"][number];
type SummaryTranslation = Pick<Awaited<ReturnType<typeof loadIndex>>["translations"][number], "title" | "excerpt">;

function toSummary(entry: SummaryRow, locale: Locale, localized?: SummaryTranslation): PublicArticleSummary {
  return {
    id: entry.id, type: entry.type, slug: entry.slug, title: localized?.title || entry.title,
    excerpt: localized?.excerpt || entry.excerpt, imageUrl: entry.imageUrl,
    imageAlt: entry.imageAlt, authorName: entry.authorName,
    // The persistent Next cache serializes dates to ISO strings.
    publishedAt: entry.publishedAt ? new Date(entry.publishedAt) : null,
    updatedAt: new Date(entry.updatedAt), contentLocale: localized ? locale : "en",
  };
}

function summariesFromIndex(index: EditorialIndex, type: PublicArticleType, locale: Locale): PublicArticleSummary[] {
  const localized = new Map(index.translations.filter((row) => row.locale === locale).map((row) => [row.articleId, row]));
  return index.entries.filter((entry) => entry.type === type).map((entry) => toSummary(entry, locale, localized.get(entry.id)));
}

/** Shared public index: listing and sitemap reads never fetch article bodies. */
export const getPublishedArticles = cache(async (type: PublicArticleType, locale: Locale = "en"): Promise<PublicArticleSummary[]> => {
  const index = await getIndex();
  return index ? summariesFromIndex(index, type, locale) : [];
});

/** Only known, published slugs can trigger a detail read; all languages share its cache entry. */
export const getPublishedArticle = cache(async (type: PublicArticleType, slug: string, locale: Locale = "en"): Promise<PublicArticle | null> => {
  const index = await getIndex();
  const indexed = index?.entries.find((entry) => entry.type === type && entry.slug === slug);
  if (!indexed) return null;

  const detail = await cachedDetail([indexed.id, new Date(indexed.updatedAt).toISOString()]);
  if (!detail || detail.entry.slug !== slug || detail.entry.type !== type) return null;
  const { entry, translations, sources } = detail;
  const localized = translations.find((row) => row.locale === locale);
  return {
    ...toSummary(entry, locale, localized),
    body: localized?.body || entry.body, seoTitle: localized?.seoTitle || entry.seoTitle,
    seoDescription: localized?.seoDescription || entry.seoDescription, seoKeywords: localized?.seoKeywords || entry.seoKeywords,
    editorialDisclaimer: entry.editorialDisclaimer, keyTakeaways: localized?.keyTakeaways || [],
    sources: sources.map((source) => ({
      ...source, createdAt: new Date(source.createdAt),
      publishedAt: source.publishedAt ? new Date(source.publishedAt) : null,
    })),
  };
});

/** RSS uses the same index and its preferred source; no per-article body reads. */
export async function getNewsFeedArticles() {
  const index = await getIndex();
  if (!index) return [];
  const sources = new Map(index.feedSources.map((source) => [source.articleId, source]));
  return summariesFromIndex(index, "news", "en").slice(0, 50)
    .map((entry) => ({ ...entry, source: sources.get(entry.id) }));
}

import "server-only";

import { and, desc, eq, lte } from "drizzle-orm";
import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { articleSources, contentArticles, contentArticleTranslations } from "@/db/schema";
import type { Locale } from "@/types/localization";

export type PublicArticleType = "news" | "blog";
export type PublicArticleSource = typeof articleSources.$inferSelect;
export type PublicArticle = {
  id: string; type: string; title: string; slug: string; excerpt: string | null; body: string | null;
  seoTitle: string | null; seoDescription: string | null; seoKeywords: string | null;
  imageUrl: string | null; imageAlt: string | null; authorName: string; editorialDisclaimer: string | null;
  publishedAt: Date | null; updatedAt: Date; keyTakeaways: string[]; contentLocale: Locale; sources: PublicArticleSource[];
};

async function selectPublished(type: PublicArticleType, locale: Locale, slug?: string) {
  const filters = [eq(contentArticles.type, type), eq(contentArticles.status, "published"), lte(contentArticles.publishedAt, new Date())];
  if (slug) filters.push(eq(contentArticles.slug, slug));
  return getDatabase().select({ article: contentArticles, translation: contentArticleTranslations })
    .from(contentArticles)
    .leftJoin(contentArticleTranslations, and(eq(contentArticleTranslations.articleId, contentArticles.id), eq(contentArticleTranslations.locale, locale)))
    .where(and(...filters))
    .orderBy(desc(contentArticles.publishedAt), desc(contentArticles.updatedAt));
}

function localeFromValue(value: string): Locale { return (["en", "ar", "es", "pt", "ja", "ko"] as const).includes(value as Locale) ? value as Locale : "en"; }

function toPublicArticle(row: Awaited<ReturnType<typeof selectPublished>>[number], sources: PublicArticleSource[] = []): PublicArticle {
  const { article, translation } = row;
  return {
    id: article.id, type: article.type, slug: article.slug,
    title: translation?.title || article.title, excerpt: translation?.excerpt || article.excerpt, body: translation?.body || article.body,
    seoTitle: translation?.seoTitle || article.seoTitle, seoDescription: translation?.seoDescription || article.seoDescription, seoKeywords: translation?.seoKeywords || article.seoKeywords,
    imageUrl: article.imageUrl, imageAlt: article.imageAlt, authorName: article.authorName, editorialDisclaimer: article.editorialDisclaimer,
    publishedAt: article.publishedAt, updatedAt: article.updatedAt, keyTakeaways: translation?.keyTakeaways || [], contentLocale: translation ? localeFromValue(translation.locale) : "en", sources,
  };
}

/** Public editorial boundary. Draft, scheduled and offline records never leave this repository. */
export async function getPublishedArticles(type: PublicArticleType, locale: Locale = "en"): Promise<PublicArticle[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    return (await selectPublished(type, locale)).map((row) => toPublicArticle(row));
  } catch (error) {
    console.error(`Unable to read published ${type} articles.`, error);
    return [];
  }
}

export async function getPublishedArticle(type: PublicArticleType, slug: string, locale: Locale = "en"): Promise<PublicArticle | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const row = (await selectPublished(type, locale, slug))[0];
    if (!row) return null;
    const sources = await getDatabase().select().from(articleSources).where(eq(articleSources.articleId, row.article.id)).orderBy(desc(articleSources.isPrimary));
    return toPublicArticle(row, sources);
  } catch (error) {
    console.error(`Unable to read published ${type} article.`, error);
    return null;
  }
}

export async function getPublishedArticleUrls() {
  if (!isDatabaseConfigured()) return [];
  try {
    return await getDatabase().select({ type: contentArticles.type, slug: contentArticles.slug, publishedAt: contentArticles.publishedAt, updatedAt: contentArticles.updatedAt })
      .from(contentArticles).where(and(eq(contentArticles.status, "published"), lte(contentArticles.publishedAt, new Date()))).orderBy(desc(contentArticles.publishedAt));
  } catch (error) { console.error("Unable to read article URLs.", error); return []; }
}

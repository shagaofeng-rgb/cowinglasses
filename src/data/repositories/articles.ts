import "server-only";

import { and, desc, eq, lte } from "drizzle-orm";
import { getDatabase, isDatabaseConfigured } from "@/db/client";
import { contentArticles } from "@/db/schema";

export type PublicArticleType = "news" | "blog";
export type PublicArticle = Pick<
  typeof contentArticles.$inferSelect,
  "id" | "type" | "title" | "slug" | "excerpt" | "body" | "seoTitle" | "seoDescription" | "seoKeywords" | "publishedAt" | "updatedAt"
>;

/** Public editorial boundary. Draft, scheduled and offline records never leave this repository. */
export async function getPublishedArticles(type: PublicArticleType): Promise<PublicArticle[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    return await getDatabase()
      .select({
        id: contentArticles.id,
        type: contentArticles.type,
        title: contentArticles.title,
        slug: contentArticles.slug,
        excerpt: contentArticles.excerpt,
        body: contentArticles.body,
        seoTitle: contentArticles.seoTitle,
        seoDescription: contentArticles.seoDescription,
        seoKeywords: contentArticles.seoKeywords,
        publishedAt: contentArticles.publishedAt,
        updatedAt: contentArticles.updatedAt,
      })
      .from(contentArticles)
      .where(and(eq(contentArticles.type, type), eq(contentArticles.status, "published"), lte(contentArticles.publishedAt, new Date())))
      .orderBy(desc(contentArticles.publishedAt), desc(contentArticles.updatedAt));
  } catch (error) {
    console.error(`Unable to read published ${type} articles.`, error);
    return [];
  }
}

export async function getPublishedArticle(type: PublicArticleType, slug: string): Promise<PublicArticle | null> {
  const articles = await getPublishedArticles(type);
  return articles.find((article) => article.slug === slug) ?? null;
}

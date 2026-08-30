import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorialArticle } from "@/components/content/editorial-pages";
import { siteConfig } from "@/config/site";
import { getPublishedArticle } from "@/data/repositories/articles";
import { isLocale } from "@/lib/i18n";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const article = await getPublishedArticle("blog", slug);
  if (!article) return {};
  return { title: `${article.seoTitle || article.title} | ${siteConfig.name}`, description: article.seoDescription || article.excerpt || undefined, keywords: article.seoKeywords || undefined, alternates: { canonical: `/${locale}/blog/${article.slug}` } };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const article = await getPublishedArticle("blog", slug);
  if (!article) notFound();
  return <EditorialArticle locale={locale} type="blog" article={article} />;
}

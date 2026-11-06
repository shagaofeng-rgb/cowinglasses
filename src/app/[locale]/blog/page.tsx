import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorialIndex, editorialPageSize } from "@/components/content/editorial-pages";
import { getPublishedArticles } from "@/data/repositories/articles";
import { isLocale } from "@/lib/i18n";
import { messages } from "@/messages";
import { clampPage } from "@/components/commerce/pagination";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const hasArticles = (await getPublishedArticles("blog", locale)).length > 0;
  return { title: messages[locale].editorial.blogTitle, description: messages[locale].editorial.blogIntro, robots: hasArticles ? undefined : { index: false, follow: true }, alternates: { canonical: `/${locale}/blog` } };
}

export default async function BlogPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string }> }) {
  const { locale } = await params;
  const { page } = await searchParams;
  if (!isLocale(locale)) notFound();
  const articles = await getPublishedArticles("blog", locale);
  const pagination = clampPage(page, articles.length, editorialPageSize);
  return <EditorialIndex locale={locale} type="blog" articles={articles.slice(pagination.start, pagination.start + editorialPageSize)} currentPage={pagination.currentPage} totalPages={pagination.totalPages} />;
}

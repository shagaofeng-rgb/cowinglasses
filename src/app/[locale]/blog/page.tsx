import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorialIndex } from "@/components/content/editorial-pages";
import { siteConfig } from "@/config/site";
import { getPublishedArticles } from "@/data/repositories/articles";
import { isLocale } from "@/lib/i18n";
import { messages } from "@/messages";
import { clampPage } from "@/components/commerce/pagination";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: `${messages[locale].editorial.blogTitle} | ${siteConfig.name}`, description: messages[locale].editorial.blogIntro, alternates: { canonical: `/${locale}/blog` } };
}

export default async function BlogPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string }> }) {
  const { locale } = await params;
  const { page } = await searchParams;
  if (!isLocale(locale)) notFound();
  const articles = await getPublishedArticles("blog", locale);
  const pagination = clampPage(page, articles.length, 9);
  return <EditorialIndex locale={locale} type="blog" articles={articles.slice(pagination.start, pagination.start + 9)} currentPage={pagination.currentPage} totalPages={pagination.totalPages} />;
}

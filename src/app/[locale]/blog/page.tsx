import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditorialIndex } from "@/components/content/editorial-pages";
import { siteConfig } from "@/config/site";
import { getPublishedArticles } from "@/data/repositories/articles";
import { isLocale } from "@/lib/i18n";
import { messages } from "@/messages";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: `${messages[locale].editorial.blogTitle} | ${siteConfig.name}`, description: messages[locale].editorial.blogIntro, alternates: { canonical: `/${locale}/blog` } };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <EditorialIndex locale={locale} type="blog" articles={await getPublishedArticles("blog", locale)} />;
}

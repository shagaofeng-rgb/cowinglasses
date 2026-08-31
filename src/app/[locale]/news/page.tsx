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
  return { title: `${messages[locale].editorial.newsTitle} | ${siteConfig.name}`, description: messages[locale].editorial.newsIntro, alternates: { canonical: `/${locale}/news`, languages: { en: "/en/news", ar: "/ar/news", es: "/es/news", pt: "/pt/news", ja: "/ja/news", ko: "/ko/news", "x-default": "/en/news" } } };
}

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <EditorialIndex locale={locale} type="news" articles={await getPublishedArticles("news", locale)} />;
}

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
  const article = await getPublishedArticle("news", slug, locale);
  if (!article) return {};
  const canonicalLocale = article.contentLocale === locale ? locale : "en";
  return {
    title: `${article.seoTitle || article.title} | ${siteConfig.name}`,
    description: article.seoDescription || article.excerpt || undefined,
    keywords: article.seoKeywords || undefined,
    authors: [{ name: article.authorName }],
    alternates: { canonical: `/${canonicalLocale}/news/${article.slug}`, languages: { en: `/en/news/${article.slug}`, ar: `/ar/news/${article.slug}`, es: `/es/news/${article.slug}`, pt: `/pt/news/${article.slug}`, ja: `/ja/news/${article.slug}`, ko: `/ko/news/${article.slug}`, "x-default": `/en/news/${article.slug}` } },
    openGraph: { type: "article", title: article.title, description: article.excerpt || undefined, publishedTime: article.publishedAt?.toISOString(), modifiedTime: article.updatedAt.toISOString(), images: article.imageUrl ? [{ url: article.imageUrl, alt: article.imageAlt || article.title }] : undefined },
    twitter: { card: "summary_large_image", title: article.title, description: article.excerpt || undefined, images: article.imageUrl ? [article.imageUrl] : undefined },
  };
}

export default async function NewsArticlePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const article = await getPublishedArticle("news", slug, locale);
  if (!article) notFound();
  const url = `${siteConfig.url}/${locale}/news/${article.slug}`;
  const image = article.imageUrl ? (article.imageUrl.startsWith("http") ? article.imageUrl : `${siteConfig.url}${article.imageUrl}`) : undefined;
  const newsSchema = { "@context": "https://schema.org", "@type": "NewsArticle", headline: article.title, description: article.excerpt, image: image ? [image] : undefined, datePublished: article.publishedAt?.toISOString(), dateModified: article.updatedAt.toISOString(), author: { "@type": "Organization", name: article.authorName }, publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url }, mainEntityOfPage: { "@type": "WebPage", "@id": url }, articleSection: "Smart Eyewear News", keywords: article.seoKeywords, citation: article.sources.map((source) => source.url), inLanguage: locale };
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${siteConfig.url}/${locale}` }, { "@type": "ListItem", position: 2, name: "News", item: `${siteConfig.url}/${locale}/news` }, { "@type": "ListItem", position: 3, name: article.title, item: url }] };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsSchema) }}/><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}/><EditorialArticle locale={locale} type="news" article={article} /></>;
}

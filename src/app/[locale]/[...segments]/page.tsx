import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RoutePage } from "@/components/commerce/route-page";
import { isLocale } from "@/lib/i18n";
import { siteConfig } from "@/config/site";
import { getStoreProducts } from "@/data/repositories/products";
import { indexableStorefrontPaths, noIndexStorefrontPaths } from "@/lib/seo/sitemap-config";

const validPaths = new Set<string>([...indexableStorefrontPaths.map(path => path.replace(/^\//, "")), ...noIndexStorefrontPaths]);

export async function generateMetadata({ params }: { params: Promise<{ locale: string; segments?: string[] }> }): Promise<Metadata> {
  const { locale, segments = [] } = await params;
  const path = segments.join("/");
  if (!isLocale(locale) || !validPaths.has(path)) notFound();
  const label = path.replace(/\b\w/g, (character) => character.toUpperCase()) || "Shop";

  return {
    title: { absolute: `${label} | ${siteConfig.name}` },
    robots: noIndexStorefrontPaths.has(path) ? { index: false, follow: true } : undefined,
    alternates: {
      canonical: `/${locale}/${path}`,
      languages: {
        en: `/en/${path}`, ar: `/ar/${path}`, es: `/es/${path}`,
        pt: `/pt/${path}`, ja: `/ja/${path}`, ko: `/ko/${path}`,
      },
    },
  };
}
export default async function RoutedPage({ params }: { params: Promise<{ locale: string; segments?: string[] }> }) { const { locale, segments = [] } = await params; if (!isLocale(locale) || !validPaths.has(segments.join("/"))) notFound(); return <Suspense fallback={null}><RoutePage locale={locale} segments={segments} products={await getStoreProducts()}/></Suspense>; }

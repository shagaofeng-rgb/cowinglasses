import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { RoutePage } from "@/components/commerce/route-page";
import { StorefrontLoading } from "@/components/layout/storefront-loading";
import { shippingDestinationLabels } from "@/lib/shipping-destination-labels";
import { isLocale } from "@/lib/i18n";
import { siteConfig } from "@/config/site";
import { getStoreProducts } from "@/data/repositories/products";
import { indexableStorefrontPaths, noIndexStorefrontPaths } from "@/lib/seo/sitemap-config";
import { isCollectionIndexable } from "@/lib/seo/collection-indexability";
import { learning, collectionTitles } from "@/messages/learning";
import { messages } from "@/messages";

const validPaths = new Set<string>([...indexableStorefrontPaths.map(path => path.replace(/^\//, "")), ...noIndexStorefrontPaths]);

export async function generateMetadata({ params }: { params: Promise<{ locale: string; segments?: string[] }> }): Promise<Metadata> {
  const { locale, segments = [] } = await params;
  const path = segments.join("/");
  if (!isLocale(locale) || !validPaths.has(path)) notFound();
  const label = path.replace(/\b\w/g, (character) => character.toUpperCase()) || "Shop";
  const guide = path === "how-it-works" ? learning[locale].how : path === "lens-guide" ? learning[locale].lens : path === "app" ? learning[locale].app : undefined;
  const collectionTitle = path.startsWith("collections/") ? collectionTitles[locale][segments[1]] : undefined;
  const localizedTitle = guide?.title || collectionTitle || ({ support: messages[locale].support.title, "support/faq": messages[locale].support.faq, shop: messages[locale].shop.title } as Record<string, string>)[path] || label;
  const indexable = !noIndexStorefrontPaths.has(path) &&
    (!path.startsWith("collections/") || isCollectionIndexable(path, await getStoreProducts()));

  return {
    title: { absolute: `${localizedTitle} | ${siteConfig.name}` },
    description: guide?.intro || (collectionTitle ? messages[locale].shop.intro : undefined),
    robots: indexable ? undefined : { index: false, follow: true },
    alternates: {
      canonical: `/${locale}/${path}`,
      languages: indexable ? {
        en: `/en/${path}`, ar: `/ar/${path}`, es: `/es/${path}`,
        pt: `/pt/${path}`, ja: `/ja/${path}`, ko: `/ko/${path}`,
      } : undefined,
    },
  };
}
export default async function RoutedPage({ params }: { params: Promise<{ locale: string; segments?: string[] }> }) {
  const { locale, segments = [] } = await params;
  const path = segments.join("/");
  if (!isLocale(locale) || !validPaths.has(path)) notFound();

  const usesCatalogue = ["shop", "compare", "search", "cart", "checkout"].includes(path) || path.startsWith("collections/");
  // Display only. The order endpoint reads current SKU prices and inventory in its transaction.
  const products = usesCatalogue ? await getStoreProducts() : undefined;

  const destinationLabels = path === "checkout" || path === "support/shipping-delivery" ? shippingDestinationLabels(locale) : undefined;

  return <Suspense fallback={<StorefrontLoading />}><RoutePage locale={locale} segments={segments} products={products} destinationLabels={destinationLabels} /></Suspense>;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { RoutePage } from "@/components/commerce/route-page";
import { shippingDestinationLabels } from "@/lib/shipping-destination-labels";
import { isLocale, locales } from "@/lib/i18n";
import { siteConfig } from "@/config/site";
import { getStoreProducts } from "@/data/repositories/products";
import { noIndexStorefrontPaths, storefrontRoutePaths } from "@/lib/seo/sitemap-config";
import { isCollectionIndexable } from "@/lib/seo/collection-indexability";
import { learning, collectionTitles } from "@/messages/learning";
import { messages } from "@/messages";
import { storefrontLabels } from "@/messages/storefront";
import { faqCopy } from "@/messages/support";
import { policyCopy } from "@/messages/policies";
import { salesCopy } from "@/messages/sales";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; segments?: string[] }> }): Promise<Metadata> {
  const { locale, segments = [] } = await params;
  const path = segments.join("/");
  if (!isLocale(locale) || !storefrontRoutePaths.has(path)) notFound();
  const t = messages[locale];
  const sales = salesCopy[locale];
  const guide = path === "how-it-works" ? learning[locale].how : path === "lens-guide" ? learning[locale].lens : path === "app" ? learning[locale].app : undefined;
  const collectionTitle = path.startsWith("collections/") ? collectionTitles[locale][segments[1]] : undefined;
  const policy = policyCopy[locale].sections;
  const entries: Record<string, [title: string, description: string]> = {
    shop: [t.shop.title, t.shop.intro],
    compare: [t.common.compare, storefrontLabels(locale).compareIntro],
    quote: [sales.quote, sales.intro],
    support: [t.support.title, t.support.intro],
    "support/faq": [t.support.faq, faqCopy[locale].intro],
    "support/contact": [t.support.contact, faqCopy[locale].cards[1]],
    "support/shipping-delivery": [t.footer.shipping, policy.shipping[0][1]],
    "support/returns-refunds": [t.footer.returns, policy.returns[0][1]],
    "support/warranty": [t.footer.warranty, policy.warranty[0][1]],
    "policies/privacy": [t.footer.privacy, policy.privacy[0][1]],
    "policies/terms": [t.footer.terms, policy.terms[0][1]],
    "policies/intellectual-property": [t.footer.intellectualProperty, policy["intellectual-property"][1][1]],
    account: [t.nav.account, t.support.intro],
    search: [t.nav.search, t.shop.intro],
    cart: [t.cart.title, t.cart.delivery],
    checkout: [t.common.checkout, t.cart.checkoutNote],
  };
  const [title, description] = entries[path] ??
    (guide ? [guide.title, guide.intro] : collectionTitle ? [collectionTitle, `${collectionTitle} · ${t.shop.intro}`] : [siteConfig.name, siteConfig.description]);
  const indexable = !noIndexStorefrontPaths.has(path) &&
    (!path.startsWith("collections/") || isCollectionIndexable(path, await getStoreProducts()));

  return {
    title: { absolute: `${title} | ${siteConfig.name}` },
    description,
    robots: indexable ? undefined : { index: false, follow: true },
    alternates: {
      canonical: `/${locale}/${path}`,
      languages: indexable ? {
        ...Object.fromEntries(locales.map((language) => [language, `/${language}/${path}`])),
        "x-default": `/en/${path}`,
      } : undefined,
    },
  };
}
export default async function RoutedPage({ params }: { params: Promise<{ locale: string; segments?: string[] }> }) {
  const { locale, segments = [] } = await params;
  const path = segments.join("/");
  if (!isLocale(locale) || !storefrontRoutePaths.has(path)) notFound();

  // The catalogue, checkout and inquiry form use the request URL during their initial render.
  await connection();
  const usesCatalogue = ["shop", "compare", "search", "cart", "checkout", "quote"].includes(path) || path.startsWith("collections/");
  // Display only. The order endpoint reads current SKU prices and inventory in its transaction.
  const products = usesCatalogue ? await getStoreProducts() : undefined;

  const destinationLabels = path === "checkout" || path === "support/shipping-delivery" ? shippingDestinationLabels(locale) : undefined;

  return <RoutePage locale={locale} segments={segments} products={products} destinationLabels={destinationLabels} />;
}

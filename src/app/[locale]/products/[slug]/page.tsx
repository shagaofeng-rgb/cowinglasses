import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/product-detail";
import { getStoreProduct, getStoreProducts } from "@/data/repositories/products";
import { isLocale, localize } from "@/lib/i18n";
import { siteConfig } from "@/config/site";
import { getProductCanonicalLocale, getProductLanguageAlternates, isProductLocaleIndexable } from "@/lib/seo/product-indexability";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const product = await getStoreProduct(slug);
  if (!product) return {};
  const indexable = isProductLocaleIndexable(product, locale);

  return {
    title: localize(product.seo.title, locale),
    description: localize(product.seo.description, locale),
    robots: indexable ? undefined : { index: false, follow: true },
    alternates: {
      canonical: `/${getProductCanonicalLocale(product, locale)}/products/${slug}`,
      languages: getProductLanguageAlternates(product),
    },
    openGraph: { images: [product.heroImage] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const [product, catalogue] = await Promise.all([getStoreProduct(slug), getStoreProducts()]);
  if (!product) notFound();
  const schemaLocale = getProductCanonicalLocale(product, locale);
  const schema = {
    "@context": "https://schema.org", "@type": "Product", name: localize(product.name, locale),
    image: [product.heroImage.startsWith("http") ? product.heroImage : `${siteConfig.url}${product.heroImage}`],
    description: localize(product.description, locale),
    offers: { "@type": "Offer", priceCurrency: "USD", price: product.usdPrice, availability: "https://schema.org/InStock", url: `${siteConfig.url}/${schemaLocale}/products/${slug}` },
  };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/><ProductDetail product={product} relatedProducts={catalogue} locale={locale}/></>;
}

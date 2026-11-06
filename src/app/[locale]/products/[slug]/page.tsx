import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/product-detail";
import { getStoreProduct, getStoreProducts } from "@/data/repositories/products";
import { isLocale, localize } from "@/lib/i18n";
import { modelCode } from "@/lib/product-model";
import { serializeJsonLd } from "@/lib/seo/json-ld";
import { siteConfig } from "@/config/site";
import { getProductCanonicalLocale, getProductLanguageAlternates, isProductLocaleIndexable } from "@/lib/seo/product-indexability";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const product = await getStoreProduct(slug);
  if (!product) return {};
  const indexable = isProductLocaleIndexable(product, locale);

  return {
    title: { absolute: localize(product.seo.title, locale) },
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
  const url = new URL(`/${schemaLocale}/products/${slug}`, siteConfig.url).href;
  const buyableSku = product.colors.find((sku) => sku.available && (sku.usdPrice ?? product.usdPrice) > 0);
  const facts = {
    name: localize(product.name, locale),
    image: [new URL(product.heroImage, siteConfig.url).href],
    description: localize(product.description, locale),
    url,
  };
  const schema = buyableSku ? {
    "@context": "https://schema.org",
    "@type": "Product",
    ...facts,
    model: modelCode(product.slug),
    brand: { "@type": "Brand", name: siteConfig.name },
    additionalProperty: product.specifications.map((spec) => ({
      "@type": "PropertyValue", name: localize(spec.label, locale), value: localize(spec.value, locale),
    })),
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: buyableSku.usdPrice ?? product.usdPrice,
      availability: "https://schema.org/InStock",
      url,
    },
  } : {
    "@context": "https://schema.org", "@type": "WebPage", ...facts, inLanguage: locale,
  };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />
    <ProductDetail product={product} relatedProducts={catalogue} locale={locale} /></>;
}

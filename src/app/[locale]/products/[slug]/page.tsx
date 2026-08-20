import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/product-detail";
import { getProduct } from "@/data/fixtures/products";
import { isLocale, localize } from "@/lib/i18n";
import { siteConfig } from "@/config/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (locale !== "en" || !isLocale(locale)) return {};
  const product = getProduct(slug);
  if (!product) return {};
  return { title: localize(product.seo.title, locale), description: localize(product.seo.description, locale), alternates: { canonical: `/en/products/${slug}`, languages: { en: `/en/products/${slug}` } }, openGraph: { images: [product.heroImage] } };
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (locale !== "en" || !isLocale(locale)) notFound();
  const product = getProduct(slug);
  if (!product) notFound();
  const schema = { "@context": "https://schema.org", "@type": "Product", name: product.name.en, image: [`${siteConfig.url}${product.heroImage}`], description: product.description.en, url: `${siteConfig.url}/en/products/${slug}` };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/><ProductDetail product={product} locale={locale}/></>;
}

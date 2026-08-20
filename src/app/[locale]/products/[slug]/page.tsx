import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/product-detail";
import { getProduct } from "@/data/fixtures/products";
import { isLocale, localize } from "@/lib/i18n";
import { siteConfig } from "@/config/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> { const { locale, slug } = await params; if (!isLocale(locale)) return {}; const product = getProduct(slug); if (!product) return {}; return { title: localize(product.seo.title, locale), description: localize(product.seo.description, locale), alternates: { canonical: `/${locale}/products/${slug}`, languages: { en: `/en/products/${slug}`, ar: `/ar/products/${slug}`, es: `/es/products/${slug}`, pt: `/pt/products/${slug}`, ja: `/ja/products/${slug}`, ko: `/ko/products/${slug}` } }, openGraph: { images: [product.heroImage] } }; }
export default async function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) { const { locale, slug } = await params; if (!isLocale(locale)) notFound(); const product = getProduct(slug); if (!product) notFound(); const schema = { "@context": "https://schema.org", "@type": "Product", name: localize(product.name, locale), image: [`${siteConfig.url}${product.heroImage}`], description: localize(product.description, locale), offers: { "@type": "Offer", priceCurrency: "USD", price: product.usdPrice, availability: "https://schema.org/InStock", url: `${siteConfig.url}/${locale}/products/${slug}` } }; return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/><ProductDetail product={product} locale={locale}/></>; }

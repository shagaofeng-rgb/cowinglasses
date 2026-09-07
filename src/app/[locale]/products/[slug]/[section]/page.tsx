import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/product-detail";
import { isProductSection, productSectionLabel, productSectionsFor } from "@/components/product/product-sections";
import { getStoreProduct } from "@/data/repositories/products";
import { isLocale, localize } from "@/lib/i18n";

type ProductSectionPageProps = {
  params: Promise<{ locale: string; slug: string; section: string }>;
};

export async function generateMetadata({ params }: ProductSectionPageProps): Promise<Metadata> {
  const { locale, slug, section } = await params;
  if (!isLocale(locale) || !isProductSection(section)) return {};
  const product = await getStoreProduct(slug);
  if (!product || !productSectionsFor(product).includes(section)) return {};
  const label = productSectionLabel(locale, section);
  return {
    title: `${label} — ${localize(product.name, locale)}`,
    description: localize(product.seo.description, locale),
    alternates: {
      canonical: `/${locale}/products/${slug}/${section}`,
      languages: {
        en: `/en/products/${slug}/${section}`,
        ar: `/ar/products/${slug}/${section}`,
        es: `/es/products/${slug}/${section}`,
        pt: `/pt/products/${slug}/${section}`,
        ja: `/ja/products/${slug}/${section}`,
        ko: `/ko/products/${slug}/${section}`,
      },
    },
  };
}

export default async function ProductSectionPage({ params }: ProductSectionPageProps) {
  const { locale, slug, section } = await params;
  if (!isLocale(locale) || !isProductSection(section)) notFound();
  const product = await getStoreProduct(slug);
  if (!product || !productSectionsFor(product).includes(section)) notFound();
  return <ProductDetail product={product} locale={locale} relatedProducts={[]} section={section} />;
}

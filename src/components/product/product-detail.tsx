"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUp, ArrowUpRight, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import { localize, type Locale } from "@/lib/i18n";
import { messages } from "@/messages";
import { Price } from "@/components/commerce/price";
import { AddToCart } from "./add-to-cart";
import { ProductCard } from "./product-card";
import { ProductFeatureBand } from "./product-feature-band";
import { products } from "@/data/fixtures/products";
import { trackMetaPixel } from "@/components/analytics/meta-pixel";
import { trackStorefrontEvent } from "@/components/analytics/storefront-tracker";
import { productSectionLabel, productSectionsFor, type ProductSection } from "./product-sections";
import styles from "@/components/layout/storefront-design.module.css";

type Fact = { value: string; label: string };

export function ProductDetail({ product, locale, relatedProducts = products, section = "overview" }: { product: Product; locale: Locale; relatedProducts?: Product[]; section?: ProductSection }) {
  const [sku, setSku] = useState(product.colors[0]);
  const [selectedImage, setSelectedImage] = useState(product.colors[0]?.images[0] ?? product.heroImage);
  const t = messages[locale];
  const name = localize(product.name, locale);
  const gallery = sku.images.slice(0, 6);
  const facts = getFacts(product);
  useEffect(() => {
    const contentId = sku.skuId ?? sku.id;
    trackStorefrontEvent("product_view", { productId: product.id, slug: product.slug });
    trackMetaPixel(
      "ViewContent",
      {
        content_ids: [contentId],
        content_type: "product",
        value: product.usdPrice,
        currency: "USD",
      },
      `view-content:${product.id}:${contentId}`,
    );
  }, [product.id, product.slug, product.usdPrice, sku.id, sku.skuId]);

  if (section !== "overview") return <ProductDetailSection product={product} locale={locale} section={section} />;

  return (
    <div className={styles.page}>
      <section className={styles.productHero}>
        <div className={styles.productGallery}>
          <div className={styles.productMainMedia}>
            <Image
              key={selectedImage}
              src={selectedImage}
              alt={`${name} in ${localize(sku.name, locale)}`}
              width={1400}
              height={1200}
              priority
              className="transition-[filter] duration-300"
              style={{ filter: getColourPreviewFilter(product.id, sku.id) }}
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </div>
          <div className={styles.galleryRail} aria-label={`${name} image gallery`}>
            {gallery.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedImage(image)}
                className="p-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
                aria-label={`View ${name} image ${index + 1}`}
                aria-current={selectedImage === image ? "true" : undefined}
              >
                <Image src={image} alt="" width={280} height={220} className="aspect-[4/3] w-full object-contain p-1" sizes="(max-width: 640px) 30vw, 15vw" />
              </button>
            ))}
          </div>
        </div>

        <div className={styles.productInfo}>
          <h1 className={styles.productTitle}>{name}</h1>
          <p className={styles.productTagline}>{localize(product.tagline, locale)}</p>

          <div className={styles.productPrice}>
            {product.demo ? (
              <Price usd={product.usdPrice} locale={locale} />
            ) : (
              <div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  {product.compareAtUsdPrice && <span className="text-lg font-bold text-[var(--muted)] line-through">{formatUsd(product.compareAtUsdPrice)}</span>}
                  <span className="text-3xl font-black tracking-tight">{formatUsd(product.usdPrice)}</span>
                  <span className="rounded-full bg-[var(--lime)] px-3 py-1 text-xs font-black">Launch offer</span>
                </div>
                {product.compareAtUsdPrice && <p className="mt-2 text-sm text-[var(--muted)]">Original price {formatUsd(product.compareAtUsdPrice)}.</p>}
              </div>
            )}
          </div>

          <div className={styles.factRail}>
            {facts.map((fact) => (
              <div key={fact.label}>
                <p className="text-base font-black tracking-[-.03em]">{fact.value}</p>
                <p>{fact.label}</p>
              </div>
            ))}
          </div>

          {product.colors.length > 1 ? (
            <fieldset className={styles.colorChoices}>
              <legend className="font-bold">{t.common.chooseColor}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    aria-pressed={color.id === sku.id}
                    onClick={() => {
                      setSku(color);
                      setSelectedImage(color.images[0] ?? product.heroImage);
                    }}
                    className={`flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] ${color.id === sku.id ? "border-[var(--ink)] bg-[var(--surface)]" : "border-[var(--line)] hover:border-[var(--ink)]"}`}
                  >
                    <span className="h-4 w-4 rounded-full border border-black/10" style={{ background: color.hex }} />
                    {localize(color.name, locale)}
                  </button>
                ))}
              </div>
              {!product.demo && <p className="mt-3 text-xs leading-5 text-[var(--muted)]">Your colour preference is included with the sales request. Final availability is confirmed before payment.</p>}
            </fieldset>
          ) : null}

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              className="button-primary product-action-buy rounded-full uppercase tracking-[.12em]"
              href={`/${locale}/checkout?product=${product.slug}&color=${encodeURIComponent(sku.id)}`}
            >
              <span>BUY</span><ArrowUpRight size={17} strokeWidth={2.4} />
            </Link>
            <AddToCart product={product} skuId={sku.skuId ?? sku.id} locale={locale} variant="secondary" className="product-action-cart rounded-full uppercase tracking-[.12em]" />
          </div>

          <div className={`${styles.productNotices} mt-6 grid gap-3 border-t pt-6 text-sm`}>
            <Notice icon={<Truck size={18} />} title={t.product.dispatch} />
            <Notice icon={<Undo2 size={18} />} title="30-day returns. Terms and return shipping conditions apply." />
            <Notice icon={<ShieldCheck size={18} />} title="6-month limited warranty. Draft policy details apply." />
            <p className="text-[var(--muted)]">{t.product.tax}</p>
          </div>
        </div>
      </section>

      <ProductFeatureBand product={product} />

      <ProductSectionNav product={product} locale={locale} />

      <section className={`shell ${styles.detailSection}`}>
        <div className={styles.productSectionIntro}>
          <div>
            <p className="eyebrow">Explore this model</p>
            <h2 className={styles.detailTitle}>Everything, in its place.</h2>
          </div>
          <p className={styles.detailCopy}>Keep the buying view focused. Detailed materials, technical information and support answers each open in their own short, shareable page.</p>
        </div>
        <div className={styles.productPathGrid}>
          {productSectionsFor(product).filter((item) => item !== "overview").map((item) => (
            <Link key={item} href={`/${locale}/products/${product.slug}/${item}`} className={styles.productPathCard}>
              <span className="eyebrow">{productSectionLabel(locale, item)}</span>
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className={`shell ${styles.detailSection} ${styles.relatedRail}`}>
        <h2 className={styles.detailTitle}>{t.product.related}</h2>
        <div className={styles.catalogGrid}>
          {relatedProducts.filter((candidate) => !candidate.demo && candidate.id !== product.id).slice(0, 3).map((candidate) => <ProductCard product={candidate} locale={locale} key={candidate.id} />)}
        </div>
      </section>

      <button
        type="button"
        className={styles.backToTop}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to the top of this product page"
      >
        <ArrowUp size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}

function ProductSectionNav({ product, locale, active = "overview" }: { product: Product; locale: Locale; active?: ProductSection }) {
  return <nav className={styles.productSectionNav} aria-label="Product information">
    <div className="shell">
      {productSectionsFor(product).map((item) => {
        const href = item === "overview" ? `/${locale}/products/${product.slug}` : `/${locale}/products/${product.slug}/${item}`;
        return <Link key={item} href={href} aria-current={active === item ? "page" : undefined}>{productSectionLabel(locale, item)}</Link>;
      })}
    </div>
  </nav>;
}

function ProductDetailSection({ product, locale, section }: { product: Product; locale: Locale; section: ProductSection }) {
  const name = localize(product.name, locale);
  const title = productSectionLabel(locale, section);
  return <div className={styles.page}>
    <header className={styles.productCompactHeader}>
      <div className="shell">
        <Link href={`/${locale}/products/${product.slug}`} className={styles.productBackLink}>← {name}</Link>
        <p className="eyebrow">{title}</p>
        <h1>{title}</h1>
        <p>{localize(product.tagline, locale)}</p>
      </div>
    </header>
    <ProductSectionNav product={product} locale={locale} active={section} />
    <main className={`shell ${styles.productSectionPage}`}>
      {section === "features" && <ProductFeatureBand product={product} />}
      {section === "specifications" && <section className={styles.specGrid}>
        <div><h2 className={styles.detailTitle}>Technical specifications</h2><p className={styles.detailCopy}>Only the supplied product information is presented here. Sales confirms a final configuration before payment.</p>{product.technicalDiagram ? <Image src={product.technicalDiagram} alt={`${name} product dimensions`} width={1000} height={800} className="mt-7 h-auto max-h-80 w-full object-contain mix-blend-multiply" sizes="(max-width: 1024px) 100vw, 40vw" /> : null}</div>
        <dl className={styles.specList}>{product.specifications.map((spec) => <div key={spec.label.en}><dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{localize(spec.label, locale)}</dt><dd className="font-bold">{localize(spec.value, locale)}</dd></div>)}</dl>
      </section>}
      {section === "gallery" && <section className={styles.productGalleryPage}>{[...product.colors.flatMap((color) => color.images), ...(product.detailImages ?? [])].filter((image, index, images) => images.indexOf(image) === index).slice(0, 8).map((image, index) => <Image key={image} src={image} alt={`${name} view ${index + 1}`} width={1600} height={1200} className="h-auto w-full object-contain" sizes="(max-width: 760px) 100vw, 50vw" />)}</section>}
      {section === "compatibility" && <section className={styles.productReading}><h2 className={styles.detailTitle}>Compatibility</h2><p>{localize(product.compatibility, locale)}</p><Link className="button-secondary mt-7" href={`/${locale}/app`}>Open app connection guide</Link></section>}
      {section === "in-the-box" && <section className={styles.productReading}><h2 className={styles.detailTitle}>What arrives with your glasses</h2><ul className={styles.productBoxList}>{product.inTheBox.map((item) => <li key={item.en}>{localize(item, locale)}</li>)}</ul></section>}
      {section === "faq" && <section className={styles.productReading}><h2 className={styles.detailTitle}>Product FAQ</h2>{product.faq.map((faq) => <details key={faq.question.en} className={styles.productFaq}><summary>{localize(faq.question, locale)}</summary><p>{localize(faq.answer, locale)}</p></details>)}</section>}
      <Link href={`/${locale}/products/${product.slug}`} className="button-secondary mt-10">Back to product overview</Link>
    </main>
  </div>;
}

function getFacts(product: Product): Fact[] {
  if (product.id === "g200-sport-audio-glasses") {
    return [
      { value: "Bluetooth 5.3", label: "JL7006 audio chip" },
      { value: "5–6 hours", label: "Music playing time" },
      { value: "43 g", label: "Glasses weight" },
    ];
  }

  return [
    { value: formatUsd(product.usdPrice), label: "Launch price" },
    { value: `${product.colors.length} choices`, label: "Colour preferences" },
    { value: "Sales confirmed", label: "Configuration before payment" },
  ];
}

function getColourPreviewFilter(productId: string, colorId: string) {
  if (productId !== "g200-sport-audio-glasses") return "none";
  if (colorId === "g200-black-preference") return "grayscale(.88) saturate(.2) contrast(1.08)";
  if (colorId === "g200-grey-preference") return "grayscale(.72) saturate(.28) brightness(.92) contrast(1.04)";
  return "none";
}

function formatUsd(value: number) {
  return `USD ${value.toFixed(2).replace(/\\.00$/, "")}`;
}

function Notice({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="flex gap-3"><span className="mt-0.5 text-[var(--muted)]">{icon}</span><p>{title}</p></div>;
}

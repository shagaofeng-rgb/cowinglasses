"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUp, ArrowUpRight, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import { localize, type Locale } from "@/lib/i18n";
import { messages } from "@/messages";
import { Price } from "@/components/commerce/price";
import { AddToCart } from "./add-to-cart";
import { ProductCard } from "./product-card";
import { ProductFeatureBand } from "./product-feature-band";
import { products } from "@/data/fixtures/products";
import { trackStorefrontEvent } from "@/components/analytics/storefront-tracker";
import styles from "@/components/layout/storefront-design.module.css";

type Fact = { value: string; label: string };

export function ProductDetail({ product, locale, relatedProducts = products }: { product: Product; locale: Locale; relatedProducts?: Product[] }) {
  const [sku, setSku] = useState(product.colors[0]);
  const [selectedImage, setSelectedImage] = useState(product.colors[0]?.images[0] ?? product.heroImage);
  const t = messages[locale];
  const name = localize(product.name, locale);
  const gallery = sku.images.slice(0, 6);
  const facts = getFacts(product);
  useEffect(() => { trackStorefrontEvent("product_view", { productId: product.id, slug: product.slug }); }, [product.id, product.slug]);

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

      <section id="specifications" className={`shell ${styles.detailSection}`}>
        <div className={styles.specGrid}>
          <div>
            <h2 className={styles.detailTitle}>Technical specifications</h2>
            <p className={styles.detailCopy}>
              {product.id === "g200-sport-audio-glasses"
                ? "Parameters are transcribed from the supplied G200 product material."
                : "Product details shown below are limited to the supplied information. Sales confirms the final configuration before payment."}
            </p>
            {product.technicalDiagram ? (
              <div className="mt-7 grid min-h-72 place-items-center rounded-3xl bg-transparent p-2">
                <Image src={product.technicalDiagram} alt={`${name} product dimensions`} width={1000} height={800} className="h-auto max-h-80 w-full object-contain mix-blend-multiply" sizes="(max-width: 1024px) 100vw, 40vw" />
              </div>
            ) : null}
          </div>
          <dl className={styles.specList}>
            {product.specifications.map((spec) => (
              <div key={spec.label.en}>
                <dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{localize(spec.label, locale)}</dt>
                <dd className="font-bold">{localize(spec.value, locale)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {product.detailImages?.length ? (
        <section id="design" className={styles.designBand}>
          <div className={`shell ${styles.detailSection}`}>
            <div className="mb-8 max-w-2xl">
              <h2 className={styles.detailTitle}>Designed in detail.</h2>
              <p className="mt-4 leading-7 text-[var(--muted)]">Supplied product-detail artwork for {name}.</p>
            </div>
            <div className={`mx-auto max-w-5xl ${styles.designMedia}`}>
              {product.detailImages.map((image, index) => (
                <Image
                  key={image}
                  src={image}
                  alt={`${name} product detail ${index + 1}`}
                  width={1800}
                  height={1800}
                  className="block h-auto w-full"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className={`shell ${styles.detailSection}`}>
        <div className={styles.orderGrid}>
          <div>
            <h2 className={styles.detailTitle}>Request with confidence.</h2>
          </div>
          <div className={styles.infoStack}>
            <InfoBlock title={t.product.box} text={product.inTheBox.map((item) => localize(item, locale)).join(" · ")} />
            <InfoBlock title={t.product.compatibility} text={localize(product.compatibility, locale)} />
            <div className={styles.infoBlock}>
              <h3 className="font-bold">Product FAQ</h3>
              {product.faq.length ? product.faq.map((faq) => (
                <details key={faq.question.en} className="border-b border-[var(--line)] py-4 last:border-0">
                  <summary className="cursor-pointer font-bold">{localize(faq.question, locale)}</summary>
                  <p className="mt-3 leading-6 text-[var(--muted)]">{localize(faq.answer, locale)}</p>
                </details>
              )) : <p className="mt-3 text-[var(--muted)]">Sales can provide current order details for this model.</p>}
            </div>
          </div>
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

function InfoBlock({ title, text, link }: { title: string; text: string; link?: { label: string; href: string } }) {
  return <div className={styles.infoBlock}><h3 className="font-bold">{title}</h3><p className="mt-2 leading-7 text-[var(--muted)]">{text}</p>{link && <Link className="mt-4 inline-block font-bold underline underline-offset-4" href={link.href}>{link.label}</Link>}</div>;
}

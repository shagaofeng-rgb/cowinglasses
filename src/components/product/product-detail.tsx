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
    <>
      <section className="shell grid gap-8 py-8 lg:grid-cols-[1.2fr_.8fr] lg:py-14">
        <div>
          <div className="overflow-hidden rounded-3xl border border-[var(--line)] bg-white p-4 md:p-6">
            <Image
              key={selectedImage}
              src={selectedImage}
              alt={`${name} in ${localize(sku.name, locale)}`}
              width={1400}
              height={1200}
              priority
              className="aspect-[4/3] w-full object-contain transition-[filter] duration-300"
              style={{ filter: getColourPreviewFilter(product.id, sku.id) }}
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4" aria-label={`${name} image gallery`}>
            {gallery.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedImage(image)}
                className={`overflow-hidden rounded-xl border bg-white p-1 transition hover:border-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] ${selectedImage === image ? "border-[var(--ink)]" : "border-[var(--line)]"}`}
                aria-label={`View ${name} image ${index + 1}`}
              >
                <Image src={image} alt="" width={280} height={220} className="aspect-[4/3] w-full object-contain p-1" sizes="(max-width: 640px) 30vw, 15vw" />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow">{product.demo ? t.common.demo : "Now available"}</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-.06em] md:text-5xl">{name}</h1>
          <p className="mt-4 text-lg leading-7 text-[var(--muted)]">{localize(product.tagline, locale)}</p>

          <div className="mt-6 grid grid-cols-3 overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
            {facts.map((fact, index) => (
              <div key={fact.label} className={`min-h-24 p-4 ${index ? "border-l border-[var(--line)]" : ""}`}>
                <p className="text-base font-black tracking-[-.03em]">{fact.value}</p>
                <p className="mt-1 text-[10px] leading-4 text-[var(--muted)]">{fact.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
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

          {product.colors.length > 1 ? (
            <fieldset className="mt-7">
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

          <div className="mt-6 grid gap-3 border-t border-[var(--line)] pt-6 text-sm">
            <Notice icon={<Truck size={18} />} title={t.product.dispatch} />
            <Notice icon={<Undo2 size={18} />} title="30-day returns. Terms and return shipping conditions apply." />
            <Notice icon={<ShieldCheck size={18} />} title="6-month limited warranty. Draft policy details apply." />
            <p className="text-[var(--muted)]">{t.product.tax}</p>
          </div>
        </div>
      </section>

      <ProductFeatureBand product={product} />

      <section id="specifications" className="shell py-14">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <p className="eyebrow">Technical details</p>
            <h2 className="mt-2 text-4xl font-black tracking-[-.06em]">Technical<br />specifications</h2>
            <p className="mt-5 max-w-md leading-7 text-[var(--muted)]">
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
          <dl className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
            {product.specifications.map((spec, index) => (
              <div key={spec.label.en} className={`grid gap-2 px-5 py-4 sm:grid-cols-[.85fr_1.15fr] sm:items-center ${index ? "border-t border-[var(--line)]" : ""}`}>
                <dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{localize(spec.label, locale)}</dt>
                <dd className="font-bold">{localize(spec.value, locale)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {product.detailImages?.length ? (
        <section id="design" className="border-b border-[var(--line)] bg-white py-14">
          <div className="shell">
            <div className="mb-8 max-w-2xl">
              <p className="eyebrow">Product design</p>
              <h2 className="mt-2 text-4xl font-black tracking-[-.06em]">Designed in detail.</h2>
              <p className="mt-4 leading-7 text-[var(--muted)]">Supplied product-detail artwork for {name}.</p>
            </div>
            <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-[var(--line)] bg-white">
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

      <section className="shell py-14">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Order details</p>
            <h2 className="mt-2 text-4xl font-black tracking-[-.06em]">Request with confidence.</h2>
          </div>
          <div className="grid gap-3">
            <InfoBlock title={t.product.box} text={product.inTheBox.map((item) => localize(item, locale)).join(" · ")} />
            <InfoBlock title={t.product.compatibility} text={localize(product.compatibility, locale)} />
            <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
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

      <section className="shell border-t border-[var(--line)] py-12">
        <h2 className="text-3xl font-black tracking-[-.05em]">{t.product.related}</h2>
        <div className="mt-7 grid gap-5 md:grid-cols-3">
          {relatedProducts.filter((candidate) => !candidate.demo && candidate.id !== product.id).slice(0, 3).map((candidate) => <ProductCard product={candidate} locale={locale} key={candidate.id} />)}
        </div>
      </section>

      <button
        type="button"
        className="fixed right-5 top-1/2 z-40 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-[var(--ink)] text-white shadow-[0_12px_30px_rgba(0,0,0,.2)] transition hover:-translate-y-[55%] hover:bg-[var(--lime)] hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ink)]"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to the top of this product page"
      >
        <ArrowUp size={18} strokeWidth={2.5} />
      </button>
    </>
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
  return <div className="rounded-2xl border border-[var(--line)] bg-white p-5"><h3 className="font-bold">{title}</h3><p className="mt-2 leading-7 text-[var(--muted)]">{text}</p>{link && <Link className="mt-4 inline-block font-bold underline underline-offset-4" href={link.href}>{link.label}</Link>}</div>;
}

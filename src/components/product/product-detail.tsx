"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Aperture, ArrowUpRight, AudioLines, BatteryCharging, Bluetooth, Camera, ChevronDown,
  ChevronLeft, ChevronRight, CircleHelp, Glasses, Grid2X2, Languages, Minus, PackageCheck,
  PackageOpen, Phone, Plus, Ruler, ShieldCheck, Smartphone, Sun, Truck, Undo2, X, ZoomIn,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ColorSku, Feature, Product } from "@/types/product";
import { localize, type Locale } from "@/lib/i18n";
import { modelCode, sportModelSlug } from "@/lib/product-model";
import { messages } from "@/messages";
import { storefrontFeatureName, storefrontLabels } from "@/messages/storefront";
import { formatUsdPrice, Price } from "@/components/commerce/price";
import { clampPage, Pagination } from "@/components/commerce/pagination";
import { PanelLink } from "@/components/layout/storefront-ui";
import { trackMetaPixel } from "@/components/analytics/meta-pixel";
import { trackStorefrontEvent } from "@/components/analytics/storefront-tracker";
import { AddToCart } from "./add-to-cart";
import { ProductCard } from "./product-card";
import { productSectionLabel, productSectionsFor, type ProductSection } from "./product-sections";
import styles from "@/components/layout/storefront-design.module.css";

const numbered = (number: number) => String(number).padStart(2, "0");
const distinct = (images: string[]) => [...new Set(images.filter(Boolean))];

function photosFor(product: Product, sku?: ColorSku) {
  const images = sku?.images.length ? distinct(sku.images) : [product.heroImage];
  const angle = product.slug === sportModelSlug ? images.find((image) => image.endsWith("/blue-mirror-lens-02.webp")) : undefined;
  return angle ? [angle, ...images.filter((image) => image !== angle)] : images;
}

function specValue(product: Product, label: RegExp, locale: Locale) {
  const spec = product.specifications.find((row) => label.test(row.label.en));
  return spec ? localize(spec.value, locale) : null;
}

export function ProductDetail({ product, locale, relatedProducts = [], section = "overview", galleryPage }: {
  product: Product;
  locale: Locale;
  relatedProducts?: Product[];
  section?: ProductSection;
  galleryPage?: string;
}) {
  const [selectedSku, setSelectedSku] = useState(product.colors.find((color) => color.available)?.id);
  const [photo, setPhoto] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoom, setZoom] = useState<{ images: string[]; index: number } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const sectionNav = useRef<HTMLElement>(null);
  const zoomOpen = zoom !== null;
  const sku = product.colors.find((color) => color.id === selectedSku) ?? product.colors[0];
  const skuId = sku?.skuId ?? sku?.id;
  const name = localize(product.name, locale);
  const model = modelCode(product.slug);
  const ui = storefrontLabels(locale);
  const t = messages[locale];
  const path = `/${locale}/products/${product.slug}`;
  const photos = photosFor(product, sku);
  const photoIndex = photo % Math.max(photos.length, 1);
  const facts = [
    { label: ui.bluetooth, value: specValue(product, /^Bluetooth version$/i, locale), Icon: Bluetooth },
    { label: ui.playback, value: specValue(product, /music playing time|audio duration|playback (time|duration)/i, locale), Icon: AudioLines },
    { label: ui.weight, value: specValue(product, /^weight$/i, locale), Icon: Glasses },
    { label: ui.charging, value: specValue(product, /^charging time$/i, locale), Icon: BatteryCharging },
    { label: ui.recording, value: specValue(product, /^shooting duration$/i, locale), Icon: Camera },
  ].filter((fact) => fact.value).slice(0, 3);
  const related = relatedProducts.filter((candidate) => !candidate.demo && candidate.id !== product.id).slice(0, 3);
  const title = productSectionLabel(locale, section);
  const availableSections = productSectionsFor(product);
  const checkout = sku ? `/${locale}/checkout?${new URLSearchParams({ product: product.slug, color: sku.id, ...(quantity > 1 ? { quantity: String(quantity) } : {}) })}` : null;

  useEffect(() => {
    if (!skuId) return;
    trackStorefrontEvent("product_view", { productId: product.id, slug: product.slug });
    trackMetaPixel("ViewContent", {
      content_ids: [skuId], content_type: "product", value: product.usdPrice, currency: "USD",
    }, `view-content:${product.id}:${skuId}`);
  }, [product.id, product.slug, product.usdPrice, skuId]);

  useEffect(() => {
    if (zoomOpen && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [zoomOpen]);

  useEffect(() => {
    const nav = sectionNav.current;
    const active = nav?.querySelector('[aria-current="page"]');
    if (!nav || !active) return;
    const bounds = nav.getBoundingClientRect();
    const tab = active.getBoundingClientRect();
    if (tab.right > bounds.right) nav.scrollLeft += tab.right - bounds.right + 5;
    else if (tab.left < bounds.left) nav.scrollLeft -= bounds.left - tab.left + 5;
  }, [section]);

  function openImage(images: string[], index: number) {
    setZoom({ images, index });
  }

  function moveZoom(direction: number) {
    setZoom((state) => state && { ...state, index: (state.index + direction + state.images.length) % state.images.length });
  }

  function movePhoto(direction: number) {
    setPhoto((current) => (current + direction + photos.length) % photos.length);
  }

  const tabs = <nav ref={sectionNav} className={styles.productSectionNav} aria-label={t.product.specs}>
    {availableSections.map((item) => <Link key={item} href={item === "overview" ? path : `${path}/${item}`} aria-current={section === item ? "page" : undefined}>{productSectionLabel(locale, item)}</Link>)}
  </nav>;

  return (
    <div className={`${styles.page} ${styles.productPage}`} data-storefront-product={product.slug}>
      <div className={`shell ${styles.productShell}`}>
        <div className={styles.breadcrumb}>
          <Link href={`/${locale}/shop`}>{t.nav.shop}</Link><ChevronRight size={13} className="rtl:rotate-180" aria-hidden="true" />
          {section === "overview" ? <span>{name}</span> : <><Link href={path}>{name}</Link><ChevronRight size={13} className="rtl:rotate-180" aria-hidden="true" /><span>{title}</span></>}
        </div>

        {section === "overview" ? <>
          <section className={styles.productHero}>
            <div className={styles.productGallery}>
              <div className={styles.productMainMedia}>
                <Image src={photos[photoIndex] ?? product.heroImage} alt={`${name}${sku ? ` · ${localize(sku.name, locale)}` : ""}`} fill loading={photoIndex === 0 ? "eager" : undefined} fetchPriority={photoIndex === 0 ? "high" : undefined} quality={90} sizes="(max-width: 767px) 94vw, (max-width: 1536px) 56vw, 790px" />
                <div className={styles.mediaTop}><span>{numbered(photoIndex + 1)} / {numbered(photos.length)}</span><span dir="ltr">COWIN / {model}</span></div>
                <div className={styles.mediaControls}>
                  <div>
                    {photos.length > 1 && <>
                      <button type="button" onClick={() => movePhoto(-1)} aria-label={ui.previous}><ChevronLeft size={19} className="rtl:rotate-180" /></button>
                      <button type="button" onClick={() => movePhoto(1)} aria-label={ui.next}><ChevronRight size={19} className="rtl:rotate-180" /></button>
                    </>}
                  </div>
                  <button type="button" onClick={() => openImage(photos, photoIndex)} aria-label={ui.enlarge}><ZoomIn size={18} /></button>
                </div>
              </div>
              {photos.length > 1 && <div className={styles.galleryRail} aria-label={ui.gallery}>
                {photos.slice(0, 4).map((image, index) => <button key={image} type="button" onClick={() => setPhoto(index)} aria-label={`${ui.gallery} ${index + 1}`} aria-pressed={photoIndex === index}>
                  <Image src={image} alt="" fill quality={82} sizes="(max-width: 767px) 18vw, 11vw" />
                </button>)}
                {photos.length > 4 && <Link href={`${path}/gallery`} aria-label={ui.gallery}><Grid2X2 size={18} aria-hidden="true" />+{photos.length - 4}</Link>}
              </div>}
            </div>

            <div className={styles.productInfo}>
              <div className={styles.productEyebrow}>
                <span className={styles.kicker}>{product.slug === sportModelSlug ? t.home.music : ui.catalogue}</span>
                <span className={styles.dataBadge}>{ui.model} · {model}</span>
              </div>
              <h1 className={styles.productTitle}>
                {name.toUpperCase().startsWith(model) ? <><bdi>{model}</bdi><span>{name.slice(model.length).trim()}</span></> : name}
              </h1>
              <p className={styles.productTagline}>{localize(product.tagline, locale)}</p>
              <div className={styles.productPrice}><Price usd={product.usdPrice} locale={locale} compareAt={product.compareAtUsdPrice} tag={product.compareAtUsdPrice ? ui.launch : undefined} /></div>
              {facts.length > 0 && <dl className={styles.factRail}>
                {facts.map(({ label, value, Icon }) => <div key={label}>
                  <dt><Icon size={13} aria-hidden="true" />{label}</dt><dd>{value}</dd>
                </div>)}
              </dl>}
              {sku && <fieldset className={styles.colorChoices}>
                <legend>{t.common.chooseColor} · {localize(sku.name, locale)}</legend>
                <div>
                  {product.colors.map((color) => <button key={color.id} type="button" disabled={!color.available} aria-pressed={color.id === sku.id} onClick={() => { setSelectedSku(color.id); setPhoto(0); }}>
                    <span style={{ background: color.hex }} aria-hidden="true" />{localize(color.name, locale)}
                  </button>)}
                </div>
              </fieldset>}
              {sku?.available && skuId && <div className={styles.purchaseActions}>
                <div className={styles.quantity} role="group" aria-label={t.common.quantity}>
                  <button type="button" disabled={quantity <= 1} onClick={() => setQuantity(quantity - 1)} aria-label={ui.decrease}><Minus size={14} /></button>
                  <output aria-live="polite">{quantity}</output>
                  <button type="button" disabled={quantity >= 10} onClick={() => setQuantity(quantity + 1)} aria-label={ui.increase}><Plus size={14} /></button>
                </div>
                <div className={styles.purchaseBar}>
                  <strong className={styles.mobilePrice} dir="ltr">{formatUsdPrice(product.usdPrice * quantity)}</strong>
                  <AddToCart key={skuId} product={product} skuId={skuId} locale={locale} quantity={quantity} />
                </div>
              </div>}
              <div className={styles.productNotices}>
                <Link href={`/${locale}/support/shipping-delivery`}><Truck size={15} />{t.product.dispatch}</Link>
                <Link href={`/${locale}/support/returns-refunds`}><Undo2 size={15} />{t.common.returns}</Link>
                <Link href={`/${locale}/support/warranty`}><ShieldCheck size={15} />{t.common.warranty}</Link>
                {sku?.available && checkout && <Link className={styles.textLink} href={checkout}>{t.common.checkout}<ArrowUpRight size={14} className="rtl:-rotate-90" /></Link>}
              </div>
              <p className={styles.priceNote}>{t.product.tax}</p>
            </div>
          </section>
          {tabs}
          <section className={styles.quickLinks} aria-label={t.product.specs}>
            <PanelLink href={`${path}/specifications`} icon={<Ruler size={22} />} title={ui.dimensions} />
            <PanelLink href={`${path}/compatibility`} icon={<Smartphone size={22} />} title={t.product.compatibility} />
            <PanelLink href={`${path}/in-the-box`} icon={<PackageOpen size={22} />} title={t.product.box} />
          </section>
          {related.length > 0 && <section className={styles.relatedRail}>
            <div className={styles.sectionHeading}><h2>{t.product.related}</h2><Link className={styles.textLink} href={`/${locale}/compare`}>{t.common.compare}<ArrowUpRight size={15} className="rtl:-rotate-90" /></Link></div>
            <div className={styles.catalogGrid}>{related.map((item) => <ProductCard key={item.id} product={item} locale={locale} />)}</div>
          </section>}
        </> : <>
          <header className={styles.productCompactHeader}>
            <Link href={path} className={styles.compactPhoto} aria-label={name}><Image src={photos[0] ?? product.heroImage} alt="" fill sizes="96px" /></Link>
            <div><p className={styles.kicker}>{ui.model} / {model}</p><h1>{name}</h1></div>
            <strong className={styles.compactPrice} dir="ltr">{formatUsdPrice(product.usdPrice)}</strong>
            {checkout && sku?.available && <Link className="button-primary" href={path}>{t.common.shopNow}<ArrowUpRight size={16} className="rtl:-rotate-90" /></Link>}
          </header>
          {tabs}
          <section className={styles.productSectionPage}>
            <p className={styles.kicker}>{ui.model} / {model}</p>
            <h2 className={styles.detailTitle}>{section === "specifications" && locale === "en" ? "Specifications & fit" : title}</h2>
            <ProductSectionContent product={product} locale={locale} section={section} path={path} page={galleryPage} onZoom={openImage} />
          </section>
        </>}
      </div>
      <dialog ref={dialog} className={styles.photoDialog} aria-label={ui.gallery} onClose={() => setZoom(null)} onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        moveZoom(locale === "ar" ? -direction : direction);
      }}>
        {zoom && <>
          <div className={styles.dialogHeader}>
            <span>{name} · {numbered(zoom.index + 1)} / {numbered(zoom.images.length)}</span>
            <button type="button" onClick={() => dialog.current?.close()} aria-label={ui.close}><X size={22} /></button>
          </div>
          <div className={styles.dialogMedia}><Image src={zoom.images[zoom.index]} alt={name} fill unoptimized sizes="90vw" /></div>
          {zoom.images.length > 1 && <div className={styles.dialogNavigation}>
            <button type="button" onClick={() => moveZoom(-1)} aria-label={ui.previous}><ChevronLeft size={23} className="rtl:rotate-180" /></button>
            <button type="button" onClick={() => moveZoom(1)} aria-label={ui.next}><ChevronRight size={23} className="rtl:rotate-180" /></button>
          </div>}
        </>}
      </dialog>
    </div>
  );
}

const featureIcons: Record<Feature, typeof AudioLines> = {
  translation: Languages, "open-ear-audio": AudioLines, "bluetooth-music": Bluetooth, calls: Phone,
  "voice-assistant": Smartphone, "camera-photography": Camera, "video-recording": Camera,
  "blue-light": Aperture, sunglasses: Sun, photochromic: Aperture, "prescription-ready": Glasses, "lens-insert": Glasses,
};

function ProductSectionContent({ product, locale, section, path, page, onZoom }: {
  product: Product; locale: Locale; section: ProductSection; path: string; page?: string;
  onZoom: (images: string[], index: number) => void;
}) {
  const t = messages[locale];
  const ui = storefrontLabels(locale);
  const name = localize(product.name, locale);
  const hero = photosFor(product, product.colors[0])[0] ?? product.heroImage;
  if (section === "specifications") {
    const dimensions = product.technicalDiagram;
    return <div className={styles.specGrid}>
      <dl className={styles.specList}>{product.specifications.map((spec) => <div key={spec.label.en}><dt>{localize(spec.label, locale)}</dt><dd>{localize(spec.value, locale)}</dd></div>)}</dl>
      <div className={styles.specMedia}>
        <div className={styles.productMainMedia}><Image src={hero} alt={name} fill sizes="(max-width: 767px) 94vw, 42vw" /></div>
        <div className={styles.infoBlock}><Ruler size={23} aria-hidden="true" /><h3>{ui.dimensions}</h3>
          <p>{specValue(product, /dimension|frame (size|width|length)|^size$/i, locale) ?? ui.notListed}</p>
          {dimensions ? <button type="button" className="button-secondary" onClick={() => onZoom([dimensions], 0)}>{ui.originalDrawing}<ZoomIn size={16} /></button> : <Link className={styles.textLink} href={`/${locale}/support/contact`}>{t.support.contact}<ArrowUpRight size={15} className="rtl:-rotate-90" /></Link>}
        </div>
      </div>
    </div>;
  }
  if (section === "gallery") {
    const images = distinct([...product.colors.flatMap((color) => photosFor(product, color)), product.heroImage, ...(product.detailImages ?? [])]);
    const { currentPage, totalPages, start } = clampPage(page, images.length, 6);
    return <>
      <div className={styles.productGalleryPage}>{images.slice(start, start + 6).map((image, index) => (
        <button key={image} type="button" onClick={() => onZoom(images, start + index)} aria-label={`${ui.enlarge} ${start + index + 1}`}>
          <span><Image src={image} alt={`${name} · ${start + index + 1}`} fill quality={85} sizes="(max-width: 767px) 45vw, 30vw" /></span>
          <span>{numbered(start + index + 1)} / {numbered(images.length)} <ZoomIn size={15} /></span>
        </button>
      ))}</div>
      <Pagination locale={locale} currentPage={currentPage} totalPages={totalPages} hrefForPage={(value) => `${path}/gallery${value > 1 ? `?page=${value}` : ""}`} label={ui.gallery} />
    </>;
  }
  if (section === "features") return <>
    <p className={styles.detailCopy}>{localize(product.description, locale)}</p>
    {product.features.length > 0 && <div className={styles.quickLinks}>{product.features.map((feature) => {
      const Icon = featureIcons[feature];
      return <div key={feature} className={styles.infoBlock}><Icon size={24} aria-hidden="true" /><h3>{storefrontFeatureName(locale, feature)}</h3></div>;
    })}</div>}
    <Link className={styles.textLink} href={`${path}/specifications`}>{t.product.specs}<ArrowUpRight size={16} className="rtl:-rotate-90" /></Link>
  </>;
  if (section === "compatibility") return <div className={styles.quickLinks}>
    <PanelLink href={`/${locale}/app`} icon={<Bluetooth size={24} />} title={t.product.compatibility} description={localize(product.compatibility, locale)} />
    {product.translationNote && <PanelLink href={`/${locale}/how-it-works`} icon={<Languages size={24} />} title={t.product.translation} description={localize(product.translationNote, locale)} />}
    {product.prescriptionNote && <PanelLink href={`/${locale}/lens-guide`} icon={<Glasses size={24} />} title={t.product.prescription} description={localize(product.prescriptionNote, locale)} />}
  </div>;
  if (section === "in-the-box") return <div className={styles.specGrid}>
    <ul className={styles.productBoxList}>{product.inTheBox.map((item) => <li key={item.en}><PackageCheck size={20} aria-hidden="true" />{localize(item, locale)}</li>)}</ul>
    <div className={styles.productMainMedia}><Image src={hero} alt={name} fill sizes="(max-width: 767px) 94vw, 42vw" /></div>
  </div>;
  return <div className={styles.specGrid}>
    <div>{product.faq.map((faq, index) => <details key={faq.question.en} className={styles.productFaq} open={index === 0 || undefined}><summary>{localize(faq.question, locale)}<ChevronDown size={18} /></summary><p>{localize(faq.answer, locale)}</p></details>)}</div>
    <PanelLink href={`/${locale}/support/contact`} icon={<CircleHelp size={24} />} title={t.support.contact} description={t.support.intro} />
  </div>;
}

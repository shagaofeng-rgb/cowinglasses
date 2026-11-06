"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Apple, ArrowUpRight, Bluetooth, ChevronDown, CircleHelp, Glasses, Mail, Plus, Ruler, Search, ShieldCheck, Smartphone, Truck, Undo2 } from "lucide-react";
import { collectionPaths } from "@/config/navigation";
import { businessDetails } from "@/config/business";
import { localize, type Locale } from "@/lib/i18n";
import { modelCode, sportModelSlug } from "@/lib/product-model";
import { messages } from "@/messages";
import { learning, collectionTitles } from "@/messages/learning";
import { storefrontFeatureName, storefrontLabels } from "@/messages/storefront";
import type { CollectionSlug, Product } from "@/types/product";
import { ProductCard } from "@/components/product/product-card";
import { DemoForm } from "@/components/forms/demo-form";
import { InteriorHead, PanelLink } from "@/components/layout/storefront-ui";
import { PolicyContent } from "@/components/compliance/policy-content";
import type { PolicyType } from "@/messages/policies";
import { faqCopy } from "@/messages/support";
import { salesCopy } from "@/messages/sales";
import { CartPage } from "./cart-page";
import { OrderCheckout } from "./order-checkout";
import { PaymentVerification } from "./payment-verification";
import { Price } from "./price";
import { QuotePage } from "./quote-page";
import { AccountPage } from "./account-page";
import { clampPage, Pagination } from "./pagination";
import styles from "@/components/layout/storefront-design.module.css";

const policyPaths: Record<string, PolicyType> = {
  "support/shipping-delivery": "shipping",
  "support/returns-refunds": "returns",
  "support/warranty": "warranty",
  "policies/privacy": "privacy",
  "policies/terms": "terms",
  "policies/intellectual-property": "intellectual-property",
};

export function RoutePage({ locale, segments, products = [], destinationLabels }: {
  locale: Locale; segments: string[]; products?: Product[]; destinationLabels?: Record<string, string>;
}) {
  const path = segments.join("/");
  const collection = collectionPaths.find((slug) => path === `collections/${slug}`);
  if (path === "shop" || path === "search" || collection) return <Catalogue locale={locale} products={products} collection={collection} search={path === "search"} />;
  if (path === "quote") return <QuotePage locale={locale} products={products} />;
  if (path === "cart") return <CartPage locale={locale} products={products} />;
  if (path === "checkout") return <OrderCheckout locale={locale} products={products} destinationLabels={destinationLabels} />;
  if (path === "payment-test") return <PaymentVerification locale={locale} />;
  if (path === "compare") return <Compare locale={locale} products={products} />;
  if (path === "account") return <AccountPage locale={locale} />;
  if (path === "app" || path === "how-it-works" || path === "lens-guide") return <Guide locale={locale} path={path} />;
  if (path === "support" || path === "support/faq") return <Support locale={locale} faq={path.endsWith("faq")} />;
  if (path === "support/contact") return <SupportContact locale={locale} />;
  if (Object.hasOwn(policyPaths, path)) return <Policy locale={locale} type={policyPaths[path]} destinationLabels={destinationLabels} />;
  return null;
}

const scene: Record<CollectionSlug, string> = {
  create: "create-night",
  explore: "movement-coast",
  everyday: "everyday-architecture",
  "music-movement": "movement-coast",
  "photochromic-sun": "everyday-architecture",
  "prescription-ready": "everyday-architecture",
};

const modelOrder = [sportModelSlug, "gl1", "v03-t5", "g06-l", "gl16-3", "v03-pro"];

function Catalogue({ locale, products, collection, search }: { locale: Locale; products: Product[]; collection?: CollectionSlug; search: boolean }) {
  const t = messages[locale];
  const ui = storefrontLabels(locale);
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const query = params.get("q") ?? "";
  const selectedFeature = params.get("feature");
  const feature = selectedFeature === "all" ? "" : selectedFeature ?? "";
  const selectedSort = params.get("sort");
  const sort = selectedSort === "low" || selectedSort === "high" ? selectedSort : "";
  const available = products.filter((product) => !product.demo && (!collection || product.collections.includes(collection)));
  const match = query.toLocaleLowerCase(locale);
  const filtered = available.filter((product) => (
    [product.slug, localize(product.name, locale), localize(product.description, locale), ...product.features, ...product.features.map((item) => storefrontFeatureName(locale, item))].join(" ").toLocaleLowerCase(locale).includes(match) &&
    (!feature || product.features.some((value) => value === feature))
  ));
  const rank = (slug: string) => modelOrder.indexOf(slug) === -1 ? modelOrder.length : modelOrder.indexOf(slug);
  filtered.sort((a, b) => sort === "low" ? a.usdPrice - b.usdPrice : sort === "high" ? b.usdPrice - a.usdPrice : rank(a.slug) - rank(b.slug));
  const size = 6;
  const { currentPage, totalPages, start } = clampPage(params.get("page"), filtered.length, size);
  const title = collection ? collectionTitles[locale][collection] : search ? t.nav.search : t.shop.title;
  const modelFeatures = [...new Set(available.flatMap((product) => product.features))].sort();

  function href(values: Record<string, string>) {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    return `${pathname}${next.size ? `?${next}` : ""}`;
  }

  return <div className={styles.page}>
    <InteriorHead eyebrow={ui.catalogue} title={title} intro={t.shop.intro}
      image={collection ? { src: `/images/home/lensworld/${scene[collection]}.webp`, alt: "", kind: "scene" } : undefined}
      aside={!collection && !search && <><strong className={styles.catalogCount} aria-hidden="true">{available.length}</strong><Link className="button-secondary" href={`/${locale}/compare`}>{t.common.compare}<ArrowUpRight size={17} className="rtl:-rotate-90" /></Link></>}
    />
    <section className={`shell ${styles.sectionTight}`}>
      <nav className={styles.collectionNav} aria-label={t.shop.scenario}>
        <Link href={`/${locale}/shop`} aria-current={!collection && !search ? "page" : undefined}>{ui.allModels}</Link>
        {collectionPaths.map((slug) => <Link key={slug} href={`/${locale}/collections/${slug}`} aria-current={collection === slug ? "page" : undefined}>{collectionTitles[locale][slug]}</Link>)}
      </nav>
      <div className={styles.catalogControls}>
        <form key={query} role="search" onSubmit={(event) => {
          event.preventDefault();
          const input = new FormData(event.currentTarget).get("q");
          router.replace(href({ q: String(input ?? "").trim(), page: "" }), { scroll: false });
        }}>
          <label htmlFor="catalogue-search">{t.nav.search}</label>
          <div className={styles.searchField}><input id="catalogue-search" name="q" type="search" defaultValue={query} placeholder={t.common.searchPlaceholder} /><button type="submit" aria-label={t.nav.search}><Search size={19} /></button></div>
        </form>
        <label>{t.shop.feature}<select value={feature} onChange={(event) => router.replace(href({ feature: event.target.value, page: "" }), { scroll: false })}>
          <option value="">{ui.allFeatures}</option>
          {feature && !modelFeatures.some((value) => value === feature) && <option value={feature}>{feature.replaceAll("-", " ")}</option>}
          {modelFeatures.map((item) => <option value={item} key={item}>{storefrontFeatureName(locale, item)}</option>)}
        </select></label>
        <label>{t.shop.sort}<select value={sort} onChange={(event) => router.replace(href({ sort: event.target.value, page: "" }), { scroll: false })}>
          <option value="">{t.shop.newest}</option><option value="low">{t.shop.lowHigh}</option><option value="high">{t.shop.highLow}</option>
        </select></label>
      </div>
      <div className={styles.resultsLine} aria-live="polite"><span>{filtered.length} {ui.models}</span><span>{size} {ui.perPage}</span></div>
      {filtered.length ? <>
        <div className={styles.catalogGrid}>{filtered.slice(start, start + size).map((product) => <ProductCard product={product} locale={locale} key={product.id} />)}</div>
        <Pagination locale={locale} currentPage={currentPage} totalPages={totalPages} hrefForPage={(page) => href({ page: page === 1 ? "" : String(page) })} label={title} />
      </> : <div className={styles.emptyState}>
        <Glasses size={34} aria-hidden="true" /><p>{t.common.noResults}</p>
        <Link className="button-secondary" href={query || feature ? pathname : `/${locale}/shop`}>{query || feature ? t.common.clear : ui.allModels}<ArrowUpRight size={17} className="rtl:-rotate-90" /></Link>
      </div>}
    </section>
  </div>;
}

function Compare({ locale, products }: { locale: Locale; products: Product[] }) {
  const t = messages[locale];
  const ui = storefrontLabels(locale);
  const available = products.filter((product) => !product.demo);
  const [ids, setIds] = useState(() => {
    const priority = modelOrder.slice(0, 2).flatMap((slug) => available.filter((product) => product.slug === slug));
    return [...new Set([...priority, ...available])].slice(0, 2).map((product) => product.id);
  });
  const selected = ids.flatMap((id) => available.filter((product) => product.id === id));
  const additional = available.find((product) => !ids.includes(product.id));
  const specs = [
    [ui.bluetooth, /^Bluetooth version$/i], [ui.playback, /music playing time|audio duration|playback (time|duration)/i],
    [ui.weight, /^weight$/i], [ui.charging, /^charging time$/i], [ui.dimensions, /dimension|frame (size|width|length)|^size$/i],
    [ui.battery, /^battery capacity$/i], [t.product.camera, /^shooting duration$/i],
  ] as const;
  return <div className={styles.page}>
    <InteriorHead eyebrow={ui.catalogue} title={t.common.compare} intro={ui.compareIntro} aside={
      selected.length === 3 ? <button type="button" className="button-secondary" onClick={() => setIds(ids.slice(0, 2))}>{ui.removeModel}</button> :
      additional && selected.length === 2 ? <button type="button" className="button-secondary" onClick={() => setIds([...ids, additional.id])}><Plus size={16} />{ui.addModel}</button> : null
    } />
    <section className={`shell ${styles.section}`}>
      {selected.length ? <>
        <p className={`mb-3 ${styles.resultsLine}`} aria-live="polite"><span>{selected.length} {ui.modelsSelected}</span><span>{ui.scrollComparison}</span></p>
        <div className={styles.compareTable} tabIndex={0} role="region" aria-label={t.common.compare}>
        <table className={selected.length === 3 ? styles.compareThree : undefined}>
          <thead><tr><th scope="col">{ui.model}</th>{selected.map((product, index) => <th key={product.id} scope="col">
            <label className={styles.compareOption}>{ui.model} {index + 1}<select aria-label={`${ui.model} ${index + 1}`} value={product.id} onChange={(event) => setIds(ids.map((id, slot) => slot === index ? event.target.value : id))}>
              {available.filter((item) => item.id === product.id || !ids.includes(item.id)).map((item) => <option value={item.id} key={item.id}>{modelCode(item.slug)}</option>)}
            </select></label>
            <Link className={styles.comparePhoto} href={`/${locale}/products/${product.slug}`} aria-label={localize(product.name, locale)}><Image src={product.heroImage} alt="" fill loading="eager" sizes="(max-width: 640px) 36vw, 32vw" /></Link>
            <Link className={styles.textLink} href={`/${locale}/products/${product.slug}`}>{ui.view}<ArrowUpRight size={14} className="rtl:-rotate-90" /></Link>
          </th>)}</tr></thead>
          <tbody>
            <tr><th scope="row">{t.shop.price} (USD)</th>{selected.map((product) => <td key={product.id}><Price usd={product.usdPrice} locale={locale} compact /></td>)}</tr>
            <tr><th scope="row">{salesCopy[locale].availability}</th>{selected.map((product) => <td key={product.id}>{product.colors.some((sku) => sku.available) ? salesCopy[locale].inStock : salesCopy[locale].pending}</td>)}</tr>
            <tr><th scope="row">{t.shop.lens}</th>{selected.map((product) => <td key={product.id}>{product.colors.map((color) => localize(color.name, locale)).join(" · ") || ui.notListed}</td>)}</tr>
            <tr><th scope="row">{t.shop.feature}</th>{selected.map((product) => <td key={product.id}>{product.features.map((feature) => storefrontFeatureName(locale, feature)).join(" · ") || ui.notListed}</td>)}</tr>
            {specs.map(([label, pattern]) => <tr key={label}><th scope="row">{label}</th>{selected.map((product) => {
              const spec = product.specifications.find((entry) => pattern.test(entry.label.en));
              return <td key={product.id}>{spec ? localize(spec.value, locale) : ui.notListed}</td>;
            })}</tr>)}
          </tbody>
        </table>
        </div>
      </> : <div className={styles.emptyState}><p>{t.common.noResults}</p><Link className="button-secondary" href={`/${locale}/shop`}>{ui.allModels}</Link></div>}
    </section>
  </div>;
}

const movement = "/images/home/lensworld/movement-coast.webp";
const frame = "/images/products/g200-sport-audio-glasses/blue-mirror-lens-02.webp";

function Guide({ locale, path }: { locale: Locale; path: "app" | "how-it-works" | "lens-guide" }) {
  const t = messages[locale];
  const ui = storefrontLabels(locale);
  const copy = learning[locale];
  const app = path === "app";
  const lens = path === "lens-guide";
  const guide = app ? copy.app : lens ? copy.lens : copy.how;
  const icons = lens ? [Glasses, Ruler, ShieldCheck] : [Glasses, Bluetooth, Smartphone];
  const ios = process.env.NEXT_PUBLIC_IOS_APP_URL;
  const android = process.env.NEXT_PUBLIC_ANDROID_APP_URL;
  return <div className={styles.page}>
    <InteriorHead eyebrow={ui.guide} title={guide.title} intro={guide.intro}
      image={lens ? { src: frame, alt: "G200 Sport Audio Glasses", kind: "product", caption: `G200 · ${ui.dimensions}` } : !app ? { src: movement, alt: "", kind: "scene" } : undefined} />
    <section className={`shell ${styles.section}`}>
      {app && <div className={styles.splitFeature}>
        <section className={styles.infoBlock}>
          <h2>{ui.choosePlatform}</h2>
          <div className={styles.appChoices}>
            {ios ? <a className="button-secondary" href={ios}><Apple size={19} />{copy.ios}</a> : <Link className="button-secondary" href={`/${locale}/support/contact`}><Apple size={19} />iOS · {t.support.contact}</Link>}
            {android ? <a className="button-secondary" href={android}><Smartphone size={19} />{copy.android}</a> : <Link className="button-secondary" href={`/${locale}/support/contact`}><Smartphone size={19} />Android · {t.support.contact}</Link>}
          </div>
        </section>
        <section className={styles.infoBlock}><ShieldCheck size={24} /><h2>{copy.permissions}</h2><ul className="grid gap-2 text-sm">{copy.notices.map((notice) => <li key={notice}>{notice}</li>)}</ul></section>
      </div>}
      <div className={`${styles.stepGrid} ${app ? "mt-4" : ""}`}>{guide.steps.map(([title, body], index) => {
        const Icon = icons[index];
        return <section className={styles.stepCard} key={title}>
          <span className={styles.stepNumber}>0{index + 1}</span>
          {Icon && <Icon size={23} aria-hidden="true" />}
          <h2>{title}</h2><p>{body}</p>
        </section>;
      })}</div>
      <div className={styles.quickLinks}>
        <PanelLink href={`/${locale}${lens ? "/collections/prescription-ready" : app ? "/how-it-works" : "/app"}`} title={lens ? collectionTitles[locale]["prescription-ready"] : app ? t.nav.howItWorks : t.common.app} icon={lens ? <Glasses size={23} /> : <Smartphone size={23} />} />
        <PanelLink href={`/${locale}/support/contact`} title={t.support.contact} icon={<CircleHelp size={23} />} />
      </div>
    </section>
  </div>;
}


function Support({ locale, faq }: { locale: Locale; faq: boolean }) {
  const t = messages[locale];
  const ui = storefrontLabels(locale);
  const copy = faqCopy[locale];
  const [query, setQuery] = useState("");
  const filtered = copy.faqs.filter((entry) => entry.join(" ").toLocaleLowerCase(locale).includes(query.trim().toLocaleLowerCase(locale)));
  return <div className={styles.page}>
    <InteriorHead eyebrow={ui.service} title={faq ? t.support.faq : t.support.title} intro={faq ? copy.intro : t.support.intro}
      aside={<Link className="button-primary" href={`/${locale}/support/contact`}>{t.support.contact}<ArrowUpRight size={17} className="rtl:-rotate-90" /></Link>} />
    <section className={`shell ${styles.section}`}>
      {faq ? <div className={styles.splitFeature}>
        <div className={styles.infoBlock}>
          <label className={styles.searchField}><span className="sr-only">{t.nav.search}</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.nav.search} /><Search size={19} aria-hidden="true" /></label>
          {filtered.length ? filtered.map(([question, answer], index) => <details key={question} className={styles.productFaq} open={index === 0 || undefined}>
            <summary>{question}<ChevronDown size={18} /></summary><p>{answer}</p>
          </details>) : <p role="status">{t.common.noResults}</p>}
        </div>
        <PanelLink href={`/${locale}/support/contact`} title={t.support.contact} description={copy.cards[1]} icon={<Mail size={23} />} />
      </div> : <div className={styles.supportGrid}>
        <PanelLink href={`/${locale}/support/faq`} title={t.support.faq} description={copy.cards[0]} icon={<CircleHelp size={23} />} />
        <PanelLink href={`/${locale}/support/contact`} title={t.support.contact} description={copy.cards[1]} icon={<Mail size={23} />} />
        <PanelLink href={`/${locale}/app`} title={t.common.app} icon={<Smartphone size={23} />} />
        <PanelLink href={`/${locale}/support/shipping-delivery`} title={t.footer.shipping} icon={<Truck size={23} />} />
        <PanelLink href={`/${locale}/support/returns-refunds`} title={t.footer.returns} icon={<Undo2 size={23} />} />
        <PanelLink href={`/${locale}/support/warranty`} title={t.footer.warranty} description={copy.cards[2]} icon={<ShieldCheck size={23} />} />
      </div>}
    </section>
  </div>;
}

function SupportContact({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return <div className={styles.page}>
    <InteriorHead eyebrow={storefrontLabels(locale).service} title={t.support.contact} intro={t.support.intro} />
    <section className={`shell ${styles.section} ${styles.splitFeature}`}>
      <div className={`${styles.infoBlock} ${styles.formSurface}`}><h2>{t.support.contact}</h2><DemoForm locale={locale} kind="support" /></div>
      <aside className={styles.infoBlock}><Mail size={25} aria-hidden="true" /><h2>{t.footer.help}</h2><Link className={styles.textLink} href={`/${locale}/quote`}>{salesCopy[locale].business}<ArrowUpRight size={15} className="rtl:-rotate-90" aria-hidden="true" /></Link><a className={styles.textLink} href={`mailto:${businessDetails.supportEmail}`}>{businessDetails.supportEmail}</a><p>{t.support.intro}</p></aside>
    </section>
  </div>;
}

function Policy({ locale, type, destinationLabels }: { locale: Locale; type: PolicyType; destinationLabels?: Record<string, string> }) {
  const t = messages[locale];
  const ui = storefrontLabels(locale);
  const titles: Record<PolicyType, string> = {
    shipping: t.footer.shipping, returns: t.footer.returns, warranty: t.footer.warranty, privacy: t.footer.privacy,
    terms: t.footer.terms, "intellectual-property": t.footer.intellectualProperty,
  };
  const legal = type === "privacy" || type === "terms" || type === "intellectual-property";
  return <div className={styles.page}>
    <InteriorHead eyebrow={legal ? ui.documents : ui.service} title={titles[type]}
      aside={!legal && <Link className="button-secondary" href={type === "warranty" ? "#warranty-request" : `/${locale}/support/contact`}>{t.support.contact}<ArrowUpRight size={17} className="rtl:-rotate-90" /></Link>} />
    <section className={`shell ${styles.section}`}>
      <PolicyContent locale={locale} type={type} destinationLabels={destinationLabels} />
      {type === "warranty" && <section id="warranty-request" className={`${styles.readerArticle} ${styles.infoBlock} ${styles.formSurface}`}><h2>{t.support.contact}</h2><DemoForm locale={locale} kind="warranty" /></section>}
    </section>
  </div>;
}

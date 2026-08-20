"use client";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { localize } from "@/lib/i18n";
import { products } from "@/data/fixtures/products";
import { ProductCard } from "@/components/product/product-card";

type RoutePageProps = { locale: Locale; segments: string[] };
export function RoutePage({ locale, segments }: RoutePageProps) {
  const path = segments.join("/");
  if (path === "shop") return <Shop locale={locale}/>;
  if (path.startsWith("collections/")) return <Collection locale={locale} slug={segments[1]}/>;
  if (path === "support" || path === "support/contact") return <Contact/>;
  return <NotFound locale={locale}/>;
}
function PageHead({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro: string }) { return <header className="shell py-10 md:py-16">{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1 className="mt-3 max-w-3xl text-4xl font-black tracking-[-.06em] md:text-6xl">{title}</h1><p className="mt-5 max-w-2xl leading-7 text-[var(--muted)]">{intro}</p></header>; }
function Shop({ locale }: { locale: Locale }) { const [query, setQuery] = useState(""); const shown = useMemo(() => products.filter((product) => `${product.name.en} ${product.description.en}`.toLowerCase().includes(query.toLowerCase())), [query]); return <><PageHead eyebrow="English product catalogue" title="Find your frame" intro="Browse verified product specifications and supplied product imagery. Prices, availability and shipping are confirmed individually."/><section className="shell pb-16"><label className="flex min-h-11 max-w-xl items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3"><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search models" className="w-full bg-transparent outline-none"/></label>{shown.length ? <div className="mt-8 grid gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">{shown.map((product) => <ProductCard product={product} locale={locale} key={product.id}/>)}</div> : <div className="py-20 text-center"><SlidersHorizontal className="mx-auto"/><p className="mt-4 text-[var(--muted)]">No products matched that search.</p></div>}</section></>; }
function Collection({ locale, slug }: { locale: Locale; slug?: string }) { const collection = slug || "explore"; const title = collection.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" "); const subset = products.filter((product) => product.collections.includes(collection as never)); return <><PageHead eyebrow="Collection" title={title} intro="A focused selection of the published English catalogue."/><section className="shell grid gap-x-5 gap-y-10 pb-16 sm:grid-cols-2 xl:grid-cols-3">{subset.length ? subset.map((product) => <ProductCard product={product} locale={locale} key={product.id}/>) : <p className="text-[var(--muted)]">No published products are in this collection yet.</p>}</section></>; }
function Contact() { return <><PageHead eyebrow="Product information" title="Ordering information" intro="This catalogue is available for product discovery. Pricing, minimum order quantity, shipping, regional availability and model-specific compliance documentation are provided by the sales team on request."/><section className="shell pb-16"><div className="max-w-2xl rounded-3xl bg-[var(--surface)] p-7"><h2 className="text-2xl font-black">Before placing an order</h2><ul className="mt-5 grid gap-3 leading-7 text-[var(--muted)]"><li>• Confirm the exact model, lens configuration and required quantity.</li><li>• Request the applicable price, delivery terms and market availability.</li><li>• Verify product-specific compliance documents for your import or distribution market.</li></ul></div></section></>; }
function NotFound({ locale }: { locale: Locale }) { return <section className="shell grid min-h-[55dvh] place-items-center py-16 text-center"><div><p className="eyebrow">404</p><h1 className="mt-3 text-4xl font-black tracking-[-.06em]">This page is not published.</h1><Link className="button-primary mt-7" href={`/${locale}/shop`}>Browse the catalogue</Link></div></section>; }

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { DemoForm } from "@/components/forms/demo-form";
import { products } from "@/data/fixtures/products";
import type { Locale } from "@/lib/i18n";
import { localize } from "@/lib/i18n";
import { messages } from "@/messages";
import type { Product } from "@/types/product";

const productIds = ["g200-sport-audio-glasses", "gl1", "gl6", "v03-t5"];

export function HomePage({ locale }: { locale: Locale }) {
  const t = messages[locale];
  const liveProducts = products.filter((product) => !product.demo);

  if (!liveProducts.length) return null;

  const hero = liveProducts.find((product) => product.id === "g200-sport-audio-glasses") ?? liveProducts[0];
  const editorialPicks = productIds
    .map((id) => liveProducts.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
  const collectionProducts = [
    { label: "Sport audio", title: "Open sound. Full focus.", product: hero },
    { label: "Everyday audio", title: "Your day, hands free.", product: findProduct(liveProducts, "gl1") },
    { label: "Smart capture", title: "Keep what matters close.", product: findProduct(liveProducts, "v03-t5") },
    { label: "New frames", title: "A sharper everyday edit.", product: findProduct(liveProducts, "gl6") },
  ];

  return <>
    <section className="border-b border-[var(--line)] bg-[var(--paper)]">
      <div className="shell grid items-stretch lg:min-h-[540px] lg:grid-cols-[.93fr_1.07fr]">
        <div className="flex flex-col justify-between py-12 md:py-16 lg:py-14">
          <div>
            <p className="eyebrow text-[#7f9412]">CoWin collection / 2026</p>
            <h1 className="mt-7 text-[clamp(3.45rem,5.1vw,5.6rem)] font-medium leading-[.84] tracking-[-.085em]">
              Choose smart.<br />See more. Do more.
            </h1>
            <p className="mt-8 max-w-md text-base leading-7 text-[var(--muted)] md:text-lg">
              Explore the current CoWin smart glasses collection: open-ear audio, lightweight frames and a product fit for every move.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href={`/${locale}/shop`} className="button-primary px-6 py-3.5">Shop all glasses <ArrowRight size={18} /></Link>
              <Link href={`/${locale}/products/${hero.slug}`} className="group inline-flex items-center gap-2 text-sm font-bold underline decoration-[var(--lime)] decoration-2 underline-offset-4">
                Meet {localize(hero.name, locale)} <ArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={16} />
              </Link>
            </div>
          </div>
          <div className="mt-14 grid max-w-xl grid-cols-3 border-y border-[var(--line)] py-5 text-xs leading-5 text-[var(--muted)]">
            <span><b className="block text-[var(--ink)]">16 models</b>Live product collection</span>
            <span><b className="block text-[var(--ink)]">USD pricing</b>Launch offers shown</span>
            <span><b className="block text-[var(--ink)]">Global support</b>Sales confirms delivery</span>
          </div>
        </div>
        <Link href={`/${locale}/products/${hero.slug}`} className="group relative flex min-h-[480px] items-center justify-center overflow-hidden bg-white px-5 py-12 md:min-h-[620px] lg:min-h-full lg:px-14">
          <span className="absolute left-6 top-6 z-10 text-[10px] font-bold uppercase tracking-[.18em] text-[var(--muted)]">Featured / {localize(hero.name, locale)}</span>
          <Image src={hero.heroImage} alt={localize(hero.name, locale)} width={1200} height={900} priority className="h-auto w-full max-w-[780px] object-contain transition duration-500 group-hover:scale-[1.025]" sizes="(max-width: 1024px) 100vw, 55vw" />
          <span className="absolute bottom-6 right-6 grid h-12 w-12 place-items-center rounded-full bg-[var(--lime)] text-[var(--ink)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"><ArrowUpRight size={20} /></span>
        </Link>
      </div>
    </section>

    <section className="shell py-16 md:py-24">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[var(--ink)] pb-5">
        <div><p className="eyebrow">The current edit</p><h2 className="mt-4 text-4xl font-medium tracking-[-.07em] md:text-5xl">Editorial picks</h2></div>
        <Link href={`/${locale}/shop`} className="group inline-flex items-center gap-2 text-sm font-bold">View all products <ArrowRight className="transition-transform group-hover:translate-x-1" size={17} /></Link>
      </div>
      <div className="grid divide-y divide-[var(--line)] border-b border-[var(--line)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
        {editorialPicks.map((product) => <EditorialProduct key={product.id} product={product} locale={locale} />)}
      </div>
    </section>

    <section className="border-y border-[var(--line)] bg-white">
      <div className="shell py-16 md:py-24">
        <div className="grid gap-8 lg:grid-cols-[.82fr_1.18fr] lg:items-end">
          <div><p className="eyebrow text-[#7f9412]">Find your pair</p><h2 className="mt-4 max-w-md text-4xl font-medium tracking-[-.07em] md:text-5xl">Start with the way you move.</h2><p className="mt-5 max-w-sm leading-7 text-[var(--muted)]">Every model shown here is already part of the live CoWin collection, with supplied photography and current USD pricing.</p></div>
          <div className="grid grid-cols-2 border-l border-t border-[var(--line)] md:grid-cols-4">{collectionProducts.map(({ label, title, product }, index) => <CollectionLink key={label} label={label} title={title} product={product} locale={locale} index={index} />)}</div>
        </div>
      </div>
    </section>

    <section className="shell py-16 md:py-24"><div className="grid border-y border-[var(--line)] md:grid-cols-3"><Value title="See the real product" number="01" text="Browse supplied product photos, dimensions and specifications before ordering." /><Value title="Choose your finish" number="02" text="Colour selection only appears when that model has real supplied colour options." /><Value title="Order with clarity" number="03" text="Buy or add to cart, then confirm delivery and final details with the sales team." /></div></section>

    <section className="border-t border-[var(--line)] bg-[var(--dark)] py-16 text-white md:py-20"><div className="shell grid gap-10 md:grid-cols-[1fr_.72fr] md:items-end"><div><p className="eyebrow text-[#c9d4a5]">CoWin updates</p><h2 className="mt-4 max-w-xl text-4xl font-medium tracking-[-.07em] md:text-5xl">{t.home.subscribe}</h2><p className="mt-5 max-w-md leading-7 text-zinc-300">{t.home.subscribeCopy}</p></div><div className="bg-white p-5 text-[var(--ink)] md:p-6"><DemoForm locale={locale} kind="newsletter" /></div></div></section>
  </>;
}

function findProduct(productsToSearch: Product[], id: string) {
  return productsToSearch.find((product) => product.id === id) ?? productsToSearch[0];
}

function EditorialProduct({ product, locale }: { product: Product; locale: Locale }) {
  const name = localize(product.name, locale);
  const colorCount = product.colors.filter((color) => color.available).length;
  return <article className="group min-w-0 py-6 sm:px-5 sm:py-7 first:sm:ps-0 last:sm:pe-0 xl:px-6"><Link href={`/${locale}/products/${product.slug}`} className="block"><div className="relative flex aspect-[1.15/1] items-center justify-center overflow-hidden bg-[var(--paper)] p-5"><Image src={product.heroImage} alt={name} width={640} height={560} className="h-full w-full object-contain transition duration-500 group-hover:scale-[1.045]" sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw" /><span className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-[var(--lime)] opacity-0 transition group-hover:opacity-100"><ArrowUpRight size={15} /></span></div><p className="mt-5 text-[10px] font-bold uppercase tracking-[.16em] text-[var(--muted)]">Available now{colorCount > 1 ? ` / ${colorCount} colours` : ""}</p><h3 className="mt-2 text-2xl font-medium leading-[.94] tracking-[-.055em]">{name}</h3><p className="mt-3 min-h-10 text-sm leading-5 text-[var(--muted)]">{localize(product.tagline, locale)}</p><p className="mt-5 text-lg font-bold">{formatUsd(product.usdPrice)} {product.compareAtUsdPrice && <del className="ml-2 text-sm font-medium text-[var(--muted)]">{formatUsd(product.compareAtUsdPrice)}</del>}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold underline decoration-[var(--lime)] decoration-2 underline-offset-4">Discover <ArrowRight size={15} /></span></Link></article>;
}

function CollectionLink({ label, title, product, locale, index }: { label: string; title: string; product: Product; locale: Locale; index: number }) {
  return <Link href={`/${locale}/products/${product.slug}`} className="group relative flex min-h-[280px] flex-col justify-between overflow-hidden border-b border-r border-[var(--line)] p-5 md:min-h-[340px]"><div><span className="text-xs font-bold text-[#7f9412]">0{index + 1}</span><p className="mt-6 text-xs font-bold uppercase tracking-[.15em] text-[var(--muted)]">{label}</p><h3 className="mt-3 max-w-[12ch] text-2xl font-medium leading-[.94] tracking-[-.055em]">{title}</h3></div><div className="relative mt-5 h-28 w-full"><Image src={product.heroImage} alt="" fill className="object-contain object-right-bottom transition duration-500 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" /></div><ArrowUpRight className="absolute right-4 top-4 text-[var(--muted)] transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[var(--ink)]" size={17} /></Link>;
}

function Value({ title, number, text }: { title: string; number: string; text: string }) {
  return <article className="border-b border-[var(--line)] px-0 py-8 last:border-b-0 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"><p className="text-sm font-bold text-[#7f9412]">{number}</p><h3 className="mt-12 text-2xl font-medium tracking-[-.055em]">{title}</h3><p className="mt-3 max-w-xs text-sm leading-6 text-[var(--muted)]">{text}</p></article>;
}

function formatUsd(value: number) {
  return `USD ${value.toFixed(2).replace(/\\.00$/, "")}`;
}

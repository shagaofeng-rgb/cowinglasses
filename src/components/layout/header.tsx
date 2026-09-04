"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { mainNavigation, secondaryNavigation } from "@/config/navigation";
import { currencies } from "@/config/currencies";
import { localeMeta, locales, pathFor, type Locale } from "@/lib/i18n";
import { messages } from "@/messages";
import { useCart } from "@/providers/cart-provider";

export function Header({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const { lines, currency, setCurrency } = useCart();
  const t = messages[locale];
  const pathname = usePathname();
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  return (
    <>
      <div className={`${isHome ? "border-b border-white/10 bg-[#090b0c]" : "bg-black"} px-5 py-3 text-xs font-medium text-white`}>
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-1 text-center md:grid-cols-3 md:text-start">
          <span className="hidden md:block">Ship to: International</span>
          <span className="md:text-center">{t.announcement}</span>
          <Link href={`/${locale}/support`} className="hidden text-end hover:text-[var(--lime)] md:block">{t.nav.support}</Link>
        </div>
      </div>
      <header className={`sticky top-0 z-30 border-b backdrop-blur ${isHome ? "border-white/10 bg-[rgba(9,11,12,.94)] text-white" : "border-[var(--line)] bg-[color:rgba(248,248,245,.94)]"}`}>
        <div className="shell flex h-[72px] items-center justify-between gap-4">
          <Link href={`/${locale}`} dir="ltr" className="text-2xl font-black tracking-[-.1em]" aria-label="CoWin Glasses home">COWIN<span className={isHome ? "text-[var(--lime)]" : "text-[#94aa10]"}>.</span></Link>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
            {mainNavigation.map((item) => <Link className={`text-sm font-semibold ${isHome ? "hover:text-[var(--lime)]" : "hover:text-[#6b7e0d]"}`} key={item.href} href={`/${locale}${item.href}`}>{t.nav[item.label]}</Link>)}
            <details className="group relative">
              <summary className={`flex cursor-pointer list-none items-center gap-1.5 text-sm font-semibold ${isHome ? "hover:text-[var(--lime)]" : "hover:text-[#6b7e0d]"}`}>
                {t.nav.more}<ChevronDown size={15} className="transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="absolute start-1/2 top-full z-40 mt-4 w-56 -translate-x-1/2 rounded-2xl border border-[var(--line)] bg-white p-2 shadow-[0_18px_45px_rgba(22,35,29,.14)]">
                {secondaryNavigation.map((item) => <Link className="block rounded-xl px-4 py-3 text-sm font-bold hover:bg-[#f3f6f4] hover:text-[#617300]" key={item.href} href={`/${locale}${item.href}`}>{t.nav[item.label]}</Link>)}
              </div>
            </details>
          </nav>
          <div className="hidden items-center gap-4 lg:flex">
            <label className="sr-only" htmlFor="currency">Currency</label>
            <select id="currency" value={currency} onChange={(event) => setCurrency(event.target.value as typeof currency)} className="bg-transparent text-xs font-bold [&>option]:text-black" aria-label="Choose currency">{currencies.map((code) => <option key={code}>{code}</option>)}</select>
            <label className="sr-only" htmlFor="language">Language</label>
            <select id="language" value={locale} onChange={(event) => { document.cookie = `cowin-locale=${event.target.value};path=/;max-age=31536000`; window.location.assign(pathFor(event.target.value as Locale)); }} className="bg-transparent text-xs font-bold [&>option]:text-black" aria-label="Choose language">{locales.map((code) => <option key={code} value={code}>{localeMeta[code].nativeLabel}</option>)}</select>
            <Link href={`/${locale}/search`} aria-label={t.nav.search}><Search size={20} /></Link>
            <Link href={`/${locale}/cart`} className="relative" aria-label={t.nav.cart}><ShoppingBag size={20} />{lines.length > 0 && <span className="absolute -end-3 -top-3 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--lime)] px-1 text-[10px] font-bold text-black">{lines.length}</span>}</Link>
          </div>
          <button className="lg:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
        {open && <div className={`border-t lg:hidden ${isHome ? "border-white/10 bg-[#090b0c] text-white" : "border-[var(--line)] bg-[var(--paper)]"}`}>
          <nav className="shell grid gap-1 py-4" aria-label="Mobile navigation">
            {mainNavigation.map((item) => <Link onClick={() => setOpen(false)} className={`rounded-xl px-3 py-3 font-bold ${isHome ? "hover:bg-white/10" : "hover:bg-white"}`} key={item.href} href={`/${locale}${item.href}`}>{t.nav[item.label]}</Link>)}
            <div className={`my-2 border-y py-2 ${isHome ? "border-white/10" : "border-[var(--line)]"}`}>
              <p className="px-3 py-2 text-xs font-black uppercase tracking-[.14em] text-[var(--muted)]">{t.nav.more}</p>
              {secondaryNavigation.map((item) => <Link onClick={() => setOpen(false)} className={`block rounded-xl px-3 py-3 font-bold ${isHome ? "hover:bg-white/10" : "hover:bg-white"}`} key={item.href} href={`/${locale}${item.href}`}>{t.nav[item.label]}</Link>)}
            </div>
            <Link onClick={() => setOpen(false)} className={`rounded-xl px-3 py-3 font-bold ${isHome ? "hover:bg-white/10" : "hover:bg-white"}`} href={`/${locale}/search`}>{t.nav.search}</Link>
            <Link onClick={() => setOpen(false)} className={`rounded-xl px-3 py-3 font-bold ${isHome ? "hover:bg-white/10" : "hover:bg-white"}`} href={`/${locale}/cart`}>{t.nav.cart} ({lines.length})</Link>
            <div className="mt-2 flex gap-3 px-3">
              <select value={currency} onChange={(event) => setCurrency(event.target.value as typeof currency)} className={`min-h-11 rounded-xl border px-3 font-bold ${isHome ? "border-white/15 bg-[#151719] text-white" : "border-[var(--line)] bg-white"}`} aria-label="Choose currency">{currencies.map((code) => <option key={code}>{code}</option>)}</select>
              <select value={locale} onChange={(event) => { document.cookie = `cowin-locale=${event.target.value};path=/;max-age=31536000`; window.location.assign(pathFor(event.target.value as Locale)); }} className={`min-h-11 rounded-xl border px-3 font-bold ${isHome ? "border-white/15 bg-[#151719] text-white" : "border-[var(--line)] bg-white"}`} aria-label="Choose language">{locales.map((code) => <option key={code}>{localeMeta[code].nativeLabel}</option>)}</select>
            </div>
          </nav>
        </div>}
      </header>
    </>
  );
}

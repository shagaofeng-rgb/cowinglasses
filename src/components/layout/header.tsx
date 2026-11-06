"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { mainNavigation, secondaryNavigation } from "@/config/navigation";
import { currencies } from "@/config/currencies";
import { localeMeta, locales, pathFor, type Locale } from "@/lib/i18n";
import { salesCopy } from "@/messages/sales";
import { messages } from "@/messages";
import { useCart } from "@/providers/cart-provider";
import styles from "./storefront-design.module.css";

export function Header({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  return <HeaderContent key={pathname} locale={locale} pathname={pathname} />;
}

function HeaderContent({ locale, pathname }: { locale: Locale; pathname: string }) {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreTrigger = useRef<HTMLButtonElement>(null);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const { lines, currency, setCurrency } = useCart();
  const t = messages[locale];
  const moreLinks = [
    ...secondaryNavigation.map((item) => ({ href: item.href, label: t.nav[item.label] })),
    { href: "/quote", label: salesCopy[locale].business },
  ];
  const interior = pathname !== `/${locale}` && pathname !== `/${locale}/`;

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!moreMenuRef.current?.contains(event.target as Node)) setMoreOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (open) mobileTrigger.current?.focus({ preventScroll: true });
      else if (moreOpen && moreMenuRef.current?.contains(document.activeElement)) moreTrigger.current?.focus({ preventScroll: true });
      setMoreOpen(false);
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [moreOpen, open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const wide = window.matchMedia("(min-width: 1024px)");
    const onResize = () => { if (wide.matches) setOpen(false); };
    wide.addEventListener("change", onResize);
    return () => { document.body.style.overflow = previous; wide.removeEventListener("change", onResize); };
  }, [open]);

  function changeLanguage(next: Locale) {
    document.cookie = `cowin-locale=${next};path=/;max-age=31536000`;
    window.location.assign(pathFor(next, pathname.replace(/^\/(en|ar|es|pt|ja|ko)(?=\/|$)/, "")) + window.location.search);
  }

  return (
    <>
      <div className={`border-b border-white/10 bg-[#090b0c] px-5 py-3 text-xs font-medium text-white ${interior ? styles.announcementInterior : ""}`}>
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-1 text-center md:grid-cols-3 md:text-start">
          {!interior && <span className="hidden md:block">Ship to: International</span>}
          <span className={interior ? "md:col-span-3 md:text-center" : "md:text-center"}>{t.announcement}</span>
          {!interior && <Link href={`/${locale}/support`} className="hidden text-end hover:text-[var(--lime)] md:block">{t.nav.support}</Link>}
        </div>
      </div>
      <header className={`sticky top-0 z-30 border-b border-white/10 bg-[rgba(9,11,12,.94)] text-white backdrop-blur ${interior ? styles.headerInterior : ""}`}>
        <div className={`shell flex h-[72px] items-center justify-between gap-4 ${interior ? styles.headerInner : ""}`}>
          <Link href={`/${locale}`} dir="ltr" className="text-2xl font-black tracking-[-.1em]" aria-label="CoWin Glasses home">COWIN<span className="text-[var(--lime)]">.</span></Link>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
            {mainNavigation.map((item) => <Link className="text-sm font-semibold hover:text-[var(--lime)]" key={item.href} href={`/${locale}${item.href}`} aria-current={interior && pathname === `/${locale}${item.href}` ? "page" : undefined}>{t.nav[item.label]}</Link>)}
            <div
              ref={moreMenuRef}
              className="relative"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setMoreOpen(false);
              }}
            >
              <button ref={moreTrigger} type="button" aria-expanded={moreOpen} aria-controls="storefront-more-menu" className="flex items-center gap-1.5 text-sm font-semibold hover:text-[var(--lime)]" onClick={() => setMoreOpen((current) => !current)}>
                {t.nav.more}<ChevronDown size={15} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {moreOpen ? <div className="absolute start-0 top-full z-40 w-56 pt-4"><div id="storefront-more-menu" className="rounded-2xl border border-[var(--line)] bg-white p-2 text-black shadow-[0_18px_45px_rgba(22,35,29,.14)]">
                {moreLinks.map((item) => <Link onClick={() => setMoreOpen(false)} className="block rounded-xl px-4 py-3 text-sm font-bold hover:bg-[#f3f6f4] hover:text-[#617300]" key={item.href} href={`/${locale}${item.href}`} aria-current={interior && pathname === `/${locale}${item.href}` ? "page" : undefined}>{item.label}</Link>)}
              </div></div> : null}
            </div>
          </nav>
          <div className="hidden items-center gap-4 lg:flex">
            <label className="sr-only" htmlFor="currency">Currency</label>
            <select id="currency" value={currency} onChange={(event) => setCurrency(event.target.value as typeof currency)} className="bg-transparent text-xs font-bold [&>option]:text-black" aria-label="Choose currency">{currencies.map((code) => <option key={code}>{code}</option>)}</select>
            <label className="sr-only" htmlFor="language">Language</label>
            <select id="language" value={locale} onChange={(event) => changeLanguage(event.target.value as Locale)} className="bg-transparent text-xs font-bold [&>option]:text-black" aria-label="Choose language">{locales.map((code) => <option key={code} value={code}>{localeMeta[code].nativeLabel}</option>)}</select>
            <Link href={`/${locale}/search`} aria-label={t.nav.search}><Search size={20} /></Link>
            {interior && <Link href={`/${locale}/account`} aria-label={t.nav.account}><UserRound size={20} /></Link>}
            <Link href={`/${locale}/cart`} className="relative" aria-label={t.nav.cart}><ShoppingBag size={20} />{lines.length > 0 && <span className="absolute -end-3 -top-3 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--lime)] px-1 text-[10px] font-bold text-black">{lines.length}</span>}</Link>
          </div>
          {interior && <div className={styles.mobileTools}>
            <select value={locale} onChange={(event) => changeLanguage(event.target.value as Locale)} aria-label="Choose language">{locales.map((code) => <option key={code} value={code}>{localeMeta[code].nativeLabel}</option>)}</select>
            <Link href={`/${locale}/search`} aria-label={t.nav.search}><Search size={20} /></Link>
            <Link href={`/${locale}/cart`} className="relative" aria-label={t.nav.cart}><ShoppingBag size={20} />{lines.length > 0 && <span className="absolute end-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--lime)] px-1 text-[10px] font-bold text-black">{lines.length}</span>}</Link>
          </div>}
          <button ref={mobileTrigger} type="button" className="grid size-11 place-items-center lg:hidden" aria-controls="storefront-mobile-menu" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
        {open && <div id="storefront-mobile-menu" className="max-h-[calc(100dvh-72px)] overflow-y-auto overscroll-contain border-t border-white/10 bg-[#090b0c] text-white lg:hidden">
          <nav className="shell grid gap-1 py-4" aria-label="Mobile navigation">
            {mainNavigation.map((item) => <Link onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-bold hover:bg-white/10" key={item.href} href={`/${locale}${item.href}`} aria-current={interior && pathname === `/${locale}${item.href}` ? "page" : undefined}>{t.nav[item.label]}</Link>)}
            <div className="my-2 border-y border-white/10 py-2">
              <p className="px-3 py-2 text-xs font-black uppercase tracking-[.14em] text-[var(--muted)]">{t.nav.more}</p>
              {moreLinks.map((item) => <Link onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 font-bold hover:bg-white/10" key={item.href} href={`/${locale}${item.href}`} aria-current={interior && pathname === `/${locale}${item.href}` ? "page" : undefined}>{item.label}</Link>)}
            </div>
            <Link onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-bold hover:bg-white/10" href={`/${locale}/search`}>{t.nav.search}</Link>
            <Link onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-bold hover:bg-white/10" href={`/${locale}/cart`}>{t.nav.cart} ({lines.length})</Link>
            {interior && <Link onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 font-bold hover:bg-white/10" href={`/${locale}/account`}>{t.nav.account}</Link>}
            <div className="mt-2 flex gap-3 px-3">
              <select value={currency} onChange={(event) => setCurrency(event.target.value as typeof currency)} className="min-h-11 rounded-xl border border-white/15 bg-[#151719] px-3 font-bold text-white [&>option]:text-black" aria-label="Choose currency">{currencies.map((code) => <option key={code}>{code}</option>)}</select>
              <select value={locale} onChange={(event) => changeLanguage(event.target.value as Locale)} className="min-h-11 rounded-xl border border-white/15 bg-[#151719] px-3 font-bold text-white [&>option]:text-black" aria-label="Choose language">{locales.map((code) => <option key={code} value={code}>{localeMeta[code].nativeLabel}</option>)}</select>
            </div>
          </nav>
        </div>}
      </header>
    </>
  );
}

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { type Locale } from "@/lib/i18n";
import { messages } from "@/messages";
import { PaymentMethods } from "@/components/compliance/payment-methods";
import { businessDetails } from "@/config/business";

export function Footer({ locale }: { locale: Locale }) {
  const t = messages[locale];
  return (
    <footer className="overflow-hidden border-t border-white/10 bg-[var(--dark)] text-white">
      <div className="shell grid gap-10 py-14 md:grid-cols-[1.2fr_.8fr] md:items-end md:py-20">
        <div>
          <p dir="ltr" className="font-[family-name:var(--display)] text-[clamp(5rem,14vw,12rem)] font-semibold leading-[.65] tracking-[-.03em]">
            COWIN<span className="text-[var(--lime)]">.</span>
          </p>
          <p className="mt-8 max-w-md text-sm leading-7 text-zinc-300">{t.home.title}</p>
        </div>
        <Link className="group flex min-h-20 items-center justify-between border-y border-white/20 py-5 text-2xl" href={`/${locale}/shop`}>
          {t.nav.shop}
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--lime)] text-black transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1">
            <ArrowUpRight size={20} className="rtl:-rotate-90" />
          </span>
        </Link>
      </div>
      <div className="shell grid gap-10 border-t border-white/15 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-sm text-xs leading-6 text-zinc-400">
          <p className="font-bold text-white">{businessDetails.legalName}</p>
          <address className="mt-2 not-italic">{businessDetails.registeredAddress}</address>
          <a className="mt-2 inline-block underline underline-offset-4 hover:text-white" href={`mailto:${businessDetails.supportEmail}`}>{businessDetails.supportEmail}</a>
        </div>
        <FooterGroup title={t.footer.product} links={[[t.nav.shop, "/shop"], [t.common.compare, "/compare"], [t.nav.howItWorks, "/how-it-works"], [t.common.app, "/app"]]} locale={locale} />
        <FooterGroup title={t.footer.help} links={[[t.footer.contact, "/support/contact"], [t.footer.shipping, "/support/shipping-delivery"], [t.footer.returns, "/support/returns-refunds"], [t.footer.warranty, "/support/warranty"]]} locale={locale} />
        <FooterGroup title={t.footer.legal} links={[[t.footer.privacy, "/policies/privacy"], [t.footer.terms, "/policies/terms"], [t.footer.intellectualProperty, "/policies/intellectual-property"]]} locale={locale} />
      </div>
      <div className="shell grid gap-6 border-t border-white/15 py-6 md:grid-cols-[1fr_auto] md:items-end">
        <p className="text-xs text-zinc-400">{t.footer.copyright}</p>
        <PaymentMethods compact />
      </div>
    </footer>
  );
}

function FooterGroup({
  title,
  links,
  locale,
}: {
  title: string;
  links: [string, string][];
  locale: Locale;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-[.12em] text-zinc-400">{title}</h2>
      <ul className="mt-5 grid gap-3">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link className="inline-flex items-center gap-1 text-sm text-zinc-200 hover:text-[var(--lime)]" href={`/${locale}${href}`}>
              {label}<ArrowUpRight size={13} className="rtl:-rotate-90" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

import Script from "next/script";
import { notFound } from "next/navigation";
import { StoreShell } from "@/components/layout/store-shell";
import { metaPixelCode, SiteDocument, siteDocumentMetadata } from "@/components/layout/site-document";
import { isLocale, localeMeta, locales } from "@/lib/i18n";

export const metadata = siteDocumentMetadata;
export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <SiteDocument lang={locale} dir={localeMeta[locale].direction}>
    <Script id="cowin-meta-pixel" strategy="beforeInteractive">{metaPixelCode}</Script>
    <StoreShell locale={locale}>{children}</StoreShell>
  </SiteDocument>;
}

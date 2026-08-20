import { notFound } from "next/navigation";
import { StoreShell } from "@/components/layout/store-shell";
import { isLocale } from "@/lib/i18n";

export function generateStaticParams() { return ["en", "ar", "es", "pt", "ja", "ko"].map((locale) => ({ locale })); }
export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <StoreShell locale={locale}>{children}</StoreShell>; }

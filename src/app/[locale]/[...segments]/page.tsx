import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoutePage } from "@/components/commerce/route-page";
import { isLocale } from "@/lib/i18n";
import { siteConfig } from "@/config/site";
import { getStoreProducts } from "@/data/repositories/products";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; segments?: string[] }> }): Promise<Metadata> { const { locale, segments = [] } = await params; const label = segments.join(" ").replace(/\b\w/g, (character) => character.toUpperCase()) || "Shop"; return { title: `${label} | ${siteConfig.name}`, alternates: { canonical: `/${locale}/${segments.join("/")}`, languages: { en: `/en/${segments.join("/")}`, ar: `/ar/${segments.join("/")}`, es: `/es/${segments.join("/")}`, pt: `/pt/${segments.join("/")}`, ja: `/ja/${segments.join("/")}`, ko: `/ko/${segments.join("/")}` } } }; }
export default async function RoutedPage({ params }: { params: Promise<{ locale: string; segments?: string[] }> }) { const { locale, segments = [] } = await params; if (!isLocale(locale)) notFound(); return <RoutePage locale={locale} segments={segments} products={await getStoreProducts()}/>; }

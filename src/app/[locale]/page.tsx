import { HomePage } from "@/components/home/home-page";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { getStoreProducts } from "@/data/repositories/products";
export default async function LocalizedHome({ params }: { params: Promise<{ locale: string }> }) { const { locale } = await params; if (!isLocale(locale)) notFound(); return <HomePage locale={locale} products={await getStoreProducts()}/>; }

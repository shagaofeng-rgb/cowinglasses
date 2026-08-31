import { HomePage } from "@/components/home/home-page";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { getStoreProducts } from "@/data/repositories/products";
import type { Metadata } from "next";
import { messages } from "@/messages";
import { siteConfig } from "@/config/site";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const path = `/${locale}`;
  return {
    title: messages[locale].home.title,
    description: messages[locale].home.intro,
    alternates: {
      canonical: path,
      languages: {
        en: "/en",
        ar: "/ar",
        es: "/es",
        pt: "/pt",
        ja: "/ja",
        ko: "/ko",
        "x-default": "/en",
      },
    },
    openGraph: {
      title: messages[locale].home.title,
      description: messages[locale].home.intro,
      url: new URL(path, siteConfig.url),
      siteName: siteConfig.name,
      type: "website",
    },
  };
}
export default async function LocalizedHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <HomePage locale={locale} products={await getStoreProducts()} />;
}

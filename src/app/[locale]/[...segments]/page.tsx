import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoutePage } from "@/components/commerce/route-page";
import { siteConfig } from "@/config/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; segments?: string[] }> }): Promise<Metadata> {
  const { locale, segments = [] } = await params;
  if (locale !== "en") return {};
  const label = segments.join(" ").replace(/\\b\\w/g, (character) => character.toUpperCase()) || "Shop";
  const pathname = `/en/${segments.join("/")}`;
  return { title: `${label} | ${siteConfig.name}`, alternates: { canonical: pathname, languages: { en: pathname } } };
}
export default async function RoutedPage({ params }: { params: Promise<{ locale: string; segments?: string[] }> }) { const { locale, segments = [] } = await params; if (locale !== "en") notFound(); return <RoutePage locale="en" segments={segments}/>; }

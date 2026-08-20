import { notFound } from "next/navigation";
import { StoreShell } from "@/components/layout/store-shell";

export function generateStaticParams() { return [{ locale: "en" }]; }
export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) { const { locale } = await params; if (locale !== "en") notFound(); return <StoreShell locale="en">{children}</StoreShell>; }

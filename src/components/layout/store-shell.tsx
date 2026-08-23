import { CartProvider } from "@/providers/cart-provider";
import { Header } from "./header";
import { Footer } from "./footer";
import type { Locale } from "@/lib/i18n";
import { StorefrontTracker } from "@/components/analytics/storefront-tracker";
import { AnalyticsConsent } from "@/components/analytics/analytics-consent";

export function StoreShell({ locale, children }: { locale: Locale; children: React.ReactNode }) { return <CartProvider><Suspense fallback={null}><StorefrontTracker/></Suspense><div dir={locale === "ar" ? "rtl" : "ltr"} lang={locale} className="min-h-[100dvh] bg-[var(--paper)]"><Header locale={locale}/><main>{children}</main><Footer locale={locale}/></div><AnalyticsConsent/></CartProvider>; }
import { Suspense } from "react";

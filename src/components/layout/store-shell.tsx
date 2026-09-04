import { CartProvider } from "@/providers/cart-provider";
import { Header } from "./header";
import { Footer } from "./footer";
import type { Locale } from "@/lib/i18n";
import { StorefrontTracker } from "@/components/analytics/storefront-tracker";
import { AnalyticsConsent } from "@/components/analytics/analytics-consent";

export function StoreShell({ locale, children }: { locale: Locale; children: React.ReactNode }) { return <CartProvider><Suspense fallback={null}><StorefrontTracker/></Suspense><div dir={locale === "ar" ? "rtl" : "ltr"} lang={locale} className="min-h-[100dvh] bg-[var(--paper)]"><a className="fixed start-4 top-4 z-[100] -translate-y-24 rounded-lg bg-[var(--lime)] px-4 py-3 font-bold text-black focus:translate-y-0" href="#main-content">Skip to content</a><Header locale={locale}/><main id="main-content">{children}</main><Footer locale={locale}/></div><AnalyticsConsent/></CartProvider>; }
import { Suspense } from "react";

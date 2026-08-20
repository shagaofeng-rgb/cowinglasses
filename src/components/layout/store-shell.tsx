import { CartProvider } from "@/providers/cart-provider";
import { Header } from "./header";
import { Footer } from "./footer";
import type { Locale } from "@/lib/i18n";

export function StoreShell({ locale, children }: { locale: Locale; children: React.ReactNode }) { return <CartProvider><div dir={locale === "ar" ? "rtl" : "ltr"} lang={locale} className="min-h-[100dvh] bg-[var(--paper)]"><Header locale={locale}/><main>{children}</main><Footer locale={locale}/></div></CartProvider>; }

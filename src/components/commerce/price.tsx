"use client";
import { type Locale } from "@/lib/i18n";
import { convertFromUsd, formatCurrency, rateUpdatedAt } from "@/lib/currency";
import { messages } from "@/messages";
import { useCart } from "@/providers/cart-provider";

export function Price({ usd, locale, compact = false }: { usd: number; locale: Locale; compact?: boolean }) { const { currency } = useCart(); const t = messages[locale].common; const local = convertFromUsd(usd, currency); return <div><p className="text-xl font-black tracking-tight">{formatCurrency(local, currency)}</p><p className="mt-1 text-xs text-[var(--muted)]">{t.estimated} · ${usd.toFixed(2)} USD</p>{!compact && <div className="mt-3 grid gap-1 text-xs leading-5 text-[var(--muted)]"><p>{t.finalUsd}</p><p>{t.exchange}</p><p>{t.lastUpdated}: {rateUpdatedAt(currency)}</p></div>}</div>; }

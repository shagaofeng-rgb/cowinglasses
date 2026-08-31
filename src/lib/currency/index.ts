import { currencyLocales } from "@/config/currencies";
import { exchangeRates } from "@/data/fixtures/exchange-rates";
import type { CurrencyCode } from "@/types/commerce";

export function convertFromUsd(usd: number, currency: CurrencyCode): number {
  return usd * (exchangeRates.find((rate) => rate.currency === currency)?.rate || 1);
}
export function formatCurrency(value: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat(currencyLocales[currency], { style: "currency", currency, maximumFractionDigits: currency === "JPY" || currency === "KRW" ? 0 : 2 }).format(value);
}
export function rateUpdatedAt(currency: CurrencyCode): string { return exchangeRates.find((rate) => rate.currency === currency)?.updatedAt || "2026-08-28"; }

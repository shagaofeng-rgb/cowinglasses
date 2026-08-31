import type { ExchangeRate } from "@/types/commerce";

export const exchangeRates: ExchangeRate[] = [
  // Daily local fixture refreshed from the latest ECB-derived reference data
  // available through Frankfurter. AED uses the long-standing USD peg value.
  { currency: "USD", rate: 1, updatedAt: "2026-08-28" },
  { currency: "EUR", rate: 0.85889, updatedAt: "2026-08-28" },
  { currency: "GBP", rate: 0.73624, updatedAt: "2026-08-28" },
  { currency: "JPY", rate: 159.68, updatedAt: "2026-08-28" },
  { currency: "KRW", rate: 1374.55, updatedAt: "2026-08-28" },
  { currency: "AED", rate: 3.6725, updatedAt: "2026-08-28" },
];

import type { CurrencyCode } from "@/types/commerce";

export const currencies: CurrencyCode[] = ["USD", "EUR", "GBP", "JPY", "KRW", "AED"];
export const currencyLocales: Record<CurrencyCode, string> = {
  USD: "en-US", EUR: "de-DE", GBP: "en-GB", JPY: "ja-JP", KRW: "ko-KR", AED: "ar-AE",
};

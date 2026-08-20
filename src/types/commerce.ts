export type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "KRW" | "AED";

export interface ExchangeRate { currency: CurrencyCode; rate: number; updatedAt: string; }
export interface ShippingRule { region: string; countries: string[]; usdFee: number; estimatedDays: string; excluded?: boolean; }
export interface CartLine { productId: string; skuId: string; quantity: number; }

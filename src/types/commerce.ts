export type CurrencyCode = "USD" | "EUR" | "GBP" | "JPY" | "KRW" | "AED";

export interface ExchangeRate { currency: CurrencyCode; rate: number; updatedAt: string; }
export interface ShippingRule { region: string; countries: string[]; usdFee: number; estimatedDays: string; excluded?: boolean; }
export interface CartLine { productId: string; skuId: string; quantity: number; }

export type ShippingDestinationId = string;

export type ShippingQuoteStatus = "quoted" | "unavailable";

export interface ShippingQuote {
  destinationId: ShippingDestinationId;
  destinationLabel: string;
  status: ShippingQuoteStatus;
  itemCount: number;
  actualWeightKg: number;
  chargeableWeightKg: number;
  transportCny: number;
  carrierFeeCny: number;
  handlingAdjustmentCny: number;
  totalCny: number;
  totalUsd: number;
  billingIncrementKg: number;
  volumetricDivisor?: number;
  note: string;
}

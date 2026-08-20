import type { ShippingRule } from "@/types/commerce";

export const shippingRules: ShippingRule[] = [
  { region: "United States", countries: ["US"], usdFee: 12, estimatedDays: "5-8 business days" },
  { region: "Europe", countries: ["DE", "ES", "PT", "FR", "IT", "GB"], usdFee: 18, estimatedDays: "6-10 business days" },
  { region: "Asia Pacific", countries: ["JP", "KR", "AU", "SG"], usdFee: 20, estimatedDays: "6-12 business days" },
  { region: "Rest of world", countries: ["*"], usdFee: 28, estimatedDays: "8-15 business days" },
  { region: "Brazil", countries: ["BR"], usdFee: 0, estimatedDays: "Unavailable", excluded: true },
];

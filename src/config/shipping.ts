import type {
  ShippingDestinationId,
  ShippingQuote,
  ShippingQuoteStatus,
} from "@/types/commerce";

export const productShippingWeightKg = 0.5;
export const shippingHandlingAdjustmentCny = 50;
export const shippingCnyPerUsd = 7.2;

type DestinationRate = {
  id: ShippingDestinationId;
  label: string;
  billingIncrementKg: number;
  firstWeightCny?: number;
  additionalWeightCny?: number;
  perKgCny?: number;
  carrierFeeCny?: number;
  volumetricDivisor?: number;
  status?: ShippingQuoteStatus;
  note: string;
};

/**
 * Local logistics fixture supplied by the carrier. Replace this adapter with a
 * carrier-rate API when product dimensions, routes, and service levels are live.
 */
export const shippingDestinations: readonly DestinationRate[] = [
  { id: "malaysia_west", label: "Malaysia — West Malaysia", billingIncrementKg: 0.5, firstWeightCny: 43, additionalWeightCny: 23, note: "Sensitive goods service; billed in 0.5 kg increments." },
  { id: "malaysia_east", label: "Malaysia — East Malaysia", billingIncrementKg: 0.5, firstWeightCny: 65, additionalWeightCny: 35, note: "Sensitive goods service; billed in 0.5 kg increments." },
  { id: "singapore", label: "Singapore", billingIncrementKg: 0.5, firstWeightCny: 58, additionalWeightCny: 28, note: "Sensitive goods service; billed in 0.5 kg increments." },
  { id: "thailand", label: "Thailand", billingIncrementKg: 0.5, firstWeightCny: 40, additionalWeightCny: 18, volumetricDivisor: 6000, note: "Sensitive goods service; billed in 0.5 kg increments." },
  { id: "vietnam", label: "Vietnam", billingIncrementKg: 1, firstWeightCny: 44, additionalWeightCny: 35, volumetricDivisor: 6000, note: "Sensitive goods service; billed in 1 kg increments." },
  { id: "taiwan", label: "Taiwan", billingIncrementKg: 0.5, firstWeightCny: 23, additionalWeightCny: 15, note: "0.5 kg is ¥23; 1 kg is ¥38 before the handling adjustment." },
  { id: "australia", label: "Australia", billingIncrementKg: 0.5, firstWeightCny: 70, additionalWeightCny: 35, volumetricDivisor: 6000, note: "Sensitive goods service; billed in 0.5 kg increments." },
  { id: "philippines", label: "Philippines", billingIncrementKg: 1, firstWeightCny: 53, additionalWeightCny: 53, carrierFeeCny: 36, volumetricDivisor: 6000, note: "Sensitive goods service with a per-shipment delivery fee; billed in 1 kg increments." },
  { id: "indonesia", label: "Indonesia", billingIncrementKg: 1, firstWeightCny: 141, additionalWeightCny: 102, carrierFeeCny: 36, volumetricDivisor: 6000, note: "Sensitive goods service with a per-shipment delivery fee; billed in 1 kg increments." },
  { id: "united_states", label: "United States", billingIncrementKg: 0.5, perKgCny: 150, carrierFeeCny: 28, volumetricDivisor: 6000, note: "Sensitive goods service, charged by actual weight at ¥150/kg plus a per-shipment operation fee." },
  { id: "brazil", label: "Brazil — unavailable", billingIncrementKg: 0.5, status: "unavailable", note: "We are unable to ship to Brazil at this time." },
] as const;

export function getShippingDestination(id: string | null | undefined) {
  return shippingDestinations.find((destination) => destination.id === id);
}

export function quoteShipping(destinationId: ShippingDestinationId, itemCount: number): ShippingQuote {
  const destination = getShippingDestination(destinationId);
  if (!destination) throw new Error("Unsupported shipping destination.");

  const safeItemCount = Math.max(1, Math.floor(itemCount));
  const actualWeightKg = safeItemCount * productShippingWeightKg;
  const status = destination.status ?? "quoted";
  const carrierFeeCny = destination.carrierFeeCny ?? 0;

  if (status === "unavailable") {
    return {
      destinationId,
      destinationLabel: destination.label,
      status,
      itemCount: safeItemCount,
      actualWeightKg,
      chargeableWeightKg: actualWeightKg,
      transportCny: 0,
      carrierFeeCny: 0,
      handlingAdjustmentCny: 0,
      totalCny: 0,
      totalUsd: 0,
      billingIncrementKg: destination.billingIncrementKg,
      volumetricDivisor: destination.volumetricDivisor,
      note: destination.note,
    };
  }

  const chargeableWeightKg = destination.perKgCny
    ? actualWeightKg
    : Math.ceil(actualWeightKg / destination.billingIncrementKg) * destination.billingIncrementKg;
  const transportCny = destination.perKgCny
    ? actualWeightKg * destination.perKgCny
    : (destination.firstWeightCny ?? 0) + Math.max(0, Math.round(chargeableWeightKg / destination.billingIncrementKg) - 1) * (destination.additionalWeightCny ?? 0);
  const totalCny = transportCny + carrierFeeCny + shippingHandlingAdjustmentCny;

  return {
    destinationId,
    destinationLabel: destination.label,
    status,
    itemCount: safeItemCount,
    actualWeightKg,
    chargeableWeightKg,
    transportCny,
    carrierFeeCny,
    handlingAdjustmentCny: shippingHandlingAdjustmentCny,
    totalCny,
    totalUsd: totalCny / shippingCnyPerUsd,
    billingIncrementKg: destination.billingIncrementKg,
    volumetricDivisor: destination.volumetricDivisor,
    note: destination.note,
  };
}

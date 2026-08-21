export type ShippingMethod = {
  id: "standard_ocean_air_quote" | "factory_pickup_forwarder";
  label: string;
  description: string;
  pricing: "destination-quote" | "buyer-forwarder";
};

/**
 * Product-independent shipping choices. Country rates should be supplied by a
 * ShippingRateProvider before a live checkout calculates or charges shipping.
 */
export const shippingMethods: readonly ShippingMethod[] = [
  {
    id: "standard_ocean_air_quote",
    label: "Standard sea / air freight quotation",
    description: "Final logistics cost is confirmed by destination, quantity and packaging.",
    pricing: "destination-quote",
  },
  {
    id: "factory_pickup_forwarder",
    label: "Buyer forwarder pickup",
    description: "Use your own forwarder for factory pickup or export handoff.",
    pricing: "buyer-forwarder",
  },
] as const;

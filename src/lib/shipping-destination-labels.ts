import "server-only";
import { getShippingDestinationCountryCode, shippingDestinations } from "@/config/shipping";
import type { Locale } from "@/lib/i18n";

// Render the same region names on the server and in the browser, regardless of ICU version.
export function shippingDestinationLabels(locale: Locale): Record<string, string> {
  const names = new Intl.DisplayNames([locale], { type: "region" });
  return Object.fromEntries(shippingDestinations.map(({ id, label }) => {
    const name = names.of(getShippingDestinationCountryCode(id)) ?? label;
    if (id === "malaysia_west") return [id, `${name} — West Malaysia`];
    if (id === "malaysia_east") return [id, `${name} — East Malaysia`];
    return [id, name];
  }));
}

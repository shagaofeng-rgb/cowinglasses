"use client";

type MetaPixelEvent =
  | "ViewContent"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase";

type MetaPixelParameters = Record<string, unknown>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackMetaPixel(
  event: MetaPixelEvent,
  parameters: MetaPixelParameters = {},
  dedupeKey?: string,
) {
  if (typeof window === "undefined") return;
  if (dedupeKey && window.sessionStorage.getItem(dedupeKey)) return;
  if (typeof window.fbq !== "function") return;

  window.fbq("track", event, parameters);
  if (dedupeKey) window.sessionStorage.setItem(dedupeKey, "1");
}

/** GSC 2026-11-01: these old paths have the same content under /en.
 * Keep an explicit list: arbitrary missing URLs must still return 404.
 */
export const legacyStorefrontRedirects = [
  "/support/warranty", "/policies/intellectual-property", "/compare",
  "/policies/terms", "/shop", "/app", "/support/shipping-delivery",
  "/support/contact", "/how-it-works", "/support/returns-refunds",
].map((source) => ({ source, destination: `/en${source}`, permanent: true }));

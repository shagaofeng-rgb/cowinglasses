/** Public, evergreen routes that are meaningful search destinations. */
export const indexableStorefrontPaths = [
  "", "/shop", "/compare", "/how-it-works", "/app", "/lens-guide", "/support", "/support/faq",
  "/support/contact", "/support/shipping-delivery", "/support/returns-refunds", "/support/warranty",
  "/news", "/blog", "/policies/privacy", "/policies/terms", "/policies/intellectual-property",
  "/collections/create", "/collections/explore", "/collections/everyday", "/collections/music-movement",
  "/collections/photochromic-sun", "/collections/prescription-ready",
] as const;

/** Personal, transactional and diagnostic screens must never enter a sitemap. */
export const noIndexStorefrontPaths = new Set(["cart", "checkout", "account", "search", "payment-test"]);

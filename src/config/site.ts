export const siteConfig = {
  name: "CoWin Glasses",
  description: "Smart eyewear for music, moments, and movement.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://cowinglasses.com",
  defaultLocale: "en" as const,
  contentUpdatedAt: process.env.SITE_CONTENT_UPDATED_AT || "2026-09-08T00:00:00.000Z",
};

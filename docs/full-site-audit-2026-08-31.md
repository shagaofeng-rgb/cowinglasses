# CoWin Glasses full-site audit — 2026-08-31

## Scope

Frontend routes, responsive UI, six locales and Arabic RTL, images, accessibility basics, SEO metadata, cart/checkout, shipping, customer accounts, orders, Oceanpayment notification handling, database migrations, News automation, security headers, production build and deployment verification.

## Automated gates

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test` (News logic plus all dedicated shipping destinations)
- `pnpm build`
- 167-route HTTP crawl and all sitemap URLs
- Mobile browser matrix for `en`, `ar`, `es`, `pt`, `ja`, `ko`
- Production-domain header, canonical, redirect, image and critical-flow checks

## Material corrections

- Added secure customer accounts and cross-browser order history with hashed passwords, lockout and `HttpOnly` sessions.
- Prevented account claiming from exposing orders created before account activation.
- Localized checkout, account, FAQ and policy content; fixed document language and Arabic RTL at runtime.
- Reduced the mobile analytics prompt and delayed Meta Pixel until explicit consent.
- Added canonical/hreflang metadata to locale home pages.
- Added CSP and standard browser security headers.
- Restricted payment return URLs to owned domains and the exact active Vercel deployment.
- Made Oceanpayment webhook retries recoverable when an order/payment record is temporarily unavailable.
- Released inventory after verified failed card payments and delayed coupon usage counting until verified payment success.
- Removed an obsolete duplicate shipping fixture; checkout and policy tables now use the same authoritative local carrier adapter.
- Refreshed the dated FX fixture from the latest available ECB-derived reference set and retained a visible update date.

## Payment safety

Browser return pages never mark an order paid. Only a correctly signed server-to-server Oceanpayment notification can change payment status. Test automation must use bank transfer or provider sandbox credentials and must never submit a real card without separate approval.

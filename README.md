# CoWin Glasses storefront

An internationalized Next.js App Router storefront and operations console for CoWin Glasses. The storefront, order requests, catalog, customer records, inventory and first-party analytics use Neon PostgreSQL through server-only routes. Card collection remains disabled until the payment provider supplies production credentials.

## Stack

- Next.js App Router, TypeScript strict mode and Tailwind CSS
- `next/image`, dynamic metadata, locale routes, sitemap, robots, loading UI and error boundary
- English, Arabic RTL, Spanish, Portuguese, Japanese and Korean demo content
- Local product, shipping and daily exchange-rate fixtures behind replaceable repository/provider boundaries
- React Context + localStorage cart persistence

## Requirements

- Node.js 20.9+ (Node 22 LTS recommended)
- npm 10+ or pnpm 9+

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The root redirects to `/en`.

```bash
npm run lint
npm run typecheck
npm run build
npm run start
```

The workspace currently includes `pnpm-lock.yaml` because the project was verified with pnpm. The npm scripts are intentionally standard and run unchanged when the repository is installed with npm.

## Environment variables

Copy `.env.example` to `.env.local`. Never commit `.env.local`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical base URL used by metadata, sitemap and Product JSON-LD. |
| `NEXT_PUBLIC_IOS_APP_URL` | Future official iOS listing URL. Empty keeps the demo link inactive. |
| `NEXT_PUBLIC_ANDROID_APP_URL` | Future official Android listing URL. Empty keeps the demo link inactive. |
| `DATABASE_URL` | Server-only Neon PostgreSQL connection string. Never use a `NEXT_PUBLIC_` prefix. |
| `AUTH_SECRET` | Required server secret for administrator sessions and the fallback traffic-IP encryption key. |
| `ANALYTICS_VISITOR_SECRET` | Optional separate HMAC key for anonymous first-party visitor IDs. |
| `ANALYTICS_IP_ENCRYPTION_KEY` | Optional 64-character hexadecimal encryption key for raw IP retention. |
| `CRON_SECRET` | Required only when a scheduler is configured to call `/api/cron/traffic-rollups`. |

## First-party traffic analytics

The storefront records page views, product views, add-to-cart, checkout and order-request events. The `/admin/analytics` area provides source attribution, country, device, visit count and path reporting. Anonymous visitors are identified with a first-party random cookie; they become linked to a customer only after a supported customer interaction such as an order request.

- Raw IP is AES-256-GCM encrypted, retained for 30 days and available only to super administrators. Routine lists display a masked IP.
- `traffic_daily_rollups` is reserved for scheduled aggregates. The live dashboard uses a 60-second server data cache and always retains raw event detail for the selected range.
- To enable the optional aggregate job, have a trusted scheduler make an authenticated `GET /api/cron/traffic-rollups` request with `Authorization: Bearer $CRON_SECRET`.

## Data and asset replacement

| What to replace | Current source | Future replacement |
| --- | --- | --- |
| Products, series, SKU colors, localized copy | `src/data/fixtures/products.ts` | API/CMS implementation of `ProductRepository` in `src/data/repositories/products.ts` |
| Hero/product imagery | `public/images/demo/` plus `heroImage` / SKU `images` fields | Approved assets under `public/images/products/` or a configured image CDN |
| Product videos/manuals | `public/videos/`, `public/manuals/` | Real assets and video URLs, then SKU/product fields |
| Daily FX | `src/data/fixtures/exchange-rates.ts` | Server-only `ExchangeRateProvider`; expose timestamp and source status honestly |
| Shipping rules | `src/data/fixtures/shipping-rules.ts` | Country/carrier shipping API or back-office service |
| FAQ/policy copy | `src/components/commerce/route-page.tsx` and messages | CMS/legal-approved content model |

All present product values are explicitly demo data. Fields such as camera resolution, storage, battery and certification must remain `To be confirmed` until approved source documents are supplied.

## Add a language

1. Add the locale code and metadata to `src/types/localization.ts`.
2. Add a complete dictionary object in `src/messages/index.ts`.
3. Add translated product fields to fixture/API content. `localize()` automatically falls back to English when a field is missing.
4. The locale static parameters, sitemap and language selector read from the locale list, so no additional route work is required.
5. For RTL languages, mark `direction: "rtl"`. The store shell uses `dir`, logical layout direction and language metadata.

## GitHub

```bash
git add .
git commit -m "feat: add CoWin Glasses storefront"
git branch -M main
git remote add origin https://github.com/YOUR_ORG/cowin-glasses.git
git push -u origin main
```

Create the GitHub repository first and replace `YOUR_ORG` with its owner. Do not add environment secrets to the repository.

## Vercel deployment

1. Import the GitHub repository in Vercel.
2. Framework preset: Next.js.
3. Set Node.js to 20+ in Vercel project settings.
4. Add the variables from `.env.example` in Preview and Production as appropriate.
5. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain.
6. Deploy, then verify `/en`, `/ar`, product pages, `/cart`, `/checkout`, `/sitemap.xml` and `/robots.txt`.

## Backend integration checklist

Implement these adapters or API contracts without changing page-level commerce UI:

- `ProductRepository`: catalog, collections, localized descriptions, SKU media and availability
- `ExchangeRateProvider`: daily FX, source, timestamp and USD conversion
- `ShippingRateProvider`: country eligibility, Brazil exclusion, carrier services and taxes notice
- `Cart/Order API`: validated line items, USD authoritative price and server-side stock checks
- `QianhaiPaymentProvider`: create payment session, webhook verification, refund status. Never process card data in the frontend.
- `SupportRequestProvider`: contact intake, SLA routing and email/CRM notification
- `WarrantyClaimProvider`: claim submission, media upload and case tracking
- `NewsletterProvider`: consent-aware email subscription
- `AuthProvider`: account, order history and secure session handling
- CMS policy/content API: legally approved privacy, terms, shipping, returns, warranty and FAQ content

Before enabling checkout, implement server-side price verification, country-based shipping, payment webhooks, order records, transactional email, privacy retention rules, tax logic, abuse protection and audit logging.

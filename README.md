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
| `CRON_SECRET` | Required in production for authenticated traffic and News Cron routes. |
| `NEWS_AUTOMATION_PUBLISH_MODE` | `auto` publishes verified content; `review` creates six-language drafts for approval. |
| `NEWS_AUTOMATION_CONTENT_MODEL` | OpenAI or Vercel AI Gateway model identifier used by the News composer. |
| `OPENAI_API_KEY` / `AI_GATEWAY_API_KEY` | Optional model credentials. Vercel deployments can instead use the automatically issued OIDC token. |
| `INDEXNOW_KEY` | Optional server-only key for notifying Bing/IndexNow after a verified publication. |

## First-party traffic analytics

The storefront records page views, product views, add-to-cart, checkout and order-request events. The `/admin/analytics` area provides source attribution, country, device, visit count and path reporting. Anonymous visitors are identified with a first-party random cookie; they become linked to a customer only after a supported customer interaction such as an order request.

- Raw IP is AES-256-GCM encrypted, retained for 30 days and available only to super administrators. Routine lists display a masked IP.
- `traffic_daily_rollups` is reserved for scheduled aggregates. The live dashboard uses a 60-second server data cache and always retains raw event detail for the selected range.
- To enable the optional aggregate job, have a trusted scheduler make an authenticated `GET /api/cron/traffic-rollups` request with `Authorization: Bearer $CRON_SECRET`.

## News automation, SEO and GEO

The News pipeline deliberately separates discovery from publication:

- `/api/cron/news-ingest` runs every 12 hours and only collects, normalizes, deduplicates and scores allowlisted RSS/Atom items.
- `/api/cron/news-publish` checks every 12 hours but the database guard permits at most one publication per 48 hours.
- `/api/cron/news-source-health` checks source availability daily and temporarily disables repeatedly failing feeds.
- A PostgreSQL lock and unique URL/content fingerprints make retries idempotent across concurrent Vercel Functions.
- English is the verified fact master. Arabic, Spanish, Portuguese, Japanese and Korean are generated only after the English draft passes the editorial gate.
- No qualified candidate means no article. The pipeline never fabricates a fallback story or product specifications.

Published News includes visible source attribution, an editorial disclaimer, `NewsArticle` and breadcrumb JSON-LD, canonical/hreflang metadata, `/news-sitemap.xml`, `/news/rss.xml`, and optional IndexNow notification. Google News Sitemap entries are limited to the latest two days; the ordinary sitemap retains all published locale URLs.

Use `/admin/news-operations` to pause automation, switch between automatic and review modes, run ingestion or a dry run, inspect candidate scores, source health, delivery checks and run history. `/admin/news` remains the manual article editor; Blog content is never read or modified by News automation.

Before the first production release run:

```bash
pnpm db:bootstrap
pnpm news:self-test
```

The self-test creates uniquely marked draft/source rows, verifies their relationships, and removes them in a `finally` block. It never publishes the test article.

## Data and asset replacement

| What to replace | Current source | Future replacement |
| --- | --- | --- |
| Products, series, SKU colors, localized copy | `src/data/fixtures/products.ts` | API/CMS implementation of `ProductRepository` in `src/data/repositories/products.ts` |
| Hero/product imagery | `public/images/demo/` plus `heroImage` / SKU `images` fields | Approved assets under `public/images/products/` or a configured image CDN |
| Product videos/manuals | `public/videos/`, `public/manuals/` | Real assets and video URLs, then SKU/product fields |
| Daily FX | `src/data/fixtures/exchange-rates.ts` | Server-only `ExchangeRateProvider`; expose timestamp and source status honestly |
| Shipping rules | `src/config/shipping.ts` | Country/carrier shipping API or back-office service |
| FAQ/policy copy | `src/components/compliance/policy-content.tsx`, `src/components/commerce/route-page.tsx` and messages | CMS/legal-approved content model |

Published database/catalog records are shown as live products. Fixture-only records remain marked as demo. Fields such as camera resolution, storage, battery and certification must remain `To be confirmed` until approved source documents are supplied.

## Customer accounts and order history

Checkout requires a member password of at least 10 characters. A successful order creation also creates (or authenticates) a customer account and stores only a bcrypt password hash. The server issues a 30-day `HttpOnly`, `Secure`, `SameSite=Lax` session cookie; `/[locale]/account` can therefore show the same order history after signing in from another browser.

For account-takeover protection, a legacy customer record that has orders but no account can create an account during a new checkout, but orders created before account activation are not exposed automatically. Support must verify and link historical orders separately. Five failed sign-in attempts lock the account for 15 minutes. Customer sessions and credentials live in `customer_accounts` and `customer_sessions`, created by `drizzle/0006_customer_accounts.sql`.

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

### Oceanpayment embedded card checkout

The storefront uses Oceanpayment's embedded credit-card SDK only after the server has created an order from server-side prices and shipping. `OCEANPAYMENT_CARD_SECURE_CODE` is used only on the server to create and validate SHA-256 signatures; it is never bundled into the browser. Configure the following values in Vercel Production: `OCEANPAYMENT_ACCOUNT`, `OCEANPAYMENT_CARD_TERMINAL`, `OCEANPAYMENT_CARD_SECURE_CODE`, `OCEANPAYMENT_CARD_PUBLIC_KEY`, `OCEANPAYMENT_ENV=production` and `OCEANPAYMENT_NOTICE_URL=https://cowinglasses.com/api/webhooks/oceanpayment`.

Set the same `noticeUrl` in the Oceanpayment merchant console. The notification endpoint expects the documented signed XML and responds with `receive-ok`; only a verified server-to-server notification with `payment_status=1` updates an order to paid. Preview environments must use Oceanpayment sandbox credentials. Do not send a real card transaction merely to verify deployment.

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
- Replace the built-in password/session account service with a managed identity provider only if email verification, password reset, MFA or social login is required; preserve the order-ownership boundary.
- CMS policy/content API: legally approved privacy, terms, shipping, returns, warranty and FAQ content

Server-side price verification, country-based shipping, order records, signed payment webhooks, secure member sessions and audit/event records are implemented. Before expanding checkout, add transactional email, password reset/email verification, formal privacy retention jobs, destination tax calculation, durable rate limiting and refund-provider automation.

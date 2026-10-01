# Scheduled publishing and Google submissions

Updated 2026-10-01.

- News ingestion, AI writing/translation, automatic publication and source-health fetching are disabled. Their Vercel cron entries are removed. `newsAutomationConfig.enabled` is false and blocks both cron and manual pipeline invocations before external requests or database writes. Existing articles remain available.
- Third-party Blog publishing and its integrations are unchanged.
- Google Search Console sitemap submission is scheduled every Monday at 09:00 Asia/Shanghai (01:00 UTC), using `/api/cron/google-search-console`.
- The daily traffic rollup remains unchanged.

## Google prerequisites

Production must have `CRON_SECRET` and `GOOGLE_SEARCH_CONSOLE_SERVICE_ACCOUNT_JSON`. The service account must have access to `sc-domain:cowinglasses.com`. Credentials belong only in Vercel secrets. The repository contains no service-account key.

The weekly endpoint requires the cron bearer token. It returns 503 if credentials are missing, 502 if submission fails, and 200 only after Google accepts the sitemap. Acceptance does not guarantee indexing. The existing `pnpm search-console:submit` command uses the same implementation.

At the time of this change, production had `CRON_SECRET` but no Google service-account JSON configured; schedule activation alone cannot complete submissions until that credential is supplied.

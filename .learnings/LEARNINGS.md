# Project learnings

Standalone `tsx` maintenance scripts in this repository must use an explicit asynchronous `main()` instead of top-level `await`.

Vercel Marketplace database variables may appear with empty values in `vercel env pull`; run scoped maintenance in the Vercel runtime instead of attempting to expose managed secrets locally.

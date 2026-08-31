## [ERR-20260831-001] tsx-cjs-top-level-await

**Logged**: 2026-08-31T13:50:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: tests

### Summary
The marked commerce cleanup utility failed before database access because local `tsx` compiled the standalone script as CommonJS and rejected top-level `await`.

### Error
```text
Top-level await is currently not supported with the "cjs" output format
```

### Context
- Task attempted: remove an authorised, uniquely marked Preview test order and account.
- Command/tool/API: `pnpm commerce:test-cleanup TEST-AUDIT-20260831-0549`
- Environment: Node 24, tsx, package without `"type": "module"`.

### Suspected Cause
The utility used top-level `await` while the repository's standalone scripts are transpiled to CommonJS.

### Suggested Fix
Wrap asynchronous script work in `async function main()` and finish with `main().catch(...)`.

### Metadata
- Reproducible: yes
- Related files: `scripts/cleanup-test-commerce-data.ts`
- Tags: tsx, commonjs, cleanup, test-data

## [ERR-20260831-002] marketplace-env-pull-redaction

**Logged**: 2026-08-31T13:52:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: infra

### Summary
Vercel Preview environment pull included Neon variable names but intentionally returned empty values, so a local cleanup process could not connect.

### Error
```text
Error: DATABASE_URL is required.
```

### Context
- Task attempted: clean the uniquely marked Preview order after end-to-end verification.
- Command/tool/API: `vercel env pull` followed by the cleanup utility.
- Environment: Vercel Marketplace Neon integration.

### Suspected Cause
Marketplace-managed secrets are available during Vercel builds/functions but are redacted as empty strings from local environment pulls.

### Suggested Fix
Run narrowly scoped maintenance inside an authenticated Vercel runtime/build, never print or copy the managed credential, and remove one-off execution wiring before production.

### Metadata
- Reproducible: yes
- Related files: `scripts/cleanup-test-commerce-data.ts`
- Tags: vercel, neon, marketplace, secrets, cleanup

## [ERR-20260831-003] desktop-shell-node-path

**Logged**: 2026-08-31T14:10:00+08:00
**Priority**: low
**Status**: resolved
**Area**: tooling

### Summary
The release gate initially stopped because the desktop shell could find `pnpm` but the package scripts could not find `node`.

### Error
```text
node_modules/.bin/eslint: line 41: exec: node: not found
```

### Context
- Task attempted: run lint, type checking, tests, and the production build.
- Environment: Codex desktop shell.

### Suspected Cause
The bundled Node runtime directory was not present in the inherited shell `PATH`.

### Suggested Fix
Load the workspace dependencies and prepend the bundled Node and fallback binary directories before running package scripts.

### Metadata
- Reproducible: environment-dependent
- Related files: `package.json`
- Tags: node, path, desktop-runtime, release-gate

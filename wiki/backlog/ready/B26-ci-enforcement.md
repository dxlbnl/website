---
id: B26
title: Add CI enforcement — tests and typecheck before deploy
type: chore
priority: high
created: 2026-05-21
---

## Description

There is no CI gate. Tests and type checking never run automatically before a Vercel deploy — a broken build only surfaces after it's live.

Add a GitHub Actions workflow (`.github/workflows/ci.yml`) that runs `pnpm check && pnpm test` on every push and PR. Alternatively (or in addition), set `buildCommand` in `vercel.json` to `pnpm test && pnpm build` so Vercel itself blocks deploys on test failure.

Also add a standalone `typecheck` script to `package.json` for use in CI:
```json
"typecheck": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json"
```

## Notes

- `vercel.json` currently only configures image optimization — no `buildCommand`
- No `.github/` directory exists yet
- `pnpm test` runs Vitest in CI mode (already configured in `package.json`)

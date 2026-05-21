---
id: B16
title: Guard against missing VISITOR_HASH_SALT in production
type: bug
priority: medium
created: 2026-05-21
---

## Description

`src/hooks.server.ts:43` falls back to the hardcoded string `'dxlb-default-salt'` when `VISITOR_HASH_SALT` is not set. In production this silently disables the privacy rotation mechanism — all visitor hashes become deterministic and predictable, defeating the salt entirely.

The fallback should not exist in production. Either throw a startup error if the env var is missing, or at minimum log a loud warning. The current silent fallback gives false confidence that privacy is working.

Drop the fallback entirely. we can set it locally, no worries.

## Notes

- `src/hooks.server.ts:43`: `const salt = VISITOR_HASH_SALT || 'dxlb-default-salt';`
- `VISITOR_HASH_SALT` comes from `$env/static/private` — if it's missing Vite will throw at build time, so the real risk is a misconfigured production env. Add a runtime guard anyway.

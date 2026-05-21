---
id: B27
title: Remove demo.spec.ts placeholder and tidy test scripts
type: chore
priority: low
created: 2026-05-21
---

## Description

`src/demo.spec.ts` is a Vitest scaffold leftover containing a trivial `1 + 2 = 3` test. It pollutes test output and misleads anyone auditing test coverage.

Delete the file. While here, add a `test:coverage` script to `package.json`:
```json
"test:coverage": "vitest run --coverage"
```

## Notes

- `src/demo.spec.ts` — 8 lines, no relation to the codebase
- `oxlint` is also in devDependencies but not wired into any script — either integrate it into `lint` or remove it

---
id: B22
title: Delete /static/Logo-research/ directory
type: chore
priority: high
created: 2026-05-21
---

## Description

`/static/Logo-research/` contains ~18 MB of raw research images (large JPEGs and PNGs from logo exploration work). This directory is in the web root and gets deployed to Vercel on every build — it's serving as accidental CDN for unoptimized research files.

Delete the directory. Add `static/Logo-research/` (or a broader `static/research/`) to `.gitignore` to prevent future research assets from landing in the web root.

## Notes

- 18 MB of files, multiple 2.5–2.7 MB JPEGs and up to 483 KB PNGs
- `git rm -r static/Logo-research/` then add to `.gitignore`

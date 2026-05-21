---
id: B11
title: Analytics dashboard — best practices for data visualization
type: research
priority: high
flags: []
created: 2026-05-21
report: wiki/research/analytics-dashboard-best-practices.md
---

## Description

The current `/admin/analytics/` page shows a flat count-per-path table and an email opens table. Before redesigning it, research what a well-designed small-site analytics dashboard should actually show: what data shapes are most actionable, whether sparklines/bar charts over time beat raw counts, how to handle the tiered URL hierarchy (`/` vs `/notes` vs `/notes/:slug`), and how to surface noise (bot paths like `/wp-admin`, 404s, redirect candidates) usefully rather than just filtering it out.

Given the constraints — only `path`, `referrer`, `visitedAt` stored per pageview, no user agent, no IP, no charting library installed — the research should answer: what is worth building with this data, and what charting/display approach fits a terminal-aesthetic admin panel best?

## Notes

- Current schema: `pageviews(id, path, referrer, visitedAt)` — no user agent, no IP
- No charting library in the project yet; adding one is on the table
- Site URL hierarchy: `/` → `/notes`, `/catalogue`, `/projects` → `/notes/[slug]`, `/catalogue/[id]`, `/projects/[slug]`
- Known noise: `/wp-admin`, `/blog`, `/wordpress` bot probes — these could be redirect candidates or just filtered
- Dexter mentioned: time-series graph over time > raw counts; tiered hierarchy view; redirect analysis for 404-prone paths

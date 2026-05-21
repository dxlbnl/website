---
id: B13
title: Analytics dashboard redesign
type: feature
priority: medium
flags: []
created: 2026-05-21
---

## Description

Redesign the `/admin/analytics` page using the B11 research findings and the richer data landed in B12. Replace the flat pageview count list with a 30-day time-series bar chart (hand-rolled SVG sparkline), hierarchical URL grouping (/ > /notes > /notes/:slug), unique visitor and session counts, device/OS/browser breakdowns, and a separate probe-traffic section for bot/wp-admin hits. Depends on B12 (schema) being merged first.

## Notes

- Research findings: `wiki/research/analytics-dashboard-best-practices.md`
- Schema additions: `sessionId`, `visitorHash`, `country`, `city`, `deviceType`, `os`, `browser` (landed in B12)
- Time-series: group `visitedAt` by day, last 30 days, bar chart per path section or total
- URL grouping: bucket by first path segment, collapsible child paths
- Bot/probe traffic: paths matching `/wp-`, `/blog`, `/.env`, etc. — filter from main view, show in collapsed section
- Hand-rolled SVG sparkline preferred (~25-35 lines Svelte, no charting library)
- Blocked until B12 is done

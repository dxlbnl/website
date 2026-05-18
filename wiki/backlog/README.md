# Backlog

The backlog is a directory of **per-item files** arranged in four lanes. Lane = the
subdirectory the item file lives in. Items move from `inbox/` → `ready/` → `doing/` →
`done/` via `git mv` (which preserves history).

## Lanes

| Lane | Meaning |
|---|---|
| `inbox/` | Captured but not yet scoped. New items land here. |
| `ready/` | Has the artifact its track needs to start work (spec for features/bugs; clear question for research; clear ask for chores). The manager pulls from here. |
| `doing/` | Currently being worked. The manager moves at most one item here at a time. |
| `done/` | Reviewer passed and the full test suite is green (one commit made). |

## Item card format

One file per item: `wiki/backlog/<lane>/B<n>-<slug>.md`.

```markdown
---
id: B3
title: User login
type: feature           # feature | bug | research | chore
priority: high          # high | medium | low
flags: [review]         # optional list; review = pause for approval, blocked = stuck
created: 2026-05-14
spec: wiki/specs/B3-user-login.md   # populated once the spec page exists
---

## Description
<one paragraph in the user's voice — the "why" and rough "what">

## Notes
<links, gotchas, history — agents append here as work progresses>
```

For non-feature items, replace `spec:` with the artifact path the track produces (e.g.
`report: wiki/research/<topic>.md`).

## Tracks (the manager dispatches on `type:`)

| Type | Track |
|---|---|
| `feature` | `spec-writer` → `test-writer` → `implementer` → `reviewer` |
| `bug` | same as `feature`, plus `test-writer` MUST add a regression test for the reported failure; `reviewer` confirms it |
| `research` | `researcher` specialist → `wiki/research/<topic>.md` → `reviewer` confirms findings answer the question |
| `chore` | `implementer` → `reviewer` (no spec, no tests-first) — dep bumps, doc reorgs, infra |

New project-specific types: declare in `wiki/decisions.md` and extend the manager skill.
Unknown type: manager asks the user.

## Conventions

- **Filing new work** — run `/intake "<title>"`. It writes the item into `inbox/`. The
  manager ranks/triages later. Never inline-patch a mid-run report — file it.
- **Moving an item** — use `git mv wiki/backlog/<from>/<file> wiki/backlog/<to>/`. Don't
  copy-and-delete; the rename preserves git history.
- **Flags** —
  - `review` — pause for user approval after the spec/artifact is ready, before work.
    The user sets this; the manager may auto-add it for risky/ambiguous items.
  - `blocked` — work cannot proceed; include a one-line reason in the `## Notes` body.
- **Ordering** — `priority: high` items are pulled first. Within a priority, oldest
  `created:` first.
- **Done** — the manager `git mv`s the item to `done/` after the reviewer passes and the
  full suite is green, then commits the item's files in a single commit referencing the
  id (e.g. `B3: add user login`).

## See also

- `/intake` — file a new item.
- `/status` — show current lane counts, the active item, and the next ready items.
- `wiki/specs/README.md` — the spec page format that pairs with feature/bug items.

---
name: manager
description: Orchestrates Vibin's wiki-driven, spec-driven, test-first build pipeline. The top-level session runs this skill to order the backlog and drive the spec-writer -> test-writer -> implementer -> reviewer pipeline (or the bug / research / chore tracks), one item at a time. Use after /bootstrap, or to resume building the backlog.
disable-model-invocation: false
---

# Manager — orchestrate the build pipeline

Running this skill makes you (the **top-level session**) the **manager**: the
orchestrator of Vibin's build pipeline. You decide what gets built and in what order,
you delegate the actual work to subagents, and you keep the run auditable.

Orchestration runs at the top level **on purpose** — only the top-level session can
spawn subagents, and the manager's whole job is to spawn the pipeline agents via `Task`.
That is why the manager is a skill the top-level session runs, not a subagent.

**You never write product code, tests, or specs yourself** — every such artifact goes
through a delegated subagent (`spec-writer`, `test-writer`, `implementer`, `reviewer`,
or an ad-hoc specialist). Your own writing is limited to wiki bookkeeping
(item cards, `progress.md`, `decisions.md`) and git operations (`git mv` for lane
moves, `git commit` for completed items).

## STEP 0 — read the wiki (mandatory, enforced)

Before anything else, **Read `wiki/INDEX.md`** and the wiki pages it links that are
relevant to the work: `wiki/vision.md`, `wiki/requirements.md`, `wiki/architecture.md`,
`wiki/backlog/README.md`, `wiki/decisions.md`, `wiki/progress.md`, and the item cards
in `wiki/backlog/ready/` + `wiki/backlog/doing/`. The wiki is the single source of truth
and the spec. A `PreToolUse` hook blocks writes, Bash, and agent spawns until you do.
If the wiki changes mid-run, re-read the affected pages before continuing.

## Resuming

This skill is **resumable**. Its durable state is the directory `wiki/backlog/**`
(items, lanes, frontmatter) and `wiki/progress.md` (run journal). On every invocation,
reconstruct where things stand from those — never assume a fresh start. To see state
quickly, run `/status` or `ls wiki/backlog/{inbox,ready,doing,done}/`.

## The initial work plan (review checkpoint #1)

On the first run for a project (`doing/` is empty and `progress.md` has only the
bootstrap note, if anything):

1. **Commit the bootstrap baseline.** `/bootstrap` scaffolds the stack and populates
   the wiki but does not commit. If the working tree has uncommitted changes, stage and
   commit them as the project baseline (e.g. `chore: scaffold <project> (bootstrap)`)
   so feature commits start from a clean tree. Never push.
2. **Build an ordered work plan** from the items currently in `wiki/backlog/inbox/` +
   `wiki/backlog/ready/`. Sort by `priority:` (high first), then by `created:` (oldest
   first). One line per item using this format:

   ```
   B<id> <title>  —  track: <type>  —  approach: <one line>  —  specialists: <none|list>  [review]
   ```

   Example:

   ```
   B1 user login         —  track: feature   —  approach: magic-link, no password store  —  specialists: none
   B2 audit auth surface —  track: research  —  approach: enumerate endpoints, threat-model OAuth  —  specialists: security-auditor
   B3 fix login on Safari—  track: bug       —  approach: reproduce on iOS 17, isolate cookie issue  —  specialists: none  [review]
   ```

3. **Auto-flag** items as `review` (add `flags: [review]` to their frontmatter, via
   `Edit`) if they are risky, ambiguous, or architecturally significant. Items the
   user already flagged stay flagged.
4. **Present the plan to the user and pause for approval.** Do not start building
   until the user approves.

## Triage

If the user reports a bug, new requirement, or change of direction **while you're
working an item**, do not start fixing it inline. Call `/intake "<title>"` to file it
as a new item in `wiki/backlog/inbox/`, tell the user the id + lane it landed in, and
continue the current item. The exception is a trivial typo/comment fix adjacent to the
current item — fold that into the current item's commit. See CLAUDE.md → Triage.

## Tracks (dispatch on the item's `type:`)

| `type:` | Stages |
|---|---|
| `feature` | `spec-writer` → `test-writer` → `implementer` → `reviewer` |
| `bug` | `spec-writer` → `test-writer` (regression test for the reported failure) → `implementer` → `reviewer` (confirms the regression test is present) |
| `research` | `general-purpose` researcher (writes `wiki/research/<topic>.md`) → `reviewer` (confirms findings answer the question, no implementation) |
| `chore` | `implementer` → `reviewer` (no spec page, no tests-first) — dep bumps, doc reorgs, infra |

For unknown types: ask the user before proceeding. To add a project-specific type,
record the decision in `wiki/decisions.md` and extend this table by editing this skill.

## The per-item pipeline

For each item, top of the ordered work plan first:

1. **Move the item card to `doing/`** with `git mv wiki/backlog/ready/<id>-<slug>.md
   wiki/backlog/doing/`. Append a start line to `wiki/progress.md` (via `Edit`):
   `## <YYYY-MM-DD HH:MM> — <id>: <title>` followed by `- manager: start, track: <type>`.
2. **Dispatch by track** (above). Every `Task` prompt MUST name the **exact files** the
   agent should read and write — agents do not share your conversation. Read templates
   below.
3. **Review checkpoint #2** — if the item is flagged `review`: after `spec-writer` (or
   the researcher) produces its artifact, re-read it, present it to the user, and
   pause for approval. Resume on approval. Unflagged items continue without pause.
4. **Retry budget**:
   - `implementer` runs its own 3-attempt loop. If still red, route the failure context
     back for one more attempt (4th total). If still red, **escalate**.
   - `reviewer` rejection loops back to `implementer` once with the review notes
     attached. A second rejection **escalates**.
5. **Done** — when the reviewer passes AND the full test suite is green:
   - `git mv wiki/backlog/doing/<id>-<slug>.md wiki/backlog/done/`.
   - Stage all the item's files (test files, implementation files, the moved card,
     any wiki updates) and commit with `B<id>: <title>` as the subject.
   - Append the outcome + commit hash to `wiki/progress.md`.
   - Pull the next item from `ready/` and loop.

Run **until blocked** — keep pulling items until `ready/` is empty, you hit a review
checkpoint, or you escalate.

## Delegation prompt templates

The exact files matter. Templates for each subagent:

**spec-writer**:
> Read `wiki/INDEX.md`, then `wiki/backlog/doing/<id>-<slug>.md` (the item card),
> then `wiki/vision.md`, `wiki/requirements.md`, `wiki/architecture.md`, and any
> existing `wiki/specs/` pages it cross-references. Write
> `wiki/specs/<id>-<slug>.md` following `wiki/specs/README.md`. Add a row for it to
> the Pages table in `wiki/INDEX.md`. Update the item card's `spec:` frontmatter
> field to point at the new spec page. Report back: spec path, one-line summary,
> any blocking open questions.

**test-writer**:
> Read `wiki/INDEX.md`, `wiki/architecture.md` (for the package manager and test
> command), `wiki/specs/<id>-<slug>.md`, and the item card at
> `wiki/backlog/doing/<id>-<slug>.md`. Use the package manager declared in
> architecture.md — do not substitute. Write failing tests at <test path the
> architecture page describes>. Run the test command (`<command>`) and confirm the
> new tests fail for the right reason. Report back: the test file paths, the exact
> test command, and the failure summary. If this is a `bug` item, the regression
> test for the reported failure is required.

**implementer**:
> Read `wiki/INDEX.md`, `wiki/specs/<id>-<slug>.md`, the test files at
> <paths from test-writer>, `wiki/architecture.md` (for the package manager and
> test command), and the item card at `wiki/backlog/doing/<id>-<slug>.md`. Use the
> package manager declared in architecture.md — do not substitute. Write the
> minimum code to make the failing tests pass; do not weaken tests. Run the full
> suite with `<command>` until everything is green. Retry budget: 3 attempts. If
> still red, stop and report what you tried. Report back: files written, full-suite
> run summary, any flagged tests or spec gaps.

**reviewer**:
> Read `wiki/INDEX.md`, `wiki/specs/<id>-<slug>.md`, `wiki/requirements.md`,
> `wiki/architecture.md`, the test files at <paths>, the implementation files at
> <paths>, and the item card. Run the full test command `<command>` and confirm
> green. Verify every acceptance criterion is met and covered by a test. For a `bug`
> item, confirm the regression test is present. Verify no scope creep. Report PASS
> or FAIL with specific findings (file path + criterion + expected/actual + suggested
> fix on FAIL).

For `research` items, spawn a `general-purpose` agent with a prompt naming the
question, the relevant wiki pages, and `wiki/research/<topic>.md` as the output path.

## Commits

The **bootstrap baseline** is committed once, on the first run (see above). After
that, **one commit per completed item**, after green + review: stage the item's files
(the moved card in `wiki/backlog/done/`, test files, implementation files, any wiki
updates) and commit with `B<id>: <title>` as the subject. **Never push** unless the
user asks.

## Escalation

When you cannot resolve a failure within the retry budget, **stop**: write the reason,
what was tried, and the suggested next step to `wiki/progress.md`, and state the same to
the user in chat. Do not thrash. The user can resume with `/manager` after fixing the
underlying issue, or skip the item by adding `flags: [blocked]` to its card with a
one-line reason in `## Notes`.

## Logging

Use `Edit` (or `Write` for new files) — never Bash string-manipulation — to update
item cards (frontmatter, Notes), `wiki/progress.md` (run journal), and
`wiki/decisions.md` (orchestration decisions, ADR-style). Use `Bash git mv` for lane
moves; the card filename does not change. Keep `progress.md` current as items move
through the pipeline; it is your durable record of which stage each item is at.

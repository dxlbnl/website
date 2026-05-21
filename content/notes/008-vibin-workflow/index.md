---
pageType: note
title: Vibin — A Multi-Agent Workflow That Actually Holds Together
date: 2026-05-21
tags: [AI, Engineering, Testing, SvelteKit]
kind: PROJECT-LOG
images: [dexter-vibin-v2.png]
lede: LLMs are good at individual tasks. Getting them to do multi-step projects coherently is a different problem. Here's the pipeline I built to solve it.
---

I've been running LLM agents on my projects for a while. They're capable of multi-step work; that's not the issue. The issue is verifying that the *right* decisions are getting made, and making sure each new session picks up with the full context of everything that came before it.

Without structure, you get work that's technically correct but directionally off. An agent makes a reasonable-sounding call, the next agent inherits it, and by step four the project has quietly drifted from what you actually wanted. Not because the agents failed, but because there was no durable record of intent to check against.

That kept nagging at me. So I built a workflow to address it, which I've been calling **Vibin** ([open source on GitHub](https://github.com/dxlbnl/vibin)).

---

## The root issue: decisions made, but not recorded

Single-step prompts work fine. Ask an LLM to refactor a function, it refactors the function. Ask it to write a test, it writes a test. The problems show up when you chain these into a project — when the output of one step is the input for the next, across multiple sessions, across multiple agents that don't share context.

The failure mode isn't usually bad code. It's undocumented assumptions. An agent makes a call that's locally reasonable, the next agent inherits it without knowing, and the project quietly accumulates decisions that nobody consciously made. You can't review what wasn't written down.

The fix was obvious once I framed it that way: give the pipeline a durable, readable record of what was decided and why, one that outlives any individual context window.

---

## The wiki as the single source of truth

The core idea of Vibin is a `wiki/` directory that lives in the repo alongside the code. Every agent reads `wiki/INDEX.md` before doing anything else. A `PreToolUse` hook enforces this; agents that try to write before reading the wiki get blocked.

The wiki isn't documentation in the "update it at the end" sense. It's the spec. It contains:

- **Vision and requirements** — what the project is, what it should do
- **Architecture** — tech stack, package manager, directory conventions, test setup
- **A backlog** — markdown files in `wiki/backlog/<lane>/`, one per work item
- **Spec pages** — one detailed acceptance criteria doc per feature or bug
- **Research pages** — findings from investigative runs, written before implementation starts
- **A decision log** — an append-only ADR-style record of notable choices
- **A progress journal** — what the agents have actually done, in order

When code and wiki disagree, the wiki wins. That's the rule. If an agent produces something that contradicts the wiki, you don't patch the code, you figure out whether the spec was wrong and update it there. This keeps the system's memory coherent.

---

## The kanban, in markdown

Work items are files. `wiki/backlog/inbox/B5-add-storybook-config.md`. Moving a card to the next lane is `git mv`. The pipeline has four lanes: `inbox → ready → doing → done`.

It has some properties I care about:

- **Reviewable at any point**: I can pause the pipeline after spec, after tests, after implementation — each lane boundary is a natural checkpoint. Nothing commits to the next stage without the previous one landing in a file I can read.
- **Durable**: the state survives a context reset, a laptop reboot, a new Claude session. It's just files.
- **Scope stays bounded**: anything that surfaces mid-run but is out of scope for the current item goes into `inbox/` as a new card. It doesn't disappear, it doesn't derail what's in flight.

Each backlog item is a small markdown file with a `type:` field (feature, bug, research, chore) and an optional `flags:` list. Flagging something `review` pauses the pipeline after the spec is written and waits for your sign-off before tests get written. For routine work you skip the flag and let it run. For anything risky or genuinely unclear you add it and read the plan first.

---

## The pipeline tracks

Different types of work get different tracks through the pipeline.

**Feature**: spec-writer → test-writer → implementer → reviewer  
**Bug**: same, but the first thing the spec-writer does is write a regression test that exposes the bug  
**Research**: researcher → reviewer confirms the findings land in `wiki/research/<topic>.md`  
**Chore**: implementer → reviewer (no spec required, no test-first)

The spec-writer step is where planning happens. Not a back-and-forth conversation — the spec-writer reads the backlog item and the wiki and produces a spec page: acceptance criteria, constraints, proposed approach. That file is the plan. Add `flags: [review]` to the backlog item and the pipeline pauses after the spec is written, waiting for your sign-off before tests start. Leave the flag off and it keeps going. The spec exists either way, sitting in the repo, ready to read.

The test-first requirement for features and bugs is not just good practice; it serves a specific purpose in agent pipelines. The test is the spec expressed as runnable code. When the implementer has a failing test to satisfy, it can't hallucinate its way to "done." The test either passes or it doesn't. That binary is much harder to BS past than "does this look reasonable to you."

I use vitest for this. The test-writer produces failing tests from the spec page; the implementer makes them pass without touching the tests.

---

## Research agents as knowledge infrastructure

Before implementing anything I don't already know well, I spin up a research track. The researcher agent is given a topic and told to write its findings into `wiki/research/<topic>.md`. Then the implementer reads that page before writing a line of code.

It compounds. Early in a project, the implementer improvises from its training data. By the middle of the project, there's a growing `wiki/research/` directory with confirmed findings about the specific codebase, specific library versions, specific constraints. The agents read from that rather than guessing.

One concrete example: before integrating `@dxlbnl/ui` into the Dexterlabs site, I had a researcher document the exact component API, the token naming conventions, and the cases where the library's defaults conflict with the site's existing CSS. The implementer then worked from that doc, not from its assumptions about how a design system probably works.

---

## The @dxlbnl/ui case study

I built `@dxlbnl/ui` to extract the Dexterlabs design system into a standalone package I could use across projects.

The process had roughly three phases:

**Phase 1: Design analysis.** I used Claude to analyze [the existing site](/notes/006-site-design) — the CSS variables, the component patterns, the visual language (the phosphor aesthetic). The output was a design spec: a token system, component inventory, and a list of variants. This lived in the wiki as the source of truth for what the library should contain.

**Phase 2: Library build.** The Vibin pipeline built out the library itself: SvelteKit components, design tokens, Storybook stories, TypeScript exports. Storybook functioned as a visual regression harness — the reviewer agent could look at stories and check them against the spec doc. "Does this `<Badge>` match what the spec says a badge should look like" is a question a visual review step can actually answer.

**Phase 3: Site migration.** Once the library was publishing to npm, I ran the pipeline on a regression workflow to migrate the Dexterlabs site page by page. Each page got its own regression report — a diff of what changed, what visual behavior was preserved, what needed a fix. The regression-workflow file in `wiki/` explains the exact steps; the `wiki/regressions/` directory holds the per-page reports.

This was the part where the structured pipeline really earned its keep. Migrating a page is easy. Migrating fifteen pages without breaking the ones you already did requires tracking state. The backlog cards, spec pages, and progress journal meant I could pause, come back a week later, and pick up exactly where I stopped.

---

## Proving it on smaller projects

Before I trusted this on the site refactor, I ran the same pipeline on a few toy projects — nothing worth naming here, just small TypeScript utilities and a homelab tool. The point was to verify the workflow didn't only work because it was shaped around one specific codebase.

What generalized: the wiki-as-truth principle, the backlog lanes, the research-before-implement habit. These work regardless of what you're building.

What didn't generalize as cleanly: the reviewer step. For projects without a test suite, "reviewer" becomes "does this look right to me" which is exactly the single-agent problem I was trying to escape. Test-first is load-bearing. Projects where I couldn't write meaningful tests got worse results.

---

## What surprised me

The wiki compound interest was real. I expected it to be useful as documentation. I didn't expect agents to actively produce *better* work when they had a well-maintained wiki to read from. But they do. An agent that has read a two-page architecture doc and a three-page component API research page makes noticeably fewer wrong assumptions than one working from scratch.

The other thing: the two-agent loop catches a class of error that a single agent reliably misses. Spec-writer and reviewer have no shared session context. When the reviewer says "this doesn't match the spec," it's not because it remembers what the spec was supposed to say; it's reading it fresh. That independence is worth something.

---

## What still needs work

It does take a bit longer than just asking one agent to implement something. The extra steps are real time. But the tradeoff is that I can review direction at each stage — spec before any code is written, tests before the implementation starts. Finding a wrong assumption at the spec stage is cheap. Finding it after the implementer has gone three files deep is not.

Long chains are fragile. If a spec is ambiguous, the test-writer produces a test that satisfies the wrong thing, and you don't find out until review. The spec-writer is the most important step and also the one I rush most often.

Knowing when to override the pipeline is a skill. Sometimes the right move is to `git mv` a card back to `ready` and fix the spec before trying again. Sometimes the implementer is 80% right and a quick manual edit is faster than a full re-run. The workflow doesn't make that call for you.

---

## Is this just spec-driven development?

Yes, mostly. The interesting part is that the LLM both writes the spec and implements against it, with different agents handling each role. A spec written by a human is constrained by the human's time and patience. A spec written by a spec-writer agent, given a clear backlog item and a well-maintained wiki, is often more complete than what I'd write manually.

It also changes how planning works. Claude Code has a built-in plan mode: the agent tells you what it's about to do, you approve, it proceeds. Works fine for a single task. The problem is the plan lives nowhere — it's in the chat window, and the next session starts blank.

With Vibin the spec-writer produces the plan as a file. It lives in the wiki, the implementer reads it, the reviewer checks against it. Most of the time you probably never open it. For anything genuinely unclear, add `flags: [review]` and the pipeline pauses so you can read the spec before tests start. The file sticks around either way.

The failure mode is a spec-writer that writes confident specs around the wrong thing. The reviewer catches some of this — it reads the spec fresh, so it can flag "this was never right to begin with," not just "this doesn't match the code."

Without the wiki, each session starts from scratch. The agents do work, but none of it compounds. That's just a faster way to go in circles.

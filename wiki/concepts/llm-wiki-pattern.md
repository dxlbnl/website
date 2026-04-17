# The LLM Wiki Pattern

This page documents the core philosophy of the LLM Wiki as envisioned by Dexterlabs.

## The Core Idea

Most RAG systems are ephemeral; they rediscover knowledge on every query. The LLM Wiki is **persistent and compounding**. 

Instead of just retrieving fragments, the LLM incrementally builds and maintains a structured, interlinked collection of markdown files. The wiki is a "compiled" version of your knowledge that reflects everything read and synthesized to date.

## The Three Layers

1. **Raw Sources**: Immutable source of truth (articles, papers, data).
2. **The Wiki**: LLM-owned directory of markdown files (summaries, entity pages, index).
3. **The Schema**: Instructions (Skills/Workflows) that tell the LLM how to maintain the wiki.

## Why it Works
Humans abandon wikis because the "bookkeeping" (cross-referencing, updating summaries) becomes a chore. LLMs don't get bored. They handle the maintenance, leaving the human to curate sources and ask the right questions.

## Reference
- Inspired by Vannevar Bush's "Memex" (1945).
- Integrated with Obsidian for visualization (Graph View).

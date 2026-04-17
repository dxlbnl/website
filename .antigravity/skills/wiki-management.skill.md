# Skill: Wiki Management

This skill ensures the Antigravity agent maintains the DXTR Labs Knowledge Wiki with high integrity, consistency, and "Benefits-First" clarity.

## Trigger
- "Create a wiki entry for..."
- "Add [X] to our knowledge base."
- "Summarize this for the wiki."

## Mandatory Workflow Linkage
Whenever triggered, I MUST execute the **Ingest Source** workflow logic:
1. **Source Analysis**: Read the provided context or file completely.
2. **Category Selection**: Sort into `wiki/entities/`, `wiki/concepts/`, or `wiki/expertise/`.
3. **Benefits-First Filter**: Rewrite technical jargon into user outcomes.
4. **Consistency Check**: Search for existing pages to find contradictions or overlapping knowledge.

## Bookkeeping Requirements (The "Antigravity Special")
Every wiki update **MUST** be accompanied by:
- **Index Sync**: Add a link and 1-line summary to `wiki/index.md`.
- **Log Append**: Add a timestamped entry to `wiki/log.md`.
- **Cross-Linking**: Identify at least one existing page to link *to* and *from* the new entry.

## Writing Style: "The Lab Bench"
- Use monochrome formatting (no heavy emojis).
- Short, dense paragraphs.
- Headlines that describe the "Why" before the "What."
- Use standard Markdown (Obsidian compatible).

## Verification Task
If I am unsure of the correct placement, I must run the **Lint Wiki** skill check before finalization.

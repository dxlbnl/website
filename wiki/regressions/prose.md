---
id: REG-prose-2026-05-19
title: "Regression — Prose should match MarkdownBody's typography"
type: bug
priority: high
flags: []
created: 2026-05-19
---

## Description

`<Prose>` is the library replacement for the website's `src/lib/ui/MarkdownBody.svelte`.
Dexter's call: MarkdownBody's tunings are canonical, Prose should match.

Reference sources:
- Library: `node_modules/@dxlbnl/ui/dist/components/layout/Prose.svelte`
- Canonical: `src/lib/ui/MarkdownBody.svelte` (website repo)
- First consumer: `src/routes/(console)/legal/[slug]/+page.svelte`

## Proposed Prose `<style>` block

Paste-ready replacement. Uses native CSS nesting under a single `:global { … }`
block so the content-document selectors sit together and pseudo-class rules
live next to their parents. Drops the current adjacent-sibling spacing rule
(`> * + *`) in favour of per-element margins; restores list-marker colour;
makes links border-bottom underlines; downscales body `h2`/`h3`; etc.

```css
.prose {
  font-size: var(--t-body);
  line-height: 1.65;

  :global {
    h2 {
      font-size: var(--t-h3);
      font-weight: 500;
      letter-spacing: -0.01em;
      margin: 48px 0 8px;
      color: var(--ink);
    }

    h3 {
      font-size: var(--t-lede);
      font-weight: 500;
      letter-spacing: -0.01em;
      margin: 32px 0 6px;
      color: var(--ink);
    }

    p {
      margin-bottom: 20px;
      color: var(--ink);
    }

    a:not([class]) {
      border-bottom: 1px solid var(--rule-strong);
      transition: border-color 0.15s;

      &:hover {
        border-color: var(--amber);
      }
    }

    strong {
      font-weight: 500;
      color: var(--ink);
    }

    em {
      color: var(--ink-dim);
    }

    blockquote {
      margin: 28px 0;
      padding: 4px 0 4px 16px;
      border-left: 2px solid var(--amber);
      color: var(--ink-dim);

      p {
        margin-bottom: 0;
      }
    }

    code {
      font-family: var(--mono);
      font-size: var(--t-mono);
      background: var(--bg-elev);
      padding: 1px 5px;
      border: 1px solid var(--rule);
      border-radius: var(--radius);
      color: var(--cyan);
    }

    pre {
      border: 1px solid var(--rule);
      border-radius: var(--radius);
      padding: 16px 20px;
      overflow-x: auto;
      white-space: pre;
      margin: 24px 0;
      line-height: 1.6;

      code {
        background: none;
        border: none;
        padding: 0;
        font-size: var(--t-mono);
        color: inherit;
      }
    }

    ul,
    ol {
      padding-left: 20px;
      margin-bottom: 20px;
      color: var(--ink);
    }

    li {
      margin-bottom: 6px;
      line-height: 1.65;
    }

    ul li::marker {
      color: var(--amber);
    }

    ol li::marker {
      font-family: var(--mono);
      font-size: var(--t-mono);
      color: var(--ink-faint);
    }

    hr {
      border: none;
      border-top: 1px solid var(--rule);
      margin: 48px 0;
    }

    img {
      width: 100%;
      height: auto;
      display: block;
      border: 1px solid var(--rule);
      margin: 28px 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-family: var(--mono);
      font-size: var(--t-mono);
      margin: 24px 0;
    }

    th {
      text-align: left;
      padding: 8px 0;
      border-bottom: 1px solid var(--rule-strong);
      color: var(--ink-faint);
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-weight: 500;
    }

    td {
      padding: 8px 0;
      border-bottom: 1px dashed var(--rule);
      color: var(--ink-dim);

      &:first-child {
        width: 40%;
      }

      &:last-child {
        color: var(--ink);
      }
    }
  }
}
```

The current `h1` / `h4` rules in Prose can be folded into the same `:global`
block (they don't conflict with anything in MarkdownBody since the canonical
file styles neither).

## Verification

Open http://localhost:5174/legal/privacy/ side-by-side with
https://www.dexterlabs.nl/legal/privacy/. After the rewrite, body type
rhythm, link underlines, list markers (amber bullets, mono-faint
ordered numbers), inline-code chips, block code, blockquote, image
treatment, and table column widths should match production.

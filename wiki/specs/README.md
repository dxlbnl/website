# Specs

Detailed feature and bug specs live here — **one page per item**, created and refined by
the `spec-writer` agent from a backlog item card in `wiki/backlog/`. These are wiki
pages, not a separate source of truth: the wiki *is* the spec.

Each spec page is named after its backlog item (e.g. `B3-user-login.md`) and is linked
from its item card's `spec:` frontmatter field. It is also linked from `../INDEX.md`'s
Pages table.

## Spec ↔ item card pairing

Every spec page has exactly one backlog item card pointing at it:

```
wiki/backlog/<lane>/B3-user-login.md   # item card, has `spec: wiki/specs/B3-user-login.md`
wiki/specs/B3-user-login.md            # this page
```

Research items pair with `wiki/research/<topic>.md` instead. Chore items have no spec.

## Spec page format

```
# B<n>: <feature title>

## Context
<why this feature exists; link to the relevant wiki pages and the item card>

## Acceptance criteria
<numbered, TESTABLE statements — these map directly to tests>
1. ...
2. ...

## Out of scope
<what this feature deliberately does not cover>

## Open questions
<anything unresolved; if blocking, the item should be flagged `review` in its card>
```

The acceptance criteria are the contract: `test-writer` turns each one into failing
tests, `implementer` makes them pass, `reviewer` checks every criterion is met.

# Workflow: Ingest Source

Process a new source document and integrate it into the knowledge base.

## Execution Steps

1. **Scan Source**: Identify the core purpose and key entities.
2. **USER Sync**: Discuss the summary and confirm which entities to create or update.
3. **Synthesis**: Update relevant files in `wiki/entities/` or `wiki/expertise/`.
4. **Link**: Cross-reference the new knowledge across the wiki.
5. **Log**: Append an entry to `wiki/log.md`.
6. **Index**: Ensure the page is visible in `wiki/index.md`.

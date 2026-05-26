# Continuity Alpha

Continuity Alpha is now a protected alpha lane, not just mock scaffolding.

## Landed and protected

- Memory and Canon API-backed CRUD surfaces.
- Archive/import/file primitives.
- Integrity Session persistence via calibration sessions.
- Persona runtime context assembly using Canon, Integrity, Memory, and Archive references.
- Owner-only context preview.
- Active chat archival into transcript records and Memory/Canon candidates.
- Owner review of continuity candidates: accept, edit, reject.
- Archived chat references in context preview and export manifests.
- Continuity artifact publication into separate public document copies with provenance.
- Export manifest inclusion for continuity data.

Protected checks include:

```bash
pnpm test:continuity
pnpm test:persona-context
pnpm test:conversation-archive
pnpm test:continuity-publication
pnpm test:exports
```

## Still open

- Soft-limit prompts before chat archiving.
- Archived transcript presentation as a first-class Library/Archive artifact.
- Better candidate extraction beyond heuristic rules.
- Semantic retrieval/indexing hardening.
- Topology-aware memory weighting.
- Global private library.
- Mobile-first Studio polish.
- Station Assistant workflows for continuity management.

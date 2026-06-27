# PR421 - Import-Accepted Memory Runtime Result

Owner: ARGUS
Implemented by: DAEDALUS
Status: ACCEPTED - WAKE MIMIR

## Reviewed Change

ARGUS reviewed `8713af98 api: admit reviewed import memory at runtime`.

Changed files:

- `packages/ai/src/retrieval/semantic-search.ts`
- `apps/api/src/routes/persona-context.test.ts`

The patch stayed in the approved runtime Memory lane. It did not modify
Cloudflare retrieval, hosted runtime config, queues/workers, embeddings,
providers/models, schema/migrations, billing/settings, public/community routes,
or UI.

## Verdict

```text
ACCEPTED - WAKE MIMIR
```

DAEDALUS implemented the narrow policy ARGUS approved:

- archive-sourced Memory remains excluded by default;
- only `source_type: import` plus `archive_source_type: persona_file` can become
  runtime-eligible;
- the row must be same-owner/same-persona through the existing runtime owner
  path;
- a same-owner/same-persona lifecycle row must exist;
- lifecycle must be `active`, not superseded, and not expired;
- lifecycle trust must be `user_stated` or `agreed_upon`;
- `archived_chat_transcript` archive-source Memory remains excluded from PR421.

Trace selected-source metadata stays limited to selected ids, titles, reasons,
scores, and source types. It does not expose raw archive source IDs, archive
source names, storage paths, signed material, or private source bodies.

## Validation

Local validation:

- `npm exec --yes pnpm@10.32.1 -- run test:persona-context` passed (8 tests).
- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` passed
  (41 tests).
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `git diff HEAD^ HEAD --check` passed.
- Added-line sensitive-pattern review found only hostile test fixtures for
  redaction behavior, not real secret values.

Hosted read-only validation:

- Public web/API health were ready at commit prefix `8713af989bfe`.
- API storage readiness remained bucket `persona-files`, ok/checked/exists, and
  private.
- Public `/discover/search` returned zero matches for the PR419 proof phrase,
  PR419 artifact name, and PR420 accepted Memory/Canon titles.
- Replay owner sign-in succeeded with tier `canon`; no token, raw user ID, raw
  persona ID, or raw response body was recorded.
- Owner readback found the accepted PR420 Memory as source type `import`,
  archive source type `persona_file`, lifecycle `active`, and trust
  `user_stated`.
- Owner readback found the accepted PR420 Canon as source type `import`.
- Owner `GET /conversations/persona/:personaId/context-preview` selected the
  accepted PR420 Memory in the Memory bucket with source type `import`.
- The same context-preview selected the accepted PR420 Canon in the Canon bucket.
- Runtime trace selected-source metadata had no content fields and the raw
  archive metadata/path pattern scan was negative.
- Visitor context-preview returned 401.
- A different replay owner context-preview returned 403.
- No hosted mutation, chat/model call, candidate action, upload/register/import,
  cleanup/delete, public/community mutation, or Assistant/forum action was run.

## Residual Risk

PR421 proves only the narrow runtime Memory eligibility policy for accepted
`persona_file` import-backed Memory. It does not promote archived-chat
transcript Memory, change import review workflows, alter Memory briefing
semantics, change Cloudflare retrieval, or prove broad real/private provider
export behavior.

The owner-only Memory briefing route still has its own broader active-memory
classification and was not changed in this lane. Runtime selection is now
separately guarded by the stricter PR421 policy.

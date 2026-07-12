# PR524A Cross-Owner Generated Material Publication Contract Result

Date: 2026-07-12

Owner: DAEDALUS / A2

Requested by: MIMIR / A1

Review target: ARGUS / A3

Status: READY_FOR_ARGUS_REVIEW

## Source

- `docs/roadmap/PR524A_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_CONTRACT_DAEDALUS.md`
- `docs/roadmap/PR524_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_CONTRACT_PREFLIGHT_RESULT.md`
- PR522 accepted foundation:
  `docs/roadmap/PR522_CROSS_OWNER_PRIVATE_GENERATED_ARTIFACT_APPROVAL_LEDGER_ARGUS_RESULT.md`

## Result

DAEDALUS implemented the first generated-material public detail contract as a
separate lane from metadata-only cross-owner exhibits.

This patch adds:

- Supabase migration
  `082_persona_encounter_cross_owner_generated_publications.sql` with a
  dedicated generated-publication table, append-only publication audit table,
  strict public RLS checks against active consent/artifact/revision/approval
  sources, lifecycle invalidation triggers, indexes, and no participant write
  policies;
- one new requested consent scope:
  `publish_exact_generated_revision`;
- API routes for participant publication from an exact approved PR522 revision,
  public generated-publication detail read, public report, participant retract,
  and participant delete;
- generated-publication report target support and admin moderation
  remove/restore with safe target context and audit events;
- DB and shared moderation-report type surfaces for the generated-publication
  target type;
- minimal public web detail route:
  `/encounters/cross-owner/generated/:slug`;
- Studio controls that publish only the selected exact approved revision digest
  when the consent has both private-artifact and generated-publication scopes;
- focused API/runtime/Studio/report tests for exact copy behavior, report
  scoping, moderation lifecycle, participant controls, wrong scope, stale
  digest, source/participant drift, and public no-drift guardrails.

## Boundary

This result publishes generated body text only on one detail route and only
after both participants approved the exact PR522 revision digest.

Still blocked by default:

- public generated-material index/list/search/feed placement;
- Discover, public persona linkback, Space, forum/community, writing,
  homepage, SEO, or social placement for generated body text;
- metadata-only exhibit payload widening;
- PR516 disposable preview direct publication;
- generated summaries, abstracts, transcript excerpts, source artifact body,
  prompts, provider payloads, retrieval bodies, token facts, or regenerated
  excerpts;
- provider/model routing, retrieval/vector/embedding, storage/export,
  billing/Stripe, Redis, Cloudflare, queue/worker/webhook, package/lockfile,
  deployment, or broad UI work.

## ARGUS Review Focus

ARGUS should review:

- public RLS/source-chain checks in migration `082`;
- owner and participant scoping for publish, retract, and delete;
- exact digest, bilateral approval, source artifact, revision, consent scope,
  and participant-existence readiness checks;
- public response allow-list and raw id/private body/secret exclusion;
- report target scoping and admin remove/restore behavior;
- audit append-only behavior and lifecycle event coverage;
- Studio gating and the absence of generated-publication list/Discover/persona/
  Space/forum/writing/homepage drift.

## Validation

Environment note: commands used the pinned runner:
`npm exec --yes pnpm@10.32.1 -- ...`.

| Command / check | Result | Notes |
| --- | --- | --- |
| `pnpm test:persona-encounters` | Pass | 87 tests passed, including PR524A API/runtime/public page/Studio contract cases. |
| `pnpm test:reports` | Pass | 9 tests passed, including generated-publication target context and moderation remove/restore. |
| `pnpm test:personas` | Pass | 18 tests passed; public persona linkbacks/context stayed bounded. |
| `pnpm test:community` | Pass | 47 tests passed; Discover/community public surfaces did not gain generated-material placement. |
| `pnpm test:writing` | Pass | 32 tests passed; writing/public document helpers stayed bounded. |
| `pnpm test:studio-ui` | Pass | 244 tests passed, including generated publication runtime/UI guardrails. |
| `pnpm typecheck` | Pass | Turbo API/web typecheck passed. |
| `pnpm lint` | Pass | Web lint passed with no warnings or errors. |
| `pnpm build` | Fail - environment | Web compiled, lint/type checks ran, and 40 static pages generated; Next standalone trace copy then failed on Windows symlink `EPERM` for traced packages including `react`, `next`, and `@next/env`. |
| `git diff --check` | Pass | No whitespace errors; Git printed existing LF-to-CRLF working-copy warnings. |
| Changed-path forbidden-scope scan | Pass | Changed paths stayed in PR524A API/web/runtime/moderation/types/migration/docs scope. |
| Broad scope-word diff scan | Pass with intentional guardrail hits | Hits were no-drift assertions/docs containing words like Discover, Space, forum, writing, and provider payload. |
| High-risk secret pattern diff scan | Pass | Refined scan found no API keys, private keys, passwords, `sk-` keys, or literal long bearer values. |

## Handoff

ARGUS should review PR524A next.

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR524A generated material publication contract.
- Public body text is detail-only and copied server-side from PR522 exact
  bilaterally approved revisions.
- Metadata-only exhibits remain metadata-only; no generated list, Discover,
  public persona, Space, forum, writing, homepage, provider, retrieval,
  storage, billing, queue, Cloudflare, package, or deploy work was added.
Validation:
- test:persona-encounters, test:reports, test:personas, test:community,
  test:writing, test:studio-ui, typecheck, lint, git diff --check, forbidden
  path scan, and high-risk secret scan passed.
- build reached successful Next compile/type/static page generation, then hit
  the known Windows Next standalone symlink EPERM.
Task:
- Hostile review owner/participant scoping, RLS/source-chain checks, exact
  approval gates, public payload allow-list, moderation/report lifecycle,
  Studio gating, and no-drift boundaries.
- Wake MIMIR with WAKEUP A1 if accepted; wake DAEDALUS with WAKEUP A2 if fixes
  are needed.
```

# PR508C - Owner Encounter Public Exhibit Report Target Repair

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-11

Status:

```text
OPEN_REPAIR
```

## Why This Lane Exists

ARIADNE blocked PR508B hosted proof only at signed-in report creation:

`docs/roadmap/PR508B_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_METADATA_HOSTED_PROOF_RESULT.md`

Passed before the blocker:

- hosted web/API freshness and deployment readiness;
- hosted migration `076` shape and ledger proof;
- owner/non-owner/admin auth;
- same-owner private candidate creation;
- owner metadata-only public exhibit publish;
- signed-out public `/encounters/[slug]` metadata-only readback;
- desktop and `390px` Studio control fit;
- owner retract;
- Discover/search/forum/public Space/public persona no-drift samples;
- cleanup and privacy scan.

Blocked:

- signed-out report attempt correctly returned `401`;
- signed-in report attempt returned `500`;
- no report row was created;
- hosted `moderation_reports.target_id` is `uuid`;
- the public exhibit report path writes the public exhibit slug into
  `moderation_reports.target_id`.

## Task

Implement the smallest code repair that lets signed-in users report a public
encounter exhibit by slug while the moderation report persists the public
exhibit UUID as `moderation_reports.target_id`.

Primary files:

- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`
- `apps/api/src/routes/reports.ts`
- `apps/api/src/routes/reports.test.ts`

Likely repair shape:

- Keep the public route and client contract slug-based:
  `/persona-encounters/public-exhibits/:slug/report`.
- Resolve the public exhibit by slug server-side before insert.
- Persist `target_type: "persona_encounter_public_exhibit"` with the exhibit
  UUID in `moderation_reports.target_id`.
- Keep report response/readback free of raw private ids and private material.
- Update report queue/admin safe target context to resolve the UUID target to
  public-safe exhibit context.
- Ensure admin remove/restore operates on the UUID target and still cannot
  override an owner-retracted exhibit.
- Preserve the existing signed-out, cross-owner, malformed-body, removed,
  retracted, and missing-exhibit fail-closed behavior.

Do not widen `moderation_reports.target_id` to text unless the code repair is
proven impossible and the migration is explicitly justified in the result.

## Guardrails

Do not expose or persist into public/report/admin readback:

- private setup bodies;
- generated reply text;
- transcript excerpts;
- raw private session ids;
- raw source persona ids;
- provider payloads;
- prompts;
- private curation text;
- cross-owner source words.

Do not add:

- public Discover/search/forum/feed surfacing for encounter exhibits;
- cross-owner public exhibit support;
- shareable private artifacts;
- retrieval/provider/model changes;
- storage/package/export changes;
- queue/worker changes;
- Redis/Cloudflare changes;
- billing/social changes;
- app runtime dependency drift.

No migration is expected for the preferred repair. If a migration becomes
necessary, stop the lane result around that justification and wake MIMIR before
applying hosted schema changes.

## Validation

Required:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

If any web/helper file is touched, also run:

```text
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
```

Tests must prove:

- signed-in report by public slug creates a report row with UUID target id;
- signed-out report remains `401`;
- missing, removed, and owner-retracted public exhibits fail closed;
- admin report queue/readback resolves public exhibit target context from UUID
  without private material or raw private ids;
- admin remove/restore works from the UUID target;
- admin remove/restore cannot override owner-retracted exhibits;
- dedicated public exhibit route remains metadata-only and slug-based;
- existing report target types remain stable.

## Result Required

Create:

```text
docs/roadmap/PR508C_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_REPORT_TARGET_REPAIR_RESULT.md
```

Include:

- files changed;
- whether the repair stayed code-only;
- exact target identity behavior before/after;
- validation results;
- forbidden-scope scan notes;
- wakeup for ARGUS.

## Review

Wake ARGUS after implementation:

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- DAEDALUS repaired PR508C public exhibit report target persistence.
- PR508B blocked because hosted `moderation_reports.target_id` is UUID while the public exhibit report route wrote the slug.
- The repair should keep public report routes slug-based, resolve slug to public exhibit UUID server-side, and keep admin moderation context metadata-only.
Validation:
- npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
- npm exec --yes pnpm@10.32.1 -- run test:reports
- npm exec --yes pnpm@10.32.1 -- run typecheck
- git diff --check
- git diff --cached --check
Task:
- Review the report target repair.
- Confirm signed-in public exhibit reports persist UUID targets and the public route remains slug-based.
- Confirm admin queue/remove/restore resolve the UUID target safely and cannot override owner-retracted exhibits.
- Confirm no private setup, generated reply text, transcript excerpts, raw private ids, provider payloads, prompts, cross-owner words, Discover/search/forum/feed surfacing, schema drift, retrieval, billing, social, Redis, Cloudflare, queue, or storage drift.
- If accepted, wake MIMIR to route PR508B hosted report/takedown rerun back to ARIADNE.
```

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS

Summary:
- PR508B hosted proof passed deployment, migration 076, owner publish/retract, public metadata-only route, layout, boundaries, no-drift, cleanup, and privacy scans.
- It blocked only because signed-in report creation for a public encounter exhibit returned 500.
- Hosted `moderation_reports.target_id` is UUID, but the current public exhibit report route writes the public slug as `target_id`.
- MIMIR is opening PR508C as the narrow report target identity repair.
Task:
- Implement PR508C owner encounter public exhibit report target repair.
- Keep public report routes slug-based, resolve slug to exhibit UUID server-side, persist UUID target ids, and keep admin/report readback metadata-only.
- Do not add schema drift unless strictly justified; wake MIMIR first if you believe a migration is unavoidable.
- Validate and wake ARGUS for review.
```

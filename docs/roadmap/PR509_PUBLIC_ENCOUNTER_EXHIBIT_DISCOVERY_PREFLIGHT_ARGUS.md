# PR509 - Public Encounter Exhibit Discovery Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-11

Status:

```text
OPEN_PREFLIGHT
```

## Why This Lane Exists

PR508D closed the protected-alpha public encounter exhibit loop:

`docs/roadmap/PR508D_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_REPORT_TAKEDOWN_HOSTED_RERUN_CLOSEOUT.md`

Current proven behavior:

- owner can publish same-owner private encounter artifacts as metadata-only
  public exhibits;
- dedicated public route is `/encounters/[slug]`;
- public route shows owner-authored public metadata, same-owner display
  snapshots, public provenance, and report/sign-in affordances only;
- report/takedown is hosted-proven;
- owner retract protection is hosted-proven;
- public no-drift is currently true because exhibits do not appear in
  Discover/search/forum/feed/public Space/public persona surfaces.

That is safe but not yet very findable. The next customer-facing question is
whether public encounter exhibits should become discoverable, and if yes, what
the smallest safe surface is.

This is a boundary preflight. Do not implement surfacing yet.

## Task

Review the current public encounter exhibit implementation and decide the safe
next implementation lane.

Assess these possible surfaces:

- dedicated public encounter exhibit index;
- Discover search result group;
- Discover feed/new/rising/featured inclusion;
- public persona profile section;
- public Space section;
- forum/community discussion linkage;
- public document linkage or Station Press inclusion;
- no surfacing yet, with a better prerequisite lane instead.

For each plausible surface, classify:

- safe now;
- safe only with extra metadata/state;
- unsafe for protected alpha;
- duplicate of an existing surface;
- not worth implementing yet.

## Evidence To Use

Review at minimum:

- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`
- `apps/api/src/routes/reports.ts`
- `apps/api/src/routes/reports.test.ts`
- `apps/web/app/encounters/[slug]/page.tsx`
- `apps/web/app/discover`
- `apps/web/app/personas` or public persona routes if present
- `apps/web/app/spaces` or public Space routes if present
- public search/feed helpers and tests
- PR508A/PR508B/PR508C/PR508D roadmap result docs

Use hosted proof evidence from PR508D as the truth for deployed safety:

`docs/roadmap/PR508D_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_REPORT_TAKEDOWN_HOSTED_RERUN_RESULT.md`

## Boundary Questions

Answer these directly:

1. What public metadata is safe to surface outside `/encounters/[slug]`?
2. Should public encounter exhibits have an index/list route before they enter
   Discover/search/feed?
3. Should an exhibit attach to a public persona page, and if yes, whose page:
   source persona, responder persona, owner profile, or none?
4. Should exhibits attach to a public Space, or is that an explicit owner
   publishing action for a later lane?
5. Should public comments/discussion exist for an exhibit now, or should report
   remain the only public interaction?
6. What sort/filter state is safe without creating popularity or moderation
   ambiguity?
7. What happens to discovery surfaces when an owner retracts or moderation
   removes/restores an exhibit?
8. What tests would prove no private setup, generated reply text, transcript
   excerpt, private curation text, raw private ids, source bodies, provider
   payloads, prompts, or cross-owner words leak?

## Guardrails

Do not recommend a lane that exposes:

- private setup bodies;
- generated reply text;
- transcript excerpts;
- raw private session ids;
- raw source persona ids;
- private curation text;
- provider payloads;
- prompts;
- source bodies;
- cross-owner words;
- owner-only artifact ids;
- unretracted removed exhibits;
- report/admin internals.

Do not mix this with:

- provider/retrieval changes;
- billing/social/storage/export/package work;
- queue/worker/Redis/Cloudflare work;
- schema migrations unless a clearly justified surfacing table/index is the
  recommended next lane;
- broad Discover redesign;
- public launch claims.

## Expected Output

Create:

```text
docs/roadmap/PR509_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVERY_PREFLIGHT_RESULT.md
```

Include:

- verdict;
- recommended next implementation lane, or a clear no-go;
- allowed public surface(s);
- forbidden surface(s);
- required API/web/test files for the next lane;
- required validation commands;
- exact privacy/no-drift tests;
- whether DAEDALUS or ARIADNE should act next.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- PR508D passed hosted report/takedown rerun for public encounter exhibits.
- Owner-published same-owner public exhibits are now hosted-proven on dedicated metadata-only `/encounters/[slug]` routes with report/takedown and owner retract protection.
- Public no-drift currently holds because exhibits do not surface outside the dedicated route.
Task:
- Run PR509 public encounter exhibit discovery preflight.
- Decide whether and how public encounter exhibits may become discoverable from Station public surfaces.
- Recommend the smallest safe next implementation lane, or say no-go with a concrete prerequisite.
- Wake MIMIR with verdict and next owner.
```

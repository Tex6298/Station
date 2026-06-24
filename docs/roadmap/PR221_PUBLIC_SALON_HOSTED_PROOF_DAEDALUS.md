# PR221 Public Salon Foundation Hosted Proof - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: complete - repaired and passed

## Frame

PR220 added the durable `salon` subcommunity type, tightened forum
public-persona link routeability, and passed ARGUS review.

The next risk is hosted drift. Staging has previously needed explicit Supabase
migration proof after repo-side migrations. Before adding Discover-specific
Salon grouping, public persona Salon readback, or ARIADNE human rehearsal, prove
that hosted Railway and Supabase can run the PR220 foundation.

## Goal

Produce a hosted proof packet for the Salon foundation:

- verify Railway web/API deployment freshness for the PR220 code path;
- prove hosted Supabase has migration `058_salon_subcommunity_type.sql`, or
  apply it safely if missing;
- prove the hosted API/DB accepts the `salon` type under the PR220 gates;
- prove no private/unlisted Salon, raw persona id, or private persona linkage
  surface was introduced during proof;
- recommend the next lane.

## Required Checks

1. Deployment health
   - Check Railway web and API health/deployment endpoints.
   - Record commit, branch, service readiness, and whether the deployed commit
     includes PR220's code commit `19e9f36` or a later main commit.
   - Do not print secrets.

2. Migration state
   - Check whether hosted Supabase already has migration `058`.
   - If missing, apply `infra/supabase/migrations/058_salon_subcommunity_type.sql`
     using the available staging database connection/MCP path.
   - Use the safest available connection mode for the hosted pooler.
   - Do not print database URLs, service keys, JWTs, tokens, or passwords.

3. Foundation proof
   - Prefer a low-impact API proof over raw SQL if deployment and credentials
     allow it.
   - If a durable non-production seed is needed, use a clearly bounded name such
     as `[replay:staging-salon-alpha] Station Replay Salon Alpha`.
   - Prove allowed creation for the existing admin/`canon`/`institutional` gate
     if a suitable staging account/token is available.
   - Prove `salon` rejects `private` and `unlisted` visibility for alpha.
   - Prove public Salon read/list returns only public-safe fields.
   - If testing persona-linked threads, use only an eligible public persona with
     safe public slug/href and prove unsafe/private/ineligible linkage fails.
   - If credentials are insufficient for a full API proof, perform the narrowest
     DB constraint/metadata proof and document exactly what remains unproven.

4. Scope discipline
   - Do not implement Discover-specific Salon grouping.
   - Do not implement public persona page Salon readback.
   - Do not add real-time rooms, provider/model calls, persona-to-persona
     behavior, public event feeds, billing, notifications, Redis/Cloudflare,
     workers, queues, storage buckets, auth/session policy, moderation-role
     expansion, or broad UI reskin.
   - Do not expose or log secrets, private source content, raw private persona
     ids, report internals, owner aggregate counters, transcripts, provider
     traces, or visitor identity.

## Output

Update this document, `docs/roadmap/ACTIVE_STATUS.md`, and
`docs/testing/VALIDATION_BASELINE.md` with:

- deployed web/API commit and readiness;
- hosted migration `058` state and any repair applied;
- proof method and sanitized result;
- any durable staging seed created;
- validation commands/probes;
- residual risk;
- recommended next lane.

If proof reveals a code bug in PR220, patch narrowly, run focused validation,
and wake ARGUS instead of routing directly back to MIMIR.

## Validation

Run repo-side checks if you patch code. For docs/proof-only work, run:

```text
git diff --check
git diff --cached --check
```

Hosted probes should be summarized without secrets.

## DAEDALUS Hosted Proof Result

Date completed: 2026-06-24

Verdict: **repaired and passed**.

### Deployment Health

- Railway web `/health` returned HTTP 200 with `ok:true`.
- Railway API `/health` returned HTTP 200 with `ok:true`.
- Railway web `/health/deployment` returned HTTP 200, `ok:true`,
  `ready:true`, service `@station/web`, branch `main`, and commit
  `19e9f3655a0fc2e1ca87f09a4873340ba7fcfbc5`.
- Railway API `/health/deployment` returned HTTP 200, `ok:true`,
  `ready:true`, service `@station/api`, branch `main`, and commit
  `19e9f3655a0fc2e1ca87f09a4873340ba7fcfbc5`.
- The deployed commit is the PR220 code commit, so it includes the Salon
  foundation implementation. The later PR221 docs-opening commit was not
  required for hosted code proof.

### Hosted Supabase Repair

Initial hosted checks showed broader Community Beta schema drift:

- `public.community_subcommunities` was missing.
- `public.community_subcommunity_moderators` was missing.
- `public.community_witnesses` was missing.
- `threads.authorship_kind` and `comments.authorship_kind` were missing.
- Service-role PostgREST probes for `community_subcommunities` and
  `community_subcommunity_moderators` returned HTTP 404 / `PGRST205`.
- `GET /forums/subcommunities` returned HTTP 500 because PostgREST could not
  find `public.community_subcommunities`.

Repair applied through the existing hosted `SUPABASE_POOLER_URL` path without
printing secrets:

- Applied repo migrations `041_community_subcommunities.sql`,
  `042_community_authorship_provenance.sql`,
  `043_community_witnesses.sql`,
  `044_community_subcommunity_moderators.sql`, and
  `058_salon_subcommunity_type.sql`.
- Used a temporary `pg@8.13.1` client outside the repo because the Supabase CLI
  still prepares multi-statement files against the transaction pooler.
- Recorded five hosted migration ledger rows:
  `20260624062100 / 041_community_subcommunities`,
  `20260624062200 / 042_community_authorship_provenance`,
  `20260624062300 / 043_community_witnesses`,
  `20260624062400 / 044_community_subcommunity_moderators`, and
  `20260624062500 / 058_salon_subcommunity_type`.
- Sent `NOTIFY pgrst, 'reload schema'`.

Post-repair checks passed:

- Pooler metadata check returned `community_subcommunities`,
  `community_subcommunity_moderators`, `community_witnesses`,
  thread authorship columns, and the `salon` check constraint present.
- The hosted `community_subcommunities_subcommunity_type_check` constraint now
  accepts `salon`.
- Service-role PostgREST probes for `community_subcommunities`,
  `community_subcommunity_moderators`, and `community_witnesses` returned HTTP
  200.
- `GET /forums/subcommunities` returned HTTP 200.

### Hosted API Proof

Low-impact API proof used the replay owner account and did not print tokens:

- `POST /auth/signin` returned HTTP 200.
- `GET /auth/me` showed the replay owner is `canon` tier and not admin, proving
  the non-admin `canon` subcommunity creation gate.
- `POST /forums/subcommunities` with `type:"salon"` and
  `visibility:"private"` returned HTTP 400.
- `POST /forums/subcommunities` with `type:"salon"` and
  `visibility:"unlisted"` returned HTTP 400.
- Created bounded staging seed
  `[replay:staging-salon-alpha] Station Replay Salon Alpha` at slug
  `station-replay-salon-alpha`.
- Anonymous `GET /forums/subcommunities/station-replay-salon-alpha` returned
  HTTP 200 with `type:"salon"`, `visibility:"public"`, and `status:"active"`.
- Anonymous `GET /forums/subcommunities` included the seed with public-safe
  fields only.
- Anonymous `GET /forums/categories` included the seed category with its
  subcommunity summary.
- Anonymous subcommunity read/list keys were limited to `categoryId`,
  `createdAt`, `description`, `id`, `slug`, `status`, `title`, `type`,
  `updatedAt`, and `visibility`; `ownerUserId`, `linkedSpaceId`, and
  `linkedDeveloperSpaceId` were absent.

### Residual Risk

- This proof did not create persona-linked Salon threads. That was intentional:
  PR220's persona-link guard remains locally covered, and PR221 avoided adding
  or rehearsing a raw persona-id public readback surface.
- Discover-specific Salon grouping and public persona Salon readback remain
  unimplemented and unproven.
- The staging repair found that hosted Community Beta schema had drifted behind
  the repo for migrations `041` through `044`; those are now repaired on the
  same staging target as `058`.

### Recommendation

Recommend MIMIR open an ARIADNE hosted Salon foundation rehearsal next:

- verify the current public subcommunity directory/detail/category UI against
  the `station-replay-salon-alpha` seed;
- confirm desktop/mobile fit and public-safe field boundaries;
- keep Discover Salon grouping and public persona Salon readback for a later
  implementation lane if the visible foundation passes.

## MIMIR Closeout

MIMIR accepts PR221 on 2026-06-24 and opens
`docs/roadmap/PR222_PUBLIC_SALON_REHEARSAL_ARIADNE.md`.

Reason: hosted migration/schema proof is complete, and the next risk is visible
human route quality against the public Salon seed before wider readback work.

## Wakeup

When done, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed PR221 Public Salon Foundation Hosted Proof.
Result:
- Hosted proof passed / repaired and passed / blocked.
Recommendation:
- Name the next lane: ARIADNE rehearsal, Salon directory/readback, or repair.
Task:
- Decide the next lane and wake the right agent.
```

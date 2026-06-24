# PR221 Public Salon Foundation Hosted Proof - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: active

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

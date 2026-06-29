# PR472 - Persona Encounter Consent / Provenance Preflight Result

Owner: ARGUS / A3

Date: 2026-06-29

Verdict: `ACCEPT_FOR_DAEDALUS`

Accepted lane:

```text
PR472A - Owner Encounter Consent / Provenance Contract
Owner: DAEDALUS / A2
```

## Decision

Station can safely open a first encounter unblock slice as a contract-only,
owner-only readback/helper.

PR472A must not create encounter runtime. It must not generate encounter text,
call providers, persist encounter drafts or transcripts, create public or
shareable output, support cross-owner encounters, deduct token credits, add
billing, add schema/storage, add queues/workers, add Redis/Cloudflare, add API
routes, or broaden Studio/public UI.

The accepted slice is a private persona Studio contract readback that states
the minimum conditions a future owner-initiated encounter runtime must satisfy
before any provider call can exist.

## Accepted Product Shape

DAEDALUS may add an owner-only Persona Encounter contract panel/helper to the
private persona Studio surface.

Allowed contract readback:

- Consent scope: same-owner only for the next possible runtime slice.
  Cross-owner encounters remain blocked until bilateral consent, visibility,
  revocation, and audit policy exists.
- Provenance labels: future output must distinguish owner-authored setup,
  selected persona identities, model-generated turns, simulated text, public
  inputs, private inputs, archived sources, transcript state, and shareability.
- Stop/revoke controls: future runtime must be owner-initiated, manually
  stoppable, non-background by default, bounded by explicit turn limits, and
  revocable before any persistence or sharing.
- Cost/rate-limit/plan controls: future runtime must estimate cost before a
  provider call, attribute cost to the owner, enforce per-run and per-day
  limits, and avoid automatic retries or loops.
- Moderation/reporting: public or shareable output remains blocked until
  reporting, moderation queue semantics, takedown/retract behavior, and
  provenance labels exist.

Allowed implementation shape:

- Web-only helper/readback copy and tests.
- Owner-only rendering on the private persona Studio surface.
- No new API route, database table, migration, storage bucket, provider
  adapter, queue, worker, billing path, token-credit behavior, public route,
  encounter draft persistence, transcript persistence, or generated output.

## Suggested Files

Prefer a small web helper and private Studio component patch:

- `apps/web/lib/persona-encounter-contract.ts`
- `apps/web/lib/persona-encounter-contract.test.ts`
- `apps/web/components/studio/persona-workspace.tsx`
- `apps/web/app/studio/personas/[personaId]/page.tsx` if the page needs to
  pass readback into the home view
- `package.json` only to include the helper test in `test:studio-ui`

DAEDALUS may choose the nearest existing local pattern, but should keep the
patch owner-only, web-only, and readback-only.

## Explicit Non-Goals

Do not add:

- autonomous persona-to-persona chat, background conversations, scheduled
  encounters, agent loops, provider calls, multi-turn model calls, generated
  encounter text, or encounter simulation;
- encounter draft persistence, durable encounter transcripts, transcript
  archive entries, generated documents, generated comments, generated threads,
  generated public posts, storage buckets, or signed URLs;
- cross-owner encounters, public encounter pages, public encounter feeds,
  anonymous encounter participation, shareable encounter output, public
  encounter controls, public availability claims, moderation queues, reports, or
  takedown/retract flows in this slice;
- token-credit deductions, encounter billing, Stripe, Redis, Cloudflare, queues,
  workers, migrations, schema, API routes, or broad Studio/public UI redesign.

## Preflight Answers

1. Web-only helper/tests are sufficient for this unblock contract. Schema is
   not required until Station records consent, encounter runs, transcripts,
   revocations, or public/shareable output.
2. Same-owner consent is enough only for a future owner-only, non-public,
   owner-initiated runtime slice. Cross-owner behavior needs bilateral consent
   machinery before any implementation.
3. Mandatory future provenance labels: owner-authored setup, selected persona
   identities, model-generated turns, simulated text, public inputs, private
   inputs, archived sources, transcript state, and shareability.
4. Mandatory future stop/revoke controls: explicit owner start, visible stop,
   hard turn cap, no background continuation, no automatic retry loop, and
   revocation before persistence or sharing.
5. Mandatory future cost/rate-limit controls: pre-call estimate, owner
   attribution, plan eligibility, per-run cap, per-day cap, and fail-closed
   quota behavior.
6. Public/shareable output remains blocked until reporting, moderation queue
   semantics, takedown/retract behavior, and provenance labels exist.
7. Exclusions: no private Memory, Archive, Canon, Continuity, Integrity, source
   text, transcripts, provider settings, owner setup, raw ids, storage paths,
   credentials, visitor identity, or secret-shaped material in public readback.
8. Proof: focused helper tests, Studio UI test inclusion, typecheck, whitespace
   validation, diff-only scope/secret scans, and hosted owner-route visual
   rehearsal after ARGUS accepts implementation.

## Required Validation

DAEDALUS should run:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/persona-encounter-contract.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/persona-encounter-readiness.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/studio-navigation.test.ts
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

## ARGUS Review Gates

ARGUS should reject PR472A if it:

- creates encounter runtime, provider calls, generated text, transcript/draft
  persistence, storage, queue/worker, schema, migration, API route, billing,
  token-credit, public route, public control, cross-owner behavior, or broad UI;
- implies persona-to-persona encounters are available;
- stores or displays private Memory, Archive, Canon, Continuity, Integrity,
  owner setup, provider settings, credentials, storage paths, raw ids, source
  bodies, visitor identity, or secret-shaped material in public readback;
- treats same-owner consent as sufficient for cross-owner or public/shareable
  behavior.

## Hosted Rehearsal Requirement

If DAEDALUS implements PR472A and ARGUS accepts it, MIMIR should route ARIADNE
for a narrow hosted owner-route check:

- signed-in owner persona Studio home renders the encounter contract readback on
  desktop and 390px mobile;
- sampled signed-out public routes do not show encounter controls, generated
  encounter output, shareable pages, cross-owner controls, or availability
  claims;
- no horizontal overflow, clipped controls, private source text, provider
  details, credentials, raw ids, storage paths, or secret-shaped material appear
  in sampled UI.

# PR471 - Persona-to-Persona Encounters Preflight Result

Owner: ARGUS / A3

Date: 2026-06-29

Verdict: `ACCEPT_FOR_DAEDALUS`

Accepted lane:

```text
PR471A - Owner Encounter Readiness Gate
Owner: DAEDALUS / A2
```

## Decision

Station can safely open a first Persona-to-Persona Encounters slice only as an
owner-only readiness gate.

The first implementation must not create or imply autonomous persona chat,
background conversations, scheduled encounters, model-call loops, durable
encounter transcripts, cross-owner encounters, public encounter pages,
shareable encounter output, provider calls, billing/token-credit deductions,
Redis, Cloudflare, queues, workers, schema, migrations, API routes, or broad UI
scope.

The accepted slice is an honest setup/readiness surface in the private persona
Studio workspace. It should explain that persona-to-persona encounters are not
enabled yet and name the policy gates required before any future encounter
behavior exists.

## Accepted Product Shape

DAEDALUS may add an owner-only Persona Encounter readiness card to the private
persona Studio home.

Allowed readback:

- Encounters: not enabled.
- Autonomous/background conversations: not enabled.
- Provider calls and multi-turn model loops: not callable.
- Durable encounter transcripts and generated encounter output: not stored or
  generated.
- Cross-owner encounters: blocked until explicit bilateral consent,
  visibility, and revocation policy exists.
- Public or shareable encounter pages: blocked until moderation, reporting,
  and provenance policy exists.
- Provenance: required before any future output can distinguish owner-authored
  setup, model-generated turns, simulated text, public inputs, private inputs,
  and archived sources.
- Cost/rate-limit/plan enforcement: required before any provider-backed
  encounter call.

Allowed implementation shape:

- Web-only helper/readback copy and tests.
- Owner-only rendering on the private persona Studio surface.
- No new API route, database table, migration, storage bucket, provider
  adapter, queue, worker, billing path, token-credit behavior, public route, or
  encounter draft persistence.

## Suggested Files

Prefer a small web helper and private Studio component patch:

- `apps/web/lib/persona-encounter-readiness.ts`
- `apps/web/lib/persona-encounter-readiness.test.ts`
- `apps/web/components/studio/persona-workspace.tsx`
- `apps/web/app/studio/personas/[personaId]/page.tsx` if the page needs to
  pass readback into the home view
- `package.json` only to include the helper test in `test:studio-ui`

DAEDALUS may choose the nearest existing local pattern, but should keep the
patch owner-only and web-only unless a narrower existing helper requires
otherwise.

## Explicit Non-Goals

Do not add:

- autonomous persona-to-persona chat, background conversations, scheduled
  encounters, agent loops, multi-turn model calls, provider calls, or generated
  encounter content;
- encounter draft persistence, durable encounter transcripts, transcript
  archive entries, generated documents, generated comments, generated threads,
  or generated public posts;
- cross-owner encounters, public encounter pages, public encounter feeds,
  anonymous encounter participation, shareable encounter output, public
  encounter controls, or public availability claims;
- media behavior, voice/avatar behavior, uploads, storage buckets, signed URLs,
  token-credit deductions, media or encounter rate limits, Stripe, billing,
  Redis, Cloudflare, queues, workers, migrations, schema, or broad Studio/public
  UI redesign.

## Preflight Answers

1. Smallest honest slice: owner-only Persona Encounter readiness gate.
2. New schema/storage/transcript/queue/provider infrastructure: not required
   for PR471A; required before any actual encounter behavior.
3. Consent boundary: PR471A collects no consent. Future same-owner encounters
   still need explicit owner initiation and stop/revoke controls. Future
   cross-owner encounters need explicit bilateral consent, visibility, and
   revocation policy before any UI or runtime behavior.
4. Provenance: future encounters must label owner-authored setup, model output,
   simulated text, public inputs, private inputs, archived sources, and
   transcript visibility. PR471A only names this requirement.
5. Runaway prevention: PR471A makes no calls. Future behavior must be
   owner-initiated, bounded by explicit turn limits, non-background by default,
   rate-limited, cost-estimated, and stop-safe before any provider call.
6. Moderation/reporting: no public/shareable surface is accepted in PR471A.
   Future public output needs reporting, moderation queue semantics, and
   provenance labels first.
7. Exclusions: no private Memory, Archive, Canon, Continuity, Integrity, chat
   transcripts, provider settings, owner setup, source bodies, raw ids, storage
   paths, visitor identity, or secret-shaped material in any public readback.
8. Proof: focused helper tests, Studio UI test inclusion, typecheck, whitespace
   validation, diff-only scope/secret scans, and hosted owner-route visual
   rehearsal after ARGUS accepts implementation.

## Required Validation

DAEDALUS should run:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/persona-encounter-readiness.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/studio-navigation.test.ts
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

If DAEDALUS changes existing Studio UI helpers covered by broader scripts, run
the relevant existing Studio/UI tests too.

## ARGUS Review Gates

ARGUS should reject PR471A if it:

- creates any encounter runtime, provider call, generated text, transcript,
  storage, queue/worker, schema, migration, billing, token-credit, public route,
  public control, or cross-owner behavior;
- implies persona-to-persona encounters are available;
- stores or displays private Memory, Archive, Canon, Continuity, Integrity,
  owner setup, provider settings, credentials, storage paths, raw ids, source
  bodies, visitor identity, or secret-shaped material in public readback;
- adds broad Studio or public UI scope.

## Hosted Rehearsal Requirement

If DAEDALUS implements PR471A and ARGUS accepts it, MIMIR should route ARIADNE
for a narrow hosted owner-route check:

- signed-in owner persona Studio home renders the Persona Encounter readiness
  gate on desktop and 390px mobile;
- no public encounter controls, persona-to-persona chat claims, generated
  encounter output, or shareable encounter pages appear on sampled signed-out
  public routes;
- no horizontal overflow, clipped controls, private source text, provider
  details, credentials, raw ids, storage paths, or secret-shaped material appear
  in sampled UI.

# PR472A - Owner Encounter Consent / Provenance Contract Result

Owner: DAEDALUS / A2

Date: 2026-06-29

Status: Ready for ARGUS review

## Summary

DAEDALUS implemented the accepted PR472A slice as a private persona Studio
contract readback only.

The persona Studio home now renders an owner-only Encounter Contract panel. It
states that persona-to-persona encounters still have no runtime and names the
minimum consent, provenance, stop/revocation, cost, rate-limit, plan, and
moderation/reporting conditions required before any future provider-backed
encounter call, transcript, or sharing can exist.

## Implementation

Files changed:

- `apps/web/lib/persona-encounter-contract.ts`
- `apps/web/lib/persona-encounter-contract.test.ts`
- `apps/web/components/studio/persona-workspace.tsx`
- `apps/web/app/studio/personas/[personaId]/page.tsx`
- `package.json`

Contract readback:

- Consent scope: same-owner only for the next possible runtime slice.
- Cross-owner encounters: blocked until bilateral consent, visibility,
  revocation, and audit policy exists.
- Provenance labels: required for owner-authored setup, selected persona
  identities, model-generated turns, simulated text, public inputs, private
  inputs, archived sources, transcript state, and shareability.
- Stop/revoke controls: future runtime must be owner-initiated, manually
  stoppable, non-background by default, bounded by turn limits, and revocable
  before persistence or sharing.
- Cost/rate-limit/plan controls: future provider calls need cost estimates,
  owner attribution, per-run and per-day limits, and fail-closed quota behavior.
- Public/shareable output: blocked until reporting, moderation, takedown,
  retract, and provenance policy exists.

The new helper is included in `test:studio-ui` so the contract copy stays in
the normal Studio helper validation path.

## Non-Scope Confirmation

This patch does not add:

- encounter runtime, autonomous persona-to-persona chat, background
  conversations, scheduled encounters, agent loops, provider calls, multi-turn
  model calls, generated encounter text, or encounter simulation;
- encounter draft persistence, durable encounter transcripts, transcript
  archive entries, generated documents, generated comments, generated threads,
  generated public posts, storage buckets, or signed URLs;
- cross-owner encounters, public encounter pages, public encounter feeds,
  anonymous encounter participation, shareable encounter output, public
  encounter controls, public availability claims, moderation queues, reports, or
  takedown/retract flows;
- token-credit deductions, encounter billing, Stripe, Redis, Cloudflare,
  queues, workers, migrations, schema, storage, API routes, or broad Studio or
  public UI redesign.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/persona-encounter-contract.test.ts` | Pass | 3 tests passed; copy stays owner-only, readback-only, and names consent/provenance/stop/cost/public blockers. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/persona-encounter-readiness.test.ts` | Pass | 3 tests passed; encounter readiness readback remains bounded. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/studio-navigation.test.ts` | Pass | 10 tests passed; private Studio navigation remains bounded. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 153 tests passed, including the new encounter contract helper. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API replayed from cache; web typecheck ran. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Handoff

ARGUS should review PR472A against the preflight boundaries:

- owner-only rendering on the private persona Studio home;
- no encounter runtime, generated text, provider calls, transcript or draft
  persistence, storage, queue/worker, schema, migration, API route, billing,
  token-credit, public route, public control, cross-owner behavior, or broad UI;
- no implication that persona-to-persona encounters are available;
- no private Memory, Archive, Canon, Continuity, Integrity, owner setup,
  provider settings, credentials, storage paths, raw ids, source bodies,
  visitor identity, or secret-shaped material in public readback;
- same-owner consent remains explicitly insufficient for cross-owner or
  public/shareable behavior.

If ARGUS accepts this implementation, MIMIR should decide whether to route the
narrow hosted owner-route visual rehearsal described in
`docs/roadmap/PR472_PERSONA_ENCOUNTER_CONSENT_PROVENANCE_PREFLIGHT_RESULT.md`.

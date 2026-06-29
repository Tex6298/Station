# PR472A - Owner Encounter Consent / Provenance Contract Closeout

Owner: MIMIR / A1

Date: 2026-06-29

Status: Closed

## Decision

MIMIR closes PR472A as accepted.

The lane ran through:

- PR472 ARGUS preflight;
- PR472A DAEDALUS implementation;
- PR472A ARGUS review and owner-readback render guard;
- PR472A ARIADNE hosted owner-route visual rehearsal.

## Accepted Product Shape

- The private persona Studio home can show an owner-only Encounter Consent /
  Provenance contract readback.
- The contract says persona-to-persona encounters still have no runtime.
- The contract limits the next possible runtime slice to same-owner,
  owner-initiated encounters.
- Cross-owner encounters remain blocked until bilateral consent, visibility,
  revocation, and audit policy exists.
- Future generated encounter output must carry provenance labels.
- Future runtime must be explicitly started, manually stoppable, turn-capped,
  non-background by default, cost-estimated, owner-attributed, rate-limited, and
  plan-gated before any provider call can happen.
- Public/shareable output remains blocked until reporting, moderation,
  takedown/retract, and provenance policy exists.

## Boundaries Kept

No encounter runtime, provider calls, generated text, transcript/draft
persistence, storage, queue/worker behavior, schema, migrations, API routes,
billing/token-credit behavior, public routes, public controls, cross-owner
behavior, Redis, Cloudflare, or broad Studio/public redesign was added.

## Validation Accepted

- DAEDALUS implementation:
  `docs/roadmap/PR472A_OWNER_ENCOUNTER_CONSENT_PROVENANCE_CONTRACT_RESULT.md`.
- ARGUS review:
  `docs/roadmap/PR472A_OWNER_ENCOUNTER_CONSENT_PROVENANCE_CONTRACT_REVIEW_RESULT.md`.
- ARIADNE hosted rehearsal:
  `docs/roadmap/PR472A_OWNER_ENCOUNTER_CONSENT_PROVENANCE_CONTRACT_REHEARSAL_RESULT.md`.

Accepted validation included:

- focused encounter contract tests;
- encounter readiness tests;
- Studio navigation tests;
- `test:studio-ui`;
- `typecheck`;
- whitespace validation;
- diff-only scope and secret-shaped-pattern scans;
- hosted owner Studio desktop and 390px mobile visual proof;
- signed-out public persona and public Space/document samples with no encounter
  controls, generated output, shareable pages, cross-owner controls, anonymous
  encounter controls, or availability claims.

## Next Runtime Question

The consent/provenance contract has been accepted. The next meaningful question
is whether Station can safely open a smallest same-owner, owner-initiated
encounter runtime slice using existing provider/cost/rate-limit guardrails, or
whether one more concrete unblock is required.

MIMIR opens:

`docs/roadmap/PR473_OWNER_INITIATED_ENCOUNTER_RUNTIME_PREFLIGHT_ARGUS.md`

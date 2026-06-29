# PR472A - Owner Encounter Consent / Provenance Contract Review Result

Owner: ARGUS / A3

Date: 2026-06-29

Verdict: `ACCEPT`

## Decision

ARGUS accepts PR472A after a narrow review patch.

The implementation matches the accepted PR472 preflight lane: a private Studio
contract readback for future persona-to-persona encounter consent and
provenance rules. It does not create encounter runtime, generated text,
provider calls, draft or transcript persistence, public or cross-owner behavior,
billing, token-credit behavior, queues, workers, storage, schema, migrations,
API routes, or broad UI scope.

The readback honestly says persona-to-persona encounters still have no runtime
and names the minimum future gates: same-owner-only consent, blocked
cross-owner behavior, provenance labels, stop/revocation, cost/rate-limit/plan
controls, and public/shareable moderation/reporting blockers.

## ARGUS Patch

ARGUS found one owner-scope gap during review: the new panel was mounted on the
Studio persona home, while the existing `GET /personas/:id` endpoint can return
a public serializer for non-owner reads of public personas. The copy itself was
safe, but the PR472A claim is owner-only private Studio readback.

ARGUS added a narrow guard:

- `personaEncounterContractCanRenderForOwner(...)` requires the persona
  readback `ownerUserId` to match the authenticated viewer id.
- The Studio persona page renders `PersonaEncounterContractPanel` only through
  that guard.
- The contract helper test now rejects non-owner, missing-owner, and missing
  viewer readbacks.

## Validation

| Command / check | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/persona-encounter-contract.test.ts` | Pass, 4 tests. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/persona-encounter-readiness.test.ts` | Pass, 3 tests. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/studio-navigation.test.ts` | Pass, 10 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass, 154 tests. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass. |
| `git diff --check` | Pass. |
| `git diff --cached --check` | Pass. |
| Diff-only scope scan | Pass; matches are expected negative/readback copy only. |
| Diff-only secret-shaped-pattern scan | Pass; no hits. |

## Residual Risk

Hosted owner-route visual rehearsal has not run for PR472A. MIMIR should decide
whether to route ARIADNE for the narrow hosted check required by the PR472
preflight result:

- signed-in owner persona Studio home renders the contract on desktop and
  390px mobile;
- sampled signed-out public routes show no encounter controls, generated
  encounter output, shareable pages, cross-owner controls, availability claims,
  private source text, provider details, credentials, raw ids, storage paths, or
  secret-shaped material.

## Handoff

Wake MIMIR for closeout or hosted rehearsal routing.

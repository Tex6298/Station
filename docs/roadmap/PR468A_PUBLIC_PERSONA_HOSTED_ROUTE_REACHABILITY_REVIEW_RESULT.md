# PR468A - Public Persona Hosted Route Reachability Review Result

Owner: ARGUS / A3

Date: 2026-06-29

Verdict: `ARGUS_ACCEPTED_AFTER_PATCH`

## Summary

ARGUS reviewed the DAEDALUS PR468A route reachability patch against
`docs/roadmap/PR468A_PUBLIC_PERSONA_HOSTED_ROUTE_REACHABILITY_DAEDALUS.md`.

ARGUS made one narrow review patch:

- `publicPersonaOptionalRead` now maps every optional-read rejection to bounded
  public copy, not only timeout rejections.
- The web route helper test now proves a raw rejected error string is not shown
  to the visitor.

## Boundary Review

- Public persona readback, context-preview, events, and roulette are bounded by
  `PUBLIC_PERSONA_ROUTE_TIMEOUT_MS` and return
  `public_persona_route_unavailable` on slow or failed public read paths.
- The bounded API error response does not include raw owner ids, public slugs,
  source ids, stack traces, private source text, headers, cookies, credentials,
  prompts, or provider payloads.
- Missing, private, unsafe, or ineligible public slugs still return the existing
  public-safe not-found behavior.
- The public persona page now renders primary readback and chat availability
  without waiting for optional context-preview or public update reads.
- Optional preview/update failures now display bounded public copy even if the
  underlying rejected error contains raw internal text.
- PR468 remains narrow: anonymous chat is still limited to
  `station-replay-alpha-persona`.
- Owner disable, signed-in behavior for other public personas, no durable
  anonymous transcript or identity, public-source-only prompt/response,
  signed-in-only reporting, and owner-paid token usage remain unchanged.
- No Cloudflare, hosted runtime, queue, adapter, billing, Stripe, migration,
  provider/model-selection, private runtime context, or broad anonymous rollout
  scope was added.

## Validation

ARGUS reran the requested validation after the review patch:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 14 tests passed, including bounded unavailable responses for public readback, context-preview, events, and roulette when eligibility reads hang. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts` | Pass | 7 tests passed, including bounded optional-read timeout and raw rejection masking. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo typecheck passed for API and web. |
| `git diff --check` | Pass | CRLF normalization warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Residual Risks

- Hosted smoke was not rerun in this ARGUS pass. MIMIR should reroute ARIADNE
  for the hosted PR468 anonymous-chat rehearsal after this patch is pushed and
  deployed.

## Handoff

ARGUS accepts PR468A and wakes MIMIR for hosted rehearsal rerouting.

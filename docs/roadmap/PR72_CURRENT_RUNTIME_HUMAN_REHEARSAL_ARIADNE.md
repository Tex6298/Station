# PR72 Current Runtime Human Rehearsal - ARIADNE Result

Date: 2026-06-19
Agent: A4 / ARIADNE
Verdict: accepted

## Scope

ARIADNE rehearsed the current Railway runtime as a protected-alpha human tester.

Runtime checked:

- Web: `f830041df118c4e3e63cb1d9b5985e2ffb2121b7`
- API: `f830041df118c4e3e63cb1d9b5985e2ffb2121b7`
- Services: `@station/web`, `@station/api`
- Environment: Railway `production`

No credentials, tokens, cookies, owner IDs, persona IDs, checkout or portal
URLs, Stripe object IDs, private replay text, trace IDs, provider payloads, or
secret-shaped values were recorded.

## Public Story

Anonymous desktop and `390px` mobile checks passed for:

- `/`
- `/discover`
- `/space/station-replay-alpha`
- `/space/station-replay-alpha/documents/dce9dcdc-067e-488b-baae-b09c0541077f`
- `/forums/documents-and-codexes/ce8c1f39-41ec-42a0-9cce-1cf87e10cabf`
- `/developer-spaces/station-replay-dev-alpha`

The public story still reads as a works-led Space, public document, linked forum
discussion, and public Developer Space observatory. Anonymous public API reads
returned `200` for the Space, public document, document discussion lookup,
linked thread, Discover feed, and public Developer Space.

No public route exposed private Studio, Memory, Continuity, Integrity, Archive
import, owner Developer Space manage controls, current/rotate/generated key
controls, billing controls, raw provider markers, or secret-shaped visible text.

## Signed Owner Session

The replay owner signed in through the product login page using ignored local
credentials. `/auth/me` equivalent session state was verified by API, and the
signed session persisted across:

- `/studio` load;
- signed page refresh;
- navigation away to Discover and back to Studio.

Signed desktop checks passed for Studio dashboard, replay persona home, Memory,
Continuity, persona Archive/files, Integrity, Global Archive, Station Assistant,
Developer Space manage, and Billing.

Signed `390px` mobile checks passed for the persona home, Memory, Continuity,
Archive/files, Station Assistant, Developer Space manage, and Billing. No
document-level horizontal overflow, offscreen primary controls, or visible
application/auth errors appeared in the audited mobile routes.

## Runtime And Billing

One bounded replay-safe chat prompt was submitted during the live browser run.
The stream was accepted, and a follow-up role/count-only readback confirmed the
latest active conversation had assistant-after-user completion. Prompt and reply
content were not recorded.

Billing readback reported the signed owner as active on the expected tier, and
the billing page showed current-plan state and plan controls. Hosted Stripe
Checkout/Portal URLs were not opened or recorded; no customer, subscription,
session, or portal IDs were captured.

The current runtime readiness remains the PR71 truth: Gemini
`station_free_1536` embeddings, NVIDIA platform chat, Stripe test
billing/prices, and Upstash operational cache are configured. Upstash is still
cache with inline fallback, not a worker queue or memory truth.

## Verdict

Pass. PR72 can close.

No DAEDALUS repair lane is needed from this rehearsal. The next move should be a
MIMIR product sequencing decision or a deliberate protected-alpha demo pause;
do not open Redis, Cloudflare, provider migration, parser/OAuth, worker, hosted
runtime, Project, billing, DexOS, broad UI, or infrastructure work without a new
concrete route-level defect.

## Validation

- Public Railway health/deployment preflight
- Anonymous public API route reads
- Signed replay-owner API session/persona/billing/developer-space reads
- Product login/session persistence browser pass
- Chrome/CDP desktop public and signed route rehearsal
- Chrome/CDP `390px` public and signed route rehearsal
- Bounded chat stream acceptance plus role/count-only completion readback
- `node --check scripts/tmp-pr72-current-runtime-human-rehearsal.mjs`
- `PR72_REUSE_LATEST_CHAT=1 node scripts/tmp-pr72-current-runtime-human-rehearsal.mjs`
- `git diff --check`

The temporary local rehearsal helper was removed before commit.

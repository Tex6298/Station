# PR159 - Hosted Product Walkthrough Evidence

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: ARIADNE runs the human-eye hosted walkthrough.
Status: reviewed by ARIADNE on 2026-06-21; DAEDALUS defects found

## Why This Lane

PR158 reconciled the backend/product roadmap and ARGUS accepted that no backend
implementation blocker is currently open from the plan. The next useful signal
should therefore come from fresh hosted replay/product evidence, not stale
roadmap text.

This lane asks ARIADNE to run the current Railway staging product as a human
would, using the accepted replay scope and recording concrete defects or a clean
closeout. If she finds implementation defects, she should wake DAEDALUS with
the exact route/control/API symptom. If the run is clean enough, she should wake
MIMIR with the product-evidence verdict.

## Goal

Produce one current hosted walkthrough evidence packet that answers:

- does the accepted staging-alpha product path still hold on the deployed app;
- which visible flows pass, fail, or remain honestly caveated;
- whether any specific DAEDALUS implementation lane is justified now.

## Hosted Target

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`

ARIADNE should verify deployment identity first through public health/
deployment endpoints and record only sanitized status, branch, commit, ready,
and service fields.

## Walkthrough Scope

ARIADNE should use hosted human routes, not local mocks, unless she explicitly
records why hosted access is unavailable.

Cover:

- signed-out first impression: landing/front door and Discover;
- public chain: Discover/feed or public entry point -> public Space/public
  work -> public document -> linked forum discussion where available;
- signed-in replay owner basics: session restore, Studio entry, persona
  selection;
- Memory: saved Memory, lifecycle/supersession control visibility, runtime
  explanation/readback, no raw ids/secrets;
- Continuity: continuity as its own owner-visible stop, not only runtime
  context counts;
- Archive: archive trust/import/readback/export surfaces, including honest
  empty/thin/error states;
- Developer Space: public observatory and owner manage/evidence surfaces, with
  methodology/field-log storytelling caveats if still thin;
- Billing: read current status and visible actions only; do not record Checkout
  URLs, Stripe IDs, customer/subscription IDs, or webhook data. Open hosted
  Checkout only if the route is clearly test-mode safe and the run can avoid
  committing sensitive URLs.

## Defect Rules

Treat these as actionable defects if observed:

- visible buttons or controls that look live but do not navigate, mutate state,
  show disabled/preview affordance, or explain why unavailable;
- route chains that dead-end unexpectedly;
- auth/session persistence failures that cannot be explained by redeploy or
  explicit sign-out;
- public/private visibility confusion;
- raw ids, tokens, URLs, provider payloads, prompts, Checkout URLs, Stripe IDs,
  customer/subscription IDs, owner/persona/source IDs, or private corpus text
  visible in the UI;
- desktop or 390px mobile horizontal overflow or overlapping controls.

## Non-Scope

ARIADNE should not:

- change code or docs beyond her evidence note;
- mutate billing state unless the test-mode path is explicitly safe and needed
  for the walkthrough;
- retry imports or replay seeds unless the route itself prompts it;
- open Redis, Cloudflare, provider, worker, or broad UI redesign lanes by
  assumption;
- print secrets, cookies, tokens, raw IDs, private corpus text, Checkout URLs,
  or webhook payloads.

## Evidence Output

Update this doc or create a tiny companion note with:

- deployment identity checked;
- routes covered;
- pass/fail/caveat table;
- concrete defects with route, control, expected behavior, actual behavior, and
  whether DAEDALUS should fix;
- whether ARGUS is needed before DAEDALUS, if the defect touches privacy,
  billing, auth/session, or owner scoping;
- recommended next wakeup.

## Handoff

If concrete implementation defects are found:

- wake DAEDALUS with exact defects and keep scope narrow.

If no implementation defect is found:

- wake MIMIR with a concise product-evidence verdict and any honest caveats.

## ARIADNE Hosted Walkthrough Evidence

Measured on 2026-06-21 against hosted Railway.

Deployment identity:

- API `/health/deployment`: HTTP 200, `ready:true`, `@station/api`, `main`,
  commit `508b4acc2dbe`.
- Web `/health/deployment`: HTTP 200, `ready:true`, `@station/web`, `main`,
  commit `508b4acc2dbe`.

Method:

- Ran a hosted Playwright walkthrough against the public web app and API.
- Used UI sign-in for the replay owner; credentials, cookies, tokens, and raw
  private text were not recorded.
- Desktop viewport: 1440x1000.
- Mobile viewport: 390x900.
- Billing actions were inspected but not clicked, to avoid generating or
  recording Stripe Checkout or portal URLs.
- No replay data, billing state, imports, exports, Developer Space keys,
  documents, forums, Redis, Cloudflare, provider config, workers, or cache state
  were mutated.

Routes covered:

| Surface | Routes / states | Result |
| --- | --- | --- |
| Signed-out public entry | root and Discover | HTTP 200, expected public copy visible, no horizontal overflow, no visible secret/Stripe/Checkout-shaped values. |
| Public chain | Discover -> public Space -> public document -> linked forum discussion | Shell routes returned HTTP 200 and linked route chain was navigable. Defect below: public document triggered a sanitized API 401. |
| Developer Space public | public directory and public observatory | HTTP 200, observatory/evidence copy visible, no horizontal overflow, no visible raw ids or secret-shaped values. |
| Sign-in/session | login through hosted UI, Studio reload | UI login succeeded and Studio reload preserved signed-in state. |
| Studio/persona | Studio dashboard and persona workspace | HTTP 200, no horizontal overflow. Defect below: persona workspace runtime context exposes visible UUID-shaped values. |
| Memory | owner Memory page, runtime explanation, Saved Memory, Supersession controls | HTTP 200, expected controls visible, no horizontal overflow. Defect below: Saved Memory cards expose visible UUID-shaped values. |
| Continuity | owner Continuity page | HTTP 200, Continuity Trust, Runtime Continuity, and Continuity Timeline visible; no horizontal overflow or raw-id scan hit. |
| Archive/export | persona Archive/files/export and global Archive | Persona Archive/export passed. Defect below: global Archive summaries expose visible UUID-shaped values. |
| Developer Space owner | owner directory and manage page | HTTP 200, create/manage/evidence/ingestion surfaces visible; no horizontal overflow or raw-id scan hit. |
| Billing | status and visible plan actions | HTTP 200, current plan and available plans visible; no Checkout URL or Stripe/customer/subscription id visible. Actions were not clicked. |
| Mobile | root, Discover, Studio, Billing, Memory, Continuity, Archive/export, Developer Space manage at 390px | All returned HTTP 200 and no document-level horizontal overflow was detected. Defect below repeats on mobile Memory. |

Defects:

| Route / surface | Symptom | Why it matters | Recommended owner |
| --- | --- | --- | --- |
| Signed-out public document chain | Browser saw an API HTTP 401 to `/documents/:documentId` while walking Discover -> public document. The page shell returned HTTP 200, but the public document route still made an unauthenticated document API request that rejected. | This is a public/private visibility boundary symptom and could make the public document route depend on fallback behavior instead of the intended public read path. | DAEDALUS should inspect the public document API/read path; ARGUS should review after patch because this touches visibility/auth boundaries. |
| `/studio/personas/:personaId` persona workspace | Visible UUID-shaped values appeared in the Runtime Context source list and compiled prompt preview area. The diagnostic located them in the `Runtime Context` section, `studio-runtime-source` entries, and the preformatted prompt preview. | Owner runtime context readback should explain source selection without surfacing raw ids or private corpus identifiers as visible UI text. | DAEDALUS should redact or label UUID-shaped source text in runtime readback surfaces; ARGUS should review privacy/redaction behavior. |
| `/studio/personas/:personaId/memory` Memory page | Visible UUID-shaped values appeared in Saved Memory item cards on desktop and mobile. The diagnostic located them inside `Saved Memory` / `studio-item-card` text. | Saved Memory cards should not display raw id-shaped source text, even in owner-only Studio. | DAEDALUS should sanitize Memory card summaries/titles or source-derived text before display; ARGUS should review privacy/redaction behavior. |
| `/studio/archive` Global Archive | Visible UUID-shaped values appeared in archive item summary text. The diagnostic located them in archive item article/paragraph text. | Global Archive is trust infrastructure; raw id-shaped text weakens the owner-facing explanation layer and can leak implementation-looking identifiers into the product surface. | DAEDALUS should sanitize Global Archive item summaries/readback; ARGUS should review privacy/redaction behavior. |

Non-defects and caveats:

- No desktop or 390px mobile document-level horizontal overflow was detected on
  the covered routes.
- No visible bearer token, cookie, API key, DB URL, provider payload, prompt
  body, Checkout URL, Stripe customer/subscription id, or webhook-shaped value
  was detected on the covered routes.
- Developer Space owner manage showed ingestion/evidence/key affordances, but
  no key rotation or ingest mutation was performed.
- Billing showed the current plan and visible actions. Actions were not clicked
  because that would create Stripe-hosted URLs outside this evidence lane.
- The raw UUID scan detects UUID-shaped visible text only; it does not print the
  matched values or surrounding private corpus text.

Validation:

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr159-hosted-product-walkthrough.spec.js --reporter=line --workers=1`
- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr159-uuid-diagnostic.spec.js --reporter=line --workers=1`
- `git diff --check`
- `git diff --cached --check`

Recommendation:

- Wake DAEDALUS for a narrow PR159 follow-up fixing the public document API
  401 and owner-visible UUID redaction across runtime context, Saved Memory,
  and Global Archive readback.
- ARGUS should review after DAEDALUS because the defects touch visibility,
  auth/public-read behavior, and privacy/redaction boundaries.

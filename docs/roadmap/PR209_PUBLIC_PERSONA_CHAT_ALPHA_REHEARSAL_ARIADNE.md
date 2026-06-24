# PR209 Public Persona Chat Alpha Rehearsal - ARIADNE

Date opened: 2026-06-24
Agent: A4 / ARIADNE
Opened by: A1 / MIMIR
Status: accepted after PR210 repair

## Frame

PR208 is accepted. Station now has its first bounded public provider-call path:
signed-in public persona chat alpha.

This lane is not a redesign and not an API review. It is a human rehearsal:
use the deployed Station route the way a visitor or signed-in user would, then
report whether the experience feels coherent, truthful, and safe.

If the deployed app is stale or the hosted seed does not expose an enabled
public-chat persona, wake MIMIR with the exact blocker. Do not guess around a
missing deployment or missing seed.

## Target

Rehearse the signed-in public persona chat alpha on the deployed Railway web
surface after PR208 is present.

Primary URL:

```text
https://stationweb-production.up.railway.app
```

Expected route family:

```text
/discover
/spaces/:slug
/personas/:publicSlug
```

Use the current hosted public persona if its slug differs from examples below.

## Required Rehearsal

1. Deployment freshness
   - Confirm the hosted web is fresh enough to include PR208 behavior.
   - If a visible health/deployment route exists, record what it reports.
   - If staging is stale, stop the rehearsal and wake MIMIR with that exact
     blocker.

2. Public chain
   - Start as a normal human from `/`.
   - Move through `/discover`.
   - Find a public Space or public persona route.
   - Confirm public documents and linked discussion routes are discoverable
     enough for a visitor to understand why public chat has sources.
   - Do not require private owner routes for the public chain.

3. Signed-out and disabled states
   - As signed out, public persona readback should remain visible.
   - Public context/source preview should remain visible.
   - If public chat is owner-disabled, the page must show a quiet disabled
     state, not a misleading sign-in prompt or a broken composer.
   - If public chat is enabled, signed-out visitors should understand sign-in is
     required before chatting.

4. Signed-in enabled state
   - If an enabled public-chat persona is available, sign in and send one short
     message that can be answered from public persona/source material.
   - Confirm the answer frames itself as public-source-only.
   - Confirm the page does not imply private memory, archive, continuity, canon,
     integrity, owner setup, or owner BYOK settings were used.
   - Confirm no durable visitor transcript claim appears.

5. Error and rate-limit states
   - If provider unavailable, owner quota blocked, rate limited, or rate-limit
     infrastructure unavailable states appear, verify the copy is legible and
     public-safe.
   - Do not force provider failures if the happy path works; record only what a
     human actually sees.

6. Report flow
   - Check the public persona report control/state.
   - The result should be a safe confirmation or safe error.
   - The UI must not reveal raw persona ids, owner ids, reporter ids, provider
     traces, database errors, or private context.

7. Desktop and mobile
   - Rehearse at a desktop viewport.
   - Rehearse at a narrow mobile viewport around 375px wide.
   - Check that visible controls are reachable, text does not overlap, and the
     chat/source/report states do not feel like placeholder UI.

## Defects To Name Exactly

Wake DAEDALUS only if you find a concrete code/product defect such as:

- stale or missing route after a fresh deploy;
- public chat enabled state cannot be reached despite seed/config saying it
  should be enabled;
- signed-out disabled state is misleading;
- enabled chat sends or displays private-source claims;
- dead controls, broken buttons, or unhandled errors;
- raw ids, database errors, owner/provider details, or private context visible;
- mobile layout overlap or inaccessible controls.

Wake ARGUS only if the defect is primarily privacy/security/overclaim risk.

Wake MIMIR if the result is pass, if the environment is stale/missing seed, or
if the next slice is a sequencing decision rather than a direct patch.

## Output

Return one of:

```text
PASS
BLOCKED: stale deployment
BLOCKED: missing enabled public-chat seed
FAIL: product/code defect
```

Include:

- route(s) tested;
- signed-out result;
- signed-in result, if available;
- desktop/mobile notes;
- public-source/privacy verdict;
- exact next wakeup target and reason.

## Wakeup

When complete, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE rehearsed PR209 public persona chat alpha on the deployed route.
Verdict:
- PASS / BLOCKED / FAIL.
Task:
- Close PR209 or route the smallest concrete follow-up to DAEDALUS or ARGUS.
```

## ARIADNE Result - 2026-06-24

Verdict:

```text
FAIL: product/code defect
```

Additional environment blocker:

```text
BLOCKED: missing enabled public-chat seed
```

Routes and checks:

- Web `/health/deployment` and API `/health/deployment` both reported the
  deployed runtime at `fbef874`, branch `main`, ready `true`, so this was not a
  stale-deploy stop.
- `/discover` and `/space/station-replay-alpha` were reachable as public
  visitor routes.
- `/spaces/station-replay-alpha` API returned a public Space with public
  documents and one public persona card.
- The seeded persona card for `station-replay-alpha-persona` reported
  `publicChat.enabled: false`, so the signed-in enabled chat state could not be
  rehearsed on hosted data.
- `/personas/public/station-replay-alpha-persona/context-preview` returned a
  public-safe preview with profile-only source count and excluded private
  buckets: memory, archive, canon, continuity, integrity, owner profile, and
  provider settings.
- `/personas/public/station-replay-alpha-persona` returned 404.
- The browser route `/personas/station-replay-alpha-persona` therefore rendered
  `Public persona not found.` instead of the signed-out public persona readback,
  disabled public-chat state, and visitor-safe context preview.

Signed-out result:

- Not accepted. The public Space card is discoverable, but following it lands
  on a public persona error state. This violates the required readback path:
  public persona readback and context/source preview should remain visible while
  signed out.

Signed-in result:

- Not rehearsed. Hosted seed has no enabled public-chat persona. ARIADNE did
  not force a private owner route or mutate staging to manufacture the state.

Desktop/mobile:

- Desktop and 375px mobile public Space route reached the persona card without
  document-level overflow.
- Desktop and mobile persona route showed the same `Public persona not found.`
  failure. No overlap was observed, but the route is not a usable public chat
  rehearsal surface.

Public-source/privacy verdict:

- The context-preview API path stayed public-safe and named excluded private
  buckets.
- The visible persona page did not leak private data or raw ids; it failed
  closed as a generic not-found page.
- Because the readback route fails while preview succeeds, the next pass should
  inspect the deployed public persona profile dependency on `publicChat` /
  `public_chat_enabled` before repeating the human rehearsal.

Validation:

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr209-public-persona-chat-rehearsal.spec.js --reporter=line --workers=1`
  passed with 2 hosted browser/API checks.

Next wakeup:

- Wake MIMIR. This needs a sequencing decision: route a small DAEDALUS patch or
  staging schema/seed repair for the failed public persona readback, then expose
  one enabled public-chat persona seed before ARIADNE repeats PR209.

## MIMIR Routing

MIMIR routed this to DAEDALUS as PR210 on 2026-06-24.

PR209 should not be closed as product-accepted yet. Rerun this same rehearsal
after PR210 proves:

- hosted migration `056_public_persona_chat_alpha.sql` is present or applied;
- `/personas/public/station-replay-alpha-persona` returns public persona
  readback;
- `/personas/public/station-replay-alpha-persona/context-preview` still returns
  public-safe preview;
- the staging replay seed exposes exactly one enabled public-chat persona for
  signed-in alpha rehearsal.

## ARIADNE Rerun - 2026-06-24

Verdict:

```text
PASS
```

Routes and checks:

- Web `/health/deployment` and API `/health/deployment` both reported
  deployment `6e8a753`, branch `main`, ready `true`.
- `/personas/public/station-replay-alpha-persona` returned public persona
  readback with `publicChat.enabled: true`.
- `/personas/public/station-replay-alpha-persona/context-preview` returned one
  public profile source and explicit private-bucket exclusions.
- `/spaces/station-replay-alpha` returned a public Space with public documents,
  discussion-linked documents, and a routeable public persona card.
- Browser route `/personas/station-replay-alpha-persona` loaded the public
  readback and no longer rendered `Public persona not found.`

Public chain:

- Starting at `/`, the browser reached `/discover`.
- Discover exposed the Station Replay Alpha material through visible public
  document cards. From a public document route, the breadcrumb linked back to
  `/space/station-replay-alpha`, and the Space linked to the public persona.
- The public document route also exposed its linked forum discussion route. This
  is sufficient for PR209's source/discussion discoverability check, though a
  future Discover UX lane may still want a more direct Space/persona affordance.

Signed-out result:

- Passed. The public persona page shows the persona name, public visibility
  readback, public-source-only chat framing, a sign-in prompt for enabled
  signed-in alpha chat, and the visitor-safe context preview.
- The signed-out page does not show a broken composer or misleading disabled
  state.

Signed-in result:

- Passed. Signing in with the replay owner account exposed the composer.
- A short public-source question returned a reply under the persistent
  public-source-only chat copy.
- The reply cited the public persona profile source and stated that no other
  sources shaped the persona.
- The page did not claim private memory, archive, continuity, canon, integrity,
  owner setup, BYOK/provider settings, or durable visitor transcript use.

Report/error result:

- Passed. The report control was reachable after the chat reply and returned
  `Report already open.`, a safe duplicate state.
- No provider, database, raw id, owner id, reporter id, or private-context error
  was visible.

Desktop/mobile:

- Desktop signed-out and signed-in states were legible.
- At 375px, signed-out readback, sign-in prompt, signed-in composer, preview
  controls, counts, source card, and excluded private-bucket copy fit without
  document-level overflow.
- Full-page screenshots were inspected locally and not committed.

Public-source/privacy verdict:

- Accepted for this PR. The route preserves the distinction between public
  profile/readback, public chat, and excluded private Station buckets.
- The signed-in alpha interaction feels bounded and operational rather than a
  private continuity/persona claim.

Validation:

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr209-public-persona-chat-alpha.spec.js --reporter=line --workers=1`
  passed with 3 hosted browser/API checks.

Next wakeup:

- Wake MIMIR to close PR209 after the PR210 repair rerun. No DAEDALUS or ARGUS
  patch is requested from this pass.

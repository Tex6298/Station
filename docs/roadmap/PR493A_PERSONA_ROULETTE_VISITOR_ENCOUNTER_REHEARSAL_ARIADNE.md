# PR493A - Persona Roulette Visitor Encounter Hosted Rehearsal

Date: 2026-07-05

Owner: ARIADNE / A4

State: OPEN_HOSTED_REHEARSAL

## Context

ARGUS accepted PR493A without a review patch:

`docs/roadmap/PR493A_PERSONA_ROULETTE_VISITOR_ENCOUNTER_REVIEW_RESULT.md`

Implementation record:

`docs/roadmap/PR493A_PERSONA_ROULETTE_VISITOR_ENCOUNTER_RESULT.md`

PR493A adds a protected-alpha visitor encounter at:

`/discover/roulette`

The route draws candidates through:

`GET /personas/public/roulette?limit=1&chatMode=anonymous_alpha`

It sends visitor messages through the existing public persona chat route:

`POST /personas/public/:publicSlug/chat`

## Task

Run hosted rehearsal against:

`https://stationweb-production.up.railway.app`

Use desktop plus mobile widths `375px` and `390px`.

## Checks

1. Prove hosted web/API freshness at `d554f493` or later, or record the exact
   deploy-equivalent commit visible in the app.

2. Open `/discover/roulette` signed out on desktop, `375px`, and `390px`.

3. If an anonymous-eligible persona is drawn, prove:
   - the persona is safe and routeable;
   - the selected persona is not `station-replay-signed-in-alpha-persona`;
   - signed-out visitor messages can be sent;
   - visible visitor/assistant message text stays in the page encounter only;
   - the local five-message exhaustion UX stops further UI sends;
   - the CTA remains honest about the protected-alpha encounter;
   - storage contains only safe route-local slug/count/exhausted state, not
     transcript text, raw IDs, private prompts, provider payloads, cookies,
     headers, IP/user-agent, owner IDs, persona IDs, or secret-shaped values.

4. If no anonymous-eligible persona is available, prove the empty/unavailable
   state is bounded, does not spin forever, does not crash, and does not make a
   misleading launch claim.

5. Prove the signed-in fixture remains signed-in alpha and is not selected by
   anonymous roulette.

6. Prove replay alpha and the PR492 owner-gated fixture have no mode drift.

7. Prove Discover right-rail roulette cards and public persona pages remain
   compatible.

8. Confirm no public or storage readback exposes raw owner gate fields, owner
   IDs, persona IDs, source IDs, source bodies, provider payloads, tokens,
   cookies, headers, user agents, IPs, private prompts, transcript rows, or
   secret-shaped values.

9. Confirm this lane makes no claim for launch, voice, avatar, Salon/live chat,
   matching, billing, queue, worker, Redis, Cloudflare, or provider-architecture
   readiness.

## Return Values

Return one of:

```text
PASS_READY_FOR_PR493A_CLOSEOUT
DEPLOYMENT_WAIT
HOSTED_NO_ELIGIBLE_CANDIDATE_BOUNDED
HOSTED_ENCOUNTER_DEFECT
HOSTED_EXHAUSTION_DEFECT
PUBLIC_NO_LEAK_DEFECT
STORAGE_PRIVACY_FAIL
MOBILE_FIT_DEFECT
PRODUCT_DEFECT
```

Wake MIMIR with the return value and the concrete proof or blocker.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE

Summary:
- ARGUS accepted PR493A Persona Roulette Visitor Encounter without a review patch.
- PR493A adds /discover/roulette, anonymous_alpha roulette filtering, existing public persona chat reuse, component-memory visible messages, and safe slug/count/exhausted sessionStorage only.
Task:
- Run hosted desktop/375px/390px rehearsal using this document.
- Wake MIMIR with PASS_READY_FOR_PR493A_CLOSEOUT or the concrete blocker/defect.
```

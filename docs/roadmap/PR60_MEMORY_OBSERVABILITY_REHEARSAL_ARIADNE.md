# PR60 Memory Observability Rehearsal - ARIADNE Result

Date: 2026-06-19
Agent: A4 / ARIADNE
Verdict: Pass

## Runtime Checked

- Memory route: signed owner Studio persona Memory page
- Settings route: `https://stationweb-production.up.railway.app/settings`
- Web/API deployment identity:
  `a5940db9f03a7d4d709853e66de4c811b28d4273`
- Account mode: signed replay owner via local env
- Browser: Chrome/CDP
- Desktop viewport: `1365x900`
- Mobile viewport: `390x844`

No credentials, tokens, cookies, memory bodies, raw trace details, prompts,
completions, private archive excerpts, or raw provider payloads are included in
this result.

## Memory Page

ARIADNE rehearsed `Station Replay Persona`, which had eight memory items:

- initial state: `7` active, `1` rejected
- final state after the rehearsal: `7` active, `1` rejected

Signed desktop Memory passed:

- `Memory Briefing` rendered with the full lifecycle counter set:
  - `Active`: `7`
  - `Quarantined`: `0`
  - `Rejected`: `1`
  - `Expired`: `0`
  - `Superseded`: `0`
  - `Missing lifecycle`: `0`
- active memory cards displayed `Eligible for runtime context.`
- the rejected held-out memory displayed held-out runtime copy.
- active cards exposed `Reinforce`, `Quarantine`, and `Reject`.
- held-out cards exposed `Reinforce`, `Restore`, and another owner action.
- no document-level horizontal overflow and no offscreen controls.

Lifecycle action refresh passed:

- `Quarantine` on an active memory changed the card to `Quarantined`, changed
  runtime copy to held-out, and refreshed counters to:
  `Active 6`, `Quarantined 1`, `Rejected 1`.
- `Restore` returned that memory to active and counters to:
  `Active 7`, `Quarantined 0`, `Rejected 1`.
- `Reject` on the same active memory changed the card to `Rejected`, changed
  runtime copy to held-out, and refreshed counters to:
  `Active 6`, `Rejected 2`.
- `Restore` returned the page to the original state:
  `Active 7`, `Rejected 1`.

Signed mobile Memory passed at `390px`:

- the lifecycle counters, active runtime copy, held-out runtime copy, and
  action buttons remained visible;
- no document-level horizontal overflow and no offscreen controls.

## Settings AI Activity

Signed desktop and `390px` Settings passed:

- `AI Activity` rendered summary metrics:
  - `7-day traces`
  - `Errors`
  - `Tokens`
  - `Est. cost`
- `Recent traces` rendered six trace rows.
- each row exposed useful operational facts: source, status, duration, token
  total, estimated cost, and whitelisted operational metadata.
- the panel remained list-only; no trace-detail expansion was visible.
- no document-level horizontal overflow and no offscreen controls.

Privacy checks passed inside the AI Activity panel:

- no secret-shaped values such as `sk_live` or `sk_test`;
- no bearer/authorization/cookie/API-key/password/secret values;
- no URLs;
- no UUID-shaped private identifiers;
- no raw prompt, completion, provider payload, or archive-excerpt text.

## Recommendation

MIMIR can treat PR60 as accepted from ARIADNE UI rehearsal.

PR60 fits Station's owner-trust direction: Memory explains what can enter
runtime context, held-out memories explain why they are excluded, and Settings
AI Activity gives operational confidence without turning raw traces into a
public or overly exposed surface.

## Validation

- `curl.exe -fsS --max-time 30 https://stationweb-production.up.railway.app/health/deployment`
- `curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment`
- Signed owner API reads:
  - `GET https://stationapi-production.up.railway.app/personas`
  - `GET https://stationapi-production.up.railway.app/memory/persona/:personaId`
  - `GET https://stationapi-production.up.railway.app/memory/persona/:personaId/briefing`
  - `GET https://stationapi-production.up.railway.app/observability/summary`
  - `GET https://stationapi-production.up.railway.app/observability/traces?limit=6`
- Signed Chrome/CDP desktop Memory lifecycle readability check
- Signed Chrome/CDP `Quarantine`, `Restore`, `Reject`, and `Restore` lifecycle
  checks
- Signed Chrome/CDP `390px` Memory fit check
- Signed Chrome/CDP desktop and `390px` Settings AI Activity privacy/readability
  checks
- `node --check scripts/tmp-pr60-memory-observability-rehearsal.mjs`
- `node scripts/tmp-pr60-memory-observability-rehearsal.mjs`
- Temporary local probe script was removed before commit.

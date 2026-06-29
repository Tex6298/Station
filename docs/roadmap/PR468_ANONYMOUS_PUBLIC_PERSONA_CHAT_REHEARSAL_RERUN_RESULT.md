# PR468 - Anonymous Public Persona Chat Hosted Rehearsal Rerun Result

Owner: ARIADNE / A4

Date: 2026-06-29

Verdict:

```text
PASS
```

## Summary

The hosted PR468 anonymous public persona chat rerun passed after the accepted
PR468A route reachability patch.

Hosted web/API health were fresh at PR468A accepted commit `cd8cb866`, the
alpha public persona primary readback succeeded, optional public reads returned
bounded public responses, and the public page reached a usable signed-out state
without hanging behind optional reads.

Signed-out anonymous chat worked only for
`/personas/station-replay-alpha-persona` in the visible public-persona sample.
The response read as public-source-only, reported `transcriptStored=false`, and
did not persist a visitor transcript after refresh on desktop or 390px mobile.

## Route Reachability

| Route | Result | Notes |
| --- | --- | --- |
| `/personas/public/station-replay-alpha-persona` | Pass | Primary public persona readback returned HTTP 200. |
| `/personas/public/station-replay-alpha-persona/context-preview` | Pass | Optional public context preview returned HTTP 200. |
| `/personas/public/station-replay-alpha-persona/events` | Pass | Optional public update read returned HTTP 200. |
| `/personas/public/roulette?limit=20` | Pass | Public roulette returned HTTP 200. |
| `/personas/station-replay-alpha-persona` | Pass | Web page reached a usable public persona/chat state on desktop and 390px mobile. |

## Anonymous Chat Path

Signed-out desktop and 390px mobile checks passed:

- public persona, public chat, anonymous alpha, public-source-only, and signed-in
  report-boundary copy were visible;
- the anonymous chat form was available without requiring sign-in;
- the chat response returned successfully with `mode=anonymous_alpha` and
  `transcriptStored=false`;
- response sources were present and did not read as private Memory, Archive,
  Canon, Continuity, Integrity, owner setup, provider, or private-document
  sources;
- visible response/page text did not expose private source text, raw prompt
  history, provider payloads, credentials, stack traces, storage paths, visitor
  identity, or secret-shaped material;
- refreshing the page did not show a durable anonymous visitor transcript or
  retained prompt text.

## Deny And Signed-In Readback

The hosted public-persona sample only exposed
`station-replay-alpha-persona`, so there was no second visible public persona to
sample for deny/default behavior. This does not prove broad public-persona
anonymous denial beyond the existing ARGUS tests; it does confirm the hosted
visible public-persona surface did not show another anonymous chat target.

Signed-in replay-owner readback on the visible alpha route remained usable on
desktop and 390px mobile, and no other visible public persona was available to
check for accidental anonymous copy expansion.

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| Hosted web `/health/deployment` | Pass | Ready at PR468A accepted commit `cd8cb866`. |
| Hosted API `/health/deployment` | Pass | Ready at PR468A accepted commit `cd8cb866`. |
| Alpha primary public readback | Pass | HTTP 200. |
| Optional context preview/events/roulette reads | Pass | HTTP 200 for each sampled route. |
| Signed-out anonymous chat, desktop | Pass | Chat worked and did not persist after refresh. |
| Signed-out anonymous chat, 390px mobile | Pass | Chat worked and did not persist after refresh. |
| Public-source-only/source classification | Pass | Response sources were present and did not look private or owner-scoped. |
| Visible safety scan | Pass | No secret-shaped, raw-id, provider, storage-path, stack-trace, private-source, or visitor-identity text in sampled UI. |
| Layout scan | Pass | No horizontal overflow or clipped interactive controls on desktop or 390px mobile. |
| Other public persona deny sample | Not visible | No second public persona appeared in the hosted public sample. |
| Signed-in visible alpha readback | Pass | Replay-owner signed-in readback stayed usable on desktop and 390px mobile. |
| Temporary Playwright/Node hosted harness | Pass | Rerun completed with no defects. |
| `git diff --check` | Pass | Line-ending normalization warnings only. |

No `pnpm typecheck` was run because this result changes docs and agent state
only.

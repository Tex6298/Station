# PR494A - Companion Home Context Rail Hosted Rehearsal Result

Owner: ARIADNE / A4

Date: 2026-07-05

Verdict:

```text
PASS_READY_FOR_PR494A_CLOSEOUT
```

## Summary

ARIADNE completed the hosted PR494A rehearsal against production web/API using
the replay owner session from ignored local credentials.

The owner Studio flow reached the Station Replay Persona from `/studio`, then
loaded `/studio/personas/[personaId]` on desktop, `375px`, and `390px`. The
Companion Home Context Rail was visible, readable, did not overlap private chat,
and kept Runtime Context Preview separate.

## Hosted Freshness

- Web `/health/deployment` was ready on service `@station/web`, branch `main`,
  at commit `7d02d887`.
- API `/health/deployment` was ready on service `@station/api`, branch `main`,
  at commit `7d02d887`.
- Both commits satisfy the PR494A floor.

## Owner Readback

- Replay owner sign-in succeeded.
- Owner persona selection used the existing Station Replay Persona.
- Rail aggregate counts read from owner continuity only:
  - Memory: 19;
  - Inbox aggregate candidates: 12;
  - Timeline continuity records: 5;
  - Canon: 4;
  - Archive/files: 5 files / 3 archived chats;
  - Integrity: 5.
- No credential, token, cookie, owner id, persona id, raw row, prompt, compiled
  prompt, provider payload, source body, private excerpt, or secret-shaped value
  was recorded.

## Browser Proof

Temporary dependency-free Chrome/CDP proof passed for desktop, `375px`, and
`390px`:

- `/studio` loaded with the replay owner session;
- the persona home route was reached by clicking the Studio persona link;
- the rail showed Memory, Inbox, Timeline, Canon, Archive/files, Profile, and
  Integrity stops;
- exact rail link targets matched:
  - Memory -> `/studio/personas/[personaId]/memory`;
  - Inbox -> `/studio/personas/[personaId]/memory-inbox`;
  - Timeline -> `/studio/personas/[personaId]/continuity`;
  - Canon -> `/studio/personas/[personaId]/canon`;
  - Archive/files -> `/studio/personas/[personaId]/files`;
  - Profile -> `/studio/personas/[personaId]/edit`;
  - Integrity -> `/studio/personas/[personaId]/calibration`;
- Memory and Inbox remained separate;
- no stale `/conversations/candidates/inbox` or `source=all` link was present;
- the rail used aggregate count labels and owner-only boundary copy;
- Runtime Context Preview remained outside the rail as the selected-source and
  prompt review surface;
- the rail did not display selected source bodies, raw prompts, compiled
  prompts, provider payloads, tokens, cookies, headers, user agents, IP
  addresses, owner ids, persona ids, durable presence/mood/intimacy claims,
  hidden autonomy claims, or secret-shaped values;
- there was no desktop or mobile horizontal overflow;
- only the expected auth session storage existed, with no route-specific
  `localStorage` or `sessionStorage` writes.

## Private Chat No-Drift

- `PersonaChat` remained the private chat surface beside the rail.
- The return-to-thread card was not present for the current hosted replay state,
  so no return-card action was required.
- The archive/candidate panel was not visible before the chat check.
- Desktop send path was exercised once and settled into the accepted provider
  setup copy.
- No new placeholder controls appeared.

## Scope Preserved

PR494A did not replace the Studio shell, sidebar, topbar, `PersonaChat`,
Runtime Context Preview, APIs, prompts, retrieval, provider routing, public
chat, billing, queue, worker, Redis, Cloudflare, connectors, or Discern global
CSS. No launch/runtime/provider readiness claim entered scope.

Temporary harnesses, Chrome profiles, and screenshots were removed before
commit.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `node .tmp\pr494a-context-rail-rehearsal.mjs` | Pass | Hosted API freshness, replay-owner auth, `/studio` clickthrough, desktop/375px/390px rail fit/link/privacy checks, Runtime Context Preview separation, and desktop private-chat accepted provider setup copy passed. |
| `git diff --check` | Pass | No whitespace errors. |

## Next

MIMIR should close PR494A.

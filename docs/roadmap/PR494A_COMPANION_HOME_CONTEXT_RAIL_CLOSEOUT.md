# PR494A - Companion Home Context Rail Closeout

Owner: MIMIR / A1

Date closed: 2026-07-05

Status: Closed - hosted rehearsal passed

## Result

PR494A is closed as:

```text
PASS_READY_FOR_PR494A_CLOSEOUT
```

DAEDALUS implemented the scoped Companion Home Context Rail:

`docs/roadmap/PR494A_COMPANION_HOME_CONTEXT_RAIL_RESULT.md`

ARGUS accepted the implementation without a review patch:

`docs/roadmap/PR494A_COMPANION_HOME_CONTEXT_RAIL_REVIEW_RESULT.md`

ARIADNE passed hosted desktop, `375px`, and `390px` rehearsal:

`docs/roadmap/PR494A_COMPANION_HOME_CONTEXT_RAIL_REHEARSAL_RESULT.md`

## Accepted Product Truth

The owner persona home now has a compact companion context rail beside the
existing private chat surface.

Accepted behavior:

- the rail uses already-loaded persona fields and `persona.continuity`
  aggregate counts only;
- Memory, Inbox, Timeline, Canon, Archive/files, Profile, and Integrity link to
  accepted owner routes;
- Memory and Inbox remain separate, with Inbox on
  `/studio/personas/[personaId]/memory-inbox`;
- Runtime Context Preview remains the selected-source and prompt review
  surface outside the rail;
- `PersonaChat` source and behavior remain unchanged;
- no stale `/conversations/candidates/inbox`, `source=all`, copied Discern
  `StudioRightPanel`, shell/sidebar/topbar replacement, broad CSS import,
  public chat change, API change, prompt/retrieval/provider change, or runtime
  readiness claim entered scope.

## Hosted Proof

ARIADNE verified hosted web/API freshness at `7d02d887`.

Passed:

- replay owner sign-in and `/studio` to persona-home clickthrough;
- desktop, `375px`, and `390px` rail visibility, readability, and fit;
- exact route targets for all rail stops;
- Memory/Inbox separation and absence of stale candidate routes;
- aggregate-only rail readback;
- Runtime Context Preview separation;
- desktop private chat send path settling into accepted provider setup copy;
- no visible private source body, raw id, owner id, persona id, token, cookie,
  header, IP/user-agent, prompt, compiled prompt, provider payload, durable
  presence/mood/intimacy claim, hidden autonomy claim, or secret-shaped value.

## Not In PR494A

PR494A did not implement a copied Discern shell, broad visual reskin, copied
right panel, new chat backend, route-selected conversation loading, new API,
migration, provider routing, retrieval change, queue/worker, Redis, Cloudflare,
Stripe, billing, OAuth, connector, public chat behavior, voice/avatar behavior,
or launch/runtime claim.

## Next Lane

MIMIR is opening PR494B as a final hostile preflight for any remaining Discern
companion-home delta after PR485A-E and PR494A.

`docs/roadmap/PR494B_DISCERN_COMPANION_HOME_COMPLETION_PREFLIGHT_ARGUS.md`

ARGUS may accept one narrow remaining implementation slice, patch the boundary,
or close the Discern companion-home translation as complete if the remaining
reference material is duplicate, unsafe, or only visual skin.

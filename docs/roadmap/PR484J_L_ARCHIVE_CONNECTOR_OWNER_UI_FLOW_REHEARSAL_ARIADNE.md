# PR484J-L - Archive Connector Owner UI Flow Rehearsal

Owner: ARIADNE / A4

Date: 2026-06-30

Status: Open - human-eye rehearsal

## Context

ARGUS accepted PR484J-L after a narrow review patch:

`docs/roadmap/PR484J_L_ARCHIVE_CONNECTOR_OWNER_UI_FLOW_REVIEW_RESULT.md`

The accepted implementation adds one owner-visible Reddit saved-items connector
flow inside the existing persona Archive tab:

```text
/studio/personas/[personaId]/files
```

This is a visible owner workflow. MIMIR is routing it to ARIADNE before
closeout because tests and technical review do not prove the human route.

## Rehearsal Target

Use the current Station app at commit `35828f8d` or later if the hosted Railway
deployment has picked it up. If hosted freshness is unclear, record the
freshness state and use the best available local or hosted route evidence.

ARIADNE should rehearse desktop plus 375px and 390px mobile widths.

Primary route:

```text
/studio/personas/[personaId]/files
```

Use an owned persona with an Archive tab. If needed, navigate through Studio to
find the persona rather than relying on a fixed id.

## Human Flow

From a signed-in owner session:

1. Open Studio and choose an owned persona.
2. Open the persona Archive tab.
3. Find the Reddit saved-items connector panel.
4. Check the first visible state:
   - if connector readiness/config is unavailable, the panel must be disabled
     honestly and must not feel like a broken button;
   - if no Reddit credential exists, the panel should offer a setup action
     without exposing provider URL/code/state values;
   - if a source-ready credential exists, the next required action should be
     explicit and owner-driven.
5. Exercise only safe available actions:
   - setup/start OAuth may navigate to Reddit, but do not paste or expose OAuth
     codes, state handles, provider URLs, or tokens into notes;
   - if provider completion is not available, cancel or stop and record the
     bounded state;
   - if account lookup/source inventory/import steps are reachable, verify each
     step stays explicit and button-driven.
6. Confirm source inventory readback is saved-items-only and generic:
   `Reddit saved items`.
7. Confirm source preview and import-preview readbacks show aggregate metadata
   only.
8. Confirm final import is not automatic after OAuth and requires explicit owner
   confirmation.
9. Confirm a completed import, if reachable, reads as completed even if a
   follow-up Archive refresh fails.

## Required Checks

ARIADNE should classify each item as pass, pass with caveat, fail, or blocked:

- desktop layout fit and scanability;
- 375px mobile fit;
- 390px mobile fit;
- no text overlap, clipped controls, or unusable button rows;
- panel is discoverable from the persona Archive surface;
- unavailable config/readiness state is clear and not fake-live;
- OAuth start/callback states do not render codes, states, authorization URLs,
  tokens, cookies, provider payloads, raw ids, usernames, subreddit names, URLs,
  authors, saved item text, source bodies, fingerprints, SQL, stack traces, or
  secret-shaped values;
- source inventory is filtered to saved items only;
- all post-OAuth writes remain explicit owner actions;
- no broad Reddit categories, Discord source UI, social behavior, billing,
  Redis, Cloudflare, marketplace, queues/workers, pagination, recurring pulls,
  public writes, Canon, Continuity, or review candidates appear in the UI;
- callback fallback navigation and final-import success readback are honest.

## Output Requested

ARIADNE should write a result doc with:

- route and environment used;
- commit freshness;
- desktop/mobile verdicts;
- pass/caveat/fail/blocker list;
- any screenshots or artifact notes she uses;
- whether PR484J-L is ready for MIMIR closeout.

If the route passes, wake MIMIR with `PASS_READY_TO_CLOSE`.

If there is a product defect, wake MIMIR with the exact smallest repair lane to
open.

If the only blocker is missing external Reddit/OAuth config, state that clearly
and wake MIMIR with the config blocker rather than widening the lane.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepted PR484J-L Archive Connector Owner UI Flow after a narrow review patch.
- MIMIR is not closing the visible flow until ARIADNE rehearses it from the human-eye route.
- The flow lives in the owner persona Archive tab at /studio/personas/[personaId]/files and should expose one Reddit saved-items connector flow over accepted backend APIs only.
Task:
- Rehearse PR484J-L on desktop and 375px/390px mobile.
- Use current hosted Railway at commit 35828f8d or later if deployed; otherwise record freshness and use the best available local/hosted route evidence.
- Verify discoverability, fit, honest disabled/config states, saved-items-only generic copy, no secret/provider/source leakage, explicit owner-action gates, callback fallback navigation, and final-import success readback honesty.
- Do not expand scope into Discord content, broader Reddit categories, queues/workers, pagination, recurring pulls, billing, Redis, Cloudflare, marketplace, partner adapters, social behavior, public writes, Canon, Continuity, or review candidates.
- Wake MIMIR with PASS_READY_TO_CLOSE, the exact smallest repair lane, or a concrete config/freshness blocker.
```


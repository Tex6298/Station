# PR468 - Anonymous Public Persona Chat Hosted Rehearsal Result

Owner: ARIADNE / A4

Date: 2026-06-29

Verdict:

```text
PRODUCT_DEFECT_NEEDS_DAEDALUS
```

## Summary

The hosted web/API runtimes were fresh at the PR468 product commit
`00e618eb` and reported ready, but the public persona page/API routes did not
reliably complete. The signed-out hosted rehearsal could not reach the
anonymous public chat UI for `/personas/station-replay-alpha-persona`, so the
anonymous chat boundary could not be accepted.

This is not a stale deploy finding. The health endpoints were serving the
expected PR468 runtime. The defect is that the hosted public persona route path
hangs before the required anonymous-chat UX and privacy checks can run.

## Defect

Route:

```text
/personas/station-replay-alpha-persona
/personas/public/station-replay-alpha-persona
```

State:

```text
signed-out visitor
```

Viewport:

```text
desktop rehearsal start
```

Action:

- Open the public alpha persona page as a signed-out visitor.
- Check direct public persona API reachability before sending an anonymous
  public-source-only prompt.

Expected behavior:

- The page loads the public persona surface.
- The alpha persona exposes anonymous public chat without requiring sign-in.
- The direct public persona API route returns bounded public persona data or a
  bounded error.

Actual behavior:

- Browser navigation to `/personas/station-replay-alpha-persona` timed out
  before the page reached a usable rehearsal state.
- Direct requests to `/personas/public/station-replay-alpha-persona` timed out
  without a bounded response.
- A later public persona roulette probe also timed out, while web/API health
  remained ready and fresh at `00e618eb`.

## What Could Not Be Accepted

Because the public persona page/API route did not complete, ARIADNE could not
accept:

- signed-out anonymous chat availability on the alpha persona;
- public-source-only response behavior;
- absence of private Memory, Archive, Canon, Continuity, Integrity, owner setup,
  provider config, private documents, raw ids, source bodies, credentials, stack
  traces, or secret-shaped material in the response;
- no durable anonymous visitor transcript after refresh/navigation;
- signed-in public persona behavior readback;
- deny/default behavior on another visible public persona.

## Smallest Recommended Patch Lane

Open a narrow DAEDALUS patch for hosted public persona route reachability before
rerunning PR468:

- investigate why the hosted public persona API route hangs for the alpha
  persona instead of returning bounded public persona data or a bounded error;
- ensure the public persona page does not wait indefinitely behind that API
  path;
- keep the PR468 scope unchanged: one anonymous alpha persona only, no broad
  anonymous rollout, no billing/provider/Redis/Cloudflare/worker scope, no
  durable anonymous transcript, and no private-source expansion.

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| Hosted web `/health/deployment` | Pass | Ready at PR468 product commit `00e618eb`. |
| Hosted API `/health/deployment` | Pass | Ready at PR468 product commit `00e618eb`. |
| Signed-out browser navigation | Fail | `/personas/station-replay-alpha-persona` timed out before a usable page state. |
| Public persona API route | Fail | `/personas/public/station-replay-alpha-persona` timed out without a bounded response. |
| Public persona roulette API | Fail | Later roulette probe timed out without a bounded response. |
| Anonymous chat prompt/response | Not run | Blocked by route reachability before any prompt was sent. |
| Privacy boundary response scan | Not run | Blocked by route reachability before a response existed. |
| Transcript persistence check | Not run | Blocked by route reachability before chat UI was usable. |
| `git diff --check` | Pass | Line-ending normalization warnings only. |

No `pnpm typecheck` was run because this result changes docs and agent state
only.

# PR494A - Companion Home Context Rail Hosted Rehearsal

Date: 2026-07-05

Owner: ARIADNE / A4

State: OPEN_HOSTED_REHEARSAL

## Context

ARGUS accepted PR494A without a review patch:

`docs/roadmap/PR494A_COMPANION_HOME_CONTEXT_RAIL_REVIEW_RESULT.md`

Implementation record:

`docs/roadmap/PR494A_COMPANION_HOME_CONTEXT_RAIL_RESULT.md`

PR494A adds a compact owner-only Companion Home Context Rail beside the existing
private chat on:

`/studio/personas/[personaId]`

The rail uses already-loaded persona fields and `persona.continuity` aggregate
counts only. It does not replace `PersonaChat`, Runtime Context Preview, Studio
shell/sidebar/topbar, APIs, prompts, retrieval, provider routing, or public chat.

## Task

Run hosted rehearsal against:

`https://stationweb-production.up.railway.app`

Use desktop plus mobile widths `375px` and `390px`.

Use the existing hosted owner replay account/session and the seeded Station
Replay Persona or another already-owned hosted persona. If the owner route cannot
be reached because auth/session is unavailable, return `HOSTED_AUTH_BLOCKER`
with the exact blocker.

## Checks

1. Prove hosted web/API freshness at `7d02d887` or later, or return
   `DEPLOYMENT_WAIT` with the deployed commit shown by the app.

2. Open the owner persona home route through the human Studio flow:
   `/studio` -> persona -> `/studio/personas/[personaId]`.

3. Verify the Companion Home Context Rail is visible, readable, and does not
   overlap private chat on desktop, `375px`, or `390px`.

4. Verify the rail uses aggregate owner readback only:
   - long continuity brief or safe fallback;
   - style notes only if already present;
   - aggregate counts for Memory, Inbox, Timeline, Canon, Archive/files, and
     Integrity;
   - boundary copy naming owner-only links/counts and Runtime Context Preview
     separation.

5. Verify exact link targets:
   - Memory -> `/studio/personas/[personaId]/memory`
   - Inbox -> `/studio/personas/[personaId]/memory-inbox`
   - Timeline -> `/studio/personas/[personaId]/continuity`
   - Canon -> `/studio/personas/[personaId]/canon`
   - Archive/files -> `/studio/personas/[personaId]/files`
   - Profile -> `/studio/personas/[personaId]/edit`
   - Integrity -> `/studio/personas/[personaId]/calibration`

6. Verify Memory and Inbox remain separate. Memory must not open the inbox, and
   Inbox must not use stale `/conversations/candidates/inbox` or `source=all`.

7. Verify existing private chat behavior has no visible drift:
   - return-to-thread card still behaves as accepted;
   - send path still works or fails with the accepted provider/setup copy;
   - archive/candidate panel still appears only through existing chat behavior;
   - no new placeholder controls appear.

8. Verify Runtime Context Preview remains the selected-source and prompt review
   surface. The rail must not display selected source bodies, raw prompts, or
   compiled prompts.

9. Verify no public or storage readback exposes private source bodies, raw IDs,
   prompts, compiled prompts, provider payloads, tokens, cookies, headers,
   user agents, IP addresses, owner IDs, persona IDs, secret-shaped values,
   durable presence/mood/intimacy claims, or hidden autonomy claims.

10. Verify no broad Studio shell/sidebar/topbar replacement, public chat change,
    Discern global CSS import, runtime/provider/retrieval claim, billing,
    queue, worker, Redis, Cloudflare, or connector claim appears.

## Return Values

Return one of:

```text
PASS_READY_FOR_PR494A_CLOSEOUT
DEPLOYMENT_WAIT
HOSTED_AUTH_BLOCKER
RAIL_RENDER_DEFECT
ROUTE_TARGET_DEFECT
MEMORY_INBOX_SEPARATION_DEFECT
CHAT_DRIFT_DEFECT
RUNTIME_CONTEXT_BOUNDARY_DEFECT
PRIVACY_LEAK_DEFECT
MOBILE_FIT_DEFECT
PRODUCT_DEFECT
```

Wake MIMIR with the return value and the concrete proof or blocker.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE

Summary:
- ARGUS accepted PR494A Companion Home Context Rail without a review patch.
- PR494A adds a compact owner-only rail on /studio/personas/[personaId] using already-loaded persona fields and aggregate continuity counts.
- The rail links to Memory, Inbox, Timeline, Canon, Archive/files, Profile, and Integrity while keeping PersonaChat and Runtime Context Preview separate.
Task:
- Run hosted desktop/375px/390px rehearsal using this document.
- Wake MIMIR with PASS_READY_FOR_PR494A_CLOSEOUT or the concrete blocker/defect.
```

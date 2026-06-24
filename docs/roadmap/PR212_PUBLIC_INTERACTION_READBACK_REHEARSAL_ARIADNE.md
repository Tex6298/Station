# PR212 Public Interaction Readback Rehearsal - ARIADNE

Date opened: 2026-06-24
Agent: A4 / ARIADNE
Opened by: A1 / MIMIR
Status: open

## Frame

PR211 is accepted by ARGUS. It added owner/admin public persona interaction
readback without storing visitor transcripts or adding event-retention
analytics.

This lane is a human rehearsal. Use the deployed Railway web surface as a
signed-in owner and check whether the new owner-facing readback is visible,
understandable, and safe.

Do not redesign the page. Do not ask Marty to click through this manually.
Use the human routes and report what a human would experience.

## Target

Primary deployed URL:

```text
https://stationweb-production.up.railway.app
```

Primary owner route family:

```text
/studio
/studio/personas/:personaId
```

Use the staging replay persona if available:

```text
Station Replay Persona
```

Expected public persona:

```text
station-replay-alpha-persona
```

## Required Rehearsal

1. Deployment freshness
   - Confirm web/API deployment health is fresh enough to include PR211/ARGUS
     patch `ca4e8c9` or later.
   - If staging is stale, stop and wake MIMIR with the exact deployed commit(s).

2. Owner Studio path
   - Sign in as the replay owner account available to your environment.
   - Start at `/studio`.
   - Open `Station Replay Persona`.
   - Confirm the owner persona home includes a public interaction/readback
     section or cards.

3. Public interaction readback
   - Confirm the readback communicates:
     - public route state;
     - public chat enabled/disabled state;
     - persona report count/status summary;
     - owner privacy flags or equivalent copy explaining what is not shown.
   - Confirm it does not claim per-persona usage analytics if the repo does not
     store that attribution yet.
   - Confirm it does not imply visitor transcripts are stored.

4. Public/private boundary
   - Check visible UI and any fetched owner persona payload you inspect.
   - Fail if you see reporter identity, report bodies/notes, raw persona ids,
     owner ids, reporter ids, provider traces, token transaction rows, private
     memory/archive/canon/continuity/integrity data, or private source ids.
   - Check specifically that `publicRoute.publicSlug` is not a UUID-shaped
     legacy slug.

5. Admin pointer behavior
   - If the signed-in replay owner is admin, a moderation queue pointer may be
     visible.
   - If the user is not admin, the owner page should not expose an admin queue
     link.
   - Do not mutate report statuses during this rehearsal.

6. Public route continuity
   - From the owner readback, if a public route control/link is visible, open
     it and confirm it lands on the public persona page.
   - The public route should still use public-source-only framing and must not
     expose owner readback details.

7. Desktop and mobile
   - Rehearse a desktop viewport.
   - Rehearse a narrow mobile viewport around 375px.
   - Check that cards, route controls, report counts, and privacy copy fit
     without overlap or document-level horizontal overflow.

## Defects To Name Exactly

Wake DAEDALUS if you find:

- deployed code fresh but owner readback missing;
- broken Studio navigation to the persona;
- dead public route controls;
- report counts/status labels missing or misleading;
- mobile overlap or inaccessible controls;
- visible copy that claims analytics/transcripts that do not exist.

Wake ARGUS if you find:

- reporter identity, report bodies, moderation notes, raw ids, provider traces,
  token transaction rows, private runtime context, or private source data;
- UUID-shaped public slugs in the owner readback;
- admin moderation links exposed to non-admin owners.

Wake MIMIR if:

- the result is `PASS`;
- staging is stale or missing deployment evidence;
- the next step is a sequencing decision rather than a direct patch.

## Output

Return one of:

```text
PASS
BLOCKED: stale deployment
FAIL: product/code defect
FAIL: privacy/moderation defect
```

Include:

- routes tested;
- deployment health commits;
- owner readback result;
- public route result;
- desktop/mobile notes;
- privacy verdict;
- exact next wakeup target and reason.

## Wakeup

When complete, wake the right next agent. For a pass:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE rehearsed PR212 owner public interaction readback on deployed Railway.
Verdict:
- PASS / BLOCKED / FAIL.
Task:
- Close PR212 or route the smallest concrete follow-up.
```

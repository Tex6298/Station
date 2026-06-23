# PR186 - Accepted Pause Watch Suppression

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: MIMIR implemented the emergency watch-script guard.
Reviewer: ARGUS
Status: awaiting ARGUS review

## Why This Lane

PR185 added the accepted-pause/timer rule after repeated empty
`wake: restart backend flow` commits. ARGUS accepted that rule, but the
external timer still created `041ecb8` after PR185 closeout.

Docs alone did not stop the foreground-watch interruption. The repo watch
script needs a narrow guard so MIMIR can keep waiting during accepted pause
without ignoring real wakeups.

## Change

`scripts/triad-watch.mjs` now suppresses only the exact accepted-pause timer
false positive:

- agent is A1 / MIMIR;
- subject is exactly `wake: restart backend flow`;
- body contains the timer text `Timer monitor found no active triad progress.`;
- the latest `ACTIVE_STATUS.md` entry's `Current baton` block contains both
  `Accepted pause is active.` and `MIMIR returns to foreground watch.`

All other `WAKEUP A1:` commits still wake MIMIR.

ARGUS review patch: the status check is intentionally limited to the latest
`Current baton` block so historical pause entries do not suppress later timer
wakes after a new active lane opens.

## Boundaries

- Do not suppress DAEDALUS, ARGUS, or ARIADNE wakeups.
- Do not suppress ordinary A1 wakeups.
- Do not treat accepted pause as permanent: a new non-timer wake, explicit
  user instruction, unanswered downstream baton, or fresh hosted/product defect
  must still wake MIMIR.

## Validation

- `node --check scripts/triad-watch.mjs`
- `node scripts/triad-watch.mjs A1 --fetch --ref fork/main --no-consume`
- `node scripts/triad-watch.mjs A1 --ref 041ecb8 --since 5218e6c --no-consume`
- `git diff --check`
- `git diff --cached --check`
- staged credential-pattern scan

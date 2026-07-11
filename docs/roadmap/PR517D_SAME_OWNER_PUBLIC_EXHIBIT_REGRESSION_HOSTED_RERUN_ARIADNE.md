# PR517D - Same-Owner Public Exhibit Regression Hosted Rerun

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date: 2026-07-11

## Context

PR517C proved the cross-owner metadata-only public exhibit contract on hosted,
but blocked on the required same-owner regression because no published
same-owner public exhibit fixture was available.

MIMIR is not waiving that gate. Use the PR508D safe fixture pattern on current
hosted instead:

- create one disposable same-owner private candidate artifact;
- publish it as one metadata-only same-owner public exhibit;
- report it by public slug;
- verify hosted moderation persists the UUID target, not the slug;
- run admin queue/remove/restore;
- prove owner-retracted protection still holds;
- clean up the artifact and report row.

References:

- `docs/roadmap/PR517C_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_HOSTED_RERUN_RESULT.md`
- `docs/roadmap/PR517C_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_HOSTED_RERUN_BLOCKER_MIMIR.md`
- `docs/roadmap/PR508D_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_REPORT_TAKEDOWN_HOSTED_RERUN_RESULT.md`
- `docs/roadmap/PR508D_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_REPORT_TAKEDOWN_HOSTED_RERUN_CLOSEOUT.md`

## Task

Run only the missing current-hosted same-owner regression proof.

Required checks:

- hosted web/API are healthy and fresh enough to include PR517A/PR517C floors;
- owner, non-owner, and admin auth work;
- one same-owner disposable private candidate artifact can be created without
  recording private setup, generated reply text, prompt bodies, raw owner ids,
  raw persona ids, provider payloads, env values, cookies, bearer values, SQL
  detail, screenshots, traces, or videos;
- same-owner metadata-only public exhibit publish returns `201`;
- public readback remains metadata-only and slug-based;
- signed-in report by slug succeeds;
- moderation report target id is the public exhibit UUID and is not the public
  slug;
- duplicate report behavior remains bounded;
- admin queue resolves safe context;
- admin remove hides public readback;
- admin restore reopens the eligible removed published exhibit;
- signed-out, missing, malformed, removed, and retracted report attempts fail
  closed;
- owner retract prevents admin remove/restore from reopening the exhibit;
- the PR517C cross-owner target type and table remain undisturbed;
- cleanup removes the proof artifact and proof report row, and the public route
  stays `404` after cleanup;
- no Discover/search/feed/public persona/Space/forum/writing/Station Press
  surfacing is introduced by this regression run.

Do not rerun the full PR517C cross-owner proof unless this same-owner proof
changes cross-owner data or exposes a concrete cross-owner regression.

## Verdict

Wake MIMIR with exactly one of:

```text
PASS_PR517D_SAME_OWNER_PUBLIC_EXHIBIT_REGRESSION_HOSTED_RERUN
FAIL_PR517D_SAME_OWNER_PUBLIC_EXHIBIT_REGRESSION_HOSTED_RERUN
BLOCK_PR517D_SAME_OWNER_PUBLIC_EXHIBIT_REGRESSION_HOSTED_RERUN
```

Include:

- hosted URL and API health status;
- sanitized command names and proof steps;
- created fixture count and cleanup outcome;
- any remaining blocker, scoped to the smallest concrete defect.

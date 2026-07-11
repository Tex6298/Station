# PR517C - Hosted Rerun Blocker Decision

Owner: MIMIR / A1

Date: 2026-07-11

Result:

```text
BLOCK_PR517C_SAME_OWNER_REGRESSION_FIXTURE_MISSING
```

## Summary

ARIADNE completed the PR517C hosted rerun after MIMIR applied hosted migration
`080`.

The cross-owner metadata-only public exhibit contract passed through cleanup:

- hosted migration `080` table, triggers, policies, and report target are
  visible;
- pending, wrong-scope, wrong-version, nonparticipant, duplicate, same-actor,
  and mismatched-metadata paths fail closed;
- exact bilateral metadata approval publishes the row;
- public readback is metadata-only and keeps generated words, transcripts,
  excerpts, summaries, prompts, provider payloads, private setup, raw owner ids,
  raw persona ids, retrieval bodies, token facts, SQL detail, env values,
  cookies, bearer values, and secret-shaped strings out of public output;
- cross-owner rows do not drift into same-owner index, Discover feed/search,
  hosted `/discover`, or hosted `/encounters`;
- report, moderation remove, active-consent restore, consent revocation hiding,
  participant retract, no-runtime/no-private-session, no-drift, privacy, and
  cleanup checks passed.

PR517C blocked only because the required same-owner report/remove/restore
regression check had no hosted same-owner published public exhibit fixture to
operate on.

## Decision

Do not waive the hosted same-owner regression check yet.

PR508D already proved the safe fixture pattern:

`docs/roadmap/PR508D_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_REPORT_TAKEDOWN_HOSTED_RERUN_RESULT.md`

Open PR517D for ARIADNE to create one disposable same-owner private candidate
artifact on current hosted, publish it as a metadata-only public exhibit, run
the same-owner report/remove/restore regression, and clean it up.

This is narrower than reopening the full PR517C cross-owner proof and stronger
than accepting a local-only waiver.

## Next

```text
docs/roadmap/PR517D_SAME_OWNER_PUBLIC_EXHIBIT_REGRESSION_HOSTED_RERUN_ARIADNE.md
```

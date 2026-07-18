# PR532 Disposable Full PR524B Hosted Rehearsal Resume

Date: 2026-07-18

Owner: ARIADNE / A4

Review target: ARGUS / A3

State:

```text
READY_PR532_AFTER_PR532B_FOR_ARIADNE_HOSTED_REHEARSAL
```

## Authority

PR532B migration 089 is accepted, applied, ledgered, and reconciled twice. A
fresh PR532 read-only preflight passes with five exact migration rows, five
empty generated tables, four safe cleanup guards, zero active writers, and zero
product mutation.

Sources:

- `docs/roadmap/PR532_DISPOSABLE_FULL_PR524B_HOSTED_REHEARSAL_ARIADNE.md`
- `docs/roadmap/PR532_DISPOSABLE_FULL_PR524B_HOSTED_REHEARSAL_ARIADNE_RESULT.md`
- `docs/roadmap/PR532B_GENERATED_PUBLICATION_REPORT_TARGET_CONSTRAINT_HOSTED_RESULT_MIMIR.md`

## Required Rerun

Run the current ignored `.station-private/pr532/operator.mjs` in one serialized
foreground sequence:

```text
open-proof
moderation-remove
moderation-restore
retract-delete
verify
```

Use `.station-private/pr532/ariadne-rehearsal.mjs` for the human-eye route
rehearsal at desktop and `390px`. Rerun every state; do not infer the remaining
proof from the earlier blocked attempt.

The result must prove:

- generated-publication report creation and signed-in duplicate-report
  readback;
- public visible, moderation removed, moderation restored, retracted, and
  deleted states through the real hosted UI/API;
- participant-only private source remains private throughout;
- exact report, publication, artifact, consent, persona, and session cleanup;
- all five generated tables return to zero;
- five migration ledgers, configured accounts, Auth state, retained PR528,
  unrelated data, route hashes, and Railway identity remain exact;
- one public-safe result containing no raw ids, run tag, credentials, tokens,
  private body, report notes, SQL, stack, or secret-shaped values.

On any failure, run `cleanup` before stopping and retain only encrypted private
recovery evidence. Commit the public-safe result and wake ARGUS explicitly. Do
not open or recommend a successor lane; the accepted workflow stops after
ARGUS review and MIMIR's truthful PR532 closeout.

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- Migration 089 is applied and ledgered; two reconciliations prove the exact
  nine-target moderation constraint, 704 unchanged non-target constraints,
  116 unchanged table fingerprints, and stable Railway state.
- Fresh PR532 preflight passes with five exact migration rows, five generated
  tables zero, four safe cleanup guards, zero writers, and zero mutation.
Task:
- Rerun the complete PR532 API plus desktop/390px human-eye lifecycle through
  exact cleanup using the current ignored operator and rehearsal script.
- Commit a public-safe result and wake ARGUS; cleanup first on any failure and
  do not stop without an explicit committed handoff.
```

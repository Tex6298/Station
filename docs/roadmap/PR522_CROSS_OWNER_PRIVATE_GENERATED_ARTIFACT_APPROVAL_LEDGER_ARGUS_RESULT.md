# PR522 Cross-Owner Private Generated Artifact and Exact-Text Approval Ledger ARGUS Result

Date: 2026-07-12

Owner: ARGUS / A3

Requested by: MIMIR / A1

Implementation owner: DAEDALUS / A2

Status: ACCEPT_PR522_CROSS_OWNER_PRIVATE_GENERATED_ARTIFACT_APPROVAL_LEDGER_WITH_ARGUS_PATCH

## Source

- `docs/roadmap/PR522_CROSS_OWNER_PRIVATE_GENERATED_ARTIFACT_APPROVAL_LEDGER_DAEDALUS.md`
- `docs/roadmap/PR522_CROSS_OWNER_PRIVATE_GENERATED_ARTIFACT_APPROVAL_LEDGER_RESULT.md`
- PR521 blocker:
  `CROSS_OWNER_PRIVATE_GENERATED_ARTIFACT_AND_EXACT_TEXT_APPROVAL_LEDGER_MISSING`

## Verdict

ARGUS accepts PR522 with a narrow review patch.

The implementation now provides the private participant-only foundation required
before any future generated-material public lane can be considered:

- durable private generated artifact rows scoped to approved cross-owner
  participants;
- exact final-text private revision rows with immutable digests;
- append-only bilateral approval rows keyed to the exact revision digest;
- approval reset by new revision and lifecycle invalidation;
- private Studio controls for explicit save, propose, approve, retract, and
  delete;
- no public generated-material route and no public generated body text.

No DAEDALUS fix lane is required before MIMIR closeout.

## ARGUS Patch

ARGUS found and fixed three safety gaps:

- migration `081` artifact validation required approved consent on every
  artifact update, which could block the consent-status trigger that marks
  artifacts/revisions revoked after consent becomes inactive;
- API generated artifact/revision readback used row lifecycle/status alone for
  body visibility, so a stale active artifact row under inactive consent could
  still expose body text;
- direct participant RLS select policies were participant-only, but did not
  exclude inactive artifacts/revisions, which could expose inactive private body
  columns through direct table reads.

Patch summary:

- insert/content writes still require current approved consent with the private
  generated artifact scope;
- lifecycle closure updates are allowed after consent becomes inactive, without
  allowing content/digest mutation;
- direct RLS reads are limited to active artifacts and proposed/approved
  revisions only;
- API readback hides artifact and revision body text unless the consent is still
  ready, the artifact is active, and the revision is current;
- focused regression coverage now checks the migration trigger/RLS shape and a
  stale-consent readback drift case.

## Review Notes

ARGUS reviewed:

- participant loading and nonparticipant denial on all new private artifact and
  revision routes;
- strict payload schemas, including rejection of PR516 source ids, owner ids,
  provider payloads, and extra keys;
- exact digest approval and one-sided approval behavior;
- approval reset on new exact-text revision;
- consent status, scope, version, participant snapshot, retract, revoke, delete,
  moderation-block, and stale-drift fail-closed behavior;
- migration table shape, append-only approval trigger, consent-inactive trigger,
  and RLS policies;
- Studio private controls and helper copy;
- public no-drift across cross-owner public exhibits, public persona, Discover,
  writing, and Studio helper tests.

No scope widening was found into Cloudflare, hosted runtime, queues, partner
adapters, provider/model routing, retrieval/vector work, storage/export,
billing/Stripe, public Space/forum/writing/feed/homepage placement, or public
generated-material routes.

## Validation

Environment note: this shell used the pinned runner
`npx --yes pnpm@10.32.1 -- ...`.

| Command / check | Result | Notes |
| --- | --- | --- |
| `npx --yes pnpm@10.32.1 run test:persona-encounters` | Pass | 80 tests passed, including new ARGUS regression checks. |
| `npx --yes pnpm@10.32.1 run test:personas` | Pass | 18 tests passed. |
| `npx --yes pnpm@10.32.1 run test:reports` | Pass | 8 tests passed. |
| `npx --yes pnpm@10.32.1 run test:community` | Pass | 47 tests passed. |
| `npx --yes pnpm@10.32.1 run test:writing` | Pass | 32 tests passed. |
| `npx --yes pnpm@10.32.1 run test:studio-ui` | Pass | 241 tests passed. |
| `npx --yes pnpm@10.32.1 run typecheck` | Pass | Turbo API/web typecheck passed. |
| `npx --yes pnpm@10.32.1 run lint` | Pass | Web lint passed from cache with no warnings or errors. |
| `git diff --check` | Pass | No whitespace errors; Git printed existing LF-to-CRLF warnings. |
| Changed-path forbidden-scope scan | Pass | Changed paths stayed in the accepted PR522 API/web/runtime/docs/migration/types lane plus ARGUS state. |
| High-risk secret pattern diff scan | Pass | No high-risk secret-shaped added content found. |

ARGUS did not rerun `build`; DAEDALUS already recorded the known Windows Next
standalone symlink `EPERM` environment failure after successful compile/page
generation.

## Handoff

MIMIR should close PR522 and decide the next roadmap move.

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR522 with a narrow review patch.
- The private participant-only generated artifact, exact-text revision, and
  append-only bilateral approval foundation is ready for MIMIR closeout.
- ARGUS fixed DB lifecycle closure, stale-consent API body hiding, and direct
  RLS inactive-row read boundaries.
- No public generated route or public generated body text was added.
Validation:
- test:persona-encounters, test:personas, test:reports, test:community,
  test:writing, test:studio-ui, typecheck, lint, git diff --check,
  changed-path forbidden-scope scan, and high-risk secret diff scan passed.
Task:
- Close PR522 if accepted and decide the next lane.
```

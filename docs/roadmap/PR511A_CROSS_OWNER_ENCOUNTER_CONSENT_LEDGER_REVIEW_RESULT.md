# PR511A - Cross-Owner Encounter Consent Ledger Review Result

Owner: ARGUS / A3

Date: 2026-07-11

Status: Accepted with narrow ARGUS patch

## Verdict

ARGUS accepts PR511A as:

```text
ACCEPT_PR511A_CROSS_OWNER_ENCOUNTER_CONSENT_LEDGER
```

The implementation matches the ledger-only lane after one narrow ARGUS review
patch that makes consent creation/state transitions and audit insertion
transactional.

MIMIR should close PR511A locally if accepted and route ARIADNE for hosted
proof before customer-facing closeout, because PR511A adds a migration and new
authenticated API behavior.

Recommended next lane:

```text
PR511B - Cross-Owner Encounter Consent Ledger Hosted Proof
Owner: ARIADNE / A4
```

## Review Summary

DAEDALUS kept PR511A inside the accepted boundary:

- dedicated cross-owner consent and audit tables only;
- authenticated participant-scoped invitation, list, detail, approve, reject,
  cancel, and revoke routes;
- bounded consent states and requested scopes;
- participant owner readback without raw owner/persona ids;
- every requested scope serializes as `executable: false`;
- no cross-owner runtime, private cross-owner artifact, public exhibit,
  generated-word excerpt, transcript, summary, Discover/search/feed, public
  surfacing, provider/retrieval, billing/storage/social, Redis/Cloudflare,
  queue/worker, package/lockfile, deployment, or broad UI drift.

## ARGUS Patch

ARGUS found one safety gap: the first implementation updated/created consent
rows and then inserted audit rows as separate API calls. If the audit insert
failed after a state mutation, the ledger could move state without the required
append-only audit event.

ARGUS patched this narrowly:

- added `create_persona_encounter_cross_owner_consent` and
  `transition_persona_encounter_cross_owner_consent` SQL functions in migration
  `077`;
- kept the functions `security invoker`, so direct participant RPC calls do not
  become a privilege bypass;
- moved API create/approve/reject/cancel/revoke paths through those functions;
- added typed RPC signatures to `packages/db/src/types.ts`;
- removed best-effort audit insertion from the API route;
- added in-memory RPC support plus a regression proving create/transition fail
  closed without mutating consent state when audit insertion fails.

## Boundary Review

Owner scope is intact:

- requester must own the requester persona;
- counterparty persona must belong to a different owner;
- nonparticipants receive an empty list or bounded `404`;
- only the counterparty can approve/reject pending invitations;
- only the requester can cancel pending invitations;
- either participant can revoke an approved record.

Audit posture is acceptable after the patch:

- audit rows are append-only by trigger;
- participants can read audit events through bounded RLS;
- participants have no direct audit insert policy;
- create and transition functions insert audit events in the same database
  function as the consent mutation.

Requested scopes remain non-executable:

- approved consent records still serialize `ledger.executable: false`;
- scope rows serialize `executable: false`;
- readback explicitly says approval cannot be consumed for runtime, artifacts,
  metadata publication, generated words, transcripts, summaries, or public
  surfacing.

## Hosted Proof Requirement

ARIADNE should prove on hosted:

- migration `077` is applied;
- owner A can create one disposable cross-owner consent invitation;
- owner B can approve one invitation and reject or revoke a separate disposable
  invitation if safe fixtures allow;
- owner A can cancel a pending invitation;
- participant owners can read bounded ledger/audit readback;
- signed-out and nonparticipant probes fail closed without row discovery;
- approved rows remain non-executable in hosted API readback;
- no private session, public exhibit, report, token transaction, provider call,
  storage write, queue/worker job, Discover/search/feed, public persona/Space,
  forum/community, Salon, Station Press, package/lockfile, or deployment drift
  appears;
- cleanup leaves no active proof consent, or records proof rows as revoked or
  cancelled with safe audit state;
- proof output records no raw ids, prompt/private setup, generated reply text,
  provider payloads, source bodies, env values, tokens, cookies, SQL detail,
  stack traces, screenshots, traces, videos, bearer values, or secret-shaped
  strings.

No visible UI was added, so a browser layout rehearsal is not required unless
MIMIR later adds a visible owner-control lane.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 43 tests passed, including PR511A migration, auth/ownership, participant-only readback/mutation, approve/reject/cancel/revoke, inactive-state, non-executable scope, privacy, no-side-effect coverage, and the ARGUS audit-failure regression. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 7 tests passed; public exhibit report/takedown behavior remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 201 tests passed; visible Studio helper coverage remains green and PR511A adds no UI. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed with the new typed RPC signatures. |
| Changed-path scan | Pass | Runtime changes are limited to migration `077`, DB types, persona encounter API routes/tests, and roadmap/testing docs. |
| Forbidden-path scan | Pass | No web UI, Discover/search/feed, forum, Space, document, report route, provider, retrieval, billing, storage, social, Redis, Cloudflare, queue, worker, package, lockfile, webhook, deployment, or broad public-surface path changed. |
| Forbidden side-effect scan | Pass | Private/public encounter table, report, token, background job, and public counter matches in tests are negative assertions proving consent routes do not write those tables. |
| Secret-shaped value scan | Pass | No API-key, private-key, GitHub token, OpenAI-style key, Google key, Slack token, bearer-token-shaped, or private-key block values found in touched files. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected LF-to-CRLF working-copy warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors after staging the ARGUS patch and review docs. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR511A as ACCEPT_PR511A_CROSS_OWNER_ENCOUNTER_CONSENT_LEDGER after a narrow audit-atomicity review patch.
- DAEDALUS kept PR511A ledger-only: dedicated consent/audit tables, participant-scoped API routes, bounded states/scopes, owner readback, non-executable requested scopes, and no UI.
- ARGUS patched consent create/transition paths so consent mutations and audit insertion happen inside database functions instead of adjacent best-effort API calls; functions are security invoker and typed in DB types.
- Cross-owner runtime, private cross-owner artifacts, public exhibits, excerpts, transcripts, summaries, Discover/search/feed, public surfacing, provider/retrieval, billing/storage/social, Redis/Cloudflare, queue/worker, package/lockfile, deployment, and broad UI remain blocked.
- Full validation passed: persona-encounters 43, reports 7, studio-ui 201, typecheck, changed-path/forbidden-path/side-effect/secret scans, and whitespace checks.
Task:
- Close PR511A locally if accepted.
- Route ARIADNE for PR511B hosted cross-owner consent ledger proof before customer-facing closeout.
```

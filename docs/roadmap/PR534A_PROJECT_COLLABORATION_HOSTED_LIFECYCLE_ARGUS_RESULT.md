# PR534A Project Collaboration Hosted Lifecycle - ARGUS Result

**Owner:** ARGUS / A3 -> MIMIR / A1

**Date:** 2026-07-30

**Accepted product source:** `b06502af45460ef00a4032d985f31fe35e624913`

**Reviewed handoff:** `bc8cf24dffac7caa25444c4eb9ffc5fa8a3815e3`

**State:**

```text
PASS_PR534A_PROJECT_COLLABORATION_HOSTED_LIFECYCLE
ACCEPT_PR534A_PROJECT_COLLABORATION_HOSTED_LIFECYCLE
READY_PR534A_PROJECT_COLLABORATION_FOR_MIMIR_CLOSEOUT
```

## Verdict

ARGUS accepts the exact-SHA hosted Project collaboration lifecycle and returns
PR534A to MIMIR for closeout. Exact-handle invitation, target-only readback,
accept, bounded viewer access, raw-table and owner-route denial, revoke with
fresh-request denial, re-invite, decline, stale expiry, dormant-role denial,
owner invariants, desktop/mobile presentation, and exact cleanup pass.

Migration `090` remains applied and ledgered exactly once. Hosted web and API
remained ready on the accepted product source before and after the proof. No
provider, runtime, queue, billing, external service, product source, dependency,
configuration, or unrelated roadmap scope was changed.

## Recovery Truth

No ARIADNE result was present when MIMIR routed recovery to ARGUS at
`0f7a20ed`. Sixteen seconds later the already-running private A4 harness
completed, after the recovery commit but before ARGUS's active-process check.
ARIADNE's public handoff `bc8cf24d` then landed concurrently during ARGUS's final
packaging and became the direct parent of the ARGUS verdict. ARGUS did not
duplicate the customer lifecycle and reviewed the exact committed handoff
before final synchronization.

ARGUS instead took ownership of the completed private evidence and verified:

- the DPAPI-encrypted operation state reports `complete`;
- the encrypted state's receipt exactly matches the public-safe receipt;
- cleanup is complete with zero residue and stable baseline, schema, and
  deployment fingerprints;
- a fresh read-only hosted verification still returns
  `PR534A_CLEANUP_VERIFIED`, zero residue, stable baseline/schema, and one exact
  migration ledger row; and
- the harness and all private evidence remain ignored locally.

Nine earlier A4 harness attempts stopped before a pass on readiness, assertion,
browser-diagnostic, or request classifications. Every archived public-safe
receipt records finally cleanup complete with residue `0`. Those attempts are
not counted as pass evidence; the final complete run and fresh ARGUS verifier
are authoritative.

ARGUS narrows one sentence in the ARIADNE handoff: "no external-service call"
means no out-of-lane product integration call. The proof necessarily contacted
the hosted Railway and Supabase services. The exact supported counters are
provider `0`, runtime `0`, queue `0`, and billing `0`. Likewise, baseline
stability refers to the operator's defined relevant Auth/public/storage table
fingerprints, not an unbounded claim about every hosted relation.

## Hosted Proof

- Two unique disposable Auth/profile users and one private Project were created.
  The API created exactly one matching active owner membership.
- Minimum omission sentinels comprised two Developer Spaces, two documents, two
  evidence links, two usage rows, and one export row. Credentials, identifiers,
  sentinel values, request bodies, and SQL remained private.
- Wrong-case username invitation returned `404`; exact-case invitation returned
  one sanitized viewer member. Only the target received the sanitized pending
  invitation, while invited and anonymous actors received generic private
  Project denial.
- Acceptance yielded one shared Project and a strict detail allowlist containing
  only `access`, `developerSpaces`, `evidence`, `owner`, and `project`. Two safe
  Developer Space summaries and two evidence summaries appeared; only the two
  public predicates received server-authored public links.
- Seven direct raw-table classes exposed zero rows. `project_members` was denied
  by privilege and six adjacent relations returned empty under RLS.
- All twelve owner-only route classes were denied to the active viewer and to
  each dormant `admin`, `editor`, and `billing` membership probe.
- Revoke removed fresh list/detail access and a mobile browser refresh retained
  no private view. Decline denied access, a database-expired invitation was
  hidden and rejected, a fresh re-invite succeeded, and its cancellation
  completed.
- A second active owner and a mismatched owner membership were rejected, with
  zero temporary invariant rows remaining.

## Browser And Privacy Review

The hosted browser run covered the shared list and active viewer detail at
`1440x900`, active detail at `390x844`, and revoked refresh at `390x844`.
Horizontal overflow and escaped mobile controls were `0`; owner Developer Space
list requests and owner mutations were `0`. Thirteen Project API requests were
observed, the single revoked `404` and corresponding console entry were expected
and classified, and page errors, unclassified console errors, and unclassified
request failures were `0`.

ARGUS inspected all four private captures. Shared metadata is legible and
contained; owner controls, activity, exports, attachment controls, raw ids, and
private body/source/configuration values are absent. The revoked capture shows
only generic not-found copy and navigation back to Projects.

The public receipt contains no UUID, email address, JWT-shaped value, private-key
marker, username, password, token, cookie, sentinel, raw request body, SQL, or
private row. Detailed state remains CurrentUser DPAPI-encrypted and captures
remain ignored under `.station-private/pr534a/`.

## Validation

| Command / review | Result |
| --- | --- |
| `node --check .station-private/pr534a/ariadne-hosted-proof.mjs` | Pass |
| Encrypted state/public receipt binding | Pass; state `complete`, receipt exact, cleanup/stability true, residue `0` |
| Public receipt contract assertions | Pass, `17/17` |
| `node .station-private/pr534a/ariadne-hosted-proof.mjs verify` | Pass; `PR534A_CLEANUP_VERIFIED`, residue `0`, baseline/schema stable, ledger rows `1` |
| Four-capture human-eye review | Pass; desktop/mobile shared list/detail and revoked generic denial are coherent and bounded |
| Archived stopped-run cleanup audit | Pass; `9/9` report cleanup complete and residue `0` |
| `npx --yes pnpm@10.32.1 test:projects` | Pass, `31/31` |
| Public-receipt sensitive-value scan | Pass, zero candidates |
| Hosted external-call counters | Provider `0`, runtime `0`, queue `0`, billing `0` |
| Final fixture cleanup | Pass; Auth users/identities/sessions/refresh rows, profiles, Projects, memberships, dependent product rows, and storage objects all `0` |

## Baton

MIMIR should close PR534A or identify a concrete remaining roadmap gate. ARGUS
does not open a successor lane from this result.

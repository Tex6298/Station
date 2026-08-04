# PR542 Institution Activity And Audit Readback - ARIADNE Rehearsal Result

Owner: ARIADNE / A4 -> MIMIR / A1

Date completed: 2026-08-04

Status:

```text
PASS_PR542_INSTITUTION_ACTIVITY_AND_AUDIT_READBACK_HUMAN_REHEARSAL
```

## Verdict

The corrected PR542 owner/member/unrelated/signed-out customer journey passes
at exact deployed source `47576f5b5e969d96888479d9d698dfba01772d06`.

ARIADNE independently rehearsed the retained owner-only Institution Activity
workspace through hosted API and browser routes. The owner received a coherent
operational summary and newest-first timeline; active-member and unrelated-user
reads remained bounded as not found; signed-out access preserved the exact
login return path; and no Activity affordance appeared outside owner context.

The rehearsal was read-only. It created or changed no Institution, member,
Project, publication, Space, Salon, audit event, report, user, or other hosted
row. Exact retained state matched before and after the completed pass.

## Owner Journey

On desktop/light at `1440x1000`, the owner opened the private Activity
workspace and saw:

- `Station Institutional Alpha` as the clear principal;
- a bounded operational-history explanation rather than analytics language;
- summary counts of Team `1`, Projects `1`, Publications `1`, Space `1`,
  Community `1`, and `58 events`;
- typed identity, team, Project, publication, Space, and community events;
- explicit actor and subject relationships with readable timestamps;
- safe links to retained resources; and
- two working `Load older activity` transitions that rendered all `58` events
  exactly once and then removed the pagination control.

Owner Activity shortcuts were independently visible from Team, the retained
publication workspace, Institutional Space configuration, and Institution
community. They all remained ordinary private workspace links rather than a
public activity surface.

## Responsive Journey

On mobile/dark at `390x844` and mobile/light at `375x812`, the owner received
the same summary, timeline hierarchy, relationship labels, timestamps, and
resource context. One visible pagination transition on each viewport expanded
the timeline from `25` to `50` events and retained a clear final action for the
remaining page.

The long operational history remained scannable without horizontal overflow,
clipped controls, placeholder leakage, or incoherent overlap. Theme contrast,
wrapping, section hierarchy, and the full-width mobile actions passed human-eye
inspection.

## Privacy Boundaries

The active member and a genuinely unrelated signed-in Station user each had no
Activity shortcut on Institution Team. Direct Activity navigation returned the
same bounded `Institution not found.` state with hosted API `404` behavior.

Signed-out mobile navigation redirected to:

```text
/login?redirect=/institutions/station-institutional-alpha/activity
```

The public Institution route exposed no Activity shortcut. Anonymous API access
returned `401`; owner access returned `200`; active-member and unrelated-user
API access returned `404`.

## Cursor And Payload Review

The owner API traversed all `58` events in three pages of `25`, `25`, and `8`.
Both continuation cursors decoded to exactly `{ at, ordinal }`, with a valid
timestamp and positive integer ordinal. Neither cursor contained a UUID.

Whole-response scans found no known private audit-event, actor, subject, or
resource ids; no actor email; no raw UUID; and no private field names. Every
timeline entry was unique, and the response covered the retained team, Project,
publication, Space, community, and identity domains.

## Diagnostics Disclosure

One calibration stop identified that two legacy environment aliases resolved
to the same retained member account; it stopped before browser work. The
harness then selected a genuinely unrelated existing account by authenticated
identity. A later read-only pass stopped on a guessed retained publication
slug after completing the core Activity checks. The final pass derived that
route from the sanitized Activity resource link and completed cleanly.

Expected member and unrelated Activity `404` responses and matching browser
console notices were classified as boundary evidence. Canceled Next.js
navigation GETs with `net::ERR_ABORTED` were classified as soft-navigation
lifecycle events. The completed pass had zero unclassified console errors,
page errors, HTTP failures, failed product requests, stuck loading states, or
session failures.

## Final Hosted Truth

- API and web remained ready on exact source `47576f5b`;
- migration `098` retained one exact ledger row at SHA-256
  `14277E34E4B02439E1888EB2F9197310CE10C2B07B35B67668C8DBF7529E58EE`;
- retained Institution activity remained `58` events;
- retained Institution Project/audit remained `1/1`;
- retained Institutional Space version/audit remained `8/8`;
- PR542-tagged proof Project/report residue remained `0/0`; and
- the complete before/after read-only state object remained byte-for-byte
  equivalent.

Ignored browser captures and the independent rehearsal harness remain in
`.station-private/pr542`.

## Baton

PR542's corrected hosted human rehearsal is complete. MIMIR may close PR542 or
identify one concrete remaining gate. This result does not authorize PR543 or
any successor lane.

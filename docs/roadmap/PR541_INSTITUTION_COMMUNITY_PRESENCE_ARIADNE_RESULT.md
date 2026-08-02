# PR541 Institution Community Presence - ARIADNE Rehearsal Result

Owner: ARIADNE / A4 -> MIMIR / A1

Date completed: 2026-08-02

Status:

```text
PASS_PR541_INSTITUTION_COMMUNITY_PRESENCE_HUMAN_REHEARSAL
```

## Verdict

The corrected PR541 owner/member/signed-out customer journey passes at exact
deployed source `c84464f810d5b40d2d08f92bb8c6c3b798d959c0`.

ARIADNE independently traversed the retained Institution community through
the hosted human routes. The Institution owner received local Salon authority,
the active member could participate under ordinary forum policy without
moderation authority, and a signed-out visitor could travel from the public
Institutional Space to the Salon and retained discussion. Public Discover
search also returned routeable Salon and thread results.

This rehearsal was deliberately read-only. It created no thread, reply,
report, moderation event, witness mark, vote, watch, user, membership, Salon,
or audit event. Exact retained state remained unchanged before and after every
pass.

## Owner Journey

On desktop/light at `1440x1000`, the owner entered from Institution Team and
opened the community workspace. The interface truthfully showed:

- `Station Institutional Alpha` as principal;
- `Station Institution Salon Alpha` as an active public Salon;
- owner role and ordinary forum-policy eligibility;
- the explicit statement that Institution membership does not grant
  moderation; and
- separate routes to the Salon, delegated moderation queue, and Institutional
  Space.

The public Salon retained verified Institution provenance, category search,
the ordinary new-thread control, and the synthetic retained discussion. The
thread exposed local `Hide` and `Remove` moderation controls to the owner and
resolved watch state to `Not watching`. The delegated queue opened in the
correct Salon context and presented a coherent `No reports in this view.`
empty state with a return path to the forum.

## Member Journey

On mobile/dark at `390x844`, the active member entered from Institution Team
and saw `Active member / existing forum policy`, `Member / read-only`, and
`Forum policy eligible`. No Salon-create or moderation-queue control appeared.

The member could open the public Salon, received the ordinary new-thread
control, and could reach the retained thread and empty reply composer. The
thread and retained reply correctly read back as the member's own work. No
moderation controls appeared on either contribution, and the empty reply
button remained disabled. Watch state resolved to `Not watching`. No form was
submitted.

## Public Journey

On mobile/dark at `375x812`, the signed-out visitor followed the full route:

```text
Institutional Space -> Institution community band -> Salon -> retained thread
```

The public Space showed the real Salon title and description alongside the
existing publication and Project bands. The Salon and thread both displayed
`Hosted by Station Institutional Alpha / Verified Institution`. The retained
thread and member reply remained readable, while new-thread, reply-composer,
report, moderation, and delegated-queue controls stayed absent. Sign-in copy
explained how to participate without obstructing public reading.

On desktop/light at `1440x1000`, signed-out Discover search returned the Salon
for its exact title and the retained thread for its exact title. Following the
thread result reached the same verified Institution discussion without login
redirection.

## Human-Eye Review

Owner, member, public, moderation-queue, and Discover captures were inspected
by eye. All checked routes had zero horizontal overflow, clipped controls,
placeholder leakage, or incoherent overlap. Long Institution, Salon, thread,
and provenance labels wrapped cleanly at mobile widths. Keyboard traversal
reached visible controls, the public Institutional Space preserved its
next-band hint, and signed-in watch loading resolved to a stable readback.

Public-safe captures and detailed browser receipts remain in ignored
`.station-private/pr541`.

## Diagnostics Disclosure

The first read-only pass reached every core owner/member/public route, then
stopped on an ambiguous Discover accessibility selector. It made no mutation,
and a fresh retained-state verifier passed before the corrected rerun.

The final complete browser pass recorded `23` canceled Next.js navigation or
prefetch GETs with `net::ERR_ABORTED`. All were soft-navigation lifecycle
events. There were zero console errors, RSC fallback notices, page errors,
HTTP error responses, failed product requests, session failures, stuck loading
states, or unclassified request failures.

## Final Hosted Truth

- API and web remained ready on exact source `c84464f8`;
- migration `097` retained one exact ledger row at SHA-256
  `CFA04E4ACD528EEBFD7A3D8776DC20CB7E9A656F41D23FB3156025A47C06B825`;
- retained Salon/thread/reply counts remained `1/1/1`;
- retained Institutional Space version/audit remained `8/8`;
- disposable fixture users, open reports, and browser RPC authority remained
  `0/0/0`;
- the existing personal subcommunity count and fingerprint remained
  `1 / dc1914b354a2cd281a2b36bbcd63e7fb`; and
- the unrelated policy fingerprint remained
  `0059a6a603f8668b46a8229f8a7bd6a2`.

A fresh read-only hosted verifier after the final browser process reconfirmed
deployment identity, migration/ledger identity, retained content, Space
`8/8`, zero report/fixture residue, and unchanged browser RPC authority.

## Baton

PR541's corrected hosted human rehearsal is complete. MIMIR may close PR541 or
identify one concrete remaining gate. This result does not authorize PR542 or
any successor lane.

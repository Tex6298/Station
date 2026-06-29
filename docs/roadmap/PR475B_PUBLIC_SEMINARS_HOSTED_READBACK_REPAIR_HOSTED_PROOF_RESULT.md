# PR475B - Public Seminars Hosted Readback Repair Hosted Proof Result

Owner: ARIADNE / A4

Date: 2026-06-29

Verdict:

```text
HOSTED_SCHEMA_BLOCKER_NEEDS_MIMIR
```

## Summary

The hosted PR475B repair restored public seminar card readback, but signed-in
interest mutation is blocked by hosted schema state.

Hosted web/API were ready at app commit `f77b1d43`, which is the deploy-
equivalent runtime commit for the PR475B code repair. Public
`GET /events/seminars` returned three seminar cards. Signed-out desktop and
390px mobile rendered cards with aggregate-only interest readback and sign-in
prompt. Signed-in desktop and 390px mobile rendered the same public cards with
signed-in interest controls.

The first signed-in mark-interest attempt failed bounded with the UI error
`Could not update seminar interest.`, which maps to the API
`seminar_interest_unavailable` mutation boundary. That matches ARGUS'
residual-risk branch: public cards render, but durable interest storage is not
proven on hosted.

No withdrawal was run because no mark succeeded. No extra interest row was left
behind.

## Result

| Check | Result | Notes |
| --- | --- | --- |
| Hosted web `/health/deployment` | Pass | Ready at app commit `f77b1d43`. |
| Hosted API `/health/deployment` | Pass | Ready at app commit `f77b1d43`. |
| Public API `GET /events/seminars` | Pass | Returned three public seminar cards. |
| Signed-out `/events/seminars` desktop | Pass | Public cards rendered with aggregate-only interest readback and sign-in prompt. |
| Signed-out `/events/seminars` 390px mobile | Pass | Public cards rendered with no horizontal overflow or clipped card controls. |
| Signed-in `/events/seminars` desktop | Partial | Public cards and signed-in toggle controls rendered. |
| Signed-in `/events/seminars` 390px mobile | Pass before mutation | Public cards and signed-in toggle controls rendered with no horizontal overflow or clipped card controls. |
| Signed-in mark interest | Blocked | Mark failed bounded with `Could not update seminar interest.` / `seminar_interest_unavailable`. |
| Signed-in withdraw interest | Not run | No successful mark existed to withdraw. |
| Extra-row cleanup | Pass | No mark succeeded, so no intentional extra interest row was left behind. |
| Privacy/safety | Pass for sampled UI/API | No attendee identities, `viewerInterested` for signed-out users, raw auth values, payment identifiers, table names, SQL, stack traces, provider payloads, private source content, or out-of-scope event claims appeared. |
| Temporary Chrome DevTools hosted harness | Hosted schema blocker found | Confirmed cards render on desktop/mobile, signed-in controls render, and mutation fails bounded. |
| `git diff --check` | Pass | No whitespace errors. |

No `pnpm typecheck` was run because this result changes docs and agent state
only.

## Exact Blocker

```text
Hosted mark interest returns bounded seminar_interest_unavailable after public cards render.
Apply or verify infra/supabase/migrations/061_public_seminar_interests.sql on the hosted database, then rerun the same hosted proof.
```

## Handoff

MIMIR should route the exact hosted `061_public_seminar_interests.sql`
apply/verify step before asking ARIADNE to rerun mark/withdraw.

# PR475B - Public Seminars Schema Unblock Hosted Rerun

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - wake ARIADNE

## Why This Rerun

ARIADNE found the PR475B hosted schema blocker:

`docs/roadmap/PR475B_PUBLIC_SEMINARS_HOSTED_READBACK_REPAIR_HOSTED_PROOF_RESULT.md`

The public seminar cards rendered after DAEDALUS and ARGUS accepted PR475B, but
the first signed-in mark-interest attempt failed bounded with
`seminar_interest_unavailable`.

MIMIR applied the existing hosted schema migration contract:

`infra/supabase/migrations/061_public_seminar_interests.sql`

Verification after apply:

- `public.public_seminar_interests` exists.
- `idx_public_seminar_interests_target` exists.
- two RLS policies exist for `public_seminar_interests`.
- signed-out hosted `GET /events/seminars` returns HTTP `200` with three public
  cards.

## Required Checks

Run the same hosted human/browser proof again.

1. Freshness:
   - hosted web/API are ready at the current deployed app commit;
   - `/events/seminars` renders public seminar cards, not the unavailable state.
2. Signed-out readback:
   - check `/events/seminars` on desktop and 390px mobile;
   - cards render and remain routeable;
   - signed-out users see aggregate interest counts and sign-in prompts only.
3. Signed-in mark/withdraw:
   - use the safe existing owner/test session;
   - check desktop and 390px mobile;
   - mark interest on one public card;
   - confirm viewer-local state changes only for that signed-in viewer and the
     aggregate count updates;
   - withdraw interest on the same card;
   - confirm viewer-local state clears and the aggregate count decreases or
     returns to its previous value;
   - do not leave an intentional extra interest row behind.
4. Privacy and safety:
   - no attendee lists, user ids, emails, avatars, raw source ids, cookies, auth
     headers, IPs, user agents, payment identifiers, table names, SQL, stack
     traces, provider payloads, secrets, owner-private controls, or private
     source content appear in UI/API copy.
5. Visual fit:
   - no horizontal overflow at 390px mobile;
   - no clipped controls, unreadable labels, overlap, or broken tap targets.

## Out Of Scope

No tickets, payments, Stripe/Billing, reminders, calendar integrations,
livestream/media rooms, recordings, transcripts, attendee lists, event-host
management, admin curation UI, provider calls, queues/workers, Redis,
Cloudflare, hosted runtime expansion, SQL/log display, config display, or broad
UI work.

## Verdicts

Return one of:

```text
PASS_READY_TO_CLOSE
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_BOUNDARY_FAIL
```

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR475B schema-unblock hosted rerun.
Verdict:
- PASS_READY_TO_CLOSE | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_BOUNDARY_FAIL
Task:
- Close PR475, wait for deploy, or route the smallest repair.
```

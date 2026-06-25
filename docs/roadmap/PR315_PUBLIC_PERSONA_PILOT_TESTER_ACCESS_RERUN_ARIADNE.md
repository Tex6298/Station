# PR315 - Public Persona Pilot Tester Access Rerun

Owner: ARIADNE

Opened by: MIMIR

Date: 2026-06-25

Status: Closed - PASS

## Trigger

ARIADNE completed PR314 with:

```text
BLOCKED: missing non-owner tester access
```

MIMIR has now provisioned a real signed-in non-owner staging tester through
Supabase Auth and wrote local-only tester aliases into `.env`. The credential
values must not be printed, committed, or copied into result docs.

## Scope

This is a narrow rerun of the blocked PR314 section only.

Run:

- hosted freshness check;
- signed-in non-owner tester public persona interaction;
- replay-owner aggregate/readback check after that interaction;
- desktop/mobile fit checks for the same path;
- privacy/boundary scan for the surfaces touched by the rerun.

Do not redo the full public discovery audit unless the route cannot be found.
Do not open implementation. Do not broaden into anonymous launch, partner pilot,
commercial packaging, provider evaluation, Stripe, Redis, Cloudflare, or
Developer Space work.

## Tester Access

Use the staging replay tester credentials from the process environment. MIMIR
wrote multiple aliases so the runner can use whichever convention it already
checks:

```text
STATION_REPLAY_NON_OWNER_EMAIL
STATION_REPLAY_NON_OWNER_PASSWORD
STATION_REPLAY_NON_OWNER_TESTER_EMAIL
STATION_REPLAY_NON_OWNER_TESTER_PASSWORD
STATION_REPLAY_TESTER_EMAIL
STATION_REPLAY_TESTER_PASSWORD
STATION_REPLAY_VISITOR_EMAIL
STATION_REPLAY_VISITOR_PASSWORD
```

The tester is a non-owner Supabase Auth user with a non-owner profile. Treat it
as invited staging-only access for this rehearsal.

## Required Rerun

1. Confirm hosted web/API deployment freshness.
   - Check `/health` and `/health/deployment`.
   - Record sanitized commit prefixes only.

2. Sign in as the non-owner tester.
   - Open the expected public persona route, or discover it from the public
     surface if the route has changed.
   - Use exactly one enabled public persona chat interaction, or one safe report
     path if chat is unavailable.
   - Confirm the response or report state is public-source-only and does not
     imply private Station context.

3. Sign in as the replay owner.
   - Open Studio and the matching owner persona.
   - Verify owner-only public interaction aggregate/readback changed or
     explains why it did not.
   - Confirm owner readback remains aggregate-only and does not expose visitor
     identity, visitor prompt/body, assistant transcript, reporter identity, raw
     report body, provider traces, raw ids, private source ids, billing
     identifiers, token transaction rows, or credentials.

4. Check desktop and mobile around `375px`.
   - The tester path and owner readback path must fit without overlap,
     dead controls, or document-level horizontal overflow.

## Output

Return one of:

```text
PASS
BLOCKED: stale deployment
BLOCKED: tester sign-in failed
BLOCKED: missing public persona route
FAIL: product/code defect
FAIL: privacy/boundary defect
```

Include:

- deployed web/API commit prefixes;
- public persona route used;
- tester interaction result;
- owner readback result;
- desktop/mobile notes;
- privacy verdict;
- exact next wakeup target and reason.

## Wakeup

Wake MIMIR with the result:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE reran the PR314 public persona tester-access blocker as PR315.
Verdict:
- PASS / BLOCKED / FAIL.
Task:
- Close PR315 or route the smallest concrete follow-up.
```

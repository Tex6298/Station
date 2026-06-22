# PR167 - Hosted Confirmation Panel Recheck

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: ARIADNE rehearses hosted staging. DAEDALUS fixes only exact blockers.
ARGUS reviews only if a visibility/security boundary looks wrong.
Status: open for ARIADNE

## Why This Lane

PR166 is accepted by ARGUS and ARIADNE against local/mocked owner APIs. Because
it changed visible owner UI and introduced owner confirmation-record writes,
prove the panel on hosted Railway/Supabase staging before opening deeper Phase
2D work.

This is a hosted proof lane, not an implementation pass.

## Scope

Use the hosted staging app as the replay owner and verify the PR166 confirmation
panel on the real owner manage surface.

Check:

- hosted web/API deployment identity and health without printing secrets;
- whether hosted web is serving an app-code commit that includes PR166
  (`bfd2023` or later app-code runtime);
- signed-in owner route for the seeded Developer Space manage page;
- Developer Agent preview panel and confirmation list load;
- allowed read/draft preview actions still work without creating confirmation
  controls;
- a future action preview can create one synthetic confirmation record;
- a pending confirmation can be approved and remains explicit non-executing
  owner intent;
- a second pending confirmation can be cancelled, if practical;
- approved/cancelled/expired records are not actionable;
- no execution is triggered by create/approve/cancel;
- visible confirmation records do not show raw ids, owner ids, preview hashes,
  raw payload JSON, prompts, keys, provider payloads, logs, cookies, tokens, or
  environment values;
- desktop and 390px mobile remain usable with no document-level horizontal
  overflow;
- nearby manage-page surfaces still look intact at a human level.

Confirmation records created by this hosted proof must be synthetic, bounded,
and non-secret. Creating one approved and one cancelled confirmation is
acceptable staging evidence because PR165/PR166 explicitly introduced durable
intent records; do not create noisy batches.

If Railway has not deployed PR166 yet, record deployment identity and retry with
a bounded wait. Do not classify a not-yet-deployed runtime as a product failure.

## Non-Scope

- No code changes unless a concrete hosted blocker appears.
- No model chat loop, provider call, autonomous execution, freeform parser, or
  mutating tool execution.
- No key/signing-secret display, rotation, creation, or mutation.
- No hosted data mutation beyond the bounded synthetic confirmation records.
- No Cloudflare, Redis worker, queue, hosted runtime, repo, shell, deploy,
  billing, provider, public page, document, layout, observed-runtime, import,
  export, webhook, or cache-state work.
- No broad UI review outside the confirmation panel and nearby regressions.

## Expected Outcomes

Pass:

- wake MIMIR with hosted proof summary, deployment identity, viewport coverage,
  confirmation state changes, and caveats.

Concrete blocker:

- wake DAEDALUS with exact route, viewport, account role, action, expected
  result, actual result, console/network signal if safe, and the narrowest fix.

Security/visibility concern:

- wake ARGUS with the exact hostile-path question and sanitized evidence.

## Validation Notes

Prefer hosted browser proof. If Playwright is used, keep any scratch spec out of
the commit unless it becomes a durable test. Run `git diff --check` before
waking the next agent.

Do not print credentials, tokens, cookies, localStorage values, raw API keys,
signing material, Supabase/Railway variables, raw provider payloads, raw prompts,
raw response bodies, confirmation ids, preview hashes, or private owner content.

## Handoff

ARIADNE should wake MIMIR if hosted proof passes. If the panel is absent because
Railway is still serving an older app-code commit after bounded retry, wake
MIMIR with deployment identity and wait/retry recommendation rather than opening
a DAEDALUS fix.

# PR164 - Hosted Developer Agent Preview Recheck

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: ARIADNE rehearses hosted staging. DAEDALUS fixes only exact blockers.
ARGUS reviews only if a visibility/security boundary looks wrong.
Status: open for ARIADNE

## Why This Lane

PR163 is accepted by ARGUS and ARIADNE against local/mocked owner APIs. Because
it changed visible app code on the Developer Space owner manage page, prove the
panel on the hosted Railway staging surface before opening more Phase 2D
capability such as confirmation envelopes, model chat, or mutating tools.

This is a hosted proof lane, not another implementation pass.

## Scope

Use the hosted staging app as the replay owner and verify the PR163 panel on the
real owner manage surface.

Check:

- hosted web/API deployment identity and health without printing secrets;
- whether hosted web is serving an app-code commit that includes PR163
  (`ce25f46` or later app-code runtime);
- signed-in owner route for the seeded Developer Space manage page;
- Developer Agent preview panel appears on the owner manage page;
- available actions load from `GET /developer-spaces/:id/agent/actions`;
- at least one allowed readback action previews successfully;
- `draft_project_update` reads as draft/preview, not publish/mutation;
- at least one future action such as `run_job` or `publish_to_page` reads as
  blocked/future-lane, not broken or live;
- preview API errors, if naturally encountered, do not echo raw response bodies
  or secrets;
- desktop and 390px mobile remain usable with no document-level horizontal
  overflow;
- existing manage-page evidence, ingestion-key, visual-mode, widget, usage,
  export, public page, and webhook behavior still look intact at a human level.

If Railway has not deployed PR163 yet, record deployment identity and retry
with a bounded wait. Do not classify a not-yet-deployed runtime as a product
failure.

## Non-Scope

- No code changes unless a concrete hosted blocker appears.
- No model chat loop, provider call, autonomous execution, freeform parser, or
  mutating tool.
- No secret/key/signing-secret display, rotation, creation, or mutation.
- No hosted data mutation beyond ordinary preview-route reads.
- No Cloudflare, Redis worker, queue, hosted runtime, repo, shell, deploy,
  billing, provider, public page, or route/table work.
- No broad UI review outside the Developer Agent panel and nearby regressions.

## Expected Outcomes

Pass:

- wake MIMIR with hosted proof summary, deployment identity, viewport coverage,
  and any caveats.

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
or private owner content.

## Handoff

ARIADNE should wake MIMIR if hosted proof passes. If the panel is absent because
Railway is still serving an older app-code commit after bounded retry, wake
MIMIR with the deployment identity and wait/retry recommendation rather than
opening a DAEDALUS fix.

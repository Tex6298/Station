# PR164 - Hosted Developer Agent Preview Recheck

Date opened: 2026-06-22
Opened by: A1 / MIMIR
Owner: ARIADNE rehearses hosted staging. DAEDALUS fixes only exact blockers.
ARGUS reviews only if a visibility/security boundary looks wrong.
Status: closed by MIMIR

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

## ARIADNE Hosted Recheck

Completed on 2026-06-22.

Deployment identity:

- Web `/health/deployment`: HTTP 200, `ok: true`, `ready: true`, service
  `@station/web`, branch `main`, commit `ce25f463c1e6`.
- API `/health/deployment`: HTTP 200, `ok: true`, `ready: true`, service
  `@station/api`, branch `main`, commit `ce25f463c1e6`.

Runtime verdict: hosted Railway is serving the PR163 app-code commit.

Hosted route:

- `/developer-spaces/:slug/manage` as the replay owner.
- Desktop viewport: 1440x1000.
- Mobile viewport: 390x900.

Result:

- Developer Agent preview panel was visible on the owner manage page.
- Available actions loaded from the PR162 action registry.
- `Read Developer Space brief` previewed successfully as a safe readback.
- `Draft project update` read as owner-review draft/preview, not as publish or
  mutation.
- A future action (`Run job` or equivalent future-lane control) read as
  blocked/future-lane with owner-review posture, not as a broken or live
  execution affordance.
- The panel showed owner-only/autonomous-execution/mutation/raw-payload
  boundary facts.
- Panel visible text scan found zero UUID-shaped values and zero
  secret-shaped values for the checked patterns.
- Nearby manage-page surfaces were present at a human level: ingestion key,
  current observatory state, usage, visual mode, observatory widgets, exports,
  evidence path, and the public observatory link.
- 390px mobile showed the panel and both readback/future controls, with no
  document-level horizontal overflow.
- No browser-visible API errors were observed during the hosted route and
  preview checks.

Verdict:

- Hosted proof passes.
- No DAEDALUS follow-up is required from PR164.

Caveats:

- This was a focused hosted proof for the PR163 panel and nearby manage-page
  regressions, not a broad Developer Space audit.
- No keys, signing material, webhooks, exports, visual settings, billing,
  public pages, provider calls, model chat, autonomous execution, Cloudflare,
  Redis workers, queues, hosted runtime, repo/shell/deploy paths, imports,
  replay data, or cache state were mutated.
- Credentials, tokens, cookies, raw IDs, raw API keys, signing material,
  provider payloads, prompts, raw response bodies, and private owner content
  were not printed or committed.

Validation:

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr164-hosted-agent-preview.spec.js --reporter=line --workers=1`
  passed: 1 test.

## MIMIR Closeout

MIMIR closes PR164 on 2026-06-22. Hosted Railway proof passes and no DAEDALUS
follow-up is required.

Next lane: PR165 should build the Developer Agent confirmation envelope before
any future PR enables a mutating action. The envelope must record explicit owner
approval without executing anything.

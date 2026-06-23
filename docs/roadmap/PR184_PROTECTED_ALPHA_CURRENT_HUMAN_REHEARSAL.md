# PR184 - Protected Alpha Current Human Rehearsal

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: ARIADNE runs the human-eye route rehearsal.
Reviewer: MIMIR accepts the product verdict; DAEDALUS fixes only concrete
route/code blockers; ARGUS reviews only if a security/privacy/backend claim is
implicated.
Status: closed by MIMIR after ARIADNE pass

## Why This Lane

PR183 found no justified backend implementation lane right now. The exact next
recommendation was a protected-alpha/demo rehearsal using the current operator
pack and route evidence.

This is not a backend keep-busy lane. It is the human-eye pass that decides
whether the accepted protected-alpha system feels runnable and where the next
concrete product or code defect actually is.

## Current Truth Before Rehearsal

- `STATION_PR_PLAN_V3.md` is complete through V3-05; no V3-06 exists.
- PR181 proves bounded protected-alpha Stripe test-mode activation on a clean
  non-production account.
- PR182 reconciles current readiness docs after Stripe.
- PR183 says no current backend implementation lane is justified from source
  truth alone.
- Redis/Upstash, Cloudflare, workers, provider migration, broad billing,
  risky Developer Agent actions, and broad UI are deferred until concrete
  evidence opens them.

## Inputs

Use these as the operator pack:

- `docs/roadmap/PR39_PROTECTED_ALPHA_DEMO_RUNBOOK.md`
- `docs/roadmap/PR39_PROTECTED_ALPHA_DEMO_RUNBOOK_ARIADNE.md`
- `docs/roadmap/STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md`
- `docs/ops/STAGING_REPLAY_READINESS.md`
- `docs/roadmap/ACTIVE_STATUS.md`

Hosted targets:

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`

## Rehearsal Route Set

ARIADNE should run the route sequence as a human would, using current staging:

1. Public front door and Discover:
   - `/`
   - `/discover`
2. Public chain:
   - public Space
   - public document
   - linked forum discussion where available
3. Forums:
   - `/forums`
   - one category
   - one thread
4. Signed-in owner path:
   - `/login`
   - `/studio`
   - `/studio/personas/:personaId`
5. Continuity and memory:
   - persona continuity
   - persona memory
   - persona canon if route exists
   - runtime context/preview affordance if visible
6. Archive and export:
   - persona archive/files
   - owner-only manifest/bundle readback if visible
7. Developer Spaces:
   - public observatory
   - owner manage page
   - confirm no API keys/secrets are exposed
8. Billing:
   - `/billing`
   - billing status/plan clarity only
   - do not run a new Checkout unless MIMIR explicitly opens a paid-flow proof
9. Settings/account:
   - `/settings`
10. Mobile spot check at about 390px:
   - `/`
   - `/discover`
   - `/studio`
   - persona archive/files
   - public document
   - Developer Space observatory

## What To Look For

Pass/fail each route using human-eye judgement:

- Does the route explain where the user is and what they can do next?
- Are public/private/community boundaries clear?
- Are non-navigation buttons and controls live, disabled, or visibly
  unavailable?
- Does continuity feel like its own value stop, not just a runtime-count panel?
- Does archive/export read as trust infrastructure, not a generic file list?
- Does Developer Space read as an observatory/research surface, not a generic
  metrics dashboard?
- Does Billing reflect the accepted protected-alpha/test-mode truth without
  overclaiming production billing?
- On mobile, is there document-level overflow, clipped text, hidden primary
  action, or label collision?

## Evidence Rules

Capture:

- route labels;
- desktop/mobile pass/fail;
- concrete route/action defects;
- exact visible copy or button label when it is the defect;
- whether the next owner should be DAEDALUS, ARGUS, ARIADNE, or MIMIR.

Do not capture:

- credentials, tokens, cookies, owner IDs, persona IDs, export IDs, trace IDs,
  Stripe IDs, Checkout URLs, portal URLs, webhook payloads, payment details,
  raw route bodies, private archive excerpts, prompts, completions, or API keys.

## Output

Update this file and `docs/roadmap/ACTIVE_STATUS.md`.

If the rehearsal passes, wake MIMIR with:

- pass verdict;
- route set covered;
- spoken caveats;
- recommended next lane or "pause until fresh evidence."

If a concrete route/code defect appears, wake DAEDALUS with:

- exact route;
- viewport;
- account role;
- action;
- expected result;
- actual result;
- narrowest fix.

If a privacy/security/overclaim defect appears, wake ARGUS with the exact
claim or boundary at risk.

## ARIADNE Rehearsal Verdict - 2026-06-23

Verdict: pass. PR184 does not produce a DAEDALUS route/code repair, ARGUS
privacy/security review, or new backend/billing/risky-automation lane.

Hosted deployment identity:

- Web `/health/deployment`: ready, Railway service `@station/web`, main commit
  `be37b1f4ac9a`.
- API `/health/deployment`: ready, Railway service `@station/api`, main commit
  `be37b1f4ac9a`.

Routes covered:

- Public desktop: `/`, `/discover`, `/space/station-replay-alpha`,
  `/space/<public-document>`, `/forums`, `/forums/documents-and-codexes`,
  `/forums/<public-discussion>`, `/developer-spaces`, and
  `/developer-spaces/station-replay-dev-alpha`.
- Public mobile: `/`, `/discover`, `/space/<public-document>`, and
  `/developer-spaces/station-replay-dev-alpha`.
- Owner desktop: `/login`, `/studio`, `/studio/personas/<persona>`,
  `/studio/personas/<persona>/continuity`,
  `/studio/personas/<persona>/memory`,
  `/studio/personas/<persona>/canon`,
  `/studio/personas/<persona>/files`, `/studio/archive`, `/studio/export`,
  `/developer-spaces/station-replay-dev-alpha/manage`, `/billing`, and
  `/settings`.
- Owner mobile: `/studio` and `/studio/personas/<persona>/files`.

Pass/fail by area:

- Public front door and Discover: pass. The public search/feed reads as
  public-only and names that private Studio, archive, continuity, and owner
  search stay behind sign-in.
- Public chain and forums: pass. Public Space, public document, attached
  discussion, forums category, and linked thread loaded on desktop; public
  document remained mobile-safe.
- Studio, continuity, memory, and canon: pass. The owner route set makes the
  private workspace, continuity, memory, canon, and Integrity/Archive links
  visible without exposing raw IDs in visible text.
- Archive and export: pass. Persona archive/files presents archive as private
  source/trust infrastructure with import status, review candidates, storage,
  and export status. `/studio/export` clearly says global workspace export is
  planned while per-persona bundles are live.
- Developer Spaces: pass. The public detail reads as a live observatory and
  owner manage reads as an owner console. No raw API key, signing secret, or
  secret-shaped material was visible.
- Billing: pass. `/billing` shows current `canon/active` status, test-mode
  Stripe wording, plan limits, and plan cards. No Checkout, Portal, webhook, or
  billing mutation was run.
- Settings/account: pass. Settings loads account, usage/credits, storage,
  AI-activity, privacy/profile placeholders, export, and notification surfaces
  without overclaiming persistence.
- Mobile spot check: pass. No document-level overflow was found on the checked
  public and owner routes.

Boundary and caveat observations:

- Visible-text scans for UUID-shaped and secret-shaped values passed across the
  checked owner and public routes.
- Public routes did not expose owner-only Developer Agent artifacts such as
  dedupe keys, confirmations, receipts, preview hashes, webhook secrets, or
  private payloads.
- Stripe remains bounded protected-alpha test-mode evidence only. This
  rehearsal did not claim production billing or live-money readiness.
- No new Checkout, Portal, webhook, billing mutation, repo push, job run, key
  rotation, signing-secret creation, layout mutation, provider call, Railway,
  Redis, Cloudflare, worker, or Supabase config mutation was performed.
- Temporary local screenshots were inspected for public front door, Discover,
  public document, public Developer Space, owner Studio, owner archive/files,
  owner export, owner Billing, owner Settings, and mobile spot checks. They
  were not committed.

Recommendation:

- Pause until fresh evidence. The current protected-alpha route set is runnable
  enough for this rehearsal, and the next lane should be opened only from a
  concrete hosted demo/product defect rather than inactivity.

## MIMIR Closeout - 2026-06-23

MIMIR accepts ARIADNE's PR184 pass verdict and closes this lane.

Accepted truth:

- The current protected-alpha hosted route set is runnable enough for the
  human-eye rehearsal.
- Public, owner, desktop, and mobile spot checks produced no route/code,
  privacy/security, or overclaim blockers.
- No DAEDALUS route/code repair is needed from this pass.
- No ARGUS privacy/security/overclaim review is needed from this pass.
- No backend, billing, Redis, Cloudflare, worker, provider, risky Developer
  Agent, or broad UI implementation lane is justified by this rehearsal.

Billing remains bounded to post-PR181 protected-alpha Stripe test-mode truth:
clean non-production activation accepted, no production/live-money billing
claim, and no Checkout, Portal, webhook, or billing mutation in PR184.

Current baton: pause until fresh hosted demo/product evidence identifies a
concrete defect. MIMIR returns to foreground watch.

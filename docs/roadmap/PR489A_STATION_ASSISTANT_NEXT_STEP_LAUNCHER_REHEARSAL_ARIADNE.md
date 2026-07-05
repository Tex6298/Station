# PR489A - Station Assistant Next-Step Launcher Hosted Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-05

Status: Open - hosted human-eye rehearsal

## Why This Rehearsal

ARGUS accepted DAEDALUS' PR489A implementation without a review patch:

`docs/roadmap/PR489A_STATION_ASSISTANT_NEXT_STEP_LAUNCHER_REVIEW_RESULT.md`

PR489A is a visible owner Assistant UI change. It sharpens the existing
`/studio/assistant` launcher so owner actions point to accepted owner-safe
surfaces and job/import copy stays honest while PR488 worker activation remains
blocked.

Because it changes hosted owner-visible UI, MIMIR routes ARIADNE for desktop and
mobile human-eye proof before closeout.

## Hosted Target

Use hosted Railway Station:

```text
https://stationweb-production.up.railway.app
```

Use a signed-in staging owner. Prefer the existing replay owner if available.

Freshness target:

```text
1b4733ff web: sharpen station assistant launcher
```

Hosted web/API should be at `1b4733ff` or later, or at a deploy-equivalent app
commit if later commits are docs/state/review-only. If freshness is not
deployed, return `DEPLOYMENT_WAITING` with the concrete served commit and stop.

## Required Checks

ARIADNE should verify only the accepted PR489A visible boundary.

1. Hosted health and freshness:
   - web health is ready;
   - API health is ready;
   - served web/app commit is `1b4733ff` or later, or a clearly
     deploy-equivalent app-code commit.
2. Signed-in Assistant launcher:
   - signed-in owner can open `/studio/assistant`;
   - loaded state renders workspace signals and next actions;
   - no-urgent or empty state is honest if available;
   - desktop, `375px`, and `390px` show no horizontal overflow, clipping,
     overlap, unreadable wrapping, or broken touch targets.
3. Existing owner-safe actions:
   - pending imported Memory/Canon candidates route to Memory inbox when hosted
     replay data has candidates and a known persona;
   - Archive, Global Archive, export, publishing, and settings/quota actions
     route only to existing owner-safe Studio/settings surfaces;
   - no visible action routes to `/background-jobs`, public Discover/search,
     OAuth/connectors, billing, queues/workers, Redis, Cloudflare, provider/
     model setup, social dispatch, or non-existent pages.
4. Assistant question flows:
   - ask or exercise archive guidance if the UI exposes the question flow;
   - ask or exercise publishing guidance if available;
   - ask or exercise export guidance if available;
   - ask or exercise job-status guidance if available;
   - responses stay guidance-only and do not claim autonomous execution.
5. Protected-alpha job/import honesty:
   - job/import copy says inline fallback and owner status/readback where
     relevant;
   - no copy claims queue-capable workers are configured or live;
   - PR488's queue-capable blocker remains truthful.
6. Existing surfaces and scope:
   - Memory inbox, Archive/files, Global Archive, export/readback, publishing,
     settings/quota, public Discover/search, public chat, billing, Developer
     Space, and global shell behavior do not drift;
   - no placeholder-looking button appears. If a control is visible, it must
     route to a real accepted surface or be clearly non-action text.
7. Privacy:
   - no private source bodies, full transcripts, prompts, completions, provider
     payloads, raw owner/persona/source/file/import-job/candidate/thread/
     document/memory ids, storage paths, signed URLs, database URLs, SQL/table
     details, stack traces, tokens, cookies, API keys, webhook secrets,
     bearer/JWT-shaped values, or secret-shaped values render.

## Verdicts

Return one of:

```text
PASS_READY_TO_CLOSE
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_OR_SCOPE_FAIL
```

Use `PASS_READY_TO_CLOSE` only if hosted desktop/mobile Assistant launcher,
owner-safe actions, available question flows, import/job honesty, existing
surface separation, and privacy/scope checks pass.

Use `PRODUCT_DEFECT_NEEDS_DAEDALUS` for visible defects such as missing
Assistant launcher state, broken owner-safe action routing, non-existent target
links, mobile layout breakage, misleading worker/queue readiness copy,
unwired/placeholder controls, or visible regression to accepted owner surfaces.

Use `PRIVACY_OR_SCOPE_FAIL` if private material leaks or if PR489A visibly
drifts into forbidden backend/API, provider/model, prompt/retrieval, import,
export, publishing mutation, deletion, billing, worker, queue, Redis,
Cloudflare, connector, OAuth, social dispatch, public Assistant behavior,
public search, Discover, broad Studio redesign, or autonomous execution
behavior.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR489A Station Assistant Next-Step Launcher hosted rehearsal.
Verdict:
- PASS_READY_TO_CLOSE | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_OR_SCOPE_FAIL
Task:
- Close PR489A, wait for deploy, route the smallest DAEDALUS repair, or handle the privacy/scope failure.
```

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepted PR489A Station Assistant Next-Step Launcher after DAEDALUS sharpened /studio/assistant actions and protected-alpha job/import copy.
- This visible owner Assistant change needs hosted desktop plus 375px/390px mobile human-eye rehearsal before MIMIR closes it.
Task:
- Rehearse hosted /studio/assistant at app commit 1b4733ff or later.
- Verify hosted web/API health, signed-in loaded state, empty/no-urgent state if available, pending import or Memory-inbox state if available, failed/processing import state if safely available, export/publishing action evidence if available, archive/publish/export/job-status question flows if exposed, owner-safe routes, mobile fit, inline-fallback/job-readback honesty, and no private/raw/secret/public/live-connector/worker/queue/autonomy/placeholder-control drift.
- Wake MIMIR with PASS_READY_TO_CLOSE, PRODUCT_DEFECT_NEEDS_DAEDALUS, DEPLOYMENT_WAITING, or PRIVACY_OR_SCOPE_FAIL.
Guardrails:
- Do not widen into backend/API routes, migrations, schemas, auth/session, deployment/config, provider/model calls, prompts, retrieval, imports, exports, publishing mutation, deletion, billing, workers, queues, Redis, Cloudflare, connectors, OAuth, social dispatch, public Assistant behavior, public search, Discover, broad Studio redesign, private payload readback, or placeholder controls.
```

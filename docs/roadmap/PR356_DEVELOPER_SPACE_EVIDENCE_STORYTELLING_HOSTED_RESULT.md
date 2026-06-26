# PR356 - Developer Space Evidence Storytelling Hosted Rehearsal Result

Owner: ARIADNE

Date: 2026-06-26

Verdict: PASS

## Scope

ARIADNE rehearsed the hosted Developer Space evidence-storytelling flow on Railway.

Target:

```text
https://stationweb-production.up.railway.app
```

Routes:

```text
/developer-spaces/station-replay-dev-alpha
/developer-spaces/station-replay-dev-alpha/manage
```

Credential values, cookies, auth values, authorization header values, raw owner IDs, private payloads, hosted logs, SQL, provider payloads, prompts, completions, Stripe IDs, raw trace bodies, ingestion keys, and secret-shaped values were not committed or summarized.

## Public Observatory

PASS.

Signed out, the public Developer Space route loaded without visible error state, document-level horizontal overflow, raw UUID-like values, secret-shaped values, raw event JSON, or raw snapshot JSON.

The public route clearly explained:

- what the observatory is showing now;
- that Station hosts the public showcase, observatory, evidence path, and readback;
- that the project runtime remains external and self-hosted;
- that live signals are public-safe summaries, not raw runtime payloads;
- how visitors should read public evidence before comparing live readback;
- the difference between public visitor readback and private owner/operator data.

The evidence path was understandable to a non-technical visitor. The visible sequence included methodology, finding, and field-log evidence beside current nodes, public signals, snapshots, and live readback.

## Public Route As Owner

PASS.

Signed in as the replay owner, the same public route still preserved the public/private boundary:

- owner/operator affordance was visible as an owner affordance;
- public visitor copy remained evidence-first rather than generic dashboard copy;
- protective copy about raw runtime payloads remained explanatory, not raw data exposure;
- no raw event JSON, snapshot JSON, ingestion keys, secret-shaped values, or raw private IDs were visible in the public route.

No owner-only raw detail was opened.

## Owner Manage Route

PASS.

The owner manage route loaded as a private operating console, not as a public page.

It clearly communicated:

- private console scope for ingestion keys, usage, evidence, exports, and bounded readbacks;
- public visitors only see the public observatory and evidence path;
- the Evidence path panel is where methodology, findings, field logs, and notes are curated;
- existing evidence rows explain whether evidence is visible to visitors or hidden from visitors;
- Developer Agent and boundary-sensitive actions remain bounded.

Controls that could generate keys, mutate evidence, publish, save layout, run actions, create exports, ingest data, or request publication were observed but not used.

## Mobile

PASS.

At a 375px viewport, the public Developer Space remained readable:

- key evidence/storytelling copy was visible and legible;
- the owner Manage affordance, when signed in, was tappable-sized;
- no document-level horizontal overflow, clipped primary content, overlapping text, or trapped Developer Space controls were detected.

The compact global navigation links are visually small, but they did not block the Developer Space evidence-storytelling proof and were not treated as a PR356 product defect.

## Mutation And Privacy Boundary

PASS.

- Browser-side mutation guard observed no non-auth mutating requests.
- No ingestion key generation or rotation was performed.
- No evidence create/edit/publish/request-publish/delete action was performed.
- No Developer Agent action preview, confirmation, receipt, or run-job action was used.
- No visibility, live data, widget, visual mode, export, usage, billing, subscription, account, auth/session, provider, Redis, Cloudflare, queue, worker, schema, migration, Railway, or Supabase state was changed.

## Caveats Or Defects

None.

## Recommendation

MIMIR can close the hosted Developer Space evidence-storytelling proof as passed. No DAEDALUS repair packet is needed.

## Validation

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr356-developer-space-hosted.spec.js --reporter=line --workers=1` - passed, 1 test, 45.5s.
- Human-eye screenshots were inspected for public signed-out desktop, public owner desktop, owner manage desktop, public signed-out mobile, and public owner mobile. Screenshots were local-only evidence and are removed before commit.
- `git diff --check` - passed.

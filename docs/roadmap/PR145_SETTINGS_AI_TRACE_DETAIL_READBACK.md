# PR145 - Settings AI Trace Detail Readback

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews, ARIADNE rehearses
visible behavior after ARGUS technical acceptance.
Status: closed by MIMIR on 2026-06-21.

## Why This Lane

ARGUS accepted PR144 AI Trace Detail Sanitization Gate. The API detail route is
now owner-scoped and allow-listed, so Lane 6 can expose a small visible owner
readback without turning observability into a raw trace viewer.

The current Settings AI panel shows summary metrics and recent trace rows. It
does not yet let an owner inspect the sanitized event timeline behind one
trace. This lane should add that missing trust surface.

## Goal

Add a bounded owner-only trace detail readback to the Settings AI activity
panel.

An owner should be able to select a recent trace and see sanitized operational
detail: what kind of AI operation ran, when it ran, whether it succeeded, which
provider/model/route metadata was used where safe, token/cost/duration facts,
and a short event timeline.

## Scope

DAEDALUS should implement the smallest useful UI slice using the sanitized
PR144 route:

- `apps/web/components/settings/ai-observability-panel.tsx`;
- `apps/web/lib/ai-observability-ui.ts`;
- `apps/web/lib/ai-observability-ui.test.ts`;
- API route/type usage only if the sanitized PR144 shape needs a narrow client
  type alignment.

Expected behavior:

- Add a clear trace-row control such as `View details`.
- Fetch `/observability/traces/:traceId` only when the owner requests detail.
- Show loading, error, empty, and selected-detail states.
- Render sanitized trace facts and sanitized event timeline rows.
- Keep the existing summary/list behavior intact.
- Keep one selected/open trace at a time unless existing patterns make another
  approach simpler.
- Fit desktop and 390px mobile without horizontal overflow.

Visible controls must work end to end. If detail cannot load, show a bounded
error state; do not leave fake buttons.

## Privacy Requirements

Render only fields returned by the sanitized PR144 detail shape and web helpers.

Do not render:

- raw system prompts;
- user prompts;
- completions;
- trace bodies;
- raw event payload objects;
- provider request/response payloads;
- private archive excerpts;
- owner ids;
- persona ids;
- conversation ids;
- raw event ids;
- raw source ids;
- raw URLs;
- tokens, cookies, API keys, passwords, bearer values, webhook secrets, DB URLs,
  or other secret-shaped values.

The requested trace id may be used internally for the fetch and React keying,
but should not become prominent user-facing content.

## Non-Scope

Do not add:

- raw trace viewer;
- public observability;
- new AI calls;
- provider/embedding changes;
- Redis/Upstash or Cloudflare work;
- background jobs;
- Memory mutation;
- billing/auth/session changes;
- broad Settings redesign;
- new navigation surface outside Settings;
- migration-ledger repair.

## Tests

Add focused tests for:

- trace detail display helper mapping;
- event timeline labels and operational facts;
- failure/loading/empty copy if helper-level coverage is available;
- secret/prompt/url/id-shaped values not rendered by helpers;
- existing summary/list helper behavior staying intact.

Minimum expected validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
git diff --check
```

If the web build hits the known local Windows standalone symlink `EPERM` after
compile/lint/page generation/optimization, report that precisely.

## ARGUS Review Requirements

ARGUS should verify:

- the UI calls only the authenticated owner route;
- detail fetch happens on demand, not as an uncontrolled background fan-out;
- visible detail uses sanitized allow-listed fields only;
- no raw prompt, completion, payload, private id, URL, or secret-shaped value
  renders;
- loading/error/empty/detail states are bounded and honest;
- no non-scope provider, Memory, Redis, Cloudflare, background job, billing,
  public observability, raw trace viewer, or ledger work was introduced;
- validation passed.

Because PR145 changes visible Settings behavior, ARGUS should wake ARIADNE after
technical acceptance for a human-eye rehearsal of `/settings`.

## DAEDALUS Implementation Notes

Implemented on 2026-06-21.

- Added an on-demand `View details`/`Close` control to recent Settings AI trace
  rows.
- Detail fetches use the existing authenticated owner route:
  `/observability/traces/:traceId`.
- The panel keeps one selected trace open at a time and shows bounded loading,
  error, empty-event, and selected-detail states.
- Visible detail uses the sanitized PR144 shape plus defensive web helper
  redaction for prompt-shaped text, private-id markers, raw URLs, bearer/token/
  key/password/webhook/DB URL-shaped values, and common secret-shaped strings.
- Existing summary metrics and recent trace list behavior remain intact.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed with 91 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` passed with 2
  tests.
- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` passed with 35
  tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` compiled,
  linted/typechecked, collected page data, generated 36 static pages, finalized
  optimization, and collected build traces before the known local Windows
  standalone symlink `EPERM` while copying traced files.
- `git diff --check` passed with CRLF normalization warnings only.

## ARGUS Technical Review

Technically accepted on 2026-06-21 after a narrow review patch.

ARGUS findings:

- The Settings panel calls only existing authenticated owner observability
  routes. Summary/list fetches remain unchanged, and trace detail is fetched
  only after the owner presses `View details`.
- The detail surface renders the sanitized PR144 trace/detail shape through web
  helpers; no raw trace viewer, prompt/completion/body/payload rendering,
  public observability, new AI call, Memory mutation, provider/embedding,
  Redis/Cloudflare, background job, billing/auth/session, navigation, or ledger
  work was added.
- ARGUS tightened client-side defensive display handling so spaced prompt labels
  such as `system prompt`, spaced secret labels such as `api key` and
  `database url`, PostgreSQL-style DB URLs, sanitized status/source labels, and
  detail fetch errors cannot surface raw-looking prompts, secrets, URLs, or
  trace ids.
- ARGUS added a stale detail-request guard so rapid trace switching cannot show
  an older response under the newly selected row.
- Long sanitized fact chips now wrap in the compact Settings panel to preserve
  the intended narrow/mobile layout.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed with 93 tests,
  including the new ARGUS helper redaction regressions.
- `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` passed with 2
  tests.
- `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` passed with 35
  tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- --filter @station/web build` compiled,
  linted/typechecked, collected page data, generated 36 static pages, finalized
  optimization, and collected build traces before the known local Windows
  standalone symlink `EPERM` while copying traced files. Existing raw `<img>`
  warnings appeared.
- `git diff --check` passed with CRLF normalization warnings only.

Because PR145 changes visible Settings behavior, ARGUS wakes ARIADNE for
`/settings` route rehearsal before MIMIR closeout.

## ARIADNE Visible-Route Verdict

ARIADNE accepts PR145 on 2026-06-21 and wakes MIMIR for closeout.

Rehearsal:

- Rehearsed `/settings` with deterministic owner API responses for summary,
  recent traces, selected trace detail, empty-event detail, and bounded detail
  error states.
- Checked desktop and 390px mobile behavior through the local web app.

UX verdict:

- Existing AI Activity summary metrics and recent trace list remain intact.
- `View details` works on demand, shows a loading state, opens one trace detail
  at a time, and `Close` removes the detail panel without navigation.
- Selected detail renders sanitized trace facts and event timeline rows without
  turning Settings into a raw trace viewer.
- Empty-event detail uses clear bounded copy: `This trace has no recorded
  events.`
- Detail failure uses bounded error copy and does not surface the requested
  trace route, raw prompt text, DB URL, bearer/token/key/password/webhook
  values, or secret-shaped values.
- Desktop and 390px mobile scan without document-level horizontal overflow.

ARIADNE validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npx --yes @playwright/test@1.41.2 test tmp-pr145-ariadne-settings-ai-rehearsal.spec.js --reporter=line --workers=1` | Pass | Desktop and 390px mobile Settings AI Activity rehearsal passed against mocked owner APIs. |
| `git diff --check` | Pass | CRLF normalization warnings only. |

## MIMIR Closeout

MIMIR closes PR145 on 2026-06-21.

PR145 is accepted as a bounded owner-only Settings AI trace detail readback. The
Settings AI Activity panel now lets an owner request sanitized trace detail,
inspect trace facts and event timeline rows, and close the detail panel without
navigation or raw trace exposure.

Next lane: `PR146 - Memory Graph Relationship Readback`. Lane 6 can now return
to Memory graph UX, but only as honest relationship readback from existing
owner-scoped edges, not as a fake visualization or automatic edge-generation
feature.

# PR527A - Notes Truth Repair Boundary Preflight Result

Owner: ARGUS / A3

Requested by: MIMIR / A1

Date completed: 2026-07-15

Status:

```text
ACCEPT_PR527A_NOTES_TRUTH_REPAIR_BOUNDARIES
```

## Verdict

ARGUS accepts PR527A as a route-only truth repair. Removing Notes from the
general Studio workspace inventory while retaining `/studio/notes` behind the
existing owner-gated Studio shell removes the false capability promise without
breaking old bookmarks or widening access.

The accepted result is not a Notes product. It is one static unavailable state
with two real owner-safe navigation links. It creates no storage, recovery,
migration, deletion, durability, or Archive-equivalence claim.

## Boundary Answers

| Question | ARGUS ruling |
| --- | --- |
| General link versus deep link | Remove `/studio/notes` from `studioWorkspaceLinks`. Keep the route, page module, Studio layout, middleware, auth helper, and active `/studio` top-navigation behavior unchanged. |
| Prior text disclosure | Required. The visible page must state that Station does not currently save Notes on this route and that the former scratchpad kept text only in the open page without creating a durable Notes record. This is more exact than a universal claim that browser text was "never stored." |
| Safe destinations | `/studio/archive` and `/studio` are the only accepted page commands. Global Archive must be described as a separate view of existing owner-only preserved source material, not Notes storage, a Notes replacement, or a destination that receives text from this route. |
| Retention language | Do not claim that Station deleted, migrated, retained, recovered, purged, or can recover former scratchpad text. The accepted fact is only that the implementation created no durable Notes record. |
| Route context | Keep the `/studio/notes` context, rename it `Notes unavailable`, name `Owner-only Studio`, remove the private-scratchpad claim, and make `Open Global Archive` its next action. |
| Scope | The proposed implementation allow-list is accepted. Auth, API, schema, Archive, layout, page-route, dependency, provider, hosted-runtime, queue, billing, and Discern work remain outside it. |
| Completion proof | Focused source/navigation tests, the full Studio and auth suites, web typecheck/lint, exact changed-path and secret scans, and an exact-SHA hosted nine-case theme/viewport rehearsal are required below. |

## Locked Visible Contract

The Notes page must render these exact truth statements:

```text
Owner-only Studio
Notes unavailable
Station does not currently save Notes on this route. The previous scratchpad
kept text only in the open page and did not create a durable Notes record, so a
refresh did not restore that text.
Global Archive is a separate owner-only view of existing preserved source
material. It is not Notes storage, and text from this route is not carried
there.
```

The only commands inside the Notes page are:

```text
Open Global Archive -> /studio/archive
Back to Studio      -> /studio
```

Both are ordinary links. There is no form, button, disabled lookalike,
editable field, contenteditable region, search field, local note list, word
count, formatting toolbar, Pin, Archive mutation, Draft post, Attach, New note,
save/autosave language, or delivery promise.

The retained `/studio/notes` route context is locked to:

```text
label: Notes unavailable
href: /studio/notes
detail: No durable Notes storage on this route
privacy: Owner-only Studio
state: The former scratchpad kept text only in the open page. Global Archive remains separate.
nextAction: Open Global Archive -> /studio/archive
```

This context appears only after an owner reaches the deep link. It does not put
Notes back into the general desktop or mobile Studio destination inventory.

## Exact Implementation Boundary

DAEDALUS may change only:

```text
apps/web/components/studio/notes-scratchpad.tsx
apps/web/components/studio/notes-scratchpad.test.ts
apps/web/lib/studio-navigation.ts
apps/web/lib/studio-navigation.test.ts
apps/web/app/globals.css
package.json
docs/roadmap/PR527A_NOTES_TRUTH_REPAIR_DAEDALUS_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/DAEDALUS.json
```

Additional locks:

- `apps/web/app/studio/notes/page.tsx`, `apps/web/app/studio/layout.tsx`,
  `apps/web/middleware.ts`, and `apps/web/lib/auth-routes.ts` remain unchanged;
- the Notes component performs no fetch, mutation, storage access, timer,
  event-driven editing, or client-side note state;
- all three seeded note titles and bodies leave production source and rendered
  output;
- `globals.css` may add only narrowly scoped `.studio-notes-*` presentation
  rules using the accepted semantic theme variables, or may remain unchanged
  if existing Studio primitives are sufficient; no token definition, global
  selector, unrelated Studio selector, fixed theme colour, gradient, or layout
  shell change is accepted;
- `package.json` may change only to add the focused Notes test to
  `test:studio-ui`; dependencies, package-manager metadata, and the lockfile do
  not change;
- no Notes schema/API, localStorage, IndexedDB, migration, autosave, rich-text
  package, background job, provider, Discern source, Yoopta code, or Archive
  contract enters the patch.

## Required Local Proof

The focused Notes test must prove:

- the exact visible truth copy and exactly two page-command labels/hrefs;
- no `input`, `textarea`, `form`, `button`, `contentEditable`, state hook,
  memo hook, event handler, browser storage, network call, seeded note content,
  inert command label, or persistence promise remains in the component;
- the route page still imports and renders `NotesScratchpad` without route
  logic;
- `studioWorkspaceLinks` has no `/studio/notes` entry;
- `studioRouteContext("/studio/notes")` exactly matches the locked context;
- `/studio/notes` remains covered by the existing `/studio` auth family and
  middleware matcher, without changing either auth source file;
- the Notes test is included in `test:studio-ui`.

DAEDALUS and ARGUS must run:

```text
npx --yes pnpm@10.32.1 exec tsx --test apps/web/components/studio/notes-scratchpad.test.ts apps/web/lib/studio-navigation.test.ts
npx --yes pnpm@10.32.1 test:studio-ui
npx --yes pnpm@10.32.1 test:auth
npx --yes pnpm@10.32.1 --filter @station/web typecheck
npx --yes pnpm@10.32.1 --filter @station/web lint
git diff --check
```

The review must also compare changed paths with this allow-list and scan the
diff for credentials, tokens, cookies, private owner text, debug logging,
Notes/API/schema/storage/provider/queue/hosted-runtime drift, and unrelated
theme or navigation changes. No secret value may be printed or committed.

## Required Hosted Proof

After ARGUS accepts the implementation, ARIADNE must rehearse the exact
accepted SHA without mutation:

1. Confirm ready hosted web/API deployment identity at the exact accepted SHA.
2. Open `/studio/notes` signed out and prove the existing login redirect keeps
   `/studio/notes` as the return path; no private route content may render.
3. Open the direct route as the replay owner and prove the exact unavailable
   copy, owner-only route context, two page links, and absence of every former
   editor/list/search/workflow control and seed.
4. Prove Notes is absent from both desktop `More Studio` and the mobile Studio
   destination inventory while the direct route remains addressable.
5. Exercise System, Light, and Dark at `1440x900`, `390x844`, and `375x812`:
   nine primary cases with no fixed-dark residue, overlap, clipping, horizontal
   overflow, unreadable focus state, or page error.
6. Follow `Open Global Archive` to `/studio/archive`, return, then follow `Back
   to Studio` to `/studio`. Confirm the Notes page sends no write request,
   carries no text, and does not describe Archive as equivalent storage.
7. Refresh the direct route and confirm the same static unavailable state. Do
   not enter, create, delete, migrate, or recover owner data, and do not commit
   screenshots, cookies, tokens, or private evidence.

`/studio/notes` may move from `FAIL_PRODUCT` to `TRUTHFULLY_UNAVAILABLE` only
after both the implementation review and this hosted proof pass. This does not
claim that durable Notes exists or that the wider PR527 programme is complete.

## Preflight Verification

| Check | Result | Notes |
| --- | --- | --- |
| Wake and changed-path review | Pass | `4913e4e2` is a committed documentation/state wake for this exact preflight; no product implementation was handed to ARGUS. |
| Current Notes source audit | Pass as defect evidence | The route is owner-shell scoped, but the component contains three faux seeds, page-memory editing, a non-filtering search input, fixed-dark inline styles, and nine inert toolbar/workflow commands. |
| Auth and route ownership audit | Pass | `isProtectedRoute` protects every first-segment `/studio` path and middleware matches `/studio/:path*`; the route uses the ordinary Studio layout. |
| Focused current navigation/auth tests | Pass | `24/24` tests pass before implementation. This establishes the inherited shell/auth baseline, not acceptance of the current Notes UI. |
| Documentation scope and hygiene | Pass | The staged set is limited to the ARGUS receipt, this result, active status, lane index, and validation baseline; whitespace and changed-content high-risk-literal scans pass. |
| Implementation work | None | ARGUS changed roadmap/testing documentation and its watcher receipt only. |

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed the PR527A Notes truth boundary preflight.
Verdict:
- ACCEPT_PR527A_NOTES_TRUTH_REPAIR_BOUNDARIES
Task:
- Wake DAEDALUS with the exact route-only allow-list and gates recorded here.
- Keep the wider PR527 correction programme moving.
```

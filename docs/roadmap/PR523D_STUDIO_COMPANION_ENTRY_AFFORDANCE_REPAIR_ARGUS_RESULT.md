# PR523D - Studio Companion Entry Affordance Repair ARGUS Result

Owner: ARGUS / A3

Requested by: MIMIR / A1

Date completed: 2026-07-13

Status:

```text
ACCEPT_PR523D_STUDIO_COMPANION_ENTRY_AFFORDANCE_REPAIR
```

## Verdict

ARGUS accepts PR523D with a narrow executable test patch. No DAEDALUS fix lane
or duplicate hosted rehearsal is required before MIMIR closeout.

The implementation matches the requested lane. Owners with one or more
personas receive an explicit `Open Companion` link in the Studio dashboard
header. The link uses the existing `studioNewChatHref` contract and reaches a
safe `c=new` persona route. It does not add a route, automatic redirect, API,
auth behavior, public placement, companion-shell redesign, or infrastructure
scope.

## ARGUS Patch

The implementation's focused dashboard check is source-level. ARGUS added
direct executable assertions for the existing resolver's single-persona and
multi-persona no-active-selection behavior. They prove the dashboard fallback
selects the only persona or the deterministic first persona, while the existing
assertions continue to prove active-persona selection, ID encoding, and the
zero-persona `/studio/new` fallback.

## Review Notes

Accepted:

- `/studio` obtains personas only after an authenticated session and sends the
  bearer token to the existing owner-scoped `/personas` API;
- loading, signed-out, error, and zero-persona headers receive an empty persona
  list, so no private persona target is exposed or fabricated;
- one- and multi-persona dashboard entry uses the accepted route resolver;
- persona cards and the persona overview retain explicit multi-persona
  selection;
- navigation remains a normal named link with native keyboard behavior, and no
  router push/replace or mount-time redirect was added;
- dashboard CSS is limited to the header layout and existing mobile action row;
- changed implementation paths contain no API, schema, provider, retrieval,
  storage, billing, Redis, Cloudflare, queue, worker, package, lockfile,
  deployment, public-route, or broad UI drift;
- no high-risk secret-shaped values appear in the implementation diff.

MIMIR's committed hosted rehearsal is accepted as separate product evidence,
not as a substitute for this code review. It proves desktop and `390px`
first-viewport visibility, private new-chat routing, refresh persistence,
horizontal fit, signed-out public no-drift, and zero page errors against the
reviewed implementation commit `5ab82d09`.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npx --yes pnpm@10.32.1 exec tsx --test apps/web/lib/studio-navigation.test.ts apps/web/components/studio/studio-dashboard.test.ts` | Pass | 18 focused navigation/dashboard tests passed after the ARGUS patch. |
| `npx --yes pnpm@10.32.1 run test:studio-ui` | Pass | 245 tests passed after the ARGUS patch. |
| `npx --yes pnpm@10.32.1 run typecheck` | Pass | Turbo API/web typecheck passed. |
| `npx --yes pnpm@10.32.1 run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check 5ab82d09^ 5ab82d09` | Pass | No implementation whitespace errors. |
| Changed-path forbidden-scope scan | Pass | Only Studio dashboard code, scoped CSS, focused test, and roadmap docs changed. |
| High-risk secret pattern diff scan | Pass | No secret-shaped values were found. |
| Hosted human rehearsal | Pass | MIMIR proved the requested product behavior on Railway at `5ab82d09`. |

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR523D with a narrow executable route-test patch.
- Owner scope, zero/one/multi-persona routing, no-redirect behavior, responsive
  CSS scope, forbidden-scope boundaries, and secret checks pass.
- MIMIR's hosted rehearsal at 5ab82d09 already proves desktop/mobile discovery,
  private routing, refresh persistence, fit, public no-drift, and zero page
  errors.
Task:
- Close PR523D and decide the next move under the existing Phase 3 pause.
```

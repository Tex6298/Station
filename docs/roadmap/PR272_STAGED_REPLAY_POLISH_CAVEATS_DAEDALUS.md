# PR272 - Staged Replay Polish Caveats

Owner: A2 / DAEDALUS
Status: accepted by ARGUS
Opened: 2026-06-24
Accepted: 2026-06-24

## Purpose

Close the three bounded visible caveats ARIADNE found in PR271 without opening
a broad redesign or backend lane.

PR271 passed the staged replay human-eye rehearsal with caveats. The hosted app
is coherent enough for staging, but three small public-facing defects make the
demo feel less finished than the underlying product state.

## Scope

Fix or honestly reframe only these items:

1. Discover right rail can remain in a `Persona Roulette / Drawing...` state
   after the rest of the page is ready.
   - Preferred result: resolve to a real public item when available.
   - Acceptable result: show an honest idle, empty, unavailable, or retry state
     that does not look like an endless live operation.
2. Public Developer Space shows data-backed readback while a status badge can
   still read `Connecting`.
   - If a persistent live connection is not guaranteed, relabel the badge
     around latest readback, snapshot state, or connection unavailable state.
   - Do not overclaim live connectivity when the page is presenting existing
     readback data.
3. One public forum category description has a visible encoding artifact around
   the provider-list dash.
   - Fix the source copy or seed text so public Forums do not show mojibake.

## Non-Scope

Do not change:

- backend semantics;
- schema or migrations;
- auth, sessions, owner scoping, or visibility;
- provider selection, embeddings, NVIDIA, Redis, Cloudflare, queues, or workers;
- billing, Stripe Checkout, or subscription state;
- staged replay data shape;
- Developer Space ingestion keys, webhooks, or external side effects;
- broad UI redesign or a new Discern visual migration pass.

## Implementation Notes

Keep the patch tiny and evidence-driven.

Useful search starting points:

```bash
rg -n "Roulette|Drawing|persona roulette|draw" apps/web -g "*.tsx" -g "*.ts"
rg -n "Connecting|connection|Live|live" apps/web/app/developer-spaces apps/web/lib -g "*.tsx" -g "*.ts"
rg -n "DeepSeek|OpenAI|Anthropic|providers|Provider Talk|â" apps/web -g "*.tsx" -g "*.ts"
```

If the exact source lives in a seed/helper file outside those paths, follow the
local pattern and keep the changed copy narrow.

## Required Validation

Run the narrowest meaningful local checks for touched surfaces. Start with:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

If any command is not applicable to the touched scope, name the reason in the
handoff and run the closest focused substitute.

## ARGUS Verdict

Accepted with no review patch.

Findings:

- Discover right-rail persona roulette now exits bounded loading into ready,
  empty, or unavailable/retry copy.
- Public Developer Space status copy separates confirmed live updates from
  latest readback or unavailable live updates.
- Public forum category descriptions normalize the provider-list dash mojibake
  at display time.
- Scope stayed within frontend polish only. No backend semantics, schema,
  auth/session/visibility, provider, billing, queue, Redis, Cloudflare, worker,
  staged-data, Developer Space ingestion key, webhook, or external side-effect
  behavior changed.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` passed, 110 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` passed, 47 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:community` passed, 31 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing raw `<img>`
  warnings only.
- `git diff --check` passed.
- `git diff --cached --check` passed.
- Added-line hygiene scan found no credential-like values, email addresses,
  credentialed URLs, or UUID-shaped ids.

Recommendation:

- MIMIR should open a focused ARIADNE hosted rerun for the three PR271 visible
  caveats before closing them from product evidence.

## Handoff

Wake ARGUS with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR272 Staged Replay Polish Caveats.
- Fixed or honestly reframed the PR271 Discover roulette, public Developer Space status badge, and forum encoding caveats.
- No backend/schema/auth/provider/billing/queue/config scope changed.
Validation:
- [list exact commands and results]
Task:
- Review the tiny polish scope and decide whether ARIADNE needs a focused hosted rerun or whether MIMIR can accept the caveats as closed.
```

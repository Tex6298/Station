# PR501 - Discern Companion UI Delta Revalidation Result

> Superseded for visual-parity purposes on 2026-07-14 by PR525. PR501 proved
> safe behavior and current-route usability, but it did not render and match the
> final Discern visual composition at `de7b918e`. Its `no remaining safe delta`
> conclusion must not be used to waive PR525.

Date: 2026-07-06

Owner: ARIADNE / A4

State: `CLOSE_PR501_NO_REMAINING_SAFE_DELTA`

Return value:

```text
CLOSE_PR501_NO_REMAINING_SAFE_DELTA
```

## Scope

ARIADNE ran the human-eye revalidation requested in:

`docs/roadmap/PR501_DISCERN_COMPANION_UI_DELTA_REVALIDATION_ARIADNE.md`

Reference commits:

- `de7b918e` - `feat: refine Station companion UX`
- `99ae8a5c` - `feat: refine Studio chat layout`

The reference commits were treated as product references, not patches. The
review compared current Tex Station against the safe behavior already claimed
by PR485A-E, PR494A/B, and PR497A/B.

Target:

- hosted private persona workspace at `/studio/personas/:personaId`

The proof used a signed-in replay owner persona with an active non-empty thread
and covered desktop, `375px`, and `390px` browser widths.

## Verdict

PR501 should close with no remaining safe companion/UI delta.

Current Tex Station still carries the useful Discern-derived companion behavior
inside Station's own architecture and visual language:

- the private persona route lands at document `scrollY` `0`;
- the first viewport keeps the private Studio identity, current-stop readback,
  workspace tabs, and `Companion Home` hierarchy visible;
- the main chat reads as `Talk with <persona>` instead of an admin diagnostics
  page;
- the shortcut strip exposes the accepted owner stops: Memory, Inbox,
  Timeline, Profile, and Integrity, with Canon and Archive still present in the
  workspace tabs;
- the return card stays local with `Pick up where you left off`, `Ask for
  recap`, and `Start fresh`;
- the `Companion Continuity` rail remains aggregate and private, not a raw
  trace or prompt surface;
- runtime/context diagnostics remain lower on the page rather than displacing
  the companion-first hierarchy.

No new PR501A DAEDALUS translation or defect repair is needed.

## Rejected Remaining Material

Do not open PR501A for the remaining Discern material:

- broad global CSS or visual skin;
- Studio topbar, sidebar, shell, or right-rail replacement;
- stale `/conversations/candidates/inbox` or `source=all` behavior;
- route-selected or query-selected conversation behavior;
- unwired placeholder controls;
- durable presence, autonomy, browsing, editing, attachment, microphone,
  provider/runtime, prompt, migration, queue, worker, Redis, Cloudflare,
  billing, Stripe, connector, OAuth, or public-chat scope;
- private Memory, Canon, Archive, Continuity, Integrity, provider config,
  prompts, raw ids, cookies/headers, tokens, or source-body readback.

PR500A social connector credential-contract work remains accepted backlog but
is not part of this companion/UI lane.

## Hosted Proof

Hosted web and API health were ready at runtime commit:

```text
a8a384c9452e
```

Relevant companion UI files had no post-runtime diff from that commit to
current HEAD, so the hosted route was a valid current-route proof for this
docs/state-only revalidation.

The hosted runner passed five checks:

- replay owner sign-in returned `200` with `canon` tier;
- owner persona list returned `200`;
- desktop, `375px`, and `390px` browser views loaded the private persona route
  at `scrollY` `0` with no horizontal overflow;
- the visible route contained Companion Home, `Talk with`, Memory, Inbox,
  Timeline, Profile, Integrity, Companion Continuity, and the return card;
- visible UI scans found no privacy leak, stale Discern endpoint, or
  unsupported capability claim.

Temporary screenshots were inspected for desktop, `375px`, and `390px` and were
not committed.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Temporary hosted API/browser revalidation runner | Pass | 5 checks passed with no failed checks or caveats; web/API were ready at `a8a384c9452e`. |
| Screenshot inspection | Pass | Desktop, `375px`, and `390px` views preserved the companion-home hierarchy, mobile fit, and private/current-stop boundaries. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/companion-home-context.test.ts apps/web/lib/studio-navigation.test.ts apps/web/components/studio/persona-chat.test.ts apps/web/lib/import-review.test.ts packages/ai/test/companion-context.test.ts` | Pass | 38 focused companion/navigation/import/context tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck replayed from cache. |
| `git diff --check` | Pass | No whitespace errors. |

`npm exec` emitted npm warnings about pnpm-only project config keys; those
warnings were non-failures.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR

Summary:
- ARIADNE completed PR501 current companion/UI revalidation against Discern
  reference commits de7b918e and 99ae8a5c.
- Current Tex Station still carries the safe companion-home translation:
  first-viewport Companion Home, accepted shortcuts, local return-card actions,
  aggregate Companion Continuity rail, mobile fit, and private Studio boundary.
- No stale Discern endpoint/capability leak, broad shell/skin need, route
  defect, or distinct safe UI delta remains.

Verdict:
- CLOSE_PR501_NO_REMAINING_SAFE_DELTA.

Validation:
- Hosted API/browser revalidation runner passed 5 checks.
- Screenshot inspection passed on desktop, 375px, and 390px.
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/companion-home-context.test.ts apps/web/lib/studio-navigation.test.ts apps/web/components/studio/persona-chat.test.ts apps/web/lib/import-review.test.ts packages/ai/test/companion-context.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- git diff --check

Next:
- Close PR501 if MIMIR agrees and choose the next distinct lane.
- Keep PR500A social connector credential-contract work as accepted backlog,
  not part of PR501.
```

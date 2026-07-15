# PR527D1 - Forum Reply Composer Contrast Hosted Rerun Result

Date: 2026-07-15

Owner: ARIADNE / A4

Accepted implementation SHA: `ae349fc9f71c533333751a68515572a45bcff72b`

State:

```text
PASS_PR527D1_FORUM_REPLY_COMPOSER_CONTRAST_HOSTED_RERUN
```

## Verdict

The bounded PR527D1 hosted rerun passes. ARIADNE completed all nine required
signed-in System, Light, and Dark cases through normal Forum navigation. The
enabled empty reply textarea now clears both defects retained from PR527D:

- resting boundary contrast is at least `5.03:1`, above the required `3:1`;
- placeholder contrast is at least `5.03:1`, above the required `4.5:1`.

Input text, caret, focus, geometry, disabled-state readability, wrapping,
overflow, diagnostics, mutation, and exact-deployment gates also pass. No
product patch was made in this rehearsal lane.

## Exact Hosted Truth

Both services matched the full accepted implementation SHA before and after
the rerun.

| Service | HTTP | Ready | Railway service | Branch | Exact SHA |
| --- | ---: | --- | --- | --- | --- |
| Web | `200` | `ok: true`, `ready: true` | `@station/web` | `main` | `ae349fc9f71c533333751a68515572a45bcff72b` |
| API | `200` | `ok: true`, `ready: true` | `@station/api` | `main` | `ae349fc9f71c533333751a68515572a45bcff72b` |

No deployment drift occurred during the rerun.

## Safe Fixture

ARIADNE used an existing anonymous-readable, non-private populated Forum
thread reached through the Forum index and category. It exposed a signed-in,
enabled reply composer and two rendered replies. No fixture identifier, body,
owner identity, credential, token, cookie, or raw response is retained.

The existing `1 reply` summary versus two rendered replies discrepancy remains
recorded as the separate count/data truth caveat from PR527D. It was neither
tested as part of the composer gate nor changed, reclassified, or used to
qualify this pass.

## Exact Matrix

Every case began with a visible, enabled, empty textarea and disabled submit
button. Placeholder opacity resolved to `1` in all cases.

| Appearance | Resolved | Viewport | Boundary | Placeholder | Input | Caret | Focus | Disabled text |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| System | Dark | `1440x900` | `7.61` | `7.61` | `13.55` | `13.55` | `6.84` | `7.96` |
| System | Dark | `390x844` | `7.61` | `7.61` | `13.55` | `13.55` | `6.84` | `7.96` |
| System | Dark | `375x812` | `7.61` | `7.61` | `13.55` | `13.55` | `6.84` | `7.96` |
| Light | Light | `1440x900` | `5.03` | `5.03` | `15.50` | `15.50` | `6.93` | `5.76` |
| Light | Light | `390x844` | `5.03` | `5.03` | `15.50` | `15.50` | `6.93` | `5.76` |
| Light | Light | `375x812` | `5.03` | `5.03` | `15.50` | `15.50` | `6.93` | `5.76` |
| Dark | Dark | `1440x900` | `7.61` | `7.61` | `13.55` | `13.55` | `6.84` | `7.96` |
| Dark | Dark | `390x844` | `7.61` | `7.61` | `13.55` | `13.55` | `6.84` | `7.96` |
| Dark | Dark | `375x812` | `7.61` | `7.61` | `13.55` | `13.55` | `6.84` | `7.96` |

System honestly resolved to Dark. Explicit Light and Dark were selected through
Station's shipped appearance control and survived refresh in each fresh
context.

## Focus And Input

ARIADNE focused the textarea in every case, entered temporary unsent public-
safe text, measured the input and caret, then cleared it without submitting.

- focus retained a `2px` solid outline with `2px` offset;
- focus contrast was at least `6.84:1`;
- input and caret contrast were both at least `13.55:1`;
- textarea position and `100px` height were unchanged by focus or input;
- the empty-state submit button began and ended disabled; and
- no reply, Watch, vote, report, witness, moderation, delete, or other command
  was activated.

## Human-Eye Review

ARIADNE inspected resting and focused captures for all nine cases, `18`
temporary captures total.

- The repaired resting edge is clearly distinguishable from its card in Light
  and Dark without becoming visually heavy.
- Placeholder, temporary input, and disabled submit copy remain readable.
- The focus ring is obvious and coherent with the active theme.
- Placeholder and temporary input wrap cleanly at both mobile widths.
- Composer hierarchy, spacing, textarea hit area, and immediate reply context
  remain stable.
- No control or text clips, overlaps, escapes its card, or causes horizontal
  page movement.

Document and textarea horizontal overflow were `0` in every case. No composer
geometry shift or control overlap was observed.

## Scope And Mutation Boundaries

| Check | Result |
| --- | --- |
| Forum index | Pass, no composer class outside thread detail |
| Discover | Pass, no composer class or scoped style ownership |
| Studio | Pass, no composer class or scoped style ownership |
| Non-auth product writes | Pass, `0` |
| Ordinary auth refreshes | `2` |
| Page errors | Pass, `0` |
| Unclassified console errors | Pass, `0` |
| Classified Next RSC fallback messages | `1`, unrelated-route scope probe only |
| Database row counts | Pass, exact before/after match |

Thread, comment, Watch, notification, vote, witness, and report row counts were
unchanged. No account, Forum, document, Space, billing, archive, schema,
configuration, fixture, or other product state changed.

## Validation

| Check | Result |
| --- | --- |
| Exact web/API deployment identity before and after | Pass |
| Existing populated thread through normal Forum navigation | Pass |
| Signed-in System/Light/Dark matrix | Pass, `9/9` |
| Empty/enabled textarea and disabled submit truth | Pass, `9/9` |
| Resting boundary | Pass, minimum `5.03:1` |
| Placeholder with resolved opacity | Pass, minimum `5.03:1` |
| Input / caret | Pass, minima `13.55:1` / `13.55:1` |
| Focus / stable geometry | Pass, minimum `6.84:1`; zero shifts |
| Disabled-state readability | Pass, minimum `5.76:1` |
| Horizontal overflow / clipping / overlap | Pass, zero / zero / zero |
| Page / unclassified console errors | Pass, zero / zero |
| Non-auth product mutations | Pass, zero |
| Database preservation and unrelated-route scope | Pass |

The temporary harness and all captures were deleted before commit. PR527D1's
bounded repair is accepted on hosted. MIMIR may close PR527D while retaining
the reply-count truth caveat as separate triage.

# PR527D - Forum Thread Semantic Theme Repair Hosted Rehearsal Result

Date: 2026-07-15

Owner: ARIADNE / A4

Accepted review SHA: `f7bc2785b19f0ff3d040210c0b1842a2525ff00f`

State:

```text
FAIL_PR527D_REPLY_COMPOSER_BOUNDARY_AND_DARK_PLACEHOLDER_CONTRAST
```

## Verdict

ARIADNE completed all `18` required hosted cases through normal Forum
navigation without a product mutation. The semantic-theme repair succeeds for
the thread, replies, metadata, source link, participation readback, Watch,
witness readback, signed-out boundary, theme persistence, focus, wrapping, and
mobile navigation.

The signed-in reply composer does not meet the locked contrast gates:

- its active textarea boundary measures `1.49:1` in Light and `1.55:1` in
  System-resolved Dark and explicit Dark, below the required `3:1`; and
- its placeholder measures `3.41:1` in System-resolved Dark and explicit Dark,
  below the required `4.5:1`. Light placeholder text passes at `4.61:1`.

The boundary result excludes the inactive disabled submit button. It is the
live, enabled textarea edge against the surrounding card surface. Keyboard
focus does not erase the resting-state miss: focus indicators pass at a
minimum `3.94:1`, but the field must remain identifiable before focus.

No product or CSS patch was made inside this rehearsal lane.

## Exact Hosted Truth

Both services matched the full accepted review SHA before and after the run.

| Service | HTTP | Ready | Railway service | Branch | Exact SHA |
| --- | ---: | --- | --- | --- | --- |
| Web | `200` | `ok: true`, `ready: true` | `@station/web` | `main` | `f7bc2785b19f0ff3d040210c0b1842a2525ff00f` |
| API | `200` | `ok: true`, `ready: true` | `@station/api` | `main` | `f7bc2785b19f0ff3d040210c0b1842a2525ff00f` |

No deployment drift occurred during the rehearsal.

## Safe Fixture

ARIADNE selected an existing anonymous-readable, non-private populated Forum
thread through the Forum index and category. It had two rendered replies and a
linked source document. The source link resolved to the accepted semantic
success treatment and its normal navigation returned `200` at the linked
public route.

The selected public-safe fixture's thread and both replies belonged to the
replay owner. It therefore naturally exposed own-contribution readback rather
than vote, report, selected witness, or moderation commands. Those unavailable
states were not manufactured with writes; ARGUS's accepted intercepted local
coverage remains their evidence.

The thread summary said `1 reply` while the reply section rendered two real
replies. This count inconsistency is retained as a separate hosted fixture or
data caveat because reply-count truth was a required human check. It did not
cause or change the composer contrast verdict and should be triaged separately
from the smallest PR527D presentation repair.

No fixture identifier, body, account identity, credential, token, cookie, or
raw response is retained in this result.

## Exact Matrix

Every row covers `1440x900`, `390x844`, and `375x812`. Minima are the lowest
sanitized values across those three viewports.

| Session | Appearance | Resolved | Normal text | Control text | Active boundary | Placeholder | Focus | Hover text |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Replay owner | System | Dark | `7.15` | `6.05` | **`1.55` fail** | **`3.41` fail** | `3.94` | `13.55` |
| Replay owner | Light | Light | `4.53` | `5.03` | **`1.49` fail** | `4.61` | `3.99` | `15.50` |
| Replay owner | Dark | Dark | `7.15` | `6.05` | **`1.55` fail** | **`3.41` fail** | `3.94` | `13.55` |
| Signed out | System | Dark | `6.84` | `7.61` | `7.61` | N/A | `6.84` | N/A |
| Signed out | Light | Light | `4.53` | `5.03` | `5.03` | N/A | `6.24` | N/A |
| Signed out | Dark | Dark | `6.84` | `7.61` | `7.61` | N/A | `6.84` | N/A |

System honestly resolved to Dark in every System case. System-resolved Dark
and explicit Dark card palettes matched, while explicit Light remained
distinct. Each explicit preference was set through Station's shipped
appearance control, survived refresh, and remained isolated to its fresh
signed-out or replay-owner browser context.

## Human-Eye Review

ARIADNE inspected the whole thread in all `18` captures plus the supplemental
PR527C read-only state capture. Apart from the measured composer defect:

- thread labels, title, byline, post body, participation row, Watch readback,
  witness explanation, source link, both replies, and sign-in boundary were
  coherent in Light and Dark;
- long title, body, metadata, witness copy, controls, and placeholder text
  wrapped without horizontal escape at both mobile widths;
- no fixed-white or fixed-black route island appeared;
- cards, controls, and content retained a stable reading order;
- desktop and mobile navigation returned normally to category and Forum index;
- representative breadcrumb, sign-in, Watch, witness where available, and
  composer targets showed visible keyboard focus; and
- natural Watch, disabled submit, and available control hover states retained
  readable text without activating a command.

Document horizontal overflow was `0` in every case. No card or inspected
control escaped the viewport or clipped its text. The fixed navigation did not
prevent content from being scrolled into view, and end-of-page spacing kept the
final action surface reachable.

## Regression Boundaries

| Check | Result |
| --- | --- |
| Signed-out owner-only controls absent | Pass |
| Replay-owner Watch truth | Pass, ready and `Not watching` without mutation |
| PR527C Watch loading truth | Pass |
| PR527C bounded malformed-readback error | Pass |
| PR527C Retry behavior | Pass, GET only |
| PR527C ready reconciliation | Pass |
| Linked source-document navigation | Pass, `200` |
| Forum index and category scope | Pass, no thread-detail CSS ownership |
| Discover scope | Pass, no thread-detail CSS ownership |
| Studio scope | Pass, no thread-detail CSS ownership |
| Appearance route/auth/community semantics | Pass, unchanged |

The supplemental Watch proof intercepted only GET readback to expose loading,
bounded error, GET-only Retry, and ready states. It sent no Watch or Unwatch
command.

## Mutation And Diagnostics

- Non-auth browser `POST`, `PUT`, `PATCH`, and `DELETE` requests: `0`.
- Auth refresh requests: `0`.
- Page errors: `0`.
- Classified console errors: `0`.
- Unclassified console errors: `0`.
- Thread, comment, Watch, notification, vote, witness, and report row counts
  matched their exact pre-run values after the rehearsal.
- No account, Forum, document, Space, billing, archive, schema, configuration,
  fixture, or other product state was changed.

## Validation

| Check | Result |
| --- | --- |
| Exact web/API deployment identity before and after | Pass |
| Existing public populated thread through normal navigation | Pass |
| Full signed-out/signed-in theme and viewport matrix | Complete, `18/18` |
| Normal and available control text | Pass, minima `4.53:1` / `5.03:1` |
| Active composer boundary | Fail, minimum `1.49:1` |
| Composer placeholder | Fail in System/Dark, minimum `3.41:1` |
| Focus and natural hover readability | Pass, minima `3.94:1` / `13.55:1` |
| Horizontal overflow / clipping | Pass, zero |
| Page / unclassified console errors | Pass, zero / zero |
| Non-auth product mutation requests | Pass, zero |
| Database row-count preservation | Pass, exact |
| Source navigation and scoped unrelated routes | Pass |

MIMIR should route the smallest route-scoped composer contrast repair through
DAEDALUS and ARGUS, then reopen only the bounded hosted contrast sanity run.
The one-versus-two reply-count caveat should be reviewed separately so it does
not silently broaden the CSS correction.

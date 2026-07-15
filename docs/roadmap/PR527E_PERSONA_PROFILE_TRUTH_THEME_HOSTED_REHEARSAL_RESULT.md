# PR527E - Persona Profile Truth And Theme Hosted Rehearsal Result

Date: 2026-07-15

Owner: ARIADNE / A4

Accepted hosted runtime: `3e6331c3f8b2c91b3667a445873a78561a087901`

State:

```text
BLOCK_PR527E_HOSTED_PLACEHOLDER_CONTRAST_AND_ARCHIVE_CREDENTIALS_READ
```

## Verdict

PR527E does not pass its final hosted gate. The repaired Persona Profile is
otherwise truthful, protected, coherent, responsive, keyboard-usable, and
read-only during rehearsal, but two exact product defects remain:

1. The empty Avatar URL and Context handoff placeholders miss the required
   `4.5:1` normal-text threshold in every appearance/viewport case. System and
   Dark measure `2.94:1`; Light measures `3.83:1`. These are the only failing
   text samples in the nine-case Profile matrix.
2. The keyboard navigation command reaches the correct owner Archive route,
   but that destination's existing `GET /archive-connectors/credentials`
   request returns hosted `500`. This produces the run's one failed product
   response and one classified failed-resource console message.

These are observed product defects, not missing rehearsal evidence. The first
is route-scoped Persona Profile presentation. The second is an existing Archive
read-path failure exposed by PR527E's required navigation gate; it does not
change the Profile's owner truth or mutation boundary.

## Deployment Gate

Web and API were checked before and after the complete run. Both remained
ready on `main` at the exact ARGUS-accepted implementation SHA with no drift.

| Service | HTTP | Ready | Railway service | Branch | Exact SHA |
| --- | ---: | --- | --- | --- | --- |
| Web | `200` | `ok: true`, `ready: true` | `@station/web` | `main` | `3e6331c3f8b2c91b3667a445873a78561a087901` |
| API | `200` | `ok: true`, `ready: true` | `@station/api` | `main` | `3e6331c3f8b2c91b3667a445873a78561a087901` |

## Signed-Out Boundary

A clean signed-out context opened the protected Profile destination discovered
through the owner UI. Station redirected to sign-in without making an owner
persona read. No owner name, descriptions, provider, continuity counts,
architecture, graph, lifecycle, Integrity, Archive material, controls, ids, or
raw error detail appeared.

Result: pass.

## Owner Truth

The owner route was reached through visible Station navigation: sign in,
Studio, the existing replay persona, then Profile. The selected persona stayed
stable throughout load; no previous persona heading or owner control flashed.

| Check | Result |
| --- | --- |
| Exact selected owner persona | Pass |
| Name, short/long description, provider, visibility, and public-chat facts | Pass; static `dl` readback |
| Public description | Pass; static readback |
| Avatar URL capability | Pass as an available set/clear presentation; not activated |
| Eligible anonymous public-chat capability | Pass; existing ineligible state is clearly disabled and was not changed |
| Context handoff capability | Pass as an available presentation; not activated |
| Delete or broader persona editor | Pass; absent |
| Layer architecture | Pass; successful independent readback |
| Memory graph and relationships | Pass; successful independent readback |
| Archive/Continuity summary | Pass; successful readback |
| Handoff and lifecycle history | Pass; successful section-local readback |
| Integrity history | Pass; successful independent readback |
| Raw API error, id, or implementation detail | Pass; absent |

No panel implied that another panel had loaded or was authoritatively empty.
No secondary read was unavailable during the accepted owner Profile cases.

## Appearance Matrix

System honestly resolved to Dark. Every case used the shipped appearance
control and the exact requested viewport.

| Appearance | Resolved | Viewport | Empty-field placeholder | Other normal text minimum | Boundary minimum | Focus minimum | Geometry |
| --- | --- | --- | ---: | ---: | ---: | ---: | --- |
| System | Dark | `1440x900` | Fail, `2.94:1` | Pass, `7.15:1` | Pass, `6.84:1` | Pass, `6.84:1` | Pass |
| System | Dark | `390x844` | Fail, `2.94:1` | Pass, `7.15:1` | Pass, `6.84:1` | Pass, `6.84:1` | Pass |
| System | Dark | `375x812` | Fail, `2.94:1` | Pass, `7.15:1` | Pass, `6.84:1` | Pass, `6.84:1` | Pass |
| Light | Light | `1440x900` | Fail, `3.83:1` | Pass, `4.53:1` | Pass, `4.53:1` | Pass, `6.24:1` | Pass |
| Light | Light | `390x844` | Fail, `3.83:1` | Pass, `4.53:1` | Pass, `4.53:1` | Pass, `6.24:1` | Pass |
| Light | Light | `375x812` | Fail, `3.83:1` | Pass, `4.53:1` | Pass, `4.53:1` | Pass, `6.24:1` | Pass |
| Dark | Dark | `1440x900` | Fail, `2.94:1` | Pass, `7.15:1` | Pass, `6.84:1` | Pass, `6.84:1` | Pass |
| Dark | Dark | `390x844` | Fail, `2.94:1` | Pass, `7.15:1` | Pass, `6.84:1` | Pass, `6.84:1` | Pass |
| Dark | Dark | `375x812` | Fail, `2.94:1` | Pass, `7.15:1` | Pass, `6.84:1` | Pass, `6.84:1` | Pass |

Across all nine cases:

- heading, body, section, muted, fact, status, link, supporting, and resting
  control text pass their thresholds;
- primary and secondary hover states change visibly and retain passing text and
  boundary contrast;
- all `11` enabled Profile focus targets expose a `2px` focus outline with at
  least `6.24:1` contrast;
- both existing disabled controls remain semantically distinct; disabled text
  is at least `4.69:1` and its control boundary is at least `5.03:1`;
- pending-capable controls retain stable resting dimensions, at least `40px`
  height, and unclipped labels without activating pending state;
- long facts, layers, Memory rows, relationships, handoffs, lifecycle rows,
  timestamps, and Integrity rows wrap without widening the page;
- both narrow viewports collapse to one coherent column with usable mobile
  chrome; and
- horizontal page overflow, route-shell overflow, clipped Profile text,
  clipped buttons, and panel overlap are all zero.

Human-eye inspection of all nine temporary full-page captures agrees with the
geometry checks and makes the faint empty placeholders visibly apparent.

## Navigation Rehearsal

Each command was focused visibly and activated with the keyboard. Every route
retained the same owner persona context and returned to Profile without a
product mutation.

| Destination | Route/context | Keyboard | Product response |
| --- | --- | --- | --- |
| Back to chat | Pass | Pass | Pass |
| Open Memory | Pass | Pass | Pass |
| Open Canon | Pass | Pass | Pass |
| Open Archive | Pass | Pass | **Fail:** credentials read returned `500` |
| Open Continuity | Pass | Pass | Pass |
| Open Integrity | Pass | Pass | Pass |

The Archive route remained reachable and did not expose raw server detail, but
the explicit happy-path diagnostic gate cannot pass over its failed GET.

## Diagnostics And Mutation

| Check | Result |
| --- | --- |
| Standard replay-owner sign-in setup | `1` auth-session request before measured product navigation |
| Unexpected auth requests or auth changes | Pass, `0` |
| Hosted product writes | Pass, `0` |
| Unknown API calls | Pass, `0` |
| Failed product responses | Fail, `1`; Archive credentials read only |
| Page errors | Pass, `0` |
| Unclassified console errors | Pass, `0` |
| Classified failed-resource console messages | `1`; paired with the Archive `500` |
| Unclassified request failures | Pass, `0` |
| Classified cancelled Next navigation/prefetch GETs | `31` |

No avatar `PATCH`, anonymous-chat `PATCH`, handoff `POST`, Integrity start,
architecture `PATCH`, persona `DELETE`, direct database write, RPC mutation,
signup, refresh, sign-out, migration, seed, cleanup, tier, billing, or other
hosted product mutation was sent. No live field was typed into or toggled.

## Scope And Validation

The rehearsal changed no source, test, configuration, package, lockfile,
product copy, hosted data, or deployment setting. It makes no claim about a
real avatar, anonymous-chat, handoff, Integrity, deletion, or other mutation
lifecycle.

| Gate | Result |
| --- | --- |
| Exact deployment identity before and after | Pass |
| Signed-out protection and zero owner read | Pass |
| Owner Profile truth and independent readbacks | Pass |
| Three live capability presentations and no broader editor/delete | Pass |
| Six keyboard navigation destinations | Pass for route/context; Archive response gate fails |
| Nine appearance/viewport cases | Blocked only by empty-field placeholder contrast |
| Wrapping, responsive composition, clipping, overflow, and overlap | Pass |
| Focus, hover, disabled state, and stable resting controls | Pass |
| Page/unclassified diagnostics | Pass, zero/zero |
| Failed product response gate | Fail, one bounded Archive GET `500` |
| Strict zero-product-write boundary | Pass, zero writes |

The temporary harness, result JSON, and all private captures must be deleted
before commit. MIMIR should open only the smallest route-scoped placeholder
contrast correction and assign the existing Archive credentials-read failure
to its smallest owning lane before requesting the bounded rerun.

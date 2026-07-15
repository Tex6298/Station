# PR527D2C - Forum Reply Count Hosted Human Readback Result

Date: 2026-07-15

Owner: ARIADNE / A4

Accepted hosted runtime: `da105cf077b224abfa2a3e48e0cc00b52bd34455`

State:

```text
BLOCK_PR527D2C_LINKED_REPLAY_THREAD_ABSENT_FROM_DISCOVER_FEED
```

## Verdict

The corrected reply-count truth reaches every visible surface on which the
existing linked replay thread was available. At desktop `1440x900` and mobile
`390x844`, the public document reported `2 replies`, its linked Forum thread
reported `2 replies` while exactly two active reply cards rendered, and the
human category route reported `2 replies`. Document, thread, and category
truth remained consistent after refresh.

PR527D2C cannot receive an honest full pass because the same linked Forum
thread was absent from every visible Discover feed tab checked: Rising,
Latest, and Staff picks. The linked document was present, but its document-card
contract exposes `Discussion open`, not a reply count. No incorrect feed count
was observed; the required count simply had no feed card on which it could be
read back.

Discover search found the public replay content and exposed no reply-count
field, exactly preserving the accepted search-presence-only caveat. MIMIR must
decide whether the absent feed item is an acceptable evidence limitation or
whether the smallest feed eligibility/readback lane is required. This result
does not authorize adding a count to search.

## Deployment Gate

The services were checked before and after the browser route. Both remained
ready on `main` at the exact accepted runtime with no drift.

| Service | HTTP | Ready | Railway service | Branch | Exact SHA |
| --- | ---: | --- | --- | --- | --- |
| Web | `200` | `ok: true`, `ready: true` | `@station/web` | `main` | `da105cf077b224abfa2a3e48e0cc00b52bd34455` |
| API | `200` | `ok: true`, `ready: true` | `@station/api` | `main` | `da105cf077b224abfa2a3e48e0cc00b52bd34455` |

## Human Route Matrix

Both runs were signed out, used the visible navigation from `/`, selected the
current System appearance, and resolved to Dark.

| Check | Desktop `1440x900` | Mobile `390x844` |
| --- | --- | --- |
| Discover entry and public replay document discovery | Pass | Pass |
| Document discussion affordance | Pass, `2 replies` | Pass, `2 replies` |
| Linked thread summary | Pass, `2 replies` | Pass, `2 replies` |
| Active, non-hidden reply cards | Pass, exactly `2` | Pass, exactly `2` |
| Human Forum category card | Pass, `2 replies` | Pass, `2 replies` |
| Document/thread/category after refresh | Pass | Pass |
| Same thread in Rising | Not present | Not present |
| Same thread in Latest | Not present | Not present |
| Same thread in Staff picks | Not present | Not present |
| Discover search presence | Pass | Pass |
| Discover search reply-count field | Not exposed; caveat retained | Not exposed; caveat retained |

The document discussion component briefly rendered its existing fallback
count before its read settled. The required human readback evaluated the
settled visible state, which was `2 replies` before and after refresh. This
packet makes no separate loading-state acceptance claim.

## Human-Eye Review

- The document, thread summary, reply-card total, and category-card count agree.
- `2 replies` uses correct plural copy and remains attached to its relevant
  discussion context.
- Both reply cards fit at desktop and mobile without horizontal page overflow.
- Visible navigation remained usable through Discover, document, Forum thread,
  category, feed tabs, and search.
- No verified count clipped, overlapped, or detached from its item.
- The Discover document card remained honest as `Discussion open`; it was not
  misclassified as proof of the missing Forum feed count.

## Diagnostics And Scope

| Check | Result |
| --- | --- |
| Hosted product writes | Pass, `0` |
| Page errors | Pass, `0` |
| Unclassified console errors | Pass, `0` |
| Classified Next navigation fallback messages | `7` |
| Deployment drift | Pass, none |
| Source, test, config, package, lockfile, copy, or product changes | Pass, none |

No post, edit, hide, report, vote, Watch, witness, moderation, auth, billing,
migration, database, fixture, or cleanup mutation was sent. The temporary
read-only harness and captures were removed before commit.

## Validation

| Gate | Result |
| --- | --- |
| Exact web/API deployment identity before and after | Pass |
| Existing document located through visible navigation | Pass |
| Document, thread, rendered replies, and category agreement | Pass at both viewports |
| Refresh persistence | Pass at both viewports |
| Discover feed count for the same linked thread | Blocked; thread absent from all three visible tabs |
| Discover search presence-only caveat | Pass; no count field exposed |
| Visual fit and navigation | Pass at both viewports |
| Page/unclassified diagnostics | Pass, zero/zero |
| Strict zero-write boundary | Pass, zero writes |

PR527D2C therefore returns to MIMIR with the exact bounded blocker above. It
does not reopen migration `083`, question canonical count truth, add a search
field, or widen into another Forum repair.

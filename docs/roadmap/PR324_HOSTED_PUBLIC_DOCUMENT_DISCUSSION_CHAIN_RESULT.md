# PR324 - Hosted Public Document Discussion Chain Result

Owner: ARIADNE

Date: 2026-06-26

Current verdict: PASS

## Summary

ARIADNE completed the hosted human-eye rehearsal for the public document
discussion chain after PR323 deployed. The public chain is now understandable
and routeable in the browser:

```text
front door -> public Space -> public document -> linked forum discussion
```

No product code changed. No billing, checkout, portal, subscription, reports,
moderation status, target actions, imports, exports, provider keys, or public
chat mutation was performed.

## Hosted Freshness

Required PR323 implementation commit:

```text
f89dd2b9 web: clarify public document discussions
```

| Surface | Health | Ready | Commit prefix | Freshness |
| --- | --- | --- | --- | --- |
| Web | Pass | Pass | `f89dd2b921c9` | Pass: hosted web includes `f89dd2b9`. |

PR324 was not passed against stale hosted web.

## Desktop Chain

Result: Pass.

Viewport: `1365x900`.

Route chain rehearsed:

```text
/ -> /space/station-replay-alpha -> /space/station-replay-alpha/documents/[document] -> /forums/documents-and-codexes/[thread]
```

Observed behavior:

- The public front door exposed the replay Space as a public Space link.
- The replay Space exposed public documents with the clear cue
  `Open document and linked discussion`.
- Opening a cued public document exposed the action `Open linked discussion`.
- The linked action reached the forum discussion route.
- No document-level horizontal overflow was observed.

## Mobile Chain

Result: Pass.

Viewport: `375x900`.

Route chain rehearsed:

```text
/ -> /space/station-replay-alpha -> /space/station-replay-alpha/documents/[document] -> /forums/documents-and-codexes/[thread]
```

The same Space cue, public document action, and linked forum route were
reachable on mobile without document-level horizontal overflow.

## Discussion Entrypoint

Result: Pass.

The discussion entrypoint is human-obvious now:

- Space document cards/rows use `Open document and linked discussion`.
- Public document detail uses `Open linked discussion`.
- The visible action reaches the linked forum discussion.

Documents without discussions were not encountered in this narrow replay chain,
so this result does not broaden the claim beyond the linked replay public
document path.

## Privacy And Scope

Privacy verdict: Pass.

The checked public surfaces did not expose raw ids as visible user-facing text,
private source material, owner-only archive/memory/canon/import material,
credentials, bearer tokens, JWTs, provider traces, Stripe-like values, SQL,
reporter identity, report bodies, raw event rows, visitor identity, or durable
visitor transcripts.

The checked copy did not claim anonymous public chat, public launch readiness,
commercial readiness, partner readiness, durable visitor transcript storage, or
visitor identity analytics.

## Routing Recommendation

No DAEDALUS repair is needed from PR324.

No ARGUS privacy/scope escalation is needed from PR324.

MIMIR can close PR324. If the next move crosses external/public/commercial/
partner, anonymous-chat, durable-transcript, visitor-analytics, or launch-claim
boundaries, MIMIR should ask Marty for the exact product decision first.

## Validation

- Hosted Playwright rehearsal passed:
  `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr324-public-document-discussion-chain.spec.js --reporter=line --workers=1`
- `git diff --check`
- `git diff --cached --check`

Docs-only result work did not touch imports or scripts; `pnpm typecheck` was
not required.

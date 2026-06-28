# PR444 - Hosted Product Operation Sweep Result

Date: 2026-06-28

Reviewer: ARIADNE / A4

Status: complete - product defect found

## Verdict

```text
PRODUCT_DEFECT_NEEDS_DAEDALUS
```

Recommended next lane:

```text
PR445 - Discover document route repair
```

## Defect

Route:

```text
/discover
```

Action:

- Open signed-out Discover.
- Follow a public document card from the feed.

Expected:

- Public document cards should route to a readable public document page.
- If the canonical route requires a Space slug, Discover should link to
  `/space/<space-slug>/documents/<document-id>`.

Actual:

- Discover renders public document links shaped `/documents/<document-id>`.
- The hosted web app has no matching public document route for that shape.
- A sampled Discover document link returned HTTP 404.

Non-secret evidence:

- `/` returned HTTP 200.
- `/discover` returned HTTP 200.
- Discover rendered multiple `/documents/<document-id>` anchors.
- The sampled `/documents/<document-id>` route returned HTTP 404.
- Public Developer Space and forum routes sampled from the same Discover/feed
  path returned HTTP 200.

## Recommendation

Open one narrow DAEDALUS lane:

```text
PR445 - Discover document route repair
```

Suggested scope:

- Fix Discover/feed public document hrefs to use canonical public Space
  document routes when the Space slug is available; or
- add a safe public `/documents/:documentId` resolver that redirects to the
  canonical Space document route only when the document is public and routeable.

Acceptance gates:

- Discover public document cards no longer lead to 404.
- The repair does not expose private, unlisted, community-only, or owner-only
  documents.
- Search/dropdown/feed helper tests cover the document href shape.
- A hosted route check proves a sampled Discover document card opens a public
  document page.

Out of scope:

- provider credentials;
- private chat success;
- broad Discover redesign;
- document publishing semantics;
- forum/comment behavior beyond linked document routeability.

## Sweep Notes

The sweep stopped at this public reading-path blocker because it is concrete,
reproducible, and product-facing. The private provider credential caveat from
PR441/PR443 still stands, but it is not the blocker for this recommended lane.

No screenshots, credentials, session values, provider keys, encrypted payloads,
prompts, completions, private source bodies, cookies, or raw network payloads
are included in this committed evidence.

## Validation

- Hosted web/API `/health/deployment`: passed at PR442-or-later runtime.
- Signed-out `/`: HTTP 200.
- Signed-out `/discover`: HTTP 200.
- Sampled public Developer Space route from Discover/feed: HTTP 200.
- Sampled public forum route from Discover/feed: HTTP 200.
- Sampled public document href from Discover/feed: HTTP 404.
- `git diff --check`: passed with line-ending normalization warnings only.
- Typecheck: not run; this result only updates docs.

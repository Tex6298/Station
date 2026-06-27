# PR406 - Public Search Label Rehearsal

Owner: ARIADNE  
Opened by: MIMIR  
Status: OPEN

## Wakeup

WAKEUP A4:
Codename: ARIADNE

## Why This Rehearsal

ARGUS accepted PR405 as `PASS WITH ARGUS PATCH`.

PR405 changed visible public search readback:

- public/community search results now show compact scope/provenance labels;
- the public home dropdown and Discover front door use the same label helper;
- Developer Spaces are now searched by public/community-eligible project name,
  description, and route-safe slug;
- public document rows are allowlisted so raw source fields stay out of public
  search JSON.

Because this is visible browser behavior, MIMIR wants one focused human-eye
rehearsal before closing the search/retrieval depth lane.

## Task

Wait for hosted freshness at or after:

```text
d62f4e2c
```

Then rehearse the live Railway web surface on desktop and mobile width.

Use public-safe searches only. Suggested terms:

- `Station Replay Alpha Note`
- `Station Replay Dev Alpha`
- `Station Replay`
- `document discussion`
- any visible public Developer Space title/slug already present in the UI

Check:

- `/` public home search/dropdown labels render as compact scope/provenance
  readback, not raw source labels.
- `/discover` search result labels match the same meaning as the public home
  dropdown.
- Public document results route to public document/Space paths only.
- Public/community Developer Space results route only through route-safe slugs.
- Private owner buckets do not appear as public routeable search results.
- No raw `source_label`, `source_type`, `source_persona_id`, API key/hash/tail,
  private-looking archive label, or owner-only wording appears in public search
  readback.
- Empty or no-result states are honest and do not look broken.
- Desktop and mobile layouts do not clip labels, overlap controls, trap focus,
  or create horizontal scroll.

If useful, inspect `/discover/search?q=<term>` directly as a public/anonymous
request to confirm the browser-visible behavior matches the response shape.

## Mutation Boundary

Do not create, edit, publish, retract, import, upload, generate keys, start an
Assistant run, post forum content, or change settings.

## Handoff

Wake MIMIR with `PASS` if the rehearsal is acceptable.

Wake DAEDALUS with exact observed/expected defects if a narrow repair is needed.

Do not go idle without a wakeup commit.

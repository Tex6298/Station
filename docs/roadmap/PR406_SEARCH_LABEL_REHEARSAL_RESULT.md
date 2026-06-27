# PR406 - Public Search Label Rehearsal Result

Date: 2026-06-27
Owner: ARIADNE
Verdict: PASS

## Freshness

Hosted web and API deployment health both reported ready at commit prefix
`d62f4e2c7ced`, satisfying the required PR405 baseline `d62f4e2c`.

## Surfaces Checked

- `/` public home search on desktop.
- `/discover` search on desktop.
- `/` public home search at 390px mobile.
- `/discover` search at 390px mobile.
- Anonymous API readback through `/discover/search?q=<term>`.

Search terms used:

- `Station Replay Alpha Note`
- `Station Replay Dev Alpha`
- `Station Replay`
- `document discussion`
- A synthetic no-result term for empty-state readback.

## Findings

- Public home and Discover rendered compact scope/provenance readback labels for
  public search results.
- Common public home and Discover results used matching label meaning from the
  shared helper.
- Public document results routed only through public Space document paths.
- Developer Space results routed only through route-safe non-UUID public slugs.
- Public Space, public persona, Salon/forum, publication, and Developer Space
  route classes remained public-facing.
- Empty/no-result states were honest on both public home and Discover.
- Desktop and 390px mobile layouts had no document-level horizontal overflow,
  clipped labels, trapped controls, or overlapping search controls.

## Direct Search Shape

Anonymous `/discover/search` responses were checked for the suggested terms.
They returned public-safe group counts only; private owner buckets were absent.
Document rows stayed allowlisted, and Developer Space rows stayed minimized to
public-safe metadata and route-safe slugs.

Observed public result groups included:

- Publications.
- Developer Spaces.
- Spaces.
- Public personas.
- Salons/forum routes.

## Safety

- No raw `source_label`, `source_type`, `source_persona_id`, API key/hash/tail
  wording, secret-shaped values, or owner-private route targets were visible in
  public search readback.
- No raw owner identifiers, document identifiers, Developer Space slugs, source
  labels, key material, or private source bodies were recorded in this result.
- No mutation paths were used: no publishing, import/upload, key generation,
  Assistant send, forum post, settings change, or auth/session change.

## Validation

- Hosted Playwright browser rehearsal against `/` and `/discover`.
- Anonymous API search response checks.
- `git diff --check`

## Next

MIMIR can close PR406 and choose the next roadmap move.

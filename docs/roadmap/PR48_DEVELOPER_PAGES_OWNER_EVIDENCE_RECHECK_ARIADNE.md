# PR48 Developer Pages Owner Evidence Recheck - ARIADNE Result

Date: 2026-06-18
Agent: A4 / ARIADNE
Verdict: Pass; PR47 can close as deployed staging complete

## Runtime Checked

- Web/API deployment identity:
  `65076251d3a7f6fb28d0258a75b1d30749a5c3a8`
- Signed owner manage routes:
  - `https://stationweb-production.up.railway.app/developer-spaces/station-replay-dev-alpha/manage`
  - `https://stationweb-production.up.railway.app/developer-spaces/animus-field-lab/manage`
- Anonymous public routes:
  - `https://stationweb-production.up.railway.app/developer-spaces/station-replay-dev-alpha`
  - `https://stationweb-production.up.railway.app/developer-spaces/animus-field-lab`
- Browser: Chrome/CDP
- Desktop viewport: `1365x900`
- Mobile viewport: `390x844`
- Account mode: signed replay owner via local env

No credentials, tokens, cookies, private prompts, private archive excerpts, raw
provider payloads, or owner IDs were printed.

## Deployment Guard

Both health endpoints passed and reported Railway commit
`65076251d3a7f6fb28d0258a75b1d30749a5c3a8`:

- web: `ok:true`, `ready:true`
- API: `ok:true`, `ready:true`

## Signed Owner Browser Rehearsal

`station-replay-dev-alpha/manage` passed on desktop and `390px` mobile:

- management console loads without sign-in loop, route error, or hard loading
  state;
- no document-level horizontal overflow;
- no visible controls render offscreen;
- left-side metrics say `Evidence`; no stale `Notes:` metric was found;
- evidence section is named `Evidence path`;
- role select includes `Methodology / architecture`, `Finding / milestone`,
  `Field log / update`, and `Note / paper`;
- role-purpose helper copy changes for all four roles;
- `Position`, `Title`, `Body`, `Publish to visitor evidence path`, and
  `Save evidence` are visible and fit;
- existing public evidence is ordered methodology, finding, field log;
- public evidence is labeled `Visible to visitors`;
- ingestion key, visual mode, widget, usage, export, and curl instruction
  sections still exist.

`animus-field-lab/manage` passed on desktop and `390px` mobile:

- management console loads without sign-in loop, route error, or hard loading
  state;
- no document-level horizontal overflow;
- no visible controls render offscreen;
- left-side metrics say `Evidence`; no stale `Notes:` metric was found;
- evidence section is named `Evidence path`;
- role select includes `Methodology / architecture`, `Finding / milestone`,
  `Field log / update`, and `Note / paper`;
- role-purpose helper copy changes for all four roles;
- `Position`, `Title`, `Body`, `Publish to visitor evidence path`, and
  `Save evidence` are visible and fit;
- existing public evidence is ordered methodology, finding, field log;
- public evidence is labeled `Visible to visitors`;
- ingestion key, visual mode, widget, usage, export, and curl instruction
  sections still exist.

## Owner-Only Smoke Create

The optional owner-only smoke create was exercised through the signed
`station-replay-dev-alpha/manage` UI.

Created item:

- title: `ARIADNE PR48 smoke 2026-06-18T21-10-33-465Z`
- role: `Note / paper`
- position: `999`
- `Publish to visitor evidence path`: left unchecked

Owner verification:

- smoke item appears in the owner evidence list;
- smoke item is labeled `Hidden from visitors`;
- smoke item is not labeled `Visible to visitors`.

## Public Route Privacy Sanity

After clearing the signed browser session, both public routes were rechecked
anonymously on desktop and `390px` mobile.

Both public routes passed:

- no document-level horizontal overflow;
- no visible controls render offscreen;
- `Project evidence`, `Live visualisation`, and `Visitors do not see` remain
  visible;
- no `Manage` link is visible;
- no `Hidden from visitors` owner-console label is visible;
- the PR48 smoke title and body are absent.

Anonymous public API readback also passed:

| Slug | Access | Public linked documents | Smoke visible |
| --- | --- | ---: | --- |
| `station-replay-dev-alpha` | `public` | 3 | no |
| `animus-field-lab` | `public` | 3 | no |

## Human-Eye Verdict

The owner evidence console now matches the public evidence-path model. The
language says evidence rather than generic notes, the form teaches the role
order, and owner-only material stays structurally separate from anonymous
visitor routes.

No DAEDALUS defect is needed from this pass.

## Caveats

- The smoke create intentionally added one owner-only staging note to
  `station-replay-dev-alpha`.
- This rehearsal did not test deleting or editing owner evidence after creation.
- This remains protected-alpha Developer Pages evidence; it does not validate
  Cloudflare, Tier 2 hosting, developer agents, public interaction modes,
  route/table renames, live DDL, tipping, or broader Developer Space
  architecture.

## Recommendation

MIMIR can close PR47 as complete for deployed staging.

Recommended next lane:

- keep any next owner-console work narrow: deletion/editing affordances,
  evidence-card readability, or owner audit clarity. Do not start Cloudflare or
  Tier 2 hosting from this result.

## Validation

- `curl.exe -fsS --max-time 30 https://stationweb-production.up.railway.app/health/deployment`
- `curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment`
- `node --check scripts/tmp-pr48-owner-evidence-recheck.mjs`
- Signed Chrome/CDP owner manage checks on desktop and `390px` mobile
- Owner-only smoke create through the rendered manage UI
- Anonymous Chrome/CDP public route checks on desktop and `390px` mobile
- Anonymous public API readback for both Developer Space slugs
- Temporary local probe script was removed before commit.

# PR373 - Publishing Trust Hosted Rehearsal Result

Date: 2026-06-26
Owner: ARIADNE
Status: PASS WITH CAVEAT

## Verdict

PASS WITH CAVEAT.

The hosted public document trust panel and owner publishing dashboard trust
line are visible, honest, and privacy-safe on fresh hosted code.

The caveat is route shape only: `/` -> `/discover` worked, but the rehearsal
used a public Space path derived from Discover feed data rather than a visible
public Space card link on the Discover page. That matches the PR373 caveat
case for a route that works from Discover but not from a clean visible Space
card path.

## Hosted Freshness

- Hosted web was ready at commit prefix `b9459d84`.
- Hosted API was ready at commit prefix `b9459d84`.
- Local ancestry confirmed `b9459d84` includes the PR367 required prefix
  `f03ffd25`.

## Public Route

Rehearsed as a signed-out public reader:

- `/` loaded.
- `Explore Discover` opened `/discover`.
- A public Space route from Discover feed data loaded.
- The public Space exposed a public document link.
- The public document route loaded and remained readable.
- A linked discussion route was present and opened successfully.

Visible public document trust readback:

- `Document trust` panel was visible.
- Document state/type/status/visibility readback was visible.
- Provenance/source boundary was visible with sanitized source readback.
- Version row was visible and kept prior drafts/version history private.
- Discussion row was visible and linked honestly to the open discussion.

Public safety checks:

- No private source bodies, archive chunks, prompt bodies, owner ids, document
  ids, thread ids, private source ids, prior private version bodies, provider
  payloads, SQL, stack traces, raw JSON, raw network locations, or
  secret-shaped values were visible.

## Owner Route

Rehearsed as the replay owner using local ignored credentials only:

- `/studio/publishing` loaded.
- The owner publishing dashboard finished loading live owner documents.
- Visible document rows showed approval/destination/version trust readback.
- Source labels were sanitized.
- The dashboard did not imply an automatic public publish bypass.
- No publishing action, approval transition, discussion creation, or document
  mutation was attempted.

Owner safety checks:

- No raw private source rows, owner ids, private ids, provider payloads, raw
  JSON, SQL, stack traces, raw network locations, or secret-shaped values were
  visible.

## Scope Control

No publish, approval, discussion, version, schema, worker, queue, provider,
billing, Redis, Cloudflare, Station Press, PDF/print, social dispatch, checkout,
Railway config, Supabase config, or broad UI semantics changed or were implied.

## Validation

| Check | Result |
| --- | --- |
| Hosted signed-out public route proof | Pass with route caveat |
| Hosted replay-owner dashboard proof | Pass |
| `git diff --check` | Pass |

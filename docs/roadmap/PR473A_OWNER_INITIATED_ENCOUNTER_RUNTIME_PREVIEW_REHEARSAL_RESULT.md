# PR473A - Owner-Initiated Encounter Runtime Preview Rehearsal Result

Owner: ARIADNE / A4

Date: 2026-06-29

Verdict:

```text
PRODUCT_DEFECT_NEEDS_DAEDALUS
```

## Summary

The hosted PR473A owner encounter runtime preview rehearsal did not pass.

Hosted web/API were ready at `2ba1ea88`, and the seeded owner account had three
personas, so the rehearsal could select a same-owner initiator/responder pair.
The private Studio owner preview panel rendered on desktop and 390px mobile,
and the panel labels the setup as owner-authored, the personas as same-owner,
and the preview as disposable, not saved, not a transcript, and not shareable.

The blocking defect is runtime generation: one owner-initiated preview click
returned the bounded UI error `Encounter preview provider setup is unavailable.`
No model-generated responder reply appeared, so the hosted lane cannot prove the
required one disposable preview response.

Signed-out public persona and public Space samples stayed clean on desktop and
390px mobile. They exposed no public encounter controls, generated encounter
output, shareable encounter pages, cross-owner controls, anonymous encounter
controls, or availability claims.

## Result

| Check | Result | Notes |
| --- | --- | --- |
| Hosted web `/health/deployment` | Pass | Ready at `2ba1ea88`. |
| Hosted API `/health/deployment` | Pass | Ready at `2ba1ea88`. |
| Hosted owner seed | Pass | Three owner personas were available; a same-owner pair could be selected without exposing raw ids. |
| Owner Studio desktop panel | Pass | Owner encounter runtime preview panel rendered and stayed private Studio-only. |
| Owner preview click | Fail | One owner-initiated click returned `Encounter preview provider setup is unavailable.` |
| Generated responder reply | Fail | No model-generated responder reply appeared, so the required disposable runtime proof is missing. |
| Owner Studio 390px mobile | Pass with defect | Panel remained visible and readable, but generated output could not be checked because the hosted preview did not run. |
| Non-durable affordances | Pass | No save/share/publish/export affordance appeared in the sampled owner panel. |
| Signed-out public persona sample | Pass | No public encounter controls, generated output, shareable pages, cross-owner controls, anonymous encounter controls, or availability claims appeared. |
| Signed-out public Space sample | Pass | No public encounter controls, generated output, shareable pages, cross-owner controls, anonymous encounter controls, or availability claims appeared. |
| Visual fit | Pass | No horizontal overflow or clipped owner/public controls appeared in sampled desktop or 390px routes. |
| Safety scan | Pass | Public samples did not expose private Memory, Archive, Canon, Continuity, Integrity, owner setup, private source text, provider settings, credentials, storage paths, raw internal ids, stack traces, table names, visitor identity, or secret-shaped material. |
| Temporary Chrome DevTools hosted harness | Fail | Harness reached the private owner panel and public samples, but runtime generation returned the provider-setup error. |
| `git diff --check` | Pass | No whitespace errors. |

## Smallest Repair

Route the smallest repair before PR473A closeout:

- make the hosted same-owner preview callable with an accepted private-context
  chat provider; or
- fail-close the owner preview panel before enabling generation when provider
  setup is unavailable, with copy that says the preview is paused rather than
  runnable.

Do not broaden into cross-owner encounters, background loops, durable
transcripts, source retrieval, public/shareable output, billing, workers,
queues, schema, storage, Redis, Cloudflare, or broad UI.

No `pnpm typecheck` was run because this result changes docs and agent state
only.

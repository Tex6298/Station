# PR468A - Public Persona Hosted Route Reachability Result

Owner: DAEDALUS / A2

Date: 2026-06-29

Verdict: `ARGUS_ACCEPTED_AFTER_PATCH`

## Summary

DAEDALUS patched the PR468A public persona route reachability defect that
ARIADNE found during hosted anonymous-chat rehearsal.

The patch keeps PR468 narrow. It does not broaden anonymous public chat, change
public reporting, add durable anonymous transcript or identity storage, or
expand public source access.

## API Changes

Public persona read routes now return bounded public data or a bounded
unavailable response instead of waiting indefinitely behind a slow public
read/eligibility/source path:

- `GET /personas/public/station-replay-alpha-persona`
- `GET /personas/public/station-replay-alpha-persona/context-preview`
- `GET /personas/public/station-replay-alpha-persona/events`
- `GET /personas/public/roulette`

The bounded failure response is:

```json
{
  "error": "Public persona data is temporarily unavailable.",
  "code": "public_persona_route_unavailable"
}
```

It does not include raw owner ids, public slugs, source ids, stack traces,
private source text, headers, cookies, credentials, prompts, or provider
payloads.

## Web Changes

The public persona page now treats the primary public persona readback as the
required load and treats context preview/public update reads as optional bounded
reads.

When primary readback succeeds, the page can render public persona state and the
PR468 anonymous alpha form even if preview or events fail or time out. Optional
sections show bounded public copy instead of blocking the whole page.

## Validation

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 14 tests passed, including bounded unavailable responses for public readback, context-preview, events, and roulette when eligibility reads hang. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts` | Pass | 7 tests passed, including bounded optional-read copy. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo typecheck passed for API and web. |
| `git diff --check` | Pass | CRLF normalization warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

Hosted smoke was not rerun in this DAEDALUS pass because the patch is not on the
hosted deployment until after push. ARGUS should review the code/test boundary;
MIMIR can then reroute ARIADNE for the hosted anonymous-chat rehearsal rerun.

## Handoff

ARGUS should review that:

- public read routes now fail bounded without leaking private or raw internal
  material;
- optional context/update reads cannot block the public persona page from
  rendering primary readback and chat availability;
- PR468 remains one anonymous alpha persona only;
- owner disable, no durable anonymous transcript/identity, public-source-only
  prompt/response, signed-in-only reporting, and owner-paid token usage remain
  unchanged.

## ARGUS Review

ARGUS accepted this patch on 2026-06-29 after a narrow web helper sanitizer
patch:

`docs/roadmap/PR468A_PUBLIC_PERSONA_HOSTED_ROUTE_REACHABILITY_REVIEW_RESULT.md`

MIMIR should reroute ARIADNE for the hosted PR468 anonymous-chat rehearsal after
this patch is pushed and deployed.

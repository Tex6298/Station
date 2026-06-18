# PR36 Launch-Core Human Rehearsal - ARIADNE Result

Date: 2026-06-18
Agent: A4 / ARIADNE
Verdict: Pass with caveats; no DAEDALUS blocker found

## Runtime Checked

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`
- Railway web/API deployment identity:
  `af9acb96ec8520d416851317859af5c7793dde82`
- Persona: `Station Replay Persona`
- Persona id: `7944d8be-6b1d-49d9-b3b9-7e438810b414`
- Public Space: `station-replay-alpha`
- Developer Space: `station-replay-dev-alpha`

The replay owner account was used through local env credentials without printing
credentials, tokens, cookies, private prompts, archive excerpts, raw provider
payloads, or private response bodies.

## Launch-Core Path

The current staging app is launch-core usable for the protected-alpha path.

API rehearsal passed:

- created a fresh private persona;
- reused the seeded replay persona for the full continuity path;
- sent a streamed chat turn with status events, runtime context assembly, and
  exactly one persisted user/assistant pair;
- archived the chat and created Memory/Canon candidates;
- accepted one Memory candidate and rejected one Canon candidate;
- created and read Continuity records;
- searched private archive sources without exposing raw transcript bodies;
- created and read an export package and portable bundle;
- published a labelled public document from the owner account;
- displayed that document through the public Space route;
- created and read the linked public forum discussion;
- used Station Assistant as an operational surface with next actions and
  guardrail copy.

Browser rehearsal passed:

- signed desktop Studio, onboarding, persona chat, Continuity, Archive,
  Publishing, and Station Assistant routes;
- signed 390px mobile onboarding, persona chat, Continuity, Archive,
  Publishing, and Station Assistant routes;
- anonymous desktop and 390px mobile public chain from `/` to `/discover`, the
  public Space, public document, linked forum discussion, and Developer Space;
- auth persistence after reloading `/studio`.

## UX Findings

No launch-core blocker was found.

Accepted behavior:

- Continuity is reachable as its own route, not only as runtime-context counts.
- Station Assistant reads as an operational helper, not as a persona.
- Public Space and public document routes did not expose private Studio text,
  raw provider payloads, debug data, or route metadata.
- Public discussion stayed on the public document/forum chain.
- Developer Space public observatory renders live state for visitors.
- Public mobile routes had no document-level horizontal overflow.

Caveats:

- Signed mobile `/studio` still measured `407px` scroll width on a `390px`
  viewport because the global top navigation's `Developer` link sits off the
  right edge. This matches the previously known dense global-nav caveat and was
  not specific to PR36 launch-core content.
- Mobile Archive loaded and passed route/layout checks, but the automated text
  probe did not find the exact word `Search` on the page. The signed API archive
  search itself returned owner-scoped results across archive, Memory, Canon,
  persona files, import jobs, archived transcripts, Continuity records, and
  Integrity Sessions.
- Developer Space has live observatory state, but the seeded public experience
  still has thin methodology/finding/field-log storytelling.
- Archive/import source states are functional but still thin for a polished
  demo narrative.
- Provider/config failure simulation was not attempted against the shared
  staging environment.

## Cloudflare Trigger Check

Cloudflare remains deferred.

ARIADNE did not find a concrete retrieval, latency, public-edge, or
NESTstyle-memory defect that current Station/Supabase/Gemini behavior cannot
reasonably cover:

- streamed chat completed in the staged API path with normal status progression;
- private archive search returned results across the expected source set;
- public Space, document, forum discussion, Discover, and Developer Space routes
  rendered from Railway without a public-edge blocker;
- no launch-core path required Cloudflare config to pass.

## Recommendation

MIMIR can treat PR36 as a launch-core rehearsal pass with caveats.

Recommended next decision:

- close PR36 and keep Cloudflare deferred;
- optionally open narrow polish lanes for mobile global navigation, Archive
  search affordance/copy, and Developer Space methodology/storytelling;
- no DAEDALUS code blocker or ARGUS validation wake is required unless MIMIR
  chooses to convert one of those caveats into an implementation lane.

## Validation

- `curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment`
- `curl.exe -fsS --max-time 30 https://stationweb-production.up.railway.app/health/deployment`
- Signed API launch-core rehearsal against Railway staging
- Chrome/CDP browser pass at `1365x900`
- Chrome/CDP browser pass at `390x844`
- Auth persistence reload check on `/studio`
- Docs-only change; no imports or scripts touched, so `pnpm typecheck` is not
  required by the PR36 validation rule.

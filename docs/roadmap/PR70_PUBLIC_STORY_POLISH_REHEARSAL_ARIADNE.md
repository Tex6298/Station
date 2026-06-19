# PR70 Public Story Polish Rehearsal - ARIADNE Result

Date: 2026-06-19
Agent: A4 / ARIADNE
Verdict: accepted

## Scope

ARIADNE rehearsed the anonymous public story path against Railway staging after
PR70 deployed.

Runtime checked:

- Web: `f830041df118c4e3e63cb1d9b5985e2ffb2121b7`
- API: `f830041df118c4e3e63cb1d9b5985e2ffb2121b7`
- Services: `@station/web`, `@station/api`

Route order:

- `/`
- `/discover`
- `/space/station-replay-alpha`
- `/space/station-replay-alpha/documents/dce9dcdc-067e-488b-baae-b09c0541077f`
- `/forums/documents-and-codexes/ce8c1f39-41ec-42a0-9cce-1cf87e10cabf`

Account mode: anonymous visitor only. No signed session, credentials, cookies,
or owner context were used.

## API Snapshot

Anonymous public API reads returned `200` for:

- public Space;
- public document;
- document discussion lookup;
- linked forum thread;
- Discover latest feed;
- Discover search for `PR38 Final Demo Field Log`.

The replay Space remains public with 5 works, 0 authored pages, and 0 public
personas. The public document is `published`, `public`, `user_authored`, and
has a linked discussion. The linked thread is `public`, has the source-document
relationship, and remains in `documents-and-codexes`.

Discover feed showed exactly one story document row and zero duplicate linked
thread rows for the PR68/PR70 story. Discover search still found the Space,
document, and linked thread.

## Browser Result

Desktop `1365x900` and mobile `390x844` passed.

Public front door:

- `Station public front door` and `Public search only` remained visible.
- Private Studio/public Discover boundary stayed clear.

Discover:

- The document feed card showed `Open document and linked discussion`.
- The card still routed through the public document href.
- No standalone linked-thread row appeared in the feed.
- The cue fit on desktop and `390px` mobile without document-level overflow or
  offscreen controls.

Public Space:

- `Station Replay Alpha` still rendered as a public surface.
- The works-led Space now showed `Works-led` and `Collaborators / Optional`.
- `0 pages` and `0 personas` counters were absent.
- Empty public-persona copy framed public personas as optional story context.
- Featured Works/Public Library continued to carry the public story.

Public document and thread:

- The public document kept publication, user-authored provenance, and `Open
  discussion` visible.
- The forum thread kept `document discussion` and `Read source document`
  visible.
- Document-to-thread and thread-to-document routeability remained intact.

## Privacy And Controls

The anonymous route chain did not expose private Studio, Memory, Continuity,
Integrity, Archive import, Settings AI Activity, Developer Space manage,
developer keys, provider traces, raw payload markers, credential-shaped text,
or secret-shaped values.

Owner/write controls were not visible to the anonymous visitor:

- no publish;
- no signal-share;
- no start-discussion;
- no reply form;
- no vote controls;
- no report controls.

## Verdict

Pass. PR70 resolves the two PR68 public-story caveats as a protected-alpha UI
polish slice:

- document-led public Spaces now read as intentional even with thin pages or
  personas;
- Discover makes the linked discussion path visible without duplicating the
  linked thread in the feed.

No DAEDALUS fix is needed.

## Validation

- Public Railway health/deployment preflight
- Anonymous public API route reads
- Chrome/CDP desktop `1365x900` public route rehearsal
- Chrome/CDP mobile `390x844` public route rehearsal
- `node --check scripts/tmp-pr70-public-story-rehearsal.mjs`
- `node scripts/tmp-pr70-public-story-rehearsal.mjs`
- `git diff --check`

The temporary local rehearsal helper was removed before commit.

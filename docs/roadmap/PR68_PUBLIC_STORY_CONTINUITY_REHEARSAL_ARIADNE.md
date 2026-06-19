# PR68 Public Story Continuity Rehearsal - ARIADNE Result

Date: 2026-06-19
Agent: ARIADNE / A4
Verdict: accepted

## Scope

ARIADNE rehearsed the public story chain as an anonymous visitor against
Railway staging:

- `/`
- `/discover`
- `/space/station-replay-alpha`
- `/space/station-replay-alpha/documents/dce9dcdc-067e-488b-baae-b09c0541077f`
- `/forums/documents-and-codexes/ce8c1f39-41ec-42a0-9cce-1cf87e10cabf`

Runtime checked:

- Web: `b1e9ce3ae5d2f8a6c4f0e5c270dd2cbc216c567f`
- API: `b1e9ce3ae5d2f8a6c4f0e5c270dd2cbc216c567f`
- Services: `@station/web`, `@station/api`

No signed-owner comparison was needed. The anonymous public route evidence was
enough to evaluate the requested privacy and visibility boundary.

## API Snapshot

Anonymous public API reads returned `200` for:

- public Space
- public document
- document discussion lookup
- forum thread
- Discover feed
- Discover search for `PR38 Final Demo Field Log`

The public Space is `Station Replay Alpha`, access `public`, with 5 public
works. The selected document is `published`, `public`, `user_authored`, and has
a linked discussion. The linked thread is `public`, in
`documents-and-codexes`, has one comment, and includes the source document
relationship.

Discover search found the Space, document, and linked thread. The latest
Discover feed contained the Space and document but not the thread; this is a
caveat, not a blocker, because the route story is intact through the document
discussion link and the thread source-document link.

## Browser Result

Desktop `1365x900` and mobile `390x844` passed the route chain with:

- no document-level horizontal overflow;
- no offscreen controls;
- no visible application, auth, route, Space, document, or thread errors;
- no owner-only public controls shown to the anonymous visitor.

The front door clearly framed Station as the public front door and preserved
the public-search boundary. Discover made public Spaces, publications, forum
threads, and Developer Space observatories legible, and the public search
returned routeable results for the demo story.

The public Space presented `Station Replay Alpha` as a public surface with
featured work and a public library. The public document made the publication
state, user-authored provenance, discussion context, and `Open discussion`
control visible. The forum thread made the `document discussion` context and
`Read source document` link visible.

## Privacy Boundary

The anonymous route chain did not expose private Studio, Memory, Continuity,
Integrity, Archive import, Settings AI Activity, Developer Space manage,
developer keys, provider traces, raw payload markers, credential-shaped text,
or secret-shaped values.

Forum reply, vote, and report controls stayed signed-in only. Document owner
actions such as publish, signal-share, and start-discussion were absent for the
anonymous visitor.

## Caveats

- The public Space API currently reports 0 authored pages and 0 public personas.
  The public story still works through Featured Works and Public Library.
- The linked thread was not present in the latest Discover feed, but it was
  present in Discover search and reachable from the document.

## Recommendation

PR68 can close. No DAEDALUS fix is needed.

MIMIR should avoid opening Redis, Cloudflare, provider migration, parser/OAuth,
worker, hosted runtime, Project, billing, DexOS, or broad UI work without a new
concrete route-level blocker.

## Validation

- Anonymous public API route reads
- Chrome/CDP browser rehearsal at desktop `1365x900`
- Chrome/CDP browser rehearsal at mobile `390x844`
- `node --check scripts/tmp-pr68-public-story-continuity-rehearsal.mjs`
- `node scripts/tmp-pr68-public-story-continuity-rehearsal.mjs`
- `git diff --check`

The temporary rehearsal helper was removed before commit.

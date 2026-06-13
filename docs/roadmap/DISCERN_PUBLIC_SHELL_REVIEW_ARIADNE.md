# Discern public shell port review - ARIADNE

Date: 2026-06-13

Owner: ARIADNE, A4 UX Navigator

## Verdict

Do not commit the current local public shell/home/nav/search diff as-is.

The direction is worth salvaging: Station does need a calmer public front door
that makes Spaces, Developer Spaces, publishing, forums, and Studio entry points
more legible than the current raw Discover route. But the copied port is not yet
Tex-native Station UX. It carries fake/demo-heavy Discern content, broken
encoding, a CDN icon dependency, broad global CSS that reaches Studio and shared
controls, public/private search ambiguity, and mobile fit issues.

ARIADNE recommends opening a narrow DAEDALUS cleanup lane:
`DISCERN-PUBLIC-SHELL-CLEANUP-01`.

## What To Keep

- Keep the product direction: `/` can become a public home/front door rather
  than only re-exporting Discover.
- Keep the idea of grouping public surfaces as Developer Spaces, publications,
  public Spaces, and forum/community discussion.
- Keep a search dropdown abstraction only if it preserves the existing
  public/private search split.
- Keep the calmer public nav language if it remains route-accurate and mobile
  safe.
- Keep a desktop-only rail only if it is scoped to public surfaces, uses local
  icons or text labels, and does not expose private/protected affordances to
  anonymous visitors.

## What Must Change Before Accept

### Remove fake activity

The fallback arrays in `apps/web/components/discover/public-home.tsx` currently
present specific named projects, people, follower counts, paper counts, live
experiments, subreddit-like channels, and active discussion counts as if they
are real Station content.

For Station, empty public surfaces should be honest. Replace fake fallback cards
with quiet empty or starter states that say what will appear there once public
content exists. Do not present fabricated live observatories, papers, followers,
forum scores, or creator identities.

### Fix broken visible text

The copied files contain mojibake such as `â€”`, `Â·`, `â†’`, `â€¦`, and
`CRAFTÃ‰E`. These appear in visible copy and metadata. Convert the content to
clean ASCII or correct UTF-8 text before any commit.

### Remove the CDN icon dependency

`apps/web/app/layout.tsx` loads Tabler icons from jsDelivr. That should not ship
without ARGUS approval. Prefer local text labels, existing local icon patterns,
or a repo-managed icon dependency introduced through the normal package path.

### Scope CSS to the public shell

The added `globals.css` layer changes shared `.card`, `.button`, `.input`,
`.textarea`, `.select`, `.studio-*`, and body-level colors. That is too broad
for a public shell parity slice and risks silently restyling Studio, Billing,
Archive, Forums, Developer Spaces, and protected/private workflows.

Move the public-shell styling behind dedicated classes or a component-scoped
pattern. Do not globally restyle shared primitives or Studio surfaces in this
lane.

### Preserve private Studio boundaries

Hiding the top nav on `/studio` is not automatically wrong because Studio has
its own sidebar/mobile navigation. But the cleanup must confirm Studio still
has a clear path to settings, billing, public surfaces, and sign-out on desktop
and mobile. Do not use this public-shell lane to redesign Studio.

### Fix public/private search behavior

The existing Discover search API already separates visitor-visible public
results from authenticated owner-private results. The new search UI must mirror
that boundary:

- Anonymous public home search should show only public-safe buckets.
- Public persona results should not link to `/studio/personas/:id`.
- Owner-private results should not be mixed into the public home dropdown unless
  the UI clearly frames them as private owner results and routes only to valid
  protected Studio destinations.
- Do not expose private archive, memory, canon, import job, or archived chat
  results from the public shell unless MIMIR explicitly opens that product lane.

### Fix route accuracy

All public home links must target routes that Tex actually supports. Watch
especially:

- persona result links;
- document results without a Space slug;
- left-rail Settings/Notifications for anonymous visitors;
- any copied Discern-only destination.

Do not add backend routes in this cleanup lane.

### Fix mobile fit

Local Chrome render at 390px showed the top nav horizontally clipping and the
first hero viewport truncating visible text. The public home must fit without
horizontal overflow at common mobile widths.

## Suggested DAEDALUS Patch Shape

DAEDALUS should sanitize, not expand:

1. Keep `/` as a public home only if the page can render honest live data or
   honest empty states.
2. Remove CDN icons and replace icon-only affordances with local text/icon
   patterns.
3. Replace fake fallback arrays with bounded empty states and links to existing
   routes.
4. Scope all new CSS to public-home/topnav/optional-rail classes; do not restyle
   shared primitives or Studio.
5. Keep the existing Discover front door behavior available at `/discover`.
6. Gate search buckets using the same visitor/member boundary as the existing
   Discover UI.
7. Fix invalid persona/document routes or omit those buckets until valid public
   routes exist.
8. Fix mobile nav and hero overflow at 390px.
9. Add a small focused test for search bucket/link mapping if the dropdown is
   retained.

## Validation Run

- `npx --yes pnpm@10.32.1 --filter @station/web typecheck` passed.
- `npx --yes pnpm@10.32.1 --filter @station/web lint` passed with existing
  unrelated warnings.
- Local web dev server served `/health` on port 3104.
- Local Chrome headless mobile screenshot at 390px was inspected. Screenshot was
  not committed.

## Wakeup Workflow Finding

A4 missed the wakeup because state was advanced before the review happened.

Recent commit `550e39d` correctly contained `WAKEUP A4`, but `f486e75` later
recorded ARIADNE consuming that wakeup as a state-only marker while the local UX
port still awaited review. After that, `node scripts/triad-watch.mjs A4`
reported no new wakeups.

This does not look like a wakeup regex failure. It is a workflow/tooling hazard:
an agent can mark another agent's wakeup consumed before that agent has produced
the required response.

Recommended fix:

- Do not commit state markers for another agent unless that agent has completed
  the requested work or explicitly asked for the marker.
- Consider splitting watcher behavior into "peek" and "ack" modes later, so
  reading or forwarding a wakeup cannot silently consume it for the assigned
  agent.

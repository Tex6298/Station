# Staging Human Route Implementation - MIMIR

Date: 2026-06-14
Owner: MIMIR / A1
Status: opened for ARIADNE human-route implementation.

## Trigger

Marty's latest human rehearsal surfaced three important points after the final
hosted sweep:

- The browser did not remember the user even though Marty did not intentionally
  log out. This may mean auth persistence is less robust than the earlier
  smoke implied.
- Some run-of-show checks were not obvious to perform manually, especially the
  public chain, Continuity as its own stop, and the staging caveats around
  Archive imports and Developer Space storytelling.
- The landing page now resembles the Discern-side public direction, but many
  other surfaces still feel generic or vibe-coded rather than designed as the
  same Station product.

This is not an auth-only fix lane. Auth persistence is one human-run finding.
ARIADNE should implement the human route by actually walking the hosted app as a
human would, then turn any failures into exact follow-up work.

Marty also provided screenshots that should be treated as human-route evidence:

- `/discover` signed-in public entry state with recent activity.
- `/forums` category list where the `Replies` label appears oversized or
  visually collides with the category card content.

## Auth Persistence Context

The current web auth implementation stores:

- `station.auth.session.v1` in `localStorage`;
- a `station-auth` cookie with a 30-day max age.

However, the web restore path verifies the stored access token through
`/auth/me` and clears the stored session if that probe fails. The stored
`refreshToken` is not currently used to renew an expired access token.

This is not an intentional "log out after every visit" posture. If a normal
same-browser return loses the session without pressing Sign out, treat it as a
potential persistence blocker and wake DAEDALUS with exact reproduction steps.

## ARIADNE Task

Use the hosted staging app as a human would, not only direct API probes. The
output should make the human run easier for Marty to repeat and should identify
where the experience still falls short of the intended Station/Discern product
feel.

Check these routes and transitions:

1. Public chain:
   - `/`
   - `/discover`
   - public Space `station-replay-alpha`
   - public document from that Space
   - linked forum discussion for that document
2. Forums:
   - `/forums`
   - at least one category page
   - the seeded replay thread if reachable from the UI
   - inspect whether the `Replies` label/card layout is visibly broken on
     desktop and mobile.
3. Auth persistence:
   - sign in as the replay owner;
   - confirm protected routes render;
   - refresh;
   - navigate away and back;
   - close/reopen the same browser profile if practical;
   - record sanitized booleans only: localStorage session present, auth cookie
     present, top nav signed-in, `/auth/me` accepted, protected route stayed
     accessible.
4. Continuity as its own stop:
   - navigate from Studio/persona to the Continuity tab/page as a human would;
   - confirm it is understandable as a separate demo beat, not just runtime
     context counts.
5. Narrative caveats:
   - Archive import/library surface still shows no pasted/file import sources;
   - archived chats/runtime archive context are counted separately;
   - Developer Space has live state but thin public methodology/field-log
     storytelling.
6. Cross-surface design coherence:
   - compare the current public front door direction against `/discover`,
     `/forums`, public Space/document/discussion, Developer Space, Studio,
     Memory, Continuity, Archive, Billing, and Settings;
   - call out any surface that still looks generic, card-stacked, placeholder,
     or disconnected from the Station/Discern direction;
   - propose route-specific UX slices rather than a vague redesign mandate.

## Classification

Classify findings as:

- pass for human rehearsal;
- future polish;
- DAEDALUS blocker;
- ARGUS security/visibility concern.

## Required Response Path

If the route/persistence follow-up passes, wake MIMIR with a closeout verdict
and any human instructions that make the route easier to run.

If session persistence fails without an explicit sign-out, wake DAEDALUS with
the exact browser steps, timing, route, and sanitized storage/cookie/auth
booleans. Do not print tokens, cookies, localStorage values, raw response
bodies, IDs, credentials, or private text.

If the forum layout is visibly broken, wake DAEDALUS with route, viewport, and
expected/observed UI details.

If the broader visual/design problem is real but spans multiple surfaces, wake
MIMIR with a ranked route-specific UX implementation plan and the recommended
first DAEDALUS slice. If one surface is clearly fixable now, wake DAEDALUS with
the exact route, intended visual target, file allow-list, validation, and
forbidden changes.

If any public/private/auth visibility boundary looks wrong, wake ARGUS with the
exact hostile-path question.

Do not go quiet without a wakeup.

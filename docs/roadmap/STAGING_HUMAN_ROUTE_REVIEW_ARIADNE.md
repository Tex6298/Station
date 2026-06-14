# Staging Human Route Review - ARIADNE

Date: 2026-06-14
Reviewer: ARIADNE / A4 UX Navigator
Status: DAEDALUS patch required for `/forums`; broader visual coherence needs
MIMIR sequencing.

## Scope

This review follows `docs/roadmap/STAGING_HUMAN_ROUTE_FOLLOWUP_MIMIR.md` after
Marty's human rehearsal notes.

Hosted staging targets:

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`

Replay credentials were read from the ignored local `.env`. Tokens, cookies,
localStorage values, raw response bodies, private excerpts, prompts,
completions, owner/persona/document/thread IDs, and screenshots were not
committed.

## Route Pass

Public chain:

- `/`: passed in hosted Chrome.
- `/discover`: passed in hosted Chrome.
- `/space/station-replay-alpha`: passed in hosted Chrome.
- Public document from that Space: passed in hosted Chrome.
- Linked forum discussion: passed in hosted Chrome.

Forums:

- `/forums`: route renders, but the category-list badge layout is broken.
- First category page: 200.
- Seeded replay thread: passed in hosted Chrome.

Authenticated route:

- UI sign-in as replay owner reached `/studio`.
- `/studio`, persona workspace, Memory, Continuity, Archive, Billing, and
  Settings remained reachable in hosted Chrome.

Continuity:

- The persona Continuity page works as a separate stop. It has the Timeline tab
  active, continuity metric cards, the timeline record, and the source-link
  capture panel. It is understandable enough for rehearsal, but still feels
  closer to a dense internal tool than a polished continuity story.

Archive and Developer Space caveats:

- Archive correctly explains that 0 pasted/file import sources does not mean
  the persona has no archive material; archived chats/runtime archive context
  are counted separately.
- Developer Space correctly shows live observatory state and also admits there
  are no public project notes attached yet.

## Auth Persistence

The immediate same-profile persistence failure was not reproduced.

Sanitized booleans stayed true after each step:

- localStorage session present;
- `station-auth` cookie present;
- signed-in top nav present;
- `/auth/me` accepted the stored access token;
- `/studio` stayed accessible.

Steps checked:

- after UI sign-in;
- after refresh;
- after navigating away to Discover;
- after navigating back to Studio;
- after closing and reopening the same Chrome profile.

Residual risk:

- This did not simulate a later access-token expiry. The code path still does
  not use the stored refresh token to renew an expired access token, so Marty's
  longer-return logout report remains plausible even though it was not
  reproduced in the immediate hosted pass.

## DAEDALUS Blocker

Route: `/forums`

Viewports:

- Desktop: 1365 x 900.
- Mobile: 390 x 844.

Expected:

- Category cards should be scannable.
- The left badge should act like a compact category icon, count, or short
  marker.
- Category title and description should not collide with the badge.

Observed:

- Each category card renders the literal word `Replies` inside a 42px badge.
- On mobile, the badge text measured 53px of scroll width inside a 40px client
  width and visibly spills into the category title column.
- Desktop shows the same wrong badge treatment at a smaller scale.

Probable implementation source:

- `apps/web/app/forums/page.tsx` renders `Replies` inside the fixed-size badge
  div.

Recommended DAEDALUS patch:

- Replace the `Replies` text inside the 42px visual badge with a compact marker
  that cannot overflow, such as the category initial or a simple forum glyph.
- If reply/thread count metadata is later added, place it as text metadata on
  the right side of the card, not inside the icon badge.
- Preserve forum routes, category loading, thread links, auth, moderation,
  reporting, and backend semantics.

Validation:

- Hosted or local `/forums` at 1365 x 900: no badge overflow or category-title
  collision.
- Hosted or local `/forums` at 390 x 844: no badge overflow or category-title
  collision.
- `pnpm typecheck` if the patch touches TypeScript/TSX.

## Visual Coherence

The broader design problem is real and spans surfaces, so it should be sliced
rather than treated as a vague redesign.

Ranked UX implementation plan:

1. Forums category-card repair.
   - Owner: DAEDALUS first, ARIADNE review after patch.
   - Why first: it is visibly broken and small enough to fix without reopening
     product direction.
2. Public front door and signed-in Discover coherence.
   - Owner: MIMIR should define the exact target before DAEDALUS patches.
   - Evidence: `/` is now a light editorial public-entry surface, while signed-
     in `/discover` returns to a dark card-heavy shell with a left account
     rail. The mismatch makes the product feel like two unrelated apps.
3. Forum public surface polish.
   - Owner: MIMIR then DAEDALUS.
   - Scope: category list hierarchy, category page, thread/discussion handoff,
     mobile spacing, and moderation/report affordance clarity.
4. Public Space/document/discussion chain.
   - Owner: MIMIR then ARIADNE/DAEDALUS.
   - Scope: make Space feel like a microsite and document discussion feel like
     managed community attached to public work, not generic posts/cards.
5. Developer Space storytelling.
   - Owner: MIMIR then DAEDALUS.
   - Scope: keep the observatory live, but add a better empty/story state for
     methodology, findings, and field logs when no public project notes exist.
6. Studio continuity narrative polish.
   - Owner: MIMIR after the public chain.
   - Scope: Continuity and Archive already function, but need clearer rehearsal
     language and calmer hierarchy so they read as continuity/trust
     infrastructure rather than generic internal tooling.

## Classification

Pass for human rehearsal:

- Public chain routes.
- Same-session and same-profile auth persistence.
- Continuity as a separate stop.
- Archive and Developer Space caveat copy.

DAEDALUS blocker:

- `/forums` category-list badge overflow/collision.

Future polish:

- Public/Discover design mismatch.
- Forum/category/thread visual hierarchy after the badge fix.
- Developer Space methodology/field-log storytelling.
- Studio continuity/archive narrative hierarchy.

ARGUS concern:

- None found in this pass.

# Discern Navigation/Search IA Review - ARIADNE

Date: 2026-06-13
Reviewer: ARIADNE / A4
Status: review-only verdict. No implementation authorized.

## Decision

Park navigation/search IA for staging.

This chooses MIMIR's outcome 1: the current public navigation is good enough for
staging, and the Discern left-rail/search clues should stay parked until a
separate product lane explicitly reopens them.

## Product Rationale

Current Tex navigation already keeps the important place boundaries legible
enough for staging:

- anonymous public navigation shows public surfaces first: Discover, Writing,
  Forums, sign-in, and sign-up;
- signed-in private destinations appear only after auth and remain backed by
  protected route guards;
- the account menu already carries Studio, My Space, Developer Spaces, Billing,
  and Settings without needing a new global rail;
- Discover now has explicit public/community/private search language and does
  not need another search behavior slice.

The signed-in public top nav can place the `Developer` text link off-canvas at
`390px`, but the row is intentionally horizontally scrollable and does not
increase document/body width. That is a future polish clue, not a staging
blocker.

## Discern Left-Rail Verdict

Do not port the Discern left rail.

Reasons:

- it makes Station feel closer to a generic dashboard shell;
- it mixes public surfaces, private routes, settings, and a notifications icon
  into one always-on rail before Station has decided where that rail belongs;
- it would need route-promise, auth, privacy, and mobile behavior decisions
  before any code is safe;
- it does not improve the active staging foundation enough to justify global
  navigation churn.

## Search IA Verdict

Do not open another search implementation slice now.

The current accepted search work already preserves the needed boundaries:

- public search on anonymous surfaces;
- public plus community-visible language for signed-in Discover search;
- private Studio archive, memory, canon, import, and continuity excluded from
  public search surfaces;
- routeable result groups only.

## Future Reopen Shape

If MIMIR later decides mobile nav polish is worth opening, keep it narrow:

`NAV-MOBILE-PRIVATE-LINKS-01`

Possible target:

- preserve anonymous public nav as-is;
- on signed-in mobile public pages, reduce private text-link pressure and rely
  on the avatar menu for private destinations;
- do not add a left rail;
- do not add routes;
- do not change search behavior.

Suggested allow-list if reopened:

- `apps/web/components/nav/top-nav.tsx`
- `apps/web/app/globals.css`

## Next Recommendation

Return to backend/staging readiness or the active V3 foundation lane. The
public UI has enough direction for staging without another Discern UI import
slice.

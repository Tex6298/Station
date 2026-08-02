# PR541 Institution Community Presence - DAEDALUS Result

Date: 2026-08-02

Status:

```text
READY_PR541_EFFECTIVE_SALON_VISIBILITY_CORRECTION_FOR_ARGUS
```

## ARGUS Blocker Correction

Exact correction source `c84464f810d5b40d2d08f92bb8c6c3b798d959c0` is
deployed on both API and web. Discover new/rising feed threads, featured
threads, thread search, Salon search, and public Persona Salon context/events
now compose the effective Institution principal and controlling Salon state.
Missing principal joins, related-query failures, unverified or private
Institutions, inactive Salons, and viewer-ineligible Salon visibility fail
closed. Ordinary categories and personal-principal Salons retain their existing
behavior.

Institution owner access to the delegated moderation queue now precedes the
personal community-tier gate. Personal owners and delegated moderators keep
their existing tier behavior. Focused coverage proves verified/public,
private, unverified, missing-join, query-failure, paused, archived, private,
unlisted, and community Salon states plus a visitor-tier Institution owner.
Both Institution fixtures use the migration-valid exact-one-principal shape.

The reversible hosted proof passed public, private, and restored states across
Salon search, thread search, new feed, featured feed, Persona context, and
Persona events. Paused and private Salon states also suppress all six while
direct forum and public Institution aggregate controls close. The same owner
reached the report queue while temporarily set to personal tier `visitor`.
Cleanup restored owner tier `private`, Institution
publication, and the retained thread's null Persona link; disposable Persona
and featured rows are both zero.

## Result

PR541 was initially implemented and hosted on source `783a0ade`. Migration
`097_institution_community_presence.sql` is applied and ledgered exactly once at
SHA-256 `CFA04E4ACD528EEBFD7A3D8776DC20CB7E9A656F41D23FB3156025A47C06B825`.

The retained `Station Institutional Alpha` now owns one first-class public
Salon, `Station Institution Salon Alpha`, backed by the existing forum category,
thread, comment, report, and local moderation stack. The retained synthetic
thread is `PR541 retained Institution Salon discussion` with one retained member
reply.

## Authority And Persistence

- Institution Salon rows have a nullable personal owner and a first-class
  Institution principal with an exact-one-principal constraint.
- Institution principal fields are immutable; Institution rows are restricted
  to one public `salon` without personal or Developer Space links.
- Service-only atomic creation produces the category, Salon, and typed
  `community_created` audit event together.
- Anonymous, unrelated, member, null-actor, and unknown-actor creation attempts
  fail closed. Repeated owner creation returns conflict with zero row/audit drift.
- The Institution owner derives local owner authority through the joined
  principal. Active membership alone grants no moderator authority.
- Public forum attribution is bounded to Institution name, slug, verified state,
  and public href. Institution publication loss makes public Salon routes and
  attribution unavailable while owner/member private truth remains readable.

## Hosted Proof

Both Railway services report exact source `c84464f810d5b40d2d08f92bb8c6c3b798d959c0`.
Hosted checks prove:

- migration ledger `1`, exact ledger/hash `1`, and browser RPC grants `0`;
- personal subcommunity rows `1` with unchanged fingerprint
  `dc1914b354a2cd281a2b36bbcd63e7fb`;
- unchanged non-target policy fingerprint
  `0059a6a603f8668b46a8229f8a7bd6a2`;
- owner/member private roles are truthful and member moderation actions are `0`;
- member thread/reply creation uses ordinary API routes and private-tier policy;
- owner report queue, hide, report resolution, and restore complete through the
  existing local moderation routes;
- signed-out Institution -> Salon -> retained thread traversal succeeds;
- Institution publication loss, Salon pause, Salon private visibility, Space
  draft state, and category mismatch remove their public surfaces, and exact
  restoration returns them;
- retained Salon/thread/reply counts are `1/1/1`, report and fixture residue are
  `0/0`, and the retained Institutional Space remains version/audit `8/8`.

Browser proof passed owner desktop `1440px`, member dark `390px`, signed-out
desktop `1440px`, and signed-out dark `375px` journeys with no horizontal
overflow or placeholder leakage. Category and thread surfaces show bounded
verified Institution provenance.

## Source Correction

Initial source `1342a33a` deployed the schema, routes, DTOs, and UI. Hosted
moderation rehearsal then found that one delegated-queue loader still selected
the Salon without its Institution join, denying the Institution owner. The
bounded correction `783a0ade` added that join. Source `fa598c7e` composed
Institution publication and visitor-tier owner authority; final source
`c84464f8` also composes active/viewer-visible Salon state and repairs the
exact-one-principal fixtures. No schema correction or second migration was
needed.

## Validation

Frozen install passed. Focused suites passed: Institution community `18/18`,
Institutions `18/18`, Institution publications `4/4`, Institution Spaces `6/6`,
community `59/59` after the correction, reports `9/9`, document discussions
`9/9`, auth `24/24`, Projects `33/33`, Spaces `11/11`, Developer Spaces `61/61`,
writing `35/35`, profile boundary `5/5`, exports `15/15`, billing `16/16`, and AI
settings `14/14`. Root typecheck and web lint pass.

Root build compiled, linted/typechecked, collected page data, and generated
`42/42` pages before the established local Windows standalone symlink `EPERM`.

## Baton

ARGUS should independently review exact source `c84464f8`, migration 097 and its
ledger/hash, Institution-owner authority across every loader, public fail-closed
composition, retained hosted state, and the disclosed correction. If accepted,
wake ARIADNE for independent owner/member/signed-out human rehearsal.

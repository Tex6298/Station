# PR541 - Institution Community Presence Closeout

Owner: MIMIR / A1

Date closed: 2026-08-02

Status:

```text
CLOSE_PR541_INSTITUTION_COMMUNITY_PRESENCE_ACCEPTED
```

## Decision

MIMIR accepts and closes PR541 on ARGUS's controlling effective-Salon review
and ARIADNE's independent owner/member/signed-out rehearsal. The accepted
application source is
`c84464f810d5b40d2d08f92bb8c6c3b798d959c0` on both Railway services.

Migration `097_institution_community_presence.sql` remains applied and ledgered
exactly once at SHA-256
`CFA04E4ACD528EEBFD7A3D8776DC20CB7E9A656F41D23FB3156025A47C06B825`.

## Accepted Customer Result

`Station Institutional Alpha` now has one first-class Institution-principal
public Salon reached from its published Institutional Space. The retained
active member participates through the ordinary forum policy without receiving
moderation authority. The Institution owner has local owner moderation and a
bounded delegated-report queue. Signed-out visitors can traverse:

```text
Institutional Space -> Institution Salon -> retained discussion
```

The same Salon and retained discussion are routeable through public Discover
search. Category and thread surfaces carry bounded verified Institution
provenance without exposing raw Institution, owner, member, moderator, audit,
report, or profile identifiers.

## Authority And Composition

The accepted implementation preserves personal subcommunities and extends the
mature category-backed community model with exactly one principal per row.
Institution Salons have `institution_id` and no hidden personal owner; their
principal is immutable and creation is a service-only atomic category, Salon,
and typed `community_created` audit transition.

ARGUS found and DAEDALUS corrected two material integration gaps before human
rehearsal:

1. Institution publication truth and Institution-owner authority now compose
   across Discover, public Persona projections, direct forum reads, and the
   delegated report queue.
2. Institution-principal thread projections now also require the controlling
   Salon to be active and viewer-visible, so paused, archived, private,
   unlisted, community, missing-principal, and query-failure states cannot leak
   through search or feeds.

Ordinary categories and personal-principal Salons retain their existing
behavior. Institution membership does not bypass the posting tier or imply
admin, owner, delegated-moderator, or global moderation authority.

## Hosted And Human Proof

The final hosted verifier records:

- exact migration ledger/hash `1/1` and browser RPC authority `0`;
- retained Salon/thread/reply `1/1/1`;
- retained Institutional Space version/audit `8/8`;
- personal subcommunity count/fingerprint unchanged at
  `1 / dc1914b354a2cd281a2b36bbcd63e7fb`;
- unrelated policy fingerprint unchanged at
  `0059a6a603f8668b46a8229f8a7bd6a2`; and
- disposable fixture/report/browser-RPC and Persona/featured/link residue all
  zero, with the owner tier restored to `private`.

ARIADNE independently passed owner desktop, member mobile dark, signed-out
mobile dark, signed-out desktop Discover, Salon, retained thread, and empty
moderation-queue routes. The read-only rehearsal created no content or state
drift. It disclosed only `23` canceled Next navigation/prefetch requests, with
zero console, page, HTTP, session, loading, RSC fallback, or unclassified
failures.

## Validation

Community `59/59`, Persona `18/18`, Institution Community `18/18`, Institutions
`18/18`, Institution publications `4/4`, Institution Spaces `6/6`, reports
`9/9`, document discussions `9/9`, auth `24/24`, Projects `33/33`, Spaces
`11/11`, Developer Spaces `61/61`, writing `35/35`, profile boundary `5/5`,
exports `15/15`, billing `16/16`, and AI settings `14/14` pass. Root typecheck
and web lint pass. Root build compiled, typechecked, collected data, and
generated `42/42` pages before the established local Windows standalone
symlink `EPERM`; no application compile or page-generation failure occurred.

## Programme Boundary

PR541 is closed. PR536 Institutional Alpha remains open through PR542 owner
activity/audit readback and PR543 final cross-role hosted rehearsal. This
closeout does not open or assign PR542, and silence from another agent does not
authorize MIMIR to take that agent's work.

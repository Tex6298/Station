# PR528 - Important Routes Partner Pass Closeout

Owner: MIMIR / A1

Date closed: 2026-07-16

Status: Accepted; retained partner-review window open

```text
CLOSE_PR528_IMPORTANT_ROUTES_PARTNER_PASS_ACCEPTED
```

## Decision

PR528 is complete. The bounded public and private partner route set is credible,
hosted, privacy-safe, visually rehearsed, and clean enough to hand to Marty and
his partner for product judgment.

This closeout does not claim that all Station UI, all Phase 3 work, private
provider generation, or paused PR529 details are complete. It closes the exact
important-routes pass that began after PR527.

## Hosted Entry

```text
https://stationweb-production.up.railway.app
```

Fresh closeout health:

- web home: HTTP `200`;
- API `/health`: HTTP `200`, `ok:true`;
- API `/health/deployment`: `ok:true`, `ready:true`;
- hosted product runtime: `577d6085`, branch `main`;
- migrations: `025-086`, all seven proofs green;
- Supabase database/storage/Auth redirects, Stripe test billing, Gemini
  embeddings, and Upstash operational cache: ready; and
- current application source remains equivalent to accepted Auth/product SHA
  `67da511f`; later hosted changes are the protected-read guard/test and
  roadmap evidence only.

## One-Screen Partner Route Checklist

### Public, signed out

1. Open `/` and use `Explore Discover`.
2. On `/discover`, open `Continuity Field Notes` without typing a search.
3. Read `What should a companion keep steady?` and inspect summary, body,
   authorship, provenance, visibility, and trust copy.
4. Open its linked discussion, `What belongs in continuity, and what should be
   allowed to change?`, then return to the source document.
5. Open `/forums` and scan the category/thread hierarchy and signed-out
   contribution boundary.

### Private, signed in

6. Open `/studio` and identify the private companion, Memory, Integrity,
   Archive, and public-Space destinations.
7. Open Aster and inspect the companion home, shortcut strip, presence, and
   continuity framing.
8. Open Memory Inbox and distinguish pending candidate material from active
   Memory without accepting or rejecting it.
9. Open Timeline/Continuity and inspect the durable source-linked collaboration
   record as its own product stop.
10. Open Global Archive, run one no-match private search, then clear it.
11. Hard-refresh once to confirm auth persistence, then sign out through the
    product menu and confirm Studio returns to the login boundary.

The private Aster review account is retained but currently signed out with zero
sessions. Its credentials remain in the ignored local DPAPI-protected operator
packet and are not copied into Git or chat. A bounded review session can be
opened from that packet when the partner pass begins.

## Accepted Evidence

### Human rehearsal

ARIADNE passed the final matrix on exact accepted hosted product source:

```text
44/44 route cases
```

The matrix covered 11 routes in Light and Dark at `1440x900` and `390x844`:

- zero page or console errors;
- zero non-aborted request or HTTP failures;
- zero unexpected product writes;
- zero horizontal overflow, viewport escape, control overlap, or theme
  mismatch;
- `16/16` checked contrast samples at or above `4.5:1`, minimum `5.03:1`;
- auth persisted through normal navigation and hard refresh; and
- product sign-out removed ARIADNE's exact session and refresh token.

### Public corpus

The retained public Station Guide chain contains exactly one public Space, one
summarized/versioned essay, and one customized linked Forum discussion with no
fabricated engagement. Latest Discover, Space, document, discussion, thread,
title search, and body-phrase search all pass anonymously.

### Private corpus

The retained private Aster corpus contains one persona, two curated active
Memory items, one quarantined imported Memory chunk, one pending file-backed
candidate, one private Archive source/object, and one Continuity record.
Gemini embeddings are present at `1536` dimensions. Private Discover leakage,
provider traces, conversations, token use, and forbidden-scope residue remain
zero.

### Auth and verifier hygiene

The deployed sign-out route now revokes the exact server-side local session.
The retained Station Guide owner and both dedicated probe owners have zero
session, refresh-token, and linked MFA residue. PR528B13 removed only the two
probe owners' exact 258 sessions, 765 linked refresh rows, and 258 MFA AMR
claims while retaining users, identities, profiles, truthful audit history,
unrelated Auth state, and every product/storage invariant.

The committed protected-read verifier guard rejects non-GET product requests,
Auth-producing paths including encoded forms, and obvious Auth/session/OTP
mutation helper names. ARGUS's focused contract passes `4/4`. The guard is
explicitly an accidental-mutation capability boundary, not a sandbox around
deliberately dishonest callbacks.

## Honest Remaining Boundaries

Private companion generation is not accepted in this partner pass. Gemini is
the configured free embedding provider, not a chat provider. Hosted NVIDIA is
restricted away from private context, and no accepted Anthropic, DeepSeek, or
owner BYOK private route is configured. The empty companion surface remains
useful and creates no failed conversation shell, but proactive provider-setup
guidance is deferred.

PR529 retains the non-blocking detail ledger, including:

- proactive provider-readiness guidance on an empty companion;
- programmatic labels for Login email/password;
- accessible names for Memory Inbox candidate editors;
- a programmatic label for Global Archive sort; and
- the earlier bounded post-partner UI/detail findings.

No PR529 implementation begins merely because PR528 closed.

## Retention Decision

Keep both curated corpora only through Marty and his partner's review window.
After feedback, MIMIR must make one explicit decision:

- promote selected sample content;
- replace it with revised sample content; or
- execute the protected cleanup packets.

Silence does not make the retained review data permanent.

## Next Gate

```text
PAUSE_AFTER_PR528_FOR_PARTNER_PRODUCT_JUDGMENT
```

Do not broad-reskin or reopen the important-routes lane while the partner is
judging the accepted product. New work resumes from specific feedback, the
paused PR529 ledger, or a deliberately selected numbered product lane.

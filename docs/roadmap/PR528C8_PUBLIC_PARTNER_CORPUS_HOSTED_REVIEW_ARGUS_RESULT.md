# PR528C8 - Public Partner Corpus Hosted Review ARGUS Result

Owner: ARGUS / A3

Date completed: 2026-07-16

Status: Blocked on retained Auth-session cleanup; corpus otherwise independently accepted

```text
BLOCK_PR528B11_PUBLIC_PARTNER_CORPUS_ACTIVE_AUTH_SESSIONS_REMAIN_AFTER_RECORDED_SIGNOUT
```

## Blocking Finding

The retained Station Guide owner had three active `auth.sessions` rows and three
matching unrevoked refresh tokens before ARGUS signed in. All three were created
during or after the retained PR528B11 run began; none predated that run.

DAEDALUS therefore did clean the failed first owner, but the retained run's
claim that its owner sessions were signed out is false. The three retained-run
sessions remain open.

ARGUS reproduced the defect with one fresh review session:

1. owner sign-in created one exact fourth session;
2. `POST /auth/signout` returned HTTP `204`;
3. the exact session and its refresh token remained active after that response;
4. ARGUS revoked only its fresh session through the service-role Auth admin
   local-session endpoint; and
5. the hosted owner returned to the same three pre-existing active sessions.

The accepted source constructs a Supabase Auth client with only a global
Authorization header and `persistSession: false`, then calls
`client.auth.signOut()`. The installed Auth client contract requires a signed-in
client session for that method. The observed `204` is consequently not evidence
of server-side revocation.

This is an Auth safety and claim-honesty blocker. ARIADNE should not begin the
partner rehearsal while those retained fixture sessions remain refreshable.

## Narrow ARGUS Patch

ARGUS made the smallest local source/test repair:

- `signOut(accessToken)` now calls the service-role Auth admin
  `signOut(accessToken, "local")`, which revokes the JWT's exact server-side
  session;
- the route test requires the exact token and `local` scope; and
- hostile Auth failures still return only stable public copy.

The patch is not deployed. It does not itself revoke the three pre-existing
sessions. MIMIR must serialize the new source acceptance/deployment and an exact
owner-session cleanup, then route a fresh C8 replay against the new accepted
SHA.

## Deployment And Source

The current hosted API and web otherwise bind cleanly to exact accepted SHA:

```text
6794ac996d416d023aa729a8293918251776aad3
```

Independent checks proved:

- API and web ready on `main`;
- both Railway deployment ids match the public health identities;
- exactly two active Railway services, each successful, running, and idle;
- migration range `025-086` with all seven proofs green;
- no production drift in `documents.ts` or `discover.ts` after acceptance;
- accepted `documents.ts` SHA-256 prefix `00E92803A075D9EE`;
- accepted `discover.ts` SHA-256 prefix `C55D472EE7BEB179`;
- fixed public document fields remain `title`, `summary`, and `body`; and
- document-id deduplication remains before the global eight-result cap.

No deployment or service trigger was performed during review.

## Retained Account And Corpus

Apart from Auth sessions, the retained owner and allowed rows are exact:

| Scope | Independent result |
| --- | ---: |
| Tagged public Auth owners / profiles / identities | `1 / 1 / 1` |
| Tier / subscription / admin | `creator / inactive / false` |
| Stripe links | `0` |
| Token/storage trigger rows | `1 / 1` |
| Tokens used / top-up tokens / storage bytes | `0 / 0 / 0` |
| Public Spaces / default pages | `1 / 4` |
| Current documents / prior snapshots | `1 / 2` |
| Current document version | `3` |
| Linked discussions / default `Discuss:` rows | `1 / 0` |
| Community profiles / comments / engagement rows | `0 / 0 / 0` |
| Explicit `discover_feed` rows / storage objects | `0 / 0` |

The owner remains exactly `Station Guide` / `station-guide`, nonbilling,
non-admin, and free of leaked private Auth metadata on public surfaces.

The one Space is the exact public Continuity Field Notes Space with its four
normal default pages. The current document retains the exact approved title,
slug, summary, canonical body, essay type, public visibility, Space pointer,
and `user_authored` / `manual` provenance.

## Version And Discussion Truth

The version chain is genuine and operation-bound:

- version `1`: public-visibility draft, comments off, unpublished, no
  discussion pointer;
- version `2`: published public document, comments still off, publication
  timestamp equal to the current document's real publication timestamp, no
  discussion pointer; and
- current version `3`: comments on and one discussion pointer.

Creation, publication, snapshot, and thread timestamps fall inside the
protected operation window and are monotonic. No fabricated or backdated state
was found.

The one thread keeps the exact approved title/body, public active visible
normal-moderation state, owner authorship, Documents & Codexes category, and the
same Space/document links. Its id is identical through the document pointer,
discussion readback, thread detail, and public search results. Scores, comments,
votes, Watches, witnesses, reports, notifications, pins, moderation actions,
and every other checked engagement row remain zero.

## Product Readback

All seven anonymous API surfaces passed independently:

1. Latest Discover;
2. public Space;
3. public document;
4. document discussion;
5. thread detail;
6. exact title search; and
7. canonical body-phrase search.

Both searches returned the same document exactly once. Latest Discover used the
approved summary excerpt, Space and document APIs kept summary/body separate,
and the linked discussion was absent from the standalone Latest feed.

ARGUS followed the visible browser chain at `1440x1000` and `390x844`:

```text
/discover
  -> /space/continuity-field-notes/documents/<retained-document>
  -> /forums/documents-and-codexes/<retained-thread>
```

Both viewports also passed direct public-Space readback, separate summary/body
rendering, summary-based Space excerpts, and horizontal-overflow checks. This
was functional route validation, not ARIADNE's final human-eye rehearsal.

## Cleanup, Privacy, And Scope

Current exhaustive tag, collision, relation, and orphan checks exclude failed
first-run residue: there is one target owner/profile/Space/document/thread
chain, four pages, two prior versions, no default thread, no community profile,
no storage object, and zero orphan Auth identities/sessions or allowed product
rows. The only session issue is the three open sessions from the retained run.

All 51 available public-owner forbidden scopes were checked and contain zero
rows. The same two archive-connector scopes remain unavailable and are reported
as unavailable, not checked. No persona, Memory, archive, continuity, provider,
chat, trace, billing, top-up, moderation, notification, project, Developer
Space, export, connector, seminar, encounter, queue, Cloudflare, or private
Aster state was created for the public owner.

The copied private-Aster verifier passed before and after C8 with exact weights
`1.25`, `1.25`, and `1.5`, three invariant rows unchanged, exact `1145`-byte
storage/accounting, zero public/cross-owner disclosure, zero forbidden rows,
and zero conversations, provider traces, token transactions, or token use.

ARGUS made no hosted product-data write, deployment, provider call, engagement,
or private-corpus mutation. One fresh review session was created for owner-path
readback; the product sign-out defect was observed, and ARGUS then revoked only
that exact session through the Auth admin local scope. The three retained-run
sessions were deliberately left untouched pending MIMIR authorization.

## Validation

| Check | Result |
| --- | --- |
| `node --check .station-private/pr528c8/argus-review.mjs` | Pass |
| Independent C8 hosted reviewer | Blocker reproduced; all non-session gates pass |
| Post-review protected session audit | `3` sessions / `3` unrevoked refresh tokens remain |
| `npx --yes pnpm@10.32.1 test:auth` | Pass: `24/24` |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `git diff --check` | Pass |

The npm launcher repeated only its existing warnings for pnpm-specific npm
configuration keys. The Railway CLI also emitted its existing Node shell-option
deprecation warning during read-only status inspection.

## Exact Next Fix

1. Review and accept the narrow local Auth sign-out patch.
2. Deploy that patch and bind the new exact API SHA.
3. Sign in once through the retained protected owner credentials and use a
   service-role Auth admin global sign-out to revoke that fresh session plus the
   three retained-run sessions.
4. Prove zero `auth.sessions` and zero unrevoked refresh tokens for the retained
   owner, without altering the public corpus.
5. Re-run C8, including one fresh product sign-out proof that removes its exact
   session, before routing ARIADNE.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS independently reviewed the accepted deployment and retained Station Guide public partner corpus.
Verdict:
- BLOCK_PR528B11_PUBLIC_PARTNER_CORPUS_ACTIVE_AUTH_SESSIONS_REMAIN_AFTER_RECORDED_SIGNOUT
Task:
- Serialize the narrow Auth sign-out patch, deploy it, revoke exactly the retained Station Guide sessions, and rerun C8 before ARIADNE rehearsal.
```

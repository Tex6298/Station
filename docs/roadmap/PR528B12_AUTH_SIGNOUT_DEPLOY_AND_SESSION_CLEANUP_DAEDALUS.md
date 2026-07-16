# PR528B12 - Auth Sign-Out Deploy And Session Cleanup

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - serialized Auth source deployment and exact retained-owner cleanup

## Purpose

Deploy ARGUS's narrow server-side sign-out repair, revoke exactly the retained
Station Guide owner's refreshable sessions, and prove the repaired product
sign-out removes one fresh exact session before PR528C8 is rerun.

The public corpus is otherwise independently accepted and must remain
read-only. ARIADNE stays blocked until session cleanup and the C8 replay pass.

## Accepted Patch

Accepted source commit:

```text
67da511fed5c69471516dd3bc03b4ba4614cab54
```

The patch changes Station sign-out from a sessionless client call to:

```text
getSupabaseAdmin().auth.admin.signOut(accessToken, "local")
```

This revokes the exact JWT session server-side. ARGUS test evidence passes
`test:auth 24/24`, API typecheck, stable hostile failure copy, and diff check.
MIMIR accepts this narrow review patch for serialized deployment.

## Phase 1 - Deploy And Bind

1. Bind current deployment, accepted ancestry, exact production
   `auth.service.ts` hash, migration readiness, retained public-corpus receipt,
   private Aster receipt, and pre-cleanup owner-session counts in protected
   ignored evidence. Never print secrets, JWTs, credentials, owner/session ids,
   or private timestamps.
2. Wait for or trigger only the required Railway API deployment. If web is
   rebuilt automatically, verify readiness without otherwise touching it.
3. Require the API to contain the exact accepted sign-out implementation,
   remain ready, retain migration range `025-086`, and keep all seven migration
   proofs green.
4. Re-run `test:auth`, API typecheck, and diff check against the deployed source
   boundary before cleanup if any source/deployment ambiguity exists.

## Phase 2 - Exact Owner Session Cleanup

1. Through the protected retained owner credentials, create one fresh bounded
   Station Guide session only after the accepted deployment is ready. Bind it
   to the existing three retained-run sessions without exposing identifiers.
2. Use the service-role Auth admin global sign-out operation with that fresh
   access token to revoke every session for exactly that retained Auth owner.
   Do not delete the Auth user, identity, Profile, corpus, or another owner's
   session.
3. In fresh protected checks, require zero `auth.sessions` and zero unrevoked
   refresh tokens for the retained owner. Require unrelated Auth users and
   sessions unchanged.
4. Reprove the retained public owner/Profile entitlement, Space/pages,
   summarized versioned document, one customized discussion, zero engagement,
   token/storage zero-use rows, forbidden scopes, and public route/search
   receipt unchanged.
5. Reprove private Aster exact and read-only.

## Phase 3 - Deployed Product Sign-Out Canary

1. Create one new exact Station Guide session through ordinary sign-in.
2. Call deployed `POST /auth/signout` once with that access token and require
   HTTP `204`.
3. Prove that exact session and its linked unrevoked refresh token are gone and
   the retained owner again has zero active sessions/unrevoked refresh tokens.
4. If the product call fails or leaves residue, revoke only the fresh canary
   session through Auth admin, return the owner to zero, and report a blocker.

## Mutation Boundary

Allowed mutations are only Auth sign-in/session creation and exact Auth session
revocation for the retained public Station Guide owner. Do not alter public
product rows, billing/entitlement, private Aster, providers, chat, engagement,
moderation, storage objects, migrations, or another owner.

## Result And Handoff

Create:

`docs/roadmap/PR528B12_AUTH_SIGNOUT_DEPLOY_AND_SESSION_CLEANUP_DAEDALUS_RESULT.md`

Use one exact verdict:

```text
READY_PR528B12_AUTH_SIGNOUT_DEPLOY_AND_SESSION_CLEANUP_FOR_ARGUS
BLOCK_PR528B12_<EXACT_REASON>_WITH_OWNER_SESSION_COUNT_<N>
```

Commit and push public-safe aggregate evidence, then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS deployed the exact Auth sign-out repair, revoked the retained Station Guide sessions, and ran one fresh product sign-out canary.
Verdict:
- READY_PR528B12_AUTH_SIGNOUT_DEPLOY_AND_SESSION_CLEANUP_FOR_ARGUS (or exact blocker/count)
Task:
- Route ARGUS's fresh PR528C8 replay before ARIADNE human rehearsal.
```

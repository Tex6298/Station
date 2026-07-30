# PR535 - Institutional Spaces Foundation Preflight

Owner: ARGUS / A3

Date: 2026-07-30

Status:

```text
OPEN_PR535_INSTITUTIONAL_SPACES_FOUNDATION_PREFLIGHT
```

## Why This Lane

Institutional Spaces are an explicit Phase 3 product capability in
`docs/product/Station_Document_1_Platform_Overview.md` and
`docs/product/Station_Document_3_Future_Vision.md`. They are organisation
presences with team accounts, a verified public identity, their own publishing
and community participation, and a strict prohibition on private user-data
access.

PR534 now proves one bounded Project viewer collaboration loop. That removes
one architectural unknown, but it does not create an institution principal,
institution ownership, team administration, institutional content authority,
or an institutional public page.

PR535 is a hostile product/schema/API/web preflight. It opens no implementation
by itself.

## Product Question

Choose the smallest real Institutional Spaces foundation that can become a
customer-facing loop without pretending a personal account or Project is an
institution.

The preferred first-loop candidate is:

```text
an admin-provisioned institution has one authoritative owner,
the owner can invite one existing Station account into a bounded team role,
signed-in team readback is private and role truthful,
and visitors can open a verified public institution identity page,
with no access to private user data or unrelated owner resources
```

ARGUS may revise or reject that candidate if current authority boundaries make
a smaller numbered unblock lane necessary.

## Required Audit

Reconcile the product promise against current source and hosted schema:

- `projects`, `project_members`, Project collaboration RPCs, API serializers,
  and owner/viewer UI;
- personal Spaces and public Space routing;
- public Projects and Project evidence;
- Developer Space ownership and Project attachment;
- profile/user tier and admin authority;
- documents, subcommunities, exports, billing, usage, and notifications where
  they currently assume personal ownership;
- the five-state visibility requirement, especially collaborator-only;
- migration ordering after accepted migration `090`.

Answer explicitly:

1. Is an institution a new durable principal, a constrained Project subtype,
   or a separate organisation linked to Projects? Name the safest choice and
   why the rejected choices fail.
2. What row is authoritative for institution ownership? A role string alone
   must never grant ownership.
3. What exact initial roles and statuses exist? Do not activate dormant
   `admin`, `editor`, or `billing` Project labels by implication.
4. Who can provision an institution during protected alpha, and how is verified
   status granted, revoked, and audited?
5. What is the exact public institution DTO and route? It must expose no raw
   owner/member ids, private contact data, billing data, or private resources.
6. What is the exact private owner/member DTO and route set, including generic
   denial behavior and `private, no-store` caching?
7. Which existing resources remain personal in the first slice? Any ownership
   transfer or institution-authored mutation must be explicit, not inherited.
8. What database constraints, transaction RPCs, RLS policies, grants, and
   immutable/audit rules are required?
9. What disposable local and hosted lifecycle proves provisioning, invite,
   accept/decline, readback, revocation, public identity, hostile cross-owner
   denial, and exact cleanup?
10. Is any external config actually required for the first slice? Do not block
    on optional custom domains, email, analytics, billing, or provider setup.

## Guardrails

- No private user data, private Memory, Archive, Continuity, Canon, Integrity,
  chats, provider settings, prompts, credentials, exports, or owner-only
  dependent resources may become institution-readable.
- Do not turn `subscription_tier=institutional` into an organisation principal.
- Do not grant broad table access to support username lookup or team readback.
- Do not widen PR534 viewer authority or silently enable Project editor/admin/
  billing roles.
- No custom/subdomain implementation, institutional analytics, research-data
  licensing, contract billing, live Stripe work, dedicated support tooling,
  multi-author editing, forum delegation, or Developer Space operation in the
  first implementation slice.
- No broad UI reskin. Translate the capability into the existing Station
  visual and interaction language.
- New objects default private until an explicit public identity transition is
  authorized and independently serialized.

## Expected Verdict

Commit one of:

```text
ACCEPT_PR535A_<EXACT_FIRST_INSTITUTIONAL_SLICE>
BLOCK_PR535_<CONCRETE_BLOCKER>
REJECT_PR535_INSTITUTIONAL_FOUNDATION_FOR_NOW
```

If accepted, write a numbered DAEDALUS-ready contract with exact schema, API,
web, tests, migration, hostile cases, and later hosted proof. If blocked, name
the smallest numbered unblock lane that directly enables Institutional Spaces.

Wake MIMIR with `WAKEUP A1:`. ARGUS does not start implementation.

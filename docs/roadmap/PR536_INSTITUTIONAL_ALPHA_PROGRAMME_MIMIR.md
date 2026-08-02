# PR536 - Institutional Alpha End-To-End Programme

Owner: MIMIR / A1

Date opened: 2026-07-31

Status:

```text
OPEN_PR536_INSTITUTIONAL_ALPHA_END_TO_END_PROGRAMME
```

## Customer Outcome

Institutional Alpha is one programme, not a collection of unrelated schema or
page improvements. It closes only when the deployed product proves this whole
journey:

```text
Station provisions and verifies one institution -> its owner invites and
manages a small team -> the team collaborates on institution-owned published
work -> visitors use a branded public Institutional Space and its community
presence -> at least one institution-owned Project connection works -> the
owner can read basic activity and audit history
```

The final proof must exercise owner, member, unrelated-account, and signed-out
visitor boundaries as one coherent journey. Passing one intermediate slice
does not complete or pause the programme.

## Foundation Assessment

PR535A/PR535A1 repaired the hosted profile authority boundary. PR535B then
added and independently accepted the source for:

- a distinct institution principal with immutable owner authority;
- one bounded member role and complete invite/accept/decline/revoke lifecycle;
- typed append-only lifecycle audit events;
- admin verification, owner publication, private team readback, and public
  identity routes; and
- strict serializers with zero inherited access to existing Station resources.

That is the right foundation, but it is not yet Institutional Alpha. Migration
`092` is not hosted, the current audit events have no owner readback surface,
and Institutions cannot own Projects, publications, Spaces, or community
presence. No deployed end-to-end institution journey has been accepted.

## Architecture Decisions

1. `institutions` remains the organisation principal. A personal
   `institutional` subscription tier is not organisation identity or authority.
2. Existing personal rows retain their current owner and behavior. Institution
   ownership is introduced only through explicit nullable principal fields,
   exact one-principal constraints, and service-owned transitions.
3. The first institution-owned resource is a Project. Project is Station's
   organisational unit and already connects to Developer Spaces; the programme
   will not attach an Institution directly to every resource type.
4. Institutional publishing uses an institution-owned publication record with
   explicit human attribution. An active member may draft and edit; the owner
   publishes or retracts in Alpha. This supplies real collaboration without
   pretending advanced editorial roles exist.
5. The public Institutional Space is identity-led and aggregates only public
   institution work, its public Project connection, and its community presence.
   Basic name/mark/accent treatment is in scope; custom domains and extensive
   co-branding are not.
6. Community presence is one institution-linked subcommunity with existing
   visibility and moderation rules. Institution membership alone never grants
   global moderation authority.
7. Every new authority path is enforced at the database/service boundary and
   exposed through allow-listed DTOs. Team membership must not fan out to
   personal Studio, Archive, Memory, billing, provider, or credential data.

## Globally Numbered Slice Sequence

| Lane | Customer result | Required close condition |
| --- | --- | --- |
| PR537 | Hosted Institution Identity And Team Activation | Apply and ledger exact migration `092`; deploy accepted source; retain one protected-alpha institution with owner/member lifecycle and public visitor identity proven. |
| PR538 | Institution-Owned Project Connection | One Project has an institution as its sole organisation principal; owner and active member get bounded role-truthful access while all personal Projects and unrelated accounts remain unchanged. |
| PR539 | Collaborative Institution Publishing | Owner and active member can create/edit attributed institution work; owner can publish/retract it; private drafts and personal documents remain isolated. |
| PR540 | Branded Public Institutional Space | Public institution route becomes an authored Space with basic brand treatment, published work, verified identity, and the public Project connection. |
| PR541 | Institution Community Presence | One institution-linked subcommunity is reachable from the public Space; member participation and owner moderation stay within existing community policy. |
| PR542 | Institution Activity And Audit Readback | Owner receives a bounded activity summary and typed audit timeline covering team, publication, Project, and community actions without raw actor ids or private profile fields. |
| PR543 | Institutional Alpha Hosted Rehearsal And Closeout | Independent owner/member/visitor rehearsal proves the complete retained journey, hostile boundaries, exact deployment identity, and cleanup/no-drift obligations before MIMIR closeout. |

Each implementation slice receives independent ARGUS review. ARIADNE performs
human-eye rehearsal when a customer interaction changes and owns the final
cross-role journey. A concrete blocker may insert the next unused global PR
number as the smallest direct unblock; it may not shrink or rename the PR536
customer outcome.

## Finished-Product Horizon

This programme does not claim self-service institutional onboarding, advanced
roles or departments, delegated approval programmes, custom domains, extensive
co-branding, rich sub-community structures, multiple linked labs, advanced
analytics or research-data products, contracts, institutional billing,
support, or SLAs.

## Active Baton

PR537 hosted identity/team activation, PR538 Institution-owned Project, PR539
collaborative Institution publishing, and corrected PR540 branded public
Institutional Space are accepted. PR540 closes at exact deployed source
`8673b7ee` after ARGUS's fail-closed correction review and ARIADNE's exact
visible-control cycle ending published at version/audit `8/8`.

PR541 adds one first-class Institution-principal Salon by extending the mature
community model without a hidden personal owner, automatic member moderation,
or a replacement discussion engine. ARGUS accepts corrected source `c84464f8`
for ARIADNE rehearsal: Institution publication, visitor-tier owner authority,
and active/viewer-visible Salon state compose across public projections, with
exact restoration and zero residue. ARIADNE owns the existing independent
owner/member/signed-out rehearsal. PR536 remains open through PR542 owner
activity/audit readback and PR543 final hosted rehearsal.

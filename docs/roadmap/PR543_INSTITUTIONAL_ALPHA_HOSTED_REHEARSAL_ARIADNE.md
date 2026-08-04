# PR543 - Institutional Alpha Hosted Rehearsal And Closeout

Owner: ARIADNE / A4 -> ARGUS / A3 -> MIMIR / A1

Date opened: 2026-08-04

Status:

```text
OPEN_PR543_INSTITUTIONAL_ALPHA_HOSTED_REHEARSAL_AND_CLOSEOUT
```

## Purpose

PR543 is the final proof lane for the already-built PR536 Institutional Alpha
programme. It closes only if one independent rehearsal makes the complete
customer journey coherent across Institution owner, active member, unrelated
signed-in account, and signed-out visitor views.

This is not another implementation, polish, or hardening sweep. Do not repair
code, add controls, rewrite fixtures, or broaden the Institution product while
rehearsing it. A material defect stops PR543 and returns to MIMIR with an exact
route, role, expected result, actual result, and reproduction. MIMIR alone may
open the next global number as the smallest direct correction.

## Controlling Baseline

The rehearsal targets:

```text
Web: https://stationweb-production.up.railway.app
API/web source: 47576f5b5e969d96888479d9d698dfba01772d06
Institution: Station Institutional Alpha / station-institutional-alpha
```

Before opening a browser role, verify both Railway services report that exact
source and the accepted migration ledger contains exactly one row for each
Institutional Alpha migration:

| Migration | Expected SHA-256 |
| --- | --- |
| `092_institution_principal_team_public_identity` | `B923C9EAB0AEADADBA8D16D9250FE1AC42307CE5A51191F48119B0101042A7C3` |
| `093_institution_owned_projects` | `E95DB00E8A1D1AA706C69123B222D6C20EFABF96E492D183BAF3359947EFF435` |
| `094_institution_publications` | `BC2402C5474707ADCC4270DF7830A571270C0D225D3233D8D3DB3AFDBD408C6D` |
| `095_institution_spaces` | `CDFE536350C8CE9D6A3A8721348C765A6A1FD1A9962E7DFC62BAA5F5DC9A5789` |
| `096_institution_space_fail_closed_guards` | `5F11DA79F9028F3009CE74C55E21917A23EFF48AC0C39950AB67711F4D5EEB62` |
| `097_institution_community_presence` | `CFA04E4ACD528EEBFD7A3D8776DC20CB7E9A656F41D23FB3156025A47C06B825` |
| `098_institution_activity_audit_readback` | `14277E34E4B02439E1888EB2F9197310CE10C2B07B35B67668C8DBF7529E58EE` |

Do not continue across mixed deployment source, a missing/duplicate ledger
row, hash drift, failed health, or changed retained principal. Wake MIMIR with
that exact preflight blocker.

## Rehearsal Discipline

Use four isolated browser contexts. Never reuse storage, cookies, or session
state between roles. Credentials and raw ids remain under ignored
`.station-private/pr543`; do not print or commit them.

The rehearsal is read-only. Do not invite/revoke members, edit/publish/retract
the publication, change Project visibility, edit/publish/unpublish the Space,
change Salon state, post/vote/report/moderate, or generate new audit events.
The earlier accepted slices already prove those transitions. PR543 proves that
their retained result composes into one understandable product.

For each signed-in role, prove session persistence across direct navigation,
in-product links, one refresh, and one return navigation. An unexplained
sign-out, cross-role identity bleed, stale private payload, or wrong return URL
is a blocker rather than a retry to omit.

## Owner Journey

As the retained Institution owner, rehearse this connected route:

```text
Institution list -> Team -> Institution Project -> collaborative publication
workspace -> Institutional Space workspace -> Institution Salon workspace ->
Activity and audit
```

Verify with human eyes and route/network truth that:

1. the Institution is verified/public and the owner role is explicit;
2. one distinct active member is present and owner-only team controls are
   truthful;
3. the retained Project names the Institution principal and grants owner
   management without a hidden Project-owner row;
4. the retained publication exposes human creator/editor attribution, current
   published state, attached Project, and owner-only publish authority;
5. the authored Space is published at version/audit `8/8`, carries its bounded
   mark/accent/about treatment, and links its public work and Salon;
6. the Salon identifies the Institution principal and offers local owner
   moderation without implying global moderation;
7. Activity is reachable from the private Institution workspaces, shows the
   six typed domains, and traverses all retained events exactly once without
   raw/private ids; and
8. no owner control is inert, falsely enabled, mislabeled, or routed to a
   public/private dead end. Do not execute destructive controls merely to prove
   that they exist.

## Active Member Journey

In a clean context as the retained active member, rehearse:

```text
Institution list -> Team readback -> Institution Project -> collaborative
publication workspace -> Space/community readback -> public Salon -> retained
discussion
```

Verify that the member can see the Institution and its retained work, receives
the accepted read-only Project/Space/Institution configuration truth, and sees
the collaborative publication affordances established by PR539. The member
must not see owner team/publication/Space/Salon-management or Activity access.

On the public Salon/thread route, verify the retained member-authored
participation remains ordinary forum participation and grants no owner,
delegated-moderator, admin, or Institution-wide moderation control.

## Unrelated Account Journey

In a clean signed-in unrelated context:

- the verified public Institution, published Space, public Project,
  publication, Salon, and retained discussion remain readable through their
  public routes;
- direct private Team, Project-management, publication-workspace, Space,
  community-workspace, and Activity requests return the accepted bounded
  unavailable/not-found result; and
- no member count, invitation state, draft body, audit count/event, private
  actor label, report queue, owner control, internal id, provider, credential,
  billing, personal Studio, Archive, Memory, or Settings data is disclosed.

Do not infer a private route from a hidden control alone; exercise the known
human URLs directly and record only public-safe status/result truth.

## Signed-Out Visitor Journey

In a clean signed-out context, traverse the actual public chain:

```text
/ -> Discover -> Station Institutional Alpha -> public Institution Project ->
published Institution publication -> Institution Salon -> retained discussion
```

The route need not force a single linear link order, but every destination must
be discoverable from public product navigation and preserve bounded verified
Institution provenance. Confirm that the private Team, workspaces, Activity,
member roster, audit history, and moderation queue are absent. A direct private
URL must preserve a correct sign-in return path or bounded unavailable state
without leaking whether private material exists.

## Human-Eye And Interaction Gate

Run representative owner desktop/light, member desktop/dark, unrelated
`390px` mobile/light, and signed-out `375px` mobile/dark views. Include the
public Space, publication, Salon/thread, private team, and Activity surfaces.

Block on horizontal overflow, clipped identity/action text, overlapping rails
or controls, unreadable provenance, false loading, dead buttons, decorative
controls that imply missing behavior, incoherent back navigation, inaccessible
focus, or theme treatment that obscures authority/visibility state. Record
expected canceled Next.js prefetch/navigation requests separately from real
console, page, HTTP, product-request, loading, or session failures; do not hide
unclassified failures in an aggregate count.

## Retained End State

The final read-only verifier must agree before and after rehearsal:

- one verified/public retained Institution with one distinct active member;
- one Institution-principal public Project and zero Project owner rows;
- one retained published Institution publication at its accepted version/audit
  truth;
- one published Institutional Space at version/audit `8/8`;
- one active public Institution Salon and retained thread/reply `1/1/1`;
- Institution audit events `58`, including Project/audit `1/1`;
- all seven migration ledger/hash pairs exact once;
- API/web exact source unchanged; and
- zero PR543 users, memberships, Projects, publications, Spaces, Salons,
  threads, replies, reports, events, or browser-session residue.

Retained state should be byte-equivalent because the rehearsal is read-only.
If a route causes a write, stop and report it.

## Evidence And Baton

ARIADNE commits one public-safe result with:

- exact source and ledger/hash preflight;
- a pass/fail table for every route and role above;
- viewport/theme coverage and classified diagnostics;
- private-data/authority observations without raw identifiers;
- before/after retained invariants and residue counts; and
- one explicit verdict.

If the rehearsal passes, commit `WAKEUP A3:` and ask ARGUS to independently
review exact deployment/schema identity, hostile boundaries, the evidence
receipts, and final retained state. ARGUS does not redo ARIADNE's work or patch
the product; it records acceptance or wakes MIMIR with one concrete blocker.

On ARGUS acceptance, commit `WAKEUP A1:`. MIMIR then decides whether PR543 and
PR536 can close. No agent opens a successor programme from this rehearsal.

# PR543 Institutional Alpha Hosted Rehearsal - ARIADNE Result

Owner: ARIADNE / A4 -> ARGUS / A3

Date completed: 2026-08-04

Status:

```text
PASS_PR543_INSTITUTIONAL_ALPHA_HOSTED_REHEARSAL
READY_PR543_INSTITUTIONAL_ALPHA_HOSTED_REHEARSAL_FOR_ARGUS
```

## Verdict

The final PR536 Institutional Alpha customer journey passes at exact deployed
source `47576f5b5e969d96888479d9d698dfba01772d06`.

ARIADNE independently composed the retained Institution owner, active member,
unrelated signed-in account, and signed-out visitor journeys in four isolated
browser contexts. Institution identity, Project, collaborative publication,
authored Space, Salon, retained discussion, and owner-only Activity read as one
coherent product. Private authority remained bounded, public provenance stayed
routeable, responsive/theme treatment passed, and retained state was
byte-equivalent before and after the final rehearsal.

This rehearsal was read-only. It invoked no invite, revoke, create, edit,
publish, retract, unpublish, post, reply, vote, watch, report, moderation, or
audit-generating command.

## Deployment And Ledger Preflight

API and web both reported ready at the full exact source before browser work.
Each local migration hash matched its required SHA-256, and each hosted ledger
identity existed exactly once:

| Migration | SHA-256 | Hosted rows |
| --- | --- | --- |
| `092` | `B923C9EAB0AEADADBA8D16D9250FE1AC42307CE5A51191F48119B0101042A7C3` | `1` |
| `093` | `E95DB00E8A1D1AA706C69123B222D6C20EFABF96E492D183BAF3359947EFF435` | `1` |
| `094` | `BC2402C5474707ADCC4270DF7830A571270C0D225D3233D8D3DB3AFDBD408C6D` | `1` |
| `095` | `CDFE536350C8CE9D6A3A8721348C765A6A1FD1A9962E7DFC62BAA5F5DC9A5789` | `1` |
| `096` | `5F11DA79F9028F3009CE74C55E21917A23EFF48AC0C39950AB67711F4D5EEB62` | `1` |
| `097` | `CFA04E4ACD528EEBFD7A3D8776DC20CB7E9A656F41D23FB3156025A47C06B825` | `1` |
| `098` | `14277E34E4B02439E1888EB2F9197310CE10C2B07B35B67668C8DBF7529E58EE` | `1` |

## Four-Role Matrix

| Surface | Owner | Active member | Unrelated signed-in | Signed out |
| --- | --- | --- | --- | --- |
| Institution list | Retained principal, `Owner`, verified/public | Retained principal, `Member`, verified/public | Retained principal absent | Sign-in boundary |
| Team | Full owner controls and one distinct active member | Explicit active/read-only truth | Bounded `404` | Exact sign-in return / API `401` |
| Institution Project workspace | Institution principal, manage authority, public route | Institution principal, read-only, no visibility control | Bounded `404` | Exact sign-in return / API `401` |
| Publication workspace | Published `18`, human attribution, owner retract authority | Collaborative form, no publish/retract authority | Bounded `404` | Exact sign-in return / API `401` |
| Institutional Space workspace | Published `8`, locked authored fields, owner unpublish authority | Read-only configuration, no mutation or Activity control | Bounded `404` | Exact sign-in return / API `401` |
| Community workspace | Institution Salon, local owner moderation link | Ordinary forum eligibility, no moderation or Activity | Bounded `404` | Exact sign-in return / bounded API `404` |
| Activity | Owner `200`; all `58` events | Bounded `404`; no links | Bounded `404`; no links | Exact sign-in return / API `401` |
| Public Institution | Published Space, publication, Project, Salon | Public neighbor remained routeable | Public and private-safe | Public and private-safe |
| Public Project/publication | Verified Institution attribution | Verified Institution attribution | Public and private-safe | Discoverable and routeable |
| Salon/thread | Local owner moderation; ordinary forum surface | Own ordinary participation; no moderation | Read-only; no moderation | Read-only; no posting or moderation |

All six known unrelated private human URLs were exercised directly rather than
inferred from hidden controls. All returned the same bounded not-found posture.
Five signed-out private URLs preserved their exact login return path; community
preserved its accepted bounded unavailable API posture.

## Connected Journeys

The owner completed the connected route from Institution list through Team,
Institution Project, publication workspace, Space workspace, community
workspace, Salon, and Activity. Direct navigation, product links, refresh, and
back navigation preserved the owner session. All safe navigation controls used
in the journey reached their intended destination. Destructive controls were
inspected for truthful state and intentionally not invoked.

The active member completed Institution list, Team, Project, publication,
Space, community, Salon, and retained thread. Project and Space stayed
read-only, publication retained the accepted collaborative form without owner
transitions, and the member's ordinary thread/reply participation conferred no
Institution, Salon-owner, delegated-moderator, or global moderation authority.
Watch state resolved to `Not watching`; no form was submitted.

The unrelated non-admin account read the public Institution, Project,
publication, Salon, and discussion, then received bounded results from every
known private route. Candidate selection explicitly rejected the owner, active
member, global admin, and any account with Institution membership.

The signed-out visitor used the real public route:

```text
Discover search -> public Institution Project -> verified Institution ->
published Institution publication -> Institution Salon -> retained discussion
```

The public Project was routeable from Discover by title. Institution
provenance then led to the authored public Space, publication, Project, and
Salon. The discussion remained readable without posting, reply, watch, report,
or moderation controls.

## Activity And Privacy

The owner API and UI traversed the Activity timeline as `25 + 25 + 8` events.
All `58` entries were unique, newest-first, and covered identity, team, Project,
publication, Space, and community domains. Both continuation cursors decoded
to exactly `{ at, ordinal }`; neither contained a UUID.

Private response scans found no raw UUID, email, credential, provider payload,
billing, token-balance, or personal-memory field. Public response and rendered
surface scans found no member roster, invitation state, audit count/event,
private actor field, moderation queue, internal id, provider, credential,
billing, Archive, Memory, Settings, or personal Studio disclosure.

## Human-Eye Gate

Representative coverage was:

| Role | Viewport / theme | Key inspected surfaces |
| --- | --- | --- |
| Owner | `1440x1000` / light | Team, Project, publication, Space, community, Activity |
| Active member | `1280x900` / dark | Team, Project, publication, Space, retained thread |
| Unrelated | `390x844` / light | Public Institution and private not-found boundary |
| Signed out | `375x812` / dark | Discover, public Institution, publication, retained thread |

All captured surfaces had zero horizontal overflow, clipped controls,
placeholder leakage, unresolved loading, or incoherent overlap. Long identity,
provenance, publication, and thread copy wrapped cleanly. Light/dark contrast,
mobile action sizing, full-width public bands, form state, and keyboard focus
were legible and coherent. Four browser contexts were isolated and closed.

## Diagnostics Disclosure

The final completed pass recorded `42` canceled Next.js GET navigation or
prefetch requests with `net::ERR_ABORTED` and `14` expected boundary entries
from member/unrelated `404` responses plus their matching browser notices.
There were zero unclassified console errors, RSC fallback notices, page errors,
HTTP failures, failed product requests, stuck loading states, or session
failures.

Calibration was fully read-only:

- the first preflight corrected the thread-to-Salon fingerprint join from an
  assumed subcommunity key to the actual category key;
- an API pass corrected community's accepted anonymous boundary from assumed
  `401` to bounded `404`;
- one browser pass rejected a global-admin fallback as unsuitable for the
  unrelated role;
- two signed-out passes exposed a Discover hydration timing assumption; an
  isolated live check proved the result, and the final harness waits for
  homepage network readiness before search; and
- visual review caught a screenshot taken during watch-state loading and
  stitched fixed navigation after locator scrolling; the final pass waits for
  resolved watch state and resets scroll before capture.

Every stopped pass was non-mutating. Each fresh preflight found the same
retained baseline, and the final complete pass ended with exact before/after
fingerprint equality.

## Final Retained Truth

- one verified/public Institution and one distinct active member;
- one public Institution Project with zero Project-owner rows and one creation
  audit;
- one published Institution publication at version/audit `18/18`;
- one published Institutional Space at version/audit `8/8`;
- one active/public Institution Salon and retained thread/reply `1/1/1`;
- Institution audit events `58`;
- all seven migration ledger/hash identities exact once;
- API/web source unchanged at `47576f5b`;
- PR543 tagged residue `0`; and
- retained Institution, member, Project/member, publication, Space, Salon,
  thread, reply, audit, and ledger fingerprints byte-equivalent before/after.

Detailed receipts, private credentials, raw ids, and screenshots remain under
ignored `.station-private/pr543`.

## Baton

ARGUS should independently review exact deployment and migration identity,
hostile/private boundaries, public-safe evidence claims, and final retained
state. ARGUS should record acceptance or wake MIMIR with one concrete blocker.
This result does not close PR543 or PR536 and does not authorize a successor.

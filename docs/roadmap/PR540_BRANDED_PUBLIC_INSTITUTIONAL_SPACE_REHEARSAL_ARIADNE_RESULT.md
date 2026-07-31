# PR540 Branded Public Institutional Space - Hosted Rehearsal Result

Owner: ARIADNE / A4 -> MIMIR / A1

Date completed: 2026-07-31

Status:

```text
PASS_PR540_BRANDED_PUBLIC_INSTITUTIONAL_SPACE_HUMAN_REHEARSAL
```

## Verdict

The corrected PR540 owner/member/signed-out customer path passes at exact
deployed source `8673b7eeb7ee2d7b1cdd7434b929be9047bbce88`.

ARIADNE completed the one authorized visible-control cycle against the retained
Institutional Space. The owner unpublished once, edited only About once, and
republished once. Version and paired audit truth moved exactly from `5/5` to
`8/8`. No replacement fixture or extra product transition was created.

## Controlled Cycle

1. Owner desktop entered through Team and opened the workspace. Institution
   principal, owner role, published/version `5`, creator/editor labels, retained
   preview, disabled authored fields, `Unpublish`, and the working public link
   were all truthful.
2. One visible `Unpublish` returned success and exact draft/version `6`.
   Authored fields and accents became editable; save/publish controls appeared;
   the stale public link disappeared.
3. Signed-out mobile still received the verified minimal Institution identity.
   The authored mark, headline, About, publication aggregation, and Project
   aggregation were absent. The retained publication and public Project each
   remained independently reachable.
4. Active-member mobile entered through Team and opened read-only
   configuration at draft/version `6`. Role and attribution were truthful;
   fields and accents were disabled; no save, publish, unpublish, or stale
   public-page control was present.
5. Owner appended one clearly labelled PR540 rehearsal sentence to About and
   changed no other authored field. One visible save returned version `7`; one
   visible publish returned version `8`, restored disabled published fields and
   the public link, and left the Space public.
6. Signed-out mobile and desktop received the retained mark, headline, complete
   About, one published work item, and one Institution Project. Both aggregate
   links routed to their public destinations without login redirection.

## Human-Eye Matrix

| Surface | Viewport / theme | Result |
| --- | --- | --- |
| Owner Team and Space | `1440x1000` / light | Role, status, attribution, preview, controls, success states, and focus were coherent |
| Active-member Team and Space | `390x844` / dark | Read-only truth, disabled states, wrapping, role controls, and focus passed |
| Signed-out minimal identity | `375x812` / dark | Verified identity remained reachable with no authored or aggregate leak |
| Signed-out restored identity | `375x812` / dark | Authored identity and both aggregate bands wrapped and routed correctly |
| Signed-out desktop spot check | `1440x1000` / light | Full identity, next-band hint, work, Project, and footer composition passed |

All inspected surfaces had zero horizontal overflow, clipped actions,
placeholder leakage, or incoherent overlap. Keyboard traversal reached visible
interactive controls. The public hero left the next content band visible on
mobile and desktop. Refreshes preserved draft `6` and published `8` truth.
Public-safe captures were inspected by eye and remain in ignored
`.station-private/pr540`.

## Diagnostics Disclosure

Two harness-calibration stops occurred before mutation: an over-strict About
locator and a soft-navigation history assumption. A fresh read-only check after
each stop reconfirmed published version/audit `5/5`; neither produced an audit
event or product change.

During the completed cycle, the browser recorded `24` canceled Next.js
navigation or prefetch GETs with `net::ERR_ABORTED`. It also recorded two
Next.js console notices saying an RSC payload fetch fell back to browser
navigation: one background `/institutions` prefetch and one public Project
transition. The browser fallback completed, the target headings rendered, and
fresh direct reads of the Institution, publication, and Project routes all
returned `200`.

There were zero HTTP error responses, page errors, failed mutation responses,
stale-state errors, session failures, or unclassified request failures. The RSC
fallback notices are disclosed browser-navigation noise, not a hidden clean-run
claim.

## Final Hosted Truth

- API and web remained ready on exact source `8673b7ee`;
- migration `095` remained byte-identical with one exact ledger row at SHA-256
  `CDFE536350C8CE9D6A3A8721348C765A6A1FD1A9962E7DFC62BAA5F5DC9A5789`;
- append-only migration `096` retained one exact ledger row at SHA-256
  `5F11DA79F9028F3009CE74C55E21917A23EFF48AC0C39950AB67711F4D5EEB62`;
- retained Institutional Space count/status/version/audit is
  `1 / published / 8 / 8`;
- retained published Institution publication and public Institution Project
  remain `1 / 1`;
- effective browser table/RPC authority remains `0 / 0`, while trusted
  table/RPC authority remains `7 / 3`;
- tagged fixture Auth users and memberships remain `0 / 0`;
- total Auth, membership, Institution, Project, publication, and Institutional
  Space row counts are unchanged from the pre-mutation baseline; and
- the final public aggregate contains the retained authored Space, one
  publication, one Project, and the labelled rehearsal sentence.

An independent final read-only verifier reconfirmed exact deployment, both
ledgers, authority, public aggregation, zero fixture residue, and published
version/audit `8/8` after the browser process ended.

## Baton

PR540's corrected hosted human rehearsal is complete. MIMIR may close PR540 or
identify one concrete remaining gate. This result does not authorize PR541 or
any successor lane.

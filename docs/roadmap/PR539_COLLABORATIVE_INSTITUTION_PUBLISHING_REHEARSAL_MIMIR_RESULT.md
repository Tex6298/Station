# PR539 Collaborative Institution Publishing - Hosted Rehearsal Result

Owner: MIMIR / A1 (unavailable-ARIADNE fallback)

Date completed: 2026-07-31

Status:

```text
PASS_PR539_COLLABORATIVE_INSTITUTION_PUBLISHING_HUMAN_REHEARSAL_WITH_SERIALIZED_RECOVERY
```

## Verdict

PR539's hosted owner/member/signed-out customer path passes at exact deployed
source `34c91e078faccc93b36316e03e382a3cfb74d14e`.

ARIADNE did not consume the rehearsal wake during forty minutes of foreground
polling. MIMIR therefore ran the documented unavailable-A4 fallback through
the real hosted routes with the retained owner and active member. The final
visible-control cycle completed owner retract, member edit/save, owner
republish, hidden/restored signed-out read, public neighbour reads, and
Institution/Project attribution links.

## Evidence Correction

The planned retained delta was version/audit `7 -> 10`. Two harness errors
occurred after the owner had already retracted through the UI:

1. the Developer Space live stream correctly kept a connection open, so an
   inappropriate `networkidle` wait timed out; and
2. the corrected wait then reached the live observatory, but an inexact heading
   selector matched its H1 plus four content headings.

Each stop used the predeclared recovery path: one member edit and one owner
republish through the product API. The retained publication ended public at
`10/10`, then `13/13`; no transition was replayed or erased. The harness was
corrected to use DOM-content readiness for the live observatory and exact H1
selection. A third cycle then ran fully through visible browser controls from
version/audit `13/13` to `16/16`.

All nine post-baseline events are therefore explained as three serialized
retract/edit/publish groups. They are legitimate append-only product history,
not disposable residue. This result does not claim that the first two groups
were full human rehearsals.

## Human Results

- owner desktop/light: Team and publication context, attribution, role,
  version, public link, disabled published save, retract, private success, and
  republish success were coherent;
- active-member mobile/dark: the retained draft was editable, save feedback
  and version movement were visible, attribution remained stable, and
  publish/retract controls were absent;
- signed-out mobile/dark: retraction produced a bounded not-found state and
  republish restored readable content;
- public Institution and live Developer Space stayed reachable without login
  redirection during the private publication interval;
- final public Institution and Project attribution links both routed to their
  public destinations;
- public copy omitted UUIDs, email, version, audit, team, billing, provider,
  token, and private Studio data; and
- owner `1440x1000`, member `390x844`, public `375x812`, hidden state, focus,
  wrapping, action layout, and all inspected routes had zero horizontal
  overflow or placeholder leakage.

Public-safe screenshots show the owner draft/published states, member save
state, and signed-out hidden/published states. Sensitive receipts remain under
ignored `.station-private/pr539`.

## Final Retained Truth

- migration `094` SHA-256
  `BC2402C5474707ADCC4270DF7830A571270C0D225D3233D8D3DB3AFDBD408C6D`;
- one exact ledger row and exact API/web source `34c91e07`;
- one retained published Institution publication at version `16`;
- exactly `16` paired publication audit events;
- one retained verified/public Institution, active member, and public
  Institution Project;
- document count `29`;
- service RPCs `3`, browser RPC/table authority `0/0`;
- tagged Auth users and memberships `0/0`; and
- signed-out Institution, Developer Space index/detail, and publication reads
  all `200`; anonymous private publication read remains `401`.

## Baton

No PR539 source correction remains. MIMIR may close PR539 and advance the
active PR536 programme directly to PR540 Branded Public Institutional Space.

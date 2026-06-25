# Advance Team Design

Status: live watch bootstrap available; advisory advance work only.

Date: 2026-06-25

## Purpose

The advance team is a subordinate prep lane for work that should not split,
co-own, or disturb the active mainline PR sequence.

Advance agents prepare clean packets that MIMIR can accept, reject, or promote
into the main Station roadmap when the active lane is ready.

The advance team is not anti-pause machinery. Its job is not to keep product
motion going, push the current boundary forward, or imply that the mainline
must always have a next PR. It exists for off-boundary future preparation:
maps, ledgers, risk packets, prototype sketches, fixture plans, and preflight
docs for future sections that are not currently promoted.

## Authority Rule

MIMIR keeps sequencing, product, acceptance, and promotion authority.

KVASIR, SESHAT, JANUS, and CASSANDRA do not choose the next mainline lane,
declare the main team ready to move, or tell MIMIR what the product sequence
should be. They prepare bounded advisory packets only.

Future advance prompts should ask for scoped prep, for example:

- map a named billing or token-topup risk;
- inventory partner-pilot documentation clues;
- preflight a known config gate;
- compare options and name promotion criteria.

They should not ask an advance agent to decide what DAEDALUS, ARGUS, ARIADNE,
or MIMIR should do next. MIMIR may use an advance result as evidence, but is not
bound by it.

Advance work may later help MIMIR choose safely, but it does not force or imply
a next product lane.

## Separation Criteria

Before assigning future ADV packets, MIMIR must name why the work is cleanly
separable from the active A1-A4 lane.

Advance work is appropriate only when it has:

- no overlap with active mainline files, surfaces, or acceptance gates;
- a stable-enough contract, question, or evidence target;
- an independent artifact that can stand apart from current product decisions;
- a result that is discardable if later mainline truth makes it wrong;
- no need to wake A1-A4 or recommend the next mainline lane;
- no authority to decide product boundaries, acceptance bars, or promotion.

Advance outputs are not "consumed" as current mainline steering. MIMIR may later
review them as advisory prep, but mainline sequencing remains a MIMIR decision
grounded in current product truth, explicit user decisions, and active-lane
evidence.

Allowed advance work:

- audits;
- specs;
- route inventories;
- fixture plans;
- preflight gates;
- adapter sketches;
- risk packets;
- implementation options with promotion criteria.

Not allowed:

- changing acceptance bars;
- closing mainline PRs;
- waking DAEDALUS, ARGUS, or ARIADNE directly unless MIMIR explicitly says so;
- editing active mainline PR result docs;
- touching product code during an active mainline lane unless MIMIR promotes
  the packet into a normal PR lane.

## Agents

```js
const ADVANCE_AGENTS = {
  A5: { codename: "KVASIR", title: "The Distiller" },
  A6: { codename: "SESHAT", title: "The Archivist" },
  A7: { codename: "JANUS", title: "The Gatekeeper" },
  A8: { codename: "CASSANDRA", title: "The Foresight" },
};
```

### A5 / KVASIR - The Distiller

KVASIR coordinates advance packets. KVASIR distills scattered research,
upstream repo clues, user asks, and staged evidence into one bounded packet for
MIMIR.

KVASIR does not decide product sequence, set acceptance bars, or direct the
mainline team. KVASIR wakes MIMIR with options, tradeoffs, risks, and promotion
criteria.

### A6 / SESHAT - The Archivist

SESHAT records route inventories, schema notes, API surfaces, fixture lists,
source links, and evidence ledgers.

SESHAT should be used when the team needs reliable map-making before code.

### A7 / JANUS - The Gatekeeper

JANUS preflights boundaries: config, migrations, deploy topology, ownership,
visibility, idempotency, and promotion readiness.

JANUS is not ARGUS. JANUS forecasts gate requirements; ARGUS still performs
hostile review on promoted mainline work.

### A8 / CASSANDRA - The Foresight

CASSANDRA writes failure forecasts, red-team scenarios, product caveats, and
future-risk packets.

CASSANDRA is advisory only. A forecast becomes action only when MIMIR promotes
it.

## Wakeup Headers

Advance wakeups use the same simple parser shape with separate ids:

```text
WAKEUP A5:
Codename: KVASIR
```

```text
WAKEUP A6:
Codename: SESHAT
```

```text
WAKEUP A7:
Codename: JANUS
```

```text
WAKEUP A8:
Codename: CASSANDRA
```

## Paths

The live bootstrap uses separate mailboxes and state:

```text
.station-agents/inbox/KVASIR
.station-agents/inbox/SESHAT
.station-agents/inbox/JANUS
.station-agents/inbox/CASSANDRA
.station-agents/state/KVASIR.json
.station-agents/state/SESHAT.json
.station-agents/state/JANUS.json
.station-agents/state/CASSANDRA.json
```

Do not reuse A1-A4 state files for advance work.

## Lane Namespace

Advance packets use `ADV-###`, not `PR###`.

Recommended paths:

```text
docs/advance/ADV-001_<slug>.md
docs/advance/ADV-002_<slug>.md
docs/advance/results/ADV-001_<slug>_RESULT.md
```

Recommended commit subjects:

```text
advance: map <topic>
advance: record <topic> options
advance: preflight <topic>
```

No mainline PR number is assigned until MIMIR promotes an advance packet.

## Promotion Rules

An advance result can be promoted only by MIMIR.

Promotion packet shape:

```text
Candidate main lane:
- Proposed owner: DAEDALUS | ARGUS | ARIADNE | MIMIR
- Reason to promote now:
- Files likely touched:
- Acceptance bar:
- Validation:
- Config needed:
- Privacy/security review needed:
- Conflict with active mainline lane:
```

MIMIR may:

- accept and open a normal PR lane;
- reject and archive the packet;
- ask KVASIR for a narrower packet;
- defer until a named mainline lane closes.

## Conflict Rules

Advance agents stop and wake MIMIR if they would need to:

- edit active mainline PR docs;
- touch files already dirty from A1-A4 work;
- change agent registry/watch scripts while a mainline route rehearsal is
  active;
- alter package scripts used by the active A1-A4 workflow;
- add credentials, env values, raw ids, prompts, completions, private source
  bodies, provider payloads, SQL, or secret-shaped values;
- make product claims that have not been promoted and reviewed.

## Bootstrap Status

PR310 is active and ARIADNE has local rehearsal state/files in progress.

MIMIR decision: the user explicitly asked to proceed with script/docs bootstrap.
The bootstrap is therefore live for watch support only. It must not start
advance work until KVASIR receives a separate first `ADV-###` prompt.

Implemented bootstrap:

- `scripts/triad-agents.mjs` includes A5-A8;
- package scripts expose `advance:watch:kvasir`,
  `advance:watch:seshat`, `advance:watch:janus`, and
  `advance:watch:cassandra`;
- package scripts expose `advance:status` as the same readback as
  `triad:status`;
- separate inbox and state files exist for A5-A8;
- product code, roadmap acceptance bars, and active PR ownership are unchanged.

Do not start KVASIR or any other advance agent on real work from this bootstrap
commit. A separate wakeup must assign the first `ADV-###` packet.

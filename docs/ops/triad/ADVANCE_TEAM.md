# Advance Team Design

Status: MIMIR design note, not live automation yet.

Date: 2026-06-25

## Purpose

The advance team is a subordinate prep lane for work that should not split,
co-own, or disturb the active mainline PR sequence.

Advance agents prepare clean packets that MIMIR can accept, reject, or promote
into the main Station roadmap when the active lane is ready.

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

KVASIR does not decide product sequence. KVASIR wakes MIMIR with options,
tradeoffs, and a recommended promotion path.

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

When the live bootstrap is opened, use separate mailboxes and state:

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

## Bootstrap Decision

PR308 is active and ARIADNE has local rehearsal state/files in progress.

MIMIR decision: do not mutate live watch scripts or package scripts while that
mainline rehearsal is active. Record this design now. Open a separate bootstrap
implementation only after PR308 returns or if Marty explicitly asks for live
A5-A8 watch support immediately.

The first live bootstrap should be script-only and docs-only:

- extend `scripts/triad-agents.mjs` with A5-A8;
- create state/inbox directories;
- add watch scripts for A5-A8;
- add a one-line status/readme note that A5-A8 are advisory advance agents;
- avoid product code, roadmap acceptance changes, or active PR state changes.

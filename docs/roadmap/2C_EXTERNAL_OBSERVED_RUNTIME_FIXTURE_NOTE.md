# 2C External Observed Runtime Fixture Note

Date: 2026-06-19
Owner: A1 / MIMIR
Status: future-lane guidance only; does not interrupt active PR84

## MIMIR Opinion

The canonical first 2C fixture should be neutral and synthetic, but it should be
rich enough from the first preflight to survive both Animus-like identity
observability and MUDD-like autonomous world/community observability.

Yes: include nodes, events, snapshots, zones, resources/economy, provenance, and
field classification from the first fixture shape.

Yes: keep Animus-like and MUDD-like as shadow fixtures only. They should stress
the neutral contract without making 2C a partner-specific adapter or implying a
Station-hosted runtime.

## Canonical Synthetic Fixture Shape

The first file/sample fixture should include:

- source descriptor: source name, schema version, producer label, export time;
- nodes/entities: stable external IDs, labels, roles, status, public-safe
  summaries, and metrics;
- events/signals: type, actor, target, timestamp, zone, public-safe summary,
  related node IDs, and source event ID;
- snapshots: current state, metric summaries, public-safe status, and snapshot
  time;
- zones/world areas: stable IDs, names, public-safe descriptions, and activity
  counts;
- resources/economy/inventory: neutral resource names, balances/counts, and
  event links, with all values synthetic;
- graph/causal edges: related/supports/contradicts/derived-from style edges,
  source IDs, and confidence where available;
- provenance: external source IDs, source family, imported-at time, adapter
  version, and whether the field came from event, snapshot, node, zone, or
  resource state;
- field classification: explicit `public`, `member`, `owner`, `private`, and
  `secret` classes for every field family that could later enter public,
  community, owner, or raw views.

Secret-class fields should exist only as redaction tests or placeholders. The
fixture must not require a user-facing secrets vault.

## Shadow Fixture Stressors

Animus-like shadow fixture stressors:

- entity identity and lifecycle state;
- memory fragments or fragment counts;
- graph/causal edges;
- divergence, similarity, or snapshot metrics;
- private instrumentation versus public facade;
- controlled public-safe explanation for non-technical visitors.

MUDD-like shadow fixture stressors:

- multiple autonomous agents;
- zones/world areas;
- scheduled/background-loop signals;
- shared activity feed context;
- resources/economy/inventory state;
- daily reset or cycle metadata;
- member/community interaction;
- visibility splits between public, member, owner, private, and secret data.

These shadows should validate the neutral fixture contract. They should not add
partner-specific routes, partner branding, runtime secrets, hosted execution,
or direct dependency on Animus/MUDD systems.

## Sequencing Guidance

Open a 2C preflight/build-test lane only after the current active lane is no
longer waiting on DAEDALUS/ARGUS/ARIADNE, or if MIMIR deliberately pauses that
lane.

First 2C lane should be file/sample first and webhook-capable later:

- define the fixture contract;
- add JSON fixtures and parser/normalizer tests;
- prove public/member/owner/private/secret field filtering;
- prove Developer Space observatory readback from normalized data;
- document the future webhook shape without requiring live secrets or a
  user-facing vault.

Do not start with hosted runtime, partner adapters, user-pasted secrets,
Cloudflare Workers, queues, or background execution. Those can open only after
the neutral contract and visibility model are accepted.

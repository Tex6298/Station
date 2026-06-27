# Artifact Retention And Deletion Design - DAEDALUS

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date: 2026-06-27

Status: open - wake DAEDALUS

## Why This Exists

ARGUS completed hard-delete artifact-removal preflight and returned
`DESIGN FIRST`:
`docs/roadmap/HARD_DELETE_ARTIFACT_REMOVAL_PREFLIGHT_ARGUS.md`.

Current accepted truth is bounded tombstone cleanup:

- owner document delete removes the owner document row;
- linked document-discussion threads are hidden and locked;
- comments and community records are preserved behind the tombstone;
- public/member routeability is removed;
- owner-scoped cleanup readback reports what happened.

That is not a full artifact-retention/deletion policy. Before code, Station
needs a concrete design for what can be deleted, hidden, tombstoned, detached,
redacted, retained, or exported across product surfaces.

## Task

Produce a no-code design packet for MIMIR and ARGUS.

Map the artifact lifecycle across current repo truth:

- private drafts and published/unlisted/public documents;
- linked document-discussion threads;
- comments, replies, reports, votes, watches, witnesses, and moderation
  records;
- public Space and Developer Space references;
- archive files, storage objects, import jobs, chunks, and source metadata;
- Memory, Canon, Continuity candidates, accepted records, rejected/quarantined
  records, and integrity sessions;
- export manifests/packages and portable bundles;
- AI Activity, traces, selected-source metadata, and provider-operation
  readbacks;
- search/index/cache entries and any Redis/Upstash cache-only material;
- logs and hosted proof artifacts where the repo names them.

For each class, propose:

- current behavior and accepted evidence;
- owner-facing product expectation;
- allowed actor and authorization boundary;
- recommended lifecycle action: preserve, hide, tombstone, detach, redact,
  hard-delete, or defer;
- whether a retention window or undo/restore step is needed;
- public/private route readbacks that must change or stay stable;
- export/readback impact;
- moderation/audit/provenance impact;
- storage/index/cache cleanup impact;
- focused tests and hosted proof shape;
- stop conditions that should block implementation.

## Required Decisions

The packet must answer:

- Is full hard-delete artifact removal a near-term Station product feature, or
  should tombstone cleanup remain the protected-alpha truth?
- If hard-delete is near-term, what is the smallest safe implementation slice?
- Which artifact classes must never be silently hard-deleted because they carry
  moderation, provenance, audit, export, or owner-history meaning?
- What owner confirmation and post-action receipt/readback are required?
- What should happen to linked public routes, public search, private Studio
  readback, and export bundles after deletion?
- Does account/user data deletion stay out of this lane as a separate
  privacy/compliance project?

## Out Of Scope

Do not implement product code.

Do not change:

- schema, migrations, storage buckets, or hosted data;
- publish/retract/delete/import/upload behavior;
- comments, reports, votes, moderation actions, or forum behavior;
- export bundle generation;
- Redis, Cloudflare, provider/model, embeddings, billing, Stripe, workers,
  queues, auth/session, deployment, or broad UI styling.

Do not run hosted mutations.

Do not record secrets, raw ids, cookies, auth headers, private source bodies,
provider payloads, SQL output, stack traces, or customer data.

## Handoff

If the design packet is complete enough for hostile review, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed artifact retention/deletion design.
Task:
- Review the proposed lifecycle semantics, risk gates, and next implementation
  recommendation.
- Wake MIMIR with accepted design or DAEDALUS with exact required changes.
```

If current repo truth is insufficient to design safely, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS could not complete artifact retention/deletion design.
Blocker:
- <exact missing decision/evidence>
Task:
- Decide whether to narrow, defer, or open a different product lane.
```

Do not go idle without a wakeup commit.

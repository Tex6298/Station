# PR491 - Public Persona Second Fixture And Signed-In-Only Proof Preflight

Opened by: MIMIR / A1

Owner: ARGUS / A3

Date opened: 2026-07-05

Status: Open hostile preflight

## Why This Lane

PR490A/PR490B closed the owner/admin anonymous eligibility readback and
readiness-copy repair. The hosted rerun passed with one fixture caveat:

```text
no_second_ordinary_public_persona
```

The next Phase 3 direction is still public persona / public interaction
expansion, specifically moving anonymous public persona chat beyond a single
hard-coded replay alpha slug. The direct owner-controlled anonymous gate is not
ready while hosted evidence cannot prove that an ordinary public persona remains
signed-in-only and anonymous-denied.

This preflight should decide the smallest safe unblock lane. It is not runtime
implementation.

## Preflight Goal

ARGUS should decide whether DAEDALUS can create, identify, or document a safe
non-production ordinary public persona fixture and prove the signed-in-only
boundary before any broader anonymous runtime or owner-controlled gate.

The fixture proof should be intentionally boring:

- one ordinary public persona, not the replay alpha slug;
- safe public slug and public profile/card fields only;
- `public_chat_enabled` may be true for signed-in alpha behavior, but anonymous
  mode must remain denied;
- no private archive, Memory, Canon, Continuity, Integrity, owner setup,
  private documents, source bodies, provider payloads, prompts, transcripts,
  credentials, tokens, storage paths, raw ids, or secret-shaped values in public
  or owner-visible proof;
- hosted evidence that signed-out anonymous visitors do not get anonymous chat
  for this fixture;
- hosted evidence that owner/admin readback describes it as signed-in-only,
  not anonymous alpha.

## Candidate Outcomes

Return exactly one:

```text
ACCEPT_PR491A_SECOND_PUBLIC_PERSONA_FIXTURE_PROOF
ACCEPT_PR491A_OWNER_GATE_WITH_EXISTING_PROOF
BLOCKED_NEEDS_HOSTED_SEED_ACCESS
BLOCKED_NEEDS_PRODUCT_DECISION
REJECT_DEFER
NEEDS_MIMIR_DECISION
```

If ARGUS accepts a fixture proof lane, wake DAEDALUS with:

- exact fixture/source-of-truth boundary;
- whether this is code, seed, script, hosted data, or docs/runbook work;
- allowed files and forbidden files;
- required tests and hosted ARIADNE rehearsal;
- proof that anonymous runtime remains replay-only.

If ARGUS believes existing evidence is already enough to open the owner gate,
return `ACCEPT_PR491A_OWNER_GATE_WITH_EXISTING_PROOF` and explain the exact
evidence chain. Do not wake DAEDALUS for the owner gate unless the boundary is
specific.

## Guardrails

Do not:

- enable anonymous chat for all public personas;
- add owner-controlled anonymous enablement in this preflight;
- change `publicPersonaChatMode` to allow non-replay anonymous chat;
- add durable anonymous transcripts, visitor identity analytics, cookies, raw
  event storage, user-agent/IP logging, or new public report behavior;
- change provider/model routing, prompts, retrieval architecture, rate-limit
  behavior, token attribution, billing, Stripe, workers, queues, Redis,
  Cloudflare, connectors, OAuth, social dispatch, public launch claims, or
  broad UI;
- expose raw owner/persona/document/thread/source ids, private source text,
  prompts, completions, provider payloads, storage paths, signed URLs, database
  URLs, tokens, cookies, API keys, webhook secrets, bearer/JWT-shaped values, or
  secret-shaped values.

## Evidence To Read

- `docs/roadmap/PR490B_PUBLIC_PERSONA_ANONYMOUS_CHAT_READINESS_COPY_CLOSEOUT.md`
- `docs/roadmap/PR490B_PUBLIC_PERSONA_ANONYMOUS_CHAT_READINESS_COPY_RERUN_RESULT.md`
- `docs/roadmap/PR490A_PUBLIC_PERSONA_ANONYMOUS_CHAT_ELIGIBILITY_READBACK_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR468_ANONYMOUS_PUBLIC_PERSONA_CHAT_CLOSEOUT.md`
- current public persona seed/replay scripts and route tests as needed

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR closed PR490A/PR490B as accepted readback/copy repair work with one explicit fixture gap.
- Anonymous public persona chat still only applies to station-replay-alpha-persona; ordinary public personas remain signed-in-only and anonymous-denied by default.
- Hosted proof still lacks a second ordinary public persona, which blocks stronger evidence before any owner-controlled anonymous gate.
Task:
- Hostile-preflight the smallest safe PR491A lane: second ordinary public persona fixture proof, existing-proof owner-gate readiness, concrete hosted seed blocker, product decision blocker, defer, or MIMIR decision.
- If accepted, wake DAEDALUS with exact fixture/source boundary, files, forbidden surfaces, validation, and ARIADNE hosted rehearsal requirements.
Guardrails:
- Do not implement runtime expansion. Do not enable anonymous chat beyond the replay alpha slug. Preserve public-source-only prompting, transcriptStored:false for anonymous visitors, owner rollback, fail-closed rate limits, private-context exclusion, and no broad public launch claims.
```

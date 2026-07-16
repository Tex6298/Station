# PR528B2 - Partner Corpus And Provider Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-16

Status: Open - read-only hosted mutation boundary

## Task

Design the smallest safe implementation packet for PR528A's public corpus,
isolated private Studio corpus, and accepted-provider blockers. Use:

- `docs/roadmap/PR528A_IMPORTANT_ROUTES_PARTNER_PREFLIGHT_ARIADNE_RESULT.md`
- `docs/roadmap/PR528B_PARTNER_CORPUS_CONTENT_BRIEF_MIMIR.md`
- current account, Space, publication, discussion, persona, Memory, Archive,
  Continuity, provider-settings, encryption, feed/ranking, entitlement, and
  cleanup contracts.

This is read-only. Do not create accounts or rows, change tier/subscription,
store provider credentials, call a model, edit source, or mutate hosted state.

## Provider Truth To Preserve

The local presence-only check found non-empty NVIDIA and Gemini keys, while
OpenAI and DeepSeek values are empty and Anthropic is absent. Values were not
printed. This is not proof of Railway inventory.

- Gemini remains the accepted embeddings provider, not a chat-provider route.
- Platform NVIDIA is deliberately blocked for private Station context by the
  accepted data-policy contract.
- Owner BYOK currently accepts only the implemented OpenAI, Anthropic, or
  DeepSeek contracts and requires `AI_PROVIDER_KEY_ENCRYPTION_KEY` for the
  encrypted credential table.
- Do not point an OpenAI field at NVIDIA, copy a platform key into owner data,
  permit private NVIDIA by accident, invent a Gemini chat route, or record a
  fake model reply.

Inspect Railway/provider readiness through non-secret facts. If no accepted
non-NVIDIA platform route or owner BYOK key is available, return one exact
configuration blocker while allowing corpus preparation to proceed
independently. Recommend the smallest honest option; do not widen PR528 into a
new provider integration or provider-policy rewrite without a new MIMIR lane.

## Boundary Questions

Return implementation-ready answers for:

1. Whether one isolated partner-review owner can be created through ordinary
   signup and what truthful entitlement is required for one private persona,
   Memory/Inbox/Archive/Continuity, and the public Space/document/discussion.
2. Whether public and private corpus should share that owner or use separate
   staging owners to avoid false billing/tier or public-authorship claims.
3. The exact APIs/RPCs/tables and order for every content item in MIMIR's brief,
   with owner/public visibility and provenance requirements.
4. How the public document becomes visible in `Latest` without fabricating
   engagement, staff endorsement, timestamps, or ranking state.
5. Which records are intentionally retained through partner review, how they
   are privately tagged, and the exact post-review cleanup packet and orphan
   proof.
6. How review credentials and any BYOK secret are stored locally/hosted without
   entering git, logs, screenshots, result docs, or public content.
7. The accepted private provider route actually available now, or the exact
   missing config name/category and safe readiness test.
8. The bounded chat proof: one relevant reply, persistence/refresh,
   return-to-thread, private non-leakage, usage/trace truth, and post-proof
   conversation cleanup while leaving the curated account/corpus available.

Inspect quotas, billing semantics, auth redirects/session behavior, provider
encryption readiness, RLS, cascade behavior, feed eligibility, discussion
linking, and public-search leakage. A staging fixture may remain through review
only when its purpose and cleanup trigger are explicit; it must not masquerade
as a paid customer or real community member.

## Result And Handoff

Create:

`docs/roadmap/PR528B2_PARTNER_CORPUS_PROVIDER_PREFLIGHT_ARGUS_RESULT.md`

Separate verdicts for:

- `PUBLIC_CORPUS_READY_FOR_BOUNDED_HOSTED_PREPARATION` or exact blocker;
- `PRIVATE_CORPUS_READY_FOR_BOUNDED_HOSTED_PREPARATION` or exact blocker; and
- `PRIVATE_PROVIDER_READY_FOR_CONFIGURATION` or exact config/policy blocker.

Include the exact implementation order, write allow-list, retained-state
ledger, cleanup packet, validation, likely owner, and whether corpus work may
proceed before provider config. Change only the result and
`.station-agents/state/ARGUS.json`.

Commit and push, then wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed the PR528B2 partner corpus/provider boundary preflight.
Verdict:
- Public/private corpus and provider verdicts recorded separately.
Task:
- Route the accepted hosted corpus/config slices without weakening provider policy or delaying independent work on a missing key.
```

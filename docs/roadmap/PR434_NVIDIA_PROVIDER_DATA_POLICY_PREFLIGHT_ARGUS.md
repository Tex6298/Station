# PR434 - NVIDIA Provider Data-Policy Preflight

Date opened: 2026-06-28

Opened by: MIMIR / A1

Owner: ARGUS / A3

Status: open - decide private/replay policy before product use

## Why This Lane

PR433 proved that the current NVIDIA OpenAI-compatible platform-chat route is
configured and callable with synthetic-only content. It did not approve sending
private archive text, Memory, Continuity, owner replay corpus, persona private
profile text, or real user prompts through NVIDIA.

Before DAEDALUS wires or exercises NVIDIA in any real product replay flow,
ARGUS should decide the provider/data-policy boundary and name the smallest
safe next step.

Relevant inputs:

- `docs/roadmap/PR433_NVIDIA_PLATFORM_CHAT_SYNTHETIC_PROOF_RESULT.md`
- `docs/roadmap/PR433_NVIDIA_PLATFORM_CHAT_SYNTHETIC_PROOF_REVIEW_RESULT.md`
- `docs/roadmap/STATION_RETRIEVAL_PROVIDER_RESEARCH_ARIADNE.md`
- `docs/roadmap/STATION_FUTURE_LANES.md`
- `docs/architecture/persistence-schema-baseline.md`

## Questions For ARGUS

Answer with evidence from current repo/docs only:

1. Which NVIDIA provider modes are acceptable now?
   - public/synthetic-only platform calls;
   - public Developer Space/observatory calls;
   - owner BYOK calls;
   - platform calls with private Studio context;
   - platform calls with Memory, Continuity, Archive, Integrity, Canon, or
     replay owner corpus context.
2. For each acceptable mode, what data may be sent to the provider and what
   must stay inside Station/Supabase?
3. Does the PR433 exact-output caveat require a model/config change before
   product replay, or is it acceptable for routeability only?
4. Is the current usage-accounting posture acceptable, given PR433 notes that
   the adapter did not parse NVIDIA response usage and product traces rely on
   Station estimates?
5. What must observability/readback show for NVIDIA calls: provider route,
   model, status, token/cost estimates, latency, mode, posture, and policy
   labels? What must it never show?
6. What export, deletion, audit, and user-trust obligations apply if private
   Station context ever leaves Station for NVIDIA?
7. If private NVIDIA usage is blocked, what is the next safe product lane:
   staged replay on the existing non-NVIDIA product path, public/synthetic
   NVIDIA only, a model/config change, or a DAEDALUS implementation patch?

## Boundaries

Do not:

- run live private/product NVIDIA calls;
- send private archive text, Memory, Continuity, owner replay corpus, persona
  private profile text, real user prompts, source snippets, IDs, tokens,
  credentials, database URLs, cookies, provider payloads, or secrets to NVIDIA;
- switch embeddings to NVIDIA;
- change vector dimensions, retrieval schema, migrations, or stored corpus;
- add a model gateway, provider menu, Gemini chat UI, Cloudflare, Redis,
  workers, queues, Stripe, billing, or production provider-policy code;
- document that private NVIDIA product use is accepted unless the review
  explicitly accepts that boundary and names required gates.

## Expected Output

Create a review result doc and wake MIMIR with one of these verdict shapes:

```text
ACCEPT PUBLIC/SYNTHETIC ONLY
```

Use this if NVIDIA may remain available for synthetic/public-safe probes but
private replay must stay off NVIDIA.

```text
ACCEPT BOUNDED PRIVATE MODE WITH GATES
```

Use this only if ARGUS can name exactly which private context classes may be
sent, under which mode, with which observability/export/deletion/accounting
requirements. Include the DAEDALUS implementation task.

```text
BLOCKED - NEED MIMIR DECISION
```

Use this if product/provider/accounting/privacy policy needs a decision before
engineering.

```text
FIX REQUIRED - WAKE DAEDALUS
```

Use this only if current repo behavior or docs already make an unsafe claim or
need a narrow patch before MIMIR can sequence replay.

## Wakeup

Wake MIMIR with `WAKEUP A1:` when the policy verdict is ready.

Wake DAEDALUS with `WAKEUP A2:` only if ARGUS finds an immediate repo defect
that should be fixed before MIMIR chooses the next product lane.

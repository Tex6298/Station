# PR492 - Owner-Controlled Anonymous Public Chat Gate Preflight

Opened by: MIMIR / A1

Owner: ARGUS / A3

Date opened: 2026-07-05

Status: Open hostile preflight

## Why This Lane

The Phase 3 product direction remains public persona / public interaction
expansion.

The required boundary evidence now exists:

- PR468 proved anonymous public persona chat for the single replay alpha slug.
- PR490A/PR490B made owner/admin eligibility and readiness truth visible.
- PR491A added hosted proof that an ordinary public persona can remain
  signed-in alpha and anonymous-denied while the replay slug remains the only
  anonymous alpha.

The next product capability is therefore the owner-controlled anonymous public
chat gate. Because this would be real runtime expansion beyond the replay slug,
ARGUS must hostile-preflight the exact implementation boundary before
DAEDALUS receives code work.

## Preflight Goal

ARGUS should decide the smallest safe PR492A slice for an owner-controlled
anonymous public chat gate.

The preflight must answer:

- what data/control source governs anonymous eligibility;
- whether it is separate from `public_chat_enabled`;
- which owners/personas are eligible;
- how the default remains off;
- how owner rollback works;
- how the current signed-in-only fixture remains a negative control;
- how anonymous visitors remain public-source-only, no-transcript, no-identity,
  fail-closed, and rate-limited;
- what owner/admin readback and hosted ARIADNE proof must show.

## Candidate Outcomes

Return exactly one:

```text
ACCEPT_PR492A_OWNER_CONTROLLED_ANONYMOUS_GATE
ACCEPT_PR492A_GATE_READBACK_ONLY
BLOCKED_NEEDS_PRODUCT_DECISION
BLOCKED_NEEDS_PROVIDER_OR_RATE_LIMIT_POLICY
BLOCKED_NEEDS_ENTITLEMENT_POLICY
REJECT_DEFER
NEEDS_MIMIR_DECISION
```

If accepted for implementation, wake DAEDALUS with:

- exact data model/control boundary;
- allowed files and forbidden files;
- migration/seed requirements if any;
- owner/admin UI/readback boundary;
- public runtime allow/deny behavior;
- focused tests;
- ARGUS review expectations;
- ARIADNE hosted rehearsal requirements.

## Guardrails

Do not implement in this preflight.

Do not:

- enable anonymous chat for all public personas by default;
- reinterpret `public_chat_enabled` as anonymous consent unless ARGUS explicitly
  accepts that boundary and names the risks;
- make anonymous chat available to private personas, unsafe slugs, ineligible
  owners, disabled personas, missing-provider states, or failed rate-limit
  states;
- persist anonymous visitor transcripts, visitor identity, raw request events,
  cookies, auth headers, user agents, IPs, prompts, completions, provider
  payloads, or public chat raw events;
- expose private Memory, Archive, Canon, Continuity, Integrity, private
  documents, owner setup, provider settings, private source text, source bodies,
  route-only ids, credentials, storage paths, signed URLs, database URLs,
  tokens, cookies, API keys, webhook secrets, bearer/JWT-shaped values, or
  secret-shaped values;
- change public reporting from signed-in only;
- change provider/model routing, prompt/retrieval architecture, token
  attribution, billing, Stripe, workers, queues, Redis, Cloudflare, connectors,
  OAuth, social dispatch, public launch claims, or broad UI.

## Required Evidence To Read

- `docs/roadmap/PR491A_PUBLIC_PERSONA_SECOND_FIXTURE_PROOF_CLOSEOUT.md`
- `docs/roadmap/PR490B_PUBLIC_PERSONA_ANONYMOUS_CHAT_READINESS_COPY_CLOSEOUT.md`
- `docs/roadmap/PR490A_PUBLIC_PERSONA_ANONYMOUS_CHAT_ELIGIBILITY_READBACK_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR468_ANONYMOUS_PUBLIC_PERSONA_CHAT_CLOSEOUT.md`
- current `publicPersonaChatMode`, persona owner/admin readback, public chat
  route, rate-limit, provider payload, reports, and public persona helper tests

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR closed PR491A: hosted proof now covers the ordinary public persona signed-in-only negative control.
- station-replay-alpha-persona remains the only anonymous_alpha slug; station-replay-signed-in-alpha-persona exists as signed_in_alpha and anonymous-denied.
- The next Phase 3 capability is the owner-controlled anonymous public chat gate, but runtime expansion needs a hostile boundary preflight before DAEDALUS implementation.
Task:
- Hostile-preflight PR492A owner-controlled anonymous public chat gate.
- Return owner gate, gate-readback-only, product decision blocker, provider/rate-limit blocker, entitlement blocker, defer, or MIMIR decision.
- If accepted, wake DAEDALUS with exact data/control boundary, files, forbidden surfaces, validation, review focus, and ARIADNE hosted proof requirements.
Guardrails:
- Do not implement runtime expansion in preflight. Do not enable anonymous chat for all public personas by default. Preserve public-source-only prompting, no anonymous transcript/identity/raw-event storage, owner rollback, fail-closed rate limits, signed-in-only negative control, private-context exclusion, and no broad public launch claims.
```

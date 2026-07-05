# PR493 - Persona Roulette Visitor Encounter Preflight

Date: 2026-07-05

Owner: ARGUS / A3

State:

```text
OPEN_HOSTILE_PREFLIGHT
```

## Context

PR492 is closed as accepted:

`docs/roadmap/PR492_OWNER_CONTROLLED_ANONYMOUS_PUBLIC_CHAT_GATE_CLOSEOUT.md`

Station already has Public Persona Roulette discovery/readback from PR216/PR217:

- `GET /personas/public/roulette`;
- Discover right-rail roulette cards;
- routeable public persona cards without raw id/provider/setup/private leakage.

That older roulette slice opens existing public persona pages. It does not yet
deliver the Phase 3 Future Vision text encounter:

- visitor launches a random public persona encounter;
- visitor gets a bounded text conversation;
- non-member interaction is limited;
- the end of the encounter invites sign-up / Studio creation.

PR492 now proves that an eligible owner-enabled non-replay public persona can
accept signed-out anonymous chat safely, with rollback and no transcript or raw
identity storage.

## Preflight Question

Should PR493 open a narrow Persona Roulette visitor text encounter lane now, or
is there a concrete blocker that must be removed first?

## Candidate PR493A Slice

`PR493A - Persona Roulette Visitor Encounter`

Possible narrow implementation:

- Add a public roulette encounter route/page that draws one eligible public
  persona.
- Restrict anonymous visitor encounter candidates to personas whose safe public
  readback resolves to `anonymous_alpha`.
- Reuse the existing anonymous public persona chat endpoint:
  `POST /personas/public/:publicSlug/chat`.
- Keep the visitor encounter local/ephemeral: no transcript persistence, no
  visitor identity storage, no raw event storage.
- Limit signed-out visitor turns to a small bounded count, preferably five,
  with honest exhausted-state copy.
- Show a sign-up / create-your-own Studio CTA when the limit is reached or the
  visitor chooses to continue.
- Preserve owner-paid token attribution and existing fail-closed
  provider/rate/quota behavior.
- Keep Discover roulette card behavior compatible or link into the encounter
  only when the persona is anonymous-eligible.

## Guardrails

PR493A must not:

- enable anonymous chat for signed-in-alpha personas;
- bypass owner anonymous gate consent;
- select private, unsafe-slug, ineligible, provider-blocked, or hidden personas;
- persist visitor transcripts, identities, raw events, provider payloads, IP
  addresses, user agents, cookies, or auth headers;
- add voice/avatar mode;
- add public Salon/live event chat;
- add broad recommendation/matching infrastructure;
- add billing, queue, Redis, Cloudflare, worker, or provider architecture;
- make public launch or commercial conversion claims beyond a protected-alpha
  encounter surface;
- import Discern CSS or broad-reskin unrelated pages.

## ARGUS Decision Options

Return one of:

```text
ACCEPT_PR493A_ROULETTE_VISITOR_ENCOUNTER
ACCEPT_PR493A_ROULETTE_READBACK_ONLY
BLOCKED_NEEDS_RATE_SESSION_BOUNDARY
BLOCKED_NEEDS_SIGNUP_CTA_DECISION
BLOCKED_NEEDS_ELIGIBLE_FIXTURE_PROOF
BLOCKED_NEEDS_ABUSE_MODERATION_BOUNDARY
REJECT_SCOPE_TOO_BROAD
```

If accepting implementation, define:

- exact route/API/UI surfaces;
- whether the existing roulette endpoint needs an anonymous-eligible filter;
- how the signed-out turn limit is enforced without storing transcripts;
- required no-leak fields and public-source-only constraints;
- focused tests and hosted ARIADNE proof requirements;
- DAEDALUS wakeup scope.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- PR492 owner-controlled anonymous public chat gate is closed as accepted.
- MIMIR selects Persona Roulette Visitor Encounter as the next distinct Phase 3/customer-facing feature preflight.
- Existing roulette is discovery/readback only; PR492 now proves owner-gated anonymous chat for eligible public personas.
Task:
- Hostile-preflight PR493 and decide the smallest safe Persona Roulette visitor encounter slice, or return the concrete blocker.
- If accepted, wake DAEDALUS with exact implementation scope. If blocked, wake MIMIR with the smallest unblock.
```

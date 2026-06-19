# PR72 - Current Runtime Human Rehearsal

Date opened: 2026-06-19
Opened by: A1 / MIMIR
Owner: ARIADNE rehearses from a human-eye view. MIMIR sequences any follow-up.
Status: open for ARIADNE

## Why This Lane

PR71 proved the current Railway runtime is configured for Supabase,
`persona-files`, Supabase Auth redirects, Gemini `station_free_1536`
embeddings, NVIDIA platform chat, Stripe test billing/prices, and Upstash
operational cache.

ARGUS accepted PR71 and recommended exactly one next step: run a
replay/user-facing rehearsal against the current Railway runtime. Do not open a
code repair lane unless this rehearsal finds a concrete route, role,
expected/actual defect.

## Rehearsal Posture

This is a **human rehearsal**. Use the product like a prepared protected-alpha
tester would use it. Look for what a human can see, understand, click, and get
stuck on.

Record expected/actual behavior. Do not record raw private text, credentials,
tokens, checkout URLs, portal URLs, customer IDs, subscription IDs, owner IDs,
persona IDs, trace IDs, cookies, JWTs, provider keys, webhook bodies, `.env`
values, or secret-shaped strings.

## Route Plan

Run against the current Railway runtime:

- public preflight:
  - web `/health`;
  - API `/health`;
  - web `/health/deployment`;
  - API `/health/deployment`;
- anonymous public story:
  - `/`;
  - `/discover`;
  - public Space `station-replay-alpha`;
  - public document from the replay seed;
  - linked forum discussion;
- signed replay-owner session:
  - sign in using ignored local replay credentials only;
  - verify `/auth/me` equivalent session state through product navigation;
  - refresh a signed page and navigate away/back to check whether login persists
    across normal reload/navigation;
- private Studio core:
  - Studio dashboard;
  - replay persona home;
  - Memory as its own route/stop;
  - Continuity as its own route/stop, not only runtime-context counts;
  - Archive/persona files;
  - Integrity route/start surface;
  - Global Archive search;
  - Station Assistant;
- runtime path:
  - send at most one short replay-safe synthetic chat prompt if the signed
    replay owner and provider path are ready;
  - verify the response does not expose raw provider traces, secret values, or
    private material beyond the owner's private Studio view;
  - confirm continuity/runtime readback labels make sense to a human;
- Developer Space:
  - public observatory;
  - signed owner manage console;
  - confirm public and owner views keep raw/key/private boundaries distinct;
- billing/config surfaces:
  - billing page;
  - plan/current-tier state;
  - hosted Stripe Checkout or Portal opens only if safe in test mode; do not
    record hosted URLs, customer/session IDs, card details, or Stripe object
    IDs;
- mobile:
  - repeat the highest-risk signed and public surfaces at `390px` width:
    Discover/public document/thread, Studio persona, Memory, Continuity,
    Archive, Assistant, Developer Space manage/public, and Billing.

## Things To Look For

Pass/fail the run on concrete defects, not taste:

- navigation and session persistence behave like a normal user would expect;
- action buttons are wired, disabled, hidden, or clearly preview-only;
- public routes do not expose private Studio, Memory, Continuity, Integrity,
  Archive import, Developer Space manage, provider trace, billing, or raw data;
- signed private routes explain Memory, Continuity, Archive, Integrity, and
  Assistant state without feeling like dead dashboards;
- Continuity is findable and understandable as its own stop;
- billing and Stripe test surfaces are intelligible without overclaiming
  production billing;
- Upstash/Redis is not exposed as memory truth or worker readiness;
- Gemini embeddings and NVIDIA chat are not advertised as a broad provider
  marketplace;
- mobile has no document-level horizontal overflow, offscreen primary controls,
  or text overlap.

## Handoff

Always wake MIMIR with the verdict. Do not leave the flow silent.

If everything passes, say PR72 can close and recommend the next product lane or
pause.

If something fails, provide:

- exact route;
- signed or anonymous role;
- expected behavior;
- actual behavior;
- screenshot/path evidence summary without secrets;
- whether it is likely DAEDALUS code work, ARIADNE copy/UX work, ARGUS privacy
  review, or MIMIR sequencing.

MIMIR will decide whether to wake DAEDALUS for a repair. Do not open broad UI,
Stripe, Redis, Cloudflare, provider, worker, parser/OAuth, Project/DexOS, or
runtime architecture from a vague impression.

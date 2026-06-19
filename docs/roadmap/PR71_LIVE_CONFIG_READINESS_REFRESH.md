# PR71 - Live Config Readiness Refresh

Date opened: 2026-06-19
Opened by: A1 / MIMIR
Owner: DAEDALUS proves and documents, ARGUS reviews. ARIADNE is not needed
unless a user-facing flow changes.
Status: open for DAEDALUS

## Why This Lane

PR70 closed the public-story caveats. Marty has confirmed Stripe test config
and Upstash Redis config are now available. The repo also already carries
accepted Stripe, Redis, provider-policy, memory/retrieval, archive/import, and
replay-readiness lanes.

Do not reopen those lanes just because config exists. PR71 exists to record the
current live deployment truth and decide whether config creates a concrete
repair lane.

MIMIR's preliminary public probes on 2026-06-19 found:

- web `/health` returned `ok:true`;
- web `/health/deployment` returned `ok:true`, `ready:true`, service
  `@station/web`, runtime commit `f830041df118c4e3e63cb1d9b5985e2ffb2121b7`;
- API `/health/deployment` returned `ok:true`, `ready:true`, service
  `@station/api`, runtime commit `f830041df118c4e3e63cb1d9b5985e2ffb2121b7`;
- Supabase URL, anon key, service-role key, database URL, JWT secret,
  `persona-files` private bucket, public URLs, and Supabase Auth redirects were
  reported ready by sanitized readiness booleans;
- embedding readiness reported `station_free_1536`, provider `gemini`,
  `embeddingsConfigured:true`, `geminiEmbeddings:true`,
  `openaiEmbeddings:false`;
- platform chat readiness reported `nvidiaProvider:true`;
- Stripe readiness reported billing secrets and all Basic/Creator/Canon monthly
  and yearly price IDs configured;
- Redis readiness reported `upstashRest:true`, operational cache enabled as
  `upstash_rest`, and worker queue not ready because Upstash REST is cache-only
  with inline fallback.

## Goal

Produce one accepted current-truth evidence note answering:

- Is deployed staging currently configured for Supabase, Gemini embeddings,
  NVIDIA platform chat, Stripe test billing, and Upstash operational cache?
- Is any config still blocking replay/productization?
- Does any measured route justify opening code work now?

## Scope

DAEDALUS should:

- rerun public web/API health and deployment readiness probes;
- run local focused tests for the same surfaces:
  - `test:health`;
  - `test:replay-readiness`;
  - `test:billing`;
  - operational-cache service tests;
  - provider-router and retrieval-metadata tests if relevant;
- record sanitized evidence only: booleans, provider labels, readiness status,
  runtime commit/service, command results, and explicit caveats;
- reconcile the result against PR3 Stripe, PR4 Redis, PR5 provider policy, PR29
  live replay refresh, PR66 memory observability closeout, and PR70 public story
  closeout;
- recommend exactly one next step:
  - no code now;
  - one config-specific repair;
  - one Stripe test-mode smoke refresh;
  - one Upstash/operational-cache follow-up;
  - one embedding/profile/reindex smoke follow-up;
  - one replay/user-facing rehearsal.

## Non-Scope

- Do not print or commit secrets, URLs containing session credentials, Stripe
  IDs, customer IDs, subscription IDs, webhook bodies, JWTs, cookies, owner IDs,
  persona IDs, API keys, or `.env` values.
- Do not run live-money billing.
- Do not add a provider marketplace, BYOK secret store, model gateway, Gemini
  chat provider, or hosted open-source model runtime.
- Do not promote Redis/Upstash to memory truth.
- Do not add BullMQ/worker infrastructure from Upstash REST alone.
- Do not open Cloudflare retrieval, Vectorize, parser/OAuth, social posting,
  Project/DexOS, broad UI, or public/private policy changes.
- Do not change product code unless a precise failing readiness route or test
  names the minimal repair.

## Acceptance

ARGUS can accept PR71 if:

- live readiness evidence is sanitized and current;
- Stripe test readiness is reconciled with PR3 without overclaiming production
  billing;
- Upstash readiness is reconciled with PR4 as operational cache, not queue or
  memory truth;
- Gemini/NVIDIA readiness is reconciled with PR5 and the current embedding/chat
  split;
- any remaining blocker is concrete, named, and assigned to a single next lane;
- no secrets or private replay data are committed.

## Handoff

Wake ARGUS with:

- live route set and deployment identity;
- sanitized readiness booleans/status labels;
- validation commands/results;
- whether code changed;
- one ranked next recommendation;
- privacy statement.

If a concrete implementation repair is needed before review, keep it narrow and
name the failing route/test in the handoff. If there is no repair, this is a
docs/evidence lane.

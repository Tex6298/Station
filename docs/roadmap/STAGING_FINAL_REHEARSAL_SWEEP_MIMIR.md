# Staging Final Rehearsal Sweep - MIMIR

Date: 2026-06-14
Owner: MIMIR / A1
Status: opened for ARIADNE final staging UX/rehearsal sweep.

## Why This Exists

The Discern UI/UX parity sweep is closed for staging. Recent staging-facing
fixes are also accepted or proven:

- Billing test-mode activation and same-tier activation UX are accepted for the
  human rehearsal.
- Staging interaction cleanup is deployed and accepted: preview-only global
  Archive controls are disabled, forum own-vote dead ends are removed, report
  success is styled as success, and vote RPC `.catch` hardening is proven.
- Archive import source wording is accepted so `0 import sources` no longer
  conflicts with runtime/archive counts that include archived chats.
- Moderation report idempotency is patched, migrated, and proven on staging.
- Discern public shell, entry/onboarding, Discover search clarity, and
  nav/search IA are accepted or deliberately parked.

The next useful question is therefore not another parity sweep. It is whether
the hosted staging demo path is clean enough to run as a human rehearsal, and
whether any remaining friction is a blocker or future polish.

## ARIADNE Task

Run a final UX/rehearsal sweep against the current accepted staging route,
using `docs/roadmap/STAGING_DEMO_NARRATIVE_ARIADNE.md` as the run-of-show.

Focus on:

- public front door and Discover orientation;
- public Space, public document, and forum/discussion controls;
- Developer Space public observatory and owner manage surface;
- Studio home and persona workspace;
- Memory, Continuity, Archive, and runtime context;
- persona export/readback;
- Billing as bounded Stripe test-mode proof only;
- Settings/observability if present in the run;
- mobile fit for the core Studio/Memory/Archive surfaces.

Classify each finding as:

- pass for human rehearsal;
- future polish;
- blocker needing DAEDALUS;
- security/visibility concern needing ARGUS.

## Boundaries

Do not reopen generic Discern parity.

Do not treat future named lanes as blockers unless the hosted demo visibly fails:

- notes/global archive;
- runtime kindling metadata;
- persona chat save/pin affordances;
- mobile nav polish;
- richer public presentation;
- lower-tier billing IA/copy;
- full workspace/PDF/binary export;
- background jobs;
- Cloudflare runtime dependency;
- Redis as memory truth.

Do not capture or commit secrets, tokens, cookies, raw response bodies, Stripe
URLs or paths, webhook bodies, customer/subscription IDs, owner/persona/export
IDs, private excerpts, prompts, completions, raw corpus text, or screenshots.

## Required Response Path

If the rehearsal path passes, wake MIMIR with a concise closeout verdict.

If a UX or wiring blocker appears, wake DAEDALUS with:

- exact route;
- exact control or state;
- expected behavior;
- observed behavior;
- file allow-list if known;
- validation needed.

If a privacy, entitlement, auth, visibility, or data-leak concern appears, wake
ARGUS with the exact hostile-path question.

Do not go quiet without a wakeup.

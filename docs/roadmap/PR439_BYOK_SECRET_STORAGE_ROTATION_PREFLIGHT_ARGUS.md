# PR439 - BYOK Secret Storage And Rotation Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Context

PR438 safely exposed the existing owner BYOK route for OpenAI, Anthropic, and
DeepSeek. ARGUS accepted the narrow unblock, but left a residual caveat:

- PR438 uses the existing `profiles.byok_*_key` columns.
- API/UI readback is non-leaking and owner-scoped.
- Runtime traces remain sanitized.
- Before broader production hardening claims, Station needs an explicit
  secret-storage, rotation, and audit decision.

MIMIR is opening that preflight now so the next implementation is deliberate.
This does not unblock the hosted replay by itself; hosted replay still needs an
accepted non-NVIDIA platform key or owner BYOK credential after deployment.

## Questions For ARGUS

Decide the narrowest safe contract for BYOK key persistence:

1. Is the current `profiles.byok_openai_key`,
   `profiles.byok_anthropic_key`, and `profiles.byok_deepseek_key` storage
   acceptable for protected-alpha only, or must DAEDALUS harden it now?
2. If hardening is required now, should Station reuse the existing app-level
   AES-256-GCM pattern from Developer Space webhook signing secrets, with a
   separate BYOK encryption env such as `AI_PROVIDER_KEY_ENCRYPTION_KEY`?
3. What schema shape should DAEDALUS implement:
   - encrypted JSON payloads on `profiles`;
   - a separate owner-scoped provider-secret table;
   - fingerprints/last-four metadata;
   - created/updated/rotated/revoked timestamps?
4. How should backward compatibility work for any existing plaintext keys:
   - read legacy plaintext only as a temporary fallback;
   - migrate on next save;
   - clear legacy columns when encrypted storage exists;
   - or require an explicit reset?
5. What should Settings show after save/reload:
   - configured state;
   - last four;
   - rotation timestamp;
   - clear/revoke status;
   - no raw key prefill?
6. What should provider routing consume:
   - decrypted key in memory only;
   - no provider payload/key trace fields;
   - fail-closed if encrypted payload exists but encryption config is missing?
7. What owner-visible audit/readiness should exist for this first slice, if any?
8. Which tests are required before DAEDALUS wakes ARGUS after implementation?

## Boundaries

Do not implement code in this lane.

Do not:

- run live provider calls;
- change provider policy;
- implement Gemini chat;
- open private NVIDIA;
- add a provider marketplace, custom endpoint UI, model menu, billing change,
  queue, worker, Redis, Cloudflare, or hosted runtime change;
- print, commit, serialize, or log real provider keys or secret-shaped values.

## Expected Verdict

Return one of:

```text
ACCEPT CURRENT STORAGE FOR PROTECTED ALPHA - DEFER HARDENING
```

or:

```text
OPEN DAEDALUS IMPLEMENTATION - APP-LEVEL ENCRYPTED BYOK STORAGE
```

or:

```text
BLOCKED - NEED MIMIR CONFIG/PRODUCT DECISION
```

If implementation should open, give DAEDALUS exact scope, schema shape, env
names, fallback behavior, migration/compatibility rules, tests, and wakeup text.

## Wakeup

Wake MIMIR with the verdict. If DAEDALUS should implement, include the exact
task packet MIMIR should forward.

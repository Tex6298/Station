# PR500E - Social Credential Config Readiness Readback

Owner: DAEDALUS / A2

Date: 2026-07-07

Status: Open

## Why This Lane Opens

PR500D is externally blocked because hosted Railway `@station/api` does not
currently have usable `SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY` config, and
MIMIR cannot set it from this shell with the current unauthorized Railway token.

This lane does not replace that hosted config. It adds a tiny non-secret
readiness readback so the next hosted proof can tell whether the config exists
before trying a valid synthetic credential POST.

## Scope

Implement only:

- `/health/deployment` non-secret social connector readiness fields, sourced
  from the existing social credential encryption configuration check;
- tests proving the readback is `false` when the key is absent or malformed and
  `true` when it is at least 32 characters;
- tests proving no configured key value or marker leaks into the health
  response;
- docs/status/testing updates.

Suggested response shape:

```text
checks.socialConnectorCredentialEncryptionConfigured: boolean
readiness.socialConnectors.credentialEncryptionConfigured: boolean
readiness.socialConnectors.hostedCredentialProofReady: boolean
```

`hostedCredentialProofReady` may equal the encryption boolean in this slice.
Name it differently only if the existing readiness service has a clearer local
pattern.

## Boundaries

Do not:

- set, generate, print, or write any secret value;
- edit `.env`;
- add a fallback to `AI_PROVIDER_KEY_ENCRYPTION_KEY`, JWT, Supabase, Stripe, or
  any other secret;
- make overall `/health/deployment.ready` depend on social connector config;
- enable Settings UI, credential management UI, OAuth, provider account lookup,
  provider fetch, posting, scheduling, queues, workers, Redis, Cloudflare,
  billing, webhooks, public syndication, or social readiness unpause;
- change PR500C credential API behavior;
- change Railway, Supabase, package, lockfile, or migration files.

## Validation

Run:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/health.test.ts apps/api/src/routes/social.test.ts
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

Also scan the diff to confirm no secret-shaped value, provider call, OAuth
route, posting path, package, migration, UI, or readiness-unpause behavior was
added.

## Handoff

Wake ARGUS after implementation:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS added non-secret /health/deployment readback for social credential
  encryption config.
- PR500D remains externally blocked until Railway @station/api has the real
  stable SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY and ARIADNE reruns the
  hosted credential proof.
Risk:
- This must not weaken PR500A social-specific encryption or turn social
  connector config into general deployment readiness.
Task:
- Review PR500E for secret leakage, no fallback secret, no UI/OAuth/provider/
  posting/readiness-unpause drift, and focused validation.
```

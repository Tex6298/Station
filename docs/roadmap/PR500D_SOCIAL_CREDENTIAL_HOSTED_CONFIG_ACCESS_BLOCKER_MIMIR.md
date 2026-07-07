# PR500D - Social Credential Hosted Config Access Blocker

Owner: MIMIR / A1

Date: 2026-07-07

State: `RAILWAY_CONFIG_ACCESS_BLOCKED`

## Why This Exists

ARIADNE's PR500D hosted proof blocked on the hosted API returning:

```text
social_connector_credential_encryption_required
```

MIMIR attempted to clear that blocker directly from this shell before routing
more product work. The missing config is:

```text
SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY
```

It belongs on hosted Railway `@station/api`. It must be stable across deploys
and at least 32 characters. The implementation hashes the configured value
before using it for AES-256-GCM credential storage.

## What MIMIR Proved

- Local `.env` has `RAILWAY_TOKEN` present by name.
- Local `.env` does not have `SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY`
  present by name.
- Hosted API `/health/deployment` is reachable and currently reports service
  `@station/api`, branch `main`, and PR500C runtime commit `bc145682`.
- Railway GraphQL introspection is reachable and confirms:
  - `variableUpsert(input: VariableUpsertInput!): Boolean`;
  - `VariableUpsertInput` requires `projectId`, `environmentId`, `name`, and
    `value`, with optional `serviceId` and `skipDeploys`;
  - `serviceInstanceRedeploy(environmentId, serviceId)` exists.
- The current token cannot read Railway account, project, deployment, variable,
  or project-token self-scope data from this shell.
- The current token also fails the Railway CLI identity check as unauthorized.

No Railway variable values, token values, synthetic credential values, or
secret-shaped data were printed.

## Blocker

MIMIR cannot safely set the hosted variable from this shell because the current
Railway token is unauthorized for the required project/service reads and CLI
identity check. The missing environment and service IDs cannot be recovered
from the repo or public health endpoint without a Railway-authorized inventory
read.

Do not patch around this in code by falling back to another secret, generating a
runtime-only key, or sharing the BYOK key. PR500A intentionally made social
connector credential encryption social-specific.

## Required Unblock

Set this on Railway `@station/api`:

```text
SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY=<stable random value, at least 32 chars>
```

Then redeploy/restart `@station/api` if Railway does not redeploy
automatically.

After the hosted API is live with the variable, wake ARIADNE to rerun:

```text
docs/roadmap/PR500D_SOCIAL_CREDENTIAL_OWNER_API_HOSTED_PROOF_ARIADNE.md
```

Required PR500D rerun proof:

- valid synthetic POST stores an active Bluesky credential;
- replacement POST rotates/replaces the prior active credential;
- DELETE revokes the synthetic credential locally;
- repeated DELETE is idempotent/bounded;
- final GET shows no active hosted Bluesky credential;
- paused social readiness and publishing stay paused;
- recorded output contains no submitted credential values, encrypted payload,
  fingerprint, owner id, bearer/JWT token, SQL detail, stack trace, env value,
  or provider payload.

## Current Baton

PR500D remains externally config-blocked. No Settings UI, credential management
UI, OAuth/provider-call lane, posting lane, or social readiness unpause should
open until the hosted PR500D rerun passes.

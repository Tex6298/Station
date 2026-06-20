# PR111 - Developer Space Provider Policy Foundation

Date opened: 2026-06-20
Opened by: A1 / MIMIR
Owner: DAEDALUS implements or precisely blocks, ARGUS reviews. ARIADNE rehearses
only if visible route behavior changes.
Status: implemented by DAEDALUS; ready for ARGUS review

## Why This Lane

Community Beta is protected-beta complete, and PR109/PR110 closed the immediate
Memory UX/observability gap. The next backend roadmap item with high leverage is
provider/data posture for Developer Spaces.

Station already has provider configuration discussions, NVIDIA/OpenAI-compatible
runtime needs, and future Cloudflare/cache/retrieval questions. Before switching
providers or adding edge/cache complexity, Developer Spaces need an explicit
policy record for what data posture is allowed.

This corresponds to `BE-03 - Provider policy per Developer Space` in
`docs/roadmap/STATION_BACKEND_IMPLEMENTATION_ROADMAP.md`.

## Goal

Add the smallest durable Developer Space provider-policy foundation.

The policy should make the data posture explicit without changing provider
execution, embeddings, vector dimensions, Cloudflare, or Redis behavior.

## Scope

DAEDALUS should implement:

- a durable provider/data posture field for Developer Spaces;
- a small accepted policy set, for example:
  - `public_synthetic_only`;
  - `public_context_allowed`;
  - `private_archive_allowed`;
  - `owner_byok_only`;
  - `platform_allowed`;
- safe validation/defaulting for existing Developer Spaces;
- owner/admin update behavior if there is already an appropriate Developer
  Space update route;
- readback in owner/private Developer Space serializers;
- public serializers must not expose private policy internals beyond what is
  already intended for visitors;
- AI observability metadata should record the policy/mode only if there is an
  existing safe write path; otherwise document the precise follow-up;
- focused tests for default policy, owner update, non-owner denial, public
  serializer boundary, invalid policy rejection, and observability metadata if
  touched.

## Non-Scope

Do not add:

- provider execution switching;
- NVIDIA/OpenAI/Gemini model routing changes;
- embedding provider changes;
- vector dimension/index changes;
- Cloudflare workers, queues, Vectorize, or cache layers;
- Redis/Upstash behavior;
- private archive retrieval changes;
- public prompt/payload logging;
- Developer Space realtime work;
- billing/auth/session changes;
- broad Developer Space UI redesign.

## ARGUS Review Requirements

ARGUS should verify:

- policy values are validated and have a safe default;
- only owners/admins can update private Developer Space provider policy;
- public readback cannot leak private archive posture or owner-only fields;
- no provider switch or embedding/vector migration occurred;
- no keys, prompts, payloads, archive excerpts, or secrets are logged;
- observability metadata, if touched, records policy posture only;
- validation passed.

No ARIADNE rehearsal is required if this remains API/data/test/docs only. If
DAEDALUS adds visible owner controls, ARGUS should wake ARIADNE after technical
acceptance.

## Validation

Minimum expected validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run test:projects
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Add `test:studio-ui` and web build validation only if visible web routes change.

## DAEDALUS Implementation

Implemented on 2026-06-20.

Current main already contained the durable schema/type/evaluation foundation:

- `infra/supabase/migrations/027_developer_space_provider_policy.sql` adds
  `developer_spaces.provider_policy` with default `public_synthetic_only` and a
  bounded check constraint.
- `packages/types/src/developer-space.ts` and `packages/db/src/types.ts`
  expose the accepted policy set.
- `apps/api/src/services/developer-space.service.ts` contains provider-policy
  normalization and posture evaluation.
- `apps/api/src/routes/developer-spaces.ts` exposes owner-only
  `/developer-spaces/:id/provider-policy/evaluate` and records policy posture
  through the existing AI observability trace path.

This DAEDALUS pass tightened the remaining PR111 boundaries:

- `PATCH /developer-spaces/:id` now loads the target space first, allows the
  owner or an admin to update it, and returns `403` for authenticated non-owner
  users.
- Non-operational Developer Space serializers now mask the stored provider
  policy to the safe public posture value instead of exposing private archive,
  owner-BYOK, or platform policy internals to public/member/export summaries.
- `apps/api/src/routes/developer-spaces.test.ts` now proves safe default,
  invalid policy rejection, non-owner denial, owner readback, public serializer
  masking, admin update, and observability metadata without secret/private
  payload leakage.

Files changed by this pass:

- `apps/api/src/services/developer-space.service.ts`
- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/routes/developer-spaces.test.ts`
- `docs/roadmap/PR111_DEVELOPER_SPACE_PROVIDER_POLICY_FOUNDATION.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

Explicit non-scope confirmation:

- No provider execution switching, NVIDIA/OpenAI/Gemini routing change,
  embedding provider change, vector dimension/index change, Cloudflare/Redis
  behavior, private archive retrieval change, prompt/payload/key logging,
  Developer Space realtime work, billing/auth/session change, broad UI redesign,
  or visible web route change was added.

DAEDALUS validation on 2026-06-20:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-spaces` | Pass | 16 tests passed, including PR111 policy/default/update/public-serializer/observability coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` | Pass | 4 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:projects` | Pass | 5 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `git diff --check` | Pass | CRLF normalization warnings only for touched files and local watcher state. |

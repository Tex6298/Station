# Intelhub → Station transfer patch: Developer Spaces observatory

This patch ports the useful part of Intelhub's product shape into Station without dragging in the parts that do not fit Station's audience.

## What fits

### 1. Observatory-style public project pages

Intelhub has a mature pattern for turning complex running systems into a legible surface: overview cards, event streams, signal/state records, and a split between operator tooling and public presentation. Station's closest equivalent is the planned Developer Space: a public observatory for experiments, worlds, AI-family projects, and research systems.

The patch implements that as native Station functionality rather than copying Intelhub's CTI-specific code.

### 2. Data ingestion as the integration seam

A light REST ingestion API is the right first seam for Animus/MUDD-style projects. It lets builders keep their existing runtime while Station becomes the public home, archive, and community wrapper.

This patch adds ingestion for:

- node state updates
- event stream entries
- periodic snapshots
- batch import of historical nodes/events/snapshots

### 3. Provenance and source references

Intelhub's evidence/source discipline is valuable, but Station should use it in a softer, community-appropriate way. The patch adds `provenance` and `sourceRefs` to events and snapshots so public viewers can distinguish API/runtime output, imported records, user notes, system events, and AI-generated output.

### 4. Researcher/private vs visitor/public split

Intelhub's operator surfaces are intentionally separate from public views. Station needs the same split for Developer Spaces: owners manage keys and raw ingestion privately, while visitors see a composed live observatory.

## What does not fit right now

### CTI, finance, exposure, dark-provider and recon modules

Those Intelhub domains are valuable in Intelhub but misaligned with Station's core promise. Copying them would make Station feel like an investigations product rather than a continuity, publishing, archive, and community platform.

### Browser worker and autonomous web-agent stack

Useful later for archive import or assisted publishing, but too large and risky for this patch. It brings operational complexity, security concerns, and UX weight that Station does not need at this stage.

### Full project-management/task system

Station can use lightweight workflows eventually, especially for archive jobs and Station Press production. The full Intelhub PM layer would be overkill before Developer Spaces, Studio continuity, and publishing are stable.

### Model gateway and provider catalogue

Station already has a smaller provider abstraction. Intelhub's model gateway ideas are relevant later for routing/cost controls, but the immediate user value is lower than making live projects visible and delightful.

## Files added or changed

- `infra/supabase/migrations/006_developer_spaces.sql`
- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/services/developer-space.service.ts`
- `packages/types/src/developer-space.ts`
- `packages/db/src/types.ts`
- `apps/web/app/developer-spaces/page.tsx`
- `apps/web/app/developer-spaces/[slug]/page.tsx`
- `apps/web/app/developer-spaces/[slug]/manage/page.tsx`
- `apps/web/components/nav/top-nav.tsx`
- `infra/supabase/README.md`

## UX principle

The customer experience should feel like:

1. **Create** a Developer Space in under a minute.
2. **Generate** one ingestion key.
3. **Paste** a curl example or SDK call into an existing runtime.
4. **Watch** the observatory light up with nodes, metrics, events, provenance labels, and snapshots.
5. **Share** the public/unlisted page with the community.

That is the shortest path from “I built something strange and alive elsewhere” to “it has a permanent, beautiful Station home.”

## Current ingestion contract

The current protected-alpha integration seam is the Express API under
`/developer-spaces/ingest/*`. Partners can send:

- node state updates:
  `POST /developer-spaces/ingest/nodes/:nodeId/state`
- event stream entries:
  `POST /developer-spaces/ingest/events`
- periodic snapshots:
  `POST /developer-spaces/ingest/snapshots`
- batch imports:
  `POST /developer-spaces/ingest/import`

All ingestion requests require `X-Station-Developer-Key` or an equivalent
Bearer key. Keep the key server-side.

Failed ingestion responses keep a human `error` message and include
machine-readable fields:

```json
{
  "error": "Developer Space ingestion payload failed validation.",
  "code": "developer_space_validation_failed",
  "category": "validation",
  "details": {}
}
```

Current categories are:

| Category | Typical status | Meaning |
| --- | --- | --- |
| `auth` | `401` | Missing, invalid, or revoked ingestion key. |
| `validation` | `400` | Payload shape, JSON size, or JSON depth failed validation. |
| `quota` | `429` | Durable Developer Space usage quota exceeded. |
| `rate_limit` | `429` | Short-window ingestion request limit exceeded. |
| `server` | `500` | Unexpected Station API failure. |

Quota failures include `resource`, `limit`, `used`, and `retryAfter` when the
server can provide them. Rate-limit failures use
`code: "developer_space_rate_limited"`, resource
`developer_space_ingest_requests`, `limit`, `used`, and `retryAfter`.

Station uses two separate limit families:

- `quota` is durable usage accounting for nodes, events, snapshots, storage,
  public reads, and exports.
- `rate_limit` is a short request window for authenticated ingestion-key
  routes. Defaults are 120 requests per 60 seconds, with env overrides
  `DEVELOPER_SPACE_INGEST_RATE_LIMIT_PER_MINUTE` and
  `DEVELOPER_SPACE_INGEST_RATE_LIMIT_WINDOW_SECONDS`.

The request-window limiter is active only when the operational-cache provider is
enabled. Disabled local cache fallback stays explicit and does not pretend
rate limiting is active.

## Follow-up patches

This list is no longer a separate queue. Its accepted work is folded into
`docs/roadmap/STATION_PR_PLAN_V2.md`, especially PR-10 through PR-16.

1. Add WebSocket/SSE updates so observatories update without polling.
2. Add Discover cards for public Developer Spaces and high-signal events.
3. Add linked Station documents for methodology, findings, field logs, and archive notes.
4. Add export packages for Developer Space data.
5. Add quotas/usage tracking for ingested events, snapshots, storage, and public traffic.
6. Add a small TypeScript client package: `@station/developer-space-client`.
7. Add visualisation-specific config editors for Node Field, Timeline, World Map, and Constellation.

## Security note

The migration intentionally keeps direct Supabase reads owner-only. Public observatory reads go through the Express API, which serializes a safe response and never exposes `api_key_hash`. This keeps the public page simple while preserving a clean future path to column-safe SQL views if Station later wants direct Supabase reads.

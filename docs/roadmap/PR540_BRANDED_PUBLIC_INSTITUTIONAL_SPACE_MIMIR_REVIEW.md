# PR540 Branded Public Institutional Space - MIMIR Review

Owner: MIMIR / A1 -> ARIADNE / A4

Date: 2026-07-31

Status:

```text
ACCEPT_PR540_BRANDED_PUBLIC_INSTITUTIONAL_SPACE_FOR_REHEARSAL
```

## Verdict

MIMIR accepts source `02da4dbcec4b6f55b0cdcecafd4dd3d68038b6f1` and
the retained hosted PR540 state for bounded human rehearsal. No source,
authority, privacy, aggregation, or responsive-layout blocker was found.

ARGUS did not consume the original review wake. This is an independent MIMIR
review of the source, exact deployed state, focused tests, and public-safe
browser evidence rather than an automatic acceptance of the implementation
result.

## Accepted Boundary

- migration `095_institution_spaces` is ledgered exactly once with source
  SHA-256
  `CDFE536350C8CE9D6A3A8721348C765A6A1FD1A9962E7DFC62BAA5F5DC9A5789`;
- `institution_spaces` remains a separate one-to-one Institution-owned
  relation and does not modify personal Spaces;
- browser roles have zero raw table or RPC authority; the three lifecycle
  RPCs are service-only and repeat owner checks inside the database;
- Institution identity and durable creator label are immutable, while profile
  deletion may null only the stored actor reference;
- create/edit/publish/unpublish writes and paired Institution audit events are
  atomic and optimistic-versioned;
- the owner is the only writer and publisher; active members receive bounded
  read-only truth; anonymous and unrelated reads do not disclose the private
  Space;
- draft or absent Space state preserves the already accepted minimal verified
  public Institution response;
- published aggregation includes only public Institution Projects and
  published Institution work attached to those public Projects;
- related lookup errors fail the aggregate closed; and
- the private workspace and public authored bands stay within Tex Station's
  existing visual language without global CSS or personal-Space authority
  reuse.

## Independent Evidence

Fresh review receipts:

- API and web Railway deployment identities both equal exact source
  `02da4dbc`;
- retained Space is published at version/audit `5/5`;
- one migration ledger row, one retained Space, one retained Institution
  Project, one retained publication, and zero fixture Auth users or
  memberships are present;
- PostgREST raw table access is anonymous `401` and service `200`;
- service RPCs are `3`, browser RPCs `0`, browser table privileges `0`, and
  the identity trigger is present;
- personal Space/document counts remain `3/29`;
- the signed-out public API returns exactly `institution`, `space`, `projects`,
  and `publications`, with one public Project and one publication;
- the anonymous private Space API returns `401`, and the signed-out public web
  route returns `200`;
- owner desktop, member dark mobile, public desktop, and public dark mobile
  evidence show truthful controls and no visible overlap or horizontal
  overflow;
- `test:institution-spaces` passes `4/4`;
- `test:institutions` passes `16/16`;
- root typecheck passes; and
- root lint passes with no warnings or errors.

The local Windows `pnpm` shim was unavailable in MIMIR's shell, so the exact
pinned package manager was invoked through `npx --yes pnpm@10.32.1`. This
changes no source or validation meaning.

## Remaining Gate

ARIADNE must now exercise the retained owner/member/signed-out workflow through
visible controls. Acceptance here does not close PR540 or authorize PR541.

## Baton

ARIADNE owns the bounded hosted human rehearsal in
`PR540_BRANDED_PUBLIC_INSTITUTIONAL_SPACE_REHEARSAL_ARIADNE.md`, then wakes
MIMIR with a pass or exact blocker. Do not sleep without that response.

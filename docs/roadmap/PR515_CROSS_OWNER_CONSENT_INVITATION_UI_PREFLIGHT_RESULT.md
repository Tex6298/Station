# PR515 - Cross-Owner Consent Invitation UI Preflight Result

Owner: ARGUS / A3

Requested by: MIMIR / A1

Date: 2026-07-11

Source:
`docs/roadmap/PR515_CROSS_OWNER_CONSENT_INVITATION_UI_PREFLIGHT_ARGUS.md`

Result:

```text
BLOCK_PR515_CROSS_OWNER_CONSENT_INVITATION_UI_PREFLIGHT
```

## Verdict

ARGUS does not accept full customer-facing invitation UI as a UI-only lane yet.

Existing consent readback and action routes are sufficient for a participant
owner to list already-visible consent rows and approve, reject, cancel, or
revoke them with bounded state copy. They are not sufficient for safe
invitation creation, because the current create route requires the browser to
submit a raw counterparty persona UUID.

Concrete blocker:

```text
CROSS_OWNER_CONSENT_COUNTERPARTY_SELECTION_CONTRACT_MISSING
```

Smallest unblock lane:

```text
PR515A - Cross-Owner Consent Counterparty Selection Contract
Owner: DAEDALUS / A2
```

## Evidence

Files inspected:

- `docs/roadmap/PR515_CROSS_OWNER_CONSENT_INVITATION_UI_PREFLIGHT_ARGUS.md`
- `docs/roadmap/PR514F_CROSS_OWNER_DISPOSABLE_PREVIEW_STUDIO_PANEL_HOSTED_REHEARSAL_RESULT.md`
- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`
- `apps/api/src/routes/personas.ts`
- `apps/api/src/routes/discover.ts`
- `apps/api/src/lib/persona-serialization.ts`
- `apps/api/src/routes/community.test.ts`
- `apps/web/lib/public-persona-route.ts`
- `apps/web/components/discover/search-dropdown.tsx`
- `apps/web/components/studio/persona-workspace.tsx`
- `apps/web/lib/persona-encounter-runtime.ts`
- `apps/web/lib/persona-encounter-runtime.test.ts`

Findings:

- `POST /persona-encounters/cross-owner-consents` currently validates
  `requesterPersonaId` and `counterpartyPersonaId` as UUIDs, then loads the
  requester as current-owner-owned and the counterparty directly by persona id.
- `GET /persona-encounters/cross-owner-consents` and
  `GET /persona-encounters/cross-owner-consents/:consentId` are
  participant-scoped and serialize only the consent id, status,
  participant role, persona name snapshots, scope labels, timestamps, bounded
  provenance, and audit metadata.
- `PATCH .../approve`, `reject`, `cancel`, and `revoke` are role/status gated
  after participant lookup. Nonparticipants receive not-found readback.
- The generic consent serializer keeps `executable: false` and says approval
  does not authorize runtime, saved artifacts, public exhibits, generated word
  sharing, transcripts, summaries, excerpts, or public surfacing.
- Public persona readback and Discover search deliberately expose safe
  `publicSlug`/`href` fields and public-safe profile fields only. They filter
  UUID-shaped slugs and do not expose raw persona ids, owner ids, provider
  settings, private profile fields, or private source material.
- Discover persona search has explicit tests that raw persona ids, owner ids,
  `owner_user_id`, `visibility`, `provider`, unsafe UUID-shaped slugs, and
  ineligible public personas do not appear in public persona search readback.
- There is no accepted bridge from safe public persona slug/readback to a
  consent invitation target token, and no create contract that lets the server
  resolve the counterparty from a safe public handle before writing consent.

## Preflight Answers

1. Safe counterparty choice needs a dedicated participant-safe selector
   contract first. Current public persona and Discover surfaces are safe for
   browsing, but not a write-capable consent target.
2. The current public/persona/search surface exposes safe route slugs and
   public profile fields, not an opaque invitation target accepted by the
   consent create route.
3. First visible UI should start from an authenticated owner context, preferably
   a dedicated consent screen or account-level Studio consent panel. A public
   persona/profile CTA can come later after the selector/create contract exists.
4. Requester state copy can be built from existing participant readback for
   pending, approved, rejected, cancelled, revoked, expired, superseded,
   blocked-by-deletion, and moderation-locked rows.
5. Counterparty approve/reject copy can be built from existing participant
   readback: display snapshots, scope labels, ledger status, and audit metadata
   only. It must not reveal requester private setup, private profile fields,
   raw ids, prompts, source material, provider facts, or token facts.
6. Copy must keep saying this is a consent ledger only: approval does not save a
   session, create a private artifact, publish an exhibit, share generated
   words, expose transcripts/summaries/excerpts, run retrieval, or surface
   anything publicly.
7. The full invitation lane is not UI-only. Existing routes are safe for action
   controls over existing rows, but invitation creation needs the smaller
   counterparty selection/create contract first.

## PR515A Required Scope

DAEDALUS should add the smallest server/client contract that lets an
authenticated owner select and invite an eligible counterparty persona without
raw counterparty persona ids or owner ids entering browser-visible request or
response shapes.

Required shape:

- expose a bounded authenticated selector or resolver for invite-eligible
  public personas using safe public slugs, hrefs, or a server-minted opaque
  invitation target handle;
- return only public-safe candidate fields such as display name, sanitized
  avatar, public slug/href, short public summary, and explicit eligibility
  state;
- reject unsafe or UUID-shaped slugs, private personas, ineligible owner tiers,
  stale/forged target handles, self-owner targets, and malformed requests before
  consent writes;
- add or adjust invitation create so the browser does not submit a raw
  counterparty persona id;
- preserve current requester ownership, different-owner, bounded scope, audit,
  and participant readback rules;
- add API and web-helper tests proving no raw owner ids, raw persona ids,
  provider payloads, private fields, prompts, token facts, SQL details, bearer
  values, env values, or secret-shaped strings appear in selector, create,
  list, detail, or error readback.

PR515A must not add:

- saved cross-owner sessions;
- public cross-owner exhibits;
- generated-word excerpts, transcripts, summaries, share links, publication, or
  counterparty generated-word readback;
- Memory, Canon, Archive, Continuity, Integrity, retrieval, export, storage,
  billing, Redis, Cloudflare, workers, provider config, broad Studio redesign,
  public surfacing, partner adapters, webhooks, or hosted-runtime scope.

## Future UI Lane

After PR515A is reviewed and accepted, MIMIR can route a visible PR515 UI lane.
ARGUS recommends splitting the UI into:

- participant consent inbox/actions: list, detail, approve, reject, cancel, and
  revoke over already-visible rows;
- invitation create: requester-owned persona plus the accepted safe
  counterparty selector/create contract.

Required visible copy:

- "Consent ledger only";
- "Not a saved session";
- "Not public";
- "Does not share generated words";
- "No transcript, summary, excerpt, share link, or publication";
- "No Memory, Archive, Canon, Continuity, Integrity, or private retrieval";
- "Approval can be revoked";
- "Counterparty sees consent state and audit metadata, not generated preview
  text here."

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hostile source preflight | Pass | Reviewed consent create/list/detail/actions, serializer boundaries, public persona readback, Discover search readback, web slug filtering, and focused tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 60 tests passed, including consent create ownership/different-owner/bounded payloads, participant read/approve/reject/cancel/revoke, inactive states, non-executable scopes, and disposable preview consent-scoped helpers. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 207 tests passed, including cross-owner disposable preview helper/UI boundary tests and owner-visible redaction coverage. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed from cache. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
```

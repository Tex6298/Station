# PR520 - Cross-Owner Metadata Exhibit Contextual Public Linkbacks Preflight Closeout

Owner: MIMIR / A1

Date: 2026-07-12

Result:

```text
CLOSE_PR520_CROSS_OWNER_METADATA_EXHIBIT_CONTEXTUAL_PUBLIC_LINKBACKS_PREFLIGHT_ACCEPTED
```

## Decision

MIMIR accepts ARGUS's PR520 verdict:

```text
ACCEPT_PR520A_CROSS_OWNER_METADATA_EXHIBIT_CONTEXTUAL_PUBLIC_LINKBACKS_CONTRACT
```

Source:

`docs/roadmap/PR520_CROSS_OWNER_METADATA_EXHIBIT_CONTEXTUAL_PUBLIC_LINKBACKS_PREFLIGHT_RESULT.md`

## Accepted Next Shape

PR520A may add participant public-persona linkbacks only.

The current public persona page may show a separate metadata-only cross-owner
exhibit section when:

- the current page persona is public, routeable, eligible, and safe-slugged;
- the current page persona is the requester or counterparty in an active
  approved consent;
- the relevant requester/counterparty display snapshot still matches the
  current public persona name;
- the linked exhibit passes the PR518A/PR519A public-readability floor.

The other participant remains display-snapshot-only. PR520A must not serialize
the other participant's route, public slug, owner id, persona id, or private
profile state.

Every linkback must route only to:

```text
/encounters/cross-owner#<slug>
```

## Still Blocked

PR520 does not approve:

- public Space linkbacks;
- forum/community/Salon linkbacks;
- Station Press/public document or writing placement;
- Discover feed/rising/featured/homepage placement;
- public persona chat/context-preview source expansion;
- generated words, generated summaries, transcript excerpts, source text,
  private setup, PR516 disposable output reuse, private saved cross-owner
  artifacts, prompts, provider/retrieval payloads, token facts, raw ids,
  consent ids, report counts, moderation/admin internals, provider/retrieval/
  storage/billing/social/Redis/Cloudflare/queue/package/deployment/migration,
  or broad UI work.

## Next

```text
PR520A - Cross-Owner Metadata Exhibit Public Persona Linkbacks
Owner: DAEDALUS / A2
Source: docs/roadmap/PR520A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_PERSONA_LINKBACKS_DAEDALUS.md
```

# Archive Import Source Wording Review - ARIADNE

Date: 2026-06-14
Reviewer: ARIADNE / A4
Status: UX accepted.

## Verdict

Accept the Archive import source wording patch.

The new wording resolves the staging-demo confusion where the persona Archive
page could show `0` sources while runtime context or the persona home Archive
count still showed archived chat material.

## Review Basis

Screenshots were not committed, by design. This review uses the sanitized
staging evidence already recorded in planning and validation docs:

- runtime context evidence showed Archive material present as `archive:2`;
- storage usage has a distinct `Archived chats` category;
- the Archive page count is specifically pasted/file import sources, not all
  archive-backed runtime material.

Reviewed surfaces:

- `apps/web/app/studio/personas/[personaId]/files/page.tsx`
- `apps/web/components/settings/storage-usage-panel.tsx`
- `apps/web/components/studio/persona-workspace.tsx`
- `docs/testing/VALIDATION_BASELINE.md`
- `docs/roadmap/ACTIVE_STATUS.md`

## UX Read

The patch now makes three user-facing distinctions clear:

- `Import sources` means pasted/file import sources on this page.
- Archived chats can still exist even when this page shows zero import sources.
- Runtime context and storage usage may count archived chats separately.

This keeps Archive as trust infrastructure: the page is honest about what it is
counting, and it no longer undermines the user's confidence when another
Station surface shows archived chat material.

## Why No Further Patch

The copy is specific enough for staging and does not broaden product scope.
Opening another wording patch now would risk over-explaining the page before the
broader Archive IA exists.

Future Archive UX can still separate totals more elegantly, for example:

- pasted/file import sources;
- archived chats;
- continuity-linked archive material;
- storage/quota categories.

That belongs in a later Archive IA lane, not this staging clarity patch.

## Decision

Wake MIMIR to close the Archive demo clarity issue. No DAEDALUS patch is needed.

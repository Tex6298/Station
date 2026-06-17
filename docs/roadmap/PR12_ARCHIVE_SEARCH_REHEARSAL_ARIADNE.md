# PR12 Archive Search Browser Rehearsal - ARIADNE

Date: 2026-06-17
Status: queued for A4 / ARIADNE
Owner: ARIADNE / A4
Reviewer after rehearsal: MIMIR / A1

## Why This Exists

ARGUS accepted PR12 for code/security at commit `2cf7b98`: the private archive
search route is owner-scoped, capped, sanitized, and covered by focused tests.
The Studio archive page changed materially, so it needs a human-eye browser pass
before MIMIR closes PR12.

## Rehearsal Scope

Use the deployed app once it serves `2cf7b98` or newer.

Check `/studio/archive` on desktop and a phone-width viewport:

- default view loads the owner-only archive summary;
- entering a query visibly searches private archive materials;
- filters for Memory, Canon, Continuity, Import, Conversation, Document,
  Image, Data, Integrity, and Shared/global behave honestly;
- sort by date, type, and title visibly changes ordering when data allows it;
- result cards show title, source, persona/global label, status, summary,
  match reason, and Open source without layout clipping;
- empty states and warning states do not imply public exposure or data loss;
- unauthenticated users see sign-in copy instead of private archive data.

## Guardrails

- Do not seed real private secrets into public docs.
- Do not claim vector search, semantic relevance, workers, Cloudflare retrieval,
  Redis memory truth, or archive export bundles.
- Do not reopen PR12 for missing data variety alone; record it as rehearsal
  data limitation unless the UI lies or breaks.

## Wakeup

Wake MIMIR with:

- runtime commit checked;
- desktop and mobile result;
- search/filter/sort observations;
- any layout/readability defect;
- whether ARIADNE recommends closing PR12 or sending DAEDALUS a concrete fix.

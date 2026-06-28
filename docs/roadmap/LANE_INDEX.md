# Station Lane Index

Date opened: 2026-06-28

Owner: MIMIR / A1

Purpose: keep the active lane readable from outside the agent threads. This is
an index only; `docs/roadmap/ACTIVE_STATUS.md` remains the fuller operational
log.

## Current Lane

| Lane | Name | Owner | State | Source |
| --- | --- | --- | --- | --- |
| PR444 | Hosted product operation sweep | MIMIR / A1 | Product defect found - open PR445 Discover document route repair | `docs/roadmap/PR444_HOSTED_PRODUCT_OPERATION_SWEEP_RESULT.md` |

## Recently Closed

| Lane | Name | Owner chain | State | Closeout |
| --- | --- | --- | --- | --- |
| PR444 sweep | Hosted product operation sweep | MIMIR -> ARIADNE -> MIMIR | Product defect found; recommend PR445 Discover document route repair | `docs/roadmap/PR444_HOSTED_PRODUCT_OPERATION_SWEEP_RESULT.md` |
| PR443 closeout | Hosted provider setup UX rehearsal | MIMIR -> ARIADNE -> MIMIR | Closed pass; visible setup callout behaves as product path on hosted | `docs/roadmap/PR443_HOSTED_PROVIDER_SETUP_UX_CLOSEOUT.md` |
| PR443 rehearsal | Hosted provider setup UX rehearsal | MIMIR -> ARIADNE -> MIMIR | Pass; visible setup callout links to AI Provider settings and preserves provider boundaries | `docs/roadmap/PR443_HOSTED_PROVIDER_SETUP_UX_REHEARSAL_RESULT.md` |
| PR442 closeout | Private provider setup UX | DAEDALUS -> ARGUS -> MIMIR | Closed by MIMIR; hosted rehearsal opened | `docs/roadmap/PR442_PRIVATE_PROVIDER_SETUP_UX_CLOSEOUT.md` |
| PR441 closeout | Hosted encrypted BYOK readiness rehearsal | MIMIR -> ARIADNE -> MIMIR | Closed at provider-credential boundary; Settings/encrypted BYOK path passes, real accepted provider credential remains external | `docs/roadmap/PR441_HOSTED_ENCRYPTED_BYOK_READINESS_CLOSEOUT.md` |
| PR441 rerun | Hosted encrypted BYOK readiness rehearsal | MIMIR -> ARIADNE -> MIMIR | Config-blocked; encrypted BYOK Settings path passes, accepted private provider route missing | `docs/roadmap/PR441_HOSTED_ENCRYPTED_BYOK_READINESS_RERUN_RESULT.md` |
| PR441 unblock | Hosted BYOK migration unblock | ARIADNE -> MIMIR -> ARIADNE | Migration/config unblock applied; ARIADNE rerun requested | `docs/roadmap/PR441_HOSTED_BYOK_MIGRATION_UNBLOCK_MIMIR.md` |
| PR441 rehearsal | Hosted encrypted BYOK readiness rehearsal | MIMIR -> ARIADNE -> MIMIR | Config-blocked; authenticated Settings readback returns HTTP 500 before canary/private replay | `docs/roadmap/PR441_HOSTED_ENCRYPTED_BYOK_READINESS_RESULT.md` |
| PR440 closeout | Encrypted owner BYOK storage implementation | DAEDALUS -> ARGUS -> MIMIR | Closed by MIMIR; PR441 opened for hosted readiness rehearsal | `docs/roadmap/PR440_ENCRYPTED_OWNER_BYOK_STORAGE_CLOSEOUT.md` |
| PR440 review | Encrypted owner BYOK storage implementation | DAEDALUS -> ARGUS -> MIMIR | Accepted after ARGUS patch; encrypted OpenAI/Anthropic/DeepSeek BYOK storage with fail-closed rotation guard | `docs/roadmap/PR440_ENCRYPTED_OWNER_BYOK_STORAGE_REVIEW_RESULT.md` |
| PR440 implementation | Encrypted owner BYOK storage implementation | DAEDALUS -> ARGUS | Implemented; encrypted OpenAI/Anthropic/DeepSeek BYOK storage with lazy legacy fallback | `docs/roadmap/PR440_ENCRYPTED_OWNER_BYOK_STORAGE_RESULT.md` |
| PR439 closeout | BYOK secret storage and rotation preflight | MIMIR -> ARGUS -> MIMIR | Accepted; PR440 opened for encrypted owner BYOK storage implementation | `docs/roadmap/PR439_BYOK_SECRET_STORAGE_ROTATION_PREFLIGHT_RESULT.md` |
| PR439 preflight | BYOK secret storage and rotation preflight | MIMIR -> ARGUS -> MIMIR | Open DAEDALUS implementation; use owner-scoped encrypted BYOK table with lazy legacy fallback | `docs/roadmap/PR439_BYOK_SECRET_STORAGE_ROTATION_PREFLIGHT_RESULT.md` |
| PR438 closeout | Owner BYOK settings and private replay unblock surface | DAEDALUS -> ARGUS -> MIMIR | Accepted; PR439 opened for secret-storage/rotation preflight before broader production hardening | `docs/roadmap/PR438_OWNER_BYOK_SETTINGS_UNBLOCK_REVIEW_RESULT.md` |
| PR438 review | Owner BYOK settings and private replay unblock surface | DAEDALUS -> ARGUS -> MIMIR | Accepted; owner BYOK Settings surface is owner-scoped, non-leak readback only, with Gemini/private NVIDIA still blocked | `docs/roadmap/PR438_OWNER_BYOK_SETTINGS_UNBLOCK_REVIEW_RESULT.md` |
| PR438 implementation | Owner BYOK settings and private replay unblock surface | DAEDALUS -> ARGUS | Implemented; Settings exposes existing OpenAI/Anthropic/DeepSeek BYOK route without Gemini/private NVIDIA | `docs/roadmap/PR438_OWNER_BYOK_SETTINGS_UNBLOCK_RESULT.md` |
| PR437 closeout | Gemini private chat provider preflight | MIMIR -> ARGUS -> MIMIR | Gemini rejected for immediate private chat; PR438 opened for supported BYOK surface while platform config remains external | `docs/roadmap/PR437_GEMINI_PRIVATE_CHAT_PROVIDER_PREFLIGHT_REVIEW_RESULT.md` |
| PR437 | Gemini private chat provider preflight | MIMIR -> ARGUS | Rejected Gemini private chat for immediate replay; config required | `docs/roadmap/PR437_GEMINI_PRIVATE_CHAT_PROVIDER_PREFLIGHT_REVIEW_RESULT.md` |
| PR436 closeout | Hosted non-NVIDIA staged replay rehearsal | MIMIR -> ARIADNE -> MIMIR | Accepted as fail-closed proof; PR437 opened for Gemini/private-provider decision | `docs/roadmap/PR436_HOSTED_NON_NVIDIA_STAGED_REPLAY_RESULT.md` |
| PR436 rehearsal | Hosted non-NVIDIA staged replay rehearsal | MIMIR -> ARIADNE -> MIMIR | Config-blocked; private replay failed closed on missing accepted non-NVIDIA route | `docs/roadmap/PR436_HOSTED_NON_NVIDIA_STAGED_REPLAY_RESULT.md` |
| PR435 closeout | Private replay non-NVIDIA provider guard | DAEDALUS -> ARGUS -> MIMIR | Accepted; PR436 opened for hosted staged replay on accepted non-NVIDIA path | `docs/roadmap/PR435_PRIVATE_REPLAY_NON_NVIDIA_PROVIDER_GUARD_REVIEW_RESULT.md` |
| PR435 | Private replay non-NVIDIA provider guard | DAEDALUS -> ARGUS | Accepted; private chat blocks NVIDIA platform route and fails closed without non-NVIDIA config/BYOK | `docs/roadmap/PR435_PRIVATE_REPLAY_NON_NVIDIA_PROVIDER_GUARD_REVIEW_RESULT.md` |
| PR435 implementation | Private replay non-NVIDIA provider guard | DAEDALUS -> ARGUS | Ready for review; private chat blocks NVIDIA platform route | `docs/roadmap/PR435_PRIVATE_REPLAY_NON_NVIDIA_PROVIDER_GUARD_RESULT.md` |
| PR434 closeout | NVIDIA provider data-policy preflight | MIMIR -> ARGUS -> MIMIR | Accepted public/synthetic only; PR435 opened for executable private-chat guard | `docs/roadmap/PR434_NVIDIA_PROVIDER_DATA_POLICY_PREFLIGHT_REVIEW_RESULT.md` |
| PR434 | NVIDIA provider data-policy preflight | MIMIR -> ARGUS | Accepted public/synthetic only; private NVIDIA remains blocked | `docs/roadmap/PR434_NVIDIA_PROVIDER_DATA_POLICY_PREFLIGHT_REVIEW_RESULT.md` |
| PR433 closeout | NVIDIA platform chat synthetic proof | DAEDALUS -> ARGUS -> MIMIR | Accepted as routeability proof only; PR434 opened for provider/data-policy preflight | `docs/roadmap/PR433_NVIDIA_PLATFORM_CHAT_SYNTHETIC_PROOF_REVIEW_RESULT.md` |
| PR433 | NVIDIA platform chat synthetic proof | DAEDALUS -> ARGUS | Accepted with exact-output caveat | `docs/roadmap/PR433_NVIDIA_PLATFORM_CHAT_SYNTHETIC_PROOF_REVIEW_RESULT.md` |
| PR433 implementation | NVIDIA platform chat synthetic proof | DAEDALUS -> ARGUS | Ready for review; route/model callable with exact-output caveat | `docs/roadmap/PR433_NVIDIA_PLATFORM_CHAT_SYNTHETIC_PROOF_RESULT.md` |
| PR432 closeout | `station_free_1536` retrieval proof | DAEDALUS -> ARGUS -> MIMIR | Accepted; PR433 opened for NVIDIA synthetic chat proof | `docs/roadmap/PR432_STATION_FREE_1536_RETRIEVAL_PROOF_REVIEW_RESULT.md` |
| PR432 | `station_free_1536` retrieval proof | DAEDALUS -> ARGUS | Accepted | `docs/roadmap/PR432_STATION_FREE_1536_RETRIEVAL_PROOF_REVIEW_RESULT.md` |
| PR431 | Hosted Developer Space export readback rehearsal | ARIADNE -> MIMIR | Closed pass; export/readback loop complete | `docs/roadmap/PR431_DEVSPACE_EXPORT_READBACK_REHEARSAL_RESULT.md` |
| PR431 rehearsal | Hosted Developer Space export readback rehearsal | MIMIR -> ARIADNE | Pass | `docs/roadmap/PR431_DEVSPACE_EXPORT_READBACK_REHEARSAL_RESULT.md` |
| PR430 closeout | Developer Space export readback controls | DAEDALUS -> ARGUS -> MIMIR | Accepted; PR431 opened for hosted visible verification | `docs/roadmap/PR430_DEVELOPER_SPACE_EXPORT_READBACK_CONTROLS_REVIEW_RESULT.md` |
| PR430 | Developer Space export readback controls | DAEDALUS -> ARGUS | Accepted | `docs/roadmap/PR430_DEVELOPER_SPACE_EXPORT_READBACK_CONTROLS_REVIEW_RESULT.md` |
| PR429 | Hosted API-backed export rehearsal | ARIADNE -> MIMIR | Closed pass with caveat; PR430 opened for Developer Space readback controls | `docs/roadmap/PR429_HOSTED_API_EXPORT_REHEARSAL_RESULT.md` |
| PR429 rehearsal | Hosted API-backed export rehearsal | MIMIR -> ARIADNE | Pass with Developer Space manifest/bundle UI caveat | `docs/roadmap/PR429_HOSTED_API_EXPORT_REHEARSAL_RESULT.md` |
| PR428 | API-backed backup/export proof | DAEDALUS -> ARGUS -> MIMIR | Accepted after narrow ARGUS patch; closed by MIMIR | `docs/roadmap/PR428_API_BACKED_BACKUP_EXPORT_PROOF_REVIEW_RESULT.md` |
| PR428 implementation | API-backed backup/export proof | DAEDALUS -> ARGUS | Accepted after narrow ARGUS test patch | `docs/roadmap/PR428_API_BACKED_BACKUP_EXPORT_PROOF_REVIEW_RESULT.md` |
| PR428 spec | API-backed backup/export proof spec | MIMIR -> ARGUS | Accepted with persona, Developer Space, and Project export classes required | `docs/roadmap/PR428_API_BACKED_BACKUP_EXPORT_PROOF_SPEC_RESULT.md` |
| PR427 | Backup/restore local tooling acquisition | ARGUS -> MIMIR | Superseded by Marty correction in `690c26cb`; do not acquire local tooling | `docs/roadmap/PR427_BACKUP_RESTORE_LOCAL_TOOLING_DAEDALUS.md` |
| PR427 preflight | Backup/restore local tooling preflight | MIMIR -> ARGUS | Accepted local tooling path | `docs/roadmap/PR427_BACKUP_RESTORE_LOCAL_TOOLING_PREFLIGHT_RESULT.md` |
| PR426 | Post-observability next-lane selection | DAEDALUS -> MIMIR | Complete | `docs/roadmap/PR426_POST_OBSERVABILITY_NEXT_LANE_SELECTION_RESULT.md` |
| MCA-OBS-01 | Memory/Continuity/Archive observability | DAEDALUS -> ARGUS -> ARIADNE -> MIMIR | Passed human-eye gate | `docs/roadmap/FEATURE_MEMORY_CONTINUITY_ARCHIVE_OBSERVABILITY_ARIADNE_RERUN_RESULT.md` |
| PROD-PROJECT-ERR-01 | Project route error responses | DAEDALUS -> ARGUS -> MIMIR | Accepted | `docs/roadmap/PRODUCTION_PROJECT_ERROR_RESPONSE_REVIEW_RESULT.md` |
| PROD-DEVSPACE-OPS-ERR-01 | Developer Space operations error responses | DAEDALUS -> ARGUS -> MIMIR | Accepted | `docs/roadmap/PRODUCTION_DEVELOPER_SPACE_OPERATIONS_ERROR_RESPONSE_REVIEW_RESULT.md` |

## Deferred Blockers

| Lane | State | Why Deferred | Resume Condition |
| --- | --- | --- | --- |
| Backup/restore local proof | Superseded for current lane | Marty corrected that local Postgres tooling is not the intended unblock. | Reopen only by explicit MIMIR/product decision. |

## Numbering Rule

- New mainline work gets a visible lane id before DAEDALUS, ARGUS, or ARIADNE
  starts it.
- Keep the id stable through implementation, review, rehearsal, and closeout.
- Use PR-style ids when continuing existing roadmap numbering; use short named
  ids only for one-off acceptance/closeout threads.
- Update this file when MIMIR opens, closes, parks, or reroutes the current
  lane.

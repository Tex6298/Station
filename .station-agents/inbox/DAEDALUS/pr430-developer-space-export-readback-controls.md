# PR430 Developer Space Export Readback Controls

Implement:

`docs/roadmap/PR430_DEVELOPER_SPACE_EXPORT_READBACK_CONTROLS_DAEDALUS.md`

PR429 passed hosted export rehearsal with one caveat: Developer Space manage has
owner-only export creation/status, but not manifest or bundle readback controls.

Add the narrow owner-only readback controls using existing export endpoints.
Keep claims bounded to JSON/Markdown manifest and portable bundle readback.

Wake ARGUS when implemented and validated. Wake MIMIR if the fix requires a
broader export/backend/schema/config lane.

# Discern UI/UX Parity Closeout - MIMIR

Date: 2026-06-14
Owner: MIMIR / A1
Status: MIMIR closeout opened for ARIADNE verification.

## Source Truth

```text
Tex current main: 25a6ea97a019238878eeacb0f56d4e21e8a31a6b
Tex fork/main:    25a6ea97a019238878eeacb0f56d4e21e8a31a6b
Discern origin:   037d491d58f87170b6eb82dfef085215da9ac355
```

`origin/main` for `Discern-AI/Station` has not moved since the prior Discern UI
audit. The question is therefore not "what new Discern work appeared?", but
"did we carry the intended Discern UX direction into Tex, and did we
intentionally park the rest?"

## Verdict

For the current staging/replay target: yes, the intended Discern-inspired UI/UX
has been carried far enough.

This does not mean Tex has full feature parity with the Discern branch. It means
the valuable staging-facing direction from Discern has been reviewed, adapted
into Tex-native surfaces, or explicitly parked with a product reason.

Accepted staging UI/UX slices:

- `DISCERN-PUBLIC-SHELL-CLEANUP-01`: `/` is now a public Station front door
  rather than a raw feed dump, with public-safe search boundaries and grouped
  public surfaces.
- `DISCERN-ENTRY-ONBOARDING-COPY-01`: signup and new-persona setup now use
  Station-native archive, continuity, privacy, and public-surface language
  without direct-porting Discern runtime helpers.
- `DISCERN-DISCOVER-SEARCH-CLARITY-01`: `/discover` search now has clearer
  public/community-visible labels, routeable public result groups, and private
  Studio material excluded from the public search surface.
- `DISCERN-NAV-SEARCH-IA-REVIEW-01`: optional left-rail/search IA was reviewed
  and parked for staging instead of being treated as missing work.

## Not Missing, Intentionally Not Ported

| Discern clue | Current decision | Reason |
| --- | --- | --- |
| `apps/web/components/nav/left-rail.tsx` | Parked | ARIADNE judged current public nav good enough for staging. The Discern rail mixes public/private/settings routes and needs separate route, auth, privacy, and mobile decisions before it is safe. |
| Broad `discover-page.tsx` direct port | Not ported | Public-home direction and search clarity were adapted. A broad directory redesign would add fake/fallback content and route promises without improving the staging proof enough. |
| `apps/web/lib/onboarding/companion-kindling.ts` and `station-flow.ts` | Not ported yet | The useful product language was adapted into docs and copy. Runtime kindling metadata is a future onboarding/backend slice, not a staging UI parity blocker. |
| `apps/api/src/routes/notes.ts`, `025_notes_and_archive.sql`, `archive-library.tsx`, rich notes/editor work | Future backend/product lane | This is real product material, but it is schema/API/dependency work, not a safe UI import. It should reopen as notes/global archive with migration numbering and privacy gates. |
| Persona chat save/pin and richer per-message affordances | Future memory/notes lane | Useful once memory, notes, archive, and continuity write paths are deliberately joined. Not safe as a cosmetic direct port. |
| Discern global CSS, CDN icons, fake public cards, fallback activity | Rejected | These made the UI look more active while weakening truthfulness, dependency discipline, or Tex staging style. |
| Discern backend/config deletions and migration replacements | Rejected | They conflict with Railway, health/readiness, reset-password, retrieval/cache/provider, migration, and staging proof surfaces. |

## Open Future Lanes

These are not blockers for current staging UI/UX parity, but they remain useful
future work:

- Notes/global archive: design the source-of-truth model, migration numbers,
  owner privacy, and import/export relationship before UI.
- Runtime onboarding/kindling: decide whether kindling metadata belongs on
  personas, continuity, memory, or a separate onboarding state table.
- Mobile nav polish: only reopen as a narrow signed-in mobile link-pressure
  slice, not as a left-rail port.
- Persona chat save/pin: reopen after memory and notes write semantics are
  explicit.
- Richer public content presentation: use real Station data and first-party
  assets, not copied fallback/demo content.

## Recommendation

Do not keep mining Discern for staging UI polish unless a human demo finds a
specific broken or confusing surface.

The next staging-facing work should stay on replay rehearsal, billing/Stripe
proof, live config, and concrete issues found in the hosted flow. If we reopen
Discern-derived work, it should be a named future product/backend lane, not a
generic parity sweep.

## ARIADNE Review Request

ARIADNE should verify one thing:

```text
Is the accepted staging UI/UX parity from Discern complete enough, or is there
one exact missing Discern UX slice that should still block staging rehearsal?
```

If complete, wake MIMIR with closeout. If not, wake DAEDALUS with a single exact
implementation target, file allow-list, validation list, and forbidden changes.

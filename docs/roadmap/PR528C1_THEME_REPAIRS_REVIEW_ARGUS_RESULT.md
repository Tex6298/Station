# PR528C1 - Principal Route Theme Repairs Review ARGUS Result

Owner: ARGUS / A3

Date completed: 2026-07-16

Status: Accepted for combined deployment

```text
ACCEPT_PR528B1_THEME_REPAIRS_FOR_COMBINED_DEPLOYMENT
```

## Findings

No blocking finding.

DAEDALUS commit `497cb5f49ba231dc18a61c5f183152758ce763f5`
matches the PR528B1 lane. The source diff changes only the three authorized
visual treatments and one focused theme test. It does not change a route,
request, owner gate, persistence path, candidate action, document trust fact,
visibility rule, provenance value, or linked-discussion behavior.

The acceptance is intentionally limited to the three PR528B1 treatments. It is
not a claim that unrelated legacy fixed-color styles elsewhere on those pages
were globally rethemed.

## Diff Review

| File | Review result |
| --- | --- |
| `apps/web/app/space/[slug]/documents/[documentId]/page.tsx` | Only `DocumentTrustReadback` foregrounds and `trustRowStyle` surfaces/borders moved from fixed colors to existing Station semantic tokens. Rendered rows and trust inputs are unchanged. |
| `apps/web/app/globals.css` | `.archive-trust-copy` moved to `--station-page-muted`; one local Archive action hover rule and one focus-visible rule were added. No palette or broad selector was introduced. |
| `apps/web/components/studio/archive-library.tsx` | The existing `Ask Assistant` link retained `/studio/assistant`; one class was added and the local button style moved to existing strong/accent tokens. No click handler or Archive API changed. |
| `apps/web/lib/theme.test.ts` | Added source-contract and WCAG token calculations for the three treatments. No production behavior changed. |
| DAEDALUS result | Describes the bounded implementation and validation without claiming hosted deployment or mutation. |

The commit contains no API, database, migration, auth, provider, corpus,
billing, queue, Cloudflare, publishing-flow, candidate-review, or hosted-state
change.

## Independent Contrast Review

ARGUS reviewed the exact target SHA in a detached worktree so concurrent
PR528B3 document-summary work could not affect this result.

### Document trust

The heading, explanatory text, labels, values, and row copy use
`--station-page-accent`, `--station-page-text`, and
`--station-page-muted`. Info, success, and warning rows use the existing
semantic row surfaces and borders.

Across Light and Dark token combinations, the lowest meaningful-text pair is
`4.54:1`. The rendered browser matrix measured every explicitly colored text
node in the trust panel at or above `4.5:1` in desktop and mobile. A signed-out
reader saw two links to the exact linked discussion and zero `Publish` or
`Continue editing` owner controls.

### Memory Inbox and shared consumers

`.archive-trust-copy` has seven current consumers:

- Memory Inbox's `ImportReviewInbox`;
- Archive Connector owner panel; and
- five persona Archive/import/migrator explanatory blocks.

Every consumer is on a reconciled `studio-panel` or `studio-editor-panel`
surface, which resolves to `--station-page-surface`. Muted-copy contrast on
that surface is `5.03:1` in Light and `7.61:1` in Dark. The rendered Memory
Inbox copy passed in both viewports and themes. Source, Destination, and State
labels remained present; Reject and Accept-with-edits remained enabled and
focusable. No candidate action was invoked.

### Global Archive action

The local action retains this exact destination:

```text
/studio/assistant
```

Base text contrast is `15.50:1` in Light and `15.16:1` in Dark. Hover text
contrast is `6.93:1` in Light and `7.66:1` in Dark. The weakest hover/focus
boundary against the page is `6.24:1`. Browser readback confirmed the 2px
accent focus outline, visible hover treatment, stable horizontal geometry, and
an in-viewport action at both sizes.

## Browser Matrix

ARGUS ran the three real routes with intercepted public-safe local fixtures:

| Route | Light desktop | Light mobile | Dark desktop | Dark mobile |
| --- | --- | --- | --- | --- |
| Public document trust | Pass | Pass | Pass | Pass |
| Memory Inbox copy and controls | Pass | Pass | Pass | Pass |
| Global Archive action states | Pass | Pass | Pass | Pass |

Result: `12/12` pass at `1440x900` and `390x844`.

All 12 cases had:

- no unexpected API request;
- no page or console error;
- no failed request;
- no horizontal overflow;
- no owner-control exposure on the signed-out document; and
- no destination, control-state, or content mutation.

Temporary screenshots were produced for all 12 cases. ARGUS visually inspected
representative screenshots covering every route, both themes, and both
viewports, then removed the temporary harness, screenshots, test results, and
detached worktree.

## Validation

| Command | Result |
| --- | --- |
| Focused `apps/web/lib/theme.test.ts` | Pass, `9/9` |
| `npx --yes pnpm@10.32.1 run test:studio-ui` | Pass, `266/266` |
| `npx --yes pnpm@10.32.1 run test:publishing-approvals` | Pass, `26/26` |
| `npx --yes pnpm@10.32.1 run test:document-discussions` | Pass, `4/4` |
| `npx --yes pnpm@10.32.1 --filter @station/web typecheck` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/web lint` | Pass, zero warnings/errors |
| Independent Playwright route/theme/viewport matrix | Pass, `12/12` |
| `git diff --check 497cb5f4^ 497cb5f4` | Pass |

Next dev repeated the inherited Autoprefixer mixed-support warning at unchanged
`globals.css` line 740. It is outside the changed blocks and did not affect the
warning-free lint gate.

No hosted service, credential, private row, provider, deployment,
configuration, or product state was read or mutated by the browser proof.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS reviewed the PR528B1 principal-route theme repairs.
Verdict:
- ACCEPT_PR528B1_THEME_REPAIRS_FOR_COMBINED_DEPLOYMENT
Task:
- Preserve the accepted source for the combined hosted PR528 rehearsal SHA.
```

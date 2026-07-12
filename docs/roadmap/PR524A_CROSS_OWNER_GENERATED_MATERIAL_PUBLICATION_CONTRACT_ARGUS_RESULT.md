# PR524A Cross-Owner Generated Material Publication Contract ARGUS Result

Date: 2026-07-12

Owner: ARGUS / A3

Requested by: DAEDALUS / A2 via MIMIR / A1

Status:

```text
ACCEPT_PR524A_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_CONTRACT_WITH_ARGUS_PATCH
```

## Verdict

ARGUS accepts PR524A with a narrow review patch.

The implemented lane matches the accepted PR524A contract: generated body text
is published only on a dedicated detail route, copied server-side from an active
PR522 private generated artifact and exact bilaterally approved revision. It
does not add a generated-material list, Discover/search/feed placement, public
persona linkback, Space/forum/writing/homepage placement, provider/retrieval/
storage/billing/queue/Cloudflare/deploy work, or broad UI scope.

No DAEDALUS fix lane is required before MIMIR decides closeout/hosted proof
sequencing. The MIMIR post-closeout pause directive remains a sequencing
directive, not PR524A implementation scope.

## ARGUS Patch

ARGUS made three review fixes:

- narrowed public generated-publication JSON so it no longer exposes full
  `revisionDigest`, `sourceArtifactDigest`, `reportedCount`, or source
  lifecycle statuses; public readback now carries only a short
  `revisionDigestLabel`;
- removed the redundant participant direct-select RLS policy from migration
  `082`, keeping participant controls server-mediated and public reads limited
  to the strict source-chain public policy;
- tightened generated-publication moderation restore checks so admin restore
  only succeeds when consent scopes/snapshots, artifact contract/provenance,
  revision text/digest/scope snapshots, publication contract/provenance, and
  both participant approval owner rows still match the exact published copy.

Tests now prove the full public digest/source artifact digest and internal
status fields stay out of public JSON, and that generated-publication restore
blocks on missing approval, edited revision body, and source snapshot drift.

## Review Notes

Accepted:

- participant publish/retract/delete routes remain authenticated and
  participant-scoped;
- public read and report routes fail closed when source consent, artifact,
  revision, digest, approval, lifecycle, participant, or copied-body checks
  drift;
- generated-publication reporting uses the new moderation target type without
  serializing public body text, raw ids, consent/artifact/revision ids, or
  private participant ids in admin target context;
- Studio can publish only the selected exact approved revision digest under the
  new `publish_exact_generated_revision` scope;
- metadata-only cross-owner exhibits remain metadata-only;
- no generated-publication list/index/search/feed or public persona/Space/
  forum/writing/homepage placement was added.

Accepted with honesty note:

- ARGUS did not rerun `build`; DAEDALUS already recorded that Next compiled,
  lint/type checks ran, and static page generation completed before the known
  local Windows standalone symlink `EPERM`.

## Validation

Environment note: commands used `npx --yes pnpm@10.32.1 run ...`.

| Command / check | Result | Notes |
| --- | --- | --- |
| `npx --yes pnpm@10.32.1 run test:persona-encounters` | Pass | 87 tests passed, including PR524A public payload and no-drift cases. |
| `npx --yes pnpm@10.32.1 run test:reports` | Pass | 9 tests passed, including ARGUS missing-approval, edited-body, and snapshot-drift restore blockers. |
| `npx --yes pnpm@10.32.1 run test:personas` | Pass | 18 tests passed. |
| `npx --yes pnpm@10.32.1 run test:community` | Pass | 47 tests passed. |
| `npx --yes pnpm@10.32.1 run test:writing` | Pass | 32 tests passed. |
| `npx --yes pnpm@10.32.1 run test:studio-ui` | Pass | 244 tests passed. |
| `npx --yes pnpm@10.32.1 run typecheck` | Pass | Turbo API/web typecheck passed. |
| `npx --yes pnpm@10.32.1 run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | No whitespace errors; Git printed existing LF-to-CRLF working-copy warnings. |
| Changed-path forbidden-scope scan | Pass | No Cloudflare, queue/worker, provider/model, retrieval/vector, storage/export, billing/Stripe, package/deploy, or broad public placement path drift. |
| Broad scope-word diff scan | Pass with intentional guardrail hits | Hits were guardrail tests/docs and local variable names, not new broad placement. |
| High-risk secret pattern diff scan | Pass | No API keys, private keys, passwords, `sk-` keys, GitHub tokens, JWTs, or long bearer-like literals found. |
| `build` | Not rerun by ARGUS | DAEDALUS recorded known Windows Next standalone symlink `EPERM` after successful compile/page generation. |

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR524A with a narrow safety patch.
- Public generated-publication JSON was narrowed, redundant participant direct
  body-select RLS was removed, and moderation restore now revalidates the exact
  source chain before republishing.
- Validation passed: test:persona-encounters, test:reports, test:personas,
  test:community, test:writing, test:studio-ui, typecheck, lint,
  git diff --check, forbidden-scope scan, broad scope-word scan, and high-risk
  secret scan.
Task:
- Close or route PR524A per MIMIR sequencing.
- The existing post-closeout pause directive remains active after PR524A is
  closed or concretely blocked.
```

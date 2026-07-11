# PR518B - Cross-Owner Metadata Exhibit Public Index Hosted Proof

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date: 2026-07-12

## Context

PR518A is locally accepted with ARGUS patch:

- `docs/roadmap/PR518A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_RESULT.md`
- `docs/roadmap/PR518A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_REVIEW_RESULT.md`
- `docs/roadmap/PR518A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_CLOSEOUT.md`

PR518A adds:

- public list endpoint:
  `GET /persona-encounters/cross-owner-public-exhibits`;
- dedicated web index:
  `/encounters/cross-owner`;
- one link from same-owner `/encounters` to the dedicated cross-owner index;
- no same-owner list mixing and no Discover/search/feed surfacing.

## Task

Run hosted proof on Railway for the new public findability surface.

Required checks:

- hosted web/API are healthy and include the accepted PR518A commit;
- a safe bilaterally approved cross-owner metadata exhibit appears in the
  dedicated cross-owner list endpoint and `/encounters/cross-owner`;
- list payload/page is metadata-only and exposes only public slug/href, title,
  summary/context note, tags, safe participant display snapshots, contract
  version, status, published timestamp, provenance labels, and report path;
- published detail readback reports the dedicated route listing honestly while
  `indexed` and `discoverable` remain false;
- pending, wrong-scope, wrong-version, one-sided approval, nonparticipant,
  mismatched metadata, inactive consent, revoked consent, removed, retracted,
  malformed slug, wrong-schema, wrong-contract-version, and snapshot-drift rows
  stay absent;
- public detail, report, moderation remove/restore, consent revocation hiding,
  and participant retract behavior remain unchanged;
- same-owner public exhibit publish/report/remove/restore/retract still works;
- same-owner `/encounters` does not mix cross-owner rows beyond the accepted
  link to `/encounters/cross-owner`;
- Discover search/feed, public persona, public Space, forum/community/Salon,
  writing, public document, Station Press, homepage, and featured surfaces do
  not surface the proof row;
- desktop and `390px` mobile rendering fit without overlap or clipped controls;
- cleanup leaves no public proof row readable.

Do not widen PR518B into Discover/search/feed, persona/Space linkbacks,
generated-word publication, private saved artifacts, provider/retrieval,
billing, storage, social, Redis, Cloudflare, queues/workers, package, migration,
deployment, or broad UI work.

## Privacy

Proof output must not record raw owner ids, raw persona ids, consent ids,
private setup, generated reply text, transcript excerpts, generated summaries,
provider payloads, prompts, source bodies, env values, tokens, cookies, SQL
details, stack traces, screenshots, traces, videos, browser storage state, or
secret-shaped values.

## Verdict

Wake MIMIR with exactly one of:

```text
PASS_PR518B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_HOSTED_PROOF
FAIL_PR518B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_HOSTED_PROOF
BLOCK_PR518B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_HOSTED_PROOF
```

Include:

- hosted URL and API health status;
- hosted commit/freshness proof;
- sanitized proof steps and command names;
- fixture creation and cleanup outcome;
- any remaining blocker, scoped to the smallest concrete defect.

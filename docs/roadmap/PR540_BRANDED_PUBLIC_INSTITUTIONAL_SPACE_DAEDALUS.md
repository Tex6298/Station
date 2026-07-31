# PR540 - Branded Public Institutional Space

Owner: DAEDALUS / A2 -> ARGUS / A3 -> ARIADNE / A4 -> MIMIR / A1

Date opened: 2026-07-31

Status:

```text
OPEN_PR540_BRANDED_PUBLIC_INSTITUTIONAL_SPACE
```

## Customer Result

The retained Institution owner authors and publishes a recognisable public
Institutional Space. A signed-out visitor sees verified Institution identity,
a bounded typographic mark and theme-safe accent, authored headline/about
copy, the retained public Institution Project, and only deliberately published
Institution work. The active member can read the Space configuration but
cannot change Institution branding.

This turns the existing public identity route into a real Institution home. It
is not a reskin of personal Spaces, a hidden personal owner, or a global site
theme change.

## No-Config Architecture

Migration `095` adds a first-class one-to-one `institution_spaces` relation.
Do not weaken or reuse mature personal `spaces.owner_user_id`, `space_pages`,
personal documents, custom CSS, or personal Space publishing authority.

The Alpha brand contract is deliberately bounded and needs no new API key,
bucket, domain, or external asset host:

- immutable Institution principal;
- short `mark_text` typographic insignia, normalised and bounded to four safe
  visible characters;
- authored headline and about copy;
- one `accent_key` selected from a small theme-safe Station palette, not an
  arbitrary colour, URL, gradient, or CSS string;
- exact `draft` or `published` status with optimistic integer version;
- nullable actor references with `ON DELETE SET NULL` plus durable public-safe
  creator/editor labels;
- publish/unpublish timestamps and actor provenance; and
- database-clock created/updated timestamps.

Use a separate generated UUID for the Space row and an immutable unique
`institution_id` with `ON DELETE RESTRICT`. Browser roles receive zero raw
table/RPC authority. No uploaded logo, remote image, custom domain, custom CSS,
analytics, or storage migration belongs in PR540.

## Atomic Authority

Add service-only atomic transitions:

1. **Create draft** - Institution owner only; exactly one Space per
   Institution.
2. **Edit draft** - owner only with a complete validated snapshot and
   `expectedVersion`; published Spaces must be unpublished before editing.
3. **Publish** - owner only, matching version, valid complete draft, and a
   verified/public Institution.
4. **Unpublish** - owner only; removes authored Space content from public
   aggregation while preserving the existing verified Institution identity
   route and private configuration.

The active member receives a read-only private DTO. Invited, stale, removed,
unrelated, anonymous, and member write attempts fail without disclosing
private Space existence. Institution verification/publication loss hides the
entire public Institution route through its existing boundary without deleting
the private Space.

Extend Institution audit actions with exact Space lifecycle events and expand
the paired resource-kind constraint to `institution_space` without weakening
the accepted `institution_publication` pair. Write each event in the same
transaction as its successful transition. PR542, not PR540, owns audit UI.

## Public Aggregation Contract

Extend the strict signed-out Institution response. When the Institution is
verified/public but its authored Space is absent or draft, preserve the current
minimal verified identity response and expose no draft brand or aggregate.
When the Space is published, return only:

- verified Institution name, slug, and bounded identity summary;
- published mark/headline/about/accent key;
- Institution publications that are published and attached to public Projects,
  using their existing public hrefs and bounded human attribution; and
- Institution-owned Projects whose current visibility is public, using their
  existing public hrefs and bounded connection metadata.

Any related lookup failure must fail the aggregate closed rather than emit a
partial or stale public page. Publication retraction, Project privacy,
Institution verification/publication loss, and Space unpublish must remove the
affected public content on the next read. Never expose raw ids, versions,
drafts, team roster, emails, audit rows, personal Spaces/documents, private
Projects, Developer Space owner controls, billing, provider data, or tokens.

## Product Surface

Add one private Institution Space workspace reachable from the Institution
team page:

- owner: create/edit draft, choose a labelled accent swatch, preview the exact
  mark/headline/about treatment, and publish/unpublish with visible
  success/error/version feedback;
- active member: read-only configuration and public-page link when published;
- all states: explicit Institution principal, role, draft/public truth, and no
  false action controls.

Upgrade `/institutions/[slug]` in the current Tex Station visual language:

- the Institution name remains the literal H1 and first-viewport identity;
- the mark and verified badge are prominent;
- headline/about support the identity instead of becoming a marketing-card
  hero;
- the hero is an unframed full-width band with a hint of the next content band
  visible on mobile and desktop;
- published work and Project connections are scannable real content, not
  placeholder cards; and
- light/dark, `375px`, `390px`, and desktop layouts have stable wrapping,
  focus, contrast, and zero horizontal overflow.

Do not import Discern global CSS, add gradients/decorative blobs, nest cards,
make page sections float as cards, use arbitrary owner CSS, broad-reskin other
routes, or add a community placeholder before PR541.

## Retained Hosted Proof

Serialize migration, deployment, lifecycle, human route, and cleanup proof.
Retain one published authored Space for `Station Institutional Alpha` with a
clear synthetic mark/headline/about and one approved accent. Prove:

1. owner creates draft version `1`; member reads it but cannot mutate;
2. owner edit moves version and stale expected version loses without overwrite;
3. signed-out route keeps only minimal identity while Space is draft;
4. owner publishes and signed-out page shows exact brand, retained publication,
   and retained public Project;
5. Space unpublish removes brand/aggregate but preserves verified identity,
   then exact republication restores it;
6. publication retraction/restoration removes/restores only that work;
7. Project private/public transition removes/restores both Project and any
   publication depending on it;
8. Institution verification/publication revocation returns public `404` while
   owner/member private Space truth remains, then restoration returns it;
9. invited, stale, removed, unrelated, anonymous, and member write boundaries
   hold;
10. exact Space audit resource events match successful transitions only;
11. personal Space/page/document counts, fingerprints, and representative
    personal public reads remain unchanged; and
12. all disposable proof rows/accounts/memberships are removed, the retained
    Space ends published, and all temporarily changed principal/resource state
    is restored.

Keep credentials, raw ids, screenshots containing private material, and full
database receipts under ignored `.station-private/pr540`. Commit only redacted
proof.

## Required Validation

- migration source/actual-engine shape, ACL/RLS, immutability, optimistic
  transitions, audit-resource compatibility, and personal Space compatibility;
- focused API/DTO tests for owner/member/hostile/public/draft/published and
  aggregation visibility transitions;
- Institution, Institution publication, Project, personal Space, writing,
  Discover, community, auth/profile, Developer Space, and export neighbour
  suites;
- API/web typecheck, lint, root build with precise local packaging caveat; and
- exact-source Railway deploy, fresh retained verifier, public route receipts,
  responsive/theme browser proof, and zero-residue/no-drift evidence.

## Exclusions

PR540 does not add Institution community/subcommunity presence, moderation,
member brand editing, multiple Institutional Spaces, custom domains, uploaded
logos, external brand URLs, custom CSS, analytics, billing, approvals,
delegated roles, Discover promotion, or audit readback. PR541-PR543 retain
community, owner readback, and final programme rehearsal.

## Baton

DAEDALUS implements and proves PR540 end to end, then wakes ARGUS for exact
source and hosted review. If ARGUS remains unavailable after a bounded retry,
wake MIMIR with the exact completed state. After acceptance, ARIADNE rehearses
the owner/member/signed-out authored Space journey. No agent may sleep without
handing completed or blocked state to the named next owner.

# Discern-to-Tex UI import plan

Date: 2026-06-11

Status: MIMIR operating plan. This is a selective UI/UX import workflow, not a
merge plan.

## Mission

Tex6298/Station is the working Railway/deployment fork. Discern-AI/Station is a
read-only source of possible UI/UX improvements.

The job is to identify useful UI/UX work in Discern, classify it, adapt it to
Tex, and import only the slices that improve Station without disturbing Tex's
backend, runtime, payment, model, provider, embedding, Railway, or staging
direction.

## MIMIR sequencing call

Current staging priority remains the embedding-profile/migration-029 proof
blocker. Do not let UI import work hide or rewrite that blocker.

Allowed now:

- Document this workflow.
- Run a read-only audit comparing `fork/main` against `origin/main`.
- Produce `docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_AUDIT.md`.

Not allowed yet:

- Port UI code from Discern into Tex.
- Merge or rebase Tex onto Discern.
- Change backend, payment, model, provider, embedding, config, Railway, or
  package script behavior as part of this UI lane.

Porting may begin only after:

1. The audit exists.
2. ARIADNE selects product-worthy UI slices.
3. MIMIR opens one bounded import slice.
4. DAEDALUS ports that one slice.
5. ARGUS reviews the diff boundary, validation, privacy language, and staging
   assumptions.

If migration `029` remains externally blocked, the audit can run in parallel as
docs-only prep. Actual UI porting waits for an explicit MIMIR decision.

## Hard rules

```text
Tex6298/Station is the base.
Discern-AI/Station is an upstream comparison source.
No wholesale merge.
No rebase Tex onto Discern.
No package.json overwrite.
No env/config overwrite.
No backend drift unless MIMIR explicitly opens a backend/config lane.
```

Current remotes in this workspace:

```text
fork   -> Tex6298/Station
origin -> Discern-AI/Station
```

Use `fork/main` as Tex and `origin/main` as Discern. Do not use destructive
commands such as `git reset --hard` for this workflow.

## Protected Tex areas

Reject Discern imports touching these areas unless MIMIR opens a separate
backend/config/payment lane:

```text
apps/api/**
packages/ai/**
packages/config/**
packages/db/**
infra/supabase/**
package.json
pnpm-lock.yaml
.env.example
railway.json
infra/railway/**
Stripe/billing routes
storage routes
token-credit routes
model/provider/embedding config
auth/session semantics
```

## UI/UX candidate areas

Likely safe audit areas:

```text
apps/web/app/**
apps/web/components/**
apps/web/lib/*navigation*
apps/web/lib/*layout*
apps/web/lib/*ui*
apps/web/lib/*archive*
apps/web/lib/*export*
apps/web/lib/*empty*
apps/web/lib/*copy*
docs/product/**
docs/roadmap/*UI*UX*
```

Risky but possible after ARGUS review:

```text
apps/web/lib/auth*
apps/web/lib/billing*
apps/web/middleware*
apps/web/lib/api*
apps/web/lib/session*
```

These can look like UI but affect auth, billing, routing, cookies, Railway URLs,
or API assumptions.

## Agent responsibilities

MIMIR:

- Compare Tex and Discern.
- Identify UI/UX differences.
- Protect Tex backend/payment/model/config choices.
- Decide which candidates are worth ARIADNE review.
- Wake ARIADNE after the audit.

ARIADNE:

- Reject generic cosmetic work.
- Prioritize place labels, mobile usability, privacy language, empty/error
  states, archive/export trust, continuity/integrity comprehension, billing
  quota clarity, and onboarding comprehension.
- Reject UI that implies backend capability Tex does not have.

DAEDALUS:

- Port approved slices only.
- Use patch-mode import.
- Preserve Tex scripts, config, Railway behavior, and runtime assumptions.
- Add or adjust focused UI tests.

ARGUS:

- Check diff boundaries.
- Check protected areas stayed untouched.
- Check privacy/visibility language.
- Check route behavior, auth/session assumptions, and Railway/staging behavior.
- Confirm validation.

## Phase 1: MIMIR audit

Create:

```text
docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_AUDIT.md
```

Suggested commands:

```bash
git fetch fork main
git fetch origin main
git diff --name-status fork/main..origin/main -- apps/web
git diff --name-status fork/main..origin/main -- docs/product docs/roadmap docs/ops/triad
git diff --name-status fork/main..origin/main -- apps/api packages/ai packages/config packages/db infra/supabase package.json pnpm-lock.yaml .env.example railway.json infra/railway
```

Classification table:

```markdown
| File / Change | Area | Classification | Reason | Proposed Action |
| --- | --- | --- | --- | --- |
| apps/web/... | Studio UI | Safe UI import | No API/config impact | Send to ARIADNE |
```

Classifications:

```text
1. Safe UI/UX import
2. UI/UX but needs Tex adaptation
3. Already present in Tex
4. Backend/config/payment/model/embedding: reject
5. Docs-only alignment
6. Needs human decision
```

Audit handoff:

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- Compared Tex against Discern.
- Classified UI/UX candidates and protected backend/config/payment/model areas.
Task:
- Review which UI/UX candidates are worth importing into Tex.
```

## Phase 2: ARIADNE selection

Create:

```text
docs/roadmap/DISCERN_TO_TEX_UI_IMPORT_ARIA_REVIEW.md
```

Prioritization:

```text
1. Mobile Studio wayfinding
2. Archive trust states
3. Export trust states
4. Empty/loading/error states
5. Top-nav/mobile overflow
6. Continuity/Integrity comprehension
7. Billing/quota clarity
8. Discover/public/community polish
9. Onboarding and Station Assistant
```

ARIADNE rejects:

```text
- purely decorative redesign
- vague modernization
- UI that hides privacy/visibility state
- UI that implies missing backend capability
- UI that turns Archive/Export into fake live surfaces
- UI that touches auth/billing/session behavior without ARGUS approval
```

## Phase 3: DAEDALUS port

Use one slice per commit.

Good first slices:

```text
1. Studio/mobile frame polish
2. Archive trust cards
3. Export trust component
4. Top-nav mobile overflow fix
5. Empty/error copy pass
```

Patch-mode import:

```bash
git checkout -p origin/main -- apps/web
```

Before committing:

```bash
git diff --stat
git diff --name-only
```

Reject the slice if protected files appear unless MIMIR explicitly approved
that expanded scope.

Validation for UI-only slices:

```bash
npx --yes pnpm@10.32.1 lint
npx --yes pnpm@10.32.1 typecheck
npx --yes pnpm@10.32.1 test:studio-ui
npx --yes pnpm@10.32.1 test:auth
```

Additional gates:

```text
Archive/Export touched: test:storage, test:conversation-archive, test:exports
Billing touched: test:billing, test:auth
Developer Spaces touched: test:developer-spaces, test:developer-space-client
```

## Phase 4: ARGUS review

ARGUS checklist:

```text
1. Diff contains only approved files.
2. No backend/config/payment/model/provider/embedding drift.
3. Tex package scripts are preserved.
4. Railway/staging behavior is preserved.
5. Auth/session semantics are preserved.
6. UI does not claim nonexistent backend capability.
7. Visibility/privacy language remains accurate.
8. Relevant tests pass.
9. Mobile behavior is inspected for touched layouts where browser access exists.
```

## Acceptance definition

A Discern UI/UX import is accepted into Tex only if:

```text
1. ARIADNE says it improves Station UX.
2. It does not change protected backend/config/payment/model/embedding areas.
3. It preserves Tex package scripts and Railway assumptions.
4. ARGUS validates the diff and tests.
5. ACTIVE_STATUS records exactly what moved.
6. Any new UI test is added to Tex's validation surface.
```

## Long-term loop

After the first two or three safe UI imports, move from local merge-thinking to
Railway staging UX review:

```text
Discern UI idea
-> MIMIR audit
-> ARIADNE selection
-> DAEDALUS port into Tex
-> ARGUS validation
-> Railway staging deploy
-> ARIADNE browser review
-> next slice
```


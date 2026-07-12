# PR524B - Cross-Owner Generated Material Publication Hosted Proof Result

Owner: ARIADNE / A4

Date: 2026-07-12

Verdict:

```text
BLOCK_PR524B_CROSS_OWNER_GENERATED_MATERIAL_PUBLICATION_HOSTED_PROOF
```

## Blocker

Hosted API/web were reachable, and the cross-owner public target route was live,
but hosted could not save a cross-owner consent with the PR524 generated-material
scopes:

```text
save_private_cross_owner_artifact
publish_exact_generated_revision
```

The create request returned HTTP 500 with:

```text
code=persona_encounter_cross_owner_consent_save_failed
error=Cross-owner encounter consent invitation could not be saved.
```

A diagnostic request against the same hosted API, same requester persona, and
same counterparty public persona saved a legacy `run_cross_owner_encounter`
consent successfully and was then cancelled. That narrows the blocker to hosted
schema/RPC freshness for the PR524 generated scopes, not general auth, public
target resolution, or all cross-owner consent saving.

## Hosted Freshness Evidence

- `GET https://stationapi-production.up.railway.app/health` returned HTTP 200.
- `GET https://stationweb-production.up.railway.app/` returned HTTP 2xx.
- Missing generated publication API detail failed closed with HTTP 404.
- Missing generated publication web route loaded the public not-found state.
- Hosted accepted PR524 route-level generated-publication slug handling, but the
  consent RPC/save layer did not accept the generated-material scopes.

## Proof Steps Completed

- Signed in the replay owner, admin, and available replay candidate accounts.
- Confirmed the replay owner is `canon` tier and the available non-admin
  candidate accounts are `private` tier.
- Checked known replay public persona fixtures; they resolved as same-owner for
  this requester and therefore were not valid cross-owner targets.
- Confirmed non-admin candidate accounts could not create public personas because
  hosted tier policy returned HTTP 403.
- Used the admin account as the only available hosted account able to provide a
  public counterparty persona.
- Resolved the admin-created public persona as an eligible cross-owner public
  target.
- Attempted PR524 generated-scope consent creation and hit the hosted 500 save
  failure above.
- Ran the legacy-scope diagnostic against the same pair; it saved and was
  cancelled, confirming the blocker is specific to PR524 generated scopes.

## Not Reached

Because the generated-scope consent could not be saved, the hosted proof could
not proceed to:

- private generated artifact save;
- exact public revision proposal;
- bilateral exact-digest approval;
- public generated-material publication;
- public API detail privacy inspection;
- desktop and 390px generated detail rendering;
- report, moderation remove/restore, participant retract, participant delete;
- no-drift checks for generated body placement.

## Privacy And API Findings

- The missing public API detail returned a bounded 404, with no SQL, stack trace,
  bearer/cookie/env value, or secret-shaped string observed.
- No public generated-material row was created, so no generated body was exposed
  by this blocked run.
- The public counterparty target route used public persona fields only; the
  raw owner/persona IDs were not exposed in target readback.

## Cleanup

- The diagnostic legacy consent was cancelled.
- No generated artifact, generated revision, or generated publication was
  created.
- The temporary PR524B admin counterparty persona could not be deleted because
  hosted returned HTTP 500 on persona delete, but it was patched back to
  `visibility: private` with HTTP 200 so it no longer remains a public target.

## Required Next Step

Update or redeploy the hosted Supabase/RPC/schema layer so
`create_persona_encounter_cross_owner_consent` accepts the PR524 generated
scopes. After that, rerun the full PR524B hosted proof from consent creation
through publication, public detail rendering, report/moderation controls,
participant cleanup, and no-drift checks.

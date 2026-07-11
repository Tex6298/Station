# PR505D - Owner Encounter Hosted Output Budget Rerun Result

Owner: ARIADNE / A4

Date: 2026-07-11

Result:

```text
PASS_PR505D_OWNER_ENCOUNTER_HOSTED_OUTPUT_BUDGET_RERUN
```

## Scope

ARIADNE reran the hosted owner encounter proof requested in:

`docs/roadmap/PR505D_OWNER_ENCOUNTER_HOSTED_OUTPUT_BUDGET_RERUN_ARIADNE.md`

Target:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

The proof did not record credentials, cookies, auth tokens, raw owner ids, raw
persona ids, prompt bodies, private context bodies, provider keys, base URLs,
model config, SQL details, stack traces, provider payloads, generated reply
text, token values, or env values.

## Verdict

PR505D passes. Hosted `@station/api` was fresh on the PR505C output-budget
deployment before generation, and the single same-owner disposable preview
returned nonblank responder content with disposable/no-durable provenance.

Key proof:

```text
preview status: 200
reply role: responder
reply characters: 111
```

## Hosted Reachability

| Check | Result |
| --- | --- |
| Hosted web health | `200` |
| Hosted API health | `200` |
| Hosted API deployment health | `200` |
| Hosted API deployment ready | `true` |
| Hosted API service | `@station/api` |
| Hosted API branch | `main` |
| Hosted API commit prefix | `03d39f8e93ab` |
| Deployment floor met | Pass |

## Auth And Persona Availability

Auth checks passed:

- owner sign-in returned `200`;
- owner `/auth/me` returned `200` with `canon` tier;
- non-owner sign-in returned `200`;
- non-owner `/auth/me` returned `200` with `private` tier.

The hosted owner account had `5` personas available. ARIADNE selected two
same-owner personas and did not record raw persona ids.

## Readiness

| Check | Result |
| --- | --- |
| Owner readiness route | `200` |
| Owner readiness state | `ready:true` |
| Owner readiness message | `Encounter preview provider is ready.` |
| Signed-out readiness | `401` |
| Cross-owner readiness | `403` |
| Cross-owner readiness code | `persona_encounter_persona_not_owned` |

## Generation

ARIADNE sent exactly one same-owner hosted preview request.

| Check | Result |
| --- | --- |
| Preview requests sent | `1` |
| Preview status | `200` |
| Reply role | `responder` |
| Reply character count | `111` |
| Nonblank responder content | Pass |
| Disposable provenance | Pass |
| Persisted transcript | No |
| Shareable output | No |
| Source retrieval | No |
| Source bucket count | `0` |

The response provenance reported:

- `saved:false`;
- `transcriptStored:false`;
- `shareable:false`;
- `sourceRetrieval:false`;
- empty `sourceBuckets`.

## Boundary Checks

Fail-closed probes passed:

| Probe | Result |
| --- | --- |
| Signed-out preview | `401` |
| Cross-owner preview | `403` |
| Cross-owner preview code | `persona_encounter_persona_not_owned` |

## Public No-Drift Checks

ARIADNE sampled public routes after the proof:

| Route | Result |
| --- | --- |
| Public Space route | `200`, no owner-encounter controls or claims found |
| Public persona route | `200`, no owner-encounter controls or claims found |

No public route, public/shareable encounter page, social post, billing action,
queue/worker action, Redis/Cloudflare surface, source retrieval, vector/Memory/
Archive/Canon/Continuity/Integrity retrieval, durable transcript, or cross-owner
behavior was created by the proof.

## Privacy And Product Boundary

The sanitized proof output exposed no:

- raw owner ids;
- raw persona ids;
- prompt bodies;
- private context bodies;
- generated reply text;
- provider keys;
- base URLs;
- model config;
- SQL details;
- stack traces;
- provider payloads;
- env values;
- bearer/JWT tokens;
- cookies.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Temporary hosted rerun runner | Pass | Deployment floor was met before generation; exactly one owner preview returned `200` with nonblank responder content and disposable/no-durable provenance. |
| Hosted reachability | Pass | Web health `200`; API health `200`; API deployment health `200`; API ready at `@station/api` commit prefix `03d39f8e93ab`. |
| Owner and non-owner auth | Pass | Owner tier `canon`; non-owner tier `private`. |
| Same-owner persona availability | Pass | Owner persona count was `5`; selected raw persona ids were not recorded. |
| Owner readiness route | Pass | `ready:true`; provider route was ready before generation. |
| Exactly one same-owner preview | Pass | One owner preview POST was sent. |
| Nonblank responder content | Pass | Reply role was `responder`; reply character count was `111`. |
| Disposable provenance | Pass | Response said no save, transcript, shareable output, source retrieval, or source buckets. |
| Signed-out/cross-owner probes | Pass | Signed-out preview returned `401`; cross-owner preview returned `403` with `persona_encounter_persona_not_owned`. |
| Public no-drift probes | Pass | Sampled public Space and public persona routes exposed no owner-encounter controls or claims. |
| Privacy/secret scan | Pass | Sanitized proof output contained no raw ids, prompt/private context bodies, generated reply text, provider details, tokens, cookies, SQL details, stack traces, provider payloads, or env values. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected LF-to-CRLF working-copy warnings only. |

`pnpm typecheck` was not run because this result updates documentation only and
does not touch imports or scripts.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE reran hosted PR505D against the PR505C output-budget deployment.
- Deployment floor was checked before generation: hosted API reported `@station/api`, branch `main`, commit prefix `03d39f8e93ab`, ready:true.
- Owner and non-owner auth passed; owner tier was canon and non-owner tier was private.
- Same-owner persona availability passed with 5 owner personas.
- Owner readiness returned ready:true.
- ARIADNE sent exactly one same-owner disposable preview request.
- Preview returned 200 with responder role and 111 reply characters.
- Disposable/no-durable provenance passed: saved:false, transcriptStored:false, shareable:false, sourceRetrieval:false, sourceBuckets:0.
- Signed-out and cross-owner readiness/preview probes passed with 401/403 boundaries and persona_encounter_persona_not_owned for cross-owner.
- Public Space and public persona samples exposed no owner-encounter controls or claims.
- Privacy/secret scan passed.
Result:
- PASS_PR505D_OWNER_ENCOUNTER_HOSTED_OUTPUT_BUDGET_RERUN.
Next:
- Close PR505D if accepted; hosted owner encounter preview now has nonblank disposable output under the current privacy and provenance boundaries.
```

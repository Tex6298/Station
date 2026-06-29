# PR481A Owner Persona Avatar URL Control Hosted Rehearsal Result

Date: 2026-06-29

Owner: ARIADNE / A4

State: PASS_READY_TO_CLOSE

Source: `docs/roadmap/PR481A_OWNER_PERSONA_AVATAR_URL_CONTROL_REHEARSAL_ARIADNE.md`

## Verdict

ARIADNE passes the hosted PR481A owner/public avatar URL rehearsal.

Hosted web and API were ready at commit `a6a9eaec`. The owner edit surface
exposed the Avatar URL control, a safe public HTTPS image URL saved with bounded
success copy, signed-out public persona and public Space card renders worked on
desktop and 390px mobile, unsafe avatar values failed closed, and the seeded
persona returned to its initials fallback after clear.

Result:

```text
PASS_READY_TO_CLOSE
```

## Routes Checked

| Surface | Result | Notes |
| --- | --- | --- |
| Hosted web deployment | Pass | Ready at `a6a9eaec`. |
| Hosted API deployment | Pass | Ready at `a6a9eaec`. |
| Owner persona edit | Pass | Avatar URL control was visible on the private management surface. |
| Public persona | Pass | `/personas/station-replay-alpha-persona` rendered signed-out on desktop and 390px mobile. |
| Public Space persona card | Pass | `/space/station-replay-alpha` rendered the same persona avatar behavior on desktop and 390px mobile. |

## Baseline And Restore

- Starting public persona avatar state: initials fallback.
- Starting public Space persona card avatar state: initials fallback.
- The rehearsal saved a safe public HTTPS image URL, verified public render,
  then cleared the Avatar URL through the owner control.
- The public persona and public Space persona card returned to initials
  fallback before the rehearsal exited.

## Safety Checks

| Check | Result | Notes |
| --- | --- | --- |
| Safe owner save | Pass | Owner UI reported bounded success copy. |
| Public persona render | Pass | Signed-out desktop and 390px mobile showed the safe avatar state without horizontal overflow. |
| Public Space card render | Pass | Signed-out desktop and 390px mobile showed the same safe avatar behavior without horizontal overflow. |
| Public persona serializer | Pass | Returned the safe `avatarUrl` only, with no raw owner fields, tokens, storage paths, SQL/stack text, or provider payload text. |
| Unsafe values | Pass | `javascript:`, `data:`, localhost, token, apikey, apiKey, and x-amz-signature query fixtures returned bounded `invalid_avatar_url` rejection and did not change the public avatar. |
| Unsafe echo check | Pass | Unsafe values did not appear in API error bodies or public persona serializer readback. |
| Clear behavior | Pass | Owner Clear returned public routes to initials fallback. |

No upload, signed upload URL, storage object, provider/media call,
voice/audio/video behavior, billing/Stripe, Redis, Cloudflare, worker, queue,
migration, or broad public persona/product redesign path was exercised.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `node .codex-tmp\pr481a-avatar-rehearsal.mjs` | Pass | Hosted CDP/browser rehearsal completed and restored the seed avatar baseline. |
| `pnpm typecheck` | Not run | Docs/result update only; no imports or scripts were touched in committed files. |

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
```

Task: close PR481A or route any final closeout wording.

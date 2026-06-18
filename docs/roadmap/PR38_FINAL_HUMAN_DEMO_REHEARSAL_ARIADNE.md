# PR38 Final Human Demo Rehearsal - ARIADNE Result

Date: 2026-06-18
Agent: A4 / ARIADNE
Verdict: Ready for human demo as protected-alpha replay

## Runtime Checked

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`
- Railway web/API deployment identity:
  `6b87332a3a4b0d213de0bbea568e2fb36ae2eab7`
- Browser: Chrome/CDP
- Desktop viewport: `1365x900`
- Mobile viewport: `390x844`
- Account role: signed replay owner for private Studio surfaces; anonymous
  visitor for public Space, document, forum, Discover, and Developer Space

`f75f4af` is the PR38 planning commit, but Railway correctly serves the latest
deployed app-code commit, `6b87332`.

No credentials, cookies, tokens, private prompts, private archive excerpts, raw
provider payloads, or owner IDs were printed.

## Verdict

PR38 passes as the final protected-alpha human-demo rehearsal.

Station is ready to show as a protected-alpha replay if the demo is framed
honestly: it is not finished product polish, but the private Studio, continuity,
archive/export, publishing, public discussion, Assistant, and Developer Space
story are connected and usable.

No DAEDALUS blocker was found.

## API Rehearsal

Health:

- Web `/health/deployment`: ready.
- API `/health/deployment`: ready.
- Supabase, storage, Redis operational cache, Stripe config, platform chat, and
  Gemini embeddings reported ready in deployment health.

Chat and archive:

- Persona chat stream returned `200` with
  `text/event-stream; charset=utf-8`.
- Stream status sequence was visible:
  - `Chat request accepted.`
  - `Assembling chat context.`
  - `Checking token budget.`
  - `Waiting for model response.`
  - `Saving assistant reply.`
- First measured stream completed in `7217ms` with a `chat.complete` event.
- A focused stream/archive follow-up returned a conversation id and archived
  successfully:
  - archive status `201`;
  - conversation status `archived`;
  - transcript present;
  - archive chunks created: `1`;
  - continuity candidate count: `2`.

Continuity:

- Continuity records list returned `200`.
- Creating a private PR38 timeline marker returned `201`.
- Continuity remains available as its own route in the browser.

Archive search/source copy:

- Private archive search for PR38 returned `200`.
- Result count: `1`.
- Warnings: `0`.
- Raw private prompt text was not included in the archive search response.

Export:

- Persona export package creation returned `201`.
- Export manifest readback returned `200`.
- Portable bundle readback returned `200`.
- Bundle contained the expected top-level structure:
  `schema`, `generatedAt`, `package`, `privacy`, `integrity`, and `files`.

Publish/public discussion:

- Public Space read returned `200`.
- Created PR38 public field-log document:
  `dce9dcdc-067e-488b-baae-b09c0541077f`.
- Publish returned `200`, with status `published` and visibility `public`.
- Linked discussion thread:
  `ce8c1f39-41ec-42a0-9cce-1cf87e10cabf`.
- Comment creation returned `201`.
- Anonymous thread read returned `200`.
- Anonymous public document read returned `200`.

Station Assistant:

- Assistant summary returned `200`.
- Assistant message returned `200`.
- Summary exposed `4` next actions.
- Reply intent: `general`.
- Browser route loaded the Station Assistant surface and next-action framing.

Developer Space:

- Anonymous Developer Space API read returned `200`.
- Public read showed `1` node and `1` event.
- Browser route showed the public story: what is visible, methodology,
  field-log, live signals, and visitor/private boundaries.

## Browser Rehearsal

Signed desktop routes passed without login redirects, hard errors, token/debug
text, or document-level horizontal overflow:

- `/studio`
- `/studio/personas/7944d8be-6b1d-49d9-b3b9-7e438810b414`
- `/studio/personas/7944d8be-6b1d-49d9-b3b9-7e438810b414/continuity`
- `/studio/archive`
- `/studio/assistant`

Signed mobile routes passed at `390x844` without login redirects, hard errors,
token/debug text, or document-level horizontal overflow:

- `/studio`
- `/studio/personas/7944d8be-6b1d-49d9-b3b9-7e438810b414`
- `/studio/personas/7944d8be-6b1d-49d9-b3b9-7e438810b414/continuity`
- `/studio/archive`
- `/studio/assistant`

Auth persistence:

- Reloading signed `/studio` preserved the session and did not redirect to
  login.

Anonymous mobile public chain passed without hard errors or horizontal
overflow:

- `/`
- `/discover`
- `/space/station-replay-alpha`
- `/space/station-replay-alpha/documents/dce9dcdc-067e-488b-baae-b09c0541077f`
- `/forums/documents-and-codexes/ce8c1f39-41ec-42a0-9cce-1cf87e10cabf`
- `/developer-spaces/station-replay-dev-alpha`

Public URLs created during rehearsal:

- Document:
  `https://stationweb-production.up.railway.app/space/station-replay-alpha/documents/dce9dcdc-067e-488b-baae-b09c0541077f`
- Discussion:
  `https://stationweb-production.up.railway.app/forums/documents-and-codexes/ce8c1f39-41ec-42a0-9cce-1cf87e10cabf`
- Space:
  `https://stationweb-production.up.railway.app/space/station-replay-alpha`
- Developer Space:
  `https://stationweb-production.up.railway.app/developer-spaces/station-replay-dev-alpha`

## Caveats

- Chat/provider latency can vary. One measured stream completed in `7217ms`;
  the focused stream/archive follow-up also completed and archived, but took
  long enough that a live human demo should narrate the visible status states
  rather than wait silently.
- Developer Space storytelling is now understandable, but the seeded public
  Developer Space still has `0` linked public methodology/finding/field-log
  documents. The page honestly explains that live signals and snapshots are the
  current public evidence.
- This remains a protected-alpha replay, not a claim of finished onboarding,
  full production polish, or broad public launch readiness.

## Cloudflare

Cloudflare remains deferred.

This rehearsal did not find a concrete retrieval, latency, public-edge delivery,
or NESTstyle-memory defect that requires Cloudflare:

- private archive search returned owner-scoped results without raw prompt text;
- chat status events made provider wait states visible;
- public Space, document, forum, Discover, and Developer Space routes loaded
  from Railway without a public-edge blocker;
- Developer Space story was a content/seed-data caveat, not an edge-delivery
  defect.

## Recommendation

MIMIR can close PR38 as ready for a human demo/protected-alpha replay.

Recommended next phase:

- run the human demo using the seeded replay account and the PR38 public
  document/discussion chain;
- keep Cloudflare out of the immediate path;
- move future work into deliberate post-demo planning: onboarding polish,
  Developer Space seeded methodology documents, broader Archive import polish,
  and the post-V3 UI/UX roadmap.

## Validation

- `curl.exe -fsS --max-time 30 https://stationweb-production.up.railway.app/health/deployment`
- `curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment`
- Signed API rehearsal for chat stream, archive, Continuity, private archive
  search, export, document publish, forum discussion/comment, Assistant, and
  Developer Space readback
- Focused signed API stream/archive follow-up
- Chrome/CDP desktop route rehearsal at `1365x900`
- Chrome/CDP mobile route rehearsal at `390x844`
- Auth persistence reload check on `/studio`

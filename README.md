# Station Studio Alpha

This bundle extends Foundation Alpha into a working Studio Alpha scaffold.

Included:
- monorepo structure
- web shell with Studio routes
- API shell with persona and conversation routes
- shared config, types, permissions, and AI adapter scaffolding
- in-memory repositories for local development
- first DeepSeek-compatible provider wrapper shape

Not yet included:
- real Supabase auth/session wiring
- real Stripe integration
- persistent database implementation
- production-ready validation and tests

## Active roadmap

The active roadmap is now `docs/roadmap/STATION_PR_PLAN_V2.md`.

Use these roadmap docs as the source of truth:

- `docs/roadmap/STATION_PR_PLAN_V2.md` - PR sequence and acceptance gates.
- `docs/roadmap/ACTIVE_STATUS.md` - current lane and validation status.
- `docs/roadmap/SUPERSEDED.md` - older notes that should not drive new work.

## Validation

Use `docs/testing/VALIDATION_BASELINE.md` for the current install, build, lint,
typecheck, and named test gate.


## Included milestone

This scaffold currently includes Community Beta: public Spaces, documents, Discover, forums, comments, and report-route scaffolding.

## Developer Spaces observatory patch

The Intelhub transfer patch adds a first Station-native Developer Spaces slice: owner-created project observatories, hashed ingestion keys, node/event/snapshot ingestion endpoints, a public live observatory page, and a private management console.

See `docs/integration/intelhub-to-station-developer-spaces.md` for the fit/reject analysis. Its follow-up list is now absorbed into `docs/roadmap/STATION_PR_PLAN_V2.md`.

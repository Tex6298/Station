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

## Next steps
1. `pnpm install`
2. Create `.env` from `.env.example`
3. Wire Supabase auth and database
4. Replace in-memory repos with real DB calls
5. Connect frontend forms to live auth
6. Build Continuity Alpha next


## Included milestone

This scaffold currently includes Community Beta: public Spaces, documents, Discover, forums, comments, and report-route scaffolding.

## Developer Spaces observatory patch

The Intelhub transfer patch adds a first Station-native Developer Spaces slice: owner-created project observatories, hashed ingestion keys, node/event/snapshot ingestion endpoints, a public live observatory page, and a private management console. See `docs/integration/intelhub-to-station-developer-spaces.md` for the fit/reject analysis and follow-up plan.

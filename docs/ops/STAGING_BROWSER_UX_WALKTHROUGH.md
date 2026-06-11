# Staging browser UX walkthrough

Date: 2026-06-11

Status: active ARIADNE handoff. Backend/API replay evidence is accepted for the
seeded staging corpus; this lane is a browser/mobile product walkthrough, not
another API proof pass.

## Current truth

- Web URL: `https://stationweb-production.up.railway.app`.
- API URL: `https://stationapi-production.up.railway.app`.
- Live `/health/deployment` is `ready:true`.
- ARGUS accepted populated retrieval quality for the seeded corpus.
- ARGUS accepted the deployed API replay walkthrough, including the live
  second-owner archive privacy preflight.
- Remaining friction is product experience: no browser/mobile UX proof yet,
  export is manifest readback, billing is status-only with no active customer,
  observability traces are empty, and Discover/onboarding polish is future work.

## ARIADNE scope

Run a live browser walkthrough of the staged web app using the existing replay
owner setup. Do not broaden this into redesign or new implementation.

Cover at least:

- unauthenticated web root, login, and password-reset/update route;
- replay owner sign-in and session restore;
- Studio/persona workspace landing;
- persona Archive/files or nearest available archive trust surface;
- any visible context/retrieval affordance tied to the seeded persona;
- public Space/document/discussion surfaces for the seeded public material;
- Developer Space public observatory surface;
- owner export/status/readback surface as currently implemented;
- billing/status page as currently implemented;
- mobile-width and desktop-width navigation sanity.

## Evidence Rules

Allowed evidence:

- route/status observations;
- viewport names and dimensions;
- sanitized layout, navigation, copy, and friction notes;
- public-safe slugs/labels only;
- whether a flow is usable, confusing, missing, or blocked.

Do not commit:

- screenshots containing private archive text or credentials;
- response bodies, prompt bodies, private excerpts, raw corpus text, tokens,
  cookies, passwords, owner ids, persona ids, or local env values.

If screenshots are useful, keep them local/ignored unless they are redacted and
public-safe.

## Verdict Shape

Wake MIMIR with:

- what is browser-ready enough for staging replay;
- what is product friction but not a backend blocker;
- what is a true blocker before the user can run staging replay;
- whether DAEDALUS needs an implementation/fix lane;
- whether ARGUS should review any security/privacy issue found in the browser.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  socialPublishingActionLabel,
  socialPublishingAuthStyleLabel,
  socialPublishingEmptyReadiness,
  socialPublishingIntroCopy,
  socialPublishingSafetyCopy,
  socialPublishingStatusLabel,
} from "./social-publishing-readiness";

function source(path: string) {
  return readFileSync(path, "utf8");
}

test("social publishing readiness helper stays readback-only and provider-scoped", () => {
  const readiness = socialPublishingEmptyReadiness();

  assert.equal(readiness.mode, "readback_only");
  assert.equal(readiness.credentialStorageAccepted, false);
  assert.equal(readiness.postingEnabled, false);
  assert.equal(readiness.connectionActionsEnabled, false);
  assert.equal(readiness.teaserGenerationEnabled, false);
  assert.deepEqual(
    readiness.supportedProviders.map((provider) => [provider.platform, provider.label, provider.status]),
    [
      ["bluesky", "Bluesky", "paused"],
      ["mastodon", "Mastodon", "paused"],
      ["tumblr", "Tumblr", "paused"],
      ["linkedin", "LinkedIn", "paused"],
      ["reddit", "Reddit", "paused"],
      ["wordpress", "WordPress", "paused"],
      ["ghost", "Ghost", "paused"],
    ]
  );
  assert.deepEqual(
    readiness.supportedProviders.map((provider) => provider.authStyle),
    ["manual_credential", "manual_credential", "oauth", "oauth", "oauth", "manual_credential", "manual_credential"]
  );
  assert.equal(socialPublishingStatusLabel("paused"), "Paused");
  assert.equal(socialPublishingAuthStyleLabel("manual_credential"), "Manual credential contract pending");
  assert.equal(socialPublishingAuthStyleLabel("oauth"), "OAuth contract pending");
  assert.equal(socialPublishingActionLabel(), "Connector paused");
  assert.match(socialPublishingIntroCopy(), /readiness mode/i);
  assert.match(socialPublishingSafetyCopy(), /paused/i);

  const text = JSON.stringify(readiness);
  for (const forbidden of ["access_token", "refresh_token", "app_password", "admin_key", "external_url"]) {
    assert.equal(text.includes(forbidden), false, `${forbidden} should not appear in helper readback`);
  }
});

test("settings social page only reads readiness and exposes disabled controls", () => {
  const socialSettings = source("apps/web/app/settings/social/page.tsx");

  assert.match(socialSettings, /apiGet<SocialPublishingReadinessResponse>\("\/social\/readiness"/);
  assert.match(socialSettings, /disabled/);
  assert.match(socialSettings, /socialPublishingActionLabel/);
  assert.doesNotMatch(socialSettings, /apiPost|apiPatch|apiDelete/);
  assert.doesNotMatch(socialSettings, /\/social\/connections|\/social\/compose|\/social\/generate-teaser/);
  assert.doesNotMatch(socialSettings, /type="password"|accessToken|refreshToken|appPassword|adminApiKey|authUrl/);
  assert.doesNotMatch(socialSettings, />\s*(Connect|Disconnect|Save|Post)\s*</);
  assert.doesNotMatch(socialSettings, /window\.location|redirect|callbackUrl|externalUrl/);
});

test("public document owner page no longer exposes a live social posting composer", () => {
  const documentPage = source("apps/web/app/space/[slug]/documents/[documentId]/page.tsx");

  assert.match(documentPage, /Social connector readiness paused/);
  assert.doesNotMatch(documentPage, /PostComposer|showComposer|Signal Share to socials/);
  assert.doesNotMatch(documentPage, /\/social\/compose|\/social\/generate-teaser|\/social\/connections/);
});

test("social route source does not dispatch provider posting or queue work", () => {
  const routeSource = source("apps/api/src/routes/social.ts");

  assert.match(routeSource, /socialRouter\.get\("\/readiness"/);
  assert.match(routeSource, /social_connectors_paused/);
  assert.doesNotMatch(routeSource, /dispatchPost|social_posts|social_connections|fetch\(|new Queue|Worker\(|emitWebhook|billing/i);
  assert.doesNotMatch(routeSource, /access_token|refresh_token|app_password|application_password|admin_key/);
});

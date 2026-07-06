import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  SOCIAL_CONNECTOR_CREDENTIAL_KEY_ENV,
  SOCIAL_CONNECTOR_CREDENTIAL_SCHEMA,
  SOCIAL_CONNECTOR_PROVIDER_IDS,
  socialConnectorCredentialContract,
  socialConnectorCredentialReadback,
} from "./credential-contract";

const forbiddenFixtures = [
  "access-token-fixture",
  "refresh-token-fixture",
  "app-password-fixture",
  "oauth-code-fixture",
  "provider-account-fixture",
  "social-handle-fixture",
  "callback-value-fixture",
  "encrypted-payload-fixture",
  "env-value-fixture",
];

test("social connector credential contract is social-specific and Bluesky-only for PR500A", () => {
  const contract = socialConnectorCredentialContract();

  assert.deepEqual(SOCIAL_CONNECTOR_PROVIDER_IDS, ["bluesky"]);
  assert.equal(contract.purpose, "social_connector");
  assert.equal(contract.envelopeSchema, SOCIAL_CONNECTOR_CREDENTIAL_SCHEMA);
  assert.equal(contract.keyEnvironmentVariable, SOCIAL_CONNECTOR_CREDENTIAL_KEY_ENV);
  assert.deepEqual(contract.providers, [
    {
      id: "bluesky",
      label: "Bluesky",
      authStyle: "manual_credential",
      status: "storage_contract_only",
    },
  ]);
  assert.match(JSON.stringify(contract.secretHandlingRules), /Readback contains only provider, status, timestamp, and category metadata/);
  assert.match(JSON.stringify(contract.pausedRuntimeBoundary), /Active \/social routes remain PR476A readback-only/);
});

test("social connector credential readback returns metadata only", () => {
  const readback = socialConnectorCredentialReadback({
    provider: "bluesky",
    status: "active",
    category: "manual_credential",
    createdAt: "2026-07-06T11:00:00.000Z",
    updatedAt: "2026-07-06T11:05:00.000Z",
    rotatedAt: "2026-07-06T11:05:00.000Z",
    accessToken: "access-token-fixture",
    refreshToken: "refresh-token-fixture",
    appPassword: "app-password-fixture",
    oauthCode: "oauth-code-fixture",
    providerAccountId: "provider-account-fixture",
    handle: "social-handle-fixture",
    callbackValue: "callback-value-fixture",
    encryptedCredential: { ciphertext: "encrypted-payload-fixture" },
  });
  const rendered = JSON.stringify(readback);

  assert.deepEqual(Object.keys(readback).sort(), [
    "category",
    "configured",
    "createdAt",
    "provider",
    "providerLabel",
    "purpose",
    "revokedAt",
    "rotatedAt",
    "safety",
    "status",
    "updatedAt",
  ]);
  assert.equal(readback.provider, "bluesky");
  assert.equal(readback.purpose, "social_connector");
  assert.equal(readback.category, "manual_credential");
  assert.equal(readback.configured, true);
  assert.equal(readback.safety.secretValuesReturned, false);
  assert.equal(readback.safety.rawEncryptedPayloadReturned, false);
  assert.equal(readback.safety.oauthInThisSlice, false);
  assert.equal(readback.safety.providerLookupInThisSlice, false);
  assert.equal(readback.safety.postingInThisSlice, false);
  for (const fixture of forbiddenFixtures) {
    assert.equal(rendered.includes(fixture), false, `${fixture} leaked into social connector readback`);
  }
});

test("social connector contract source has no live route provider or storage execution", () => {
  const source = readFileSync("apps/api/src/services/social-connectors/credential-contract.ts", "utf8");

  assert.doesNotMatch(source, /fetch\s*\(|Router\(|express|\.from\s*\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(/i);
  assert.doesNotMatch(source, /social_connections|social_posts|dispatchPost|postTo|providerSdk|providerClient/i);
  assert.doesNotMatch(source, /oauthRedirect\s*\(|tokenExchange\s*\(|refreshToken\s*\(|callbackUrl\s*:|emitWebhook|new Queue|Worker\(|redis\.|cloudflare|stripe\.|billingClient/i);
  assert.doesNotMatch(source, /process\.env/i);
});

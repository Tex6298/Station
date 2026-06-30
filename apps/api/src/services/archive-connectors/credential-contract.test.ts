import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  ARCHIVE_CONNECTOR_PROVIDER_IDS,
  archiveConnectorCredentialContract,
  archiveConnectorCredentialReadback,
  type ArchiveConnectorCredentialState,
} from "./credential-contract";
import {
  archiveConnectorAccountScopeReadback,
  archiveConnectorSourceFamiliesForProvider,
  archiveConnectorSourceScopeContract,
} from "./source-scope-contract";

const states: ArchiveConnectorCredentialState[] = [
  "not_configured",
  "oauth_app_missing",
  "ready_for_oauth",
  "connected_redacted",
  "revoked",
  "blocked",
];

const forbiddenFixtures = [
  "access-token-fixture",
  "refresh-token-fixture",
  "oauth-code-fixture",
  "cookie-fixture",
  "credential-fixture",
  "external-account-fixture",
  "private-source-body-fixture",
  "archive-snippet-fixture",
  "provider-payload-fixture",
  "secret-shaped-fixture",
];

test("archive connector credential contract is provider-neutral for reddit and discord", () => {
  const contract = archiveConnectorCredentialContract();

  assert.deepEqual(ARCHIVE_CONNECTOR_PROVIDER_IDS, ["reddit", "discord"]);
  assert.deepEqual(contract.providers.map((provider) => [provider.id, provider.label, provider.authStyle]), [
    ["reddit", "Reddit", "oauth"],
    ["discord", "Discord", "oauth"],
  ]);
  assert.deepEqual(contract.credentialStates.map((row) => row.state), states);
  assert.equal(contract.purpose, "archive_connector");
  assert.match(contract.futureStorageExpectation, /dedicated encrypted connector credential schema/);
});

test("archive connector credential readback redacts tokens codes cookies and external account ids", () => {
  for (const providerId of ARCHIVE_CONNECTOR_PROVIDER_IDS) {
    const readback = archiveConnectorCredentialReadback({
      providerId,
      state: "connected_redacted",
      oauthAppConfigured: true,
      connectedAt: "2026-06-29T20:00:00.000Z",
      accountLabel: "private-source-body-fixture",
      rawExternalAccountId: "external-account-fixture",
      accessToken: "access-token-fixture",
      refreshToken: "refresh-token-fixture",
      oauthCode: "oauth-code-fixture",
      cookie: "cookie-fixture",
      credential: "credential-fixture",
    });
    const rendered = JSON.stringify(readback);

    assert.equal(readback.ownerOnly, true);
    assert.equal(readback.purpose, "archive_connector");
    assert.equal(readback.state, "connected_redacted");
    assert.equal(readback.safety.secretValuesReturned, false);
    assert.equal(readback.safety.rawExternalAccountIdsReturned, false);
    assert.equal(readback.safety.tokenExchangeInThisSlice, false);
    assert.equal(readback.safety.importWritesBeforeOwnerConfirmation, false);
    assert.equal(readback.accountReadback, `${readback.providerLabel} account connected; external account id redacted.`);
    for (const fixture of forbiddenFixtures) {
      assert.equal(rendered.includes(fixture), false, `${fixture} leaked for ${providerId}`);
    }
  }
});

test("archive connector credential states give safe owner next actions", () => {
  const readbacks = states.map((state) =>
    archiveConnectorCredentialReadback({
      providerId: "reddit",
      state,
      oauthAppConfigured: state === "ready_for_oauth" ? true : null,
      revokedAt: state === "revoked" ? "2026-06-29T21:00:00.000Z" : null,
      blockedReason: "secret-shaped-fixture should be hidden",
    })
  );

  assert.deepEqual(readbacks.map((row) => row.stateLabel), [
    "Not configured",
    "OAuth app missing",
    "Ready for OAuth",
    "Connected (redacted)",
    "Revoked",
    "Blocked",
  ]);
  assert.match(readbacks.find((row) => row.state === "ready_for_oauth")?.safeNextAction ?? "", /owner\/session-bound OAuth state/);
  assert.match(readbacks.find((row) => row.state === "revoked")?.safeNextAction ?? "", /fresh owner-bound OAuth setup/);
  assert.doesNotMatch(JSON.stringify(readbacks), /secret-shaped-fixture/);
});

test("archive connector contract documents OAuth state source inventory and import confirmation boundaries", () => {
  const contract = archiveConnectorCredentialContract();
  const rendered = JSON.stringify(contract);

  assert.match(rendered, /owner, active session, provider, and archive connector purpose/);
  assert.match(rendered, /one-time nonce/);
  assert.match(rendered, /csrf protection/);
  assert.match(rendered, /no provider redirect, callback handling, token exchange, refresh, or revocation/);
  assert.match(rendered, /safe metadata and counts only/);
  assert.match(rendered, /No archive source, import job, Memory, Canon, Continuity, public document, or review candidate/);
  assert.doesNotMatch(rendered, /access-token-fixture|refresh-token-fixture|oauth-code-fixture|provider-payload-fixture/);
});

test("archive connector source scope contract keeps connect-proof credentials scope-missing for inventory", () => {
  const reddit = archiveConnectorAccountScopeReadback({
    provider: "reddit",
    grantedScopes: ["identity"],
    accountLabel: "private-source-body-fixture",
    externalAccountFingerprintPresent: true,
    rawExternalAccountId: "external-account-fixture",
    providerUsername: "provider-username-fixture",
    providerPayload: { email: "owner@example.test" },
    encryptedCredential: { ciphertext: "credential-fixture" },
  });
  const discord = archiveConnectorAccountScopeReadback({
    provider: "discord",
    grantedScopes: ["identify"],
    accountLabel: "Discord archive account",
    externalAccountFingerprintPresent: false,
    rawExternalAccountId: "discord-snowflake-fixture",
    providerUsername: "discord-user-fixture",
    providerPayload: { global_name: "Provider Name" },
  });

  assert.equal(reddit.connectionScopeState, "account_proof_only");
  assert.equal(reddit.reconnectRequiredForSourceInventory, true);
  assert.equal(reddit.accountLabel, null);
  assert.equal(reddit.externalAccountFingerprintPresent, true);
  assert.equal(discord.connectionScopeState, "account_proof_only");
  assert.equal(discord.reconnectRequiredForSourceInventory, true);
  assert.equal(discord.accountLabel, "Discord archive account");
  assert.equal(discord.safety.tokenDecryptInThisSlice, false);
  assert.equal(discord.safety.providerLookupInThisSlice, false);

  const rendered = JSON.stringify([reddit, discord]);
  for (const fixture of [
    ...forbiddenFixtures,
    "provider-username-fixture",
    "discord-user-fixture",
    "discord-snowflake-fixture",
    "owner@example.test",
    "Provider Name",
    "ciphertext",
  ]) {
    assert.equal(rendered.includes(fixture), false, `${fixture} leaked into account scope readback`);
  }
});

test("archive connector source families require explicit Reddit and Discord inventory scopes", () => {
  const contract = archiveConnectorSourceScopeContract();
  const redditFamilies = archiveConnectorSourceFamiliesForProvider("reddit");
  const discordFamilies = archiveConnectorSourceFamiliesForProvider("discord");

  assert.deepEqual(contract.providers.map((provider) => [provider.id, provider.connectProofScope, provider.connectProofOnlyState]), [
    ["reddit", "identity", "scope_missing"],
    ["discord", "identify", "scope_missing"],
  ]);
  assert.deepEqual(
    redditFamilies.map((family) => [family.sourceFamily, family.state, family.requiredScopes]),
    [
      ["reddit_subreddit_memberships", "scope_missing", ["mysubreddits"]],
      ["reddit_user_history", "scope_missing", ["history"]],
      ["reddit_read", "deferred", ["read"]],
    ],
  );
  assert.deepEqual(
    discordFamilies.map((family) => [family.sourceFamily, family.state, family.requiredScopes]),
    [
      ["discord_guilds", "scope_missing", ["guilds"]],
      ["discord_channels", "deferred", []],
      ["discord_messages", "deferred", []],
      ["discord_dms", "unsupported", []],
      ["discord_bots_webhooks", "deferred", []],
    ],
  );
  assert.equal(discordFamilies.filter((family) => family.state === "scope_missing").length, 1);
  assert.equal(discordFamilies.find((family) => family.sourceFamily === "discord_guilds")?.requiredScopes[0], "guilds");
  assert.doesNotMatch(JSON.stringify(contract.sourceFamilies.map((family) => family.consentCopy)), /read your data/i);
  assert.match(JSON.stringify(redditFamilies), /subreddit memberships/);
  assert.match(JSON.stringify(redditFamilies), /saved, voted, submitted, and comment history/);
  assert.match(JSON.stringify(discordFamilies), /Discord servers/);
});

test("archive connector source scope contract exposes safe source matrix and no-import boundaries only", () => {
  const contract = archiveConnectorSourceScopeContract();
  const rendered = JSON.stringify(contract);

  for (const family of contract.sourceFamilies) {
    assert.equal(family.ownerOnly, true);
    assert.equal(family.purpose, "archive_connector");
    assert.equal(family.capabilities.sourceBodyReadback, false);
    assert.equal(family.capabilities.rawProviderIdsReturned, false);
    assert.equal(family.capabilities.providerPayloadReturned, false);
    assert.equal(family.capabilities.importWritesEnabled, false);
    assert.deepEqual(family.safeFields, [
      "provider",
      "sourceFamily",
      "label",
      "state",
      "requiredScopes",
      "ownerOnly",
      "purpose",
      "capabilities",
    ]);
  }

  assert.deepEqual(contract.accountMetadataPolicy.allowed, [
    "provider",
    "purpose",
    "safeAccountLabel",
    "externalAccountFingerprintPresent",
    "connectionScopeState",
    "reconnectRequiredForSourceInventory",
  ]);
  assert.equal(Object.values(contract.noImportBoundary).every((value) => value === false), true);
  assert.doesNotMatch(rendered, /post body|comment body|message body|dm body|private snippet|raw permalink|provider payload/i);
  assert.doesNotMatch(rendered, /archiveSourceWritesEnabled":true|importJobsEnabled":true|memoryWritesEnabled":true|canonWritesEnabled":true|continuityWritesEnabled":true/);
});

test("archive connector credential contract source has no live connector execution", () => {
  const source = readFileSync("apps/api/src/services/archive-connectors/credential-contract.ts", "utf8");

  assert.doesNotMatch(source, /fetch\s*\(|Router\(|express|\.from\s*\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(/i);
  assert.doesNotMatch(source, /createImportJob|import_jobs|memory_items|canon_items|continuity_candidates|documents\.insert/i);
  assert.doesNotMatch(source, /new Queue|Worker\(|queue\.|redis\.|cloudflare|stripe\.|billingClient|providerSdk/i);
  assert.doesNotMatch(source, /oauthRedirect\s*\(|tokenExchange\s*\(|refreshToken\(|revokeToken\(|clientSecret|REDDIT_CLIENT|DISCORD_CLIENT/i);
});

test("archive connector source scope contract source has no live provider or import execution", () => {
  const source = readFileSync("apps/api/src/services/archive-connectors/source-scope-contract.ts", "utf8");

  assert.doesNotMatch(source, /fetch\s*\(|Router\(|express|\.from\s*\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(/i);
  assert.doesNotMatch(source, /createDecipheriv|decipher|decryptArchiveConnector|decryptedToken|providerSdk|providerClient/i);
  assert.doesNotMatch(source, /createImportJob|archive_sources|import_jobs|memory_items|canon_items|continuity_candidates|documents\.insert/i);
  assert.doesNotMatch(source, /new Queue|Worker\(|queue\.|redis\.|cloudflare|stripe\.|billingClient|marketplace|socialRouter/i);
  assert.doesNotMatch(source, /process\.env|REDDIT_CLIENT|DISCORD_CLIENT|clientSecret/i);
});

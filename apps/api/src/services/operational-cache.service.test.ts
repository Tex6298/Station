import assert from "node:assert/strict";
import test from "node:test";
import {
  DisabledOperationalCacheProvider,
  OPERATIONAL_CACHE_TTLS,
  cacheInvalidationKeysForChange,
  getOperationalCacheJson,
  invalidateOperationalCacheForChange,
  operationalCacheKey,
  resetOperationalCacheProviderForTests,
  setOperationalCacheJson,
  setOperationalCacheProviderForTests,
  shouldBypassOperationalCacheForChange,
  type OperationalCacheProvider,
} from "./operational-cache.service";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL ??= "http://localhost";
process.env.SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-key";

test("operational cache keys include environment and owner/persona or Developer Space scope", () => {
  const personaKey = operationalCacheKey({
    purpose: "runtime_context",
    envName: "staging replay",
    scope: {
      ownerUserId: "owner:alpha",
      personaId: "persona/harbor",
    },
  });

  assert.equal(
    personaKey,
    "station:staging_replay:runtime_context:owner:owner_alpha:persona:persona_harbor:developer-space:none:resource:none:operation:none"
  );

  const developerSpaceKey = operationalCacheKey({
    purpose: "queue_state",
    envName: "production",
    scope: {
      ownerUserId: "owner-alpha",
      developerSpaceId: "dev-space:animus",
      operation: "ingestion",
    },
  });

  assert.match(developerSpaceKey, /^station:production:queue_state:/);
  assert.match(developerSpaceKey, /owner:owner-alpha/);
  assert.match(developerSpaceKey, /developer-space:dev-space_animus/);
  assert.match(developerSpaceKey, /operation:ingestion/);
});

test("operational cache stays disabled safely when no provider is configured", async () => {
  setOperationalCacheProviderForTests(new DisabledOperationalCacheProvider("missing_config"));

  try {
    const written = await setOperationalCacheJson({
      purpose: "runtime_context",
      scope: { ownerUserId: "owner-a", personaId: "persona-a" },
      value: { prompt: "not written" },
      ttlSeconds: 0,
    });
    assert.equal(written.enabled, false);
    assert.equal(written.ttlSeconds, 1);
    assert.equal(written.skippedReason, "missing_config");

    const read = await getOperationalCacheJson({
      purpose: "runtime_context",
      scope: { ownerUserId: "owner-a", personaId: "persona-a" },
    });
    assert.equal(read.enabled, false);
    assert.equal(read.value, null);
  } finally {
    resetOperationalCacheProviderForTests();
  }
});

test("operational cache TTLs and keys prevent cross-owner reads", async () => {
  const provider = new RecordingOperationalCacheProvider();
  setOperationalCacheProviderForTests(provider);

  try {
    const ownerA = { ownerUserId: "owner-a", personaId: "persona-a" };
    const ownerB = { ownerUserId: "owner-b", personaId: "persona-a" };

    const written = await setOperationalCacheJson({
      purpose: "runtime_context",
      scope: ownerA,
      value: { context: "owner A private context" },
    });

    assert.equal(written.enabled, true);
    assert.equal(provider.ttls.get(written.key), OPERATIONAL_CACHE_TTLS.runtime_context);

    const sameOwner = await getOperationalCacheJson<{ context: string }>({
      purpose: "runtime_context",
      scope: ownerA,
    });
    assert.equal(sameOwner.value?.context, "owner A private context");

    const otherOwner = await getOperationalCacheJson<{ context: string }>({
      purpose: "runtime_context",
      scope: ownerB,
    });
    assert.equal(otherOwner.value, null);
    assert.notEqual(
      operationalCacheKey({ purpose: "runtime_context", scope: ownerA }),
      operationalCacheKey({ purpose: "runtime_context", scope: ownerB })
    );
  } finally {
    resetOperationalCacheProviderForTests();
  }
});

test("operational cache invalidation covers memory, persona, archive, and Developer Space paths", async () => {
  const provider = new RecordingOperationalCacheProvider();
  setOperationalCacheProviderForTests(provider);

  try {
    const memoryChange = {
      type: "memory" as const,
      ownerUserId: "owner-a",
      personaId: "persona-a",
      resourceId: "memory-a",
    };
    const archiveChange = {
      type: "archive_import" as const,
      ownerUserId: "owner-a",
      personaId: "persona-a",
      resourceId: "import-a",
    };
    const personaChange = {
      type: "persona" as const,
      ownerUserId: "owner-a",
      personaId: "persona-a",
      resourceId: "persona-a",
    };
    const developerSpaceChange = {
      type: "developer_space" as const,
      ownerUserId: "owner-a",
      developerSpaceId: "developer-space-a",
      resourceId: "event-a",
    };

    for (const change of [memoryChange, archiveChange, personaChange, developerSpaceChange]) {
      assert.equal(shouldBypassOperationalCacheForChange(change), true);
      const keys = cacheInvalidationKeysForChange(change);
      assert.equal(keys.every((key) => key.includes("station:test:")), true);
      assert.equal(keys.every((key) => key.includes("owner:owner-a")), true);
    }

    const deleted = await invalidateOperationalCacheForChange(memoryChange);
    assert.equal(deleted.enabled, true);
    assert.equal(deleted.keys.some((key) => key.includes("runtime_context")), true);
    assert.deepEqual(provider.deletedKeys, deleted.keys);

    const developerKeys = cacheInvalidationKeysForChange(developerSpaceChange);
    assert.equal(developerKeys.some((key) => key.includes("developer-space:developer-space-a")), true);
    assert.equal(developerKeys.some((key) => key.includes("queue_state")), true);
  } finally {
    resetOperationalCacheProviderForTests();
  }
});

class RecordingOperationalCacheProvider implements OperationalCacheProvider {
  readonly enabled = true;
  readonly kind = "test" as const;
  readonly values = new Map<string, unknown>();
  readonly ttls = new Map<string, number>();
  deletedKeys: string[] = [];

  async getJson<T>(key: string): Promise<T | null> {
    return this.values.has(key) ? this.values.get(key) as T : null;
  }

  async setJson(key: string, value: unknown, ttlSeconds: number) {
    this.values.set(key, value);
    this.ttls.set(key, ttlSeconds);
  }

  async deleteKeys(keys: string[]) {
    this.deletedKeys = [...keys];
    for (const key of keys) this.values.delete(key);
    return keys.length;
  }
}

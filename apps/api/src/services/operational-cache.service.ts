export type OperationalCachePurpose =
  | "runtime_context"
  | "idempotency"
  | "rate_limit"
  | "queue_state";

export type OperationalCacheChangeType =
  | "archive_import"
  | "memory"
  | "canon"
  | "continuity"
  | "persona"
  | "visibility"
  | "developer_space";

export type OperationalCacheScope = {
  ownerUserId?: string | null;
  personaId?: string | null;
  developerSpaceId?: string | null;
  resourceId?: string | null;
  operation?: string | null;
};

export type OperationalCacheChange = OperationalCacheScope & {
  type: OperationalCacheChangeType;
};

export type OperationalCacheSetOptions = {
  purpose: OperationalCachePurpose;
  scope: OperationalCacheScope;
  value: unknown;
  ttlSeconds?: number;
  parts?: string[];
};

export type OperationalCacheGetOptions = {
  purpose: OperationalCachePurpose;
  scope: OperationalCacheScope;
  parts?: string[];
};

export type OperationalCacheProvider = {
  readonly enabled: boolean;
  readonly kind: "disabled" | "upstash_rest" | "test";
  readonly disabledReason?: string;
  getJson<T>(key: string): Promise<T | null>;
  setJson(key: string, value: unknown, ttlSeconds: number): Promise<void>;
  deleteKeys(keys: string[]): Promise<number>;
};

export const OPERATIONAL_CACHE_TTLS: Record<OperationalCachePurpose, number> = {
  runtime_context: 5 * 60,
  idempotency: 24 * 60 * 60,
  rate_limit: 60,
  queue_state: 15 * 60,
};

let providerForTests: OperationalCacheProvider | null | undefined;

export function setOperationalCacheProviderForTests(provider: OperationalCacheProvider | null) {
  providerForTests = provider;
}

export function resetOperationalCacheProviderForTests() {
  providerForTests = undefined;
}

export function currentCacheEnvironment() {
  return component(
    process.env.STATION_ENV
      || process.env.RAILWAY_ENVIRONMENT_NAME
      || process.env.NODE_ENV
      || "development"
  );
}

export function operationalCacheKey(input: {
  purpose: OperationalCachePurpose;
  scope: OperationalCacheScope;
  parts?: string[];
  envName?: string;
}) {
  const scope = input.scope;
  const segments = [
    "station",
    component(input.envName ?? currentCacheEnvironment()),
    input.purpose,
    "owner",
    component(scope.ownerUserId ?? "none"),
    "persona",
    component(scope.personaId ?? "none"),
    "developer-space",
    component(scope.developerSpaceId ?? "none"),
    "resource",
    component(scope.resourceId ?? "none"),
    "operation",
    component(scope.operation ?? "none"),
    ...(input.parts ?? []).map(component),
  ];
  return segments.join(":");
}

export async function getOperationalCacheJson<T>(input: OperationalCacheGetOptions) {
  const provider = getOperationalCacheProvider();
  const key = operationalCacheKey(input);
  if (!provider.enabled) {
    return {
      enabled: false,
      key,
      value: null as T | null,
      skippedReason: provider.disabledReason ?? "disabled",
    };
  }
  return {
    enabled: true,
    key,
    value: await provider.getJson<T>(key),
  };
}

export async function setOperationalCacheJson(input: OperationalCacheSetOptions) {
  const provider = getOperationalCacheProvider();
  const key = operationalCacheKey(input);
  const ttlSeconds = clampTtl(input.ttlSeconds ?? OPERATIONAL_CACHE_TTLS[input.purpose]);
  if (!provider.enabled) {
    return {
      enabled: false,
      key,
      ttlSeconds,
      skippedReason: provider.disabledReason ?? "disabled",
    };
  }
  await provider.setJson(key, input.value, ttlSeconds);
  return { enabled: true, key, ttlSeconds };
}

export async function invalidateOperationalCacheForChange(change: OperationalCacheChange) {
  const provider = getOperationalCacheProvider();
  const keys = cacheInvalidationKeysForChange(change);
  if (!provider.enabled) {
    return {
      enabled: false,
      keys,
      deleted: 0,
      skippedReason: provider.disabledReason ?? "disabled",
    };
  }
  return {
    enabled: true,
    keys,
    deleted: await provider.deleteKeys(keys),
  };
}

export function cacheInvalidationKeysForChange(change: OperationalCacheChange) {
  const keys = new Set<string>();
  const baseScope: OperationalCacheScope = {
    ownerUserId: change.ownerUserId,
    personaId: change.personaId,
    developerSpaceId: change.developerSpaceId,
  };

  if (change.ownerUserId || change.personaId || change.developerSpaceId) {
    keys.add(operationalCacheKey({ purpose: "runtime_context", scope: baseScope }));
  }

  if (change.personaId) {
    keys.add(operationalCacheKey({
      purpose: "queue_state",
      scope: { ...baseScope, operation: change.type },
    }));
  }

  if (change.type === "archive_import" || change.type === "memory" || change.type === "canon") {
    keys.add(operationalCacheKey({
      purpose: "runtime_context",
      scope: { ...baseScope, operation: "persona_context" },
    }));
  }

  if (change.type === "continuity" || change.type === "persona" || change.type === "visibility") {
    keys.add(operationalCacheKey({
      purpose: "idempotency",
      scope: { ...baseScope, resourceId: change.resourceId ?? null, operation: change.type },
    }));
  }

  if (change.developerSpaceId) {
    keys.add(operationalCacheKey({
      purpose: "queue_state",
      scope: { ...baseScope, operation: "developer_space" },
    }));
  }

  return [...keys];
}

export function shouldBypassOperationalCacheForChange(change: OperationalCacheChange) {
  return cacheInvalidationKeysForChange(change).length > 0;
}

export function operationalCacheStatus() {
  const provider = getOperationalCacheProvider();
  return {
    enabled: provider.enabled,
    kind: provider.kind,
    disabledReason: provider.disabledReason,
    environment: currentCacheEnvironment(),
  };
}

export function getOperationalCacheProvider(): OperationalCacheProvider {
  if (providerForTests !== undefined) {
    return providerForTests ?? new DisabledOperationalCacheProvider("test_disabled");
  }

  const upstashUrl = value(process.env.UPSTASH_REDIS_REST_URL);
  const upstashToken = value(process.env.UPSTASH_REDIS_REST_TOKEN);
  if (upstashUrl && upstashToken) return new UpstashRestOperationalCacheProvider(upstashUrl, upstashToken);

  if (value(process.env.REDIS_URL) || value(process.env.REDIS_PRIVATE_URL) || value(process.env.VALKEY_URL)) {
    return new DisabledOperationalCacheProvider("tcp_redis_configured_without_client");
  }

  return new DisabledOperationalCacheProvider("missing_config");
}

export class DisabledOperationalCacheProvider implements OperationalCacheProvider {
  readonly enabled = false;
  readonly kind = "disabled" as const;

  constructor(readonly disabledReason = "disabled") {}

  async getJson<T>(): Promise<T | null> {
    return null;
  }

  async setJson() {
    return undefined;
  }

  async deleteKeys() {
    return 0;
  }
}

class UpstashRestOperationalCacheProvider implements OperationalCacheProvider {
  readonly enabled = true;
  readonly kind = "upstash_rest" as const;

  constructor(private readonly url: string, private readonly token: string) {}

  async getJson<T>(key: string): Promise<T | null> {
    const result = await this.command<string | null>(["GET", key]);
    if (!result) return null;
    try {
      return JSON.parse(result) as T;
    } catch {
      return null;
    }
  }

  async setJson(key: string, value: unknown, ttlSeconds: number) {
    await this.command(["SET", key, JSON.stringify(value), "EX", ttlSeconds]);
  }

  async deleteKeys(keys: string[]) {
    if (keys.length === 0) return 0;
    const result = await this.command<number>(["DEL", ...keys]);
    return Number(result ?? 0);
  }

  private async command<T>(command: unknown[]): Promise<T | null> {
    const response = await fetch(this.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });
    if (!response.ok) throw new Error(`Operational cache command failed: ${response.status}`);
    const body = await response.json() as { result?: T };
    return body.result ?? null;
  }
}

function value(input: string | undefined | null) {
  const trimmed = input?.trim();
  return trimmed ? trimmed : null;
}

function component(input: unknown) {
  const raw = String(input ?? "none").trim() || "none";
  return raw.replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 120) || "none";
}

function clampTtl(ttlSeconds: number) {
  if (!Number.isFinite(ttlSeconds)) return OPERATIONAL_CACHE_TTLS.runtime_context;
  return Math.max(1, Math.min(7 * 24 * 60 * 60, Math.floor(ttlSeconds)));
}

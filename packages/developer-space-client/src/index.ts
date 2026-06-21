import {
  agentsObserveHookEventFixture,
  transformAgentsObserveHookEvent,
  type AgentsObserveHookEventFixture,
} from "./agents-observe";

export type DeveloperSpaceTopologyType = "radial" | "branching" | "lattice" | "custom";
export type DeveloperSpaceEventVisibility = "private" | "community" | "public";
export type DeveloperSpaceEventProvenance = "api" | "imported" | "user" | "system" | "ai_generated";
export type DeveloperSpaceObservedRuntimeFieldVisibility = "public" | "member" | "owner" | "private" | "secret";
export type DeveloperSpaceObservedRuntimeContextType = "zone" | "resource" | "edge" | "provenance";

export * from "./agents-observe";

export interface DeveloperSpaceClientOptions {
  baseUrl: string;
  apiKey: string;
  fetch?: typeof fetch;
  headers?: Record<string, string>;
}

export interface DeveloperSpaceNodeStatePayload {
  nodeName?: string;
  topologyType?: DeveloperSpaceTopologyType;
  fragmentCount?: number;
  selfSimilarityScore?: number | null;
  dimensionality?: number | null;
  metrics?: Record<string, unknown>;
  fieldClassifications?: Record<string, DeveloperSpaceObservedRuntimeFieldVisibility>;
  sourceRefs?: string[];
  provenance?: DeveloperSpaceEventProvenance;
}

export interface DeveloperSpaceEventPayload {
  eventType: string;
  eventLabel?: string;
  nodeId?: string;
  eventData?: Record<string, unknown>;
  fieldClassifications?: Record<string, DeveloperSpaceObservedRuntimeFieldVisibility>;
  similarityScore?: number | null;
  sourceRefs?: string[];
  provenance?: DeveloperSpaceEventProvenance;
  visibility?: DeveloperSpaceEventVisibility;
  occurredAt?: string;
}

export interface DeveloperSpaceSnapshotPayload {
  snapshotData: Record<string, unknown>;
  fieldClassifications?: Record<string, DeveloperSpaceObservedRuntimeFieldVisibility>;
  sourceRefs?: string[];
  provenance?: DeveloperSpaceEventProvenance;
  visibility?: DeveloperSpaceEventVisibility;
  occurredAt?: string;
}

export interface DeveloperSpaceObservedRuntimeContextPayload {
  contextType: DeveloperSpaceObservedRuntimeContextType;
  externalId?: string;
  sourceRef?: string;
  payload: Record<string, unknown>;
  fieldClassifications?: Record<string, DeveloperSpaceObservedRuntimeFieldVisibility>;
  provenance?: DeveloperSpaceEventProvenance;
  occurredAt?: string;
}

export interface DeveloperSpaceBatchImportPayload {
  nodes?: Array<DeveloperSpaceNodeStatePayload & { nodeId: string }>;
  events?: DeveloperSpaceEventPayload[];
  snapshots?: DeveloperSpaceSnapshotPayload[];
  supportingContext?: DeveloperSpaceObservedRuntimeContextPayload[];
}

export interface DeveloperSpaceObservedRuntimeWebhookEnvelope {
  schema: "station.observed_runtime.webhook.v1";
  deliveryId?: string;
  source: {
    runtimeHostedBy: "external";
    stationRole: "observer";
    id?: string;
    [key: string]: unknown;
  };
  observedAt: string;
  payload: DeveloperSpaceBatchImportPayload;
}

export interface DeveloperSpaceObservedRuntimeWebhookInput {
  payload: DeveloperSpaceBatchImportPayload;
  deliveryId?: string;
  observedAt?: string;
  source?: Partial<DeveloperSpaceObservedRuntimeWebhookEnvelope["source"]>;
}

export interface DeveloperSpaceObservedRuntimeWebhookRequest {
  body: string;
  headers: {
    "Content-Type": "application/json";
    "X-Station-Signature": string;
    "X-Station-Webhook-Id": string;
  };
  envelope: DeveloperSpaceObservedRuntimeWebhookEnvelope;
}

export interface DeveloperSpaceObservedRuntimeWebhookSendOptions extends DeveloperSpaceObservedRuntimeWebhookInput {
  signingSecret?: string;
  webhookId?: string;
  timestamp?: number;
}

export interface AgentsObserveOfflineDryRunOptions {
  fixture?: AgentsObserveHookEventFixture;
  fixtureSource?: "default-fixture" | "provided-file";
  includeSignedRequest?: boolean;
  timestamp?: number;
  liveSend?: AgentsObserveLiveSendOptions;
}

export interface AgentsObserveLiveSendOptions {
  enabled: boolean;
  apiUrl?: string;
  developerKey?: string;
  webhookId?: string;
  signingSecret?: string;
  transport?: AgentsObserveLiveSendTransport;
}

export interface AgentsObserveLiveSendTransportRequest {
  url: string;
  method: "POST";
  headers: Record<string, string>;
  body: string;
}

export interface AgentsObserveLiveSendTransportResponse {
  status: number;
  ok: boolean;
  body?: unknown;
}

export type AgentsObserveLiveSendTransport = (
  request: AgentsObserveLiveSendTransportRequest,
) => Promise<AgentsObserveLiveSendTransportResponse>;

export type AgentsObserveLiveSendSummary =
  | {
      enabled: false;
      attempted: false;
      status: "not_requested";
    }
  | {
      enabled: true;
      attempted: false;
      status: "blocked";
      reason: "missing_config" | "placeholder_config" | "invalid_config";
      missingEnvNames?: string[];
      rejectedEnvNames?: string[];
      invalidEnvNames?: string[];
    }
  | {
      enabled: true;
      attempted: true;
      status: "sent";
      request: {
        targetApiClass: "local" | "https" | "http" | "unknown";
        webhookId: string;
        signatureHeader: string;
        bodyByteLength: number;
      };
      response: {
        status: number;
        ok: boolean;
        class: "accepted" | "replayed" | "validation_or_conflict" | "auth" | "server" | "unknown";
      };
    }
  | {
      enabled: true;
      attempted: true;
      status: "failed";
      reason: "transport_error";
      message: string;
    };

export interface AgentsObserveLiveConfigValidation {
  ok: boolean;
  missingEnvNames: string[];
  rejectedEnvNames: string[];
  invalidEnvNames: string[];
}

export interface AgentsObserveOfflineDryRunSummary {
  status: "not_sent";
  source: "agents-observe";
  fixtureSource: "default-fixture" | "provided-file";
  liveConfigRequired: false;
  networkAccessRequired: false;
  payloadSummary: {
    nodes: number;
    events: number;
    snapshots: number;
    supportingContext: number;
    eventTypes: string[];
    publicEventDataKeys: string[];
    provenanceRefs: string[];
  };
  classificationCounts: Record<DeveloperSpaceObservedRuntimeFieldVisibility, number>;
  privacyAssertions: {
    noRawPrompt: true;
    noCommandBody: true;
    noFilePaths: true;
    noToolPayload: true;
    noTerminalOutput: true;
    noTokenValue: true;
    noRawSourceIds: true;
    noLiveSecrets: true;
  };
  signedRequest?: {
    built: true;
    status: "not_sent";
    schema: "station.observed_runtime.webhook.v1";
    demoWebhookId: string;
    signatureHeader: string;
    bodyByteLength: number;
  };
  liveSend: AgentsObserveLiveSendSummary;
}

export type DeveloperSpaceClientErrorCategory =
  | "auth"
  | "validation"
  | "quota"
  | "rate_limit"
  | "server"
  | "unknown";

export interface DeveloperSpaceErrorBody {
  error?: string;
  code?: string;
  category?: DeveloperSpaceClientErrorCategory;
  resource?: string;
  limit?: number;
  used?: number;
  retryAfter?: number;
  details?: unknown;
}

export class DeveloperSpaceClientError extends Error {
  readonly status: number;
  readonly body: unknown;
  readonly code: string;
  readonly category: DeveloperSpaceClientErrorCategory;
  readonly resource?: string;
  readonly retryAfter?: number;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "DeveloperSpaceClientError";
    this.status = status;
    this.body = body;
    const structured = isStructuredErrorBody(body) ? body : {};
    this.category = normaliseErrorCategory(status, structured);
    this.code = typeof structured.code === "string" && structured.code.length > 0
      ? structured.code
      : this.category;
    this.resource = typeof structured.resource === "string" ? structured.resource : undefined;
    this.retryAfter = typeof structured.retryAfter === "number" ? structured.retryAfter : undefined;
  }
}

export class DeveloperSpaceClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;
  private readonly headers: Record<string, string>;

  constructor(options: DeveloperSpaceClientOptions) {
    const baseUrl = options.baseUrl.trim();
    const apiKey = options.apiKey.trim();
    if (!baseUrl) throw new Error("DeveloperSpaceClient requires baseUrl.");
    if (!apiKey) throw new Error("DeveloperSpaceClient requires apiKey.");
    const fetchImpl = options.fetch ?? globalThis.fetch;
    if (!fetchImpl) throw new Error("DeveloperSpaceClient requires a fetch implementation.");

    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.apiKey = apiKey;
    this.fetchImpl = fetchImpl;
    this.headers = options.headers ?? {};
  }

  upsertNodeState(nodeId: string, payload: DeveloperSpaceNodeStatePayload) {
    if (!nodeId) throw new Error("nodeId is required.");
    return this.post(`/developer-spaces/ingest/nodes/${encodeURIComponent(nodeId)}/state`, payload);
  }

  recordEvent(payload: DeveloperSpaceEventPayload) {
    return this.post("/developer-spaces/ingest/events", payload);
  }

  recordSnapshot(payload: DeveloperSpaceSnapshotPayload) {
    return this.post("/developer-spaces/ingest/snapshots", payload);
  }

  importBatch(payload: DeveloperSpaceBatchImportPayload) {
    return this.post("/developer-spaces/ingest/import", payload);
  }

  async sendObservedRuntimeWebhook<T = unknown>(options: DeveloperSpaceObservedRuntimeWebhookSendOptions): Promise<T> {
    const request = await createObservedRuntimeWebhookRequest({
      ...options,
      signingSecret: options.signingSecret ?? this.apiKey,
    });
    return this.postRaw("/developer-spaces/ingest/observed-runtime", request.body, request.headers);
  }

  private async post<T = unknown>(path: string, payload: unknown): Promise<T> {
    return this.postRaw(path, JSON.stringify(payload ?? {}), {
      "Content-Type": "application/json",
    });
  }

  private async postRaw<T = unknown>(path: string, bodyText: string, headers: Record<string, string>): Promise<T> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        ...this.headers,
        ...headers,
        "X-Station-Developer-Key": this.apiKey,
      },
      body: bodyText,
    });

    const text = await response.text();
    const body = text ? safeJson(text) : null;
    if (!response.ok) {
      const structured = isStructuredErrorBody(body) ? body : null;
      const message = typeof structured?.error === "string"
        ? structured.error
        : `Developer Space request failed with ${response.status}.`;
      throw new DeveloperSpaceClientError(message, response.status, body);
    }

    return body as T;
  }
}

export function createDeveloperSpaceClient(options: DeveloperSpaceClientOptions) {
  return new DeveloperSpaceClient(options);
}

export function createObservedRuntimeWebhookEnvelope(
  input: DeveloperSpaceObservedRuntimeWebhookInput
): DeveloperSpaceObservedRuntimeWebhookEnvelope {
  return {
    schema: "station.observed_runtime.webhook.v1",
    deliveryId: input.deliveryId,
    source: {
      ...input.source,
      runtimeHostedBy: "external",
      stationRole: "observer",
    },
    observedAt: input.observedAt ?? new Date().toISOString(),
    payload: input.payload,
  };
}

export async function signObservedRuntimeWebhookBody(input: {
  rawBody: string;
  signingSecret: string;
  timestamp?: number;
}) {
  const signingSecret = input.signingSecret.trim();
  if (!signingSecret) throw new Error("signingSecret is required.");
  const timestamp = input.timestamp ?? Math.floor(Date.now() / 1000);
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto is required to sign observed-runtime webhooks.");
  }
  const encoder = new TextEncoder();
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(signingSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBytes = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${timestamp}.${input.rawBody}`),
  );
  const signature = bytesToHex(new Uint8Array(signatureBytes));
  return `t=${timestamp},v1=${signature}`;
}

export async function createObservedRuntimeWebhookRequest(input: DeveloperSpaceObservedRuntimeWebhookSendOptions & {
  signingSecret: string;
}): Promise<DeveloperSpaceObservedRuntimeWebhookRequest> {
  const deliveryId = (input.webhookId ?? input.deliveryId)?.trim();
  if (!deliveryId) throw new Error("deliveryId or webhookId is required.");
  const envelopeDeliveryId = input.deliveryId?.trim() || deliveryId;
  const envelope = createObservedRuntimeWebhookEnvelope({
    payload: input.payload,
    deliveryId: envelopeDeliveryId,
    observedAt: input.observedAt,
    source: input.source,
  });
  const body = JSON.stringify(envelope);
  return {
    body,
    envelope,
    headers: {
      "Content-Type": "application/json",
      "X-Station-Signature": await signObservedRuntimeWebhookBody({
        rawBody: body,
        signingSecret: input.signingSecret,
        timestamp: input.timestamp,
      }),
      "X-Station-Webhook-Id": deliveryId,
    },
  };
}

export async function createAgentsObserveOfflineDryRunSummary(
  options: AgentsObserveOfflineDryRunOptions = {},
): Promise<AgentsObserveOfflineDryRunSummary> {
  const fixture = options.fixture ?? agentsObserveHookEventFixture;
  const payload = transformAgentsObserveHookEvent(fixture);
  const classificationCounts = countClassifications(payload);
  const summary: AgentsObserveOfflineDryRunSummary = {
    status: "not_sent",
    source: "agents-observe",
    fixtureSource: options.fixtureSource ?? (options.fixture ? "provided-file" : "default-fixture"),
    liveConfigRequired: false,
    networkAccessRequired: false,
    payloadSummary: {
      nodes: payload.nodes?.length ?? 0,
      events: payload.events?.length ?? 0,
      snapshots: payload.snapshots?.length ?? 0,
      supportingContext: payload.supportingContext?.length ?? 0,
      eventTypes: payload.events?.map((event) => event.eventType) ?? [],
      publicEventDataKeys: Object.keys(payload.events?.[0]?.eventData ?? {}),
      provenanceRefs: Array.from(new Set([
        ...(payload.nodes?.flatMap((node) => node.sourceRefs ?? []) ?? []),
        ...(payload.events?.flatMap((event) => event.sourceRefs ?? []) ?? []),
        ...(payload.snapshots?.flatMap((snapshot) => snapshot.sourceRefs ?? []) ?? []),
        ...(payload.supportingContext?.map((context) => context.sourceRef).filter(isString) ?? []),
      ])).sort(),
    },
    classificationCounts,
    privacyAssertions: passingPrivacyAssertions(),
    liveSend: {
      enabled: false,
      attempted: false,
      status: "not_requested",
    },
  };

  if (options.includeSignedRequest) {
    const request = await createObservedRuntimeWebhookRequest({
      deliveryId: "demo-agents-observe-dry-run",
      signingSecret: "demo-agents-observe-dry-run-signing-material",
      timestamp: options.timestamp ?? 1_771_452_800,
      observedAt: fixture.observedAt,
      source: {
        id: "agents-observe-offline-dry-run",
      },
      payload,
    });
    const timestamp = request.headers["X-Station-Signature"].match(/^t=([^,]+)/)?.[1] ?? "redacted";
    summary.signedRequest = {
      built: true,
      status: "not_sent",
      schema: request.envelope.schema,
      demoWebhookId: request.headers["X-Station-Webhook-Id"],
      signatureHeader: `t=${timestamp},v1=<redacted>`,
      bodyByteLength: new TextEncoder().encode(request.body).byteLength,
    };
  }

  summary.privacyAssertions = assertAgentsObserveDryRunPrivacy(JSON.stringify(summary), fixture);
  if (options.liveSend?.enabled) {
    summary.liveSend = await maybeSendAgentsObserveLive({
      liveSend: options.liveSend,
      fixture,
      payload,
      summary,
      timestamp: options.timestamp,
    });
    summary.privacyAssertions = assertAgentsObserveDryRunPrivacy(JSON.stringify(summary), fixture);
  }
  return summary;
}

type ForbiddenFixtureValue = {
  label: string;
  value?: string;
};

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function assertAgentsObserveDryRunPrivacy(
  serializedOutput: string,
  fixture: AgentsObserveHookEventFixture,
): AgentsObserveOfflineDryRunSummary["privacyAssertions"] {
  const forbidden: ForbiddenFixtureValue[] = [
    { label: "sessionId", value: fixture.sessionId },
    { label: "eventId", value: fixture.eventId },
    { label: "agent.id", value: fixture.agent.id },
    { label: "rawPrompt", value: fixture.raw.prompt },
    { label: "commandBody", value: fixture.raw.commandBody },
    { label: "terminalOutput", value: fixture.raw.terminalOutput },
    { label: "tokenValue", value: fixture.raw.tokenValue },
    ...(fixture.filesTouched ?? []).map((value, index) => ({ label: `filesTouched[${index}]`, value })),
    ...Object.entries(fixture.raw.toolPayload ?? {}).map(([key, value]) => ({
      label: `toolPayload.${key}`,
      value: typeof value === "string" ? value : JSON.stringify(value),
    })),
  ];
  for (const { label, value } of forbidden) {
    if (value && serializedOutput.includes(value)) {
      throw new Error(`Agents Observe dry run would expose ${label}.`);
    }
  }
  return passingPrivacyAssertions();
}

function passingPrivacyAssertions(): AgentsObserveOfflineDryRunSummary["privacyAssertions"] {
  return {
    noRawPrompt: true,
    noCommandBody: true,
    noFilePaths: true,
    noToolPayload: true,
    noTerminalOutput: true,
    noTokenValue: true,
    noRawSourceIds: true,
    noLiveSecrets: true,
  };
}

async function maybeSendAgentsObserveLive(input: {
  liveSend: AgentsObserveLiveSendOptions;
  fixture: AgentsObserveHookEventFixture;
  payload: DeveloperSpaceBatchImportPayload;
  summary: AgentsObserveOfflineDryRunSummary;
  timestamp?: number;
}): Promise<AgentsObserveLiveSendSummary> {
  const validation = validateAgentsObserveLiveConfig(input.liveSend);
  if (!validation.ok) {
    return {
      enabled: true,
      attempted: false,
      status: "blocked",
      reason: liveConfigBlockReason(validation),
      missingEnvNames: validation.missingEnvNames.length > 0 ? validation.missingEnvNames : undefined,
      rejectedEnvNames: validation.rejectedEnvNames.length > 0 ? validation.rejectedEnvNames : undefined,
      invalidEnvNames: validation.invalidEnvNames.length > 0 ? validation.invalidEnvNames : undefined,
    };
  }

  const apiUrl = input.liveSend.apiUrl!.trim().replace(/\/+$/, "");
  const developerKey = input.liveSend.developerKey!.trim();
  const webhookId = input.liveSend.webhookId!.trim();
  const signingSecret = input.liveSend.signingSecret?.trim() || developerKey;
  const request = await createObservedRuntimeWebhookRequest({
    deliveryId: "agents-observe-live-send-guard",
    webhookId,
    signingSecret,
    timestamp: input.timestamp ?? 1_771_452_800,
    observedAt: input.fixture.observedAt,
    source: {
      id: "agents-observe-live-send-guard",
    },
    payload: input.payload,
  });
  const transportRequest: AgentsObserveLiveSendTransportRequest = {
    url: `${apiUrl}/developer-spaces/ingest/observed-runtime`,
    method: "POST",
    headers: {
      ...request.headers,
      "X-Station-Developer-Key": developerKey,
    },
    body: request.body,
  };

  assertAgentsObserveDryRunPrivacy(JSON.stringify({
    ...input.summary,
    liveSend: {
      enabled: true,
      attempted: true,
      status: "sent",
      request: {
        targetApiClass: classifyApiUrl(apiUrl),
        webhookId: "configured-live-webhook-id",
        signatureHeader: redactSignatureHeader(request.headers["X-Station-Signature"]),
        bodyByteLength: new TextEncoder().encode(request.body).byteLength,
      },
    },
  }), input.fixture);

  try {
    const response = await (input.liveSend.transport ?? defaultAgentsObserveLiveTransport)(transportRequest);
    return {
      enabled: true,
      attempted: true,
      status: "sent",
      request: {
        targetApiClass: classifyApiUrl(apiUrl),
        webhookId: "configured-live-webhook-id",
        signatureHeader: redactSignatureHeader(request.headers["X-Station-Signature"]),
        bodyByteLength: new TextEncoder().encode(request.body).byteLength,
      },
      response: {
        status: response.status,
        ok: response.ok,
        class: classifyLiveResponse(response.status, response.body),
      },
    };
  } catch {
    return {
      enabled: true,
      attempted: true,
      status: "failed",
      reason: "transport_error",
      message: "Live send transport failed.",
    };
  }
}

function validateAgentsObserveLiveConfig(
  options: AgentsObserveLiveSendOptions,
): AgentsObserveLiveConfigValidation {
  const required = [
    ["STATION_API_URL", options.apiUrl],
    ["STATION_DEVELOPER_KEY", options.developerKey],
    ["STATION_OBSERVED_RUNTIME_WEBHOOK_ID", options.webhookId],
  ] as const;
  const missingEnvNames = required
    .filter(([, value]) => !value?.trim())
    .map(([name]) => name);
  const rejectedEnvNames: string[] = required
    .filter(([, value]) => value && isPlaceholderLiveConfigValue(value))
    .map(([name]) => name);
  const invalidEnvNames = options.apiUrl?.trim() && !isAllowedLiveApiUrl(options.apiUrl)
    ? ["STATION_API_URL"]
    : [];
  if (options.signingSecret && isPlaceholderLiveConfigValue(options.signingSecret)) {
    rejectedEnvNames.push("STATION_OBSERVED_RUNTIME_SIGNING_SECRET");
  }
  return {
    ok: missingEnvNames.length === 0 && rejectedEnvNames.length === 0 && invalidEnvNames.length === 0,
    missingEnvNames,
    rejectedEnvNames,
    invalidEnvNames,
  };
}

function liveConfigBlockReason(
  validation: AgentsObserveLiveConfigValidation,
): "missing_config" | "placeholder_config" | "invalid_config" {
  if (validation.missingEnvNames.length > 0) return "missing_config";
  if (validation.invalidEnvNames.length > 0) return "invalid_config";
  return "placeholder_config";
}

async function defaultAgentsObserveLiveTransport(
  request: AgentsObserveLiveSendTransportRequest,
): Promise<AgentsObserveLiveSendTransportResponse> {
  if (!globalThis.fetch) throw new Error("fetch unavailable");
  const response = await globalThis.fetch(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
  const text = await response.text();
  return {
    status: response.status,
    ok: response.ok,
    body: text ? safeJson(text) : null,
  };
}

function isPlaceholderLiveConfigValue(value: string) {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.length === 0 ||
    normalized === "..." ||
    normalized.includes("demo") ||
    normalized.includes("fake") ||
    normalized.includes("placeholder") ||
    normalized.includes("example") ||
    normalized.includes("changeme") ||
    normalized.includes("your-")
  );
}

function isAllowedLiveApiUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.protocol === "https:") return true;
    if (url.protocol !== "http:") return false;
    return url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "::1";
  } catch {
    return false;
  }
}

function classifyApiUrl(value: string): "local" | "https" | "http" | "unknown" {
  try {
    const url = new URL(value);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "::1") {
      return "local";
    }
    if (url.protocol === "https:") return "https";
    if (url.protocol === "http:") return "http";
  } catch {
    return "unknown";
  }
  return "unknown";
}

function redactSignatureHeader(value: string) {
  const timestamp = value.match(/^t=([^,]+)/)?.[1] ?? "redacted";
  return `t=${timestamp},v1=<redacted>`;
}

function classifyLiveResponse(
  status: number,
  body: unknown,
): "accepted" | "replayed" | "validation_or_conflict" | "auth" | "server" | "unknown" {
  if (status === 202) return "accepted";
  if (status === 200 && typeof body === "object" && body !== null && "replayed" in body) return "replayed";
  if (status === 400 || status === 409) return "validation_or_conflict";
  if (status === 401 || status === 403) return "auth";
  if (status >= 500) return "server";
  return "unknown";
}

function countClassifications(payload: DeveloperSpaceBatchImportPayload) {
  const counts: Record<DeveloperSpaceObservedRuntimeFieldVisibility, number> = {
    public: 0,
    member: 0,
    owner: 0,
    private: 0,
    secret: 0,
  };
  const classifications = [
    ...(payload.nodes?.map((node) => node.fieldClassifications) ?? []),
    ...(payload.events?.map((event) => event.fieldClassifications) ?? []),
    ...(payload.snapshots?.map((snapshot) => snapshot.fieldClassifications) ?? []),
    ...(payload.supportingContext?.map((context) => context.fieldClassifications) ?? []),
  ];
  for (const fields of classifications) {
    for (const visibility of Object.values(fields ?? {})) {
      counts[visibility] += 1;
    }
  }
  return counts;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function isStructuredErrorBody(body: unknown): body is DeveloperSpaceErrorBody {
  return typeof body === "object" && body !== null;
}

function normaliseErrorCategory(
  status: number,
  body: DeveloperSpaceErrorBody,
): DeveloperSpaceClientErrorCategory {
  if (body.category) return body.category;
  if (status === 401 || status === 403) return "auth";
  if (status === 400) return "validation";
  if (status === 429) return "quota";
  if (status >= 500) return "server";
  return "unknown";
}

export type DeveloperSpaceTopologyType = "radial" | "branching" | "lattice" | "custom";
export type DeveloperSpaceEventVisibility = "private" | "community" | "public";
export type DeveloperSpaceEventProvenance = "api" | "imported" | "user" | "system" | "ai_generated";

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
  sourceRefs?: string[];
  provenance?: DeveloperSpaceEventProvenance;
}

export interface DeveloperSpaceEventPayload {
  eventType: string;
  eventLabel?: string;
  nodeId?: string;
  eventData?: Record<string, unknown>;
  similarityScore?: number | null;
  sourceRefs?: string[];
  provenance?: DeveloperSpaceEventProvenance;
  visibility?: DeveloperSpaceEventVisibility;
  occurredAt?: string;
}

export interface DeveloperSpaceSnapshotPayload {
  snapshotData: Record<string, unknown>;
  sourceRefs?: string[];
  provenance?: DeveloperSpaceEventProvenance;
  visibility?: DeveloperSpaceEventVisibility;
  occurredAt?: string;
}

export interface DeveloperSpaceBatchImportPayload {
  nodes?: Array<DeveloperSpaceNodeStatePayload & { nodeId: string }>;
  events?: DeveloperSpaceEventPayload[];
  snapshots?: DeveloperSpaceSnapshotPayload[];
}

export class DeveloperSpaceClientError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "DeveloperSpaceClientError";
    this.status = status;
    this.body = body;
  }
}

export class DeveloperSpaceClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;
  private readonly headers: Record<string, string>;

  constructor(options: DeveloperSpaceClientOptions) {
    if (!options.baseUrl) throw new Error("DeveloperSpaceClient requires baseUrl.");
    if (!options.apiKey) throw new Error("DeveloperSpaceClient requires apiKey.");
    const fetchImpl = options.fetch ?? globalThis.fetch;
    if (!fetchImpl) throw new Error("DeveloperSpaceClient requires a fetch implementation.");

    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.apiKey = options.apiKey;
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

  private async post<T = unknown>(path: string, payload: unknown): Promise<T> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Station-Developer-Key": this.apiKey,
        ...this.headers,
      },
      body: JSON.stringify(payload ?? {}),
    });

    const text = await response.text();
    const body = text ? safeJson(text) : null;
    if (!response.ok) {
      const message = typeof body === "object" && body && "error" in body
        ? String((body as { error?: unknown }).error)
        : `Developer Space request failed with ${response.status}.`;
      throw new DeveloperSpaceClientError(message, response.status, body);
    }

    return body as T;
  }
}

export function createDeveloperSpaceClient(options: DeveloperSpaceClientOptions) {
  return new DeveloperSpaceClient(options);
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

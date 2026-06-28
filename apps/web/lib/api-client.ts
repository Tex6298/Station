const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_URL ??
  "http://localhost:4000";

export function apiUrl(path: string): string {
  return `${API_URL}${path}`;
}

// -- Generic helpers -----------------------------------------------------------

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `${options.method ?? "GET"} ${path} failed (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export function apiGet<T>(path: string, token?: string): Promise<T> {
  return request<T>(path, { method: "GET" }, token);
}

export function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) }, token);
}

export function apiPut<T>(path: string, body: unknown, token?: string): Promise<T> {
  return request<T>(path, { method: "PUT", body: JSON.stringify(body) }, token);
}

export function apiPatch<T>(path: string, body: unknown, token?: string): Promise<T> {
  return request<T>(path, { method: "PATCH", body: JSON.stringify(body) }, token);
}

export function apiDelete<T>(path: string, token?: string): Promise<T> {
  return request<T>(path, { method: "DELETE" }, token);
}

// -- Billing -------------------------------------------------------------------

export interface BillingStatus {
  tier: string;
  subscriptionId: string | null;
  subscriptionStatus: string | null;
  customerId: string | null;
  limits: {
    personas: number;
    spaces: number;
    developerSpaces: number;
    publicPersonas: number;
    pagesPerSpace: number;
    storageGb: number;
    canComment: boolean;
    canCreateThreads: boolean;
    canPublishDocuments: boolean;
  };
}

export async function getBillingStatus(token: string): Promise<BillingStatus> {
  return apiGet<BillingStatus>("/billing/me", token);
}

export async function createCheckoutSession(
  token: string,
  tier: "private" | "creator" | "canon",
  interval: "monthly" | "yearly" = "monthly"
): Promise<{ url: string }> {
  return apiPost<{ url: string }>("/billing/checkout", { tier, interval }, token);
}

export async function createPortalSession(token: string): Promise<{ url: string }> {
  return apiPost<{ url: string }>("/billing/portal", {}, token);
}

// -- AI provider settings ------------------------------------------------------

export type AiProviderId = "openai" | "anthropic" | "deepseek";
export type AiProviderMode = "platform" | "byok";

export interface AiProviderReadback {
  provider: AiProviderId;
  label: string;
  configured: boolean;
  keyLastFour: string | null;
  storageStatus: "encrypted" | "legacy_plaintext" | "revoked" | "none";
  updatedAt: string | null;
  rotatedAt: string | null;
  revokedAt: string | null;
}

export interface AiProviderSettings {
  aiMode: AiProviderMode;
  supportedProviders: AiProviderReadback[];
  policy: {
    platform: string;
    byok: string;
    gemini: string;
    nvidia: string;
  };
}

export interface AiProviderSettingsPatch {
  aiMode?: AiProviderMode;
  keys?: Partial<Record<AiProviderId, string>>;
  clearKeys?: Partial<Record<AiProviderId, boolean>>;
}

export function getAiProviderSettings(token: string): Promise<{ settings: AiProviderSettings }> {
  return apiGet<{ settings: AiProviderSettings }>("/settings/ai-provider", token);
}

export function updateAiProviderSettings(
  token: string,
  patch: AiProviderSettingsPatch
): Promise<{ settings: AiProviderSettings }> {
  return apiPatch<{ settings: AiProviderSettings }>("/settings/ai-provider", patch, token);
}

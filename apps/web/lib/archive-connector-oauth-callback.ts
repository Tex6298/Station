import { apiPost } from "./api-client";
import { AUTH_STORAGE_KEY, parseStoredSession } from "./auth-session";

export const ARCHIVE_CONNECTOR_CALLBACK_ROUTE_PREFIX = "/archive-connectors/oauth/callback";
export const ARCHIVE_CONNECTOR_STATE_HANDLE_PATTERN = /^[A-Za-z0-9_-]{43}\.[A-Za-z0-9_-]{43}$/;
export const ARCHIVE_CONNECTOR_CALLBACK_CODE_PATTERN = /^[A-Za-z0-9._~+/=-]{1,1024}$/;

export const ARCHIVE_CONNECTOR_CALLBACK_PROVIDERS = ["reddit", "discord"] as const;
export type ArchiveConnectorCallbackProvider = typeof ARCHIVE_CONNECTOR_CALLBACK_PROVIDERS[number];

export type ArchiveConnectorCallbackParseResult =
  | {
      status: "ready";
      provider: ArchiveConnectorCallbackProvider;
      stateHandle: string;
      code: string;
    }
  | {
      status:
        | "invalid_provider"
        | "provider_error"
        | "missing_state"
        | "invalid_state"
        | "missing_code"
        | "invalid_code";
      provider: ArchiveConnectorCallbackProvider | null;
    };

export interface ArchiveConnectorOAuthCallbackVerifyResponse {
  status: "oauth_state_verified";
  provider: ArchiveConnectorCallbackProvider;
  purpose: "archive_connector";
  consumed: boolean;
  localRedirectPath: string | null;
  credentialWritesEnabled: false;
  oauthRedirectsEnabled: false;
  tokenExchangeEnabled: false;
  providerCallsEnabled: false;
  sourceInventoryEnabled: false;
  importWritesEnabled: false;
}

export interface ArchiveConnectorOAuthCallbackExchangeResponse {
  status: "archive_connector_connected";
  provider: ArchiveConnectorCallbackProvider;
  purpose: "archive_connector";
  scopeProfile: "connect" | "source_inventory";
  localRedirectPath: string | null;
  tokenExchangeComplete: true;
  credentialWriteComplete: true;
  credential: {
    provider: ArchiveConnectorCallbackProvider;
    purpose: "archive_connector";
    status: "active";
    configured: true;
    connectionScopeState: "account_proof_only" | "source_scope_ready" | "scope_missing";
    reconnectRequiredForSourceInventory: boolean;
  };
}

export function archiveConnectorCallbackProvider(value: unknown): ArchiveConnectorCallbackProvider | null {
  return ARCHIVE_CONNECTOR_CALLBACK_PROVIDERS.includes(value as ArchiveConnectorCallbackProvider)
    ? value as ArchiveConnectorCallbackProvider
    : null;
}

export function archiveConnectorCallbackProviderLabel(provider: ArchiveConnectorCallbackProvider) {
  return provider === "reddit" ? "Reddit" : "Discord";
}

export function archiveConnectorCallbackVerifyPath(provider: ArchiveConnectorCallbackProvider) {
  return `/archive-connectors/oauth/${provider}/callback/verify`;
}

export function archiveConnectorCallbackExchangePath(provider: ArchiveConnectorCallbackProvider) {
  return `/archive-connectors/oauth/${provider}/callback/exchange`;
}

export function parseArchiveConnectorOAuthCallback(input: {
  provider: unknown;
  searchParams: URLSearchParams;
}): ArchiveConnectorCallbackParseResult {
  const provider = archiveConnectorCallbackProvider(input.provider);
  if (!provider) return { status: "invalid_provider", provider: null };

  if (input.searchParams.has("error")) {
    return { status: "provider_error", provider };
  }

  const stateValues = input.searchParams.getAll("state");
  if (stateValues.length !== 1) return { status: "missing_state", provider };
  const stateHandle = stateValues[0];
  if (!ARCHIVE_CONNECTOR_STATE_HANDLE_PATTERN.test(stateHandle)) {
    return { status: "invalid_state", provider };
  }

  const codeValues = input.searchParams.getAll("code");
  if (codeValues.length !== 1) return { status: "missing_code", provider };
  const code = codeValues[0];
  if (!ARCHIVE_CONNECTOR_CALLBACK_CODE_PATTERN.test(code)) {
    return { status: "invalid_code", provider };
  }

  return { status: "ready", provider, stateHandle, code };
}

export function archiveConnectorCallbackRestartCopy(status: ArchiveConnectorCallbackParseResult["status"]) {
  if (status === "provider_error") {
    return {
      title: "Connector setup was cancelled",
      body: "Station did not connect this archive provider. Restart connector setup when you are ready.",
    };
  }

  if (status === "invalid_provider") {
    return {
      title: "Unsupported archive provider",
      body: "Station could not verify this connector callback. Restart connector setup from Station.",
    };
  }

  return {
    title: "Restart connector setup",
    body: "Station could not verify this connector session. Restart connector setup from Station.",
  };
}

export function readStoredArchiveConnectorCallbackAccessToken() {
  if (typeof window === "undefined") return null;

  try {
    return parseStoredSession(window.localStorage.getItem(AUTH_STORAGE_KEY))?.accessToken ?? null;
  } catch {
    return null;
  }
}

export function verifyArchiveConnectorOAuthCallback(input: {
  provider: ArchiveConnectorCallbackProvider;
  stateHandle: string;
  code: string;
  accessToken: string;
}) {
  return apiPost<ArchiveConnectorOAuthCallbackVerifyResponse>(
    archiveConnectorCallbackVerifyPath(input.provider),
    {
      stateHandle: input.stateHandle,
      code: input.code,
    },
    input.accessToken,
  );
}

export function exchangeArchiveConnectorOAuthCallback(input: {
  provider: ArchiveConnectorCallbackProvider;
  stateHandle: string;
  code: string;
  accessToken: string;
}) {
  return apiPost<ArchiveConnectorOAuthCallbackExchangeResponse>(
    archiveConnectorCallbackExchangePath(input.provider),
    {
      stateHandle: input.stateHandle,
      code: input.code,
    },
    input.accessToken,
  );
}

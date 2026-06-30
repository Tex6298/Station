import type { ArchiveConnectorProviderId } from "./credential-contract";

export type ArchiveConnectorTokenExchangeErrorCode =
  | "archive_connector_token_exchange_failed"
  | "archive_connector_token_exchange_response_invalid";

export type ArchiveConnectorTokenMaterial = {
  schema: "station.archive_connector.oauth_token.v1";
  provider: ArchiveConnectorProviderId;
  tokenType: string | null;
  accessToken: string;
  refreshToken?: string;
  expiresInSeconds: number | null;
  scope: string | null;
};

export class ArchiveConnectorTokenExchangeError extends Error {
  constructor(public readonly code: ArchiveConnectorTokenExchangeErrorCode, message: string) {
    super(message);
    this.name = "ArchiveConnectorTokenExchangeError";
  }
}

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

let tokenEndpointFetch: FetchLike = (input, init) => fetch(input, init);

export function setArchiveConnectorTokenEndpointFetchForTests(fetcher: FetchLike | null) {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("setArchiveConnectorTokenEndpointFetchForTests can only be used while NODE_ENV is test.");
  }
  tokenEndpointFetch = fetcher ?? ((input, init) => fetch(input, init));
}

export async function exchangeArchiveConnectorOAuthCode(input: {
  provider: ArchiveConnectorProviderId;
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}): Promise<ArchiveConnectorTokenMaterial> {
  const response = input.provider === "reddit"
    ? await exchangeRedditCode(input)
    : await exchangeDiscordCode(input);

  return tokenMaterialFromResponse(input.provider, response);
}

async function exchangeRedditCode(input: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: input.redirectUri,
  });
  const basic = Buffer.from(`${input.clientId}:${input.clientSecret}`, "utf8").toString("base64");
  return tokenEndpointRequest("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
}

async function exchangeDiscordCode(input: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}) {
  const body = new URLSearchParams({
    client_id: input.clientId,
    client_secret: input.clientSecret,
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: input.redirectUri,
  });
  return tokenEndpointRequest("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
}

async function tokenEndpointRequest(url: string, init: RequestInit) {
  let response: Response;
  try {
    response = await tokenEndpointFetch(url, init);
  } catch {
    throw exchangeFailed();
  }

  if (!response.ok) throw exchangeFailed();

  try {
    return await response.json() as Record<string, unknown>;
  } catch {
    throw invalidTokenResponse();
  }
}

function tokenMaterialFromResponse(
  provider: ArchiveConnectorProviderId,
  payload: Record<string, unknown>,
): ArchiveConnectorTokenMaterial {
  const accessToken = boundedToken(payload.access_token);
  const refreshToken = boundedOptionalToken(payload.refresh_token);
  const tokenType = boundedOptionalLabel(payload.token_type, 40);
  const expiresInSeconds = boundedExpiresIn(payload.expires_in);
  const scope = boundedScope(provider, payload.scope);

  if (!accessToken) throw invalidTokenResponse();

  return {
    schema: "station.archive_connector.oauth_token.v1",
    provider,
    tokenType,
    accessToken,
    ...(refreshToken ? { refreshToken } : {}),
    expiresInSeconds,
    scope,
  };
}

function boundedToken(value: unknown) {
  if (typeof value !== "string") return null;
  if (value.length < 1 || value.length > 4096 || /[\u0000-\u001f\u007f]/.test(value)) return null;
  return value;
}

function boundedOptionalToken(value: unknown) {
  if (value == null) return null;
  return boundedToken(value);
}

function boundedOptionalLabel(value: unknown, maxLength: number) {
  if (value == null) return null;
  if (typeof value !== "string") throw invalidTokenResponse();
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength || /[\u0000-\u001f\u007f]/.test(trimmed)) {
    throw invalidTokenResponse();
  }
  return trimmed;
}

function boundedExpiresIn(value: unknown) {
  if (value == null) return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 315_360_000) {
    throw invalidTokenResponse();
  }
  return Math.floor(value);
}

function boundedScope(provider: ArchiveConnectorProviderId, value: unknown) {
  if (value == null) return null;
  if (typeof value !== "string") throw invalidTokenResponse();
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 120 || /[\u0000-\u001f\u007f]/.test(trimmed)) {
    throw invalidTokenResponse();
  }

  const allowed = provider === "reddit" ? "identity" : "identify";
  const scopes = trimmed.split(/\s+/);
  if (scopes.some((scope) => scope !== allowed)) throw invalidTokenResponse();
  return scopes.join(" ");
}

function exchangeFailed() {
  return new ArchiveConnectorTokenExchangeError(
    "archive_connector_token_exchange_failed",
    "Archive connector token exchange failed."
  );
}

function invalidTokenResponse() {
  return new ArchiveConnectorTokenExchangeError(
    "archive_connector_token_exchange_response_invalid",
    "Archive connector token response was invalid."
  );
}

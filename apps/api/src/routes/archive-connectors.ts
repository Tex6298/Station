import { createHash, randomBytes } from "crypto";
import { Router, type Request, type Response } from "express";
import { requireAuth } from "../middleware/require-auth";
import {
  archiveConnectorReadiness,
  archiveConnectorProviderOAuthClientId,
  archiveConnectorProviderOAuthClientSecret,
  archiveConnectorProviderOAuthAppStatus,
} from "../services/archive-connectors/readiness";
import {
  ARCHIVE_CONNECTOR_PROVIDER_IDS,
  type ArchiveConnectorProviderId,
} from "../services/archive-connectors/credential-contract";
import {
  archiveConnectorCredentialEncryptionConfigured,
  ArchiveConnectorCredentialStorageError,
  type ArchiveConnectorCredentialReadback,
  consumeArchiveConnectorOAuthState,
  createArchiveConnectorOAuthState,
  loadArchiveConnectorCredentialReadbacks,
  storeArchiveConnectorCredential,
  validateArchiveConnectorOAuthState,
} from "../services/archive-connectors/credential-storage";
import {
  ArchiveConnectorTokenExchangeError,
  exchangeArchiveConnectorOAuthCode,
} from "../services/archive-connectors/token-exchange";

export const archiveConnectorsRouter = Router();

archiveConnectorsRouter.use(requireAuth);

archiveConnectorsRouter.get("/readiness", (_req: Request, res: Response) => {
  res.json(archiveConnectorReadiness());
});

archiveConnectorsRouter.get("/credentials", async (req: Request, res: Response) => {
  try {
    const credentials = await loadArchiveConnectorCredentialReadbacks(req.user!.id);
    return res.json({
      status: "archive_connector_credentials_read",
      purpose: "archive_connector",
      ownerOnly: true,
      providers: archiveConnectorCredentialProviderRows(credentials),
    });
  } catch {
    return res.status(500).json({
      error: "Could not load archive connector credential metadata.",
      code: "archive_connector_credential_read_failed",
      status: "credential_read_failed",
      purpose: "archive_connector",
      ownerOnly: true,
      ...credentialReadbackSafety(),
    });
  }
});

archiveConnectorsRouter.post("/oauth/:provider/start", async (req: Request, res: Response) => {
  const provider = archiveConnectorProvider(req.params.provider);
  if (!provider) {
    return res.status(400).json({
      error: "Archive connector provider is not supported.",
      code: "archive_connector_provider_not_supported",
      status: "unsupported_provider",
    });
  }

  const oauthAppStatus = archiveConnectorProviderOAuthAppStatus(provider);
  if (oauthAppStatus !== "configured") {
    return res.status(409).json({
      error: "Archive connector provider app setup is required.",
      code: "archive_connector_provider_app_setup_required",
      status: "setup_required",
      provider,
      purpose: "archive_connector",
      ...disabledOAuthStateStartSafety(),
    });
  }

  let localRedirectPath: string | null;
  try {
    localRedirectPath = localRedirectPathFromBody(req.body);
  } catch {
    return res.status(400).json({
      error: "Archive connector local redirect path is invalid.",
      code: "archive_connector_local_redirect_invalid",
      status: "invalid_request",
      provider,
      purpose: "archive_connector",
      ...disabledOAuthStateStartSafety(),
    });
  }

  const authHeader = req.headers.authorization ?? "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const nonce = randomBytes(32).toString("base64url");
  const csrf = randomBytes(32).toString("base64url");
  const stateHandle = `${nonce}.${csrf}`;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  let state: { expiresAt: string; localRedirectPath: string | null };
  try {
    state = await createArchiveConnectorOAuthState({
      ownerUserId: req.user!.id,
      sessionId: sessionBinding(req.user!.id, bearerToken),
      provider,
      nonce,
      csrf,
      expiresAt,
      localRedirectPath,
    });
  } catch {
    return res.status(500).json({
      error: "Could not start archive connector OAuth state.",
      code: "archive_connector_oauth_state_start_failed",
      status: "start_failed",
      provider,
      purpose: "archive_connector",
      ...disabledOAuthStateStartSafety(),
    });
  }

  return res.status(201).json({
    status: "oauth_state_created",
    provider,
    purpose: "archive_connector",
    expiresAt: state.expiresAt,
    localRedirectPath: state.localRedirectPath,
    stateHandle,
    ...disabledOAuthStateStartSafety(),
  });
});

archiveConnectorsRouter.post("/oauth/:provider/callback/verify", async (req: Request, res: Response) => {
  const provider = archiveConnectorProvider(req.params.provider);
  if (!provider) {
    return res.status(400).json({
      error: "Archive connector provider is not supported.",
      code: "archive_connector_provider_not_supported",
      status: "unsupported_provider",
    });
  }

  let callback: { stateHandle: string; code: string };
  try {
    callback = callbackVerificationFromBody(req.body);
  } catch {
    return res.status(400).json({
      error: "Archive connector callback verification input is invalid.",
      code: "archive_connector_callback_invalid",
      status: "invalid_request",
      provider,
      purpose: "archive_connector",
      ...disabledOAuthCallbackVerificationSafety(),
    });
  }

  const [nonce, csrf] = callback.stateHandle.split(".");
  const authHeader = req.headers.authorization ?? "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  try {
    const state = await consumeArchiveConnectorOAuthState({
      ownerUserId: req.user!.id,
      sessionId: sessionBinding(req.user!.id, bearerToken),
      provider,
      nonce,
      csrf,
    });

    return res.status(200).json({
      status: "oauth_state_verified",
      provider: state.provider,
      purpose: state.purpose,
      consumed: state.consumedAt != null,
      localRedirectPath: state.localRedirectPath,
      ...disabledOAuthCallbackVerificationSafety(),
    });
  } catch (error) {
    if (
      error instanceof ArchiveConnectorCredentialStorageError &&
      error.code === "archive_connector_oauth_state_invalid"
    ) {
      return res.status(409).json({
        error: "Archive connector OAuth state is invalid, expired, or already consumed.",
        code: "archive_connector_oauth_state_invalid",
        status: "state_invalid",
        provider,
        purpose: "archive_connector",
        ...disabledOAuthCallbackVerificationSafety(),
      });
    }

    return res.status(500).json({
      error: "Could not verify archive connector OAuth callback.",
      code: "archive_connector_callback_verify_failed",
      status: "verify_failed",
      provider,
      purpose: "archive_connector",
      ...disabledOAuthCallbackVerificationSafety(),
    });
  }
});

archiveConnectorsRouter.post("/oauth/:provider/callback/exchange", async (req: Request, res: Response) => {
  const provider = archiveConnectorProvider(req.params.provider);
  if (!provider) {
    return res.status(400).json({
      error: "Archive connector provider is not supported.",
      code: "archive_connector_provider_not_supported",
      status: "unsupported_provider",
    });
  }

  let callback: { stateHandle: string; code: string };
  try {
    callback = callbackVerificationFromBody(req.body);
  } catch {
    return res.status(400).json({
      error: "Archive connector callback exchange input is invalid.",
      code: "archive_connector_exchange_invalid",
      status: "invalid_request",
      provider,
      purpose: "archive_connector",
      ...exchangeSafety(false),
    });
  }

  const oauthAppStatus = archiveConnectorProviderOAuthAppStatus(provider);
  const clientId = archiveConnectorProviderOAuthClientId(provider);
  const clientSecret = archiveConnectorProviderOAuthClientSecret(provider);
  if (oauthAppStatus !== "configured" || !clientId || !clientSecret) {
    return res.status(409).json({
      error: "Archive connector provider app setup is required.",
      code: "archive_connector_provider_app_setup_required",
      status: "setup_required",
      provider,
      purpose: "archive_connector",
      ...exchangeSafety(false),
    });
  }

  if (!archiveConnectorCredentialEncryptionConfigured()) {
    return res.status(409).json({
      error: "Archive connector credential encryption setup is required.",
      code: "archive_connector_credential_encryption_required",
      status: "encryption_required",
      provider,
      purpose: "archive_connector",
      ...exchangeSafety(false),
    });
  }

  let redirectUri: string;
  try {
    redirectUri = archiveConnectorCallbackRedirectUri(provider);
  } catch (error) {
    const unsafe = error instanceof ArchiveConnectorAuthorizeConfigError && error.kind === "unsafe_hosted_origin";
    return res.status(unsafe ? 409 : 400).json({
      error: "Archive connector web callback origin is not configured safely.",
      code: unsafe
        ? "archive_connector_callback_origin_unsafe"
        : "archive_connector_callback_origin_invalid",
      status: unsafe ? "origin_unsafe" : "origin_invalid",
      provider,
      purpose: "archive_connector",
      ...exchangeSafety(false),
    });
  }

  const [nonce, csrf] = callback.stateHandle.split(".");
  const authHeader = req.headers.authorization ?? "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  try {
    await consumeArchiveConnectorOAuthState({
      ownerUserId: req.user!.id,
      sessionId: sessionBinding(req.user!.id, bearerToken),
      provider,
      nonce,
      csrf,
    });
  } catch (error) {
    if (
      error instanceof ArchiveConnectorCredentialStorageError &&
      error.code === "archive_connector_oauth_state_invalid"
    ) {
      return res.status(409).json({
        error: "Archive connector OAuth state is invalid, expired, or already consumed.",
        code: "archive_connector_oauth_state_invalid",
        status: "state_invalid",
        provider,
        purpose: "archive_connector",
        ...exchangeSafety(false),
      });
    }

    return res.status(500).json({
      error: "Could not consume archive connector OAuth state.",
      code: "archive_connector_exchange_state_consume_failed",
      status: "state_consume_failed",
      provider,
      purpose: "archive_connector",
      ...exchangeSafety(false),
    });
  }

  let tokenMaterial: Awaited<ReturnType<typeof exchangeArchiveConnectorOAuthCode>>;
  try {
    tokenMaterial = await exchangeArchiveConnectorOAuthCode({
      provider,
      clientId,
      clientSecret,
      code: callback.code,
      redirectUri,
    });
  } catch (error) {
    if (error instanceof ArchiveConnectorTokenExchangeError) {
      return res.status(502).json({
        error: "Archive connector token exchange failed.",
        code: "archive_connector_token_exchange_failed",
        status: "token_exchange_failed",
        provider,
        purpose: "archive_connector",
        ...exchangeSafety(false),
      });
    }

    return res.status(502).json({
      error: "Archive connector token exchange failed.",
      code: "archive_connector_token_exchange_failed",
      status: "token_exchange_failed",
      provider,
      purpose: "archive_connector",
      ...exchangeSafety(false),
    });
  }

  try {
    const credential = await storeArchiveConnectorCredential({
      ownerUserId: req.user!.id,
      provider,
      secretMaterial: tokenMaterial,
      accountLabel: null,
      rawExternalAccountId: null,
    });

    return res.status(200).json({
      status: "archive_connector_connected",
      provider,
      purpose: "archive_connector",
      tokenExchangeComplete: true,
      credentialWriteComplete: true,
      credential,
      ...exchangeSafety(true),
    });
  } catch {
    return res.status(500).json({
      error: "Could not save archive connector credential.",
      code: "archive_connector_credential_write_failed",
      status: "credential_write_failed",
      provider,
      purpose: "archive_connector",
      ...exchangeSafety(false),
    });
  }
});

archiveConnectorsRouter.post("/oauth/:provider/authorize", async (req: Request, res: Response) => {
  const provider = archiveConnectorProvider(req.params.provider);
  if (!provider) {
    return res.status(400).json({
      error: "Archive connector provider is not supported.",
      code: "archive_connector_provider_not_supported",
      status: "unsupported_provider",
    });
  }

  const oauthAppStatus = archiveConnectorProviderOAuthAppStatus(provider);
  const clientId = archiveConnectorProviderOAuthClientId(provider);
  if (oauthAppStatus !== "configured" || !clientId) {
    return res.status(409).json({
      error: "Archive connector provider app setup is required.",
      code: "archive_connector_provider_app_setup_required",
      status: "setup_required",
      provider,
      purpose: "archive_connector",
      ...authorizationUrlSafety(),
    });
  }

  let stateHandle: string;
  try {
    stateHandle = authorizeStateHandleFromBody(req.body);
  } catch {
    return res.status(400).json({
      error: "Archive connector authorization request is invalid.",
      code: "archive_connector_authorize_invalid",
      status: "invalid_request",
      provider,
      purpose: "archive_connector",
      ...authorizationUrlSafety(),
    });
  }

  const [nonce, csrf] = stateHandle.split(".");
  const authHeader = req.headers.authorization ?? "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  try {
    await validateArchiveConnectorOAuthState({
      ownerUserId: req.user!.id,
      sessionId: sessionBinding(req.user!.id, bearerToken),
      provider,
      nonce,
      csrf,
    });
  } catch (error) {
    if (
      error instanceof ArchiveConnectorCredentialStorageError &&
      error.code === "archive_connector_oauth_state_invalid"
    ) {
      return res.status(409).json({
        error: "Archive connector OAuth state is invalid, expired, or already consumed.",
        code: "archive_connector_oauth_state_invalid",
        status: "state_invalid",
        provider,
        purpose: "archive_connector",
        ...authorizationUrlSafety(),
      });
    }

    return res.status(500).json({
      error: "Could not validate archive connector OAuth state.",
      code: "archive_connector_authorize_state_validation_failed",
      status: "state_validation_failed",
      provider,
      purpose: "archive_connector",
      ...authorizationUrlSafety(),
    });
  }

  let redirectUri: string;
  try {
    redirectUri = archiveConnectorCallbackRedirectUri(provider);
  } catch (error) {
    const unsafe = error instanceof ArchiveConnectorAuthorizeConfigError && error.kind === "unsafe_hosted_origin";
    return res.status(unsafe ? 409 : 400).json({
      error: "Archive connector web callback origin is not configured safely.",
      code: unsafe
        ? "archive_connector_callback_origin_unsafe"
        : "archive_connector_callback_origin_invalid",
      status: unsafe ? "origin_unsafe" : "origin_invalid",
      provider,
      purpose: "archive_connector",
      ...authorizationUrlSafety(),
    });
  }

  return res.status(200).json({
    status: "oauth_authorization_url_created",
    provider,
    purpose: "archive_connector",
    authorizationUrl: providerAuthorizationUrl({
      provider,
      clientId,
      stateHandle,
      redirectUri,
    }),
    ...authorizationUrlSafety(),
  });
});

function archiveConnectorProvider(value: string | undefined): ArchiveConnectorProviderId | null {
  return ARCHIVE_CONNECTOR_PROVIDER_IDS.includes(value as ArchiveConnectorProviderId)
    ? value as ArchiveConnectorProviderId
    : null;
}

function archiveConnectorCredentialProviderRows(credentials: ArchiveConnectorCredentialReadback[]) {
  return ARCHIVE_CONNECTOR_PROVIDER_IDS.map((provider) => {
    const credential = newestCredentialReadbackForProvider(credentials, provider);
    return {
      provider,
      purpose: "archive_connector" as const,
      connectionStatus: credential
        ? credential.status === "active" ? "connected" : "revoked"
        : "missing",
      credential,
      ...credentialReadbackSafety(),
    };
  });
}

function newestCredentialReadbackForProvider(
  credentials: ArchiveConnectorCredentialReadback[],
  provider: ArchiveConnectorProviderId,
) {
  const providerCredentials = credentials.filter((credential) =>
    credential.provider === provider &&
    credential.purpose === "archive_connector" &&
    (credential.status === "active" || credential.status === "revoked")
  );
  return newestCredentialReadback(providerCredentials.filter((credential) => credential.status === "active")) ??
    newestCredentialReadback(providerCredentials.filter((credential) => credential.status === "revoked"));
}

function newestCredentialReadback(credentials: ArchiveConnectorCredentialReadback[]) {
  return credentials.reduce<ArchiveConnectorCredentialReadback | null>((selected, credential) => {
    if (!selected) return credential;
    return credentialReadbackTimestamp(credential) > credentialReadbackTimestamp(selected)
      ? credential
      : selected;
  }, null);
}

function credentialReadbackTimestamp(credential: ArchiveConnectorCredentialReadback) {
  const candidates = credential.status === "revoked"
    ? [credential.revokedAt, credential.updatedAt, credential.createdAt]
    : [credential.createdAt, credential.updatedAt, credential.rotatedAt];

  for (const value of candidates) {
    if (!value) continue;
    const timestamp = Date.parse(value);
    if (Number.isFinite(timestamp)) return timestamp;
  }

  return 0;
}

function authorizeStateHandleFromBody(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("invalid authorize body");
  }

  const record = body as Record<string, unknown>;
  const keys = Object.keys(record);
  if (keys.length !== 1 || keys[0] !== "stateHandle") {
    throw new Error("invalid authorize body");
  }

  const stateHandle = record.stateHandle;
  if (typeof stateHandle !== "string" || !/^[A-Za-z0-9_-]{43}\.[A-Za-z0-9_-]{43}$/.test(stateHandle)) {
    throw new Error("invalid authorize body");
  }

  return stateHandle;
}

function callbackVerificationFromBody(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("invalid callback body");
  }

  const record = body as Record<string, unknown>;
  const keys = Object.keys(record);
  if (keys.length !== 2 || keys.some((key) => key !== "stateHandle" && key !== "code")) {
    throw new Error("invalid callback body");
  }

  const stateHandle = record.stateHandle;
  const code = record.code;
  if (
    typeof stateHandle !== "string" ||
    !/^[A-Za-z0-9_-]{43}\.[A-Za-z0-9_-]{43}$/.test(stateHandle) ||
    typeof code !== "string" ||
    !/^[A-Za-z0-9._~+/=-]{1,1024}$/.test(code)
  ) {
    throw new Error("invalid callback body");
  }

  return { stateHandle, code };
}

function localRedirectPathFromBody(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const value = (body as { localRedirectPath?: unknown }).localRedirectPath;
  if (value == null) return null;
  if (typeof value !== "string") throw new Error("invalid local redirect path");

  const trimmed = value.trim();
  if (
    trimmed.length === 0 ||
    trimmed.length > 200 ||
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ||
    /[\\\u0000-\u001f\u007f]/.test(trimmed)
  ) {
    throw new Error("invalid local redirect path");
  }

  return trimmed;
}

function sessionBinding(ownerUserId: string, bearerToken: string) {
  return createHash("sha256")
    .update(`station.archive_connector.oauth.session:${ownerUserId}:${bearerToken}`)
    .digest("hex");
}

function archiveConnectorCallbackRedirectUri(provider: ArchiveConnectorProviderId) {
  const origin = safeWebAppOrigin();
  return `${origin}/archive-connectors/oauth/callback/${provider}`;
}

function safeWebAppOrigin() {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) throw new ArchiveConnectorAuthorizeConfigError("malformed_origin");

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new ArchiveConnectorAuthorizeConfigError("malformed_origin");
  }

  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new ArchiveConnectorAuthorizeConfigError("malformed_origin");
  }

  const hostname = url.hostname.toLowerCase();
  const local = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
  const hosted = process.env.NODE_ENV === "production" ||
    Boolean(
      process.env.RAILWAY_ENVIRONMENT ||
      process.env.RAILWAY_ENVIRONMENT_NAME ||
      process.env.RAILWAY_PROJECT_ID ||
      process.env.RAILWAY_SERVICE_NAME ||
      process.env.VERCEL ||
      process.env.RENDER
    );

  if ((url.protocol === "http:" && !local) || (hosted && (url.protocol !== "https:" || local))) {
    throw new ArchiveConnectorAuthorizeConfigError("unsafe_hosted_origin");
  }

  return url.origin;
}

function providerAuthorizationUrl(input: {
  provider: ArchiveConnectorProviderId;
  clientId: string;
  stateHandle: string;
  redirectUri: string;
}) {
  if (input.provider === "reddit") {
    const url = new URL("https://www.reddit.com/api/v1/authorize");
    url.searchParams.set("client_id", input.clientId);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("state", input.stateHandle);
    url.searchParams.set("redirect_uri", input.redirectUri);
    url.searchParams.set("duration", "temporary");
    url.searchParams.set("scope", "identity");
    return url.toString();
  }

  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("client_id", input.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", input.stateHandle);
  url.searchParams.set("redirect_uri", input.redirectUri);
  url.searchParams.set("scope", "identify");
  return url.toString();
}

class ArchiveConnectorAuthorizeConfigError extends Error {
  constructor(readonly kind: "malformed_origin" | "unsafe_hosted_origin") {
    super("Archive connector callback origin is invalid.");
    this.name = "ArchiveConnectorAuthorizeConfigError";
  }
}

function disabledOAuthStateStartSafety() {
  return {
    credentialWritesEnabled: false,
    oauthRedirectsEnabled: false,
    oauthCallbacksEnabled: false,
    tokenExchangeEnabled: false,
    providerCallsEnabled: false,
    sourceInventoryEnabled: false,
    importWritesEnabled: false,
  };
}

function disabledOAuthCallbackVerificationSafety() {
  return {
    credentialWritesEnabled: false,
    oauthRedirectsEnabled: false,
    tokenExchangeEnabled: false,
    providerCallsEnabled: false,
    sourceInventoryEnabled: false,
    importWritesEnabled: false,
  };
}

function authorizationUrlSafety() {
  return {
    credentialWritesEnabled: false,
    oauthRedirectsEnabled: false,
    oauthCallbacksEnabled: true,
    tokenExchangeEnabled: false,
    providerCallsEnabled: false,
    sourceInventoryEnabled: false,
    importWritesEnabled: false,
  };
}

function exchangeSafety(enabled: boolean) {
  return {
    credentialWritesEnabled: enabled,
    oauthRedirectsEnabled: false,
    oauthCallbacksEnabled: true,
    tokenExchangeEnabled: enabled,
    providerTokenEndpointCallsEnabled: enabled,
    providerCallsEnabled: false,
    sourceInventoryEnabled: false,
    importWritesEnabled: false,
  };
}

function credentialReadbackSafety() {
  return {
    tokenDecryptEnabled: false,
    tokenExchangeEnabled: false,
    providerTokenEndpointCallsEnabled: false,
    credentialWritesEnabled: false,
    credentialRevokeEnabled: false,
    providerCallsEnabled: false,
    sourceInventoryEnabled: false,
    importWritesEnabled: false,
  };
}

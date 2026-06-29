import { createHash, randomBytes } from "crypto";
import { Router, type Request, type Response } from "express";
import { requireAuth } from "../middleware/require-auth";
import {
  archiveConnectorReadiness,
  archiveConnectorProviderOAuthAppStatus,
} from "../services/archive-connectors/readiness";
import {
  ARCHIVE_CONNECTOR_PROVIDER_IDS,
  type ArchiveConnectorProviderId,
} from "../services/archive-connectors/credential-contract";
import {
  ArchiveConnectorCredentialStorageError,
  consumeArchiveConnectorOAuthState,
  createArchiveConnectorOAuthState,
} from "../services/archive-connectors/credential-storage";

export const archiveConnectorsRouter = Router();

archiveConnectorsRouter.use(requireAuth);

archiveConnectorsRouter.get("/readiness", (_req: Request, res: Response) => {
  res.json(archiveConnectorReadiness());
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

function archiveConnectorProvider(value: string | undefined): ArchiveConnectorProviderId | null {
  return ARCHIVE_CONNECTOR_PROVIDER_IDS.includes(value as ArchiveConnectorProviderId)
    ? value as ArchiveConnectorProviderId
    : null;
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
    !/^[A-Za-z0-9._~-]{1,512}$/.test(code)
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

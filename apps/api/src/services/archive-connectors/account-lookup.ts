import {
  type ArchiveConnectorProviderId,
} from "./credential-contract";
import {
  sanitizeArchiveConnectorAccountLabel,
} from "./credential-storage";

export type ArchiveConnectorAccountLookupErrorCode =
  | "archive_connector_account_lookup_reconnect_required"
  | "archive_connector_account_lookup_rate_limited"
  | "archive_connector_account_lookup_failed"
  | "archive_connector_account_lookup_response_invalid";

export type ArchiveConnectorProviderAccountProof = {
  provider: ArchiveConnectorProviderId;
  rawExternalAccountId: string;
  accountLabel: string | null;
};

export class ArchiveConnectorAccountLookupError extends Error {
  constructor(public readonly code: ArchiveConnectorAccountLookupErrorCode, message: string) {
    super(message);
    this.name = "ArchiveConnectorAccountLookupError";
  }
}

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

const ACCOUNT_LOOKUP_TIMEOUT_MS = 5000;
const REDDIT_ACCOUNT_LOOKUP_USER_AGENT = "StationArchiveConnector/1.0 account-proof";

let accountLookupFetch: FetchLike = (input, init) => fetch(input, init);

export function setArchiveConnectorAccountLookupFetchForTests(fetcher: FetchLike | null) {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("setArchiveConnectorAccountLookupFetchForTests can only be used while NODE_ENV is test.");
  }
  accountLookupFetch = fetcher ?? ((input, init) => fetch(input, init));
}

export async function lookupArchiveConnectorProviderAccount(input: {
  provider: ArchiveConnectorProviderId;
  accessToken: string;
}): Promise<ArchiveConnectorProviderAccountProof> {
  const response = input.provider === "reddit"
    ? await accountLookupRequest("https://oauth.reddit.com/api/v1/me?raw_json=1", {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${input.accessToken}`,
          "User-Agent": REDDIT_ACCOUNT_LOOKUP_USER_AGENT,
        },
      })
    : await accountLookupRequest("https://discord.com/api/v10/users/@me", {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${input.accessToken}`,
        },
      });

  return input.provider === "reddit"
    ? redditAccountProofFromPayload(response)
    : discordAccountProofFromPayload(response);
}

async function accountLookupRequest(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ACCOUNT_LOOKUP_TIMEOUT_MS);

  let response: Response;
  try {
    response = await accountLookupFetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch {
    throw lookupFailed();
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 401 || response.status === 403) {
    throw new ArchiveConnectorAccountLookupError(
      "archive_connector_account_lookup_reconnect_required",
      "Archive connector account proof requires reconnect."
    );
  }
  if (response.status === 429) {
    throw new ArchiveConnectorAccountLookupError(
      "archive_connector_account_lookup_rate_limited",
      "Archive connector provider account lookup was rate limited."
    );
  }
  if (!response.ok) throw lookupFailed();

  try {
    return await response.json() as Record<string, unknown>;
  } catch {
    throw responseInvalid();
  }
}

function redditAccountProofFromPayload(payload: Record<string, unknown>): ArchiveConnectorProviderAccountProof {
  return {
    provider: "reddit",
    rawExternalAccountId: rawAccountIdFromValue(payload.id),
    accountLabel: safeProviderAccountLabel(payload.name),
  };
}

function discordAccountProofFromPayload(payload: Record<string, unknown>): ArchiveConnectorProviderAccountProof {
  return {
    provider: "discord",
    rawExternalAccountId: rawAccountIdFromValue(payload.id),
    accountLabel: safeProviderAccountLabel(payload.global_name) ?? safeProviderAccountLabel(payload.username),
  };
}

function rawAccountIdFromValue(value: unknown) {
  if (typeof value !== "string") throw responseInvalid();
  const trimmed = value.trim();
  if (
    trimmed.length < 1 ||
    trimmed.length > 200 ||
    /[\u0000-\u001f\u007f]/.test(trimmed)
  ) {
    throw responseInvalid();
  }
  return trimmed;
}

function safeProviderAccountLabel(value: unknown) {
  if (value == null) return null;
  if (typeof value !== "string") return null;
  return sanitizeArchiveConnectorAccountLabel(value);
}

function lookupFailed() {
  return new ArchiveConnectorAccountLookupError(
    "archive_connector_account_lookup_failed",
    "Archive connector provider account lookup failed."
  );
}

function responseInvalid() {
  return new ArchiveConnectorAccountLookupError(
    "archive_connector_account_lookup_response_invalid",
    "Archive connector provider account response was invalid."
  );
}

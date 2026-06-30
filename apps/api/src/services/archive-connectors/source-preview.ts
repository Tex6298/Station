import { fingerprintArchiveConnectorExternalAccount } from "./credential-storage";

export type ArchiveConnectorSourcePreviewErrorCode =
  | "archive_connector_source_preview_account_mismatch"
  | "archive_connector_source_preview_reconnect_required"
  | "archive_connector_source_preview_rate_limited"
  | "archive_connector_source_preview_provider_failed"
  | "archive_connector_source_preview_provider_response_invalid";

export type ArchiveConnectorSourcePreviewReadback = {
  pageLimit: 10;
  itemCount: number;
  postCount: number;
  commentCount: number;
  otherCount: number;
  truncated: boolean;
  contentReturned: false;
};

export class ArchiveConnectorSourcePreviewError extends Error {
  constructor(public readonly code: ArchiveConnectorSourcePreviewErrorCode, message: string) {
    super(message);
    this.name = "ArchiveConnectorSourcePreviewError";
  }
}

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

const SOURCE_PREVIEW_TIMEOUT_MS = 5000;
const REDDIT_SOURCE_PREVIEW_USER_AGENT = "StationArchiveConnector/1.0 source-preview";

let sourcePreviewFetch: FetchLike = (input, init) => fetch(input, init);

export function setArchiveConnectorSourcePreviewFetchForTests(fetcher: FetchLike | null) {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("setArchiveConnectorSourcePreviewFetchForTests can only be used while NODE_ENV is test.");
  }
  sourcePreviewFetch = fetcher ?? ((input, init) => fetch(input, init));
}

export async function readRedditSavedItemsSourcePreview(input: {
  accessToken: string;
  externalAccountFingerprint: string;
}): Promise<ArchiveConnectorSourcePreviewReadback> {
  const identity = await sourcePreviewRequest("https://oauth.reddit.com/api/v1/me?raw_json=1", {
    method: "GET",
    headers: redditSourcePreviewHeaders(input.accessToken),
  });
  const account = redditIdentityFromPayload(identity);
  const liveFingerprint = fingerprintArchiveConnectorExternalAccount("reddit", account.rawExternalAccountId);
  if (liveFingerprint !== input.externalAccountFingerprint) throw accountMismatch();

  const saved = await sourcePreviewRequest(
    `https://oauth.reddit.com/user/${encodeURIComponent(account.username)}/saved?limit=10&raw_json=1`,
    {
      method: "GET",
      headers: redditSourcePreviewHeaders(input.accessToken),
    },
  );
  return redditSavedItemsPreviewFromPayload(saved);
}

async function sourcePreviewRequest(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SOURCE_PREVIEW_TIMEOUT_MS);

  let response: Response;
  try {
    response = await sourcePreviewFetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch {
    throw providerFailed();
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 401 || response.status === 403) {
    throw new ArchiveConnectorSourcePreviewError(
      "archive_connector_source_preview_reconnect_required",
      "Archive connector source preview requires reconnect."
    );
  }
  if (response.status === 429) {
    throw new ArchiveConnectorSourcePreviewError(
      "archive_connector_source_preview_rate_limited",
      "Archive connector source preview was rate limited."
    );
  }
  if (!response.ok) throw providerFailed();

  try {
    return await response.json() as unknown;
  } catch {
    throw providerResponseInvalid();
  }
}

function redditSourcePreviewHeaders(accessToken: string) {
  return {
    "Accept": "application/json",
    "Authorization": `Bearer ${accessToken}`,
    "User-Agent": REDDIT_SOURCE_PREVIEW_USER_AGENT,
  };
}

function redditIdentityFromPayload(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw providerResponseInvalid();
  const record = payload as Record<string, unknown>;
  return {
    rawExternalAccountId: rawAccountIdFromValue(record.id),
    username: redditUsernameFromValue(record.name),
  };
}

function redditSavedItemsPreviewFromPayload(payload: unknown): ArchiveConnectorSourcePreviewReadback {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw providerResponseInvalid();
  const data = (payload as Record<string, unknown>).data;
  if (!data || typeof data !== "object" || Array.isArray(data)) throw providerResponseInvalid();

  const record = data as Record<string, unknown>;
  if (!Array.isArray(record.children)) throw providerResponseInvalid();
  const after = record.after;
  if (after != null && typeof after !== "string") throw providerResponseInvalid();

  const counters = { postCount: 0, commentCount: 0, otherCount: 0 };
  for (const child of record.children.slice(0, 10)) {
    if (!child || typeof child !== "object" || Array.isArray(child)) throw providerResponseInvalid();
    const kind = (child as Record<string, unknown>).kind;
    if (typeof kind !== "string") throw providerResponseInvalid();

    if (kind === "t3") {
      counters.postCount += 1;
    } else if (kind === "t1") {
      counters.commentCount += 1;
    } else {
      counters.otherCount += 1;
    }
  }

  return {
    pageLimit: 10,
    itemCount: counters.postCount + counters.commentCount + counters.otherCount,
    postCount: counters.postCount,
    commentCount: counters.commentCount,
    otherCount: counters.otherCount,
    truncated: typeof after === "string" && after.trim().length > 0,
    contentReturned: false,
  };
}

function rawAccountIdFromValue(value: unknown) {
  if (typeof value !== "string") throw providerResponseInvalid();
  const trimmed = value.trim();
  if (
    trimmed.length < 1 ||
    trimmed.length > 200 ||
    /[\u0000-\u001f\u007f]/.test(trimmed)
  ) {
    throw providerResponseInvalid();
  }
  return trimmed;
}

function redditUsernameFromValue(value: unknown) {
  if (typeof value !== "string") throw providerResponseInvalid();
  const trimmed = value.trim();
  if (!/^[A-Za-z0-9_-]{3,20}$/.test(trimmed)) throw providerResponseInvalid();
  return trimmed;
}

function accountMismatch() {
  return new ArchiveConnectorSourcePreviewError(
    "archive_connector_source_preview_account_mismatch",
    "Archive connector source preview account proof does not match the connected account."
  );
}

function providerFailed() {
  return new ArchiveConnectorSourcePreviewError(
    "archive_connector_source_preview_provider_failed",
    "Archive connector source preview provider request failed."
  );
}

function providerResponseInvalid() {
  return new ArchiveConnectorSourcePreviewError(
    "archive_connector_source_preview_provider_response_invalid",
    "Archive connector source preview provider response was invalid."
  );
}

import { createHash } from "crypto";
import type { ArchiveConnectorProviderId } from "./credential-contract";

export type ArchiveConnectorSourceInventoryErrorCode =
  | "archive_connector_source_inventory_reconnect_required"
  | "archive_connector_source_inventory_rate_limited"
  | "archive_connector_source_inventory_provider_failed"
  | "archive_connector_source_inventory_provider_response_invalid";

export type ArchiveConnectorSourceAvailability = "available" | "deferred" | "unsupported";

export type ArchiveConnectorSourceInventoryRow = {
  provider: ArchiveConnectorProviderId;
  purpose: "archive_connector";
  ownerOnly: true;
  sourceFamily: "reddit_subreddit_memberships" | "reddit_user_history" | "discord_guilds";
  sourceKind: string;
  label: string;
  sourceKey: string;
  availability: ArchiveConnectorSourceAvailability;
  truncated: boolean;
  sourceBodyReadEnabled: false;
  importWritesEnabled: false;
  jobWritesEnabled: false;
  queueEnabled: false;
  publicWritesEnabled: false;
  rawProviderIdReadbackEnabled: false;
  providerPayloadReadbackEnabled: false;
};

export type ArchiveConnectorSourceInventoryReadback = {
  provider: ArchiveConnectorProviderId;
  purpose: "archive_connector";
  ownerOnly: true;
  sources: ArchiveConnectorSourceInventoryRow[];
  truncated: boolean;
};

export class ArchiveConnectorSourceInventoryError extends Error {
  constructor(public readonly code: ArchiveConnectorSourceInventoryErrorCode, message: string) {
    super(message);
    this.name = "ArchiveConnectorSourceInventoryError";
  }
}

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

const SOURCE_INVENTORY_TIMEOUT_MS = 5000;
const REDDIT_SOURCE_INVENTORY_USER_AGENT = "StationArchiveConnector/1.0 source-inventory";

let sourceInventoryFetch: FetchLike = (input, init) => fetch(input, init);

export function setArchiveConnectorSourceInventoryFetchForTests(fetcher: FetchLike | null) {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("setArchiveConnectorSourceInventoryFetchForTests can only be used while NODE_ENV is test.");
  }
  sourceInventoryFetch = fetcher ?? ((input, init) => fetch(input, init));
}

export async function readArchiveConnectorProviderSourceInventory(input: {
  provider: ArchiveConnectorProviderId;
  accessToken: string;
}): Promise<ArchiveConnectorSourceInventoryReadback> {
  if (input.provider === "reddit") {
    const payload = await sourceInventoryRequest(
      "https://oauth.reddit.com/subreddits/mine/subscriber?limit=100&raw_json=1",
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${input.accessToken}`,
          "User-Agent": REDDIT_SOURCE_INVENTORY_USER_AGENT,
        },
      },
    );
    return redditSourceInventoryFromPayload(payload);
  }

  const payload = await sourceInventoryRequest(
    "https://discord.com/api/v10/users/@me/guilds?limit=200&with_counts=false",
    {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${input.accessToken}`,
      },
    },
  );
  return discordSourceInventoryFromPayload(payload);
}

async function sourceInventoryRequest(url: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SOURCE_INVENTORY_TIMEOUT_MS);

  let response: Response;
  try {
    response = await sourceInventoryFetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch {
    throw providerFailed();
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 401 || response.status === 403) {
    throw new ArchiveConnectorSourceInventoryError(
      "archive_connector_source_inventory_reconnect_required",
      "Archive connector source inventory requires reconnect."
    );
  }
  if (response.status === 429) {
    throw new ArchiveConnectorSourceInventoryError(
      "archive_connector_source_inventory_rate_limited",
      "Archive connector source inventory was rate limited."
    );
  }
  if (!response.ok) throw providerFailed();

  try {
    return await response.json() as unknown;
  } catch {
    throw providerResponseInvalid();
  }
}

function redditSourceInventoryFromPayload(payload: unknown): ArchiveConnectorSourceInventoryReadback {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw providerResponseInvalid();
  const data = (payload as Record<string, unknown>).data;
  if (!data || typeof data !== "object" || Array.isArray(data)) throw providerResponseInvalid();

  const record = data as Record<string, unknown>;
  if (!Array.isArray(record.children)) throw providerResponseInvalid();
  const after = record.after;
  if (after != null && typeof after !== "string") throw providerResponseInvalid();

  const truncated = typeof after === "string" && after.trim().length > 0;
  const subredditRows = record.children.slice(0, 100).map((child) => redditSubredditRowFromChild(child, truncated));
  return {
    provider: "reddit",
    purpose: "archive_connector",
    ownerOnly: true,
    sources: [
      ...subredditRows,
      ...redditHistoryRows(),
    ],
    truncated,
  };
}

function redditSubredditRowFromChild(child: unknown, truncated: boolean): ArchiveConnectorSourceInventoryRow {
  if (!child || typeof child !== "object" || Array.isArray(child)) throw providerResponseInvalid();
  const data = (child as Record<string, unknown>).data;
  if (!data || typeof data !== "object" || Array.isArray(data)) throw providerResponseInvalid();

  const record = data as Record<string, unknown>;
  const rawId = rawProviderId(record.id);
  const label = safeSourceLabel(record.display_name_prefixed) ?? safeSourceLabel(record.display_name);
  if (!label) throw providerResponseInvalid();

  return sourceRow({
    provider: "reddit",
    sourceFamily: "reddit_subreddit_memberships",
    sourceKind: "subreddit",
    label,
    sourceKeySeed: rawId,
    availability: "available",
    truncated,
  });
}

function redditHistoryRows(): ArchiveConnectorSourceInventoryRow[] {
  const categories = [
    ["saved_items", "Saved items"],
    ["upvoted_items", "Upvoted items"],
    ["downvoted_items", "Downvoted items"],
    ["submitted_posts", "Submitted posts"],
    ["comments", "Comments"],
    ["hidden_items", "Hidden items"],
  ] as const;

  return categories.map(([sourceKind, label]) => sourceRow({
    provider: "reddit",
    sourceFamily: "reddit_user_history",
    sourceKind,
    label,
    sourceKeySeed: sourceKind,
    availability: "available",
    truncated: false,
  }));
}

function discordSourceInventoryFromPayload(payload: unknown): ArchiveConnectorSourceInventoryReadback {
  if (!Array.isArray(payload)) throw providerResponseInvalid();

  const sources = payload.slice(0, 200).map((guild) => {
    if (!guild || typeof guild !== "object" || Array.isArray(guild)) throw providerResponseInvalid();
    const record = guild as Record<string, unknown>;
    const rawId = rawProviderId(record.id);
    const label = safeSourceLabel(record.name);
    if (!label) throw providerResponseInvalid();

    return sourceRow({
      provider: "discord",
      sourceFamily: "discord_guilds",
      sourceKind: "guild",
      label,
      sourceKeySeed: rawId,
      availability: "available",
      truncated: false,
    });
  });

  return {
    provider: "discord",
    purpose: "archive_connector",
    ownerOnly: true,
    sources,
    truncated: false,
  };
}

function sourceRow(input: {
  provider: ArchiveConnectorProviderId;
  sourceFamily: ArchiveConnectorSourceInventoryRow["sourceFamily"];
  sourceKind: string;
  label: string;
  sourceKeySeed: string;
  availability: ArchiveConnectorSourceAvailability;
  truncated: boolean;
}): ArchiveConnectorSourceInventoryRow {
  return {
    provider: input.provider,
    purpose: "archive_connector",
    ownerOnly: true,
    sourceFamily: input.sourceFamily,
    sourceKind: input.sourceKind,
    label: input.label,
    sourceKey: opaqueSourceKey(input.provider, input.sourceFamily, input.sourceKeySeed),
    availability: input.availability,
    truncated: input.truncated,
    sourceBodyReadEnabled: false,
    importWritesEnabled: false,
    jobWritesEnabled: false,
    queueEnabled: false,
    publicWritesEnabled: false,
    rawProviderIdReadbackEnabled: false,
    providerPayloadReadbackEnabled: false,
  };
}

function rawProviderId(value: unknown) {
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

function safeSourceLabel(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (
    !trimmed ||
    trimmed.length > 100 ||
    /[\u0000-\u001f\u007f]/.test(trimmed) ||
    /token|secret|cookie|credential|oauth|code|private|body|snippet|payload|external|account[_ -]?id|bearer|sk-/i.test(trimmed)
  ) {
    return null;
  }
  return trimmed;
}

function opaqueSourceKey(
  provider: ArchiveConnectorProviderId,
  sourceFamily: ArchiveConnectorSourceInventoryRow["sourceFamily"],
  seed: string,
) {
  return createHash("sha256")
    .update(`station.archive_connector.source_inventory:${provider}:${sourceFamily}:${seed}`)
    .digest("hex")
    .slice(0, 24);
}

function providerFailed() {
  return new ArchiveConnectorSourceInventoryError(
    "archive_connector_source_inventory_provider_failed",
    "Archive connector source inventory provider request failed."
  );
}

function providerResponseInvalid() {
  return new ArchiveConnectorSourceInventoryError(
    "archive_connector_source_inventory_provider_response_invalid",
    "Archive connector source inventory provider response was invalid."
  );
}

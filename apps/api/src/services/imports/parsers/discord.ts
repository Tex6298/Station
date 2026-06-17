import type { ParsedImport } from "./types";

type DiscordTurn = {
  role: string;
  text: string;
  createdAt: number | null;
  index: number;
};

export function parseDiscordExport(parsed: unknown, sourceName: string): ParsedImport | null {
  const source = normalizeDiscordSource(parsed);
  if (!source) return null;

  const turns = source.messages
    .map((message, index) => normalizeDiscordMessage(message, index, source))
    .filter((turn): turn is DiscordTurn => Boolean(turn))
    .sort((a, b) => {
      if (a.createdAt === b.createdAt) return a.index - b.index;
      if (a.createdAt === null) return 1;
      if (b.createdAt === null) return -1;
      return a.createdAt - b.createdAt;
    });

  if (turns.length === 0) return null;

  return {
    format: "discord",
    text: turns.map((turn) => `[${turn.role}]: ${turn.text}`).join("\n"),
    metadata: {
      parser: "discord",
      sourceName,
      messageCount: turns.length,
      title: titleForSource(source),
      serverName: source.serverName,
      guildName: source.guildName,
      channelName: source.channelName,
      exportedAt: source.exportedAt,
    },
  };
}

function normalizeDiscordSource(parsed: unknown): {
  messages: unknown[];
  serverName?: string;
  guildName?: string;
  channelName?: string;
  exportedAt?: string;
  sourceMarked: boolean;
} | null {
  if (Array.isArray(parsed)) {
    return null;
  }

  if (!isRecord(parsed)) return null;

  if (Array.isArray(parsed.messages) && hasDiscordSourceMarker(parsed)) {
    return {
      messages: parsed.messages,
      serverName: serverNameFor(parsed),
      guildName: guildNameFor(parsed),
      channelName: channelNameFor(parsed),
      exportedAt: stringValue(parsed, ["exportedAt", "exported_at", "exportedTimestamp", "exportDate"]),
      sourceMarked: true,
    };
  }

  return null;
}

function normalizeDiscordMessage(
  message: unknown,
  index: number,
  source: { serverName?: string; guildName?: string; channelName?: string; sourceMarked: boolean }
): DiscordTurn | null {
  if (!isRecord(message) || !isDiscordMessageLike(message, source.sourceMarked)) return null;

  const content = normalizeText(stringValue(message, ["content", "text"]));
  const attachmentText = attachmentSummary(message);
  const embedText = embedSummary(message);
  const text = [content, attachmentText, embedText].filter(Boolean).join(" ");
  if (!text) return null;

  const author = authorName(message.author) ?? authorName(message.user) ?? stringValue(message, ["authorName", "username"]) ?? "unknown";
  const server = source.serverName ?? source.guildName ?? stringValue(message, ["serverName", "guildName"]);
  const channel = source.channelName ?? stringValue(message, ["channelName", "threadName"]);
  const roleParts = ["discord", server, channel, author].filter(Boolean);
  const created = timeValue(message, ["timestamp", "createdAt", "created_at"]);

  return {
    role: roleParts.join("/"),
    text,
    createdAt: created,
    index,
  };
}

function hasDiscordSourceMarker(row: Record<string, unknown>) {
  return Boolean(
    stringValue(row, ["guildName", "serverName", "channelName", "channelId", "guildId", "serverId"]) ||
    isRecord(row.guild) ||
    isRecord(row.server) ||
    isRecord(row.channel)
  );
}

function isDiscordMessageLike(message: unknown, allowAuthorMarker: boolean) {
  if (!isRecord(message)) return false;
  if (!stringValue(message, ["content", "text"]) && !hasDiscordAttachmentOrEmbed(message)) return false;

  return Boolean(
    (allowAuthorMarker && (isDiscordAuthor(message.author) || isDiscordAuthor(message.user))) ||
    hasDiscordAttachmentOrEmbed(message) ||
    stringValue(message, ["messageId", "channelId", "guildId", "serverId", "discordId"]) ||
    stringValue(message, ["messageType", "type"]) ||
    Array.isArray(message.mentions) ||
    Array.isArray(message.reactions)
  );
}

function isDiscordAuthor(value: unknown) {
  return isRecord(value) && Boolean(
    stringValue(value, ["id", "name", "username", "displayName", "nickname", "tag"]) ||
    value.isBot !== undefined ||
    value.bot !== undefined
  );
}

function serverNameFor(row: Record<string, unknown>) {
  return stringValue(row, ["serverName"]) ??
    nestedString(row.server, ["name"]) ??
    nestedString(row.guild, ["name"]);
}

function guildNameFor(row: Record<string, unknown>) {
  return stringValue(row, ["guildName"]) ?? nestedString(row.guild, ["name"]);
}

function channelNameFor(row: Record<string, unknown>) {
  return stringValue(row, ["channelName", "threadName"]) ?? nestedString(row.channel, ["name"]);
}

function titleForSource(source: { serverName?: string; guildName?: string; channelName?: string }) {
  const server = source.serverName ?? source.guildName;
  if (server && source.channelName) return `${server} #${source.channelName}`;
  return source.channelName ?? server;
}

function authorName(value: unknown) {
  if (!isRecord(value)) return undefined;
  return stringValue(value, ["displayName", "nickname", "name", "username", "tag", "id"]);
}

function hasDiscordAttachmentOrEmbed(message: Record<string, unknown>) {
  return Array.isArray(message.attachments) || Array.isArray(message.embeds);
}

function attachmentSummary(message: Record<string, unknown>) {
  if (!Array.isArray(message.attachments) || message.attachments.length === 0) return "";
  const names = message.attachments
    .map((attachment) => isRecord(attachment) ? stringValue(attachment, ["fileName", "filename", "name", "url"]) : undefined)
    .filter(Boolean)
    .slice(0, 3);
  return names.length > 0 ? `[attachments: ${names.join(", ")}]` : "[attachments]";
}

function embedSummary(message: Record<string, unknown>) {
  if (!Array.isArray(message.embeds) || message.embeds.length === 0) return "";
  const names = message.embeds
    .map((embed) => isRecord(embed) ? stringValue(embed, ["title", "description", "url"]) : undefined)
    .filter(Boolean)
    .slice(0, 3);
  return names.length > 0 ? `[embeds: ${names.join(", ")}]` : "[embeds]";
}

function normalizeText(value?: string) {
  if (!value) return "";
  return value.replace(/\s+/g, " ").trim();
}

function nestedString(value: unknown, keys: string[]) {
  return isRecord(value) ? stringValue(value, keys) : undefined;
}

function stringValue(row: unknown, keys: string[]) {
  if (!isRecord(row)) return undefined;
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return undefined;
}

function timeValue(row: unknown, keys: string[]) {
  const value = stringValue(row, keys);
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

import type { ParsedImport } from "./types";

type RedditTurn = {
  role: string;
  text: string;
  createdAt: number | null;
  index: number;
  permalink?: string;
};

export function parseRedditExport(parsed: unknown, sourceName: string): ParsedImport | null {
  const source = normalizeRedditSource(parsed);
  if (!source) return null;

  const turns = source.items
    .map((item, index) => normalizeRedditItem(item, index))
    .filter((turn): turn is RedditTurn => Boolean(turn))
    .sort((a, b) => {
      if (a.createdAt === b.createdAt) return a.index - b.index;
      if (a.createdAt === null) return 1;
      if (b.createdAt === null) return -1;
      return a.createdAt - b.createdAt;
    });

  if (turns.length === 0) return null;

  return {
    format: "reddit",
    text: turns.map((turn) => {
      const suffix = turn.permalink ? ` (${turn.permalink})` : "";
      return `[${turn.role}]: ${turn.text}${suffix}`;
    }).join("\n"),
    metadata: {
      parser: "reddit",
      sourceName,
      messageCount: turns.length,
      title: source.title,
      subreddit: source.subreddit,
      permalink: source.permalink,
    },
  };
}

function normalizeRedditSource(parsed: unknown): {
  items: unknown[];
  title?: string;
  subreddit?: string;
  permalink?: string;
} | null {
  if (Array.isArray(parsed)) {
    const listing = parsed.find((item) => isRedditListing(item));
    if (listing && isRecord(listing.data) && Array.isArray(listing.data.children)) {
      return metadataForItems(listing.data.children.map(childData), listing.data.children);
    }

    const threadItems = parsed.filter(isRedditThreadLike);
    if (threadItems.length > 0 && threadItems.length === parsed.length) {
      return metadataForItems(threadItems.flatMap(threadItemsWithReplies), threadItems);
    }

    const redditItems = parsed.map(childData).filter(isUnmistakableRedditItem);
    if (redditItems.length > 0 && redditItems.length === parsed.length) {
      return metadataForItems(parsed, parsed);
    }

    return null;
  }

  if (!isRecord(parsed)) return null;

  if (isRedditListing(parsed) && isRecord(parsed.data) && Array.isArray(parsed.data.children)) {
    return metadataForItems(parsed.data.children.map(childData), parsed.data.children);
  }

  if (isRedditThreadLike(parsed)) {
    const items = threadItemsWithReplies(parsed);
    return metadataForItems(items, items);
  }

  return null;
}

function metadataForItems(items: unknown[], rawItems: unknown[]) {
  const rows = [...items, ...rawItems].map(childData).filter(isRecord);
  const title = firstStringValue(rows, ["title", "link_title", "thread_title"]);
  const subreddit = firstStringValue(rows, ["subreddit", "subreddit_name_prefixed"]);
  const titleRow = rows.find((row) => stringValue(row, ["title", "link_title", "thread_title"]));
  const permalink = stringValue(titleRow, ["permalink", "url"]) ?? firstStringValue(rows, ["permalink", "url"]);
  return { items, title, subreddit, permalink };
}

function childData(item: unknown) {
  if (!isRecord(item)) return item;
  return isRecord(item.data) ? item.data : item;
}

function isRedditListing(value: unknown) {
  if (!isRecord(value) || !isRecord(value.data) || !Array.isArray(value.data.children)) return false;
  return value.data.children.some((child) => isUnmistakableRedditItem(childData(child)) || isRedditKind(child));
}

function isRedditThreadLike(value: unknown) {
  const row = childData(value);
  return isRecord(row) &&
    (Array.isArray(row.comments) || Array.isArray(row.children)) &&
    isUnmistakableRedditItem(row);
}

function threadItemsWithReplies(item: unknown) {
  const row = childData(item);
  if (!isRecord(row)) return [];
  return [
    row,
    ...(Array.isArray(row.comments) ? row.comments : []),
    ...(Array.isArray(row.children) ? row.children : []),
  ];
}

function normalizeRedditItem(item: unknown, index: number): RedditTurn | null {
  const row = childData(item);
  if (!isRecord(row)) return null;
  if (!isUnmistakableRedditItem(row)) return null;

  const text = normalizeText(
    stringValue(row, ["body", "selftext", "text"])
  );
  const title = normalizeText(
    stringValue(row, ["title", "link_title", "thread_title"])
  );
  const content = [title, text].filter(Boolean).join(" - ");
  if (!content) return null;

  const author = stringValue(row, ["author"]) ?? "unknown";
  const subreddit = stringValue(row, ["subreddit", "subreddit_name_prefixed"]);
  const role = subreddit ? `reddit/${subreddit}/${author}` : `reddit/${author}`;
  const created = numberValue(row, ["created_utc", "created"]);
  const permalink = stringValue(row, ["permalink", "url"]);

  return {
    role,
    text: content,
    createdAt: created,
    index,
    permalink,
  };
}

function isUnmistakableRedditItem(row: unknown) {
  if (!isRecord(row)) return false;
  return isRedditKind(row) ||
    Boolean(stringValue(row, ["subreddit", "subreddit_name_prefixed", "permalink"]));
}

function isRedditKind(row: unknown) {
  if (!isRecord(row)) return false;
  return row.kind === "t1" || row.kind === "t3" || row.kind === "Listing";
}

function normalizeText(value?: string) {
  if (!value) return "";
  if (value === "[deleted]" || value === "[removed]") return "";
  return value.replace(/\s+/g, " ").trim();
}

function stringValue(row: unknown, keys: string[]) {
  if (!isRecord(row)) return undefined;
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function firstStringValue(rows: Array<Record<string, unknown>>, keys: string[]) {
  for (const row of rows) {
    const value = stringValue(row, keys);
    if (value) return value;
  }
  return undefined;
}

function numberValue(row: unknown, keys: string[]) {
  if (!isRecord(row)) return null;
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

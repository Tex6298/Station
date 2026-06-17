import { parseChatGptExport } from "./chatgpt";
import { parseClaudeExport } from "./claude";
import { parseRedditExport } from "./reddit";
import { ImportParseError, type ParsedImport, type ParseImportFileInput } from "./types";

export { ImportParseError };
export type { ParsedImport, ParsedImportFormat, ParseImportFileInput } from "./types";

export function parseImportFile(input: ParseImportFileInput): ParsedImport {
  const sourceName = input.fileName.trim() || "Imported file";
  const extension = extensionFor(sourceName);
  const mime = input.fileType?.toLowerCase() ?? "";

  if (isJsonFile(extension, mime)) {
    return parseJsonImport(input.rawText, sourceName);
  }

  if (isTextFile(extension, mime)) {
    return {
      format: extension === ".md" || extension === ".markdown" ? "markdown" : "text",
      text: input.rawText,
      metadata: {
        parser: extension === ".md" || extension === ".markdown" ? "markdown" : "text",
        sourceName,
      },
    };
  }

  throw new ImportParseError("Unsupported import file type. Upload plain text, Markdown, ChatGPT JSON, or Claude JSON.");
}

function parseJsonImport(rawText: string, sourceName: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new ImportParseError("Malformed JSON import. Upload a valid ChatGPT or Claude export JSON file.");
  }

  const conversation =
    parseChatGptExport(parsed, sourceName) ??
    parseClaudeExport(parsed, sourceName) ??
    parseRedditExport(parsed, sourceName) ??
    parseLegacyMessageArray(parsed, sourceName);

  if (!conversation) {
    throw new ImportParseError("Unsupported JSON import format. Upload a ChatGPT, Claude, or Reddit archive export.");
  }

  return conversation;
}

function parseLegacyMessageArray(parsed: unknown, sourceName: string): ParsedImport | null {
  if (!Array.isArray(parsed)) return null;

  const turns = parsed
    .map((message) => {
      if (!isRecord(message)) return null;
      const role = typeof message.role === "string" && message.role.trim() ? message.role.trim() : null;
      const content = typeof message.content === "string" && message.content.trim() ? message.content.trim() : null;
      if (!role || !content) return null;
      return { role, content };
    })
    .filter((turn): turn is { role: string; content: string } => Boolean(turn));

  if (turns.length === 0) return null;

  return {
    format: "legacy-message-array",
    text: turns.map((turn) => `[${turn.role}]: ${turn.content}`).join("\n"),
    metadata: {
      parser: "legacy-message-array",
      sourceName,
      messageCount: turns.length,
    },
  };
}

function isTextFile(extension: string, mime: string) {
  return (
    extension === ".txt" ||
    extension === ".text" ||
    extension === ".md" ||
    extension === ".markdown" ||
    mime.startsWith("text/") ||
    mime === "text/markdown"
  );
}

function isJsonFile(extension: string, mime: string) {
  return extension === ".json" || mime === "application/json" || mime.endsWith("+json");
}

function extensionFor(fileName: string) {
  const normalized = fileName.toLowerCase();
  const dot = normalized.lastIndexOf(".");
  return dot >= 0 ? normalized.slice(dot) : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

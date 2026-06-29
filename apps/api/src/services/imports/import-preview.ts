import {
  ImportParseError,
  parseImportFile,
  type ParsedImport,
  type ParsedImportFormat,
} from "./parsers";

export type ImportPreviewSourceKind = "paste" | "file";

export interface BuildImportPreviewInput {
  sourceKind: ImportPreviewSourceKind;
  sourceName: string;
  fileType: string | null;
  rawText: string;
}

export interface ImportPreviewResponse {
  status: "preview_ready";
  sourceKind: ImportPreviewSourceKind;
  sourceLabel: string;
  format: ParsedImportFormat;
  formatLabel: string;
  sourceFamily: string;
  estimatedCharacters: number;
  estimatedLineCount: number;
  messageCount: number | null;
  noWritePerformed: true;
  nextOwnerAction: string;
  safety: {
    rawSourceReturned: false;
    storageReserved: false;
    importJobCreated: false;
    archiveWritten: false;
    importReviewCreated: false;
    providerCalls: false;
  };
}

export function buildImportPreview(input: BuildImportPreviewInput): ImportPreviewResponse {
  const parsed = parseImportFile({
    fileName: parserFileName(input),
    fileType: parserFileType(input),
    rawText: input.rawText,
  });

  return previewFromParsedImport(parsed, input);
}

export function importPreviewParseErrorBody(error: unknown) {
  if (error instanceof ImportParseError) {
    return {
      error: error.message,
      code: "import_preview_parse_failed",
      noWritePerformed: true,
    };
  }

  return {
    error: "Could not preview this import source.",
    code: "import_preview_failed",
    noWritePerformed: true,
  };
}

function previewFromParsedImport(
  parsed: ParsedImport,
  input: BuildImportPreviewInput
): ImportPreviewResponse {
  return {
    status: "preview_ready",
    sourceKind: input.sourceKind,
    sourceLabel: sanitizeImportPreviewLabel(input.sourceName || parsed.metadata.sourceName),
    format: parsed.format,
    formatLabel: importPreviewFormatLabel(parsed.format),
    sourceFamily: importPreviewSourceFamily(parsed.format),
    estimatedCharacters: parsed.text.length,
    estimatedLineCount: countNonEmptyLines(parsed.text),
    messageCount: typeof parsed.metadata.messageCount === "number" ? parsed.metadata.messageCount : null,
    noWritePerformed: true,
    nextOwnerAction: "Review this summary, then confirm import to write private archive material for this persona.",
    safety: {
      rawSourceReturned: false,
      storageReserved: false,
      importJobCreated: false,
      archiveWritten: false,
      importReviewCreated: false,
      providerCalls: false,
    },
  };
}

function parserFileName(input: BuildImportPreviewInput) {
  const sourceName = input.sourceName.trim();
  if (input.sourceKind === "paste") {
    return looksJson(sourceName, input.rawText) ? safePreviewFileName(sourceName, "pasted-archive.json") : "pasted-archive.txt";
  }

  return safePreviewFileName(sourceName, "local-import.txt");
}

function parserFileType(input: BuildImportPreviewInput) {
  if (input.sourceKind === "paste") {
    return looksJson(input.sourceName, input.rawText) ? "application/json" : "text/plain";
  }

  return input.fileType;
}

function safePreviewFileName(value: string, fallback: string) {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const basename = trimmed
    .replace(/\\/g, "/")
    .split("/")
    .filter(Boolean)
    .pop();

  if (!basename || UNSAFE_LABEL_PATTERN.test(basename)) return fallback;
  return basename.slice(0, 180);
}

function looksJson(sourceName: string, rawText: string) {
  const trimmed = rawText.trim();
  return /\.json$/i.test(sourceName.trim()) || trimmed.startsWith("{") || trimmed.startsWith("[");
}

function importPreviewFormatLabel(format: ParsedImportFormat) {
  if (format === "chatgpt") return "ChatGPT JSON export";
  if (format === "claude") return "Claude JSON export";
  if (format === "reddit") return "Reddit JSON archive";
  if (format === "discord") return "Discord JSON archive";
  if (format === "legacy-message-array") return "Legacy role/content JSON";
  if (format === "markdown") return "Markdown source";
  return "Plain text source";
}

function importPreviewSourceFamily(format: ParsedImportFormat) {
  if (format === "chatgpt" || format === "claude") return "conversation_export";
  if (format === "reddit" || format === "discord") return "community_export";
  if (format === "legacy-message-array") return "legacy_conversation_export";
  return "local_text";
}

function sanitizeImportPreviewLabel(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Imported source";
  if (UNSAFE_LABEL_PATTERN.test(trimmed) || /[\\/]/.test(trimmed)) return "Imported source";

  const redacted = trimmed
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "[id]")
    .replace(SECRET_SHAPED_VALUE_PATTERN, "[redacted-secret]")
    .replace(/\b(?:bearer)\s+\S+/gi, "bearer [redacted]")
    .replace(/\b(token|cookie|authorization|api[_-]?key|x-api-key|secret|password)\b\s*[:=]\s*\S+/gi, "$1=[redacted]");

  return redacted.length > 120 ? `${redacted.slice(0, 117).trim()}...` : redacted;
}

function countNonEmptyLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean).length;
}

const UNSAFE_LABEL_PATTERN =
  /https?:|bearer|token|authorization|cookie|secret|password|api[_-]?key|x-api-key|storage(?:[_\s-]?path|Path)|upload(?:[_\s-]?url|Url)|signed(?:[_\s-]?url|Url)/i;

const SECRET_SHAPED_VALUE_PATTERN = /\b(?:sk|pk|rk|whsec|ghp|pat)[_-][A-Za-z0-9._-]+/gi;

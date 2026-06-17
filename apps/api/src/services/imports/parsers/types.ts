export type ParsedImportFormat = "text" | "markdown" | "chatgpt" | "claude" | "legacy-message-array";

export type ParsedImport = {
  format: ParsedImportFormat;
  text: string;
  metadata: {
    parser: ParsedImportFormat;
    sourceName: string;
    messageCount?: number;
    title?: string;
  };
};

export type ParseImportFileInput = {
  fileName: string;
  fileType: string | null;
  rawText: string;
};

export class ImportParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportParseError";
  }
}

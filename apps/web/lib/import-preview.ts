export interface ImportPreviewReadback {
  status: "preview_ready";
  sourceKind: "paste" | "file";
  sourceLabel: string;
  format: string;
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

export function importPreviewCanConfirm(
  preview: ImportPreviewReadback | null,
  previewKey: string | null,
  currentKey: string
) {
  return Boolean(preview && preview.noWritePerformed && previewKey && previewKey === currentKey);
}

export function importPreviewStatusCopy(preview: ImportPreviewReadback) {
  const messageCount = preview.messageCount == null
    ? "No structured message count"
    : `${preview.messageCount} ${preview.messageCount === 1 ? "message" : "messages"}`;
  const lines = `${preview.estimatedLineCount} ${preview.estimatedLineCount === 1 ? "line" : "lines"}`;

  return `${preview.formatLabel} previewed: ${preview.estimatedCharacters.toLocaleString()} characters, ${lines}, ${messageCount}.`;
}

export function importPreviewNoWriteCopy(preview: ImportPreviewReadback | null) {
  if (!preview) {
    return "Preview first. Import and upload actions stay disabled until this exact source has been previewed.";
  }

  return preview.nextOwnerAction;
}

export function importPreviewFailureCopy(error: unknown) {
  const fallback = "Could not preview this source. Existing archive material remains safe.";
  if (!(error instanceof Error) || !error.message.trim()) return fallback;

  if (/token|authorization|cookie|secret|password|api[_-]?key|storage|signed|upload|https?:|sql|postgres|stack|trace|private-source-marker/i.test(error.message)) {
    return fallback;
  }

  const firstSentence = error.message.split(/[.!?]\s/)[0]?.trim();
  return firstSentence ? `${firstSentence}. Existing archive material remains safe.` : fallback;
}

export function importPreviewInputKey(input: {
  sourceKind: "paste" | "file";
  sourceName: string;
  fileType?: string | null;
  size?: number | null;
  lastModified?: number | null;
  content: string;
}) {
  return [
    input.sourceKind,
    input.sourceName.trim(),
    input.fileType ?? "",
    input.size ?? "",
    input.lastModified ?? "",
    input.content.length,
    contentFingerprint(input.content),
  ].join("\u001f");
}

function contentFingerprint(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

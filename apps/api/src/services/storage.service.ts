import { getSupabaseAdmin } from "../lib/supabase";
import { TIER_LIMITS, type Tier } from "@station/config";

export class StorageLimitError extends Error {
  statusCode = 413;

  constructor(message = "Storage Limit Reached") {
    super(message);
    this.name = "StorageLimitError";
  }
}

export function estimateStorageBytes(value: string) {
  return Buffer.byteLength(value, "utf8");
}

export function storageLimitBytesForTier(tier: Tier | string) {
  const config = TIER_LIMITS[(tier as Tier) in TIER_LIMITS ? tier as Tier : "visitor"];
  return config.storageGb * 1024 * 1024 * 1024;
}

export async function reserveStorageBytes(ownerUserId: string, bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return null;

  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any).rpc("reserve_storage_bytes", {
    p_user_id: ownerUserId,
    p_bytes: Math.ceil(bytes),
  });

  if (error) {
    if (error.message.includes("Storage Limit Reached")) {
      throw new StorageLimitError();
    }
    throw new Error(error.message);
  }

  return data;
}

export async function releaseStorageBytes(ownerUserId: string, bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return null;

  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any).rpc("release_storage_bytes", {
    p_user_id: ownerUserId,
    p_bytes: Math.ceil(bytes),
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function getStorageUsage(ownerUserId: string) {
  const sb = getSupabaseAdmin();

  const { data: profile } = await sb
    .from("profiles")
    .select("tier")
    .eq("id", ownerUserId)
    .single();

  const fallbackLimit = storageLimitBytesForTier(profile?.tier ?? "visitor");

  const { data: usage } = await (sb as any)
    .from("storage_usage")
    .select("bytes_used, bytes_limit, updated_at")
    .eq("user_id", ownerUserId)
    .single();

  const [
    { data: files },
    { data: imports },
    { data: memories },
    { data: canon },
    { data: integrity },
    { data: documents },
    { data: archivedChats },
  ] = await Promise.all([
    sb.from("persona_files").select("file_size").eq("owner_user_id", ownerUserId),
    sb.from("import_jobs").select("source_name, error_message").eq("owner_user_id", ownerUserId),
    sb.from("memory_items").select("title, content, summary").eq("owner_user_id", ownerUserId),
    sb.from("canon_items").select("title, content").eq("owner_user_id", ownerUserId),
    sb.from("calibration_sessions").select("transcript, extracted_style_notes, extracted_public_rules, extracted_private_rules, extracted_uncertainty_rules").eq("owner_user_id", ownerUserId),
    sb.from("documents").select("title, body").eq("author_user_id", ownerUserId),
    sb.from("archived_chat_transcripts").select("title, transcript_markdown, source_summary").eq("owner_user_id", ownerUserId),
  ]);

  const uploadedFiles = (files ?? []).reduce((total: number, file: any) => total + (file.file_size ?? 0), 0);
  const importedContent = estimateRows(imports ?? [], ["source_name", "error_message"]);
  const memoryItems = estimateRows(memories ?? [], ["title", "content", "summary"]);
  const canonItems = estimateRows(canon ?? [], ["title", "content"]);
  const integritySessions = estimateRows(integrity ?? [], [
    "transcript",
    "extracted_style_notes",
    "extracted_public_rules",
    "extracted_private_rules",
    "extracted_uncertainty_rules",
  ]);
  const publishedDocuments = estimateRows(documents ?? [], ["title", "body"]);
  const archivedChatTranscripts = estimateRows(archivedChats ?? [], ["title", "transcript_markdown", "source_summary"]);

  return {
    bytesUsed: usage?.bytes_used ?? 0,
    bytesLimit: usage?.bytes_limit ?? fallbackLimit,
    percentUsed: percentage(usage?.bytes_used ?? 0, usage?.bytes_limit ?? fallbackLimit),
    updatedAt: usage?.updated_at ?? null,
    categories: {
      uploadedFiles,
      importedContent,
      memoryItems,
      canonItems,
      integritySessions,
      publishedDocuments,
      archivedChatTranscripts,
    },
  };
}

export function storageErrorResponse(error: unknown) {
  if (error instanceof StorageLimitError) {
    return { status: error.statusCode, body: { error: error.message } };
  }
  return null;
}

function estimateRows(rows: any[], keys: string[]) {
  return rows.reduce((total, row) => {
    const text = keys.map((key) => row[key]).filter(Boolean).join("\n");
    return total + estimateStorageBytes(text);
  }, 0);
}

function percentage(bytesUsed: number, bytesLimit: number) {
  if (bytesLimit <= 0) return 0;
  return Math.min(100, Math.round((bytesUsed / bytesLimit) * 1000) / 10);
}

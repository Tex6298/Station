import { createHash } from "crypto";
import { getSupabaseAdmin } from "../../lib/supabase";
import type { ArchiveConnectorProviderId } from "./credential-contract";
import { loadArchiveConnectorSourceInventoryCredentialSecret } from "./credential-storage";
import {
  readArchiveConnectorProviderSourceInventory,
  type ArchiveConnectorSourceInventoryRow,
} from "./source-inventory";

export type ArchiveConnectorImportIntentStatus = "pending" | "cancelled" | "activated";
export type ArchiveConnectorImportIntentSourceFamily = ArchiveConnectorSourceInventoryRow["sourceFamily"];

export type ArchiveConnectorImportIntentRow = {
  id: string;
  owner_user_id: string;
  persona_id: string;
  provider: ArchiveConnectorProviderId;
  purpose: "archive_connector";
  source_family: ArchiveConnectorImportIntentSourceFamily;
  source_kind: string;
  source_key: string;
  source_label: string;
  status: ArchiveConnectorImportIntentStatus;
  idempotency_fingerprint: string;
  activated_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type ArchiveConnectorImportIntentReadback = {
  id: string;
  provider: ArchiveConnectorProviderId;
  purpose: "archive_connector";
  personaId: string;
  sourceFamily: ArchiveConnectorImportIntentSourceFamily;
  sourceKind: string;
  sourceKey: string;
  sourceLabel: string;
  status: ArchiveConnectorImportIntentStatus;
  activatedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ArchiveConnectorImportIntentErrorCode =
  | "archive_connector_import_intent_not_found"
  | "archive_connector_import_intent_not_activatable"
  | "archive_connector_import_intent_persona_not_found"
  | "archive_connector_import_intent_source_unavailable"
  | "archive_connector_import_intent_load_failed"
  | "archive_connector_import_intent_write_failed";

export class ArchiveConnectorImportIntentError extends Error {
  constructor(public readonly code: ArchiveConnectorImportIntentErrorCode, message: string) {
    super(message);
    this.name = "ArchiveConnectorImportIntentError";
  }
}

export async function createArchiveConnectorImportIntent(input: {
  ownerUserId: string;
  provider: ArchiveConnectorProviderId;
  personaId: string;
  sourceFamily: ArchiveConnectorImportIntentSourceFamily;
  sourceKind: string;
  sourceKey: string;
  sourceLabel: string;
}) {
  await assertOwnedPersona(input.ownerUserId, input.personaId);

  const credential = await loadArchiveConnectorSourceInventoryCredentialSecret({
    ownerUserId: input.ownerUserId,
    provider: input.provider,
  });
  const inventory = await readArchiveConnectorProviderSourceInventory({
    provider: input.provider,
    accessToken: credential.accessToken,
  });
  const source = matchingAvailableSource(inventory.sources, input);
  if (!source) throw sourceUnavailable();

  const fingerprint = importIntentFingerprint({
    ownerUserId: input.ownerUserId,
    provider: input.provider,
    personaId: input.personaId,
    sourceFamily: source.sourceFamily,
    sourceKind: source.sourceKind,
    sourceKey: source.sourceKey,
    sourceLabel: source.label,
  });

  const existing = await loadPendingImportIntentByFingerprint(input.ownerUserId, fingerprint);
  if (existing) {
    return {
      created: false,
      duplicate: true,
      intent: serializeArchiveConnectorImportIntent(existing),
    };
  }

  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("archive_connector_import_intents")
    .insert({
      owner_user_id: input.ownerUserId,
      persona_id: input.personaId,
      provider: input.provider,
      purpose: "archive_connector",
      source_family: source.sourceFamily,
      source_kind: source.sourceKind,
      source_key: source.sourceKey,
      source_label: source.label,
      status: "pending",
      idempotency_fingerprint: fingerprint,
    })
    .select("*")
    .single();

  if (error || !data) {
    const duplicate = await loadPendingImportIntentByFingerprint(input.ownerUserId, fingerprint);
    if (duplicate) {
      return {
        created: false,
        duplicate: true,
        intent: serializeArchiveConnectorImportIntent(duplicate),
      };
    }
    throw new ArchiveConnectorImportIntentError(
      "archive_connector_import_intent_write_failed",
      "Could not create archive connector import intent."
    );
  }

  return {
    created: true,
    duplicate: false,
    intent: serializeArchiveConnectorImportIntent(data as ArchiveConnectorImportIntentRow),
  };
}

export async function activateArchiveConnectorImportIntent(input: {
  ownerUserId: string;
  intentId: string;
}) {
  const row = await loadImportIntentById(input.ownerUserId, input.intentId);
  if (row.status === "activated") {
    return {
      activated: false,
      duplicate: true,
      sourceInventoryChecked: false,
      activationWriteAttempted: false,
      intent: serializeArchiveConnectorImportIntent(row),
    };
  }
  if (row.status !== "pending") throw intentNotActivatable();

  await assertOwnedPersona(input.ownerUserId, row.persona_id);

  const credential = await loadArchiveConnectorSourceInventoryCredentialSecret({
    ownerUserId: input.ownerUserId,
    provider: row.provider,
  });
  const inventory = await readArchiveConnectorProviderSourceInventory({
    provider: row.provider,
    accessToken: credential.accessToken,
  });
  const source = matchingAvailableSource(inventory.sources, {
    provider: row.provider,
    sourceFamily: row.source_family,
    sourceKind: row.source_kind,
    sourceKey: row.source_key,
    sourceLabel: row.source_label,
  });
  if (!source) throw sourceUnavailable();

  const activatedAt = new Date().toISOString();
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("archive_connector_import_intents")
    .update({
      status: "activated",
      activated_at: activatedAt,
    })
    .eq("id", row.id)
    .eq("owner_user_id", input.ownerUserId)
    .eq("purpose", "archive_connector")
    .eq("status", "pending")
    .select("*")
    .single();

  if (error || !data) {
    const duplicate = await loadImportIntentById(input.ownerUserId, input.intentId);
    if (duplicate.status === "activated") {
      return {
        activated: false,
        duplicate: true,
        sourceInventoryChecked: true,
        activationWriteAttempted: true,
        intent: serializeArchiveConnectorImportIntent(duplicate),
      };
    }

    throw new ArchiveConnectorImportIntentError(
      "archive_connector_import_intent_write_failed",
      "Could not activate archive connector import intent."
    );
  }

  return {
    activated: true,
    duplicate: false,
    sourceInventoryChecked: true,
    activationWriteAttempted: true,
    intent: serializeArchiveConnectorImportIntent(data as ArchiveConnectorImportIntentRow),
  };
}

function matchingAvailableSource(
  sources: ArchiveConnectorSourceInventoryRow[],
  input: {
    provider: ArchiveConnectorProviderId;
    sourceFamily: ArchiveConnectorImportIntentSourceFamily;
    sourceKind: string;
    sourceKey: string;
    sourceLabel: string;
  },
) {
  const matches = sources.filter((source) =>
    source.provider === input.provider &&
    source.purpose === "archive_connector" &&
    source.ownerOnly === true &&
    source.availability === "available" &&
    source.sourceFamily === input.sourceFamily &&
    source.sourceKind === input.sourceKind &&
    source.sourceKey === input.sourceKey &&
    source.label === input.sourceLabel &&
    source.sourceBodyReadEnabled === false &&
    source.importWritesEnabled === false &&
    source.jobWritesEnabled === false &&
    source.queueEnabled === false &&
    source.publicWritesEnabled === false &&
    source.rawProviderIdReadbackEnabled === false &&
    source.providerPayloadReadbackEnabled === false
  );

  return matches.length === 1 ? matches[0] : null;
}

async function assertOwnedPersona(ownerUserId: string, personaId: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("personas")
    .select("id")
    .eq("id", personaId)
    .eq("owner_user_id", ownerUserId)
    .single();

  if (error || !data) {
    throw new ArchiveConnectorImportIntentError(
      "archive_connector_import_intent_persona_not_found",
      "Archive connector import intent persona was not found."
    );
  }
}

async function loadPendingImportIntentByFingerprint(ownerUserId: string, fingerprint: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("archive_connector_import_intents")
    .select("*")
    .eq("owner_user_id", ownerUserId)
    .eq("purpose", "archive_connector")
    .eq("status", "pending")
    .eq("idempotency_fingerprint", fingerprint)
    .order("created_at", { ascending: false });

  if (error) {
    throw new ArchiveConnectorImportIntentError(
      "archive_connector_import_intent_load_failed",
      "Could not load archive connector import intents."
    );
  }

  return ((data ?? []) as ArchiveConnectorImportIntentRow[])[0] ?? null;
}

async function loadImportIntentById(ownerUserId: string, intentId: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("archive_connector_import_intents")
    .select("*")
    .eq("id", intentId)
    .eq("owner_user_id", ownerUserId)
    .eq("purpose", "archive_connector");

  if (error) {
    throw new ArchiveConnectorImportIntentError(
      "archive_connector_import_intent_load_failed",
      "Could not load archive connector import intent."
    );
  }

  const row = ((data ?? []) as ArchiveConnectorImportIntentRow[])[0] ?? null;
  if (!row) {
    throw new ArchiveConnectorImportIntentError(
      "archive_connector_import_intent_not_found",
      "Archive connector import intent was not found."
    );
  }
  return row;
}

export function serializeArchiveConnectorImportIntent(
  row: ArchiveConnectorImportIntentRow,
): ArchiveConnectorImportIntentReadback {
  return {
    id: row.id,
    provider: row.provider,
    purpose: "archive_connector",
    personaId: row.persona_id,
    sourceFamily: row.source_family,
    sourceKind: row.source_kind,
    sourceKey: row.source_key,
    sourceLabel: row.source_label,
    status: row.status,
    activatedAt: row.activated_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function importIntentFingerprint(input: {
  ownerUserId: string;
  provider: ArchiveConnectorProviderId;
  personaId: string;
  sourceFamily: ArchiveConnectorImportIntentSourceFamily;
  sourceKind: string;
  sourceKey: string;
  sourceLabel: string;
}) {
  return createHash("sha256")
    .update([
      "station.archive_connector.import_intent.v1",
      input.ownerUserId,
      input.provider,
      input.personaId,
      input.sourceFamily,
      input.sourceKind,
      input.sourceKey,
      input.sourceLabel,
    ].join(":"))
    .digest("hex");
}

function sourceUnavailable() {
  return new ArchiveConnectorImportIntentError(
    "archive_connector_import_intent_source_unavailable",
    "Archive connector import intent source was not available."
  );
}

function intentNotActivatable() {
  return new ArchiveConnectorImportIntentError(
    "archive_connector_import_intent_not_activatable",
    "Archive connector import intent cannot be activated."
  );
}

"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiGet, apiPatch, apiPost, apiUrl } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  developerSpaceAgentActionGroups,
  developerSpaceAgentActionStatusCopy,
  developerSpaceAgentConfirmationCanAct,
  developerSpaceAgentConfirmationEmptyCopy,
  developerSpaceAgentConfirmationExecutionCopy,
  developerSpaceAgentConfirmationStatusCopy,
  developerSpaceAgentPreviewEmptyCopy,
  developerSpaceAgentPreviewStatusCopy,
  developerSpaceAgentReceiptCanRecord,
  developerSpaceAgentReceiptEmptyCopy,
  developerSpaceAgentReceiptExecutionCopy,
  developerSpaceAgentReceiptStatusCopy,
  developerSpaceEvidenceCanRequestPublish,
  developerSpaceEvidenceEmptyCopy,
  developerSpaceEvidenceReviewHref,
  developerSpaceEvidenceRoleCopy,
  developerSpaceEvidenceRoleDescription,
  developerSpaceOwnerCurrentState,
  developerSpaceTierOneFramingCopy,
  developerSpaceUsageReadback,
  formatDate,
  humaniseKey,
  moveDeveloperSpaceWidget,
  normaliseDeveloperSpaceWidgets,
  orderedDeveloperSpaceEvidence,
  updateWidgetVisibility,
} from "@/lib/developer-space-observatory";
import {
  defaultDeveloperSpaceVisualConfig,
  normaliseDeveloperSpaceVisualConfig,
} from "@/lib/developer-space-visual-config";
import type {
  DeveloperSpaceAgentActionPreview,
  DeveloperSpaceAgentActionRegistryEntry,
  DeveloperSpaceAgentConfirmationRecord,
  DeveloperSpaceAgentExecutionReceiptRecord,
  DeveloperSpaceAgentFutureAction,
  DeveloperSpaceDetail,
  DeveloperSpaceDocumentRole,
  DeveloperSpaceLinkedDocument,
  DeveloperSpaceLiveUpdate,
  DeveloperSpaceWidgetConfig,
  DeveloperSpaceWidgetType,
  DeveloperSpaceUsage,
  DeveloperSpaceVisualisationType,
} from "@station/types/developer-space";
import type { ArchiveExportPackage } from "@station/types/export";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const DEVELOPER_SPACE_EVIDENCE_ROLES: DeveloperSpaceDocumentRole[] = [
  "methodology",
  "finding",
  "field_log",
  "note",
];
const DEVELOPER_SPACE_CAPABILITY_CATEGORIES = [
  "provider_config",
  "cache_config",
  "cloudflare_adapter",
  "repo_access",
  "railway_env",
  "supabase_schema",
  "stripe_webhook",
  "worker_runtime",
  "human_review",
  "roadmap_decision",
];
const DEFAULT_CAPABILITY_SUMMARY = "Review this requested capability before opening a new implementation lane.";

type DeveloperSpaceAgentRegistryBoundary = {
  autonomousExecution?: boolean;
  mutatesDeveloperSpace?: boolean;
  exposesRawPayloads?: boolean;
  ownerOnly?: boolean;
};

type DeveloperSpaceAgentRegistryResponse = {
  actions: DeveloperSpaceAgentActionRegistryEntry[];
  boundary?: DeveloperSpaceAgentRegistryBoundary;
};

type DeveloperSpaceAgentConfirmationsResponse = {
  confirmations: DeveloperSpaceAgentConfirmationRecord[];
  setup?: {
    confirmationStoreAvailable?: boolean;
    code?: string;
  };
};

type DeveloperSpaceAgentConfirmationMutationResponse = {
  confirmation: DeveloperSpaceAgentConfirmationRecord;
  executionAvailable: boolean;
  message: string;
};

type DeveloperSpaceAgentReceiptsResponse = {
  receipts: DeveloperSpaceAgentExecutionReceiptRecord[];
  setup?: {
    receiptStoreAvailable?: boolean;
    code?: string;
  };
};

type DeveloperSpaceAgentReceiptMutationResponse = {
  receipt: DeveloperSpaceAgentExecutionReceiptRecord;
  idempotent: boolean;
  executionAvailable: boolean;
  message: string;
};

function CodeBlock({ code }: { code: string }) {
  return (
    <pre style={{
      margin: 0,
      whiteSpace: "pre-wrap",
      overflowX: "auto",
      background: "#020617",
      border: "1px solid #1e293b",
      borderRadius: 12,
      padding: "0.9rem",
      color: "#cbd5e1",
      fontSize: "0.78rem",
      lineHeight: 1.55,
    }}>
      {code}
    </pre>
  );
}

function websocketUrl(path: string) {
  const url = new URL(apiUrl(path));
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}

function safeDeveloperSpacePreviewHref(href?: string | null) {
  if (!href?.startsWith("/developer-spaces/")) return null;
  return href;
}

export default function DeveloperSpaceManagePage() {
  const { slug } = useParams<{ slug: string }>();
  const [token, setToken] = useState<string | null>(null);
  const [detail, setDetail] = useState<DeveloperSpaceDetail | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<"connecting" | "live" | "reconnecting">("connecting");
  const [lastLiveAt, setLastLiveAt] = useState<string | null>(null);
  const [documentRole, setDocumentRole] = useState<DeveloperSpaceDocumentRole>("methodology");
  const [documentTitle, setDocumentTitle] = useState("");
  const [documentBody, setDocumentBody] = useState("");
  const [documentSortOrder, setDocumentSortOrder] = useState("0");
  const [publishDocument, setPublishDocument] = useState(false);
  const [savingDocument, setSavingDocument] = useState(false);
  const [usage, setUsage] = useState<DeveloperSpaceUsage | null>(null);
  const [exportsList, setExportsList] = useState<ArchiveExportPackage[]>([]);
  const [exporting, setExporting] = useState(false);
  const [agentActions, setAgentActions] = useState<DeveloperSpaceAgentActionRegistryEntry[]>([]);
  const [agentBoundary, setAgentBoundary] = useState<DeveloperSpaceAgentRegistryBoundary | null>(null);
  const [selectedAgentAction, setSelectedAgentAction] = useState<string>("");
  const [agentPreview, setAgentPreview] = useState<DeveloperSpaceAgentActionPreview | null>(null);
  const [agentRegistryLoading, setAgentRegistryLoading] = useState(false);
  const [agentPreviewLoading, setAgentPreviewLoading] = useState(false);
  const [agentConfirmations, setAgentConfirmations] = useState<DeveloperSpaceAgentConfirmationRecord[]>([]);
  const [agentConfirmationsLoading, setAgentConfirmationsLoading] = useState(false);
  const [agentConfirmationStoreAvailable, setAgentConfirmationStoreAvailable] = useState(true);
  const [agentConfirmationCreatingAction, setAgentConfirmationCreatingAction] = useState<string | null>(null);
  const [agentConfirmationBusyId, setAgentConfirmationBusyId] = useState<string | null>(null);
  const [agentReceipts, setAgentReceipts] = useState<DeveloperSpaceAgentExecutionReceiptRecord[]>([]);
  const [agentReceiptsLoading, setAgentReceiptsLoading] = useState(false);
  const [agentReceiptStoreAvailable, setAgentReceiptStoreAvailable] = useState(true);
  const [agentReceiptBusyId, setAgentReceiptBusyId] = useState<string | null>(null);
  const [capabilityCategory, setCapabilityCategory] = useState("roadmap_decision");
  const [capabilitySummary, setCapabilitySummary] = useState(DEFAULT_CAPABILITY_SUMMARY);
  const [observatoryStatusNote, setObservatoryStatusNote] = useState("");
  const [agentNotice, setAgentNotice] = useState<string | null>(null);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [visualisationType, setVisualisationType] = useState<DeveloperSpaceVisualisationType>("node_field");
  const [visualisationConfig, setVisualisationConfig] = useState<Record<string, unknown>>(
    defaultDeveloperSpaceVisualConfig("node_field")
  );
  const [savingVisualConfig, setSavingVisualConfig] = useState(false);

  const syncVisualState = useCallback((data: DeveloperSpaceDetail) => {
    setVisualisationType(data.space.visualisationType);
    setVisualisationConfig(normaliseDeveloperSpaceVisualConfig(
      data.space.visualisationType,
      data.space.visualisationConfig ?? {}
    ));
  }, []);

  const loadAgentActions = useCallback(async (spaceId: string, sessionToken: string) => {
    setAgentRegistryLoading(true);
    setAgentError(null);
    try {
      const data = await apiGet<DeveloperSpaceAgentRegistryResponse>(
        `/developer-spaces/${spaceId}/agent/actions`,
        sessionToken
      );
      const actions = data.actions ?? [];
      setAgentActions(actions);
      setAgentBoundary(data.boundary ?? null);
      setAgentPreview(null);
      setSelectedAgentAction((current) => {
        if (actions.some((action) => action.action === current && !action.futureLane)) return current;
        return actions.find((action) => !action.futureLane)?.action ?? "";
      });
    } catch {
      setAgentActions([]);
      setAgentBoundary(null);
      setAgentPreview(null);
      setAgentError("Could not load Developer Agent actions.");
    } finally {
      setAgentRegistryLoading(false);
    }
  }, []);

  const loadAgentConfirmations = useCallback(async (spaceId: string, sessionToken: string) => {
    setAgentConfirmationsLoading(true);
    setAgentError(null);
    try {
      const data = await apiGet<DeveloperSpaceAgentConfirmationsResponse>(
        `/developer-spaces/${spaceId}/agent/actions/confirmations`,
        sessionToken
      );
      setAgentConfirmations(data.confirmations ?? []);
      setAgentConfirmationStoreAvailable(data.setup?.confirmationStoreAvailable !== false);
    } catch {
      setAgentConfirmations([]);
      setAgentConfirmationStoreAvailable(false);
      setAgentError("Could not load Developer Agent confirmations.");
    } finally {
      setAgentConfirmationsLoading(false);
    }
  }, []);

  const loadAgentReceipts = useCallback(async (spaceId: string, sessionToken: string) => {
    setAgentReceiptsLoading(true);
    setAgentError(null);
    try {
      const data = await apiGet<DeveloperSpaceAgentReceiptsResponse>(
        `/developer-spaces/${spaceId}/agent/actions/receipts`,
        sessionToken
      );
      setAgentReceipts(data.receipts ?? []);
      setAgentReceiptStoreAvailable(data.setup?.receiptStoreAvailable !== false);
    } catch {
      setAgentReceipts([]);
      setAgentReceiptStoreAvailable(false);
      setAgentError("Could not load Developer Agent receipts.");
    } finally {
      setAgentReceiptsLoading(false);
    }
  }, []);

  const load = useCallback(async (sessionToken: string) => {
    const data = await apiGet<DeveloperSpaceDetail>(`/developer-spaces/${slug}`, sessionToken);
    setDetail(data);
    syncVisualState(data);
    const [usageData, exportsData] = await Promise.all([
      apiGet<{ usage: DeveloperSpaceUsage }>(`/developer-spaces/${data.space.id}/usage`, sessionToken),
      apiGet<{ exports: ArchiveExportPackage[] }>(`/exports/developer-spaces/${data.space.id}`, sessionToken),
    ]);
    setUsage(usageData.usage);
    setExportsList(exportsData.exports);
    await Promise.all([
      loadAgentActions(data.space.id, sessionToken),
      loadAgentConfirmations(data.space.id, sessionToken),
      loadAgentReceipts(data.space.id, sessionToken),
    ]);
  }, [loadAgentActions, loadAgentConfirmations, loadAgentReceipts, slug, syncVisualState]);

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) {
        setLoading(false);
        return;
      }
      setToken(session.access_token);
      try {
        await load(session.access_token);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load Developer Space.");
      } finally {
        setLoading(false);
      }
    });
  }, [load]);

  useEffect(() => {
    if (!slug || !token) return;
    let socket: WebSocket | null = null;

    if ("WebSocket" in window) {
      const socketUrl = new URL(websocketUrl(`/developer-spaces/${slug}/live`));
      socketUrl.searchParams.set("access_token", token);
      socket = new WebSocket(socketUrl.toString());
      socket.onopen = () => setLiveStatus("live");
      socket.onerror = () => setLiveStatus("reconnecting");
      socket.onmessage = async (message) => {
        const payload = JSON.parse(message.data);
        if (payload.kind !== "developer_space.ingested") return;
        const data = await apiGet<DeveloperSpaceDetail>(`/developer-spaces/${slug}`, token);
        setDetail(data);
        syncVisualState(data);
        setLastLiveAt(payload.emittedAt);
        setLiveStatus("live");
      };
    }

    const streamUrl = new URL(apiUrl(`/developer-spaces/${slug}/stream`));
    streamUrl.searchParams.set("access_token", token);
    const stream = new EventSource(streamUrl.toString());

    stream.onopen = () => setLiveStatus("live");
    stream.onerror = () => setLiveStatus("reconnecting");
    stream.addEventListener("developer_space.update", (event) => {
      const update = JSON.parse((event as MessageEvent).data) as DeveloperSpaceLiveUpdate;
      setDetail(update.detail);
      setLastLiveAt(update.freshness.emittedAt);
      setLiveStatus("live");
    });

    return () => {
      stream.close();
      socket?.close();
    };
  }, [slug, syncVisualState, token]);

  async function rotateKey() {
    if (!token || !detail) return;
    setRotating(true);
    setError(null);
    try {
      const data = await apiPost<{ apiKey: string; space: DeveloperSpaceDetail["space"] }>(
        `/developer-spaces/${detail.space.id}/api-key`,
        {},
        token
      );
      setApiKey(data.apiKey);
      setDetail({ ...detail, space: data.space });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not rotate API key.");
    } finally {
      setRotating(false);
    }
  }

  const nodeStateCurl = useMemo(() => {
    const key = apiKey ?? "$STATION_DEVELOPER_KEY";
    return `curl -X POST "${API_URL}/developer-spaces/ingest/nodes/animus-alpha/state" \\
  -H "X-Station-Developer-Key: ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "nodeName": "Animus Alpha",
    "topologyType": "radial",
    "fragmentCount": 128,
    "selfSimilarityScore": 0.73,
    "dimensionality": 12,
    "metrics": {
      "interNodeDistance": 0.41,
      "crystallisations": 7
    },
    "sourceRefs": ["run-2026-05-23"],
    "provenance": "api"
  }'`;
  }, [apiKey]);

  const eventCurl = useMemo(() => {
    const key = apiKey ?? "$STATION_DEVELOPER_KEY";
    return `curl -X POST "${API_URL}/developer-spaces/ingest/events" \\
  -H "X-Station-Developer-Key: ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "eventType": "fragment_absorbed",
    "eventLabel": "Alpha absorbed a grief-domain fragment",
    "nodeId": "animus-alpha",
    "similarityScore": 0.73,
    "eventData": {
      "domain": "grief",
      "fragmentId": "frag_0042"
    },
    "sourceRefs": ["fragment-ledger:frag_0042"],
    "provenance": "api",
    "visibility": "public"
  }'`;
  }, [apiKey]);

  const snapshotCurl = useMemo(() => {
    const key = apiKey ?? "$STATION_DEVELOPER_KEY";
    return `curl -X POST "${API_URL}/developer-spaces/ingest/snapshots" \\
  -H "X-Station-Developer-Key: ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "snapshotData": {
      "summary": "Weekly manifold snapshot",
      "nodes": 3,
      "meanSelfSimilarity": 0.68
    },
    "sourceRefs": ["weekly-snapshot-18"],
    "provenance": "api"
  }'`;
  }, [apiKey]);

  if (loading) {
    return (
      <main className="container">
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#687078" }}>Loading management console...</div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="container" style={{ maxWidth: 900 }}>
        <div className="card" style={{ padding: "2rem" }}>
          <h1 style={{ marginTop: 0 }}>Sign in required</h1>
          <p style={{ color: "#687078" }}>You need to sign in to manage a Developer Space.</p>
          <Link href="/login" className="button primary" style={{ textDecoration: "none" }}>Sign in</Link>
        </div>
      </main>
    );
  }

  if (error || !detail) {
    return (
      <main className="container">
        <div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#fca5a5" }}>
          {error ?? "Developer Space not found."}
        </div>
      </main>
    );
  }

  if (detail.access !== "owner") {
    return (
      <main className="container">
        <div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#fca5a5" }}>
          Only the Developer Space owner can access this management console.
        </div>
      </main>
    );
  }

  async function createLinkedDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !detail) return;
    setSavingDocument(true);
    setError(null);
    try {
      const parsedSortOrder = Number.parseInt(documentSortOrder, 10);
      const sortOrder = Number.isFinite(parsedSortOrder)
        ? Math.min(Math.max(parsedSortOrder, 0), 100_000)
        : 0;
      const data = await apiPost<{
        linkedDocuments: DeveloperSpaceLinkedDocument[];
      }>(
        `/developer-spaces/${detail.space.id}/documents/template`,
        {
          role: documentRole,
          title: documentTitle.trim() || undefined,
          body: documentBody.trim() || undefined,
          linkVisibility: publishDocument ? "public" : "owner",
          sortOrder,
        },
        token
      );
      setDetail({ ...detail, linkedDocuments: data.linkedDocuments });
      setDocumentTitle("");
      setDocumentBody("");
      setDocumentSortOrder("0");
      setPublishDocument(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create linked document.");
    } finally {
      setSavingDocument(false);
    }
  }

  async function createExportPackage() {
    if (!token || !detail) return;
    setExporting(true);
    setError(null);
    try {
      const data = await apiPost<{
        exportPackage: ArchiveExportPackage;
      }>(`/exports/developer-spaces/${detail.space.id}`, {}, token);
      setExportsList([data.exportPackage, ...exportsList]);
      const usageData = await apiGet<{ usage: DeveloperSpaceUsage }>(`/developer-spaces/${detail.space.id}/usage`, token);
      setUsage(usageData.usage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create export package.");
    } finally {
      setExporting(false);
    }
  }

  async function previewAgentAction(action: string = selectedAgentAction) {
    if (!token || !detail || !action) return;
    setSelectedAgentAction(action);
    setAgentPreviewLoading(true);
    setAgentError(null);
    try {
      const data = await apiPost<DeveloperSpaceAgentActionPreview>(
        `/developer-spaces/${detail.space.id}/agent/actions/preview`,
        {
          action,
          ...(action === "update_observatory" && observatoryStatusNote.trim()
            ? { input: { statusNote: observatoryStatusNote.trim() } }
            : {}),
        },
        token
      );
      setAgentPreview(data);
    } catch {
      setAgentError("Could not preview that Developer Agent action.");
    } finally {
      setAgentPreviewLoading(false);
    }
  }

  function upsertAgentConfirmation(confirmation: DeveloperSpaceAgentConfirmationRecord) {
    setAgentConfirmations((current) => [
      confirmation,
      ...current.filter((item) => item.id !== confirmation.id),
    ].sort((a, b) => Date.parse(b.requestedAt) - Date.parse(a.requestedAt)));
  }

  function upsertAgentReceipt(receipt: DeveloperSpaceAgentExecutionReceiptRecord) {
    setAgentReceipts((current) => [
      receipt,
      ...current.filter((item) =>
        !(item.action === receipt.action && item.dispatchedAt === receipt.dispatchedAt && item.summary === receipt.summary)
      ),
    ].sort((a, b) => Date.parse(b.dispatchedAt) - Date.parse(a.dispatchedAt)));
  }

  async function createAgentConfirmation(
    action: DeveloperSpaceAgentFutureAction,
    options: { targetDocumentId?: string; capabilityCategory?: string; capabilitySummary?: string; statusNote?: string } = {}
  ) {
    if (!token || !detail || !agentConfirmationStoreAvailable) return;
    setAgentConfirmationCreatingAction(action);
    setAgentError(null);
    setAgentNotice(null);
    try {
      const data = await apiPost<DeveloperSpaceAgentConfirmationMutationResponse>(
        `/developer-spaces/${detail.space.id}/agent/actions/confirmations`,
        {
          action,
          ...(options.targetDocumentId ? { targetDocumentId: options.targetDocumentId } : {}),
          ...(options.capabilityCategory ? { capabilityCategory: options.capabilityCategory } : {}),
          ...(options.capabilitySummary ? { capabilitySummary: options.capabilitySummary } : {}),
          ...(options.statusNote ? { statusNote: options.statusNote } : {}),
        },
        token
      );
      upsertAgentConfirmation(data.confirmation);
      setAgentNotice(data.message);
    } catch {
      setAgentError("Could not record that Developer Agent confirmation.");
    } finally {
      setAgentConfirmationCreatingAction(null);
    }
  }

  async function updateAgentConfirmation(confirmation: DeveloperSpaceAgentConfirmationRecord, action: "approve" | "cancel") {
    if (!token || !detail || !agentConfirmationStoreAvailable) return;
    setAgentConfirmationBusyId(confirmation.id);
    setAgentError(null);
    setAgentNotice(null);
    try {
      const data = await apiPost<DeveloperSpaceAgentConfirmationMutationResponse>(
        `/developer-spaces/${detail.space.id}/agent/actions/confirmations/${confirmation.id}/${action}`,
        {},
        token
      );
      upsertAgentConfirmation(data.confirmation);
      setAgentNotice(data.message);
    } catch {
      setAgentError(action === "approve"
        ? "Could not approve that Developer Agent confirmation."
        : "Could not cancel that Developer Agent confirmation.");
    } finally {
      setAgentConfirmationBusyId(null);
    }
  }

  async function recordAgentReceipt(confirmation: DeveloperSpaceAgentConfirmationRecord) {
    if (!token || !detail || !agentReceiptStoreAvailable || !developerSpaceAgentReceiptCanRecord(confirmation)) return;
    setAgentReceiptBusyId(confirmation.id);
    setAgentError(null);
    setAgentNotice(null);
    try {
      const data = await apiPost<DeveloperSpaceAgentReceiptMutationResponse>(
        `/developer-spaces/${detail.space.id}/agent/actions/confirmations/${confirmation.id}/execute`,
        {},
        token
      );
      upsertAgentReceipt(data.receipt);
      setAgentNotice(data.message);
      if (
        data.receipt.action === "save_project_update_draft"
        || data.receipt.action === "publish_to_page"
        || data.receipt.action === "update_observatory"
      ) {
        const nextDetail = await apiGet<DeveloperSpaceDetail>(
          `/developer-spaces/${detail.space.slug}`,
          token,
        ).catch(() => null);
        if (nextDetail) {
          setDetail(nextDetail);
          syncVisualState(nextDetail);
        }
      }
    } catch {
      setAgentError("Could not record that Developer Agent receipt.");
    } finally {
      setAgentReceiptBusyId(null);
    }
  }

  function updateVisualConfig(key: string, value: unknown) {
    setVisualisationConfig((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function setWidgets(widgets: DeveloperSpaceWidgetConfig[]) {
    setVisualisationConfig((current) => ({
      ...current,
      widgets,
    }));
  }

  function changeWidgetVisibility(type: DeveloperSpaceWidgetType, visible: boolean) {
    setWidgets(updateWidgetVisibility(widgetLayout, type, visible));
  }

  function moveWidget(type: DeveloperSpaceWidgetType, direction: -1 | 1) {
    setWidgets(moveDeveloperSpaceWidget(widgetLayout, type, direction));
  }

  function changeVisualisationType(nextType: DeveloperSpaceVisualisationType) {
    setVisualisationType(nextType);
    setVisualisationConfig((current) => ({
      ...defaultDeveloperSpaceVisualConfig(nextType),
      widgets: normaliseDeveloperSpaceWidgets(current.widgets),
    }));
  }

  async function saveVisualConfig() {
    if (!token || !detail) return;
    setSavingVisualConfig(true);
    setError(null);
    try {
      const config = {
        ...normaliseDeveloperSpaceVisualConfig(visualisationType, visualisationConfig),
        widgets: widgetLayout,
      };
      const data = await apiPatch<{ space: DeveloperSpaceDetail["space"] }>(
        `/developer-spaces/${detail.space.id}`,
        {
          visualisationType,
          visualisationConfig: config,
        },
        token
      );
      const nextDetail = { ...detail, space: data.space };
      setDetail(nextDetail);
      syncVisualState(nextDetail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save visual config.");
    } finally {
      setSavingVisualConfig(false);
    }
  }

  const liveLabel = liveStatus === "live"
    ? lastLiveAt ? `Live ${formatDate(lastLiveAt)}` : "Live"
    : liveStatus === "connecting"
      ? "Connecting"
      : "Reconnecting";
  const ingestionEvents = detail.events.slice(0, 5);
  const boundedVisualConfig = normaliseDeveloperSpaceVisualConfig(visualisationType, visualisationConfig);
  const widgetLayout = normaliseDeveloperSpaceWidgets(visualisationConfig.widgets);
  const orderedEvidence = orderedDeveloperSpaceEvidence(detail.linkedDocuments ?? []);
  const currentState = developerSpaceOwnerCurrentState(detail);
  const usageReadback = developerSpaceUsageReadback(usage, detail, exportsList.length);
  const agentActionGroups = developerSpaceAgentActionGroups(agentActions);
  const selectedAgentEntry = agentActions.find((action) => action.action === selectedAgentAction) ?? null;
  const selectedFutureAction = agentActionGroups.future.find((action) => action.action === agentPreview?.action)?.action as DeveloperSpaceAgentFutureAction | undefined;
  const confirmationActionLabels = new Map(agentActions.map((action) => [action.action, action.label]));
  const capabilityReceipts = agentReceipts.filter((receipt) => receipt.action === "request_capability");
  const tierOneCopy = developerSpaceTierOneFramingCopy();
  const boundaryRows = [
    { label: "Owner only", value: agentBoundary?.ownerOnly === true ? "Yes" : "Unknown" },
    { label: "Autonomous execution", value: agentBoundary?.autonomousExecution === false ? "No" : "Unknown" },
    { label: "Mutates space", value: agentBoundary?.mutatesDeveloperSpace === false ? "No" : "Unknown" },
    { label: "Raw payloads", value: agentBoundary?.exposesRawPayloads === false ? "No" : "Unknown" },
  ];

  return (
    <main className="container" style={{ display: "grid", gap: "1.25rem", maxWidth: 1120 }}>
      <div style={{ fontSize: "0.82rem", color: "#8b8f92" }}>
        <Link href="/developer-spaces" style={{ color: "#687078" }}>Developer Spaces</Link>
        <span style={{ margin: "0 0.4rem" }}>/</span>
        <Link href={`/developer-spaces/${detail.space.slug}`} style={{ color: "#687078" }}>{detail.space.projectName}</Link>
        <span style={{ margin: "0 0.4rem" }}>/</span>
        <span>Manage</span>
      </div>

      <section className="card" style={{ display: "grid", gap: "0.8rem", padding: "1.4rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <p className="pill" style={{ margin: "0 0 0.65rem", color: "#534ab7" }}>Tier 1 operating console</p>
            <h1 style={{ margin: 0, fontSize: "1.9rem" }}>{detail.space.projectName}</h1>
            <p style={{ color: "#687078", maxWidth: 760, lineHeight: 1.6 }}>
              {tierOneCopy.ownerFrame} This page is private; public visitors see only the public observatory and evidence path.
            </p>
          </div>
          <Link className="button" href={`/developer-spaces/${detail.space.slug}`} style={{ textDecoration: "none", height: "fit-content" }}>Open observatory</Link>
        </div>
      </section>

      {error && (
        <div className="card" style={{ background: "#2d1515", borderColor: "#7d2e2e", color: "#fca5a5" }}>
          {error}
        </div>
      )}

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: "1rem", alignItems: "start" }}>
        <aside className="card" style={{ display: "grid", gap: "1rem" }}>
          <div>
            <h2 style={{ margin: "0 0 0.4rem", fontSize: "1.05rem" }}>Ingestion key</h2>
            <p style={{ margin: 0, color: "#687078", fontSize: "0.88rem", lineHeight: 1.55 }}>
              Keys are shown once, hashed before storage, and can be rotated anytime. Put the key in your self-hosted runtime environment, not in browser code or public pages.
            </p>
          </div>

          <div style={{ display: "grid", gap: "0.35rem", fontSize: "0.82rem", color: "#1f2529" }}>
            <span>Current key</span>
            <span className="pill" style={{ width: "fit-content" }}>
              {detail.space.apiKeyLastFour ? `**** ${detail.space.apiKeyLastFour}` : "No key generated"}
            </span>
          </div>

          <button className="button primary" onClick={rotateKey} disabled={rotating}>
            {rotating ? "Rotating..." : detail.space.apiKeyLastFour ? "Rotate key" : "Generate key"}
          </button>

          {apiKey ? (
            <div style={{ display: "grid", gap: "0.45rem" }}>
              <strong style={{ color: "#25633f" }}>Copy this now</strong>
              <textarea className="textarea" value={apiKey} readOnly style={{ minHeight: 88, fontFamily: "monospace" }} />
              <p style={{ margin: 0, color: "#854f0b", fontSize: "0.82rem", lineHeight: 1.45 }}>
                Station will not show this key again.
              </p>
            </div>
          ) : null}

          <hr />

          <div style={{ display: "grid", gap: "0.65rem", color: "#687078", fontSize: "0.84rem", lineHeight: 1.5 }}>
            <div>
              <h2 style={{ margin: "0 0 0.3rem", fontSize: "1rem" }}>{currentState.heading}</h2>
              <p style={{ margin: 0 }}>{currentState.status}</p>
              <p style={{ margin: "0.2rem 0 0", color: "#8b8f92" }}>Latest activity: {currentState.latestActivity}</p>
            </div>
            <div style={{ display: "grid", gap: "0.35rem" }}>
              {currentState.rows.map((row) => (
                <span key={row.label}><strong style={{ color: "#1f2529" }}>{row.label}:</strong> {row.value}</span>
              ))}
              <span><strong style={{ color: "#1f2529" }}>Visibility:</strong> {detail.space.visibility}</span>
            </div>
            <p style={{ margin: 0, color: "#854f0b", fontSize: "0.82rem" }}>
              Owner readback comes from the current detail route; it is separate from quota counters below and from the public visitor boundary.
            </p>
          </div>

          <hr />

          <div style={{ display: "grid", gap: "0.45rem", color: "#687078", fontSize: "0.84rem", lineHeight: 1.5 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: "1rem" }}>{usageReadback.heading}</h2>
              <span className="pill" style={{ color: usage?.warningLevel === "ok" ? "#25633f" : "#854f0b", width: "fit-content" }}>{usageReadback.warningLabel}</span>
            </div>
            {usageReadback.rows.map((row) => (
              <span key={row.label}><strong style={{ color: "#1f2529" }}>{row.label}:</strong> {row.value}</span>
            ))}
            <p style={{ margin: "0.15rem 0 0", color: "#854f0b", fontSize: "0.82rem" }}>
              {usageReadback.mismatchCopy}
            </p>
          </div>

          <hr />

          <div style={{ display: "grid", gap: "0.6rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
              <h2 style={{ margin: 0, fontSize: "1rem" }}>Live ingestion</h2>
              <span className="pill" style={{ color: liveStatus === "live" ? "#25633f" : "#854f0b" }}>{liveLabel}</span>
            </div>
            {ingestionEvents.length === 0 ? (
              <p style={{ margin: 0, color: "#687078", fontSize: "0.84rem" }}>No ingested events yet.</p>
            ) : (
              <div style={{ display: "grid", gap: "0.45rem" }}>
                {ingestionEvents.map((event) => (
                  <div key={event.id} style={{ borderTop: "1px solid #d8d3c8", paddingTop: "0.45rem" }}>
                    <strong style={{ display: "block", fontSize: "0.82rem" }}>{event.eventLabel || humaniseKey(event.eventType)}</strong>
                    <span style={{ color: "#8b8f92", fontSize: "0.74rem" }}>{formatDate(event.occurredAt)} / {event.visibility}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <section style={{ display: "grid", gap: "1rem" }}>
          <div className="card" style={{ display: "grid", gap: "0.9rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "flex-start", flexWrap: "wrap" }}>
              <div>
                <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.05rem" }}>Developer Agent preview</h2>
                <p style={{ margin: 0, color: "#687078", lineHeight: 1.55 }}>
                  {tierOneCopy.agentBoundary} No hosted runtime, repo, deploy, key, provider, worker, or billing action is opened here.
                </p>
              </div>
              <span className="pill" style={{ color: agentRegistryLoading ? "#854f0b" : "#25633f" }}>
                {agentRegistryLoading ? "Loading actions" : `${agentActionGroups.available.length} available`}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: "0.55rem" }}>
              {boundaryRows.map((row) => (
                <div key={row.label} style={agentFactBox}>
                  <span style={{ color: "#8b8f92", fontSize: "0.72rem" }}>{row.label}</span>
                  <strong style={{ color: "#1f2529", fontSize: "0.84rem" }}>{row.value}</strong>
                </div>
              ))}
            </div>

            {agentError ? (
              <div style={{ background: "#2d1515", border: "1px solid #7d2e2e", borderRadius: 8, color: "#fca5a5", padding: "0.75rem", fontSize: "0.84rem" }}>
                {agentError}
              </div>
            ) : null}

            {agentNotice ? (
              <div style={{ background: "#f0f8ef", border: "1px solid #b9d8bd", borderRadius: 8, color: "#25633f", padding: "0.75rem", fontSize: "0.84rem" }}>
                {agentNotice}
              </div>
            ) : null}

            <div style={{ display: "grid", gap: "0.55rem" }}>
              <span style={{ color: "#1f2529", fontSize: "0.82rem", fontWeight: 700 }}>Available actions</span>
              {agentActionGroups.available.length === 0 ? (
                <p style={{ margin: 0, color: "#687078", fontSize: "0.84rem" }}>
                  {developerSpaceAgentPreviewEmptyCopy(agentActions)}
                </p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))", gap: "0.55rem" }}>
                  {agentActionGroups.available.map((action) => (
                    <button
                      key={action.action}
                      type="button"
                      className="button"
                      onClick={() => previewAgentAction(action.action)}
                      disabled={agentPreviewLoading && selectedAgentAction === action.action}
                      style={{
                        ...agentActionButton,
                        borderColor: selectedAgentAction === action.action ? "#534ab7" : "#d8d3c8",
                      }}
                    >
                      <strong style={{ color: "#1f2529" }}>{action.label}</strong>
                      <span style={{ color: "#687078", fontSize: "0.74rem" }}>
                        {developerSpaceAgentActionStatusCopy(action)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={agentPreviewBox}>
              {agentPreview ? (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div>
                      <span className="pill" style={{ color: agentPreview.futureLane ? "#854f0b" : "#25633f" }}>
                        {developerSpaceAgentPreviewStatusCopy(agentPreview)}
                      </span>
                      <h3 style={{ margin: "0.45rem 0 0", fontSize: "0.98rem" }}>
                        {selectedAgentEntry?.label ?? humaniseKey(agentPreview.action)}
                      </h3>
                    </div>
                    {agentPreview.requiresConfirmation ? (
                      <span className="pill" style={{ color: "#854f0b" }}>Owner review required</span>
                    ) : null}
                  </div>
                  <p style={{ margin: 0, color: "#687078", lineHeight: 1.55 }}>
                    {agentPreview.summary}
                  </p>
                  {agentPreview.futureLane && selectedFutureAction === "publish_to_page" ? (
                    <span style={{ color: "#854f0b", fontSize: "0.82rem", lineHeight: 1.4 }}>
                      Select an owner-only private draft in Project evidence to request publication.
                    </span>
                  ) : agentPreview.futureLane && selectedFutureAction === "request_capability" ? (
                    <div style={{ display: "grid", gap: "0.65rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "0.55rem" }}>
                        <label style={{ display: "grid", gap: "0.25rem", color: "#687078", fontSize: "0.78rem", fontWeight: 700 }}>
                          Category
                          <select
                            className="input"
                            value={capabilityCategory}
                            onChange={(event) => setCapabilityCategory(event.target.value)}
                          >
                            {DEVELOPER_SPACE_CAPABILITY_CATEGORIES.map((category) => (
                              <option key={category} value={category}>{humaniseKey(category)}</option>
                            ))}
                          </select>
                        </label>
                        <label style={{ display: "grid", gap: "0.25rem", color: "#687078", fontSize: "0.78rem", fontWeight: 700 }}>
                          Summary
                          <textarea
                            className="textarea"
                            value={capabilitySummary}
                            maxLength={600}
                            onChange={(event) => setCapabilitySummary(event.target.value)}
                            style={{ minHeight: 84 }}
                          />
                        </label>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                        <button
                          type="button"
                          className="button primary"
                          onClick={() => createAgentConfirmation(selectedFutureAction, {
                            capabilityCategory,
                            capabilitySummary,
                          })}
                          disabled={!agentConfirmationStoreAvailable || agentConfirmationCreatingAction === selectedFutureAction || capabilitySummary.trim().length === 0}
                        >
                          {agentConfirmationCreatingAction === selectedFutureAction ? "Recording..." : "Record request"}
                        </button>
                        <span style={{ color: "#854f0b", fontSize: "0.82rem", lineHeight: 1.4 }}>
                          Owner triage only. No configuration, provider, repo, deploy, key, webhook, worker, layout, or runtime action executes.
                        </span>
                      </div>
                    </div>
                  ) : agentPreview.futureLane && selectedFutureAction === "update_observatory" ? (
                    <div style={{ display: "grid", gap: "0.65rem" }}>
                      <label style={{ display: "grid", gap: "0.25rem", color: "#687078", fontSize: "0.78rem", fontWeight: 700 }}>
                        Public status note
                        <textarea
                          className="textarea"
                          value={observatoryStatusNote}
                          maxLength={360}
                          onChange={(event) => setObservatoryStatusNote(event.target.value)}
                          style={{ minHeight: 84 }}
                        />
                      </label>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                        <button
                          type="button"
                          className="button"
                          onClick={() => previewAgentAction(selectedFutureAction)}
                          disabled={agentPreviewLoading || observatoryStatusNote.trim().length === 0}
                        >
                          {agentPreviewLoading ? "Previewing..." : "Preview note"}
                        </button>
                        <button
                          type="button"
                          className="button primary"
                          onClick={() => createAgentConfirmation(selectedFutureAction, {
                            statusNote: observatoryStatusNote.trim(),
                          })}
                          disabled={!agentConfirmationStoreAvailable || agentConfirmationCreatingAction === selectedFutureAction || observatoryStatusNote.trim().length === 0}
                        >
                          {agentConfirmationCreatingAction === selectedFutureAction ? "Recording..." : "Record status note"}
                        </button>
                        <span style={{ color: "#854f0b", fontSize: "0.82rem", lineHeight: 1.4 }}>
                          Publishes one public note only after approval. No layout, key, provider, repo, deploy, webhook, worker, billing, or runtime target changes.
                        </span>
                      </div>
                    </div>
                  ) : agentPreview.futureLane && selectedFutureAction ? (
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                      <button
                        type="button"
                        className="button primary"
                        onClick={() => createAgentConfirmation(selectedFutureAction)}
                        disabled={!agentConfirmationStoreAvailable || agentConfirmationCreatingAction === selectedFutureAction}
                      >
                        {agentConfirmationCreatingAction === selectedFutureAction ? "Recording..." : "Record confirmation"}
                      </button>
                      <span style={{ color: "#854f0b", fontSize: "0.82rem", lineHeight: 1.4 }}>
                        Records owner intent only. Execution remains unavailable.
                      </span>
                    </div>
                  ) : null}
                  <div style={{ display: "grid", gap: "0.65rem" }}>
                    {agentPreview.sections.map((section, sectionIndex) => (
                      <section key={`${section.title}-${sectionIndex}`} style={agentPreviewSection}>
                        <h4 style={{ margin: "0 0 0.35rem", fontSize: "0.9rem" }}>{section.title}</h4>
                        {section.summary ? (
                          <p style={{ margin: "0 0 0.45rem", color: "#687078", lineHeight: 1.5 }}>{section.summary}</p>
                        ) : null}
                        {section.facts?.length ? (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))", gap: "0.45rem", marginBottom: section.items?.length ? "0.55rem" : 0 }}>
                            {section.facts.map((fact) => (
                              <div key={fact.label} style={agentFactBox}>
                                <span style={{ color: "#8b8f92", fontSize: "0.72rem" }}>{fact.label}</span>
                                <strong style={{ color: "#1f2529", fontSize: "0.82rem" }}>{String(fact.value ?? "Not recorded")}</strong>
                              </div>
                            ))}
                          </div>
                        ) : null}
                        {section.items?.length ? (
                          <div style={{ display: "grid", gap: "0.45rem" }}>
                            {section.items.map((item, itemIndex) => {
                              const href = safeDeveloperSpacePreviewHref(item.href);
                              return (
                                <div key={`${item.title}-${itemIndex}`} style={{ borderTop: "1px solid #e7e0d4", minWidth: 0, overflowWrap: "anywhere", paddingTop: "0.45rem" }}>
                                  {href ? (
                                    <Link href={href} style={{ color: "#534ab7", fontWeight: 700, overflowWrap: "anywhere" }}>{item.title}</Link>
                                  ) : (
                                    <strong style={{ display: "block", color: "#1f2529", overflowWrap: "anywhere" }}>{item.title}</strong>
                                  )}
                                  {item.detail ? (
                                    <p style={{ margin: "0.2rem 0 0", color: "#687078", lineHeight: 1.45, overflowWrap: "anywhere" }}>{item.detail}</p>
                                  ) : null}
                                  {item.status ? (
                                    <span className="pill" style={{ marginTop: "0.35rem", fontSize: "0.68rem" }}>{humaniseKey(item.status)}</span>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </section>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ margin: 0, color: "#687078" }}>
                  {developerSpaceAgentPreviewEmptyCopy(agentActions)}
                </p>
              )}
            </div>

            {agentActionGroups.future.length ? (
              <div style={{ display: "grid", gap: "0.55rem" }}>
                <span style={{ color: "#1f2529", fontSize: "0.82rem", fontWeight: 700 }}>Future lane vocabulary</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "0.55rem" }}>
                  {agentActionGroups.future.map((action) => (
                    <button
                      key={action.action}
                      type="button"
                      className="button"
                      onClick={() => previewAgentAction(action.action)}
                      disabled={agentPreviewLoading && selectedAgentAction === action.action}
                      style={agentFutureButton}
                    >
                      <strong style={{ color: "#1f2529" }}>{action.label}</strong>
                      <span style={{ color: "#854f0b", fontSize: "0.74rem" }}>Blocked boundary</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div style={{ display: "grid", gap: "0.55rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ color: "#1f2529", fontSize: "0.82rem", fontWeight: 700 }}>Confirmation records</span>
                <span className="pill" style={{ color: agentConfirmationsLoading ? "#854f0b" : "#25633f" }}>
                  {agentConfirmationsLoading ? "Loading" : `${agentConfirmations.length} recorded`}
                </span>
              </div>
              {!agentConfirmationStoreAvailable ? (
                <div style={{ background: "#fff7ed", border: "1px solid #f1c27d", borderRadius: 8, color: "#854f0b", padding: "0.7rem", fontSize: "0.84rem", lineHeight: 1.45 }}>
                  Confirmation storage is not available in this environment. Existing previews remain read-only and no action executed.
                </div>
              ) : null}
              {agentConfirmations.length === 0 ? (
                <p style={{ margin: 0, color: "#687078", fontSize: "0.84rem" }}>
                  {developerSpaceAgentConfirmationEmptyCopy(agentConfirmationsLoading)}
                </p>
              ) : (
                <div style={{ display: "grid", gap: "0.55rem" }}>
                  {agentConfirmations.slice(0, 6).map((confirmation) => {
                    const canAct = developerSpaceAgentConfirmationCanAct(confirmation);
                    const canRecordReceipt = developerSpaceAgentReceiptCanRecord(confirmation);
                    const busy = agentConfirmationBusyId === confirmation.id;
                    const receiptBusy = agentReceiptBusyId === confirmation.id;
                    return (
                      <article key={confirmation.id} style={agentConfirmationRow}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.65rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                          <div>
                            <strong style={{ display: "block", color: "#1f2529" }}>
                              {confirmationActionLabels.get(confirmation.action) ?? humaniseKey(confirmation.action)}
                            </strong>
                            <span style={{ color: "#8b8f92", fontSize: "0.74rem" }}>
                              Requested {formatDate(confirmation.requestedAt)} / Expires {formatDate(confirmation.expiresAt)}
                            </span>
                          </div>
                          <span className="pill" style={{ color: confirmation.status === "approved" ? "#25633f" : confirmation.status === "pending" ? "#854f0b" : "#687078" }}>
                            {developerSpaceAgentConfirmationStatusCopy(confirmation.status)}
                          </span>
                        </div>
                        <p style={{ margin: 0, color: "#687078", lineHeight: 1.45 }}>
                          {confirmation.summary}
                        </p>
                        <p style={{ margin: 0, color: "#854f0b", fontSize: "0.82rem", lineHeight: 1.4 }}>
                          {developerSpaceAgentConfirmationExecutionCopy(confirmation)}
                        </p>
                        {confirmation.approvedAt ? (
                          <span style={{ color: "#8b8f92", fontSize: "0.74rem" }}>Approved {formatDate(confirmation.approvedAt)}</span>
                        ) : null}
                        {confirmation.cancelledAt ? (
                          <span style={{ color: "#8b8f92", fontSize: "0.74rem" }}>Cancelled {formatDate(confirmation.cancelledAt)}</span>
                        ) : null}
                        {canAct ? (
                          <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                            <button
                              type="button"
                              className="button primary"
                              onClick={() => updateAgentConfirmation(confirmation, "approve")}
                              disabled={!agentConfirmationStoreAvailable || busy}
                              style={agentConfirmationButton}
                            >
                              {busy ? "Updating..." : "Approve intent"}
                            </button>
                            <button
                              type="button"
                              className="button"
                              onClick={() => updateAgentConfirmation(confirmation, "cancel")}
                              disabled={!agentConfirmationStoreAvailable || busy}
                              style={agentConfirmationButton}
                            >
                              {busy ? "Updating..." : "Cancel intent"}
                            </button>
                          </div>
                        ) : null}
                        {canRecordReceipt ? (
                          <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                            <button
                              type="button"
                              className="button primary"
                              onClick={() => recordAgentReceipt(confirmation)}
                              disabled={!agentReceiptStoreAvailable || receiptBusy}
                              style={agentConfirmationButton}
                            >
                              {receiptBusy
                                ? "Recording..."
                                : confirmation.action === "save_project_update_draft"
                                  ? "Save draft"
                                  : confirmation.action === "publish_to_page"
                                    ? "Publish to page"
                                    : confirmation.action === "update_observatory"
                                      ? "Publish status note"
                                  : "Create receipt"}
                            </button>
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gap: "0.65rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "0.92rem" }}>Capability triage</h3>
                <span className="pill">
                  {agentReceiptsLoading ? "Loading" : `${capabilityReceipts.length} recorded`}
                </span>
              </div>
              {capabilityReceipts.length === 0 ? (
                <p style={{ margin: 0, color: "#687078", fontSize: "0.84rem" }}>
                  No capability requests recorded.
                </p>
              ) : (
                <div style={{ display: "grid", gap: "0.55rem" }}>
                  {capabilityReceipts.slice(0, 4).map((receipt) => {
                    const capability = receipt.receiptPayload.capabilityRequest;
                    return (
                      <article key={`capability-${receipt.dispatchedAt}`} style={agentConfirmationRow}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.65rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                          <div>
                            <strong style={{ display: "block", color: "#1f2529" }}>
                              {capability?.categoryLabel ?? "Roadmap Decision"}
                            </strong>
                            <span style={{ color: "#8b8f92", fontSize: "0.74rem" }}>
                              Recorded {formatDate(receipt.dispatchedAt)}
                            </span>
                          </div>
                          <span className="pill" style={{ color: "#25633f" }}>
                            {developerSpaceAgentReceiptStatusCopy(receipt.status)}
                          </span>
                        </div>
                        <p style={{ margin: 0, color: "#687078", lineHeight: 1.45 }}>
                          {capability?.summary ?? receipt.summary}
                        </p>
                        <p style={{ margin: 0, color: "#854f0b", fontSize: "0.82rem", lineHeight: 1.4 }}>
                          {receipt.receiptPayload.nextStep}
                        </p>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gap: "0.65rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: "0.92rem" }}>Receipts</h3>
                <span className="pill">
                  {agentReceiptsLoading ? "Loading" : `${agentReceipts.length} recorded`}
                </span>
              </div>
              {!agentReceiptStoreAvailable ? (
                <div style={{ background: "#fff7ed", border: "1px solid #f1c27d", borderRadius: 8, color: "#854f0b", padding: "0.7rem", fontSize: "0.84rem", lineHeight: 1.45 }}>
                  Receipt storage is not available in this environment. Approved intent records remain non-executing.
                </div>
              ) : null}
              {agentReceipts.length === 0 ? (
                <p style={{ margin: 0, color: "#687078", fontSize: "0.84rem" }}>
                  {developerSpaceAgentReceiptEmptyCopy(agentReceiptsLoading)}
                </p>
              ) : (
                <div style={{ display: "grid", gap: "0.55rem" }}>
                  {agentReceipts.slice(0, 6).map((receipt) => (
                    <article key={`${receipt.action}-${receipt.dispatchedAt}`} style={agentConfirmationRow}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.65rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                        <div>
                          <strong style={{ display: "block", color: "#1f2529" }}>
                            {receipt.action === "save_project_update_draft"
                              ? "Project update draft"
                              : receipt.action === "publish_to_page"
                                ? "Published page update"
                                : receipt.action === "update_observatory"
                                  ? "Observatory status note"
                                : "Capability request"}
                          </strong>
                          <span style={{ color: "#8b8f92", fontSize: "0.74rem" }}>
                            Recorded {formatDate(receipt.dispatchedAt)}
                          </span>
                        </div>
                        <span className="pill" style={{ color: "#25633f" }}>
                          {developerSpaceAgentReceiptStatusCopy(receipt.status)}
                        </span>
                      </div>
                      <p style={{ margin: 0, color: "#687078", lineHeight: 1.45 }}>
                        {receipt.summary}
                      </p>
                      <p style={{ margin: 0, color: "#854f0b", fontSize: "0.82rem", lineHeight: 1.4 }}>
                        {developerSpaceAgentReceiptExecutionCopy(receipt)}
                      </p>
                      {receipt.receiptPayload.draftDocument ? (
                        <p style={{ margin: 0, color: "#687078", fontSize: "0.82rem", lineHeight: 1.4 }}>
                          Draft: {receipt.receiptPayload.draftDocument.title} / {receipt.receiptPayload.draftDocument.status} / {receipt.receiptPayload.draftDocument.visibility} / {receipt.receiptPayload.draftDocument.linkVisibility}
                        </p>
                      ) : null}
                      {receipt.receiptPayload.publishedDocument ? (
                        <p style={{ margin: 0, color: "#687078", fontSize: "0.82rem", lineHeight: 1.4 }}>
                          Published: {receipt.receiptPayload.publishedDocument.title} / {receipt.receiptPayload.publishedDocument.status} / {receipt.receiptPayload.publishedDocument.visibility} / {receipt.receiptPayload.publishedDocument.linkVisibility}
                        </p>
                      ) : null}
                      {receipt.receiptPayload.capabilityRequest ? (
                        <p style={{ margin: 0, color: "#687078", fontSize: "0.82rem", lineHeight: 1.4 }}>
                          Capability: {receipt.receiptPayload.capabilityRequest.categoryLabel} / {receipt.receiptPayload.capabilityRequest.summary}
                        </p>
                      ) : null}
                      {receipt.receiptPayload.statusNote ? (
                        <p style={{ margin: 0, color: "#687078", fontSize: "0.82rem", lineHeight: 1.4, overflowWrap: "anywhere" }}>
                          Status note: {receipt.receiptPayload.statusNote.note} / {receipt.receiptPayload.statusNote.visibility} / {receipt.receiptPayload.statusNote.provenance}
                        </p>
                      ) : null}
                      <p style={{ margin: 0, color: "#687078", fontSize: "0.82rem", lineHeight: 1.4 }}>
                        {receipt.receiptPayload.nextStep}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ display: "grid", gap: "0.9rem" }}>
            <div>
              <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.05rem" }}>Visual mode</h2>
              <p style={{ margin: 0, color: "#687078", lineHeight: 1.55 }}>
                Configure how Station frames public-safe summaries from the external runtime. This changes the observatory presentation only, not the runtime.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "0.75rem" }}>
              <label style={{ display: "grid", gap: "0.35rem", color: "#1f2529", fontSize: "0.82rem" }}>
                Mode
                <select className="input" value={visualisationType} onChange={(event) => changeVisualisationType(event.target.value as DeveloperSpaceVisualisationType)}>
                  <option value="node_field">Node field</option>
                  <option value="timeline">Timeline</option>
                  <option value="world_map">World map</option>
                  <option value="constellation">Constellation</option>
                </select>
              </label>

              <div style={{ display: "grid", gap: "0.65rem" }}>
                {visualisationType === "node_field" ? (
                  <>
                    <label style={{ display: "grid", gap: "0.35rem", color: "#1f2529", fontSize: "0.82rem" }}>
                      Max nodes
                      <input className="input" type="number" min={4} max={32} value={Number(boundedVisualConfig.maxNodes)} onChange={(event) => updateVisualConfig("maxNodes", Number(event.target.value))} />
                    </label>
                    <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: "#1f2529", fontSize: "0.86rem" }}>
                      <input type="checkbox" checked={boundedVisualConfig.showMetrics !== false} onChange={(event) => updateVisualConfig("showMetrics", event.target.checked)} />
                      Show node metrics
                    </label>
                  </>
                ) : null}

                {visualisationType === "timeline" ? (
                  <>
                    <label style={{ display: "grid", gap: "0.35rem", color: "#1f2529", fontSize: "0.82rem" }}>
                      Event limit
                      <input className="input" type="number" min={3} max={30} value={Number(boundedVisualConfig.eventLimit)} onChange={(event) => updateVisualConfig("eventLimit", Number(event.target.value))} />
                    </label>
                    <label style={{ display: "grid", gap: "0.35rem", color: "#1f2529", fontSize: "0.82rem" }}>
                      Node limit
                      <input className="input" type="number" min={3} max={20} value={Number(boundedVisualConfig.nodeLimit)} onChange={(event) => updateVisualConfig("nodeLimit", Number(event.target.value))} />
                    </label>
                    <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: "#1f2529", fontSize: "0.86rem" }}>
                      <input type="checkbox" checked={boundedVisualConfig.showSnapshots !== false} onChange={(event) => updateVisualConfig("showSnapshots", event.target.checked)} />
                      Show snapshots
                    </label>
                  </>
                ) : null}

                {visualisationType === "world_map" ? (
                  <>
                    <label style={{ display: "grid", gap: "0.35rem", color: "#1f2529", fontSize: "0.82rem" }}>
                      Zone field
                      <input className="input" maxLength={48} value={String(boundedVisualConfig.zoneField)} onChange={(event) => updateVisualConfig("zoneField", event.target.value)} />
                    </label>
                    <label style={{ display: "grid", gap: "0.35rem", color: "#1f2529", fontSize: "0.82rem" }}>
                      Max zones
                      <input className="input" type="number" min={3} max={24} value={Number(boundedVisualConfig.maxZones)} onChange={(event) => updateVisualConfig("maxZones", Number(event.target.value))} />
                    </label>
                    <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: "#1f2529", fontSize: "0.86rem" }}>
                      <input type="checkbox" checked={boundedVisualConfig.staggerZones !== false} onChange={(event) => updateVisualConfig("staggerZones", event.target.checked)} />
                      Stagger zone cards
                    </label>
                  </>
                ) : null}

                {visualisationType === "constellation" ? (
                  <>
                    <label style={{ display: "grid", gap: "0.35rem", color: "#1f2529", fontSize: "0.82rem" }}>
                      Max nodes
                      <input className="input" type="number" min={4} max={32} value={Number(boundedVisualConfig.maxNodes)} onChange={(event) => updateVisualConfig("maxNodes", Number(event.target.value))} />
                    </label>
                    <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: "#1f2529", fontSize: "0.86rem" }}>
                      <input type="checkbox" checked={boundedVisualConfig.showEventCounts !== false} onChange={(event) => updateVisualConfig("showEventCounts", event.target.checked)} />
                      Show event counts
                    </label>
                  </>
                ) : null}
              </div>
            </div>

            <button className="button primary" onClick={saveVisualConfig} disabled={savingVisualConfig} style={{ width: "fit-content" }}>
              {savingVisualConfig ? "Saving..." : "Save visual mode"}
            </button>
          </div>

          <div className="card" style={{ display: "grid", gap: "0.9rem" }}>
            <div>
              <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.05rem" }}>Observatory widgets</h2>
              <p style={{ margin: 0, color: "#687078", lineHeight: 1.55 }}>
                Choose which public readback panels appear and reorder them inside the main canvas or side rail. Widgets do not expose private fields or execute runtime work.
              </p>
            </div>
            <div style={{ display: "grid", gap: "0.55rem" }}>
              {widgetLayout.map((widget) => (
                <div key={widget.id} style={widgetRow}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 }}>
                    <input
                      type="checkbox"
                      checked={widget.visible}
                      onChange={(event) => changeWidgetVisibility(widget.type, event.target.checked)}
                    />
                    <span style={{ color: "#1f2529", fontWeight: 700, fontSize: "0.86rem" }}>{widget.title}</span>
                    <span className="pill" style={{ fontSize: "0.68rem", textTransform: "capitalize" }}>{widget.zone}</span>
                  </label>
                  <div style={{ display: "flex", gap: "0.35rem", marginLeft: "auto" }}>
                    <button type="button" className="button" onClick={() => moveWidget(widget.type, -1)} style={smallWidgetButton}>Up</button>
                    <button type="button" className="button" onClick={() => moveWidget(widget.type, 1)} style={smallWidgetButton}>Down</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="button primary" onClick={saveVisualConfig} disabled={savingVisualConfig} style={{ width: "fit-content" }}>
              {savingVisualConfig ? "Saving..." : "Save widgets"}
            </button>
          </div>

          <div className="card" style={{ display: "grid", gap: "0.8rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "flex-start", flexWrap: "wrap" }}>
              <div>
                <h2 style={{ margin: "0 0 0.35rem", fontSize: "1.05rem" }}>Exports</h2>
                <p style={{ margin: 0, color: "#687078", lineHeight: 1.55 }}>
                  Owner-only JSON/Markdown packages include nodes, events, snapshots, usage, and public-safe linked document refs. They are private readbacks, not public downloads.
                </p>
              </div>
              <button className="button primary" onClick={createExportPackage} disabled={exporting}>
                {exporting ? "Exporting..." : "Create export"}
              </button>
            </div>
            {exportsList.length === 0 ? (
              <p style={{ margin: 0, color: "#687078" }}>No export packages yet.</p>
            ) : (
              <div style={{ display: "grid", gap: "0.55rem" }}>
                {exportsList.slice(0, 5).map((item) => (
                  <div key={item.id} style={{ borderTop: "1px solid #d8d3c8", paddingTop: "0.55rem", display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                    <div>
                      <strong style={{ display: "block" }}>{item.packageKind.replaceAll("_", " ")}</strong>
                      <span style={{ color: "#8b8f92", fontSize: "0.78rem" }}>{formatDate(item.completedAt ?? item.requestedAt)}</span>
                    </div>
                    <span className="pill" style={{ textTransform: "capitalize" }}>{item.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ display: "grid", gap: "0.9rem" }}>
            <div>
              <h2 style={{ margin: "0 0 0.4rem", fontSize: "1.05rem" }}>Evidence path</h2>
              <p style={{ margin: 0, color: "#687078", lineHeight: 1.55 }}>
                Curate the methodology, findings, field logs, and notes that make the public Developer Page readable beside external-runtime signals. Drafts stay owner-only; public evidence enters the visitor path.
              </p>
            </div>

            <form onSubmit={createLinkedDocument} style={{ display: "grid", gap: "0.75rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: "0.75rem" }}>
                <label style={{ display: "grid", gap: "0.35rem", color: "#1f2529", fontSize: "0.82rem" }}>
                  Evidence role
                  <select className="input" value={documentRole} onChange={(event) => setDocumentRole(event.target.value as DeveloperSpaceDocumentRole)}>
                    {DEVELOPER_SPACE_EVIDENCE_ROLES.map((role) => (
                      <option key={role} value={role}>{developerSpaceEvidenceRoleCopy(role)}</option>
                    ))}
                  </select>
                </label>
                <label style={{ display: "grid", gap: "0.35rem", color: "#1f2529", fontSize: "0.82rem" }}>
                  Position
                  <input
                    className="input"
                    type="number"
                    min={0}
                    max={100000}
                    value={documentSortOrder}
                    onChange={(event) => setDocumentSortOrder(event.target.value)}
                  />
                </label>
                <label style={{ display: "grid", gap: "0.35rem", color: "#1f2529", fontSize: "0.82rem" }}>
                  Title
                  <input className="input" value={documentTitle} onChange={(event) => setDocumentTitle(event.target.value)} placeholder="Use role default title" />
                </label>
              </div>
              <p style={{ margin: "-0.25rem 0 0", color: "#687078", fontSize: "0.84rem", lineHeight: 1.45 }}>
                {developerSpaceEvidenceRoleDescription(documentRole)}
              </p>
              <label style={{ display: "grid", gap: "0.35rem", color: "#1f2529", fontSize: "0.82rem" }}>
                Body
                <textarea className="textarea" value={documentBody} onChange={(event) => setDocumentBody(event.target.value)} placeholder="Write the evidence visitors should read with this role" />
              </label>
              <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: "#1f2529", fontSize: "0.86rem" }}>
                <input type="checkbox" checked={publishDocument} onChange={(event) => setPublishDocument(event.target.checked)} />
                Publish to visitor evidence path
              </label>
              <button className="button primary" type="submit" disabled={savingDocument}>
                {savingDocument ? "Saving..." : "Save evidence"}
              </button>
            </form>

            {orderedEvidence.length === 0 ? (
              <p style={{ margin: 0, color: "#687078" }}>{developerSpaceEvidenceEmptyCopy(true)}</p>
            ) : (
              <div style={{ display: "grid", gap: "0.65rem" }}>
                {orderedEvidence.map((link) => {
                  const visitorVisible = link.linkVisibility === "public"
                    && link.document.status === "published"
                    && link.document.visibility === "public";
                  const reviewHref = developerSpaceEvidenceReviewHref(link, true);
                  const canRequestPublish = developerSpaceEvidenceCanRequestPublish(link, true);

                  return (
                  <article key={link.id} style={{ borderTop: "1px solid #d8d3c8", paddingTop: "0.65rem" }}>
                    <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.35rem" }}>
                      <span className="pill" style={{ fontSize: "0.68rem" }}>{developerSpaceEvidenceRoleCopy(link.role)}</span>
                      <span className="pill" style={{ fontSize: "0.68rem", textTransform: "capitalize" }}>{link.document.status}</span>
                      <span className="pill" style={{ fontSize: "0.68rem" }}>{visitorVisible ? "Visible to visitors" : "Hidden from visitors"}</span>
                    </div>
                    <strong style={{ display: "block" }}>{link.document.title}</strong>
                    <p style={{ margin: "0.25rem 0 0", color: "#8b8f92", fontSize: "0.82rem", lineHeight: 1.45 }}>
                      {developerSpaceEvidenceRoleDescription(link.role)}
                    </p>
                    {link.document.excerpt ? (
                      <p style={{ margin: "0.35rem 0 0", color: "#687078", lineHeight: 1.55 }}>{link.document.excerpt}</p>
                    ) : null}
                    {reviewHref || canRequestPublish ? (
                      <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", marginTop: "0.55rem" }}>
                        {reviewHref ? (
                          <Link className="station-muted-button" href={reviewHref} style={{ width: "fit-content" }}>
                            Review draft
                          </Link>
                        ) : null}
                        {canRequestPublish ? (
                          <button
                            type="button"
                            className="button primary"
                            onClick={() => createAgentConfirmation("publish_to_page", { targetDocumentId: link.document.id })}
                            disabled={!agentConfirmationStoreAvailable || agentConfirmationCreatingAction === "publish_to_page"}
                            style={{ width: "fit-content" }}
                          >
                            {agentConfirmationCreatingAction === "publish_to_page" ? "Requesting..." : "Request publish"}
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card" style={{ display: "grid", gap: "0.75rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.05rem" }}>1. Send node state updates</h2>
            <p style={{ margin: 0, color: "#687078", lineHeight: 1.55 }}>
              Use stable external node IDs from your self-hosted runtime. Station upserts each node and emits a public-safe state-update event for the observatory timeline.
            </p>
            <CodeBlock code={nodeStateCurl} />
          </div>

          <div className="card" style={{ display: "grid", gap: "0.75rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.05rem" }}>2. Stream events</h2>
            <p style={{ margin: 0, color: "#687078", lineHeight: 1.55 }}>
              Events are the visitor-facing feed. Include provenance and sourceRefs so viewers can distinguish runtime output, imports, and AI-generated material without raw payloads.
            </p>
            <CodeBlock code={eventCurl} />
          </div>

          <div className="card" style={{ display: "grid", gap: "0.75rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.05rem" }}>3. Save periodic snapshots</h2>
            <p style={{ margin: 0, color: "#687078", lineHeight: 1.55 }}>
              Snapshots support historical playback later. Send compact public-safe state summaries weekly or at the end of important runs.
            </p>
            <CodeBlock code={snapshotCurl} />
          </div>
        </section>
      </section>
    </main>
  );
}

const widgetRow = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  flexWrap: "wrap" as const,
  border: "1px solid #d8d3c8",
  borderRadius: 10,
  background: "#ffffff",
  padding: "0.7rem",
};

const smallWidgetButton = {
  minHeight: 30,
  padding: "0 0.55rem",
  fontSize: "0.74rem",
};

const agentActionButton = {
  alignItems: "flex-start",
  borderRadius: 8,
  display: "grid",
  gap: "0.25rem",
  justifyContent: "stretch",
  minHeight: 78,
  padding: "0.7rem",
  textAlign: "left" as const,
  whiteSpace: "normal" as const,
};

const agentFutureButton = {
  ...agentActionButton,
  background: "#f7f0e4",
  borderColor: "#d8d3c8",
};

const agentPreviewBox = {
  background: "#fbfaf7",
  border: "1px solid #d8d3c8",
  borderRadius: 8,
  display: "grid",
  gap: "0.75rem",
  minHeight: 150,
  padding: "0.85rem",
};

const agentPreviewSection = {
  background: "#ffffff",
  border: "1px solid #e7e0d4",
  borderRadius: 8,
  minWidth: 0,
  overflowWrap: "anywhere" as const,
  padding: "0.75rem",
};

const agentFactBox = {
  background: "#ffffff",
  border: "1px solid #e7e0d4",
  borderRadius: 8,
  display: "grid",
  gap: "0.2rem",
  minWidth: 0,
  padding: "0.55rem",
};

const agentConfirmationRow = {
  background: "#ffffff",
  border: "1px solid #e7e0d4",
  borderRadius: 8,
  display: "grid",
  gap: "0.5rem",
  padding: "0.7rem",
};

const agentConfirmationButton = {
  minHeight: 32,
  padding: "0 0.65rem",
  fontSize: "0.76rem",
};

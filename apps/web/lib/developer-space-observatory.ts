import type {
  DeveloperSpaceDetail,
  DeveloperSpaceWidgetConfig,
  DeveloperSpaceWidgetType,
  DeveloperSpaceWidgetZone,
  DeveloperSpaceNode,
  DeveloperSpaceVisualisationType,
} from "@station/types/developer-space";

export function formatDate(value?: string | null) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function nodePosition(index: number, total: number) {
  if (total <= 1) return { left: "50%", top: "50%" };
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  const radius = 35;
  return {
    left: `${50 + Math.cos(angle) * radius}%`,
    top: `${50 + Math.sin(angle) * radius}%`,
  };
}

export function similarityPercent(node: DeveloperSpaceNode | { selfSimilarityScore?: number | null }) {
  if (node.selfSimilarityScore === null || node.selfSimilarityScore === undefined) return null;
  return Math.round(node.selfSimilarityScore * 100);
}

export function metricEntries(node: DeveloperSpaceNode) {
  return Object.entries(node.metrics ?? {}).filter(([, value]) => typeof value !== "object").slice(0, 4);
}

export function humaniseKey(value: string) {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function truncateText(value: string, maxLength = 120) {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > maxLength ? `${clean.slice(0, maxLength - 3).trim()}...` : clean;
}

export function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Not recorded";
  if (typeof value === "number") return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.slice(0, 4).map(formatValue).join(", ");
  if (typeof value === "object") return "Structured record";
  return truncateText(String(value));
}

export function publicEntries(record: Record<string, unknown> | null | undefined, limit = 4) {
  return Object.entries(record ?? {})
    .filter(([, value]) => value !== null && value !== undefined && typeof value !== "object")
    .slice(0, limit);
}

export function visualisationLabel(type: DeveloperSpaceVisualisationType) {
  const labels: Record<DeveloperSpaceVisualisationType, string> = {
    node_field: "Node field",
    timeline: "Timeline",
    world_map: "World map",
    constellation: "Constellation",
  };
  return labels[type] ?? "Observatory";
}

export function shouldShowRawDeveloperSpaceData(access: DeveloperSpaceDetail["access"]) {
  return access === "owner";
}

const DEFAULT_WIDGETS: DeveloperSpaceWidgetConfig[] = [
  { id: "visualisation", type: "visualisation", title: "Live visualisation", zone: "main", position: 0, visible: true },
  { id: "event_stream", type: "event_stream", title: "Event stream", zone: "main", position: 1, visible: true },
  { id: "reading_guide", type: "reading_guide", title: "How to read this", zone: "side", position: 0, visible: true },
  { id: "project_notes", type: "project_notes", title: "Project notes", zone: "side", position: 1, visible: true },
  { id: "current_nodes", type: "current_nodes", title: "Current nodes", zone: "side", position: 2, visible: true },
  { id: "latest_snapshot", type: "latest_snapshot", title: "Latest snapshot", zone: "side", position: 3, visible: true },
];

const WIDGET_TYPES = new Set<DeveloperSpaceWidgetType>(DEFAULT_WIDGETS.map((widget) => widget.type));
const WIDGET_ZONES = new Set<DeveloperSpaceWidgetZone>(["main", "side"]);

export function defaultDeveloperSpaceWidgets() {
  return DEFAULT_WIDGETS.map((widget) => ({ ...widget }));
}

export function normaliseDeveloperSpaceWidgets(input: unknown) {
  const provided = Array.isArray(input) ? input : [];
  const byType = new Map<DeveloperSpaceWidgetType, Partial<DeveloperSpaceWidgetConfig>>();

  for (const value of provided) {
    if (!value || typeof value !== "object") continue;
    const candidate = value as Partial<DeveloperSpaceWidgetConfig>;
    if (!candidate.type || !WIDGET_TYPES.has(candidate.type)) continue;
    byType.set(candidate.type, candidate);
  }

  return DEFAULT_WIDGETS
    .map((fallback) => {
      const candidate = byType.get(fallback.type);
      const zone = candidate?.zone && WIDGET_ZONES.has(candidate.zone) ? candidate.zone : fallback.zone;
      return {
        id: fallback.id,
        type: fallback.type,
        title: typeof candidate?.title === "string" && candidate.title.trim() ? candidate.title.trim().slice(0, 80) : fallback.title,
        zone,
        position: typeof candidate?.position === "number" && Number.isFinite(candidate.position) ? Math.max(0, Math.floor(candidate.position)) : fallback.position,
        visible: candidate?.visible !== false,
      };
    })
    .sort((a, b) => a.zone.localeCompare(b.zone) || a.position - b.position || a.title.localeCompare(b.title))
    .map((widget, index, widgets) => ({
      ...widget,
      position: widgets.filter((candidate) => candidate.zone === widget.zone && candidate.position < widget.position).length
        + widgets.filter((candidate) => candidate.zone === widget.zone && candidate.position === widget.position && candidate.title < widget.title).length
        + widgets.filter((candidate) => candidate.zone === widget.zone && candidate.id === widget.id).length - 1,
    }));
}

export function widgetsForZone(widgets: DeveloperSpaceWidgetConfig[], zone: DeveloperSpaceWidgetZone) {
  return widgets
    .filter((widget) => widget.zone === zone && widget.visible)
    .sort((a, b) => a.position - b.position);
}

export function updateWidgetVisibility(
  widgets: DeveloperSpaceWidgetConfig[],
  type: DeveloperSpaceWidgetType,
  visible: boolean
) {
  return widgets.map((widget) => widget.type === type ? { ...widget, visible } : widget);
}

export function moveDeveloperSpaceWidget(
  widgets: DeveloperSpaceWidgetConfig[],
  type: DeveloperSpaceWidgetType,
  direction: -1 | 1
) {
  const target = widgets.find((widget) => widget.type === type);
  if (!target) return widgets;

  const zoneWidgets = widgetsForZone(widgets.map((widget) => ({ ...widget, visible: true })), target.zone);
  const fromIndex = zoneWidgets.findIndex((widget) => widget.type === type);
  const toIndex = fromIndex + direction;
  if (fromIndex < 0 || toIndex < 0 || toIndex >= zoneWidgets.length) return widgets;

  const reordered = [...zoneWidgets];
  const [moved] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, moved);

  const positions = new Map(reordered.map((widget, index) => [widget.type, index]));
  return widgets.map((widget) => positions.has(widget.type) ? { ...widget, position: positions.get(widget.type)! } : widget);
}

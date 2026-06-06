import type {
  DeveloperSpaceDetail,
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

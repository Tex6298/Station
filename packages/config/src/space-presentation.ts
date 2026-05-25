export const SPACE_THEME_IDS = ["atlas", "folio", "signal", "garden"] as const;
export type SpaceThemeId = typeof SPACE_THEME_IDS[number];

export const SPACE_LAYOUT_IDS = ["editorial", "portfolio", "archive"] as const;
export type SpaceLayoutId = typeof SPACE_LAYOUT_IDS[number];

export interface SpacePresentationOption<T extends string> {
  id: T;
  label: string;
  description: string;
}

export const SPACE_THEME_OPTIONS: SpacePresentationOption<SpaceThemeId>[] = [
  {
    id: "atlas",
    label: "Atlas",
    description: "A warm public identity page for essays, profiles, and orientation.",
  },
  {
    id: "folio",
    label: "Folio",
    description: "A crisp portfolio surface for projects, releases, and featured work.",
  },
  {
    id: "signal",
    label: "Signal",
    description: "A high-contrast research page for notes, logs, and field reports.",
  },
  {
    id: "garden",
    label: "Garden",
    description: "A calm library page for collections, personas, and evolving archives.",
  },
];

export const SPACE_LAYOUT_OPTIONS: SpacePresentationOption<SpaceLayoutId>[] = [
  {
    id: "editorial",
    label: "Editorial",
    description: "Lead with a written introduction and a curated reading path.",
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Lead with featured work, visible identity, and compact sections.",
  },
  {
    id: "archive",
    label: "Archive",
    description: "Lead with public documents, collections, and library structure.",
  },
];

export interface SpacePresentationConfig {
  theme: SpaceThemeId;
  layout: SpaceLayoutId;
  tagline: string;
}

export const DEFAULT_SPACE_PRESENTATION: SpacePresentationConfig = {
  theme: "atlas",
  layout: "editorial",
  tagline: "",
};

const themeSet = new Set<string>(SPACE_THEME_IDS);
const layoutSet = new Set<string>(SPACE_LAYOUT_IDS);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parsePresentationInput(input: unknown): Record<string, unknown> {
  if (!input) return {};
  if (isRecord(input)) return input;

  if (typeof input !== "string") return {};
  const value = input.trim();
  if (!value) return {};

  if (value.startsWith("{")) {
    try {
      const parsed = JSON.parse(value);
      return isRecord(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  return { theme: value };
}

export function normalizeSpacePresentation(input?: unknown): SpacePresentationConfig {
  const candidate = parsePresentationInput(input);
  const theme = typeof candidate.theme === "string" && themeSet.has(candidate.theme)
    ? candidate.theme as SpaceThemeId
    : DEFAULT_SPACE_PRESENTATION.theme;
  const layout = typeof candidate.layout === "string" && layoutSet.has(candidate.layout)
    ? candidate.layout as SpaceLayoutId
    : DEFAULT_SPACE_PRESENTATION.layout;

  return {
    theme,
    layout,
    tagline: cleanString(candidate.tagline, 160),
  };
}

export function encodeSpacePresentation(input?: unknown) {
  return JSON.stringify(normalizeSpacePresentation(input));
}

export const STATION_THEME_STORAGE_KEY = "station:appearance";
export const STATION_THEME_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export const STATION_THEME_PREFERENCES = ["system", "light", "dark"] as const;

export type StationThemePreference = (typeof STATION_THEME_PREFERENCES)[number];
export type ResolvedStationTheme = Exclude<StationThemePreference, "system">;

type ThemeStorage = Pick<Storage, "getItem" | "setItem">;
type ThemeRoot = {
  setAttribute(name: string, value: string): void;
  style: { colorScheme: string };
};

export function normalizeStationThemePreference(value: unknown): StationThemePreference {
  return typeof value === "string" && STATION_THEME_PREFERENCES.includes(value as StationThemePreference)
    ? (value as StationThemePreference)
    : "system";
}

export function resolveStationTheme(
  preference: StationThemePreference,
  systemPrefersDark: boolean
): ResolvedStationTheme {
  if (preference === "system") return systemPrefersDark ? "dark" : "light";
  return preference;
}

export function readStationThemePreference(storage: ThemeStorage | null | undefined): StationThemePreference {
  if (!storage) return "system";
  try {
    return normalizeStationThemePreference(storage.getItem(STATION_THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

export function persistStationThemePreference(
  storage: ThemeStorage | null | undefined,
  preference: StationThemePreference
): void {
  if (!storage) return;
  try {
    storage.setItem(STATION_THEME_STORAGE_KEY, preference);
  } catch {
    // Appearance is optional; denied storage must not break navigation.
  }
}

export function applyStationTheme(
  root: ThemeRoot,
  preference: StationThemePreference,
  systemPrefersDark: boolean
): ResolvedStationTheme {
  const resolved = resolveStationTheme(preference, systemPrefersDark);
  root.setAttribute("data-station-theme-preference", preference);
  root.setAttribute("data-station-theme", resolved);
  root.style.colorScheme = resolved;
  return resolved;
}

export const STATION_THEME_BOOTSTRAP_SCRIPT = `(() => {
  const root = document.documentElement;
  let preference = "system";
  try {
    const stored = window.localStorage.getItem(${JSON.stringify(STATION_THEME_STORAGE_KEY)});
    if (stored === "light" || stored === "dark" || stored === "system") preference = stored;
  } catch {}
  let systemPrefersDark = false;
  try {
    systemPrefersDark = window.matchMedia(${JSON.stringify(STATION_THEME_MEDIA_QUERY)}).matches;
  } catch {}
  const resolved = preference === "system" ? (systemPrefersDark ? "dark" : "light") : preference;
  root.setAttribute("data-station-theme-preference", preference);
  root.setAttribute("data-station-theme", resolved);
  root.style.colorScheme = resolved;
})();`;

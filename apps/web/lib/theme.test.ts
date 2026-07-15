import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  STATION_THEME_BOOTSTRAP_SCRIPT,
  STATION_THEME_MEDIA_QUERY,
  STATION_THEME_STORAGE_KEY,
  applyStationTheme,
  normalizeStationThemePreference,
  persistStationThemePreference,
  readStationThemePreference,
  resolveStationTheme,
} from "./theme";

test("theme preference accepts only System, Light, and Dark values", () => {
  assert.equal(normalizeStationThemePreference("system"), "system");
  assert.equal(normalizeStationThemePreference("light"), "light");
  assert.equal(normalizeStationThemePreference("dark"), "dark");
  assert.equal(normalizeStationThemePreference("midnight"), "system");
  assert.equal(normalizeStationThemePreference(null), "system");
});

test("system resolution follows the media preference while explicit choices win", () => {
  assert.equal(resolveStationTheme("system", false), "light");
  assert.equal(resolveStationTheme("system", true), "dark");
  assert.equal(resolveStationTheme("light", true), "light");
  assert.equal(resolveStationTheme("dark", false), "dark");
});

test("theme storage is bounded, non-sensitive, and failure tolerant", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };

  assert.equal(readStationThemePreference(storage), "system");
  persistStationThemePreference(storage, "dark");
  assert.equal(values.get(STATION_THEME_STORAGE_KEY), "dark");
  assert.equal(readStationThemePreference(storage), "dark");

  const denied = {
    getItem: () => {
      throw new Error("denied");
    },
    setItem: () => {
      throw new Error("denied");
    },
  };
  assert.equal(readStationThemePreference(denied), "system");
  assert.doesNotThrow(() => persistStationThemePreference(denied, "light"));
});

test("applying a theme records both preference and resolved color scheme", () => {
  const attributes = new Map<string, string>();
  const root = {
    setAttribute: (name: string, value: string) => attributes.set(name, value),
    style: { colorScheme: "" },
  };

  assert.equal(applyStationTheme(root, "system", true), "dark");
  assert.equal(attributes.get("data-station-theme-preference"), "system");
  assert.equal(attributes.get("data-station-theme"), "dark");
  assert.equal(root.style.colorScheme, "dark");
});

test("the first-paint bootstrap uses the same storage and media contracts", () => {
  assert.match(STATION_THEME_BOOTSTRAP_SCRIPT, new RegExp(STATION_THEME_STORAGE_KEY));
  assert.match(STATION_THEME_BOOTSTRAP_SCRIPT, new RegExp(STATION_THEME_MEDIA_QUERY.replace(/[()]/g, "\\$&")));
  assert.match(STATION_THEME_BOOTSTRAP_SCRIPT, /data-station-theme-preference/);
  assert.match(STATION_THEME_BOOTSTRAP_SCRIPT, /data-station-theme/);
  assert.match(STATION_THEME_BOOTSTRAP_SCRIPT, /colorScheme/);
});

test("layout boots appearance before the client navigation and no API or cookie contract is added", () => {
  const layout = readFileSync("apps/web/app/layout.tsx", "utf8");
  const nav = readFileSync("apps/web/components/nav/top-nav.tsx", "utf8");
  const theme = readFileSync("apps/web/lib/theme.ts", "utf8");
  const source = `${layout}\n${nav}\n${theme}`;

  assert.match(layout, /STATION_THEME_BOOTSTRAP_SCRIPT/);
  assert.match(layout, /suppressHydrationWarning/);
  assert.ok(layout.indexOf("station-theme-bootstrap") < layout.indexOf("<body>"));
  assert.match(nav, /role="menuitemradio"/);
  assert.match(nav, /STATION_THEME_PREFERENCES\.map/);
  assert.match(theme, /\["system", "light", "dark"\]/);
  assert.doesNotMatch(source, /document\.cookie|apiPost|apiPut|apiDelete|\/api\/theme/);
});

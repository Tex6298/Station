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

function hexLuminance(hex: string) {
  const channels = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const linear = channels.map((channel) => (
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  ));
  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
}

function contrastRatio(first: string, second: string) {
  const luminances = [hexLuminance(first), hexLuminance(second)].sort((left, right) => right - left);
  return (luminances[0]! + 0.05) / (luminances[1]! + 0.05);
}

function stationThemeTokens(css: string, theme: "light" | "dark") {
  const blocks = theme === "light"
    ? Array.from(css.matchAll(/:root\s*\{([^}]+)\}/gs), (match) => match[1]!)
    : Array.from(css.matchAll(/html\[data-station-theme="dark"\]\s*\{([^}]+)\}/gs), (match) => match[1]!);
  const block = blocks.find((candidate) => candidate.includes("--station-page-text"));
  assert.ok(block, `${theme} Station theme tokens should exist`);

  return (name: string) => {
    const value = block.match(new RegExp(`${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1];
    assert.ok(value, `${theme} ${name} should be a six-digit hex colour`);
    return value;
  };
}

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

test("dark treatment preserves Discover selection contrast and the bounded observatory canvas", () => {
  const discover = readFileSync("apps/web/components/discover/discover-front-door.tsx", "utf8");
  const css = readFileSync("apps/web/app/globals.css", "utf8");
  const canvasBlock = css.match(/\.node-field-panel,\s*\.world-map-panel,\s*\.constellation-panel\s*\{([^}]+)\}/s)?.[1] ?? "";
  const nodeBlocks = Array.from(css.matchAll(/\.node-bubble\s*\{([^}]+)\}/gs), (match) => match[1]);
  const nodeBlock = nodeBlocks.at(-1) ?? "";

  assert.match(discover, /background: tab === t \? "var\(--public-home-surface\)"/);
  assert.match(canvasBlock, /#ffffff/);
  assert.match(canvasBlock, /#d8d3c8/);
  assert.match(canvasBlock, /#1f2529/);
  assert.doesNotMatch(canvasBlock, /--station-page-/);
  assert.match(nodeBlock, /#d8d3c8/);
  assert.match(nodeBlock, /#1f2529/);
  assert.doesNotMatch(nodeBlock, /--station-page-/);
});

test("principal partner routes use semantic theme contracts without changing their destinations", () => {
  const css = readFileSync("apps/web/app/globals.css", "utf8");
  const documentPage = readFileSync("apps/web/app/space/[slug]/documents/[documentId]/page.tsx", "utf8");
  const archiveLibrary = readFileSync("apps/web/components/studio/archive-library.tsx", "utf8");
  const documentTrust = documentPage.slice(
    documentPage.indexOf("function DocumentTrustReadback"),
    documentPage.indexOf("function trustRowStyle"),
  );
  const trustRows = documentPage.slice(documentPage.indexOf("function trustRowStyle"));
  const archiveCopy = css.match(/\.archive-trust-copy\s*\{([^}]+)\}/s)?.[1] ?? "";
  const primaryButton = archiveLibrary.slice(archiveLibrary.indexOf("const primaryButton"));

  assert.match(documentTrust, /var\(--station-page-accent\)/);
  assert.match(documentTrust, /var\(--station-page-text\)/);
  assert.match(documentTrust, /var\(--station-page-muted\)/);
  assert.doesNotMatch(documentTrust, /color:\s*["']#/);
  assert.match(trustRows, /var\(--station-page-soft-2\)/);
  assert.match(trustRows, /var\(--station-page-success-bg\)/);
  assert.match(trustRows, /var\(--station-page-warning-bg\)/);
  assert.doesNotMatch(trustRows, /background:\s*["']#|borderColor:\s*["'](?:#|rgba)/);

  assert.match(archiveCopy, /color:\s*var\(--station-page-muted\)/);
  assert.doesNotMatch(archiveCopy, /#[0-9a-f]{3,8}/i);
  assert.match(archiveLibrary, /href="\/studio\/assistant" className="archive-primary-action" style=\{primaryButton\}>Ask Assistant<\/Link>/);
  assert.match(primaryButton, /var\(--archive-primary-border, var\(--station-page-text\)\)/);
  assert.match(primaryButton, /var\(--archive-primary-background, var\(--station-page-text\)\)/);
  assert.match(primaryButton, /color:\s*"var\(--station-page-on-strong\)"/);
  assert.match(css, /\.archive-primary-action:hover\s*\{[^}]*--archive-primary-border:\s*var\(--station-page-accent\)[^}]*--archive-primary-background:\s*var\(--station-page-accent\)/s);
  assert.match(css, /\.archive-primary-action:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--station-page-accent\)/s);
});

test("principal partner route token pairs retain meaningful text contrast in Light and Dark", () => {
  const css = readFileSync("apps/web/app/globals.css", "utf8");

  for (const theme of ["light", "dark"] as const) {
    const token = stationThemeTokens(css, theme);
    const backgrounds = [
      "--station-page-surface",
      "--station-page-soft-2",
      "--station-page-success-bg",
      "--station-page-warning-bg",
    ];

    for (const background of backgrounds) {
      for (const foreground of ["--station-page-text", "--station-page-muted", "--station-page-accent"]) {
        const ratio = contrastRatio(token(foreground), token(background));
        assert.ok(ratio >= 4.5, `${theme} ${foreground} on ${background} was ${ratio.toFixed(2)}:1`);
      }
    }

    for (const background of ["--station-page-text", "--station-page-accent"]) {
      const ratio = contrastRatio(token("--station-page-on-strong"), token(background));
      assert.ok(ratio >= 4.5, `${theme} strong action on ${background} was ${ratio.toFixed(2)}:1`);
    }
  }
});

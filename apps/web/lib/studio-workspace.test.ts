import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { SETTINGS_DESTINATION_SECTIONS } from "./settings-navigation";

test("Studio layout owns one workspace and recent-conversation loader", () => {
  const layoutSource = readFileSync("apps/web/app/studio/layout.tsx", "utf8");
  const workspaceSource = readFileSync("apps/web/lib/use-studio-workspace.tsx", "utf8");
  const dashboardSource = readFileSync("apps/web/components/studio/studio-dashboard.tsx", "utf8");
  const sidebarSource = readFileSync("apps/web/components/studio/studio-sidebar.tsx", "utf8");

  assert.match(layoutSource, /<StudioWorkspaceProvider>/);
  assert.ok(layoutSource.indexOf("<StudioWorkspaceProvider>") < layoutSource.indexOf("<StudioSidebar />"));
  assert.equal((workspaceSource.match(/useRecentConversations\(/g) ?? []).length, 1);
  assert.doesNotMatch(dashboardSource, /useRecentConversations/);
  assert.doesNotMatch(sidebarSource, /useRecentConversations/);
});

test("Studio shared loaders expose truthful loading and failure states", () => {
  const workspaceSource = readFileSync("apps/web/lib/use-studio-workspace.tsx", "utf8");
  const recentSource = readFileSync("apps/web/lib/use-recent-conversations.ts", "utf8");
  const sidebarSource = readFileSync("apps/web/components/studio/studio-sidebar.tsx", "utf8");

  assert.match(workspaceSource, /Could not load Studio\. Try again in a moment\./);
  assert.match(recentSource, /Recent conversations are temporarily unavailable\./);
  assert.match(recentSource, /Some recent conversations could not be loaded\./);
  assert.match(sidebarSource, /Loading companions\.\.\./);
  assert.match(sidebarSource, /Companions unavailable\./);
  assert.match(sidebarSource, /Recent conversations unavailable\./);
});

test("relocated account and publishing destinations remain explicit in Settings", () => {
  const routes = new Map(SETTINGS_DESTINATION_SECTIONS.map((section) => [section.title, section.href]));

  assert.equal(routes.get("Global Archive"), "/studio/archive");
  assert.equal(routes.get("Export workspace"), "/studio/export");
  assert.equal(routes.get("Public Space"), "/space");
  assert.equal(routes.get("Publishing Dashboard"), "/studio/publishing");
  assert.equal(routes.get("Station Assistant"), "/studio/assistant");
});

test("general mobile Studio navigation provides a direct companion-settings fallback", () => {
  const sidebarSource = readFileSync("apps/web/components/studio/studio-sidebar.tsx", "utf8");
  const cssSource = readFileSync("apps/web/app/globals.css", "utf8");

  assert.match(sidebarSource, />Companion settings</);
  assert.match(sidebarSource, /href=\{`\/studio\/personas\/\$\{persona\.id\}\/edit`\}/);
  assert.match(sidebarSource, /label=\{`\$\{persona\.name\} settings`\}/);
  assert.match(cssSource, /@media \(max-width: 959px\) \{\s*\.studio-companion-quick-triggers,/);
});

test("desktop Studio rail contains long-name rows without hiding quick controls", () => {
  const cssSource = readFileSync("apps/web/app/globals.css", "utf8");
  const railScroll = cssSource.match(/\.studio-rail-scroll\s*\{([^}]+)\}/s)?.[1] ?? "";
  const quickWrap = cssSource.match(/\.studio-companion-quick-wrap\s*\{([^}]+)\}/s)?.[1] ?? "";

  assert.match(railScroll, /min-width:\s*0/);
  assert.match(railScroll, /overflow-x:\s*clip/);
  assert.match(
    cssSource,
    /\.studio-rail-personas,\s*\.studio-rail-recent,\s*\.studio-rail-recent-list\s*\{[^}]*min-width:\s*0[^}]*width:\s*100%/s,
  );
  assert.match(quickWrap, /min-width:\s*0/);
  assert.match(quickWrap, /width:\s*100%/);
  assert.match(quickWrap, /max-width:\s*100%/);
  assert.match(
    cssSource,
    /\.studio-companion-quick-wrap:hover \.studio-companion-quick-triggers,[\s\S]*?display:\s*flex/,
  );
  assert.match(cssSource, /\.studio-companion-quick-card\s*\{[^}]*position:\s*fixed/s);
});

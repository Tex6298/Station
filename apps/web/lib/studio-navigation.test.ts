import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  SIGNED_MOBILE_TOP_NAV_MENU_ROUTES,
  STUDIO_MOBILE_NAV_SUMMARY_LABEL,
  activeStudioHref,
  studioRouteContext,
  studioPersonaHref,
  studioPersonaMeta,
  studioPersonaCompanionShortcuts,
  studioDashboardMemoryStop,
  studioPersonaWorkspacePrimaryActions,
  studioPersonaWorkspaceTabs,
  studioWorkspaceLinks,
} from "./studio-navigation";

test("Studio navigation helpers keep route matching bounded", () => {
  assert.equal(activeStudioHref("/studio", "/studio"), true);
  assert.equal(activeStudioHref("/studio/personas/123", "/studio"), false);
  assert.equal(activeStudioHref("/studio/personas/123/memory", "/studio/personas/123"), true);
  assert.equal(activeStudioHref("/studio/personas-archive", "/studio/personas"), false);
});

test("Studio navigation helpers expose private persona links and labels", () => {
  const persona = { id: "persona-1", visibility: "private" as const };

  assert.equal(studioPersonaHref(persona), "/studio/personas/persona-1");
  assert.equal(studioPersonaMeta(persona), "private - private Studio");
  assert.equal(studioWorkspaceLinks.some((link) => link.href === "/studio/onboarding"), true);
  assert.equal(studioWorkspaceLinks.some((link) => link.href === "/studio/archive"), true);
});

test("Studio persona workspace exposes Continuity as its own stop", () => {
  const tabs = studioPersonaWorkspaceTabs("persona-1");
  const labels = tabs.map((tab) => tab.label);
  assert.deepEqual(labels, ["Home", "Continuity", "Memory", "Canon", "Archive", "Integrity"]);
  assert.equal(tabs.find((tab) => tab.label === "Continuity")?.href, "/studio/personas/persona-1/continuity");
  assert.match(tabs.find((tab) => tab.label === "Memory")?.detail ?? "", /lifecycle/);
  assert.equal((labels as string[]).includes("Timeline"), false);
});

test("Studio persona workspace exposes Memory as a primary owner action", () => {
  const actions = studioPersonaWorkspacePrimaryActions("persona-1");

  assert.deepEqual(actions.map((action) => action.label), ["Open Memory", "Ask Assistant"]);
  assert.equal(actions[0]?.href, "/studio/personas/persona-1/memory");
  assert.match(actions[0]?.detail ?? "", /lifecycle/);
  assert.equal(actions.some((action) => action.href.startsWith("/space")), false);
});

test("Studio persona companion shortcuts expose the accepted owner routes", () => {
  const shortcuts = studioPersonaCompanionShortcuts("persona-1");

  assert.deepEqual(
    shortcuts.map((shortcut) => [shortcut.label, shortcut.href]),
    [
      ["Memory", "/studio/personas/persona-1/memory"],
      ["Inbox", "/studio/personas/persona-1/memory-inbox"],
      ["Timeline", "/studio/personas/persona-1/continuity"],
      ["Profile", "/studio/personas/persona-1/edit"],
      ["Integrity", "/studio/personas/persona-1/calibration"],
    ],
  );
  assert.equal(shortcuts.find((shortcut) => shortcut.label === "Memory")?.href, "/studio/personas/persona-1/memory");
  assert.equal(shortcuts.find((shortcut) => shortcut.label === "Inbox")?.href, "/studio/personas/persona-1/memory-inbox");
  assert.equal(shortcuts.some((shortcut) => shortcut.href.includes("/conversations/candidates/inbox")), false);
  assert.equal(shortcuts.some((shortcut) => shortcut.href.startsWith("/space")), false);
});

test("Studio persona page renders companion shortcuts without broad companion drift", () => {
  const pageSource = readFileSync("apps/web/app/studio/personas/[personaId]/page.tsx", "utf8");
  const cssSource = readFileSync("apps/web/app/globals.css", "utf8");

  assert.match(pageSource, /CompanionShortcutStrip/);
  assert.match(pageSource, /studioPersonaCompanionShortcuts\(personaId\)/);
  assert.match(pageSource, /aria-label="Companion workspace shortcuts"/);
  assert.match(cssSource, /\.studio-companion-shortcuts/);
  assert.doesNotMatch(pageSource, /sendPersonaChatWithStream|returnToThread|return-to-thread|candidates\/inbox|archive-connectors|source_inventory/i);
});

test("Studio dashboard Memory stop routes owners into persona Memory", () => {
  const stop = studioDashboardMemoryStop([
    { id: "persona-1", name: "Ariadne" },
    { id: "persona-2", name: "Daedalus" },
  ]);

  assert.equal(stop.label, "Memory");
  assert.equal(stop.href, "/studio/personas/persona-1/memory");
  assert.equal(stop.actionLabel, "Open Memory");
  assert.equal(stop.statusLabel, "2 persona memory workspaces");
  assert.match(stop.statusDetail, /Ariadne is ready for Memory review/);
  assert.match(stop.body, /distinct from Archive sources, Continuity records, Canon commitments, and Integrity checks/);
  assert.equal(stop.privacy, "Owner-only persona workspace");
});

test("Studio dashboard Memory stop has a coherent no-persona state", () => {
  const stop = studioDashboardMemoryStop([]);

  assert.equal(stop.href, "/studio/new");
  assert.equal(stop.actionLabel, "Create persona");
  assert.equal(stop.statusLabel, "No persona memory yet");
  assert.match(stop.statusDetail, /Create a private persona/);
  assert.match(stop.body, /stays owner-only/);
  assert.match(stop.body, /separate from Archive source intake, Continuity timeline records, Canon rules, and Integrity sessions/);
});

test("Studio route context names static Studio stops for mobile summaries", () => {
  assert.deepEqual(studioRouteContext("/studio/archive"), {
    label: "Global Archive",
    detail: "Live owner-only archive search",
    privacy: "Private archive",
    state: "Global Archive searches preserved owner-only material; persona Archive tabs handle source intake.",
    href: "/studio/archive",
    nextAction: { label: "Review Exports", href: "/studio/export" },
  });

  assert.equal(studioRouteContext("/studio/assistant").label, "Station Assistant");
  assert.match(studioRouteContext("/studio/assistant").state, /does not publish/);
  assert.equal(studioRouteContext("/studio/assistant").nextAction.href, "/studio/archive");
  assert.equal(studioRouteContext("/studio").detail, "Private workbench overview");
  assert.equal(studioRouteContext("/studio").nextAction.href, "/studio/new");
});

test("Studio route context names persona workspace stops without exposing raw ids", () => {
  const context = studioRouteContext(
    "/studio/personas/persona-1/memory",
    [{ id: "persona-1", name: "Ariadne" }],
  );

  assert.equal(context.label, "Ariadne / Memory");
  assert.equal(context.detail, "Recallable context and lifecycle state");
  assert.equal(context.privacy, "Owner-only persona workspace");
  assert.equal(context.state, "Saved memory can shape runtime context.");
  assert.equal(context.href, "/studio/personas/persona-1/memory");
  assert.deepEqual(context.nextAction, {
    label: "Open Archive",
    href: "/studio/personas/persona-1/files",
  });

  const fallback = studioRouteContext("/studio/personas/persona-2/files");
  assert.equal(fallback.label, "Persona / Archive");
  assert.equal(fallback.detail, "Private source material and imports");
  assert.match(fallback.state, /owner-only source material/);
});

test("Studio mobile navigation exposes an explicit disclosure label", () => {
  assert.equal(STUDIO_MOBILE_NAV_SUMMARY_LABEL, "Toggle Studio mobile navigation");
});

test("signed mobile top nav keeps protected routes reachable through the account menu", () => {
  assert.deepEqual([...SIGNED_MOBILE_TOP_NAV_MENU_ROUTES], ["/studio", "/projects", "/space", "/developer-spaces"]);
});

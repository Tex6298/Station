import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  publicPersonaChatAccess,
  publicPersonaContextPreviewCopy,
  publicPersonaChatCopy,
  publicPersonaChatDisabledCopy,
  publicPersonaCrossOwnerExhibitHref,
  publicPersonaCrossOwnerExhibitsCopy,
  publicPersonaCrossOwnerExhibitsEmptyCopy,
  publicPersonaHref,
  publicPersonaOptionalRead,
  publicPersonaOptionalReadErrorCopy,
  publicPersonaReadbackCopy,
  publicPersonaUpdatesCopy,
  publicPersonaUpdatesEmptyCopy,
} from "./public-persona-route";

test("public persona href only accepts safe public slugs", () => {
  assert.equal(publicPersonaHref("mimir-public"), "/personas/mimir-public");
  assert.equal(publicPersonaHref("persona-2"), "/personas/persona-2");
  assert.equal(publicPersonaHref("persona-550e8400-e29b-41d4-a716-446655440000"), "/personas/persona-550e8400-e29b-41d4-a716-446655440000");
  assert.equal(publicPersonaHref(""), null);
  assert.equal(publicPersonaHref("Persona One"), null);
  assert.equal(publicPersonaHref("raw/persona/id"), null);
  assert.equal(publicPersonaHref("550e8400-e29b-41d4-a716-446655440000"), null);
});

test("public persona cross-owner exhibit href derives only safe anchors", () => {
  assert.equal(
    publicPersonaCrossOwnerExhibitHref("cross-owner-linkback-12345678"),
    "/encounters/cross-owner#cross-owner-linkback-12345678"
  );
  assert.equal(publicPersonaCrossOwnerExhibitHref("cross-owner-linkback-1234567"), null);
  assert.equal(publicPersonaCrossOwnerExhibitHref("550e8400-e29b-41d4-a716-446655440000"), null);
  assert.equal(publicPersonaCrossOwnerExhibitHref("cross_owner_linkback_12345678"), null);
  assert.equal(publicPersonaCrossOwnerExhibitHref("/encounters/cross-owner#cross-owner-linkback-12345678"), null);
  assert.equal(publicPersonaCrossOwnerExhibitHref("https://example.test/cross-owner-linkback-12345678"), null);
});

test("public persona readback copy names private boundaries without route ids", () => {
  const copy = publicPersonaReadbackCopy();
  assert.match(copy, /Only the public profile/);
  assert.match(copy, /Private Studio memory/);
  assert.doesNotMatch(copy, /ownerUserId|personaId|provider payload|token|cookie/i);
});

test("public persona cross-owner exhibit copy names metadata-only linkback boundary", () => {
  const copy = publicPersonaCrossOwnerExhibitsCopy();
  assert.match(copy, /Approved cross-owner encounter exhibits/);
  assert.match(copy, /public metadata only/);
  assert.match(copy, /display snapshot/);
  assert.doesNotMatch(copy, /chat|context-preview|Space|forum|document|feed|homepage|generated|provider|retrieval|token|cookie/i);

  const empty = publicPersonaCrossOwnerExhibitsEmptyCopy();
  assert.match(empty, /No approved cross-owner public exhibit linkbacks/);
  assert.doesNotMatch(empty, /chat|provider|private|token|cookie/i);
});

test("public persona context preview copy is a preview boundary, not a chat promise", () => {
  const copy = publicPersonaContextPreviewCopy();
  assert.match(copy, /public source categories/);
  assert.match(copy, /public Salon threads/);
  assert.match(copy, /does not start chat/);
  assert.match(copy, /private runtime context/);
  assert.doesNotMatch(copy, /ask this persona|send message|live chat|model response/i);
});

test("public persona chat copy stays public-source-only", () => {
  const copy = publicPersonaChatCopy();
  assert.match(copy, /public profile/);
  assert.match(copy, /published public documents/);
  assert.match(copy, /linked public discussions/);
  assert.doesNotMatch(copy, /private memory|private continuity|owner setup|provider settings|token|cookie/i);

  const anonymous = publicPersonaChatCopy("anonymous_alpha");
  assert.match(anonymous, /Anonymous alpha/);
  assert.match(anonymous, /public profile/);
  assert.match(anonymous, /Reports still require sign-in/);
  assert.doesNotMatch(anonymous, /private memory|private continuity|owner setup|provider settings|token|cookie/i);

  const disabled = publicPersonaChatDisabledCopy();
  assert.match(disabled, /not enabled/);
  assert.doesNotMatch(disabled, /provider|quota|ownerUserId|personaId|token|cookie/i);
});

test("public persona chat access exposes anonymous form only for anonymous alpha", () => {
  assert.equal(publicPersonaChatAccess({ enabled: false, mode: "anonymous_alpha", hasSession: false }), "disabled");
  assert.equal(publicPersonaChatAccess({ enabled: true, mode: "anonymous_alpha", hasSession: false }), "anonymous_alpha");
  assert.equal(publicPersonaChatAccess({ enabled: true, mode: "anonymous_alpha", hasSession: true }), "anonymous_alpha");
  assert.equal(publicPersonaChatAccess({ enabled: true, mode: "signed_in_alpha", hasSession: false }), "sign_in_required");
  assert.equal(publicPersonaChatAccess({ enabled: true, mode: "signed_in_alpha", hasSession: true }), "signed_in_alpha");
});

test("public persona optional reads fail with bounded public copy", async () => {
  assert.equal(
    publicPersonaOptionalReadErrorCopy("context-preview"),
    "Public context preview is temporarily unavailable."
  );
  assert.equal(
    publicPersonaOptionalReadErrorCopy("updates"),
    "Public updates are temporarily unavailable."
  );
  assert.equal(
    publicPersonaOptionalReadErrorCopy("cross-owner-exhibits"),
    "Cross-owner public exhibit linkbacks are temporarily unavailable."
  );

  await assert.rejects(
    () => publicPersonaOptionalRead(new Promise(() => undefined), "context-preview", 1),
    /Public context preview is temporarily unavailable/
  );
  await assert.rejects(
    () => publicPersonaOptionalRead(Promise.reject(new Error("raw-owner-id-or-stack-secret")), "updates", 100),
    (error) =>
      error instanceof Error &&
      error.message === "Public updates are temporarily unavailable." &&
      !error.message.includes("raw-owner-id-or-stack-secret")
  );
  assert.equal(await publicPersonaOptionalRead(Promise.resolve("ok"), "updates", 100), "ok");
  assert.equal(await publicPersonaOptionalRead(Promise.resolve("ok"), "cross-owner-exhibits", 100), "ok");
});

test("public persona updates copy stays derived and public-source-only", () => {
  const copy = publicPersonaUpdatesCopy();
  assert.match(copy, /Public updates/);
  assert.match(copy, /published documents/);
  assert.match(copy, /public document discussions/);
  assert.match(copy, /public Salon threads/);
  assert.match(copy, /not live activity/);
  assert.match(copy, /private memory/);
  assert.doesNotMatch(copy, /provider calls|model calls|persona-to-persona|private continuity|owner setup|token|cookie/i);

  const empty = publicPersonaUpdatesEmptyCopy();
  assert.match(empty, /No published documents/);
  assert.match(empty, /public discussions/);
  assert.doesNotMatch(empty, /live|provider|private|persona-to-persona|ownerUserId|personaId|token|cookie/i);
});

test("public avatar renderers escape CSS URL values and keep owner control bounded", () => {
  const publicPersonaSource = readFileSync("apps/web/app/personas/[publicSlug]/page.tsx", "utf8");
  const publicSpaceSource = readFileSync("apps/web/app/space/[slug]/page.tsx", "utf8");
  const managementSource = readFileSync("apps/web/components/studio/persona-management.tsx", "utf8");
  const rendered = `${publicPersonaSource}\n${publicSpaceSource}\n${managementSource}`;

  assert.match(publicPersonaSource, /backgroundImage:\s*`url\(\$\{JSON\.stringify\(imageUrl\)\}\)`/);
  assert.match(publicSpaceSource, /backgroundImage:\s*`url\(\$\{JSON\.stringify\(src\)\}\)`/);
  assert.match(managementSource, /avatarUrl/);
  assert.match(managementSource, /apiPatch<\{ persona: Persona \}>/);
  assert.doesNotMatch(rendered, /backgroundImage:\s*`url\(\$\{imageUrl\}\)`|backgroundImage:\s*`url\(\$\{src\}\)`/);
  assert.doesNotMatch(managementSource, /upload|signed upload|storage bucket|image generation|voice cloning|webrtc|microphone|camera capture|video/i);
});

test("Persona Profile edit route gates owner truth before mounting management", () => {
  const pageSource = readFileSync("apps/web/app/studio/personas/[personaId]/edit/page.tsx", "utf8");

  assert.match(pageSource, /data\.persona\.ownerUserId !== userId/);
  assert.match(pageSource, /Persona Profile unavailable/);
  assert.match(pageSource, /Station could not load this owner-only profile\. Return to Studio and try again\./);
  assert.match(pageSource, /<PersonaManagement[\s\S]*accessToken=\{state\.accessToken\}/);
  assert.doesNotMatch(pageSource, /ApiRequestError|error\.message|Persona not found|public serializer/i);
});

test("Persona Profile management exposes only accepted live mutation bodies", () => {
  const managementSource = readFileSync("apps/web/components/studio/persona-management.tsx", "utf8");

  assert.match(managementSource, /Profile facts/);
  assert.match(managementSource, /Short description/);
  assert.match(managementSource, /Long description/);
  assert.match(managementSource, /Public description/);
  assert.match(managementSource, /Save avatar URL/);
  assert.match(managementSource, /Clear avatar URL/);
  assert.match(managementSource, /Anonymous public chat alpha/);
  assert.match(managementSource, /Save context handoff/);
  assert.match(managementSource, /\{ avatarUrl: nextValue \}/);
  assert.match(managementSource, /\{ publicAnonymousChatEnabled: nextEnabled \}/);
  assert.match(managementSource, /\{ summary: handoffSummary\.trim\(\) \|\| undefined \}/);
  assert.doesNotMatch(managementSource, /apiDelete|DELETE|delete persona|Delete persona/i);
  assert.doesNotMatch(managementSource, /publicChatEnabled:|visibility:|provider:|name: currentPersona|longDescription:|shortDescription:/);
  assert.doesNotMatch(managementSource, /apiPatch<[\s\S]*>\(\s*`\/personas\/\$\{personaId\}\/architecture`/i);
  assert.doesNotMatch(managementSource, /Promise\.all\(|catch\(\(\) => \(\{ sessions: \[\] \}\)\)|catch\(\(\) => \(\{ graph: \{ nodes: \[\], edges: \[\] \} \}\)\)/);
  assert.doesNotMatch(managementSource, /err instanceof Error|Error\.message|console\./);
});

test("Persona Profile route CSS is scoped, token based, responsive, and focus visible", () => {
  const cssSource = readFileSync("apps/web/app/globals.css", "utf8");
  const blockStart = cssSource.indexOf(".persona-profile-page");
  assert.notEqual(blockStart, -1);
  const routeCss = cssSource.slice(blockStart);

  assert.match(routeCss, /\.persona-profile-page/);
  assert.match(routeCss, /var\(--station-page-bg\)/);
  assert.match(routeCss, /var\(--station-page-surface\)/);
  assert.match(routeCss, /:focus-visible/);
  assert.match(routeCss, /@media \(max-width: 820px\)/);
  assert.match(routeCss, /grid-template-columns: 1fr/);
  assert.match(routeCss, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.doesNotMatch(routeCss, /#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|clamp\(|vw|!important/);
});

test("public persona cross-owner linkbacks stay out of chat and context source builders", () => {
  const apiSource = readFileSync("apps/api/src/routes/personas.ts", "utf8");
  const pageSource = readFileSync("apps/web/app/personas/[publicSlug]/page.tsx", "utf8");
  const contextSource = apiSource.slice(
    apiSource.indexOf("async function buildPublicPersonaContextSources"),
    apiSource.indexOf("function capPublicChatSources")
  );
  const chatSource = apiSource.slice(
    apiSource.indexOf("async function publicChatSourceList"),
    apiSource.indexOf("function buildPublicPersonaChatPrompt")
  );

  assert.match(apiSource, /personasRouter\.get\("\/public\/:publicSlug\/cross-owner-exhibits"/);
  assert.match(pageSource, /publicPersonaCrossOwnerExhibitHref\(exhibit\.slug\)/);
  assert.match(pageSource, /\/personas\/public\/\$\{publicSlug\}\/cross-owner-exhibits/);
  assert.doesNotMatch(contextSource, /cross-owner-exhibits|persona_encounter_cross_owner_public_exhibits|crossOwnerExhibits/);
  assert.doesNotMatch(chatSource, /cross-owner-exhibits|persona_encounter_cross_owner_public_exhibits|crossOwnerExhibits/);
});

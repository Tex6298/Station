import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/error-handler";
import { authRouter } from "./routes/auth";
import { billingRouter } from "./routes/billing";
import { conversationsRouter } from "./routes/conversations";
import { healthRouter } from "./routes/health";
import { personasRouter } from "./routes/personas";
import { memoryRouter } from "./routes/memory";
import { canonRouter } from "./routes/canon";
import { importsRouter } from "./routes/imports";
import { backgroundJobsRouter } from "./routes/background-jobs";
import { personaFilesRouter } from "./routes/persona-files";
import { calibrationRouter } from "./routes/calibration";
import { spacesRouter } from "./routes/spaces";
import { documentsRouter } from "./routes/documents";
import { discoverRouter } from "./routes/discover";
import { forumsRouter } from "./routes/forums";
import { threadsRouter } from "./routes/threads";
import { commentsRouter } from "./routes/comments";
import { notificationsRouter } from "./routes/notifications";
import { reportsRouter } from "./routes/reports";
import { socialRouter } from "./routes/social";
import { projectsRouter } from "./routes/projects";
import { developerSpacesRouter } from "./routes/developer-spaces";
import { exportsRouter } from "./routes/exports";
import { storageRouter } from "./routes/storage";
import { integrityRouter } from "./routes/integrity";
import { tokenCreditsRouter } from "./routes/token-credits";
import { continuityRouter } from "./routes/continuity";
import { observabilityRouter } from "./routes/observability";
import { assistantRouter } from "./routes/assistant";
import { publishingApprovalsRouter } from "./routes/publishing-approvals";
import { settingsRouter } from "./routes/settings";
import { eventsRouter } from "./routes/events";
import { personaEncountersRouter } from "./routes/persona-encounters";
import { archiveConnectorsRouter } from "./routes/archive-connectors";

export function createApp() {
  const app = express();
  app.use(cors());

  // -- Stripe webhook needs raw body for signature verification -----------------
  // Must be registered BEFORE express.json() so only this route gets raw bytes
  app.use(
    "/billing/webhook",
    express.raw({ type: "application/json" })
  );

  // -- Observed-runtime webhooks also verify signatures over raw bytes ---------
  app.use(
    "/developer-spaces/ingest/observed-runtime",
    express.raw({ type: "application/json", limit: "2mb" })
  );

  // -- All other routes use parsed JSON -----------------------------------------
  app.use(express.json({ limit: "2mb" }));

  app.use(healthRouter);
  app.use("/auth", authRouter);
  app.use("/billing", billingRouter);
  app.use("/personas", personasRouter);
  app.use("/conversations", conversationsRouter);
  app.use("/memory", memoryRouter);
  app.use("/canon", canonRouter);
  app.use("/imports", importsRouter);
  app.use("/background-jobs", backgroundJobsRouter);
  app.use("/persona-files", personaFilesRouter);
  app.use("/calibration", calibrationRouter);
  app.use("/spaces", spacesRouter);
  app.use("/documents", documentsRouter);
  app.use("/discover", discoverRouter);
  app.use("/forums", forumsRouter);
  app.use("/threads", threadsRouter);
  app.use("/comments", commentsRouter);
  app.use("/notifications", notificationsRouter);
  app.use("/reports", reportsRouter);
  app.use("/social", socialRouter);
  app.use("/projects", projectsRouter);
  app.use("/developer-spaces", developerSpacesRouter);
  app.use("/exports", exportsRouter);
  app.use("/storage", storageRouter);
  app.use("/integrity", integrityRouter);
  app.use("/token-credits", tokenCreditsRouter);
  app.use("/continuity", continuityRouter);
  app.use("/observability", observabilityRouter);
  app.use("/assistant", assistantRouter);
  app.use("/publishing/approvals", publishingApprovalsRouter);
  app.use("/settings", settingsRouter);
  app.use("/events", eventsRouter);
  app.use("/persona-encounters", personaEncountersRouter);
  app.use("/archive-connectors", archiveConnectorsRouter);

  app.use(errorHandler);
  return app;
}

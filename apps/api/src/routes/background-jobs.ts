import { Router } from "express";
import { getSupabaseAdmin } from "../lib/supabase";
import { requireAuth } from "../middleware/require-auth";
import {
  selectImportJobRowsWithFileIdFallback,
  serializeExportBackgroundJobReadback,
  serializeImportBackgroundJobReadback,
  inactiveRouteFollowupBackgroundJobs,
  type ExportPackageJobReadbackRow,
  type OwnerBackgroundJobReadback,
} from "../services/background-jobs.service";

const EXPORT_PACKAGE_JOB_SELECT =
  "id, owner_user_id, persona_id, developer_space_id, status, package_kind, error_message, requested_at, completed_at, created_at, updated_at";

export const backgroundJobsRouter = Router();

backgroundJobsRouter.use(requireAuth);

backgroundJobsRouter.get("/", async (req, res) => {
  const ownerUserId = req.user!.id;
  const sb = getSupabaseAdmin();

  const [importsResult, exportsResult] = await Promise.all([
    selectImportJobRowsWithFileIdFallback((select) =>
      sb
        .from("import_jobs")
        .select(select)
        .eq("owner_user_id", ownerUserId)
        .order("updated_at", { ascending: false })
        .limit(50)
    ),
    sb
      .from("export_packages")
      .select(EXPORT_PACKAGE_JOB_SELECT)
      .eq("owner_user_id", ownerUserId)
      .order("updated_at", { ascending: false })
      .limit(50),
  ]);

  if (importsResult.error) {
    return res.status(500).json({ error: importsResult.error.message ?? "Failed to load import jobs." });
  }
  if (exportsResult.error) {
    return res.status(500).json({ error: exportsResult.error.message ?? "Failed to load export jobs." });
  }

  const jobs = [
    ...(importsResult.data ?? []).map(serializeImportBackgroundJobReadback),
    ...((exportsResult.data ?? []) as ExportPackageJobReadbackRow[]).map(serializeExportBackgroundJobReadback),
  ]
    .sort(compareJobsByUpdatedAtDesc)
    .slice(0, 50);

  const inactiveKinds = inactiveRouteFollowupBackgroundJobs();

  return res.status(200).json({
    jobs,
    inactiveKinds,
    summary: {
      total: jobs.length,
      queued: jobs.filter((job) => job.status === "queued").length,
      processing: jobs.filter((job) => job.status === "processing").length,
      completed: jobs.filter((job) => job.status === "completed").length,
      failed: jobs.filter((job) => job.status === "failed").length,
      inactiveKinds: inactiveKinds.length,
    },
  });
});

function compareJobsByUpdatedAtDesc(a: OwnerBackgroundJobReadback, b: OwnerBackgroundJobReadback) {
  return readTime(b.updatedAt ?? b.createdAt) - readTime(a.updatedAt ?? a.createdAt);
}

function readTime(value: string | null) {
  if (!value) return 0;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}

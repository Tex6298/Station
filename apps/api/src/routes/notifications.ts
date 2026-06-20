import { Router } from "express";
import { z } from "zod";
import { getSupabaseAdmin } from "../lib/supabase";
import { requireAuth } from "../middleware/require-auth";
import { serializeCommunityNotification } from "../services/community-notifications.service";

const notificationQuerySchema = z.object({
  unreadOnly: z.coerce.boolean().default(false),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

notificationsRouter.get("/", async (req, res) => {
  const parsed = notificationQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  let query = (sb as any)
    .from("community_notifications")
    .select("*")
    .eq("recipient_user_id", req.user!.id)
    .order("created_at", { ascending: false })
    .limit(parsed.data.limit);

  if (parsed.data.unreadOnly) query = query.is("read_at", null);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ notifications: (data ?? []).map(serializeCommunityNotification) });
});

notificationsRouter.patch("/read-all", async (req, res) => {
  const readAt = new Date().toISOString();
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("community_notifications")
    .update({ read_at: readAt })
    .eq("recipient_user_id", req.user!.id)
    .is("read_at", null)
    .select("*");

  if (error) return res.status(500).json({ error: error.message });
  return res.json({
    markedRead: (data ?? []).length,
    notifications: (data ?? []).map(serializeCommunityNotification),
  });
});

notificationsRouter.patch("/:id/read", async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("community_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .eq("recipient_user_id", req.user!.id)
    .select("*")
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Notification not found." });

  return res.json({ notification: serializeCommunityNotification(data) });
});

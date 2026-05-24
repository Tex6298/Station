import { Router, Request, Response } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middleware/require-auth";
import { getSupabaseAdmin } from "../lib/supabase";
import { env } from "../lib/env";
import { dispatchPost } from "../services/social.service";
import type { SocialPlatform } from "@station/db";

export const socialRouter = Router();
const sb = getSupabaseAdmin();

// OAuth app credentials (set in env)
const OAUTH_CREDS = {
  tumblr:   { clientId: env.TUMBLR_CLIENT_ID,   secret: env.TUMBLR_CLIENT_SECRET },
  linkedin: { clientId: env.LINKEDIN_CLIENT_ID, secret: env.LINKEDIN_CLIENT_SECRET },
  reddit:   { clientId: env.REDDIT_CLIENT_ID,   secret: env.REDDIT_CLIENT_SECRET },
};

function redirectBase() {
  return (env.API_URL || "http://localhost:4000").replace(/\/$/, "");
}

// --- Schemas -----------------------------------------------------------------

const connectSimpleSchema = z.object({
  platform:    z.enum(["bluesky", "mastodon", "wordpress", "ghost"]),
  handle:      z.string().optional(),
  accessToken: z.string().min(1),
  meta:        z.record(z.string()).optional(),
});

const composeSchema = z.object({
  platforms:  z.array(z.string()).min(1),
  content:    z.string().min(1).max(10000),
  title:      z.string().optional(),
  documentId: z.string().uuid().optional(),
  subreddit:  z.string().optional(),
  scheduleFor: z.string().datetime().optional(),
});

// --- All routes require auth --------------------------------------------------
socialRouter.use(requireAuth);

// --- GET /social/connections --- list connected accounts ---------------------
socialRouter.get("/connections", async (req: Request, res: Response) => {
  const { data, error } = await sb
    .from("social_connections")
    .select("id, platform, handle, meta, connected_at")
    .eq("user_id", req.user!.id)
    .order("connected_at");

  if (error) return res.status(500).json({ error: error.message });
  res.json({ connections: data ?? [] });
});

// --- POST /social/connections/simple --- Bluesky / Mastodon / WP / Ghost -----
// These platforms don't use OAuth redirect flows - just provide credentials.
socialRouter.post("/connections/simple", async (req: Request, res: Response) => {
  const parsed = connectSimpleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  const { platform, handle, accessToken, meta = {} } = parsed.data;

  // Build platform-specific meta
  let fullMeta: Record<string, string> = { ...meta };

  if (platform === "mastodon" && !meta.instanceUrl) {
    return res.status(400).json({ error: "instanceUrl required for Mastodon" });
  }
  if (platform === "wordpress") {
    if (!meta.siteUrl)  return res.status(400).json({ error: "siteUrl required for WordPress" });
    if (!meta.username) return res.status(400).json({ error: "username required for WordPress" });
  }
  if (platform === "bluesky" && !handle && !meta.handle) {
    return res.status(400).json({ error: "handle required for Bluesky" });
  }
  if (platform === "bluesky") fullMeta.handle = handle || meta.handle || "";

  const { data, error } = await sb
    .from("social_connections")
    .upsert({
      user_id: req.user!.id,
      platform,
      handle: handle || meta.handle || meta.blogName || meta.siteUrl || platform,
      access_token: accessToken,
      meta: fullMeta,
    }, { onConflict: "user_id,platform" })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ connection: { id: data.id, platform: data.platform, handle: data.handle } });
});

// --- GET /social/auth/:platform --- initiate OAuth (Tumblr/LinkedIn/Reddit) --
socialRouter.get("/auth/:platform", (req: Request, res: Response) => {
  const { platform } = req.params;
  const creds = OAUTH_CREDS[platform as keyof typeof OAUTH_CREDS];
  if (!creds?.clientId) {
    return res.status(400).json({ error: `${platform} OAuth not configured` });
  }

  // Encode user ID + platform into a signed state token (short TTL)
  const state = jwt.sign(
    { userId: req.user!.id, platform },
    env.JWT_SECRET,
    { expiresIn: "10m" }
  );

  const callbackUrl = encodeURIComponent(`${redirectBase()}/social/callback/${platform}`);

  let authUrl: string;
  switch (platform) {
    case "tumblr":
      authUrl = `https://www.tumblr.com/oauth2/authorize?client_id=${creds.clientId}&response_type=code&scope=write&redirect_uri=${callbackUrl}&state=${state}`;
      break;
    case "linkedin":
      authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${creds.clientId}&redirect_uri=${callbackUrl}&scope=openid%20profile%20w_member_social&state=${state}`;
      break;
    case "reddit":
      authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${creds.clientId}&response_type=code&state=${state}&redirect_uri=${callbackUrl}&duration=permanent&scope=submit,identity`;
      break;
    default:
      return res.status(400).json({ error: "Unknown OAuth platform" });
  }

  res.json({ authUrl });
});

// --- GET /social/callback/:platform --- OAuth token exchange -----------------
socialRouter.get("/callback/:platform", async (req: Request, res: Response) => {
  const { platform } = req.params;
  const { code, state, error: oauthError } = req.query as Record<string, string>;
  const appUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (oauthError) {
    return res.redirect(`${appUrl}/settings/social?error=${encodeURIComponent(oauthError)}`);
  }

  // Validate state
  let userId: string;
  try {
    const payload = jwt.verify(state, env.JWT_SECRET) as { userId: string; platform: string };
    if (payload.platform !== platform) throw new Error("Platform mismatch");
    userId = payload.userId;
  } catch {
    return res.redirect(`${appUrl}/settings/social?error=invalid_state`);
  }

  const creds = OAUTH_CREDS[platform as keyof typeof OAUTH_CREDS];
  const callbackUrl = `${redirectBase()}/social/callback/${platform}`;

  try {
    let tokenData: {
      access_token: string;
      refresh_token?: string;
      handle?: string;
      meta?: Record<string, string>;
    };

    switch (platform) {
      case "tumblr": {
        const tokenRes = await fetch("https://api.tumblr.com/v2/oauth2/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            client_id: creds.clientId!,
            client_secret: creds.secret!,
            redirect_uri: callbackUrl,
          }).toString(),
        });
        const tokens = await tokenRes.json();
        if (!tokenRes.ok) throw new Error(tokens.error_description || "Tumblr token exchange failed");

        // Fetch blog info for handle
        const infoRes = await fetch("https://api.tumblr.com/v2/user/info", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const info = await infoRes.json();
        const blog = info.response?.user?.blogs?.[0];
        tokenData = {
          access_token:  tokens.access_token,
          refresh_token: tokens.refresh_token,
          handle:        blog?.name || "tumblr",
          meta:          { blogName: blog?.name || "" },
        };
        break;
      }

      case "linkedin": {
        const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            client_id: creds.clientId!,
            client_secret: creds.secret!,
            redirect_uri: callbackUrl,
          }).toString(),
        });
        const tokens = await tokenRes.json();
        if (!tokenRes.ok) throw new Error(tokens.error_description || "LinkedIn token exchange failed");

        // Get person URN + name
        const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const profile = await profileRes.json();
        const personUrn = `urn:li:person:${profile.sub}`;
        tokenData = {
          access_token:  tokens.access_token,
          refresh_token: tokens.refresh_token,
          handle:        profile.name || "LinkedIn",
          meta:          { personUrn },
        };
        break;
      }

      case "reddit": {
        const basic = Buffer.from(`${creds.clientId}:${creds.secret}`).toString("base64");
        const tokenRes = await fetch("https://www.reddit.com/api/v1/access_token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${basic}`,
            "User-Agent": "Station/1.0",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: callbackUrl,
          }).toString(),
        });
        const tokens = await tokenRes.json();
        if (tokens.error) throw new Error(tokens.error);

        // Get Reddit username
        const meRes = await fetch("https://oauth.reddit.com/api/v1/me", {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            "User-Agent": "Station/1.0",
          },
        });
        const me = await meRes.json();
        tokenData = {
          access_token:  tokens.access_token,
          refresh_token: tokens.refresh_token,
          handle:        `u/${me.name}`,
          meta:          { username: me.name, defaultSubreddit: "" },
        };
        break;
      }

      default:
        throw new Error("Unknown platform");
    }

    await sb.from("social_connections").upsert({
      user_id:       userId,
      platform,
      handle:        tokenData.handle,
      access_token:  tokenData.access_token,
      refresh_token: tokenData.refresh_token ?? null,
      meta:          tokenData.meta ?? {},
    }, { onConflict: "user_id,platform" });

    res.redirect(`${appUrl}/settings/social?connected=${platform}`);
  } catch (e) {
    const msg = (e as Error).message;
    res.redirect(`${appUrl}/settings/social?error=${encodeURIComponent(msg)}`);
  }
});

// --- PATCH /social/connections/:id --- update meta (e.g. default subreddit) -
socialRouter.patch("/connections/:id", async (req: Request, res: Response) => {
  const { meta } = req.body;
  if (!meta) return res.status(400).json({ error: "meta required" });

  const { data: conn } = await sb
    .from("social_connections")
    .select("id, user_id, meta")
    .eq("id", req.params.id)
    .single();

  if (!conn || conn.user_id !== req.user!.id) return res.status(404).json({ error: "Connection not found" });

  const { error } = await sb
    .from("social_connections")
    .update({ meta: { ...conn.meta, ...meta } })
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// --- DELETE /social/connections/:id --- disconnect a platform ----------------
socialRouter.delete("/connections/:id", async (req: Request, res: Response) => {
  const { data: conn } = await sb
    .from("social_connections")
    .select("id, user_id")
    .eq("id", req.params.id)
    .single();

  if (!conn || conn.user_id !== req.user!.id) return res.status(404).json({ error: "Not found" });

  const { error } = await sb.from("social_connections").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// --- POST /social/compose --- create + dispatch posts to selected platforms --
socialRouter.post("/compose", async (req: Request, res: Response) => {
  const parsed = composeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });

  const platforms = parsed.data.platforms as SocialPlatform[];
  const { content, title, documentId, subreddit, scheduleFor } = parsed.data;
  const userId = req.user!.id;

  // Load user's connections for the selected platforms
  const { data: connections, error: connErr } = await sb
    .from("social_connections")
    .select("*")
    .eq("user_id", userId)
    .in("platform", platforms);

  if (connErr) return res.status(500).json({ error: connErr.message });
  if (!connections?.length) return res.status(400).json({ error: "No connected accounts found for selected platforms" });

  const results: Array<{ platform: string; postId: string; status: string }> = [];

  for (const conn of connections) {
    const isReddit = conn.platform === "reddit";
    const postContent = isReddit && subreddit
      ? content
      : content;

    const { data: post, error: insertErr } = await sb
      .from("social_posts")
      .insert({
        user_id:       userId,
        connection_id: conn.id,
        platform:      conn.platform,
        content:       postContent,
        title:         title ?? null,
        document_id:   documentId ?? null,
        status:        scheduleFor ? "scheduled" : "pending",
        scheduled_for: scheduleFor ?? null,
      })
      .select("id")
      .single();

    if (insertErr || !post) continue;

    // For Reddit, temporarily override default subreddit if one was provided
    if (isReddit && subreddit) {
      conn.meta = { ...conn.meta, defaultSubreddit: subreddit };
    }

    // Fire and forget for immediate posts; scheduled handled separately
    if (!scheduleFor) {
      dispatchPost(post.id).catch(console.error);
    }

    results.push({ platform: conn.platform, postId: post.id, status: scheduleFor ? "scheduled" : "dispatched" });
  }

  res.status(201).json({ results });
});

// --- GET /social/posts --- post history --------------------------------------
socialRouter.get("/posts", async (req: Request, res: Response) => {
  const limit  = Math.min(Number(req.query.limit  ?? 20), 50);
  const offset = Number(req.query.offset ?? 0);

  const { data, error } = await sb
    .from("social_posts")
    .select("id, platform, title, content, status, sent_at, external_url, error_message, created_at")
    .eq("user_id", req.user!.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ posts: data ?? [] });
});

// --- POST /social/generate-teaser --- AI-generate a social teaser ------------
socialRouter.post("/generate-teaser", async (req: Request, res: Response) => {
  const { documentId, platform, customPrompt } = req.body;

  if (!documentId) return res.status(400).json({ error: "documentId required" });

  const { data: doc } = await sb
    .from("documents")
    .select("title, body, document_type")
    .eq("id", documentId)
    .single();

  if (!doc) return res.status(404).json({ error: "Document not found" });

  const limits: Record<string, number> = {
    bluesky: 300, mastodon: 500, twitter: 280,
    linkedin: 3000, tumblr: 4096, reddit: 10000,
    wordpress: 500, ghost: 500,
  };
  const charLimit = limits[platform] ?? 300;

  const excerpt = (doc.body || "").slice(0, 2000);
  const prompt = customPrompt ||
    `Write a compelling social media teaser for the following creative work. ` +
    `Keep it under ${charLimit} characters. Be intriguing, not spoilery. ` +
    `End with a call to action. Work title: "${doc.title}". ` +
    `Excerpt: ${excerpt}`;

  // Use the existing AI provider router
  try {
    const { resolveProvider } = await import("@station/ai");
    const provider = resolveProvider({ provider: "platform", aiMode: "platform" });
    const response = await provider.sendMessage({
      messages: [
        { role: "system", content: "You are a creative writing promotional assistant. Be concise and compelling." },
        { role: "user",   content: prompt },
      ],
    });
    res.json({ teaser: response.content });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

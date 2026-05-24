import jwt from "jsonwebtoken";
import { getSupabaseAdmin } from "../lib/supabase";

const sb = getSupabaseAdmin();

// --- Types --------------------------------------------------------------------
export interface SocialConnection {
  id: string;
  user_id: string;
  platform: string;
  handle: string | null;
  access_token: string | null;
  refresh_token: string | null;
  meta: Record<string, string>;
}

export interface PostResult {
  externalPostId?: string;
  externalUrl?: string;
  error?: string;
}

// --- Bluesky (AT Protocol - app password, no OAuth) --------------------------
export async function postToBluesky(
  connection: SocialConnection,
  text: string
): Promise<PostResult> {
  try {
    // Create a session with the stored app password
    const sessionRes = await fetch(
      "https://bsky.social/xrpc/com.atproto.server.createSession",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: connection.meta.handle || connection.handle,
          password: connection.access_token,
        }),
      }
    );
    if (!sessionRes.ok) {
      const err = await sessionRes.json().catch(() => ({}));
      throw new Error((err as any).message || "Bluesky auth failed");
    }
    const { accessJwt, did } = await sessionRes.json();

    // Truncate to 300 chars (Bluesky limit)
    const postText = text.length > 300 ? text.slice(0, 297) + "..." : text;

    const postRes = await fetch(
      "https://bsky.social/xrpc/com.atproto.repo.createRecord",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessJwt}`,
        },
        body: JSON.stringify({
          repo: did,
          collection: "app.bsky.feed.post",
          record: {
            $type: "app.bsky.feed.post",
            text: postText,
            createdAt: new Date().toISOString(),
          },
        }),
      }
    );
    if (!postRes.ok) {
      const err = await postRes.json().catch(() => ({}));
      throw new Error((err as any).message || "Bluesky post failed");
    }
    const result = await postRes.json();
    const rkey = result.uri?.split("/").pop();
    const handle = connection.meta.handle || connection.handle;
    return {
      externalPostId: result.uri,
      externalUrl: handle ? `https://bsky.app/profile/${handle}/post/${rkey}` : undefined,
    };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// --- Mastodon (user provides instance URL + access token) --------------------
export async function postToMastodon(
  connection: SocialConnection,
  text: string
): Promise<PostResult> {
  try {
    const instance = connection.meta.instanceUrl?.replace(/\/$/, "");
    if (!instance) throw new Error("Mastodon instance URL not configured");

    // 500 char limit (default; some instances allow more)
    const status = text.length > 500 ? text.slice(0, 497) + "..." : text;

    const res = await fetch(`${instance}/api/v1/statuses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${connection.access_token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any).error || "Mastodon post failed");
    }
    const result = await res.json();
    return { externalPostId: result.id, externalUrl: result.url };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// --- Tumblr (OAuth2) ----------------------------------------------------------
export async function postToTumblr(
  connection: SocialConnection,
  text: string,
  title?: string
): Promise<PostResult> {
  try {
    const blogId = connection.meta.blogName;
    if (!blogId) throw new Error("Tumblr blog name not configured");

    const body: Record<string, unknown> = {
      content: [{ type: "text", text }],
      tags: ["station"],
    };
    if (title) body.title = title;

    const res = await fetch(
      `https://api.tumblr.com/v2/blog/${blogId}/posts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${connection.access_token}`,
        },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any).errors?.[0]?.detail || "Tumblr post failed");
    }
    const result = await res.json();
    const postId = result.response?.id_string || result.response?.id;
    return {
      externalPostId: String(postId),
      externalUrl: `https://${blogId}.tumblr.com/post/${postId}`,
    };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// --- LinkedIn (OAuth2) --------------------------------------------------------
export async function postToLinkedIn(
  connection: SocialConnection,
  text: string
): Promise<PostResult> {
  try {
    const personUrn = connection.meta.personUrn;
    if (!personUrn) throw new Error("LinkedIn person URN not configured");

    // 3000 char limit for personal posts
    const commentary = text.length > 3000 ? text.slice(0, 2997) + "..." : text;

    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${connection.access_token}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: personUrn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: commentary },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any).message || "LinkedIn post failed");
    }
    const postId = res.headers.get("x-restli-id") || "";
    return { externalPostId: postId };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// --- WordPress (application password) ----------------------------------------
export async function postToWordPress(
  connection: SocialConnection,
  title: string,
  content: string,
  status: "publish" | "draft" = "publish"
): Promise<PostResult> {
  try {
    const siteUrl = connection.meta.siteUrl?.replace(/\/$/, "");
    const username = connection.meta.username;
    if (!siteUrl || !username) throw new Error("WordPress site URL or username not configured");

    // WordPress Application Password uses HTTP Basic auth
    const credentials = Buffer.from(
      `${username}:${connection.access_token}`
    ).toString("base64");

    const res = await fetch(`${siteUrl}/wp-json/wp/v2/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({ title, content, status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any).message || "WordPress post failed");
    }
    const result = await res.json();
    return { externalPostId: String(result.id), externalUrl: result.link };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// --- Ghost (Admin API key -> JWT) ----------------------------------------------
export async function postToGhost(
  connection: SocialConnection,
  title: string,
  content: string,
  status: "published" | "draft" = "published"
): Promise<PostResult> {
  try {
    const siteUrl = connection.meta.siteUrl?.replace(/\/$/, "");
    const adminApiKey = connection.access_token;
    if (!siteUrl || !adminApiKey) throw new Error("Ghost site URL or admin key not configured");

    // Ghost admin API key format: {id}:{secret}
    const [id, secret] = adminApiKey.split(":");
    if (!id || !secret) throw new Error("Invalid Ghost admin API key format (expected id:secret)");

    const secretBuffer = Buffer.from(secret, "hex");
    const token = jwt.sign({}, secretBuffer, {
      keyid: id,
      algorithm: "HS256",
      expiresIn: "5m",
      audience: "/admin/",
    });

    const res = await fetch(`${siteUrl}/ghost/api/admin/posts/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Ghost ${token}`,
      },
      body: JSON.stringify({
        posts: [{ title, html: content, status }],
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = (err as any).errors?.[0]?.message || "Ghost post failed";
      throw new Error(msg);
    }
    const result = await res.json();
    const post = result.posts?.[0];
    return { externalPostId: post?.id, externalUrl: post?.url };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// --- Reddit (OAuth2) ----------------------------------------------------------
export async function postToReddit(
  connection: SocialConnection,
  title: string,
  text: string,
  subreddit?: string
): Promise<PostResult> {
  try {
    const sr = subreddit || connection.meta.defaultSubreddit;
    if (!sr) throw new Error("No subreddit specified - set a default in your Reddit connection settings");

    const res = await fetch("https://oauth.reddit.com/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${connection.access_token}`,
        "User-Agent": "Station/1.0 (by /u/station_app)",
      },
      body: new URLSearchParams({
        sr,
        kind: "self",
        title,
        text,
        resubmit: "true",
        nsfw: "false",
        spoiler: "false",
      }).toString(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(JSON.stringify((err as any).json?.errors) || "Reddit post failed");
    }
    const result = await res.json();
    const postData = result.json?.data;
    return {
      externalPostId: postData?.id,
      externalUrl: postData?.url ? `https://reddit.com${postData.url}` : undefined,
    };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// --- Dispatcher - routes to the right platform -------------------------------
export async function dispatchPost(postId: string): Promise<void> {
  const { data: post, error: postErr } = await sb
    .from("social_posts")
    .select("*, connection:social_connections(*)")
    .eq("id", postId)
    .single();

  if (postErr || !post) return;

  const conn = post.connection as SocialConnection;
  let result: PostResult;

  switch (post.platform) {
    case "bluesky":
      result = await postToBluesky(conn, post.content);
      break;
    case "mastodon":
      result = await postToMastodon(conn, post.content);
      break;
    case "tumblr":
      result = await postToTumblr(conn, post.content, post.title ?? undefined);
      break;
    case "linkedin":
      result = await postToLinkedIn(conn, post.content);
      break;
    case "wordpress":
      result = await postToWordPress(conn, post.title || "Station post", post.content);
      break;
    case "ghost":
      result = await postToGhost(conn, post.title || "Station post", post.content);
      break;
    case "reddit":
      result = await postToReddit(conn, post.title || "Station post", post.content);
      break;
    default:
      result = { error: `Unknown platform: ${post.platform}` };
  }

  await sb
    .from("social_posts")
    .update({
      status: result.error ? "failed" : "sent",
      sent_at: result.error ? null : new Date().toISOString(),
      external_post_id: result.externalPostId ?? null,
      external_url: result.externalUrl ?? null,
      error_message: result.error ?? null,
    })
    .eq("id", postId);
}

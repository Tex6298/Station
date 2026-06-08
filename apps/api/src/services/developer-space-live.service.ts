import type { Server as HttpServer, IncomingMessage } from "http";
import { WebSocketServer, type WebSocket } from "ws";
import { getSupabaseAdmin } from "../lib/supabase";
import { validateToken } from "./auth.service";
import { canReadDeveloperSpace } from "./developer-space.service";
import type { AuthenticatedUser } from "../middleware/require-auth";

type LiveMessage = {
  kind: "developer_space.ingested";
  slug: string;
  source: "node" | "event" | "snapshot" | "import";
  counts?: {
    nodes?: number;
    events?: number;
    snapshots?: number;
  };
  emittedAt: string;
};

const clientsBySlug = new Map<string, Set<WebSocket>>();

export function attachDeveloperSpaceWebSocketServer(server: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", async (request, socket, head) => {
    const slug = slugFromRequest(request);
    if (!slug) return;
    const canConnect = await canConnectToDeveloperSpaceSocket(request, slug);
    if (!canConnect) {
      socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      const clients = clientsBySlug.get(slug) ?? new Set<WebSocket>();
      clients.add(ws);
      clientsBySlug.set(slug, clients);

      ws.send(JSON.stringify({
        kind: "developer_space.connected",
        slug,
        emittedAt: new Date().toISOString(),
      }));

      ws.on("close", () => {
        clients.delete(ws);
        if (clients.size === 0) clientsBySlug.delete(slug);
      });
    });
  });
}

export function broadcastDeveloperSpaceIngestion(input: Omit<LiveMessage, "kind" | "emittedAt">) {
  const clients = clientsBySlug.get(input.slug);
  if (!clients?.size) return;

  const payload: LiveMessage = {
    kind: "developer_space.ingested",
    ...input,
    emittedAt: new Date().toISOString(),
  };
  const encoded = JSON.stringify(payload);

  for (const client of clients) {
    if (client.readyState === client.OPEN) {
      client.send(encoded);
    }
  }
}

function slugFromRequest(request: IncomingMessage) {
  const host = request.headers.host ?? "localhost";
  const url = new URL(request.url ?? "", `http://${host}`);
  const match = url.pathname.match(/^\/developer-spaces\/([a-z0-9]+(?:-[a-z0-9]+)*)\/live$/);
  return match?.[1] ?? null;
}

async function canConnectToDeveloperSpaceSocket(request: IncomingMessage, slug: string) {
  const host = request.headers.host ?? "localhost";
  const url = new URL(request.url ?? "", `http://${host}`);
  const token = url.searchParams.get("access_token");
  let user: AuthenticatedUser | null = null;

  if (token) {
    const result = await validateToken(token).catch(() => null);
    if (result) {
      user = {
        id: result.userId,
        tier: result.tier,
        isAdmin: result.isAdmin,
        email: result.email,
      };
    }
  }

  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from("developer_spaces")
    .select("owner_user_id, visibility")
    .eq("slug", slug)
    .maybeSingle();

  return Boolean(data && canReadDeveloperSpace(data.visibility as any, data.owner_user_id, user));
}

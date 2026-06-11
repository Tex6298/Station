import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { observabilityRouter } from "./observability";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL ??= "http://localhost";
process.env.SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-key";

test("replay readiness exposes non-secret measurement prep behind auth", async () => {
  const db = new AuthSupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createObservabilityApp();

  try {
    const visitor = await requestJson(app, "GET", "/observability/replay-readiness");
    assert.equal(visitor.status, 401);

    const owner = await requestJson(app, "GET", "/observability/replay-readiness", {
      token: "owner-token",
    });
    assert.equal(owner.status, 200);
    assert.equal(owner.body.replay.status, "prep_only");
    assert.equal(owner.body.replay.policy.optimizeFromReplayEvidenceOnly, true);
    assert.equal(owner.body.replay.policy.localGuessworkAllowed, false);
    assert.equal(owner.body.replay.policy.productUiChangesIncluded, false);

    const measurementIds = owner.body.replay.measurementPoints.map((point: any) => point.id);
    assert.deepEqual(measurementIds, [
      "chat_latency_context_quality",
      "archive_upload_import_confidence",
      "retrieval_relevance",
      "provider_cost_failure_rate",
      "job_failure_recovery",
      "export_trust",
      "billing_webhook_reliability",
    ]);

    const proofIds = owner.body.replay.setupProofs.map((proof: any) => proof.id);
    assert.deepEqual(proofIds, [
      "remote_database",
      "supabase_migrations_025_028",
      "persona_files_storage",
      "nvidia_platform_chat",
    ]);
    assert.equal(owner.body.replay.setupProofs[1].status, "setup_proven");
    assert.match(owner.body.replay.setupProofs[1].remainingRisk, /Hostile remote vector\/RPC smoke/);

    const blockerIds = owner.body.replay.setupBlockers.map((blocker: any) => blocker.id);
    assert.deepEqual(blockerIds, [
      "hostile_vector_rpc_smoke",
      "supabase_auth_redirects",
      "embedding_profile_proof",
      "stripe_replay_resources",
      "cache_provider_selection",
      "cloudflare_account_setup",
      "replay_account_data",
    ]);
    assert.equal(owner.body.replay.setupBlockers[1].evidenceRequired[1].includes("/reset-password/update"), true);

    assert.deepEqual(owner.body.replay.captureSurfaces.slice(0, 4), [
      "/health/deployment",
      "/observability/summary",
      "/observability/traces",
      "/observability/traces/:traceId",
    ]);

    const serialized = JSON.stringify(owner.body);
    assert.doesNotMatch(serialized, /private replay transcript should not appear/);
    assert.doesNotMatch(serialized, /sk-test-secret/);
    assert.doesNotMatch(serialized, /whsec_/);
  } finally {
    setSupabaseAdminForTests(null);
  }
});

class AuthSupabase {
  client = {
    auth: {
      getUser: async (token: string) => {
        if (token !== "owner-token") {
          return { data: { user: null }, error: { message: "Invalid token" } };
        }
        return {
          data: { user: { id: "owner-user", email: "owner@example.test" } },
          error: null,
        };
      },
    },
    from: (table: string) => new ProfileQuery(table),
  };
}

class ProfileQuery {
  constructor(private readonly table: string) {}

  select() {
    assert.equal(this.table, "profiles");
    return this;
  }

  eq() {
    return this;
  }

  async single() {
    return {
      data: { tier: "private", is_admin: false },
      error: null,
    };
  }
}

function createObservabilityApp() {
  const app = express();
  app.use(express.json());
  app.use("/observability", observabilityRouter);
  return app;
}

async function requestJson<TBody = any>(
  app: Express,
  method: string,
  path: string,
  options: { token?: string } = {}
) {
  const server = await listen(app);
  try {
    const address = server.address() as AddressInfo;
    const headers: Record<string, string> = {};
    if (options.token) headers.Authorization = `Bearer ${options.token}`;

    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
      method,
      headers,
    });
    const text = await response.text();
    return {
      status: response.status,
      body: text ? JSON.parse(text) as TBody : null,
    };
  } finally {
    await close(server);
  }
}

function listen(app: Express) {
  return new Promise<Server>((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => resolve(server as unknown as Server));
  });
}

function close(server: Server) {
  return new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

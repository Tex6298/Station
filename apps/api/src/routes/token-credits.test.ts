import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { setStripeForTests } from "../lib/stripe";
import {
  assertTokenBudgetForEstimate,
  getTokenUsage,
  grantTopupFromStripeMetadata,
  recordLlmTokenUsage,
  tokenErrorResponse,
  TokenQuotaError,
} from "../services/token-credits.service";
import { tokenCreditsRouter } from "./token-credits";

process.env.NODE_ENV = "test";
process.env.SUPABASE_URL ??= "http://localhost";
process.env.SUPABASE_ANON_KEY ??= "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY ??= "test-service-key";
process.env.STRIPE_SECRET_KEY ??= "sk_test_station";

type Row = Record<string, any>;

const OWNER_ID = "owner-user";
const CREATOR_ID = "creator-user";
const CANON_ID = "canon-user";
const ADMIN_ID = "admin-user";
const VISITOR_ID = "visitor-user";

class InMemorySupabase {
  tables: Record<string, Row[]> = {
    profiles: [
      {
        id: OWNER_ID,
        email: "owner@example.test",
        tier: "private",
        is_admin: false,
      },
      {
        id: CREATOR_ID,
        email: "creator@example.test",
        tier: "creator",
        is_admin: false,
      },
      {
        id: CANON_ID,
        email: "canon@example.test",
        tier: "canon",
        is_admin: false,
      },
      {
        id: ADMIN_ID,
        email: "admin@example.test",
        tier: "private",
        is_admin: true,
      },
      {
        id: VISITOR_ID,
        email: "visitor@example.test",
        tier: "visitor",
        is_admin: false,
      },
    ],
    token_usage: [
      {
        id: "usage-owner",
        user_id: OWNER_ID,
        period_start: currentPeriodStart(),
        tokens_used: 123_456,
        tokens_limit: tokenLimitForTier("private"),
        topup_tokens: 500_000,
        updated_at: "2026-06-06T08:00:00.000Z",
      },
      {
        id: "usage-creator",
        user_id: CREATOR_ID,
        period_start: currentPeriodStart(),
        tokens_used: 2_000_000,
        tokens_limit: tokenLimitForTier("creator"),
        topup_tokens: 0,
        updated_at: "2026-06-06T08:01:00.000Z",
      },
      {
        id: "usage-canon",
        user_id: CANON_ID,
        period_start: currentPeriodStart(),
        tokens_used: 19_000_000,
        tokens_limit: tokenLimitForTier("canon"),
        topup_tokens: 0,
        updated_at: "2026-06-06T08:02:00.000Z",
      },
    ],
    token_transactions: [],
    topup_purchases: [
      {
        id: "purchase-old",
        user_id: OWNER_ID,
        stripe_payment_id: "pi_old",
        pack_id: "basic-starter",
        amount_pence: 500,
        tokens_purchased: 1_500_000,
        model_tier: "haiku",
        period_start: currentPeriodStart(),
        expires_at: nextPeriodStart(),
        status: "completed",
        created_at: "2026-06-01T08:00:00.000Z",
      },
      {
        id: "purchase-new",
        user_id: OWNER_ID,
        stripe_payment_id: "pi_new",
        pack_id: "basic-standard",
        amount_pence: 1000,
        tokens_purchased: 3_500_000,
        model_tier: "haiku",
        period_start: currentPeriodStart(),
        expires_at: nextPeriodStart(),
        status: "completed",
        created_at: "2026-06-05T08:00:00.000Z",
      },
    ],
  };

  private idCounters: Record<string, number> = {};
  private clock = Date.parse("2026-06-06T09:00:00.000Z");
  private usersByToken = new Map([
    ["owner-token", { id: OWNER_ID, email: "owner@example.test" }],
    ["creator-token", { id: CREATOR_ID, email: "creator@example.test" }],
    ["canon-token", { id: CANON_ID, email: "canon@example.test" }],
    ["admin-token", { id: ADMIN_ID, email: "admin@example.test" }],
  ]);

  client = {
    auth: {
      getUser: async (token: string) => {
        const user = this.usersByToken.get(token) ?? null;
        return user
          ? { data: { user }, error: null }
          : { data: { user: null }, error: { message: "Invalid token" } };
      },
    },
    rpc: async (functionName: string, args: Row = {}) => this.rpc(functionName, args),
    from: (table: string) => new QueryBuilder(this, table),
  };

  rows(table: string) {
    if (!this.tables[table]) this.tables[table] = [];
    return this.tables[table];
  }

  insertRow(table: string, payload: Row) {
    const row = this.prepareRow(table, payload);
    this.rows(table).push(row);
    return row;
  }

  timestamp() {
    const value = new Date(this.clock).toISOString();
    this.clock += 1000;
    return value;
  }

  usageFor(userId: string) {
    return this.rows("token_usage").find(
      (row) => row.user_id === userId && row.period_start === currentPeriodStart()
    );
  }

  private async rpc(functionName: string, args: Row) {
    if (functionName === "ensure_current_token_usage") {
      return { data: clone(this.ensureUsage(args.p_user_id)), error: null };
    }

    if (functionName === "record_token_usage") {
      const usage = this.ensureUsage(args.p_user_id);
      const inputTokens = Math.max(0, Math.ceil(args.p_input_tokens ?? 0));
      const outputTokens = Math.max(0, Math.ceil(args.p_output_tokens ?? 0));
      const delta = inputTokens + outputTokens;
      usage.tokens_used += delta;
      usage.updated_at = this.timestamp();
      this.insertRow("token_transactions", {
        user_id: args.p_user_id,
        period_start: currentPeriodStart(),
        transaction_type: "llm_call",
        tokens_delta: delta,
        model_used: args.p_model,
        chat_id: args.p_chat_id ?? null,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
      });
      return { data: clone(usage), error: null };
    }

    if (functionName === "grant_topup_purchase") {
      const usage = this.ensureUsage(args.p_user_id);
      const existing = this.rows("topup_purchases").find(
        (purchase) => purchase.stripe_payment_id === args.p_stripe_payment_id
      );
      if (!existing) {
        this.insertRow("topup_purchases", {
          user_id: args.p_user_id,
          stripe_payment_id: args.p_stripe_payment_id,
          pack_id: args.p_pack_id,
          amount_pence: args.p_amount_pence,
          tokens_purchased: args.p_tokens_purchased,
          model_tier: args.p_model_tier,
          period_start: currentPeriodStart(),
          expires_at: nextPeriodStart(),
          status: "completed",
        });
        usage.topup_tokens += args.p_tokens_purchased;
        usage.updated_at = this.timestamp();
        this.insertRow("token_transactions", {
          user_id: args.p_user_id,
          period_start: currentPeriodStart(),
          transaction_type: "topup_purchase",
          tokens_delta: args.p_tokens_purchased,
          model_used: args.p_model_tier,
        });
      }
      return { data: clone(usage), error: null };
    }

    if (functionName === "run_monthly_token_reset") {
      for (const profile of this.rows("profiles")) {
        this.ensureUsage(profile.id);
        const hasReset = this.rows("token_transactions").some(
          (tx) => tx.user_id === profile.id
            && tx.period_start === currentPeriodStart()
            && tx.transaction_type === "monthly_reset"
        );
        if (!hasReset) {
          this.insertRow("token_transactions", {
            user_id: profile.id,
            period_start: currentPeriodStart(),
            transaction_type: "monthly_reset",
            tokens_delta: 0,
            model_used: null,
          });
        }
      }
      return {
        data: {
          period_start: currentPeriodStart(),
          usage_rows_touched: this.rows("profiles").length,
        },
        error: null,
      };
    }

    return { data: null, error: { message: `No ${functionName} RPC in tests.` } };
  }

  private ensureUsage(userId: string) {
    const profile = this.rows("profiles").find((row) => row.id === userId);
    const tier = profile?.tier ?? "visitor";
    let usage = this.usageFor(userId);
    if (!usage) {
      usage = this.insertRow("token_usage", {
        user_id: userId,
        period_start: currentPeriodStart(),
        tokens_used: 0,
        tokens_limit: tokenLimitForTier(tier),
        topup_tokens: 0,
      });
    } else {
      usage.tokens_limit = tokenLimitForTier(tier);
      usage.updated_at = this.timestamp();
    }
    return usage;
  }

  private nextId(table: string) {
    this.idCounters[table] = (this.idCounters[table] ?? 0) + 1;
    return `${table}-${this.idCounters[table]}`;
  }

  private prepareRow(table: string, payload: Row) {
    const now = this.timestamp();
    const row = { ...payload };
    row.id ??= this.nextId(table);

    if (table === "token_usage") {
      row.tokens_used ??= 0;
      row.topup_tokens ??= 0;
      row.updated_at ??= now;
    }

    if (table === "token_transactions") {
      row.model_used ??= null;
      row.chat_id ??= null;
      row.input_tokens ??= null;
      row.output_tokens ??= null;
      row.created_at ??= now;
    }

    if (table === "topup_purchases") {
      row.status ??= "completed";
      row.created_at ??= now;
    }

    return row;
  }
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
  private orderSpec: { field: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private operation: "select" | "insert" | "update" = "select";
  private payload: Row | Row[] | null = null;

  constructor(private db: InMemorySupabase, private table: string) {}

  select() {
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push([field, value]);
    return this;
  }

  order(field: string, options: { ascending?: boolean } = {}) {
    this.orderSpec = { field, ascending: options.ascending ?? true };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  insert(payload: Row | Row[]) {
    this.operation = "insert";
    this.payload = payload;
    return this;
  }

  update(payload: Row) {
    this.operation = "update";
    this.payload = payload;
    return this;
  }

  single() {
    return this.execute("single");
  }

  then(onfulfilled: any, onrejected: any) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private matchingRows() {
    let rows = [...this.db.rows(this.table)];
    for (const [field, value] of this.filters) {
      rows = rows.filter((row) => row[field] === value);
    }
    if (this.orderSpec) {
      const { field, ascending } = this.orderSpec;
      rows.sort((a, b) => {
        if (a[field] === b[field]) return 0;
        if (a[field] == null) return 1;
        if (b[field] == null) return -1;
        return (a[field] > b[field] ? 1 : -1) * (ascending ? 1 : -1);
      });
    }
    if (this.limitCount !== null) rows = rows.slice(0, this.limitCount);
    return rows;
  }

  private async execute(mode?: "single") {
    let rows: Row[];
    if (this.operation === "insert") {
      const payloads = Array.isArray(this.payload) ? this.payload : [this.payload as Row];
      rows = payloads.map((payload) => this.db.insertRow(this.table, payload));
    } else if (this.operation === "update") {
      rows = this.matchingRows();
      for (const row of rows) Object.assign(row, this.payload);
    } else {
      rows = this.matchingRows();
    }

    const data = clone(rows);
    if (mode === "single") {
      return data.length === 1
        ? { data: data[0], error: null }
        : { data: null, error: { code: "PGRST116", message: `Expected one ${this.table} row.` } };
    }
    return { data, error: null };
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function createFakeStripe() {
  const calls = {
    checkout: [] as any[],
  };

  return {
    calls,
    checkout: {
      sessions: {
        create: async (params: any) => {
          calls.checkout.push(params);
          return { id: "cs_topup", url: "https://checkout.example.test/topup" };
        },
      },
    },
  };
}

function createTokenCreditsApp() {
  const app = express();
  app.use(express.json());
  app.use("/token-credits", tokenCreditsRouter);
  return app;
}

async function requestJson<TBody = any>(
  app: Express,
  method: string,
  path: string,
  options: { token?: string; body?: unknown } = {}
) {
  const server = await listen(app);
  try {
    const address = server.address() as AddressInfo;
    const headers: Record<string, string> = {};
    if (options.body !== undefined) headers["Content-Type"] = "application/json";
    if (options.token) headers.Authorization = `Bearer ${options.token}`;

    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
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

function resetFakes() {
  setSupabaseAdminForTests(null);
  setStripeForTests(null);
}

function currentPeriodStart() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

function nextPeriodStart() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString().slice(0, 10);
}

function tokenLimitForTier(tier: string) {
  switch (tier) {
    case "private":
    case "basic":
      return 750_000;
    case "creator":
      return 7_500_000;
    case "developer":
    case "canon":
    case "institutional":
      return 20_000_000;
    default:
      return 0;
  }
}

test("token accounting records LLM spend, blocks exhausted users, and leaves soft-cap tiers reviewable", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);

  try {
    const usage = await getTokenUsage(OWNER_ID);
    assert.equal(usage.tier, "private");
    assert.equal(usage.tokensUsed, 123_456);
    assert.equal(usage.tokensLimit, 750_000);
    assert.equal(usage.topupTokens, 500_000);
    assert.equal(usage.effectiveLimit, 1_250_000);
    assert.equal(usage.purchaseHistory[0].id, "purchase-new");
    assert.equal(usage.availableTopups[0].id, "basic-starter");

    const recorded = await recordLlmTokenUsage({
      userId: OWNER_ID,
      model: "claude-haiku-test",
      chatId: "chat-1",
      inputTokens: 101.2,
      outputTokens: -5,
    });
    assert.equal(recorded.tokens_used, 123_558);
    const spend = db.rows("token_transactions").find((tx) => tx.transaction_type === "llm_call");
    assert.equal(spend.tokens_delta, 102);
    assert.equal(spend.input_tokens, 102);
    assert.equal(spend.output_tokens, 0);
    assert.equal(spend.model_used, "claude-haiku-test");

    db.usageFor(OWNER_ID)!.tokens_used = 1_250_000;
    await assert.rejects(
      () => assertTokenBudgetForEstimate(OWNER_ID, 1),
      TokenQuotaError
    );
    try {
      await assertTokenBudgetForEstimate(OWNER_ID, 1);
      assert.fail("Expected exhausted token budget to throw.");
    } catch (error) {
      const response = tokenErrorResponse(error);
      assert.equal(response?.status, 402);
      assert.match(response?.body.error ?? "", /monthly token allocation/);
    }

    db.usageFor(CANON_ID)!.tokens_used = 25_000_000;
    const canonUsage = await assertTokenBudgetForEstimate(CANON_ID, 10_000_000);
    assert.equal(canonUsage.tier, "canon");
    assert.equal(canonUsage.warningLevel, "review");
    assert.equal(canonUsage.modelExperience, "Creator depth");
  } finally {
    resetFakes();
  }
});

test("token top-up checkout and verified grants stay tied to server tier rules", async () => {
  const db = new InMemorySupabase();
  const stripe = createFakeStripe();
  setSupabaseAdminForTests(db.client as any);
  setStripeForTests(stripe as any);
  const app = createTokenCreditsApp();

  try {
    const visitor = await requestJson(app, "GET", "/token-credits/me");
    assert.equal(visitor.status, 401);

    const creatorUsage = await requestJson(app, "GET", "/token-credits/me", {
      token: "creator-token",
    });
    assert.equal(creatorUsage.status, 200);
    assert.equal(creatorUsage.body.usage.tier, "creator");
    assert.equal(creatorUsage.body.usage.availableTopups.length, 3);
    assert.equal(creatorUsage.body.usage.availableTopups[1].id, "creator-standard");

    const checkout = await requestJson(app, "POST", "/token-credits/topups/checkout", {
      token: "creator-token",
      body: { packId: "creator-standard" },
    });
    assert.equal(checkout.status, 200);
    assert.equal(checkout.body.url, "https://checkout.example.test/topup");
    assert.equal(stripe.calls.checkout.length, 1);
    const checkoutCall = stripe.calls.checkout[0];
    assert.equal(checkoutCall.mode, "payment");
    assert.equal(checkoutCall.customer_email, "creator@example.test");
    assert.equal(checkoutCall.line_items[0].price_data.unit_amount, 2500);
    assert.equal(checkoutCall.metadata.station_kind, "token_topup");
    assert.equal(checkoutCall.metadata.station_user_id, CREATOR_ID);
    assert.equal(checkoutCall.metadata.station_pack_id, "creator-standard");
    assert.equal(checkoutCall.metadata.station_tokens, "1500000");
    assert.equal(checkoutCall.payment_intent_data.metadata.station_kind, "token_topup");

    const canonCheckout = await requestJson(app, "POST", "/token-credits/topups/checkout", {
      token: "canon-token",
      body: { packId: "creator-standard" },
    });
    assert.equal(canonCheckout.status, 400);
    assert.match(canonCheckout.body.error, /not available/);

    const beforeTopup = db.usageFor(CREATOR_ID)!.topup_tokens;
    const granted = await grantTopupFromStripeMetadata(checkoutCall.metadata, "pi_creator_standard");
    assert.equal(granted, true);
    assert.equal(db.usageFor(CREATOR_ID)!.topup_tokens, beforeTopup + 1_500_000);
    assert.equal(db.rows("topup_purchases").filter((row) => row.user_id === CREATOR_ID).length, 1);
    assert.equal(db.rows("token_transactions").filter((tx) => tx.transaction_type === "topup_purchase").length, 1);

    await grantTopupFromStripeMetadata(checkoutCall.metadata, "pi_creator_standard");
    assert.equal(db.usageFor(CREATOR_ID)!.topup_tokens, beforeTopup + 1_500_000);
    assert.equal(db.rows("topup_purchases").filter((row) => row.user_id === CREATOR_ID).length, 1);
    assert.equal(db.rows("token_transactions").filter((tx) => tx.transaction_type === "topup_purchase").length, 1);

    assert.equal(await grantTopupFromStripeMetadata({ station_kind: "subscription" }, "pi_subscription"), false);
    await assert.rejects(
      () => grantTopupFromStripeMetadata({ ...checkoutCall.metadata, station_tokens: "0" }, "pi_zero"),
      /positive token/
    );
    await assert.rejects(
      () => grantTopupFromStripeMetadata({ ...checkoutCall.metadata, station_tokens: "999999" }, "pi_wrong_amount"),
      /server pack configuration/
    );
    await assert.rejects(
      () => grantTopupFromStripeMetadata({ ...checkoutCall.metadata, station_user_id: OWNER_ID }, "pi_wrong_tier"),
      /not available/
    );
    await assert.rejects(
      () => grantTopupFromStripeMetadata({ ...checkoutCall.metadata, station_model_tier: "opus" }, "pi_opus"),
      /unsupported model tier/
    );
  } finally {
    resetFakes();
  }
});

test("monthly token reset is admin-only and records one reset transaction per user", async () => {
  const db = new InMemorySupabase();
  setSupabaseAdminForTests(db.client as any);
  const app = createTokenCreditsApp();

  try {
    const blocked = await requestJson(app, "POST", "/token-credits/monthly-reset", {
      token: "owner-token",
      body: {},
    });
    assert.equal(blocked.status, 403);

    const reset = await requestJson(app, "POST", "/token-credits/monthly-reset", {
      token: "admin-token",
      body: {},
    });
    assert.equal(reset.status, 200);
    assert.equal(reset.body.reset.period_start, currentPeriodStart());
    assert.equal(reset.body.reset.usage_rows_touched, db.rows("profiles").length);
    assert.equal(db.rows("token_usage").some((row) => row.user_id === ADMIN_ID), true);
    assert.equal(db.rows("token_usage").some((row) => row.user_id === VISITOR_ID), true);
    assert.equal(db.rows("token_transactions").filter((tx) => tx.transaction_type === "monthly_reset").length, db.rows("profiles").length);

    const secondReset = await requestJson(app, "POST", "/token-credits/monthly-reset", {
      token: "admin-token",
      body: {},
    });
    assert.equal(secondReset.status, 200);
    assert.equal(db.rows("token_transactions").filter((tx) => tx.transaction_type === "monthly_reset").length, db.rows("profiles").length);
  } finally {
    resetFakes();
  }
});

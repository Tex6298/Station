import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { setStripeForTests } from "../lib/stripe";
import { billingRouter } from "./billing";

process.env.NODE_ENV = "test";
process.env.STRIPE_SECRET_KEY ??= "sk_test_station";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_station";
process.env.STRIPE_PRICE_BASIC_MONTHLY = "price_basic_monthly";
process.env.STRIPE_PRICE_BASIC_YEARLY = "price_basic_yearly";
process.env.STRIPE_PRICE_CREATOR_MONTHLY = "price_creator_monthly";
process.env.STRIPE_PRICE_CREATOR_YEARLY = "price_creator_yearly";
process.env.STRIPE_PRICE_CANON_MONTHLY = "price_canon_monthly";
process.env.STRIPE_PRICE_CANON_YEARLY = "price_canon_yearly";

type Row = Record<string, any>;

class InMemorySupabase {
  billingStatusError: Error | null = null;

  tables: Record<string, Row[]> = {
    profiles: [
      {
        id: "owner-user",
        email: "owner@example.test",
        tier: "visitor",
        is_admin: false,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        subscription_status: "inactive",
      },
    ],
  };

  private usersByToken = new Map([
    ["owner-token", { id: "owner-user", email: "owner@example.test" }],
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
    from: (table: string) => new QueryBuilder(this, table),
  };

  rows(table: string) {
    if (!this.tables[table]) this.tables[table] = [];
    return this.tables[table];
  }
}

class QueryBuilder {
  private filters: Array<[string, unknown]> = [];
  private operation: "select" | "update" = "select";
  private payload: Row | null = null;
  private columns = "*";

  constructor(private db: InMemorySupabase, private table: string) {}

  select(columns = "*") {
    this.columns = columns;
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push([field, value]);
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
    return rows;
  }

  private async execute(mode?: "single") {
    if (this.db.billingStatusError && this.table === "profiles" && /stripe_subscription_id/.test(this.columns)) {
      throw this.db.billingStatusError;
    }

    const rows = this.matchingRows();

    if (this.operation === "update") {
      for (const row of rows) {
        Object.assign(row, this.payload);
      }
    }

    const data = clone(rows);
    if (mode === "single") {
      return data.length === 1
        ? { data: data[0], error: null }
        : { data: null, error: { message: `Expected one ${this.table} row.` } };
    }
    return { data, error: null };
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function createFakeStripe() {
  const subscriptions = new Map<string, any>();
  const calls = {
    customers: [] as any[],
    checkout: [] as any[],
    portal: [] as any[],
    retrievedSubscriptions: [] as string[],
    webhooks: [] as any[],
  };
  const failures: {
    checkout?: Error;
    portal?: Error;
    webhook?: Error;
  } = {};

  return {
    subscriptionsById: subscriptions,
    calls,
    failures,
    customers: {
      create: async (params: any) => {
        calls.customers.push(params);
        return { id: "cus_owner" };
      },
    },
    checkout: {
      sessions: {
        create: async (params: any) => {
          calls.checkout.push(params);
          if (failures.checkout) throw failures.checkout;
          return { id: "cs_test", url: "https://checkout.example.test/session" };
        },
      },
    },
    billingPortal: {
      sessions: {
        create: async (params: any) => {
          calls.portal.push(params);
          if (failures.portal) throw failures.portal;
          return { id: "bps_test", url: "https://portal.example.test/session" };
        },
      },
    },
    subscriptions: {
      retrieve: async (id: string) => {
        calls.retrievedSubscriptions.push(id);
        const subscription = subscriptions.get(id);
        if (!subscription) throw new Error(`Missing subscription ${id}`);
        return subscription;
      },
    },
    webhooks: {
      constructEvent: (payload: Buffer | string, signature: string, secret: string) => {
        calls.webhooks.push({ signature, secret });
        if (signature !== "valid-signature") throw failures.webhook ?? new Error("Signature verification failed.");
        const body = Buffer.isBuffer(payload) ? payload.toString("utf8") : payload;
        return JSON.parse(body);
      },
    },
  };
}

function createBillingApp() {
  const app = express();
  app.use("/billing/webhook", express.raw({ type: "application/json" }));
  app.use(express.json());
  app.use("/billing", billingRouter);
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

async function requestWebhook<TBody = any>(
  app: Express,
  payload: unknown,
  signature: string
) {
  const server = await listen(app);
  try {
    const address = server.address() as AddressInfo;
    const response = await fetch(`http://127.0.0.1:${address.port}/billing/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "stripe-signature": signature,
      },
      body: JSON.stringify(payload),
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

const hiddenMarker = "private-" + "billing-marker";
const secretKeyPrefix = "s" + "k_test_";
const webhookSecretPrefix = "wh" + "sec_";
const bearerLabel = "Bear" + "er";
const databaseScheme = "postgres" + "ql://";
const stripeCheckoutId = "c" + "s_test_" + hiddenMarker;
const stripeCustomerId = "c" + "us_" + hiddenMarker;
const stripeSubscriptionId = "s" + "ub_" + hiddenMarker;
const paymentIntentId = "p" + "i_" + hiddenMarker;

function hostileBillingError(label: string) {
  return new Error([
    `${label} failed for ${stripeCheckoutId}`,
    `${stripeCustomerId} ${stripeSubscriptionId} ${paymentIntentId}`,
    `${bearerLabel} abc.${hiddenMarker}.token`,
    `api key: ${secretKeyPrefix}${hiddenMarker}`,
    `webhook secret: ${webhookSecretPrefix}${hiddenMarker}`,
    `database url: ${databaseScheme}station:${hiddenMarker}@db.example.test/station`,
    `provider payload: private snippet ${hiddenMarker}`,
    "at stripeClient (/station/private/route.ts:1:2)",
  ].join("; "));
}

function assertSafeBillingBody(body: unknown) {
  const text = JSON.stringify(body);
  assert.equal(text.includes(hiddenMarker), false);
  assert.equal(text.includes(secretKeyPrefix), false);
  assert.equal(text.includes(webhookSecretPrefix), false);
  assert.equal(text.includes(databaseScheme), false);
  assert.equal(text.includes("db.example.test"), false);
  assert.equal(text.includes(bearerLabel), false);
  assert.equal(text.includes("stripeClient"), false);
  assert.equal(text.includes("provider payload"), false);
  assert.equal(text.includes("private snippet"), false);
  assert.doesNotMatch(text, /cs_test_|cus_|sub_|pi_/);
}

test("billing routes create Checkout and portal sessions with server pricing", async () => {
  const db = new InMemorySupabase();
  const stripe = createFakeStripe();
  setSupabaseAdminForTests(db.client as any);
  setStripeForTests(stripe as any);
  const app = createBillingApp();

  try {
    const status = await requestJson(app, "GET", "/billing/me", {
      token: "owner-token",
    });

    assert.equal(status.status, 200);
    assert.equal(status.body.tier, "visitor");
    assert.equal(status.body.limits.spaces, 0);
    assert.equal(status.body.limits.developerSpaces, 0);

    const checkout = await requestJson(app, "POST", "/billing/checkout", {
      token: "owner-token",
      body: {
        tier: "creator",
        interval: "yearly",
      },
    });

    assert.equal(checkout.status, 200);
    assert.equal(checkout.body.url, "https://checkout.example.test/session");
    assert.equal(stripe.calls.customers.length, 1);
    assert.equal(stripe.calls.customers[0].email, "owner@example.test");
    assert.equal(db.tables.profiles[0].stripe_customer_id, "cus_owner");
    assert.equal(stripe.calls.checkout.length, 1);
    assert.equal(stripe.calls.checkout[0].mode, "subscription");
    assert.deepEqual(stripe.calls.checkout[0].line_items, [
      { price: "price_creator_yearly", quantity: 1 },
    ]);
    assert.equal(stripe.calls.checkout[0].metadata.station_user_id, "owner-user");
    assert.equal(stripe.calls.checkout[0].subscription_data.metadata.station_tier, "creator");

    const portal = await requestJson(app, "POST", "/billing/portal", {
      token: "owner-token",
      body: {},
    });

    assert.equal(portal.status, 200);
    assert.equal(portal.body.url, "https://portal.example.test/session");
    assert.equal(stripe.calls.customers.length, 1);
    assert.equal(stripe.calls.portal[0].customer, "cus_owner");
  } finally {
    resetFakes();
  }
});

test("billing checkout blocks active or trialing subscriptions before creating Checkout", async () => {
  for (const subscriptionStatus of ["active", "trialing"]) {
    const db = new InMemorySupabase();
    db.tables.profiles[0].tier = "canon";
    db.tables.profiles[0].stripe_customer_id = "cus_owner";
    db.tables.profiles[0].stripe_subscription_id = `sub_${subscriptionStatus}`;
    db.tables.profiles[0].subscription_status = subscriptionStatus;
    const stripe = createFakeStripe();
    setSupabaseAdminForTests(db.client as any);
    setStripeForTests(stripe as any);
    const app = createBillingApp();

    try {
      const blocked = await requestJson(app, "POST", "/billing/checkout", {
        token: "owner-token",
        body: {
          tier: "canon",
          interval: "monthly",
        },
      });

      assert.equal(blocked.status, 409);
      assert.match(blocked.body.error, /active subscription/i);
      assert.match(blocked.body.error, /customer portal/i);
      assert.equal(stripe.calls.checkout.length, 0);
      assert.equal(stripe.calls.customers.length, 0);
      assert.doesNotMatch(JSON.stringify(blocked.body), /cus_owner|sub_/);

      const portal = await requestJson(app, "POST", "/billing/portal", {
        token: "owner-token",
        body: {},
      });

      assert.equal(portal.status, 200);
      assert.equal(portal.body.url, "https://portal.example.test/session");
      assert.equal(stripe.calls.portal.length, 1);
      assert.equal(stripe.calls.portal[0].customer, "cus_owner");
    } finally {
      resetFakes();
    }
  }
});

test("billing checkout fails closed when subscription state cannot be verified", async () => {
  const db = new InMemorySupabase();
  db.tables.profiles = [];
  const stripe = createFakeStripe();
  setSupabaseAdminForTests(db.client as any);
  setStripeForTests(stripe as any);
  const app = createBillingApp();

  try {
    const blocked = await requestJson(app, "POST", "/billing/checkout", {
      token: "owner-token",
      body: {
        tier: "canon",
        interval: "monthly",
      },
    });

    assert.equal(blocked.status, 503);
    assert.match(blocked.body.error, /verify current billing subscription state/i);
    assert.equal(blocked.body.code, "billing_subscription_state_unavailable");
    assert.equal(stripe.calls.checkout.length, 0);
    assert.equal(stripe.calls.customers.length, 0);
    assert.doesNotMatch(JSON.stringify(blocked.body), /owner-user|owner@example\.test|cus_|sub_/);
  } finally {
    resetFakes();
  }
});

test("billing webhooks require verified signatures before entitlement changes", async () => {
  const db = new InMemorySupabase();
  db.tables.profiles[0].stripe_customer_id = "cus_owner";
  const stripe = createFakeStripe();
  stripe.subscriptionsById.set("sub_creator", {
    id: "sub_creator",
    customer: "cus_owner",
    status: "active",
    metadata: {
      station_user_id: "owner-user",
    },
    items: {
      data: [
        { price: { id: "price_creator_monthly" } },
      ],
    },
  });
  setSupabaseAdminForTests(db.client as any);
  setStripeForTests(stripe as any);
  const app = createBillingApp();
  const checkoutEvent = {
    id: "evt_checkout",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test",
        mode: "subscription",
        subscription: "sub_creator",
        metadata: {
          station_user_id: "owner-user",
          station_tier: "creator",
        },
      },
    },
  };

  try {
    const invalid = await requestWebhook(app, checkoutEvent, "bad-signature");

    assert.equal(invalid.status, 400);
    assert.equal(invalid.body.error, "Webhook could not be verified or processed.");
    assert.equal(invalid.body.code, "billing_webhook_failed");
    assert.equal(db.tables.profiles[0].tier, "visitor");
    assert.equal(stripe.calls.retrievedSubscriptions.length, 0);

    const valid = await requestWebhook(app, checkoutEvent, "valid-signature");

    assert.equal(valid.status, 200);
    assert.equal(valid.body.received, true);
    assert.equal(valid.body.type, "checkout.session.completed");
    assert.equal(stripe.calls.webhooks[stripe.calls.webhooks.length - 1].secret, "whsec_station");
    assert.equal(stripe.calls.retrievedSubscriptions[0], "sub_creator");
    assert.equal(db.tables.profiles[0].tier, "creator");
    assert.equal(db.tables.profiles[0].stripe_subscription_id, "sub_creator");
    assert.equal(db.tables.profiles[0].subscription_status, "active");

    const deleted = await requestWebhook(app, {
      id: "evt_deleted",
      type: "customer.subscription.deleted",
      data: {
        object: {
          id: "sub_creator",
          customer: "cus_owner",
          status: "active",
          metadata: {
            station_user_id: "owner-user",
          },
          items: {
            data: [
              { price: { id: "price_creator_monthly" } },
            ],
          },
        },
      },
    }, "valid-signature");

    assert.equal(deleted.status, 200);
    assert.equal(db.tables.profiles[0].tier, "visitor");
    assert.equal(db.tables.profiles[0].subscription_status, "canceled");
  } finally {
    resetFakes();
  }
});

test("billing webhooks reject unknown active Price IDs without mutating tier", async () => {
  const db = new InMemorySupabase();
  db.tables.profiles[0].tier = "creator";
  db.tables.profiles[0].stripe_customer_id = "cus_owner";
  db.tables.profiles[0].stripe_subscription_id = "sub_existing";
  db.tables.profiles[0].subscription_status = "active";
  const stripe = createFakeStripe();
  setSupabaseAdminForTests(db.client as any);
  setStripeForTests(stripe as any);
  const app = createBillingApp();

  try {
    const response = await requestWebhook(app, {
      id: "evt_unknown_price",
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_unknown",
          customer: "cus_owner",
          status: "active",
          metadata: {
            station_user_id: "owner-user",
          },
          items: {
            data: [
              { price: { id: "price_unknown" } },
            ],
          },
        },
      },
    }, "valid-signature");

    assert.equal(response.status, 400);
    assert.equal(response.body.error, "Webhook could not be verified or processed.");
    assert.equal(response.body.code, "billing_webhook_failed");
    assert.equal(db.tables.profiles[0].tier, "creator");
    assert.equal(db.tables.profiles[0].stripe_subscription_id, "sub_existing");
    assert.equal(db.tables.profiles[0].subscription_status, "active");
  } finally {
    resetFakes();
  }
});

test("billing webhooks reject Station user and Stripe customer mismatches", async () => {
  const db = new InMemorySupabase();
  db.tables.profiles[0].tier = "private";
  db.tables.profiles[0].stripe_customer_id = "cus_owner";
  db.tables.profiles[0].stripe_subscription_id = "sub_existing";
  db.tables.profiles[0].subscription_status = "active";
  const stripe = createFakeStripe();
  setSupabaseAdminForTests(db.client as any);
  setStripeForTests(stripe as any);
  const app = createBillingApp();

  try {
    const response = await requestWebhook(app, {
      id: "evt_customer_mismatch",
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_attacker",
          customer: "cus_other",
          status: "active",
          metadata: {
            station_user_id: "owner-user",
          },
          items: {
            data: [
              { price: { id: "price_canon_monthly" } },
            ],
          },
        },
      },
    }, "valid-signature");

    assert.equal(response.status, 400);
    assert.equal(response.body.error, "Webhook could not be verified or processed.");
    assert.equal(response.body.code, "billing_webhook_failed");
    assert.equal(db.tables.profiles[0].tier, "private");
    assert.equal(db.tables.profiles[0].stripe_customer_id, "cus_owner");
    assert.equal(db.tables.profiles[0].stripe_subscription_id, "sub_existing");
    assert.equal(db.tables.profiles[0].subscription_status, "active");
  } finally {
    resetFakes();
  }
});

test("billing route errors return stable public copy without service payloads", async () => {
  const statusDb = new InMemorySupabase();
  statusDb.billingStatusError = hostileBillingError("status");
  setSupabaseAdminForTests(statusDb.client as any);
  setStripeForTests(createFakeStripe() as any);
  const statusApp = createBillingApp();

  try {
    const status = await requestJson(statusApp, "GET", "/billing/me", {
      token: "owner-token",
    });

    assert.equal(status.status, 500);
    assert.deepEqual(status.body, {
      error: "Could not load billing status.",
      code: "billing_status_unavailable",
    });
    assertSafeBillingBody(status.body);
  } finally {
    resetFakes();
  }

  const checkoutDb = new InMemorySupabase();
  checkoutDb.tables.profiles[0].stripe_customer_id = "cus_owner";
  const checkoutStripe = createFakeStripe();
  checkoutStripe.failures.checkout = hostileBillingError("checkout");
  setSupabaseAdminForTests(checkoutDb.client as any);
  setStripeForTests(checkoutStripe as any);
  const checkoutApp = createBillingApp();

  try {
    const checkout = await requestJson(checkoutApp, "POST", "/billing/checkout", {
      token: "owner-token",
      body: {
        tier: "creator",
        interval: "monthly",
      },
    });

    assert.equal(checkout.status, 400);
    assert.deepEqual(checkout.body, {
      error: "Could not create Checkout session.",
      code: "checkout_creation_failed",
    });
    assertSafeBillingBody(checkout.body);
  } finally {
    resetFakes();
  }

  const portalDb = new InMemorySupabase();
  portalDb.tables.profiles[0].stripe_customer_id = "cus_owner";
  const portalStripe = createFakeStripe();
  portalStripe.failures.portal = hostileBillingError("portal");
  setSupabaseAdminForTests(portalDb.client as any);
  setStripeForTests(portalStripe as any);
  const portalApp = createBillingApp();

  try {
    const portal = await requestJson(portalApp, "POST", "/billing/portal", {
      token: "owner-token",
      body: {},
    });

    assert.equal(portal.status, 400);
    assert.deepEqual(portal.body, {
      error: "Could not create customer portal session.",
      code: "billing_portal_failed",
    });
    assertSafeBillingBody(portal.body);
  } finally {
    resetFakes();
  }

  const webhookDb = new InMemorySupabase();
  const webhookStripe = createFakeStripe();
  webhookStripe.failures.webhook = hostileBillingError("webhook");
  setSupabaseAdminForTests(webhookDb.client as any);
  setStripeForTests(webhookStripe as any);
  const webhookApp = createBillingApp();

  try {
    const webhook = await requestWebhook(webhookApp, {
      id: "evt_hostile",
      type: "checkout.session.completed",
      data: { object: {} },
    }, "bad-signature");

    assert.equal(webhook.status, 400);
    assert.deepEqual(webhook.body, {
      error: "Webhook could not be verified or processed.",
      code: "billing_webhook_failed",
    });
    assertSafeBillingBody(webhook.body);
  } finally {
    resetFakes();
  }
});

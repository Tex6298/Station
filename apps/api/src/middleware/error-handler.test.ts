import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import test from "node:test";
import express, { type Express } from "express";
import { errorHandler } from "./error-handler";

type JsonResponse = {
  status: number;
  body: Record<string, unknown>;
};

const hiddenMarker = "private-" + "marker";
const bearerLabel = "Bear" + "er";
const databaseScheme = "postgres" + "ql://";
const secretKeyPrefix = "s" + "k_test_";
const uuid = "123e4567-e89b-12d3-a456-426614174000";

test("generic 500 errors return a stable public envelope and sanitized log", async () => {
  const hostileMessage = [
    `database url: ${databaseScheme}station:${hiddenMarker}@db.example.test/station`,
    `${bearerLabel} abc.${hiddenMarker}.token`,
    `api key: ${secretKeyPrefix}${hiddenMarker}`,
    `cookie: station=${hiddenMarker}`,
    `raw id: ${uuid}`,
    `provider payload: private snippet ${hiddenMarker}`,
    `select * from profiles where owner_user_id = '${uuid}'`,
    `at handler (/station/${hiddenMarker}/route.ts:1:2)`,
  ].join("; ");
  const logs: unknown[][] = [];

  const response = await withConsoleCapture(logs, () =>
    withTestApp((app) => {
      app.get("/boom", () => {
        throw new Error(hostileMessage);
      });
    }, (baseUrl) => requestJson(`${baseUrl}/boom`))
  );

  assert.equal(response.status, 500);
  assert.deepEqual(response.body, {
    error: "Internal server error.",
    code: "internal_server_error",
  });
  assertNoLeak(JSON.stringify(response.body));
  assertNoLeak(JSON.stringify(logs));
  assert.match(JSON.stringify(logs), /Internal server error/);
});

test("non-Error throws do not leak arbitrary payloads", async () => {
  const response = await withConsoleCapture([], () =>
    withTestApp((app) => {
      app.get("/non-error", (_req, _res, next) => {
        next({
          statusCode: 500,
          message: `private text: ${hiddenMarker}`,
        });
      });
    }, (baseUrl) => requestJson(`${baseUrl}/non-error`))
  );

  assert.equal(response.status, 500);
  assert.deepEqual(response.body, {
    error: "Internal server error.",
    code: "internal_server_error",
  });
  assertNoLeak(JSON.stringify(response.body));
});

test("bounded 409 errors keep their status and public message", async () => {
  const response = await withConsoleCapture([], () =>
    withTestApp((app) => {
      app.get("/conflict", (_req, _res, next) => {
        const err = new Error("An export package is already processing for this target.") as Error & { statusCode: number };
        err.statusCode = 409;
        next(err);
      });
    }, (baseUrl) => requestJson(`${baseUrl}/conflict`))
  );

  assert.equal(response.status, 409);
  assert.deepEqual(response.body, {
    error: "An export package is already processing for this target.",
    code: "conflict",
  });
});

test("exposed 503 errors are sanitized before returning to clients", async () => {
  const response = await withConsoleCapture([], () =>
    withTestApp((app) => {
      app.get("/unavailable", (_req, _res, next) => {
        const err = new Error(
          `Could not verify current billing subscription state. ${bearerLabel} abc.${hiddenMarker}.token; ` +
            `database url: ${databaseScheme}station:${hiddenMarker}@db.example.test/station`
        ) as Error & { status: number };
        err.status = 503;
        next(err);
      });
    }, (baseUrl) => requestJson(`${baseUrl}/unavailable`))
  );

  assert.equal(response.status, 503);
  assert.equal(response.body.code, "service_unavailable");
  assert.match(String(response.body.error), /Could not verify current billing subscription state/);
  assertNoLeak(JSON.stringify(response.body));
});

test("client error messages are sanitized when they reach the global handler", async () => {
  const response = await withConsoleCapture([], () =>
    withTestApp((app) => {
      app.get("/bad-request", (_req, _res, next) => {
        const err = new Error(
          `Invalid upload. raw body: ${hiddenMarker}; user id=${uuid}; ${bearerLabel} abc.${hiddenMarker}.token`
        ) as Error & { status: number };
        err.status = 400;
        next(err);
      });
    }, (baseUrl) => requestJson(`${baseUrl}/bad-request`))
  );

  assert.equal(response.status, 400);
  assert.equal(response.body.code, "bad_request");
  assert.match(String(response.body.error), /Invalid upload/);
  assertNoLeak(JSON.stringify(response.body));
});

test("response status fallback does not expose generic thrown messages", async () => {
  const logs: unknown[][] = [];
  const response = await withConsoleCapture(logs, () =>
    withTestApp((app) => {
      app.get("/fallback-status", (_req, res) => {
        res.status(400);
        throw new Error(`private text: ${hiddenMarker}; user id=${uuid}`);
      });
    }, (baseUrl) => requestJson(`${baseUrl}/fallback-status`))
  );

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, {
    error: "Bad request.",
    code: "bad_request",
  });
  assertNoLeak(JSON.stringify(response.body));
  assertNoLeak(JSON.stringify(logs));
});

async function withTestApp<T>(
  registerRoutes: (app: Express) => void,
  run: (baseUrl: string) => Promise<T>
) {
  const app = express();
  registerRoutes(app);
  app.use(errorHandler);

  const server = await listen(app);
  const address = server.address() as AddressInfo;
  try {
    return await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await close(server);
  }
}

async function listen(app: Express) {
  return await new Promise<Server>((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function close(server: Server) {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

async function requestJson(url: string): Promise<JsonResponse> {
  const response = await fetch(url);
  return {
    status: response.status,
    body: await response.json() as Record<string, unknown>,
  };
}

async function withConsoleCapture<T>(logs: unknown[][], run: () => Promise<T>) {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    logs.push(args);
  };
  try {
    return await run();
  } finally {
    console.error = originalError;
  }
}

function assertNoLeak(value: string) {
  assert.equal(value.includes(hiddenMarker), false);
  assert.equal(value.includes(databaseScheme), false);
  assert.equal(value.includes("db.example.test"), false);
  assert.equal(value.includes(bearerLabel), false);
  assert.equal(value.includes(secretKeyPrefix), false);
  assert.equal(value.includes(uuid), false);
  assert.doesNotMatch(value, /select \* from/i);
  assert.doesNotMatch(value, /provider payload/i);
  assert.doesNotMatch(value, /raw body/i);
  assert.doesNotMatch(value, /cookie/i);
  assert.doesNotMatch(value, /route\.ts:1:2/i);
}

import { readFileSync } from "node:fs";
import {
  createDeveloperSpaceClient,
  DeveloperSpaceClientError,
  type DeveloperSpaceBatchImportPayload,
} from "../src";

const baseUrl = requiredEnv("STATION_API_URL");
const developerKey = requiredEnv("STATION_DEVELOPER_KEY");
const deliveryId = requiredEnv("STATION_OBSERVED_RUNTIME_WEBHOOK_ID");
const signingSecret = process.env.STATION_OBSERVED_RUNTIME_SIGNING_SECRET || developerKey;
const payload = loadPayload();

const client = createDeveloperSpaceClient({
  baseUrl,
  apiKey: developerKey,
});

try {
  const response = await client.sendObservedRuntimeWebhook({
    deliveryId,
    signingSecret,
    source: {
      id: process.env.STATION_OBSERVED_RUNTIME_SOURCE_ID ?? "local-operator-smoke",
    },
    payload,
  });
  console.log(JSON.stringify({
    ok: true,
    response,
  }, null, 2));
} catch (error) {
  if (error instanceof DeveloperSpaceClientError) {
    console.error(JSON.stringify({
      ok: false,
      status: error.status,
      code: error.code,
      category: error.category,
      retryAfter: error.retryAfter,
      details: error.body && typeof error.body === "object" && "details" in error.body
        ? (error.body as { details?: unknown }).details
        : undefined,
    }, null, 2));
    process.exitCode = 1;
  } else {
    throw error;
  }
}

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function loadPayload(): DeveloperSpaceBatchImportPayload {
  const payloadPath = process.env.STATION_OBSERVED_RUNTIME_PAYLOAD_PATH?.trim();
  if (payloadPath) {
    return JSON.parse(readFileSync(payloadPath, "utf8")) as DeveloperSpaceBatchImportPayload;
  }
  return {
    nodes: [
      {
        nodeId: "operator:sample",
        nodeName: "Operator Sample",
        topologyType: "radial",
        fragmentCount: 1,
        metrics: {
          publicState: "sample",
        },
        fieldClassifications: {
          publicState: "public",
        },
        provenance: "imported",
      },
    ],
    events: [
      {
        eventType: "operator.sample",
        eventLabel: "Operator sample observed",
        nodeId: "operator:sample",
        eventData: {
          publicSignal: "sample",
        },
        fieldClassifications: {
          publicSignal: "public",
        },
        visibility: "public",
        provenance: "imported",
      },
    ],
    snapshots: [],
    supportingContext: [],
  };
}

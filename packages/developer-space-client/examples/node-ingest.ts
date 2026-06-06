import { createDeveloperSpaceClient } from "../src";

const client = createDeveloperSpaceClient({
  baseUrl: process.env.STATION_API_URL ?? "http://localhost:4000",
  apiKey: process.env.STATION_DEVELOPER_KEY ?? "",
});

await client.upsertNodeState("animus-alpha", {
  nodeName: "Animus Alpha",
  topologyType: "radial",
  fragmentCount: 128,
  selfSimilarityScore: 0.73,
  dimensionality: 12,
  metrics: {
    interNodeDistance: 0.41,
    crystallisations: 7,
  },
  sourceRefs: ["run-2026-05-23"],
  provenance: "api",
});

await client.recordEvent({
  eventType: "fragment_absorbed",
  eventLabel: "Alpha absorbed a grief-domain fragment",
  nodeId: "animus-alpha",
  similarityScore: 0.73,
  eventData: {
    domain: "grief",
    fragmentId: "frag_0042",
  },
  sourceRefs: ["fragment-ledger:frag_0042"],
  provenance: "api",
  visibility: "public",
});

await client.recordSnapshot({
  snapshotData: {
    summary: "Weekly manifold snapshot",
    nodes: 3,
    meanSelfSimilarity: 0.68,
  },
  sourceRefs: ["weekly-snapshot-18"],
  provenance: "api",
});

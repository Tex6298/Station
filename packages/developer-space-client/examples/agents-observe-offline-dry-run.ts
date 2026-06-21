import { readFileSync } from "node:fs";
import {
  agentsObserveHookEventFixture,
  createAgentsObserveOfflineDryRunSummary,
  type AgentsObserveHookEventFixture,
} from "../src";

const args = new Set(process.argv.slice(2));
const fixturePath = readArgValue("--fixture");
const includeSignedRequest = args.has("--signed-demo");
const fixture = fixturePath ? readFixture(fixturePath) : agentsObserveHookEventFixture;

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

async function main() {
  const summary = await createAgentsObserveOfflineDryRunSummary({
    fixture,
    fixtureSource: fixturePath ? "provided-file" : "default-fixture",
    includeSignedRequest,
  });

  console.log(JSON.stringify(summary, null, 2));
}

function readArgValue(name: string) {
  const prefix = `${name}=`;
  const value = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return value?.slice(prefix.length).trim();
}

function readFixture(path: string): AgentsObserveHookEventFixture {
  return JSON.parse(readFileSync(path, "utf8")) as AgentsObserveHookEventFixture;
}

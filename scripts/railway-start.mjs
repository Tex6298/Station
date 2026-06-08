import { existsSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const service = process.env.RAILWAY_SERVICE_NAME ?? "";
const serviceId = process.env.RAILWAY_SERVICE_ID ?? "";
const isWeb =
  service === "@station/web" ||
  serviceId === "ebf19279-e231-4b25-931e-91e1884f6e53" ||
  Boolean(process.env.NEXT_PUBLIC_API_URL);

function run(command, args, env = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, ...env },
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!isWeb) {
  run("node", [path.join("apps", "api", "dist", "server.js")]);
  process.exit(0);
}

const candidates = [
  path.join("apps", "web", ".next", "standalone", "apps", "web", "server.js"),
  path.join("apps", "web", ".next", "standalone", "server.js"),
];
const server = candidates.find((candidate) => existsSync(candidate));

if (!server) {
  console.error("No Next standalone server.js was found. Run the web build first.");
  process.exit(1);
}

run("node", [server], { HOSTNAME: "0.0.0.0" });

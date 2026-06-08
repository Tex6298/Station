import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const service = process.env.RAILWAY_SERVICE_NAME ?? "";
const serviceId = process.env.RAILWAY_SERVICE_ID ?? "";
const isWeb =
  service === "@station/web" ||
  serviceId === "ebf19279-e231-4b25-931e-91e1884f6e53" ||
  Boolean(process.env.NEXT_PUBLIC_API_URL);

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function copyDirectory(source, target) {
  if (!existsSync(source)) return;
  rmSync(target, { recursive: true, force: true });
  mkdirSync(path.dirname(target), { recursive: true });
  cpSync(source, target, { recursive: true });
}

if (!isWeb) {
  run("npx", ["--yes", "pnpm@10.32.1", "--dir", "apps/api", "build"]);
  process.exit(0);
}

run("npx", ["--yes", "pnpm@10.32.1", "--dir", "apps/web", "build"]);

const webRoot = path.join("apps", "web");
const standaloneRoot = path.join(webRoot, ".next", "standalone");
const serverDirs = [
  standaloneRoot,
  path.join(standaloneRoot, "apps", "web"),
].filter((dir) => existsSync(path.join(dir, "server.js")));

for (const dir of serverDirs) {
  copyDirectory(path.join(webRoot, "public"), path.join(dir, "public"));
  copyDirectory(path.join(webRoot, ".next", "static"), path.join(dir, ".next", "static"));
}

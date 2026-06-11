import { readFileSync } from "node:fs";

const ZERO_UUID = "00000000-0000-0000-0000-000000000000";
const VECTOR_DIMENSION = 1536;

function loadDotEnv() {
  try {
    const entries = readFileSync(".env", "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        const key = line.slice(0, index);
        const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
        return [key, value];
      });
    return Object.fromEntries(entries);
  } catch {
    return {};
  }
}

function requireConfig(name, dotenv) {
  const value = process.env[name] || dotenv[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`${name} is required in the environment or .env`);
  }
  return value.trim();
}

async function callRpc(supabaseUrl, serviceRoleKey, functionName, args) {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text.slice(0, 500) };
  }

  return {
    functionName,
    status: response.status,
    ok: response.ok,
    code: body.code ?? null,
    message: body.message ?? null,
    details: body.details ?? null,
    hint: body.hint ?? null,
    rowCount: Array.isArray(body) ? body.length : null,
  };
}

function projectRefFromUrl(supabaseUrl) {
  try {
    return new URL(supabaseUrl).hostname.split(".")[0] || "unknown";
  } catch {
    return "unknown";
  }
}

async function main() {
  const dotenv = loadDotEnv();
  const supabaseUrl = requireConfig("SUPABASE_URL", dotenv);
  const serviceRoleKey = requireConfig("SUPABASE_SERVICE_ROLE_KEY", dotenv);
  const zeroVector = new Array(VECTOR_DIMENSION).fill(0);
  const commonArgs = {
    query_embedding: zeroVector,
    match_count: 1,
    p_embedding_provider: "gemini",
    p_embedding_model: "gemini-embedding-2",
    p_embedding_index_name: "memory_items_embedding_1536",
  };

  const results = await Promise.all([
    callRpc(supabaseUrl, serviceRoleKey, "match_memory_items", {
      p_persona_id: ZERO_UUID,
      ...commonArgs,
    }),
    callRpc(supabaseUrl, serviceRoleKey, "match_private_archive_chunks", {
      p_persona_id: ZERO_UUID,
      p_owner_user_id: ZERO_UUID,
      ...commonArgs,
    }),
  ]);

  console.log(JSON.stringify({
    projectRef: projectRefFromUrl(supabaseUrl),
    profileProof: "station_free_1536",
    provider: "gemini",
    model: "gemini-embedding-2",
    dimension: VECTOR_DIMENSION,
    results,
  }, null, 2));

  if (results.some((result) => !result.ok)) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

const AUTH_MUTATION_NAMES = [
  "signup",
  "signin",
  "signout",
  "refresh",
];

const SESSION_MUTATION_VERBS = ["create", "set", "update", "delete", "revoke", "exchange"];
const OTP_MUTATION_VERBS = ["verify", "send", "resend", "sign"];

const PRODUCT_AUTH_MUTATION_PATH =
  /(?:^|\/)auth\/(?:signup|signin|signout|refresh)(?:$|[/?#])/i;

function assertFunction(value, name) {
  if (typeof value !== "function") {
    throw new TypeError(`${name} must be a function.`);
  }
}

export function assertProtectedAuthReadName(name) {
  if (typeof name !== "string" || !name.trim()) {
    throw new TypeError("Protected Auth reads require an explicit operation name.");
  }
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const namesAuthMutation = AUTH_MUTATION_NAMES.some((mutation) => normalized.includes(mutation));
  const namesSessionMutation =
    normalized.includes("session") && SESSION_MUTATION_VERBS.some((verb) => normalized.includes(verb));
  const namesOtpMutation =
    normalized.includes("otp") && OTP_MUTATION_VERBS.some((verb) => normalized.includes(verb));
  if (namesAuthMutation || namesSessionMutation || namesOtpMutation) {
    throw new Error(`Protected-read verifier rejected Auth mutation: ${name.trim()}`);
  }
}

function canonicalProductPath(pathname) {
  let decoded = pathname;
  for (let pass = 0; pass < 8 && /%[0-9a-f]{2}/i.test(decoded); pass += 1) {
    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      throw new Error("Protected-read verifier rejected invalid product path encoding.");
    }
  }
  if (/%[0-9a-f]{2}/i.test(decoded)) {
    throw new Error("Protected-read verifier rejected excessively encoded product path.");
  }

  const segments = [];
  for (const segment of decoded.replaceAll("\\", "/").split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      segments.pop();
      continue;
    }
    segments.push(segment);
  }
  return `/${segments.join("/")}`;
}

export function assertProtectedProductGet(url, init = {}) {
  const method = String(init.method ?? "GET").toUpperCase();
  if (method !== "GET") {
    throw new Error(`Protected-read verifier rejected product method: ${method}`);
  }
  if (init.body !== undefined) {
    throw new Error("Protected-read verifier rejected a product GET body.");
  }
  const parsed = new URL(String(url), "https://station.invalid");
  const pathname = canonicalProductPath(parsed.pathname);
  if (PRODUCT_AUTH_MUTATION_PATH.test(pathname)) {
    throw new Error(`Protected-read verifier rejected Auth-producing product path: ${pathname}`);
  }
}

// This capability boundary prevents accidental mutation. Registered callbacks
// remain trusted code; a deliberately misleading callback is outside its scope.
export function createProtectedReadVerifier({ fetchImpl = globalThis.fetch, authReads = {} } = {}) {
  assertFunction(fetchImpl, "fetchImpl");
  const readers = new Map();
  for (const [name, reader] of Object.entries(authReads)) {
    assertProtectedAuthReadName(name);
    assertFunction(reader, `authReads.${name}`);
    readers.set(name, reader);
  }

  return Object.freeze({
    async productGet(url, init = {}) {
      assertProtectedProductGet(url, init);
      return fetchImpl(url, { ...init, method: "GET" });
    },

    async authRead(name, ...args) {
      assertProtectedAuthReadName(name);
      const reader = readers.get(name);
      if (!reader) {
        throw new Error(`Protected Auth read is not registered: ${name}`);
      }
      return reader(...args);
    },
  });
}

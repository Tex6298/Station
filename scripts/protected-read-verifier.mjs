const AUTH_MUTATION_NAMES = [
  "signup",
  "signin",
  "signout",
  "refresh",
  "createsession",
  "setsession",
  "updatesession",
  "deletesession",
  "revokesession",
  "exchangecodeforsession",
  "verifyotp",
];

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
  if (AUTH_MUTATION_NAMES.some((mutation) => normalized.includes(mutation))) {
    throw new Error(`Protected-read verifier rejected Auth mutation: ${name.trim()}`);
  }
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
  if (PRODUCT_AUTH_MUTATION_PATH.test(parsed.pathname)) {
    throw new Error(`Protected-read verifier rejected Auth-producing product path: ${parsed.pathname}`);
  }
}

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

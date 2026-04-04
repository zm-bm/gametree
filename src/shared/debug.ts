type DebugGlobal = {
  __DEBUG__?: boolean;
  __GAMETREE_DEBUG__?: boolean;
  __DEBUG_PERSIST__?: boolean;
  __GAMETREE_DEBUG_PERSIST__?: boolean;
  __GAMETREE_DEBUG_BUFFER__?: DebugEntry[];
  __GAMETREE_DEBUG_DUMP__?: (domain?: string) => DebugEntry[];
  __GAMETREE_DEBUG_CLEAR__?: () => void;
  [key: string]: unknown;
};

// Debug logging (DEV only):
// - Enable all domains for current tab: window.__DEBUG__ = true
// - Enable gametree domain for current tab: window.__GAMETREE_DEBUG__ = true
// - Enable all domains across reloads: localStorage.setItem("debug", "1")
// - Enable gametree domain across reloads: localStorage.setItem("gametreeDebug", "1")
// - Persist debug events across reloads: localStorage.setItem("gametreeDebugPersist", "1")
// - Disable: set runtime flags to false or remove localStorage keys
const GAMETREE_DEBUG_STORAGE_KEY = "gametreeDebug";
const DEBUG_STORAGE_KEY = "debug";
const DEBUG_PERSIST_STORAGE_KEY = "debugPersist";
const GAMETREE_DEBUG_PERSIST_STORAGE_KEY = "gametreeDebugPersist";
const DEBUG_BUFFER_STORAGE_KEY = "gametreeDebugBuffer";
const DEBUG_BUFFER_LIMIT = 500;
const APP_DEBUG_DOMAIN = "gametree";

type DebugLevel = "debug" | "info" | "warn" | "error";

export type DebugEntry = {
  ts: string;
  domain: string;
  scope: string;
  level: DebugLevel;
  message: string;
  data?: unknown;
};

function toDomainFlag(domain: string) {
  return `__${domain.toUpperCase()}_DEBUG__`;
}

function toDomainStorageKey(domain: string) {
  return `${domain}Debug`;
}

function toDomainPersistStorageKey(domain: string) {
  return `${domain}DebugPersist`;
}

function safeClone(value: unknown) {
  try {
    return JSON.parse(JSON.stringify(value)) as unknown;
  } catch {
    return String(value);
  }
}

function readPersistedBuffer() {
  try {
    const raw = globalThis.localStorage?.getItem(DEBUG_BUFFER_STORAGE_KEY);
    if (!raw) return [] as DebugEntry[];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as DebugEntry[];
  } catch {
    return [] as DebugEntry[];
  }
}

function writePersistedBuffer(buffer: DebugEntry[]) {
  try {
    globalThis.localStorage?.setItem(DEBUG_BUFFER_STORAGE_KEY, JSON.stringify(buffer));
  } catch {
    // Ignore persistence failures.
  }
}

export function isDebugEnabled(domain?: string) {
  if (!import.meta.env.DEV) return false;

  const normalizedDomain = domain?.trim();
  const globals = globalThis as DebugGlobal;

  if (typeof globals.__DEBUG__ === "boolean") return globals.__DEBUG__;

  if (normalizedDomain) {
    const domainFlag = globals[toDomainFlag(normalizedDomain)];
    if (typeof domainFlag === "boolean") return domainFlag;
  }

  if (normalizedDomain === "gametree" && typeof globals.__GAMETREE_DEBUG__ === "boolean") {
    return globals.__GAMETREE_DEBUG__;
  }

  try {
    const storage = globalThis.localStorage;
    if (!storage) return false;

    if (storage.getItem(DEBUG_STORAGE_KEY) === "1") return true;

    if (normalizedDomain) {
      if (storage.getItem(toDomainStorageKey(normalizedDomain)) === "1") return true;
      if (normalizedDomain === "gametree" && storage.getItem(GAMETREE_DEBUG_STORAGE_KEY) === "1") return true;
    }

    return false;
  } catch {
    return false;
  }
}

export function isDebugPersistenceEnabled(domain?: string) {
  if (!import.meta.env.DEV) return false;

  const normalizedDomain = domain?.trim();
  const globals = globalThis as DebugGlobal;

  if (typeof globals.__DEBUG_PERSIST__ === "boolean") return globals.__DEBUG_PERSIST__;

  if (normalizedDomain) {
    const domainPersistFlag = globals[`__${normalizedDomain.toUpperCase()}_DEBUG_PERSIST__`];
    if (typeof domainPersistFlag === "boolean") return domainPersistFlag;
  }

  if (normalizedDomain === "gametree" && typeof globals.__GAMETREE_DEBUG_PERSIST__ === "boolean") {
    return globals.__GAMETREE_DEBUG_PERSIST__;
  }

  try {
    const storage = globalThis.localStorage;
    if (!storage) return false;

    if (storage.getItem(DEBUG_PERSIST_STORAGE_KEY) === "1") return true;

    if (normalizedDomain) {
      if (storage.getItem(toDomainPersistStorageKey(normalizedDomain)) === "1") return true;
      if (normalizedDomain === "gametree" && storage.getItem(GAMETREE_DEBUG_PERSIST_STORAGE_KEY) === "1") return true;
    }

    return false;
  } catch {
    return false;
  }
}

function ensureDebugHelpersRegistered() {
  if (!import.meta.env.DEV) return;

  const globals = globalThis as DebugGlobal;
  if (!Array.isArray(globals.__GAMETREE_DEBUG_BUFFER__)) {
    globals.__GAMETREE_DEBUG_BUFFER__ = [];
  }

  if (!globals.__GAMETREE_DEBUG_DUMP__) {
    globals.__GAMETREE_DEBUG_DUMP__ = (domain?: string) => getDebugEntries(domain);
  }

  if (!globals.__GAMETREE_DEBUG_CLEAR__) {
    globals.__GAMETREE_DEBUG_CLEAR__ = () => {
      clearDebugEntries();
    };
  }
}

function appendDebugEntry(entry: DebugEntry) {
  ensureDebugHelpersRegistered();

  const globals = globalThis as DebugGlobal;
  const memoryBuffer = Array.isArray(globals.__GAMETREE_DEBUG_BUFFER__)
    ? globals.__GAMETREE_DEBUG_BUFFER__
    : [];

  memoryBuffer.push(entry);
  if (memoryBuffer.length > DEBUG_BUFFER_LIMIT) {
    memoryBuffer.splice(0, memoryBuffer.length - DEBUG_BUFFER_LIMIT);
  }
  globals.__GAMETREE_DEBUG_BUFFER__ = memoryBuffer;

  if (!isDebugPersistenceEnabled(entry.domain)) return;

  const persisted = readPersistedBuffer();
  persisted.push(entry);
  if (persisted.length > DEBUG_BUFFER_LIMIT) {
    persisted.splice(0, persisted.length - DEBUG_BUFFER_LIMIT);
  }
  writePersistedBuffer(persisted);
}

export function debugLog(domain: string, scope: string, message: string, data?: unknown, level: DebugLevel = "debug") {
  if (!isDebugEnabled(domain)) return;

  appendDebugEntry({
    ts: new Date().toISOString(),
    domain,
    scope,
    level,
    message,
    data: data === undefined ? undefined : safeClone(data),
  });

  const prefix = `[${domain}:${scope}] ${message}`;
  const consoleMethod = (() => {
    switch (level) {
      case "info":
        return console.info;
      case "warn":
        return console.warn;
      case "error":
        return console.error;
      default:
        return console.debug;
    }
  })();

  if (data === undefined) {
    consoleMethod(prefix);
    return;
  }

  consoleMethod(prefix, data);
}

export function getDebugEntries(domain?: string) {
  const globals = globalThis as DebugGlobal;
  const memoryBuffer = Array.isArray(globals.__GAMETREE_DEBUG_BUFFER__)
    ? globals.__GAMETREE_DEBUG_BUFFER__
    : [];
  const persisted = readPersistedBuffer();
  const combined = [...persisted, ...memoryBuffer];

  if (!domain) return combined;
  return combined.filter((entry) => entry.domain === domain);
}

export function clearDebugEntries() {
  const globals = globalThis as DebugGlobal;
  globals.__GAMETREE_DEBUG_BUFFER__ = [];
  try {
    globalThis.localStorage?.removeItem(DEBUG_BUFFER_STORAGE_KEY);
  } catch {
    // Ignore persistence failures.
  }
}

export function debugWarn(domain: string, scope: string, message: string, data?: unknown) {
  debugLog(domain, scope, message, data, "warn");
}

export function isGametreeDebugEnabled() {
  return isDebugEnabled(APP_DEBUG_DOMAIN);
}

export function gametreeDebug(scope: string, message: string, data?: unknown) {
  debugLog(APP_DEBUG_DOMAIN, scope, message, data);
}

export function gametreeDebugWarn(scope: string, message: string, data?: unknown) {
  debugWarn(APP_DEBUG_DOMAIN, scope, message, data);
}

export function isAppDebugEnabled() {
  return isGametreeDebugEnabled();
}

export function appDebug(scope: string, message: string, data?: unknown) {
  gametreeDebug(scope, message, data);
}

export function appDebugWarn(scope: string, message: string, data?: unknown) {
  gametreeDebugWarn(scope, message, data);
}

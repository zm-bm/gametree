type DebugGlobal = {
  __DEBUG__?: boolean;
  __GAMETREE_DEBUG__?: boolean;
  [key: string]: unknown;
};

// Debug logging (DEV only):
// - Enable all domains for current tab: window.__DEBUG__ = true
// - Enable gametree domain for current tab: window.__GAMETREE_DEBUG__ = true
// - Enable all domains across reloads: localStorage.setItem("debug", "1")
// - Enable gametree domain across reloads: localStorage.setItem("gametreeDebug", "1")
// - Disable: set runtime flags to false or remove localStorage keys
const GAMETREE_DEBUG_STORAGE_KEY = "gametreeDebug";
const DEBUG_STORAGE_KEY = "debug";

type DebugLevel = "debug" | "info" | "warn" | "error";

function toDomainFlag(domain: string) {
  return `__${domain.toUpperCase()}_DEBUG__`;
}

function toDomainStorageKey(domain: string) {
  return `${domain}Debug`;
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

export function debugLog(domain: string, scope: string, message: string, data?: unknown, level: DebugLevel = "debug") {
  if (!isDebugEnabled(domain)) return;

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

export function debugWarn(domain: string, scope: string, message: string, data?: unknown) {
  debugLog(domain, scope, message, data, "warn");
}

export function isGametreeDebugEnabled() {
  return isDebugEnabled("gametree");
}

export function gametreeDebug(scope: string, message: string, data?: unknown) {
  debugLog("gametree", scope, message, data);
}

export function gametreeDebugWarn(scope: string, message: string, data?: unknown) {
  debugWarn("gametree", scope, message, data);
}

type DebugGlobals = {
  __DEBUG__?: boolean;
  __GAMETREE_DEBUG__?: boolean;
};

// debug logging (DEV only):
// - Enable for current tab: window.__DEBUG__ = true or window.__GAMETREE_DEBUG__ = true
// - Enable across reloads: localStorage.setItem("gametreeDebug", "1")
const DEBUG_ENABLED_STORAGE_KEY = "gametreeDebug";
const DEBUG_BUFFER_STORAGE_KEY = "gametreeDebugBuffer";
const DEBUG_BUFFER_LIMIT = 500;

export type DebugLogEntry = {
  ts: string;
  scope: string;
  message: string;
  data?: unknown;
};

function safeClone(value: unknown) {
  try {
    return JSON.parse(JSON.stringify(value)) as unknown;
  } catch {
    return String(value);
  }
}

function readDebugBuffer() {
  try {
    const raw = globalThis.localStorage?.getItem(DEBUG_BUFFER_STORAGE_KEY);
    if (!raw) return [] as DebugLogEntry[];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as DebugLogEntry[];
  } catch {
    return [] as DebugLogEntry[];
  }
}

function writeDebugBuffer(buffer: DebugLogEntry[]) {
  try {
    globalThis.localStorage?.setItem(DEBUG_BUFFER_STORAGE_KEY, JSON.stringify(buffer));
  } catch {
    // Ignore persistence failures.
  }
}

export function isDebugLoggingEnabled() {
  if (!import.meta.env.DEV) return false;
  const globals = globalThis as typeof globalThis & DebugGlobals;

  if (typeof globals.__DEBUG__ === "boolean") return globals.__DEBUG__;

  if (typeof globals.__GAMETREE_DEBUG__ === "boolean") {
    return globals.__GAMETREE_DEBUG__;
  }

  try {
    const storage = globalThis.localStorage;
    if (!storage) return false;
    return storage.getItem(DEBUG_ENABLED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function appendDebugEntry(entry: DebugLogEntry) {
  const buffer = readDebugBuffer();
  buffer.push(entry);
  if (buffer.length > DEBUG_BUFFER_LIMIT) {
    buffer.splice(0, buffer.length - DEBUG_BUFFER_LIMIT);
  }
  writeDebugBuffer(buffer);
}

export function logDebug(scope: string, message: string, data?: unknown) {
  if (!isDebugLoggingEnabled()) return;

  appendDebugEntry({
    ts: new Date().toISOString(),
    scope,
    message,
    data: data === undefined ? undefined : safeClone(data),
  });

  const prefix = `[${scope}] ${message}`;

  if (data === undefined) {
    console.debug(prefix);
    return;
  }

  console.debug(prefix, data);
}

export function getDebugLogs() {
  return readDebugBuffer();
}

export function clearDebugLogs() {
  try {
    globalThis.localStorage?.removeItem(DEBUG_BUFFER_STORAGE_KEY);
  } catch {
    // Ignore persistence failures.
  }
}

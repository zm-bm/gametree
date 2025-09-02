import { Id, TreeSource } from "../types";

type GateState = 'idle' | 'scheduled' | 'shown';

type Gate= {
  tShow?: NodeJS.Timeout;
  tHide?: NodeJS.Timeout;
  shownAt?: number;
  st: GateState;
};

interface SkeletonGate {
  start(show: () => void): void;
  resolve(remove?: () => void): void;
  cancel(): void;
  state(): GateState;
}

interface GateRegistryOpts {
  showAfterMs?: number;   // delay before showing
  minVisibleMs?: number;  // minimum time to stay visible
  now?: () => number;
}

export const gateKey = (nodeId: Id, source: TreeSource) => `${source}:${nodeId}`;

export function createSkeletonGateRegistry(opts: GateRegistryOpts = {}) {
  const showAfter = opts.showAfterMs ?? 150;
  const minVisible = opts.minVisibleMs ?? 0;
  const now = opts.now ?? (() => performance.now());

  const gates = new Map<string, Gate>();

  function ensure(key: string): SkeletonGate {
    if (!gates.has(key)) gates.set(key, { st: 'idle' });
    const cell = gates.get(key)!;

    return {
      start(showFn: () => void) {
        cell.st = 'scheduled';
        cell.tShow = setTimeout(() => {
          cell.tShow = undefined;
          cell.st = 'shown';
          cell.shownAt = now();
          showFn();
        }, showAfter);
      },

      async resolve(removeFn: () => void) {
        const remove = () => { try { removeFn(); } finally { gates.delete(key); } };

        // if still scheduled to show, cancel it
        if (cell.st === 'scheduled' && cell.tShow) {
          clearTimeout(cell.tShow);
          cell.tShow = undefined;
          cell.st = 'idle';
          remove();
          return;
        }

        // if already shown, ensure minVisible time has passed
        if (cell.st === 'shown') {
          if (minVisible <= 0) {
            remove();
            return;
          }
          const elapsed = now() - (cell.shownAt ?? now());
          const left = Math.max(0, minVisible - elapsed);
          cell.tHide = setTimeout(remove, left);
        }
      },

      cancel() {
        if (cell.tShow) clearTimeout(cell.tShow);
        if (cell.tHide) clearTimeout(cell.tHide);
        gates.delete(key);
      },

      state: () => cell.st,
    };
  }

  function get(key: string) { return ensure(key); }
  function clearAll() { for (const k of [...gates.keys()]) ensure(k).cancel(); }

  return { ensure, get, clearAll };
}

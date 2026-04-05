import { useCallback, useEffect, useRef } from "react";
import { useParentSize } from "@visx/responsive";
import { logDebug } from "@/shared/debug";

type Size = {
  width: number;
  height: number;
};

const REMEASURE_MAX_ATTEMPTS = 8;
const DEBUG_SCOPE = "tree-size";

export function useStableParentSize() {
  const { parentRef, width, height, resize } = useParentSize();
  const lastGoodSizeRef = useRef<Size>({ width: 0, height: 0 });
  const usingFallbackRef = useRef(false);

  useEffect(() => {
    if (width > 0 && height > 0) {
      lastGoodSizeRef.current = { width, height };
      logDebug(DEBUG_SCOPE, "updated-last-good-size", { width, height });
    }
  }, [width, height]);

  const remeasureParent = useCallback((reason: string, attempt: number) => {
    const el = parentRef.current;
    if (!el) {
      logDebug(DEBUG_SCOPE, "remeasure-skipped-no-parent", { reason, attempt });
      return false;
    }

    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      logDebug(DEBUG_SCOPE, "remeasure-skipped-nonpositive-rect", {
        reason,
        attempt,
        rect: {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
        },
      });
      return false;
    }

    resize({
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
    });
    logDebug(DEBUG_SCOPE, "remeasure-success", {
      reason,
      attempt,
      rect: {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      },
    });
    return true;
  }, [parentRef, resize]);

  const scheduleRemeasure = useCallback((reason: string, attempt = 0) => {
    requestAnimationFrame(() => {
      const didMeasure = remeasureParent(reason, attempt);
      if (!didMeasure && attempt < REMEASURE_MAX_ATTEMPTS) {
        scheduleRemeasure(reason, attempt + 1);
      }

      if (!didMeasure && attempt === REMEASURE_MAX_ATTEMPTS) {
        logDebug(DEBUG_SCOPE, "remeasure-max-attempts-reached", {
          reason,
          attempt,
        });
      }
    });
  }, [remeasureParent]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logDebug(DEBUG_SCOPE, "visibilitychange-hidden", { hidden: true });
        return;
      }
      logDebug(DEBUG_SCOPE, "visibilitychange-visible", { hidden: false });
      scheduleRemeasure("visibilitychange");
    };

    const handlePageShow = () => {
      logDebug(DEBUG_SCOPE, "pageshow");
      scheduleRemeasure("pageshow");
    };

    const handleWindowFocus = () => {
      logDebug(DEBUG_SCOPE, "focus");
      scheduleRemeasure("focus");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleWindowFocus);

    // Kick once on mount to recover if initial observer measurement was zero.
    logDebug(DEBUG_SCOPE, "mount-initial-remeasure");
    scheduleRemeasure("mount");

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [scheduleRemeasure]);

  useEffect(() => {
    if (width > 0 && height > 0) return;
    if (lastGoodSizeRef.current.width === 0 || lastGoodSizeRef.current.height === 0) return;
    logDebug(DEBUG_SCOPE, "observer-reported-nonpositive-size", {
      width,
      height,
      lastGoodSize: lastGoodSizeRef.current,
    });
    scheduleRemeasure("observer-nonpositive");
  }, [width, height, scheduleRemeasure]);

  const stableWidth = width > 0 ? width : lastGoodSizeRef.current.width;
  const stableHeight = height > 0 ? height : lastGoodSizeRef.current.height;

  useEffect(() => {
    const nowUsingFallback = (width <= 0 || height <= 0) && stableWidth > 0 && stableHeight > 0;

    if (nowUsingFallback && !usingFallbackRef.current) {
      logDebug(DEBUG_SCOPE, "using-fallback-size", {
        observedSize: { width, height },
        fallbackSize: { width: stableWidth, height: stableHeight },
      });
    }

    if (!nowUsingFallback && usingFallbackRef.current) {
      logDebug(DEBUG_SCOPE, "recovered-from-fallback-size", {
        observedSize: { width, height },
      });
    }

    usingFallbackRef.current = nowUsingFallback;
  }, [height, stableHeight, stableWidth, width]);

  return {
    parentRef,
    width: stableWidth,
    height: stableHeight,
  };
}

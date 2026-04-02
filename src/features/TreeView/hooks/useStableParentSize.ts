import { useCallback, useEffect, useRef } from "react";
import { useParentSize } from "@visx/responsive";
import { gametreeDebug } from "../../../shared/lib/gametreeDebug";

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
      gametreeDebug(DEBUG_SCOPE, "updated-last-good-size", { width, height });
    }
  }, [width, height]);

  const remeasureParent = useCallback((reason: string, attempt: number) => {
    const el = parentRef.current;
    if (!el) {
      gametreeDebug(DEBUG_SCOPE, "remeasure-skipped-no-parent", { reason, attempt });
      return false;
    }

    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      gametreeDebug(DEBUG_SCOPE, "remeasure-skipped-nonpositive-rect", {
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
    gametreeDebug(DEBUG_SCOPE, "remeasure-success", {
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
        gametreeDebug(DEBUG_SCOPE, "remeasure-max-attempts-reached", {
          reason,
          attempt,
        });
      }
    });
  }, [remeasureParent]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        gametreeDebug(DEBUG_SCOPE, "visibilitychange-hidden", { hidden: true });
        return;
      }
      gametreeDebug(DEBUG_SCOPE, "visibilitychange-visible", { hidden: false });
      scheduleRemeasure("visibilitychange");
    };

    const handlePageShow = () => {
      gametreeDebug(DEBUG_SCOPE, "pageshow");
      scheduleRemeasure("pageshow");
    };

    const handleWindowFocus = () => {
      gametreeDebug(DEBUG_SCOPE, "focus");
      scheduleRemeasure("focus");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleWindowFocus);

    // Kick once on mount to recover if initial observer measurement was zero.
    gametreeDebug(DEBUG_SCOPE, "mount-initial-remeasure");
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
    gametreeDebug(DEBUG_SCOPE, "observer-reported-nonpositive-size", {
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
      gametreeDebug(DEBUG_SCOPE, "using-fallback-size", {
        observedSize: { width, height },
        fallbackSize: { width: stableWidth, height: stableHeight },
      });
    }

    if (!nowUsingFallback && usingFallbackRef.current) {
      gametreeDebug(DEBUG_SCOPE, "recovered-from-fallback-size", {
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

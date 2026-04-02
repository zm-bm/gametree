import { useCallback, useEffect, useRef } from "react";
import { useParentSize } from "@visx/responsive";

type Size = {
  width: number;
  height: number;
};

const REMEASURE_MAX_ATTEMPTS = 8;

export function useStableParentSize() {
  const { parentRef, width, height, resize } = useParentSize();
  const lastGoodSizeRef = useRef<Size>({ width: 0, height: 0 });

  useEffect(() => {
    if (width > 0 && height > 0) {
      lastGoodSizeRef.current = { width, height };
    }
  }, [width, height]);

  const remeasureParent = useCallback(() => {
    const el = parentRef.current;
    if (!el) return false;

    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;

    resize({
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
    });
    return true;
  }, [parentRef, resize]);

  const scheduleRemeasure = useCallback((attempt = 0) => {
    requestAnimationFrame(() => {
      const didMeasure = remeasureParent();
      if (!didMeasure && attempt < REMEASURE_MAX_ATTEMPTS) {
        scheduleRemeasure(attempt + 1);
      }
    });
  }, [remeasureParent]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) return;
      scheduleRemeasure();
    };

    const handlePageShow = () => {
      scheduleRemeasure();
    };

    const handleWindowFocus = () => {
      scheduleRemeasure();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleWindowFocus);

    // Kick once on mount to recover if initial observer measurement was zero.
    scheduleRemeasure();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [scheduleRemeasure]);

  useEffect(() => {
    if (width > 0 && height > 0) return;
    if (lastGoodSizeRef.current.width === 0 || lastGoodSizeRef.current.height === 0) return;
    scheduleRemeasure();
  }, [width, height, scheduleRemeasure]);

  const stableWidth = width > 0 ? width : lastGoodSizeRef.current.width;
  const stableHeight = height > 0 ? height : lastGoodSizeRef.current.height;

  return {
    parentRef,
    width: stableWidth,
    height: stableHeight,
  };
}

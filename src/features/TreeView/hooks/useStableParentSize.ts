import { useCallback, useEffect, useRef } from "react";
import { useParentSize } from "@visx/responsive";

type Size = {
  width: number;
  height: number;
};

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
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    resize({
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
    });
  }, [parentRef, resize]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) return;
      requestAnimationFrame(() => remeasureParent());
    };

    const handlePageShow = () => {
      requestAnimationFrame(() => remeasureParent());
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [remeasureParent]);

  const stableWidth = width > 0 ? width : lastGoodSizeRef.current.width;
  const stableHeight = height > 0 ? height : lastGoodSizeRef.current.height;

  return {
    parentRef,
    width: stableWidth,
    height: stableHeight,
  };
}

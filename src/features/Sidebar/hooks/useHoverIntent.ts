import { useCallback, useEffect, useRef } from "react";
import type { MouseEvent } from "react";

import { useAppDispatch } from "@/store";
import { ui } from "@/store/slices";

const DEFAULT_ENTER_DELAY_MS = 200;
const DEFAULT_LEAVE_DELAY_MS = 200;

type UseHoverIntentOptions = {
  enterDelayMs?: number;
  leaveDelayMs?: number;
};

type UseHoverIntentResult = {
  onMouseEnter: (e: MouseEvent<HTMLElement>) => void;
  onMouseLeave: () => void;
};

export function useHoverIntent({
  enterDelayMs = DEFAULT_ENTER_DELAY_MS,
  leaveDelayMs = DEFAULT_LEAVE_DELAY_MS,
}: UseHoverIntentOptions = {}): UseHoverIntentResult {
  const dispatch = useAppDispatch();
  const hoverEnterTimeoutRef = useRef<number | null>(null);
  const hoverLeaveTimeoutRef = useRef<number | null>(null);

  const clearHoverEnterTimeout = useCallback(() => {
    if (hoverEnterTimeoutRef.current === null) return;
    window.clearTimeout(hoverEnterTimeoutRef.current);
    hoverEnterTimeoutRef.current = null;
  }, []);

  const clearHoverLeaveTimeout = useCallback(() => {
    if (hoverLeaveTimeoutRef.current === null) return;
    window.clearTimeout(hoverLeaveTimeoutRef.current);
    hoverLeaveTimeoutRef.current = null;
  }, []);

  const onMouseEnter = useCallback((e: MouseEvent<HTMLElement>) => {
    clearHoverLeaveTimeout();
    clearHoverEnterTimeout();
    const hoverId = e.currentTarget.getAttribute("data-id");
    hoverEnterTimeoutRef.current = window.setTimeout(() => {
      dispatch(ui.actions.setHover(hoverId));
      hoverEnterTimeoutRef.current = null;
    }, enterDelayMs);
  }, [clearHoverLeaveTimeout, clearHoverEnterTimeout, dispatch, enterDelayMs]);

  const onMouseLeave = useCallback(() => {
    clearHoverEnterTimeout();
    clearHoverLeaveTimeout();
    hoverLeaveTimeoutRef.current = window.setTimeout(() => {
      dispatch(ui.actions.setHover(null));
      hoverLeaveTimeoutRef.current = null;
    }, leaveDelayMs);
  }, [clearHoverEnterTimeout, clearHoverLeaveTimeout, dispatch, leaveDelayMs]);

  useEffect(() => {
    return () => {
      clearHoverEnterTimeout();
      clearHoverLeaveTimeout();
    };
  }, [clearHoverEnterTimeout, clearHoverLeaveTimeout]);

  return {
    onMouseEnter,
    onMouseLeave,
  };
}

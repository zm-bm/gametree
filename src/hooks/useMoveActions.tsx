import { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

import { AppDispatch } from "../store";
import { GotoFirstMove, GotoLastMove, GotoNextMove, GotoPreviousMove } from "../thunks";

const throttleTime = 200; // milliseconds

export const useMoveActions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const lastTime = useRef(0);

  function throttle() {
    const now = Date.now();
    if (now - lastTime.current > throttleTime) {
      lastTime.current = now;
      return false;
    }
    return true;
  }
  
  const clear = useCallback(() => {
    lastTime.current = 0;
  }, []);

  const undo = useCallback(() => {
    if (throttle()) return;
    dispatch(GotoPreviousMove());
  }, [dispatch]);

  const redo = useCallback(() => {
    if (throttle()) return;
    dispatch(GotoNextMove());
  }, [dispatch]);

  const rewind = useCallback(() => {
    if (throttle()) return;
    dispatch(GotoFirstMove());
  }, [dispatch]);

  const forward = useCallback(() => {
    if (throttle()) return;
    dispatch(GotoLastMove());
  }, [dispatch]);

  return { undo, redo, rewind, forward, clear };
}

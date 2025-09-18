import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { AppDispatch } from "@/store";
import { nav } from "@/store/slices";

let prev = 0;
const THROTTLE_MS = 333;

export const useKeyboardActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const now = Date.now();
      if (now - prev < THROTTLE_MS) return;
      prev = now;
      switch (event.key) {
        case 'ArrowUp':
          dispatch(nav.actions.navigatePrevSibling());
          break;
        case 'ArrowDown':
          dispatch(nav.actions.navigateNextSibling());
          break;
        case 'ArrowLeft':
          dispatch(nav.actions.navigateUp());
          break;
        case 'ArrowRight':
          dispatch(nav.actions.navigateDown());
          break;
        default:
          break;
      }
    };
    const handleKeyUp = () => { prev = 0; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [dispatch]);
};

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { AppDispatch } from "../store";
import { nav } from "../store/slices";

export const useKeyboardActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch]);
};

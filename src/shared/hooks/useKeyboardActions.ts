import { useEffect } from "react";

import { useAppDispatch } from "../../store";
import { nav } from "../../store/slices";

let prev = 0;
const THROTTLE_MS = 333;

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;

  if (target.isContentEditable) return true;

  const tag = target.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;

  if (tag === "INPUT") {
    const input = target as HTMLInputElement;
    const type = input.type.toLowerCase();

    // Let text-entry and numeric controls keep native arrow behavior.
    return ["text", "search", "email", "url", "tel", "password", "number", "range"].includes(type);
  }

  return false;
};

const isArrowOwningTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;

  return Boolean(
    target.closest(
      [
        "[role='radio']",
        "[role='slider']",
        "[role='spinbutton']",
        "[role='listbox']",
        "[role='textbox']",
        "[contenteditable='true']",
      ].join(","),
    ),
  );
};

const shouldHandleArrowNav = (event: KeyboardEvent) => {
  if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    return false;
  }

  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
    return false;
  }

  if (isEditableTarget(event.target) || isArrowOwningTarget(event.target)) {
    return false;
  }

  return true;
};

export const useKeyboardActions = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!shouldHandleArrowNav(event)) return;

      // Consume browser scrolling only for app-level arrow navigation.
      event.preventDefault();

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

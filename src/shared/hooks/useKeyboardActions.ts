import { useEffect } from "react";
import { useSelector } from "react-redux";

import { useAppDispatch } from "@/store";
import { selectCurrentVisibleId } from "@/store/selectors";
import { nav, tree, ui } from "@/store/slices";

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
  if (!["arrowup", "arrowdown", "arrowleft", "arrowright", "h", "j", "k", "l"].includes(event.key.toLowerCase())) {
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


const shouldHandleGlobalShortcut = (event: KeyboardEvent) => {
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

  const currentVisibleId = useSelector(selectCurrentVisibleId);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (shouldHandleArrowNav(event)) {
        // Consume browser scrolling only for app-level arrow navigation.
        event.preventDefault();

        const now = Date.now();
        if (now - prev < THROTTLE_MS) return;
        prev = now;

        switch (key) {
          case 'arrowup':
          case 'k':
            dispatch(nav.actions.navigatePrevSibling());
            return;
          case 'arrowdown':
          case 'j':
            dispatch(nav.actions.navigateNextSibling());
            return;
          case 'arrowleft':
          case 'h':
            dispatch(nav.actions.navigateUp());
            return;
          case 'arrowright':
          case 'l':
            dispatch(nav.actions.navigateDown());
            return;
          default:
            return;
        }
      }

      if (!shouldHandleGlobalShortcut(event) || event.repeat) return;

      switch (key) {
        case 'e':
          event.preventDefault();
          dispatch(ui.actions.toggleEngine());
          return;
        case 'p':
          if (!currentVisibleId) return;
          event.preventDefault();
          dispatch(tree.actions.toggleNodePinned(currentVisibleId));
          return;
        default:
          return;
      }
    };
    const handleKeyUp = () => { prev = 0; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [dispatch, currentVisibleId]);
};

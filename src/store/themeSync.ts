import { AppDispatch } from "./index";
import { ui } from "./slices";

type ThemeSyncCleanup = () => void;

export function initializeThemeSync(dispatch: AppDispatch): ThemeSyncCleanup {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  const root = document.documentElement;
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const emitDarkMode = () => {
    const hasDarkClass = root.classList.contains("dark");
    dispatch(ui.actions.setIsDarkMode(hasDarkClass || mediaQuery.matches));
  };

  emitDarkMode();

  const classObserver = new MutationObserver(emitDarkMode);
  classObserver.observe(root, { attributes: true, attributeFilter: ["class"] });

  mediaQuery.addEventListener("change", emitDarkMode);

  return () => {
    classObserver.disconnect();
    mediaQuery.removeEventListener("change", emitDarkMode);
  };
}

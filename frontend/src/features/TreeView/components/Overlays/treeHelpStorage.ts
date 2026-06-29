const HELP_SEEN_STORAGE_KEY = "gtTreeHelpSeen";
const HINT_DISMISSED_STORAGE_KEY = "gtTreeHintDismissed";

const hasStorageFlag = (key: string) => {
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
};

const setStorageFlag = (key: string) => {
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    // Ignore storage failures; the current session can still update UI state.
  }
};

export const getShouldShowTreeHint = () => (
  !hasStorageFlag(HELP_SEEN_STORAGE_KEY) &&
  !hasStorageFlag(HINT_DISMISSED_STORAGE_KEY)
);

export const markTreeHintDismissed = () => setStorageFlag(HINT_DISMISSED_STORAGE_KEY);

export const markTreeHelpSeen = () => setStorageFlag(HELP_SEEN_STORAGE_KEY);

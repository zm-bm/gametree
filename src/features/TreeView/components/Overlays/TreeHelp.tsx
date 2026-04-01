import { useCallback, useEffect, useState } from "react";

import { HelpModal } from "./HelpModal";

const HELP_SEEN_STORAGE_KEY = "gtTreeHelpSeen";

const getShouldAutoOpenHelp = () => {
  return localStorage.getItem(HELP_SEEN_STORAGE_KEY) !== "1";
};

export const TreeHelp = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (getShouldAutoOpenHelp()) {
      setIsOpen(true);
    }
  }, []);

  const openHelp = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeHelp = useCallback(() => {
    localStorage.setItem(HELP_SEEN_STORAGE_KEY, "1");
    setIsOpen(false);
  }, []);

  return (
    <>
      <button
        type="button"
        className="treeview-card px-3 py-1.5 text-sm font-semibold interactive-treeview"
        aria-label="Open help"
        onClick={openHelp}
      >
        Help
      </button>

      <HelpModal
        isOpen={isOpen}
        title="Tree Help"
        onClose={closeHelp}
      >
        <section>
          <h3 className="text-sm font-semibold mb-1">How it works</h3>
          <p className="text-lightmode-800/90 dark:text-darkmode-200/90">
            Placeholder: explain how move trees are built and how filters change what is shown.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold mb-1">Reading a node</h3>
          <p className="text-lightmode-800/90 dark:text-darkmode-200/90">
            Placeholder: explain node labels, frequencies, win-rate bars, and edge styles.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold mb-1">Keyboard shortcuts</h3>
          <p className="text-lightmode-800/90 dark:text-darkmode-200/90">
            Placeholder: summarize tree navigation keys and quick actions.
          </p>
        </section>
      </HelpModal>
    </>
  );
};

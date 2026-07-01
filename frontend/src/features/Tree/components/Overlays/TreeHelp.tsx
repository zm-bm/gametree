import { useCallback, useState } from "react";

import { HelpModal } from "./HelpModal";
import { TreeHelpContent } from "./TreeHelpContent";
import { TreeHelpHint } from "./TreeHelpHint";
import {
  getShouldShowTreeHint,
  markTreeHelpSeen,
  markTreeHintDismissed,
} from "./treeHelpStorage";

export const TreeHelp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(getShouldShowTreeHint);

  const dismissHint = useCallback(() => {
    markTreeHintDismissed();
    setShowHint(false);
  }, []);

  const openHelp = useCallback(() => {
    dismissHint();
    setIsOpen(true);
  }, [dismissHint]);

  const closeHelp = useCallback(() => {
    markTreeHelpSeen();
    setIsOpen(false);
  }, []);

  return (
    <>
      <div className="relative flex flex-col items-end">
        <button
          type="button"
          className="gt-tree-panel px-3 py-1.5 text-sm font-semibold gt-treeview-hoverable"
          aria-label="Open help"
          onClick={openHelp}
        >
          Help
        </button>

        {showHint && (
          <TreeHelpHint
            onDismiss={dismissHint}
            onLearn={openHelp}
          />
        )}
      </div>

      <HelpModal
        isOpen={isOpen}
        title="Tree Help"
        onClose={closeHelp}
        maxWidthClassName="max-w-4xl"
      >
        <TreeHelpContent />
      </HelpModal>
    </>
  );
};

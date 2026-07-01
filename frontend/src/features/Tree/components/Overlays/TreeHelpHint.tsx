import { cn } from "@/shared/cn";

const TREE_HINT_TITLE = "Explore the tree";
const TREE_HINT_BODY = "Click a move to follow it, or use the board HUD to play legal moves that are not visible yet.";

type TreeHelpHintProps = {
  onDismiss: () => void;
  onLearn: () => void;
};

export const TreeHelpHint = ({
  onDismiss,
  onLearn,
}: TreeHelpHintProps) => (
  <section
    role="note"
    aria-label="Tree explorer hint"
    className={cn([
      "absolute right-0 top-[calc(100%+0.5rem)] z-50 gt-tree-panel",
      "w-[min(20rem,calc(100vw-1rem))] p-3",
      "text-sm leading-5 text-lightmode-800 dark:text-darkmode-100",
    ])}
  >
    <h2 className="text-sm font-semibold text-lightmode-900 dark:text-darkmode-50">
      {TREE_HINT_TITLE}
    </h2>
    <p className="mt-1 text-sm text-lightmode-800/90 dark:text-darkmode-100/85">
      {TREE_HINT_BODY}
    </p>
    <div className="mt-3 flex justify-end gap-2">
      <button
        type="button"
        className="gt-tree-panel px-2.5 py-1 text-sm font-semibold gt-treeview-hoverable"
        onClick={onDismiss}
      >
        Got it
      </button>
      <button
        type="button"
        className="gt-tree-panel px-2.5 py-1 text-sm font-semibold gt-treeview-hoverable"
        onClick={onLearn}
      >
        Learn
      </button>
    </div>
  </section>
);

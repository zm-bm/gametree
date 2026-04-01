import { cn } from "@/shared/lib/cn";
import { TreeOverlayCard } from "./TreeOverlayCard";

const keyClass = cn([
  "inline-flex items-center justify-center min-w-6 h-6 px-1 rounded",
  "text-[14px] font-semibold leading-none",
  "border border-lightmode-900/30 dark:border-darkmode-100/30",
  "bg-lightmode-200/60 dark:bg-darkmode-800/60",
  "text-lightmode-800 dark:text-darkmode-100",
]);

const rowClass = "flex items-center justify-between gap-4 text-sm leading-5";
const sectionLabelClass = "text-sm font-semibold pb-1";

const KeyCombo = ({ keys }: { keys: string[] }) => (
  <span className="inline-flex items-center gap-1">
    {keys.map((key) => (
      <kbd key={key} className={keyClass}>{key}</kbd>
    ))}
  </span>
);

export const TreeHotkeys = () => {
  return (
    <TreeOverlayCard
      title="Hotkeys"
      persistKey="gtHotkeysCollapsed"
      maxHeight="max-h-80"
    >
      <div className="space-y-2">
        <div className={sectionLabelClass}>Tree Navigation</div>

        <div className={rowClass}>
          <span>Previous sibling</span>
          <KeyCombo keys={["↑", "k"]} />
        </div>
        <div className={rowClass}>
          <span>Next sibling</span>
          <KeyCombo keys={["↓", "j"]} />
        </div>
        <div className={rowClass}>
          <span>Go to parent</span>
          <KeyCombo keys={["←", "h"]} />
        </div>
        <div className={rowClass}>
          <span>Go deeper / child</span>
          <KeyCombo keys={["→", "l"]} />
        </div>

        <div className={sectionLabelClass}>Actions</div>

        <div className={rowClass}>
          <span>Toggle engine</span>
          <KeyCombo keys={["e"]} />
        </div>
        <div className={rowClass}>
          <span>Pin / unpin current</span>
          <KeyCombo keys={["p"]} />
        </div>
      </div>
    </TreeOverlayCard>
  );
};

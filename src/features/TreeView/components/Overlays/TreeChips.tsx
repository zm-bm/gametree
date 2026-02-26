import { useSelector } from "react-redux";

import { RootState } from "@/store";
import { selectTreeFrequencyMin, selectTreeSource } from "@/store/selectors";

const chipClass = "treeview-card px-2 py-1 cursor-default interactive-treeview";

export const TreeChips = () => {
  const source = useSelector((s: RootState) => selectTreeSource(s));
  const frequencyMin = useSelector((s: RootState) => selectTreeFrequencyMin(s));

  return (
    <div className="flex flex-row items-center gap-2 text-xs">
      <div className={chipClass}>
        {source.charAt(0).toUpperCase() + source.slice(1)} games
      </div>
      <div className={chipClass}>
        Moves ≥ {frequencyMin}%
      </div>
    </div>
  );
};

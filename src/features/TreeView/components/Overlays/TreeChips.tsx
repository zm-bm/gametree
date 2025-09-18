import { useSelector } from "react-redux";

import { RootState } from "@/store";
import { selectTreeFrequencyMin, selectTreeSource } from "@/store/selectors";

export const TreeChips = () => {
  const source = useSelector((s: RootState) => selectTreeSource(s));
  const frequencyMin = useSelector((s: RootState) => selectTreeFrequencyMin(s));

  return (
    <div className="flex flex-row gap-2 text-xs *:px-1.5 *:py-0.5">
      <div className="treeview-card select-none">
        Games: {source === 'lichess' ? 'Lichess' : 'Masters'}
      </div>
      <div className="treeview-card select-none">
        Moves {`≥${frequencyMin}`}%
      </div>
    </div>
  );
};

import { useSelector } from "react-redux";

import { RootState } from "@/store";
import { selectTreeFrequencyMin, selectTreeSource } from "@/store/selectors";

interface Props {
  openingsError?: boolean;
}

export const TreeChips = ({ openingsError = false }: Props) => {
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
      {openingsError && (
        <div className="treeview-card select-none border border-red-500/40 text-red-300">
          Openings unavailable
        </div>
      )}
    </div>
  );
};

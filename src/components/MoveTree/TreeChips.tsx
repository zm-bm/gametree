import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { selectTreeFrequencyMin, selectTreeSource } from "../../store/selectors";

export const TreeChips = () => {
  const source = useSelector((s: RootState) => selectTreeSource(s));
  const frequencyMin = useSelector((s: RootState) => selectTreeFrequencyMin(s));

  return (
    <>
      <div className="tree-overlay text-xs px-2 py-1 select-none">
        Games: {source === 'lichess' ? 'Lichess' : 'Masters'}
      </div>
      <div className="tree-overlay text-xs px-2 py-1 select-none">
        Moves {`≥${frequencyMin}`}%
      </div>
    </>
  );
};

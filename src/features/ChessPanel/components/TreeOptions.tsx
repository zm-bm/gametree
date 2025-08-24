import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ui } from "@/store/slices";
import { selectTreeFrequencyMin, selectTreeSource } from "@/store/selectors";
import { RootState } from "@/store";
import { CollapsibleCard } from "./CollapsibleCard";

const TreeOptions = () => {
  const dispatch = useDispatch();
  const source = useSelector((s: RootState) => selectTreeSource(s));
  const minFrequency = useSelector((state: RootState) => selectTreeFrequencyMin(state));
  const preventDefault = useCallback((e: React.KeyboardEvent) => e.preventDefault(), []);

  const selectLichess = useCallback(() => {
    dispatch(ui.actions.setTreeSource('lichess'));
  }, [dispatch]);

  const selectMasters = useCallback(() => {
    dispatch(ui.actions.setTreeSource('masters'));
  }, [dispatch]);

  const setFrequency = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(ui.actions.setTreeFrequencyMin(parseFloat(e.target.value)));
  }, [dispatch]);

  return (
    <CollapsibleCard header={<span className="font-semibold tracking-tight">Tree Options</span>}>
      {/* Data source radio input */}
      <div className="border-t border-white/5 dark:border-white/10 p-4 space-y-1">
        <div className="text-xs text-slate-400 dark:text-zinc-400 mb-1">Data Source</div>
        <label className="group flex items-center gap-2 text-sm rounded px-1 transition-colors hover:bg-white/5 cursor-pointer">
          <input
            type="radio"
            name="src"
            className="accent-sky-500 dark:accent-sky-400"
            checked={source === 'masters'}
            onKeyDown={preventDefault}
            onChange={selectMasters}
          />
          <span className="text-slate-300 dark:text-zinc-200 font-medium">Masters games</span>
        </label>
        <label className="group flex items-center gap-2 text-sm rounded px-1 transition-colors hover:bg-white/5 cursor-pointer">
          <input
            type="radio"
            name="src"
            className="accent-sky-500 dark:accent-sky-400"
            checked={source === 'lichess'}
            onKeyDown={preventDefault}
            onChange={selectLichess}
          />
          <span className="text-slate-300 dark:text-zinc-200 font-medium">Lichess games</span>
        </label>
      </div>

      {/* Move frequency filter slider */}
      <div className="border-t border-white/5 dark:border-white/10 p-4">
        <div className="text-xs text-slate-400 dark:text-zinc-400 mb-1">
          Move Frequency Filter
        </div>
        <input
          type="range"
          min={0}
          max={20}
          step={0.1}
          value={minFrequency}
          onChange={setFrequency}
          onKeyDown={preventDefault}
          className="w-full appearance-none h-1.5 rounded-full
          bg-white/80 dark:bg-white/10
          ring-1 ring-inset ring-black/10 dark:ring-white/10
          accent-sky-500 dark:accent-sky-400"
        />
        <div className="mt-1 text-xs text-slate-400 dark:text-zinc-400 flex justify-between select-none">
          <span>0%</span>
          <span className="px-1.5 py-0.5 -mt-1 rounded-md tabular-nums text-slate-50 font-semibold
                ring-1 ring-sky-500/60 dark:ring-sky-400/60 shadow-sm
                ">{minFrequency}%</span>
          <span>20%</span>
        </div>
      </div>
    </CollapsibleCard>
  );
};

export default TreeOptions;

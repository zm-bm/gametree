import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ui } from "@/store/slices";
import { selectTreeFrequencyMin, selectTreeSource } from "@/store/selectors";
import { RootState } from "@/store";
import { cn } from "@/shared/lib/cn";

const dataSourceLabel = 'flex gap-2 p-1 rounded text-sm font-medium cursor-pointer interactive-sidebar';
const radioInput = 'accent-sky-500 dark:accent-sky-400 cursor-pointer';

const TreeOptions = ({ className }: { className?: string }) => {
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
    <div className={className}>
      {/* Data source radio input */}
      <div>
        <div className="text-xs text-secondary mb-1">Data Source</div>
        <label className={cn(dataSourceLabel)}>
          <input
            type="radio"
            name="src"
            className={cn(radioInput)}
            checked={source === 'masters'}
            onKeyDown={preventDefault}
            onChange={selectMasters}
          />
          <span>Masters games</span>
        </label>
        <label className={cn(dataSourceLabel)}>
          <input
            type="radio"
            name="src"
            className={cn(radioInput)}
            checked={source === 'lichess'}
            onKeyDown={preventDefault}
            onChange={selectLichess}
          />
          <span>Lichess games</span>
        </label>
      </div>

      {/* Move frequency filter slider */}
      <div>
        <div className="text-xs text-secondary mb-1">
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
          className={cn([
            'w-full appearance-none h-1.5 rounded-full cursor-pointer',
            'bg-lightmode-300 dark:bg-darkmode-300',
            'hover:bg-lightmode-100 dark:hover:bg-darkmode-100',
            'accent-sky-500',
          ])}
        />
        <div className="mt-1 text-xs text-secondary flex justify-between select-none">
          <span>0%</span>
          <span className={cn([
            'px-2 py-1 -mt-1 rounded-md shadow-md',
            'font-semibold text-primary tabular-nums',
            'bg-gradient-to-br from-lightmode-600 to-lightmode-700',
            'dark:from-darkmode-700 dark:to-darkmode-800',
            'ring-1 ring-sky-400/20 dark:ring-sky-600/20',
          ])}>
            {minFrequency}%
          </span>
          <span>20%</span>
        </div>
      </div>
    </div>
  );
};

export default TreeOptions;

import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { RootState, useAppDispatch } from "@/store";
import { selectTreeFrequencyMin, selectTreeSource } from "@/store/selectors";
import { ui } from "@/store/slices";
import { cn } from "@/shared/lib/cn";

const dataSourceLabel = "flex gap-2 p-1 rounded text-sm font-medium cursor-pointer interactive-treeview";
const radioInput = "accent-sky-500 dark:accent-sky-400 cursor-pointer";

export const TreeOptionsOverlay = () => {
  const dispatch = useAppDispatch();
  const source = useSelector((s: RootState) => selectTreeSource(s));
  const minFrequency = useSelector((s: RootState) => selectTreeFrequencyMin(s));
  const [isCollapsed, setIsCollapsed] = useState(localStorage.gtTreeOptionsCollapsed === "1");

  const preventDefault = useCallback((e: React.KeyboardEvent) => e.preventDefault(), []);
  const toggleCollapsed = useCallback(() => {
    localStorage.gtTreeOptionsCollapsed = isCollapsed ? "" : "1";
    setIsCollapsed((prev) => !prev);
  }, [isCollapsed]);

  const selectLichess = useCallback(() => {
    dispatch(ui.actions.setTreeSource("lichess"));
  }, [dispatch]);

  const selectMasters = useCallback(() => {
    dispatch(ui.actions.setTreeSource("masters"));
  }, [dispatch]);

  const setFrequency = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(ui.actions.setTreeFrequencyMin(parseFloat(e.target.value)));
  }, [dispatch]);

  const arrowStyle = useMemo(() => ({
    transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)",
  }), [isCollapsed]);

  return (
    <div className="treeview-card min-w-[14rem] select-none">
      <div
        className="px-3 py-2 flex justify-between items-center cursor-pointer interactive-treeview"
        onClick={toggleCollapsed}
      >
        <div className="text-sm font-bold">Tree Options</div>
        <div className="text-sm transition-transform duration-300" style={arrowStyle}>▲</div>
      </div>

      <div
        className={cn(
          "treeview-divider transition-all duration-300 ease-in-out overflow-hidden",
          isCollapsed ? "max-h-0 opacity-0" : "max-h-60 opacity-100",
        )}
      >
        <div>
          <div className="text-xs text-secondary mb-1">Data Source</div>
          <label className={cn(dataSourceLabel)}>
            <input
              type="radio"
              name="src"
              className={cn(radioInput)}
              checked={source === "masters"}
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
              checked={source === "lichess"}
              onKeyDown={preventDefault}
              onChange={selectLichess}
            />
            <span>Lichess games</span>
          </label>
        </div>

        <div>
          <div className="text-xs text-secondary mb-1">Move Frequency Filter</div>
          <input
            type="range"
            min={0}
            max={20}
            step={0.1}
            value={minFrequency}
            onChange={setFrequency}
            onKeyDown={preventDefault}
            className={cn([
              "w-full appearance-none h-1.5 rounded-full cursor-pointer",
              "bg-lightmode-300 dark:bg-darkmode-300",
              "hover:bg-lightmode-100 dark:hover:bg-darkmode-100",
              "accent-sky-500",
            ])}
          />
          <div className="mt-1 text-xs text-secondary flex justify-between select-none">
            <span>0%</span>
            <span className={cn([
              "px-2 py-1 -mt-1 rounded-md shadow-md",
              "font-semibold text-primary tabular-nums",
              "bg-gradient-to-br from-lightmode-600 to-lightmode-700",
              "dark:from-darkmode-700 dark:to-darkmode-800",
              "ring-1 ring-sky-400/20 dark:ring-sky-600/20",
            ])}>
              {minFrequency}%
            </span>
            <span>20%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

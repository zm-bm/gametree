import { useCallback } from "react";
import { useSelector } from "react-redux";

import { RootState, useAppDispatch } from "@/store";
import {
  selectTreeFrequencyMin,
  selectTreeSource,
  selectTreeTopMoves,
  selectTreeWinRateScale,
} from "@/store/selectors";
import { ui } from "@/store/slices";
import { cn } from "@/shared/lib/cn";
import { TreeOverlayCard } from "./TreeOverlayCard";

const dataSourceLabel = "flex gap-2 p-1 rounded text-sm font-medium cursor-pointer interactive-treeview";
const dataSourceActive = "bg-lightmode-900/10 dark:bg-darkmode-100/10";
const radioInput = "accent-sky-500 dark:accent-sky-400 cursor-pointer";
const sectionLabel = "text-sm font-semibold pb-1";
const scaleLabel = "text-xs text-lightmode-500 dark:text-darkmode-400";

export const TreeOptionsOverlay = () => {
  const dispatch = useAppDispatch();
  const source = useSelector((s: RootState) => selectTreeSource(s));
  const minFrequency = useSelector((s: RootState) => selectTreeFrequencyMin(s));
  const topMoves = useSelector((s: RootState) => selectTreeTopMoves(s));
  const winRateScale = useSelector((s: RootState) => selectTreeWinRateScale(s));

  const preventDefault = useCallback((e: React.KeyboardEvent) => e.preventDefault(), []);

  const selectOtb = useCallback(() => {
    dispatch(ui.actions.setTreeSource("otb"));
  }, [dispatch]);

  const selectOnline = useCallback(() => {
    dispatch(ui.actions.setTreeSource("online"));
  }, [dispatch]);

  const setFrequency = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(ui.actions.setTreeFrequencyMin(parseFloat(e.target.value)));
  }, [dispatch]);

  const setTopMoves = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsed = parseInt(value, 10);
    dispatch(ui.actions.setTreeTopMoves(Number.isNaN(parsed) ? 0 : Math.max(0, parsed)));
  }, [dispatch]);

  const setWinRateScaleRelative = useCallback(() => {
    dispatch(ui.actions.setTreeWinRateScale("relative"));
  }, [dispatch]);

  const setWinRateScaleAbsolute = useCallback(() => {
    dispatch(ui.actions.setTreeWinRateScale("absolute"));
  }, [dispatch]);

  return (
    <TreeOverlayCard
      title="Tree Options"
      persistKey="gtTreeOptionsCollapsed"
      maxHeight="max-h-120"
    >
      <div>
        <div className={sectionLabel}>Data Source</div>
        <label className={cn(dataSourceLabel, source === "otb" && dataSourceActive)}>
          <input
            type="radio"
            name="src"
            className={cn(radioInput)}
            checked={source === "otb"}
            onKeyDown={preventDefault}
            onChange={selectOtb}
          />
          <span>OTB (masters)</span>
        </label>
        <label className={cn(dataSourceLabel, source === "online" && dataSourceActive)}>
          <input
            type="radio"
            name="src"
            className={cn(radioInput)}
            checked={source === "online"}
            onKeyDown={preventDefault}
            onChange={selectOnline}
          />
          <span>Online games</span>
        </label>
      </div>

      <div>
        <div className={sectionLabel}>Move Frequency Filter</div>
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
            "hover:bg-lightmode-500/50 dark:hover:bg-darkmode-100",
            "accent-sky-500",
          ])}
        />
        <div className={cn("mt-2 flex justify-between select-none", scaleLabel)}>
          <span>0%</span>
          <span className={cn([
            "min-w-[2.5rem] px-2 py-1 -mt-1 rounded-md shadow-sm text-center",
            "font-semibold tabular-nums text-lightmode-800 dark:text-darkmode-100",
            "bg-gradient-to-br from-lightmode-200 to-lightmode-300",
            "dark:from-darkmode-700 dark:to-darkmode-800",
            "ring-1 ring-lightmode-500/25 dark:ring-sky-600/20",
          ])}>
            {minFrequency}%
          </span>
          <span>20%</span>
        </div>
      </div>

      <div>
        <div className={sectionLabel}>Top N Moves</div>
        <input
          type="number"
          min={0}
          step={1}
          value={topMoves}
          onChange={setTopMoves}
          className={cn([
            "w-full px-2 py-1 rounded-md text-sm",
            "bg-lightmode-100 dark:bg-darkmode-700",
            "text-lightmode-900 dark:text-darkmode-100",
            "ring-1 ring-lightmode-500/20 dark:ring-darkmode-200/20",
          ])}
        />
        <div className={cn("mt-1", scaleLabel)}>0 = show all moves</div>
      </div>

      <div>
        <div className={sectionLabel}>Win % Scale</div>
        <label className={cn(dataSourceLabel, winRateScale === "relative" && dataSourceActive)}>
          <input
            type="radio"
            name="win-rate-scale"
            className={cn(radioInput)}
            checked={winRateScale === "relative"}
            onKeyDown={preventDefault}
            onChange={setWinRateScaleRelative}
          />
          <span>Relative to parent branch</span>
        </label>
        <label className={cn(dataSourceLabel, winRateScale === "absolute" && dataSourceActive)}>
          <input
            type="radio"
            name="win-rate-scale"
            className={cn(radioInput)}
            checked={winRateScale === "absolute"}
            onKeyDown={preventDefault}
            onChange={setWinRateScaleAbsolute}
          />
          <span>Absolute vs 50/50 baseline</span>
        </label>
      </div>
    </TreeOverlayCard>
  );
};

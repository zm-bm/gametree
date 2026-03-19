import { useCallback } from "react";
import { useSelector } from "react-redux";

import { RootState, useAppDispatch } from "@/store";
import {
  selectTreeMinFrequencyPct,
  selectTreeMoveLimit,
  selectTreeSource,
  selectTreeWinRateComparison,
} from "@/store/selectors";
import { ui } from "@/store/slices";
import { cn } from "@/shared/lib/cn";
import { TreeOverlayCard } from "./TreeOverlayCard";

const dataSourceLabel = "flex gap-2 p-1 rounded text-sm font-medium cursor-pointer interactive-treeview";
const dataSourceActive = "bg-lightmode-900/10 dark:bg-darkmode-100/10";
const radioInput = "accent-sky-500 dark:accent-sky-400 cursor-pointer";
const sectionLabel = "text-sm font-semibold";
const scaleLabel = "text-xs text-lightmode-500 dark:text-darkmode-400";

export const TreeOptionsOverlay = () => {
  const dispatch = useAppDispatch();
  const source = useSelector((s: RootState) => selectTreeSource(s));
  const minFrequencyPct = useSelector((s: RootState) => selectTreeMinFrequencyPct(s));
  const moveLimit = useSelector((s: RootState) => selectTreeMoveLimit(s));
  const winRateComparison = useSelector((s: RootState) => selectTreeWinRateComparison(s));
  const moveLimitSliderMax = Math.max(20, moveLimit);

  const preventDefault = useCallback((e: React.KeyboardEvent) => e.preventDefault(), []);

  const selectOtb = useCallback(() => {
    dispatch(ui.actions.setTreeSource("otb"));
  }, [dispatch]);

  const selectOnline = useCallback(() => {
    dispatch(ui.actions.setTreeSource("online"));
  }, [dispatch]);

  const setMinFrequencyPct = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value);
    const safeValue = Number.isNaN(parsed) ? 0 : Math.min(20, Math.max(0, parsed));
    dispatch(ui.actions.setTreeMinFrequencyPct(safeValue));
  }, [dispatch]);

  const setMoveLimit = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsed = parseInt(value, 10);
    dispatch(ui.actions.setTreeMoveLimit(Number.isNaN(parsed) ? 0 : Math.max(0, parsed)));
  }, [dispatch]);

  const setWinRateComparisonRelative = useCallback(() => {
    dispatch(ui.actions.setTreeWinRateComparison("relative"));
  }, [dispatch]);

  const setWinRateComparisonAbsolute = useCallback(() => {
    dispatch(ui.actions.setTreeWinRateComparison("absolute"));
  }, [dispatch]);

  return (
    <TreeOverlayCard
      title="Tree Options"
      persistKey="gtTreeOptionsCollapsed"
      maxHeight="max-h-[100rem]"
    >
      <div>
        <div className={cn(sectionLabel, 'pb-1')}>Data Source</div>
        <label className={cn(dataSourceLabel, source === "otb" && dataSourceActive)}>
          <input
            type="radio"
            name="src"
            className={cn(radioInput)}
            checked={source === "otb"}
            onKeyDown={preventDefault}
            onChange={selectOtb}
          />
          <span title="Games played over the board">OTB (1800+ players)</span>
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
          <span title="Games played online">Online (1800+ players)</span>
        </label>
        <label className={cn(dataSourceLabel, source === "online" && dataSourceActive)}>
          <input
            type="radio"
            name="src"
            className={cn(radioInput)}
            onKeyDown={preventDefault}
            onChange={() => {}}
            disabled
          />
          <span title="All games played on lichess">Lichess (coming soon!)</span>
        </label>
      </div>

      <div>
        <div className={cn(sectionLabel, 'pb-1')}>Win Rate Comparison</div>
        <label className={cn(dataSourceLabel, winRateComparison === "relative" && dataSourceActive)}>
          <input
            type="radio"
            name="win-rate-comparison"
            className={cn(radioInput)}
            checked={winRateComparison === "relative"}
            onKeyDown={preventDefault}
            onChange={setWinRateComparisonRelative}
          />
          <span>Relative</span>
        </label>
        <label className={cn(dataSourceLabel, winRateComparison === "absolute" && dataSourceActive)}>
          <input
            type="radio"
            name="win-rate-comparison"
            className={cn(radioInput)}
            checked={winRateComparison === "absolute"}
            onKeyDown={preventDefault}
            onChange={setWinRateComparisonAbsolute}
          />
          <span>Absolute</span>
        </label>
        <div className={cn("mt-1", scaleLabel)}>
          Edge color mode: Relative vs parent, Absolute vs 50/50.
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div className={sectionLabel}>Min Frequency (%)</div>
          <input
            type="number"
            min={0}
            max={20}
            step={0.5}
            value={minFrequencyPct}
            onChange={setMinFrequencyPct}
            className={cn([
              "tree-number-input h-7 w-[3rem] px-2",
              "text-sm font-semibold text-right tabular-nums",
            ])}
            aria-label="Minimum move frequency percentage"
          />
        </div>
        <input
          type="range"
          min={0}
          max={20}
          step={0.5}
          value={minFrequencyPct}
          onChange={setMinFrequencyPct}
          onKeyDown={preventDefault}
          className={cn([
            "w-full appearance-none h-1.5 rounded-full cursor-pointer",
            "bg-lightmode-300 dark:bg-darkmode-300",
            "hover:bg-lightmode-500/50 dark:hover:bg-darkmode-100",
            "accent-sky-500",
          ])}
        />
        <div className={cn("mt-1", scaleLabel)}>Show moves above this play frequency.</div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div className={sectionLabel}>Move Limit</div>
          <input
            type="number"
            min={0}
            step={1}
            value={moveLimit}
            onChange={setMoveLimit}
            className={cn([
              "tree-number-input h-7 w-[3rem] px-2",
              "text-sm font-semibold text-right tabular-nums",
            ])}
            aria-label="Maximum moves shown per position"
          />
        </div>
        <input
          type="range"
          min={0}
          max={moveLimitSliderMax}
          step={1}
          value={moveLimit}
          onChange={setMoveLimit}
          onKeyDown={preventDefault}
          className={cn([
            "w-full appearance-none h-1.5 rounded-full cursor-pointer",
            "bg-lightmode-300 dark:bg-darkmode-300",
            "hover:bg-lightmode-500/50 dark:hover:bg-darkmode-100",
            "accent-sky-500",
          ])}
        />
        <div className={cn("mt-1", scaleLabel)}>Show up to this many moves per position (0 = all).</div>
      </div>
    </TreeOverlayCard>
  );
};

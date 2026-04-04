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
import { cn } from "@/shared/cn";
import { InfoTooltip } from "@/shared/ui/InfoTooltip";
import { CollapsibleCard } from "@/shared/ui/CollapsibleCard";

const dataSourceLabel = "flex gap-2 p-1 rounded text-sm font-medium cursor-pointer interactive-treeview";
const dataSourceActive = "bg-lightmode-900/10 dark:bg-darkmode-100/10";
const radioInput = "accent-sky-500 dark:accent-sky-400 cursor-pointer";
const sectionLabel = "text-sm font-semibold";

export const TreeSettings = () => {
  const dispatch = useAppDispatch();
  const source = useSelector((s: RootState) => selectTreeSource(s));
  const minFrequencyPct = useSelector((s: RootState) => selectTreeMinFrequencyPct(s));
  const moveLimit = useSelector((s: RootState) => selectTreeMoveLimit(s));
  const winRateComparison = useSelector((s: RootState) => selectTreeWinRateComparison(s));
  const moveLimitSliderMax = Math.max(20, moveLimit);

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
    <CollapsibleCard
      header={<div className="text-sm font-bold">Tree Settings</div>}
      className="treeview-card w-[16rem] select-none"
      headerClassName="px-3 py-2 interactive-treeview"
      contentClassName="treeview-divider"
      maxHeight="max-h-[100rem]"
      persistKey="gtTreeOptionsCollapsed"
    >
      <div>
        <div className={cn(sectionLabel, 'pb-1 flex items-center gap-1')}>
          <span>Data Source</span>
          <InfoTooltip
            ariaLabel="Data source help"
            text="Both datasets are sourced from LumbrasGigabase. The source pool is focused on stronger player games (typically around 1800+)."
          />
        </div>
        <label className={cn(dataSourceLabel, source === "otb" && dataSourceActive)}>
          <input
            type="radio"
            name="src"
            className={cn(radioInput)}
            checked={source === "otb"}
            onChange={selectOtb}
          />
          <span title="In-person tournament and club games">OTB (over the board)</span>
        </label>
        <label className={cn(dataSourceLabel, source === "online" && dataSourceActive)}>
          <input
            type="radio"
            name="src"
            className={cn(radioInput)}
            checked={source === "online"}
            onChange={selectOnline}
          />
          <span title="Games played on internet platforms">Online games</span>
        </label>
        {/* <label className={cn(dataSourceLabel, source === "online" && dataSourceActive)}>
          <input
            type="radio"
            name="src"
            className={cn(radioInput)}
            onKeyDown={preventDefault}
            onChange={() => {}}
            disabled
          />
          <span title="All games played on lichess">Lichess</span>
        </label> */}
      </div>

      <div>
        <div className={cn(sectionLabel, "pb-1 flex items-center gap-1")}>
          <span>Win Rate Mode</span>
          <InfoTooltip
            ariaLabel="Win rate mode help"
            text="Relative compares each move against its parent. Absolute compares each move against a 50/50 baseline."
          />
        </div>
        <label className={cn(dataSourceLabel, winRateComparison === "relative" && dataSourceActive)}>
          <input
            type="radio"
            name="win-rate-comparison"
            className={cn(radioInput)}
            checked={winRateComparison === "relative"}
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
            onChange={setWinRateComparisonAbsolute}
          />
          <span>Absolute</span>
        </label>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className={sectionLabel}>Min Frequency (%)</div>
            <InfoTooltip
              ariaLabel="Minimum frequency help"
              text="Only moves above this play frequency are shown."
            />
          </div>
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
          className={cn([
            "w-full appearance-none h-1.5 rounded-full cursor-pointer",
            "bg-lightmode-300 dark:bg-darkmode-300",
            "hover:bg-lightmode-500/50 dark:hover:bg-darkmode-100",
            "accent-sky-500",
          ])}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className={sectionLabel}>Move Limit</div>
            <InfoTooltip
              ariaLabel="Move limit help"
              text="Limits how many moves are shown per position. Set to 0 to show all moves."
            />
          </div>
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
          className={cn([
            "w-full appearance-none h-1.5 rounded-full cursor-pointer",
            "bg-lightmode-300 dark:bg-darkmode-300",
            "hover:bg-lightmode-500/50 dark:hover:bg-darkmode-100",
            "accent-sky-500",
          ])}
        />
      </div>
    </CollapsibleCard>
  );
};

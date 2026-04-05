import { useCallback, useEffect, useMemo, useState } from "react";
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

const dataSourceLabel = "flex gap-2 p-1 rounded text-sm font-medium cursor-pointer gt-treeview-hoverable";
const dataSourceActive = "bg-lightmode-900/10 dark:bg-darkmode-100/10";
const radioInput = "accent-sky-500 dark:accent-sky-400 cursor-pointer";
const sectionLabel = "text-sm font-semibold";
const treeNumberInputBase = [
  "appearance-none rounded-md h-7 w-[3rem] px-2",
  "text-sm font-semibold text-right tabular-nums",
  "bg-lightmode-300/65 dark:bg-darkmode-700",
  "text-lightmode-900 dark:text-darkmode-100",
  "ring-1 ring-lightmode-700/25 dark:ring-darkmode-100/20",
  "focus:ring-2 focus:ring-sky-500/45 dark:focus:ring-sky-400/35",
  "focus:outline-none transition-colors",
  "[appearance:textfield] [-moz-appearance:textfield]",
  "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
  "[&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0",
];
const sectionClassName = "p-3 border-t border-lightmode-900/10 dark:border-darkmode-100/20";
const collapseDurationMs = 300;
const collapsePersistKey = "gtTreeOptionsCollapsed";

export const TreeSettings = () => {
  const dispatch = useAppDispatch();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem(collapsePersistKey) === "1";
    } catch {
      return false;
    }
  });
  const [showContent, setShowContent] = useState(!isCollapsed);

  const source = useSelector((s: RootState) => selectTreeSource(s));
  const minFrequencyPct = useSelector((s: RootState) => selectTreeMinFrequencyPct(s));
  const moveLimit = useSelector((s: RootState) => selectTreeMoveLimit(s));
  const moveLimitRangeMax = Math.max(20, moveLimit);
  const winRateComparison = useSelector((s: RootState) => selectTreeWinRateComparison(s));

  useEffect(() => {
    if (!isCollapsed) {
      setShowContent(true);
      return;
    }

    const timeout = window.setTimeout(() => setShowContent(false), collapseDurationMs);
    return () => window.clearTimeout(timeout);
  }, [isCollapsed]);

  const arrowStyle = useMemo(
    () => ({
      transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)",
      transition: `transform ${collapseDurationMs}ms`,
    }),
    [isCollapsed],
  );

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(collapsePersistKey, next ? "1" : "");
      } catch {
        // no-op
      }
      return next;
    });
  }, []);

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
    <div className="gt-tree-panel w-[16rem] select-none flex flex-col">
      <div
        className="w-full flex items-center justify-between gap-2 text-sm cursor-pointer select-none px-3 py-2 gt-treeview-hoverable"
        onClick={toggleCollapsed}
      >
        <div className="text-sm font-bold">Tree Settings</div>
        <div className="transition-transform" style={arrowStyle}>
          ▲
        </div>
      </div>

      <div
        className={cn(
          "transition-all ease-in-out overflow-hidden",
          isCollapsed ? "max-h-0 opacity-0" : "max-h-[100rem] opacity-100",
        )}
        style={{ transitionDuration: `${collapseDurationMs}ms` }}
      >
        {showContent && (
          <>
            <div className={sectionClassName}>
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

            <div className={sectionClassName}>
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

            <div className={sectionClassName}>
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
            className={cn([treeNumberInputBase])}
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

            <div className={sectionClassName}>
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
            className={cn([treeNumberInputBase])}
            aria-label="Maximum moves shown per position"
          />
        </div>
        <input
          type="range"
          min={0}
          max={moveLimitRangeMax}
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
          </>
        )}
      </div>
    </div>
  );
};

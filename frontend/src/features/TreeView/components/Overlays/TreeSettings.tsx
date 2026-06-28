import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { FaSlidersH } from "react-icons/fa";

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
const sectionClassName = "p-3 border-t gt-divider-surface";
const collapseDurationMs = 300;
const collapsePersistKey = "gtTreeOptionsCollapsed";
const panelWidthClassName = "w-[17rem] max-w-[calc(100vw-1rem)] md:w-[18rem]";

const getInitialCollapsedState = () => {
  try {
    const stored = localStorage.getItem(collapsePersistKey);
    return stored !== "0" && stored !== "";
  } catch {
    return true;
  }
};

const persistCollapsedState = (isCollapsed: boolean) => {
  try {
    localStorage.setItem(collapsePersistKey, isCollapsed ? "1" : "0");
  } catch {
    // no-op
  }
};

const formatPercent = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1);

export const TreeSettings = () => {
  const dispatch = useAppDispatch();
  const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsedState);
  const [showContent, setShowContent] = useState(!isCollapsed);

  const source = useSelector((s: RootState) => selectTreeSource(s));
  const minFrequencyPct = useSelector((s: RootState) => selectTreeMinFrequencyPct(s));
  const moveLimit = useSelector((s: RootState) => selectTreeMoveLimit(s));
  const moveLimitRangeMax = Math.max(20, moveLimit);
  const winRateComparison = useSelector((s: RootState) => selectTreeWinRateComparison(s));
  const settingsSummary = useMemo(() => {
    const sourceLabel = source === "otb" ? "OTB" : "Online";
    const comparisonLabel = winRateComparison === "relative" ? "Parent" : "50/50";
    const frequencyLabel = `>= ${formatPercent(minFrequencyPct)}%`;
    const moveLimitLabel = moveLimit === 0 ? "All moves" : `${moveLimit} moves`;
    return `${sourceLabel} | ${comparisonLabel} | ${frequencyLabel} | ${moveLimitLabel}`;
  }, [minFrequencyPct, moveLimit, source, winRateComparison]);
  const panelClassName = cn(
    "gt-tree-panel select-none flex flex-col transition-[width,max-height] ease-in-out pointer-events-auto",
    panelWidthClassName,
  );

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
      persistCollapsedState(next);
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
    <div className={panelClassName} style={{ transitionDuration: `${collapseDurationMs}ms` }}>
      <button
        type="button"
        className="h-10 w-full flex items-center justify-between gap-3 text-sm cursor-pointer select-none px-3 py-2 gt-treeview-hoverable text-left"
        onClick={toggleCollapsed}
        aria-label="Tree Settings"
        aria-expanded={!isCollapsed}
        title={settingsSummary}
      >
        <span className="flex min-w-0 items-center gap-2">
          <FaSlidersH className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate text-sm font-bold">Tree Settings</span>
        </span>
        <span className="shrink-0 transition-transform" style={arrowStyle}>
          ▲
        </span>
      </button>

      <div
        className={cn(
          "transition-all ease-in-out",
          isCollapsed
            ? "max-h-0 opacity-0 overflow-hidden"
            : "max-h-[calc(100vh-8rem)] opacity-100 overflow-y-auto sm:max-h-[28rem] sm:overflow-hidden",
        )}
        style={{ transitionDuration: `${collapseDurationMs}ms` }}
      >
        {showContent && (
          <>
            <div className={sectionClassName}>
              <div className={cn(sectionLabel, "pb-1 flex items-center gap-1")}>
                <span>Game source</span>
                <InfoTooltip
                  ariaLabel="Game source help"
                  text="Choose OTB or online games from the stronger-player data set."
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
                <span>Result colors</span>
                <InfoTooltip
                  ariaLabel="Result colors help"
                  text="Choose whether colors compare moves to the parent position or a 50/50 baseline."
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
                <span>Compare to parent position</span>
              </label>
              <label className={cn(dataSourceLabel, winRateComparison === "absolute" && dataSourceActive)}>
                <input
                  type="radio"
                  name="win-rate-comparison"
                  className={cn(radioInput)}
                  checked={winRateComparison === "absolute"}
                  onChange={setWinRateComparisonAbsolute}
                />
                <span>Compare to 50/50</span>
              </label>
            </div>

            <div className={sectionClassName}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className={sectionLabel}>Minimum play rate (%)</div>
                  <InfoTooltip
                    ariaLabel="Minimum play rate help"
                    text="Hide moves played less often than this percentage in the current position."
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
                  aria-label="Minimum play rate percentage"
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
                  <div className={sectionLabel}>Moves shown</div>
                  <InfoTooltip
                    ariaLabel="Moves shown help"
                    text="Maximum visible moves per position. 0 shows all."
                  />
                </div>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={moveLimit}
                  onChange={setMoveLimit}
                  className={cn([treeNumberInputBase])}
                  aria-label="Maximum moves per position"
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

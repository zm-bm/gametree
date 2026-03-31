import { useCallback } from "react";
import { useSelector } from "react-redux";

import { RootState, useAppDispatch } from "@/store";
import { ui } from "@/store/slices";
import {
  selectBoardFen,
  selectBoardOrientation,
  selectEngineOutput,
  selectEngineRunning,
  selectSideToMove,
} from "@/store/selectors";
import "./EngineView.css";
import { SidebarCard } from "../SidebarCard";
import EngineHeaderSummary from "./EngineHeaderSummary";
import EngineControls from "./EngineControls";
import EnginePrimaryAnalysis from "./EnginePrimaryAnalysis";
import EnginePrincipalVariation from "./EnginePrincipalVariation";

function getLocale() {
  if (navigator.languages != undefined) return navigator.languages[0];
  return navigator.language;
}

const locale = getLocale();

const formatSpeed = (speed: number) => (
  Intl.NumberFormat(locale, {
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(speed)
);

const EngineView = () => {
  const dispatch = useAppDispatch();
  const running = useSelector((s: RootState) => selectEngineRunning(s));
  const engineOutput = useSelector((s: RootState) => selectEngineOutput(s));
  const fen = useSelector((s: RootState) => selectBoardFen(s));
  const orientation = useSelector((s: RootState) => selectBoardOrientation(s));
  const sideToMove = useSelector((s: RootState) => selectSideToMove(s));

  const { time, speed, depth = 0, seldepth = 0, hashfull, tbhits } = engineOutput || {};
  const hasOutput = Boolean(engineOutput);

  const engineToggle = useCallback(() => {
    dispatch(ui.actions.toggleEngine());
  }, [dispatch]);
  const timeDisplay = hasOutput && typeof time === "number" ? `${(time / 1000).toFixed(1)}s` : "--";
  const npsDisplay = hasOutput && typeof speed === "number" ? formatSpeed(speed) : "--";
  const selDepthDisplay = hasOutput ? seldepth : "--";
  const hashDisplay = hasOutput && typeof hashfull === "number" ? `${Math.round(hashfull / 10)}%` : "--";
  const tbDisplay = hasOutput && typeof tbhits === "number" ? tbhits : "--";

  return (
    <SidebarCard
      header={(collapsed) => <EngineHeaderSummary collapsed={collapsed} />}
      persistKey="gtEngineViewCollapsed"
      maxHeight="max-h-[100rem]"
    >
      <EngineControls
        running={running}
        hasOutput={hasOutput}
        depth={depth}
        speed={speed}
        onToggle={engineToggle}
      />

      <EnginePrimaryAnalysis
        engineOutput={engineOutput}
        fen={fen}
        sideToMove={sideToMove}
        orientation={orientation}
        locale={locale}
      />

      <EnginePrincipalVariation fen={fen} pvMoves={engineOutput?.pv ?? []} />

      <div className="py-2">
        <div className="grid grid-cols-5 gap-2 text-xs text-gray-500/70 dark:text-gray-500/80">
          <div className="text-center leading-tight">
            <span>time </span>
            <span className="font-semibold text-gray-400 dark:text-gray-300 tabular-nums">{timeDisplay}</span>
          </div>
          <div className="text-center leading-tight">
            <span>nps </span>
            <span className="font-semibold text-gray-400 dark:text-gray-300 tabular-nums">{npsDisplay}</span>
          </div>
          <div className="text-center leading-tight">
            <span>hash </span>
            <span className="font-semibold text-gray-400 dark:text-gray-300 tabular-nums">{hashDisplay}</span>
          </div>
          <div className="text-center leading-tight">
            <span>seldepth </span>
            <span className="font-semibold text-gray-400 dark:text-gray-300 tabular-nums">{selDepthDisplay}</span>
          </div>
          <div className="text-center leading-tight">
            <span>tb </span>
            <span className="font-semibold text-gray-400 dark:text-gray-300 tabular-nums">{tbDisplay}</span>
          </div>
        </div>
      </div>
    </SidebarCard>
  );
};

export default EngineView;

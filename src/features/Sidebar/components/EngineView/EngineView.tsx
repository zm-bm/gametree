import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { Chess } from "chess.js";

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

  const onMouseEnter = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const id = e.currentTarget.getAttribute("data-id");
    dispatch(ui.actions.setHover(id));
  }, [dispatch]);

  const onMouseLeave = useCallback(() => {
    dispatch(ui.actions.setHover(null));
  }, [dispatch]);

  const chessForPv = new Chess(fen);
  const pvMoves = engineOutput?.pv ?? [];
  const timeDisplay = hasOutput && typeof time === "number" ? `${(time / 1000).toFixed(1)}s` : "--";
  const npsDisplay = hasOutput && typeof speed === "number" ? formatSpeed(speed) : "--";
  const selDepthDisplay = hasOutput ? seldepth : "--";
  const hashDisplay = hasOutput && typeof hashfull === "number" ? `${Math.round(hashfull / 10)}%` : "--";
  const tbDisplay = hasOutput && typeof tbhits === "number" ? tbhits : "--";

  const pvTokens = useMemo(() => {
    if (!pvMoves.length) return null;

    return pvMoves.map((move, moveIx) => {
      try {
        const chessMove = chessForPv.move(move);
        const isWhiteMove = chessMove.color === "w";
        const isFirstMove = moveIx === 0;
        const showMoveNumber = isWhiteMove || isFirstMove;
        const fullMoveNumber = parseInt(chessMove.before.split(" ")[5] || "1");

        return (
          <span
            key={chessMove.lan + moveIx}
            data-id={chessMove.lan}
            className="hover:text-sky-600 cursor-pointer"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            {showMoveNumber && (
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {fullMoveNumber}
                {isWhiteMove ? "." : "..."}
              </span>
            )}
            <span>{chessMove.san}</span>
            {" "}
            {isWhiteMove ? " " : <>&nbsp;</>}
          </span>
        );
      } catch {
        return null;
      }
    });
  }, [pvMoves, chessForPv, onMouseEnter, onMouseLeave]);

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

      <div className="space-y-2 py-4">
        <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500">Principal variation</div>
        <div className="engine-pv-line min-h-24 max-h-48 overflow-y-auto pr-1 text-base leading-7 text-gray-900 dark:text-gray-100">
          {pvTokens ?? <span className="text-gray-500 dark:text-gray-500">no analysis yet</span>}
        </div>
      </div>

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

import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { Chess } from "chess.js";
import { IoIosPause, IoIosPlay } from "react-icons/io";
import { cn } from "@/shared/lib/cn";
import { formatEngineEval, getEngineBarCp, getNormalizedEngineScore } from "@/shared/lib/engineEval";

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
import EngineHeaderSummary from './EngineHeaderSummary';

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

const EVAL_BAR_SCALE_PAWNS = 3;

const EngineView = () => {
  const dispatch = useAppDispatch();
  const running = useSelector((s: RootState) => selectEngineRunning(s));
  const engineOutput = useSelector((s: RootState) => selectEngineOutput(s));
  const fen = useSelector((s: RootState) => selectBoardFen(s));
  const orientation = useSelector((s: RootState) => selectBoardOrientation(s));
  const sideToMove = useSelector((s: RootState) => selectSideToMove(s));

  const { time, speed, depth = 0, seldepth = 0, hashfull, tbhits } = engineOutput || {};
  const hasOutput = Boolean(engineOutput);
  const evalText = formatEngineEval(
    engineOutput,
    { sideToMove, orientation, convention: "white" },
    locale,
  );

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

  const chessForBestMove = new Chess(fen);
  const bestMoveUci = engineOutput?.pv?.[0];
  let bestMoveSan = "-";
  if (bestMoveUci) {
    try {
      bestMoveSan = chessForBestMove.move(bestMoveUci).san;
    } catch {
      bestMoveSan = bestMoveUci;
    }
  }

  const chessForPv = new Chess(fen);
  const pvMoves = engineOutput?.pv ?? [];
  const evalDisplay = hasOutput ? evalText : "-";
  const depthDisplay = hasOutput ? depth : "-";
  const timeDisplay = hasOutput && typeof time === "number" ? `${(time / 1000).toFixed(1)}s` : "--";
  const npsDisplay = hasOutput && typeof speed === "number" ? formatSpeed(speed) : "--";
  const npsKnDisplay = hasOutput && typeof speed === "number" ? `${Math.round(speed / 1000)} kn/s` : "--";
  const selDepthDisplay = hasOutput ? seldepth : "--";
  const hashDisplay = hasOutput && typeof hashfull === "number" ? `${Math.round(hashfull / 10)}%` : "--";
  const tbDisplay = hasOutput && typeof tbhits === "number" ? tbhits : "--";

  const normalizedScorePerspective = hasOutput
    ? getNormalizedEngineScore(engineOutput!, {
      sideToMove,
      orientation,
      convention: "perspective",
    })
    : { cp: 0, mate: undefined };
  const normalizedScoreWhite = hasOutput
    ? getNormalizedEngineScore(engineOutput!, {
      sideToMove,
      orientation,
      convention: "white",
    })
    : { cp: 0, mate: undefined };

  const cpForTone = getEngineBarCp(normalizedScorePerspective);
  const cpForBar = getEngineBarCp(normalizedScoreWhite);
  const evalToneClass = !hasOutput
    ? "text-gray-500"
    : cpForTone > 0
      ? "text-emerald-300"
      : cpForTone < 0
        ? "text-red-400"
        : "text-gray-100";
  const barNormalized = Math.max(-1, Math.min(1, cpForBar / (EVAL_BAR_SCALE_PAWNS * 100)));
  const whiteShare = Math.max(0.05, Math.min(0.95, 0.5 + barNormalized * 0.45));

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
      persistKey='gtEngineViewCollapsed'
      maxHeight='max-h-[100rem]'
    >
      {/* Controls */}
      <div className="flex items-center gap-3 py-2 min-w-0">
        <div className="shrink-0">
        <button
          onClick={engineToggle}
          className={cn(
            'h-10 min-w-24 px-3 inline-flex items-center justify-center gap-2 rounded-md border transition-colors',
            running
              ? "border-red-400/40 bg-red-500/20 text-red-100 hover:bg-red-500/30"
              : "border-sky-300/40 bg-sky-500/20 text-sky-100 hover:bg-sky-500/30"
          )}
          title="Start/stop engine"
        >
          {running ? <IoIosPause className="text-lg" /> : <IoIosPlay className="text-lg" />}
          <span className="text-xs font-semibold uppercase tracking-wide">
            {running ? "Stop" : "Start"}
          </span>
        </button>
        </div>

        <div className="min-w-0 text-lg font-semibold leading-none text-white/90 truncate shrink-0">
          Stockfish 18
        </div>

        <div className="flex items-center gap-2 text-sm leading-none whitespace-nowrap text-white/60">
          <span>
            depth <span className="font-semibold text-white/80">{depthDisplay}</span>
          </span>
          <span className="text-white/40">&bull;</span>
          <span className="font-semibold text-white/80">{npsKnDisplay}</span>
        </div>
      </div>

      {/* Primary analysis */}
      <div className="space-y-3 min-h-48 pt-10 pb-6 text-center">
        <div className={`text-6xl font-semibold tracking-tight leading-none ${evalToneClass}`}>
          {evalDisplay}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 leading-none">
          best move:{" "}
          <span className={`font-semibold ${hasOutput ? "text-gray-100" : "text-gray-500"}`}>{hasOutput ? bestMoveSan : "-"}</span>
        </div>
        <div className="pt-2 px-2">
          <div className="h-8 rounded-md border border-gray-300/50 dark:border-white/10 overflow-hidden flex">
            <div className="h-full bg-gray-100/90 dark:bg-gray-100/90" style={{ width: `${whiteShare * 100}%` }} />
            <div className="h-full bg-gray-900/70 dark:bg-gray-900/80" style={{ width: `${(1 - whiteShare) * 100}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>white</span>
            <span>0</span>
            <span>black</span>
          </div>
        </div>
      </div>

      {/* Principal variation */}
      <div className="space-y-2 py-4">
        <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500">Principal variation</div>
        <div className="engine-pv-line min-h-24 max-h-48 overflow-y-auto pr-1 text-base leading-7 text-gray-900 dark:text-gray-100">
          {pvTokens ?? <span className="text-gray-500 dark:text-gray-500">no analysis yet</span>}
        </div>
      </div>

      {/* Secondary stats */}
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

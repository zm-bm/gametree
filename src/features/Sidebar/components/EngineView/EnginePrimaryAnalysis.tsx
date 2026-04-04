import { Chess } from "chess.js";
import { EngineOutput } from "@/types";
import { formatEngineEval, getEngineBarCp, getNormalizedEngineScore } from "@/shared/engine";

interface EnginePrimaryAnalysisProps {
  engineOutput: EngineOutput | null;
  fen: string;
  sideToMove: string;
  orientation: string;
  locale?: string;
}

const EVAL_BAR_SCALE_PAWNS = 4;
const EVAL_BAR_MARKS = Array.from(
  { length: EVAL_BAR_SCALE_PAWNS * 2 - 1 },
  (_, ix) => ix - (EVAL_BAR_SCALE_PAWNS - 1),
);
const EMPTY_VALUE = "-";
const BASE_SCORE = { cp: 0, mate: undefined };

const EnginePrimaryAnalysis = ({
  engineOutput,
  fen,
  sideToMove,
  orientation,
  locale,
}: EnginePrimaryAnalysisProps) => {
  const hasOutput = Boolean(engineOutput);

  const evalText = formatEngineEval(
    engineOutput,
    { sideToMove, orientation, convention: "white" },
    locale,
  );
  const evalDisplay = hasOutput ? evalText : EMPTY_VALUE;

  const chessForBestMove = new Chess(fen);
  const bestMoveUci = engineOutput?.pv?.[0];
  let bestMoveSan = EMPTY_VALUE;
  if (bestMoveUci) {
    try {
      bestMoveSan = chessForBestMove.move(bestMoveUci).san;
    } catch {
      bestMoveSan = bestMoveUci;
    }
  }

  const normalizeScore = (convention: "white" | "perspective") => (
    hasOutput
      ? getNormalizedEngineScore(engineOutput!, {
        sideToMove,
        orientation,
        convention,
      })
      : BASE_SCORE
  );

  const normalizedScorePerspective = normalizeScore("perspective");
  const normalizedScoreWhite = normalizeScore("white");

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

  const bestMoveClass = hasOutput ? "text-gray-100" : "text-gray-500";

  return (
    <div className="space-y-3 min-h-48 pt-6 pb-6 text-center">
      <div className={`text-6xl font-semibold tracking-tight leading-none tabular-nums ${evalToneClass}`}>
        {evalDisplay}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-300 leading-none">
        best move:{" "}
        <span className={`font-semibold tabular-nums ${bestMoveClass}`}>{hasOutput ? bestMoveSan : EMPTY_VALUE}</span>
      </div>
      <div className="pt-2 px-2">
        <div className="relative h-8 rounded-md border border-gray-300/50 dark:border-white/10 overflow-hidden flex">
          <div className="h-full bg-gray-100/90 dark:bg-gray-100/90 transition-[width] duration-300" style={{ width: `${whiteShare * 100}%` }} />
          <div className="h-full bg-gray-900/70 dark:bg-gray-900/80 transition-[width] duration-300" style={{ width: `${(1 - whiteShare) * 100}%` }} />
          <div className="pointer-events-none absolute inset-0">
            {EVAL_BAR_MARKS.map((pawn) => {
              const isCenterMark = pawn === 0;
              const positionPct = ((pawn + EVAL_BAR_SCALE_PAWNS) / (EVAL_BAR_SCALE_PAWNS * 2)) * 100;

              return (
                <div
                  key={pawn}
                  className={`absolute inset-y-0 w-px ${isCenterMark ? "bg-slate-500/70" : "bg-slate-500/45"}`}
                  style={{ left: `${positionPct}%`, transform: "translateX(-0.5px)" }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnginePrimaryAnalysis;

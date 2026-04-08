import { EngineOutput } from "@/types";
import { cn } from "@/shared/cn";
import { getEngineBarCp, getNormalizedEngineScore } from "@/shared/engine";

interface EngineHeadlineProps {
  evalDisplay: string;
  engineOutput: EngineOutput | null;
  sideToMove: string;
  orientation: string;
}

const EVAL_RAIL_SCALE_PAWNS = 4;
const EVAL_RAIL_MARKS = Array.from(
  { length: EVAL_RAIL_SCALE_PAWNS * 2 - 1 },
  (_, ix) => ix - (EVAL_RAIL_SCALE_PAWNS - 1),
);
const BASE_SCORE = { cp: 0, mate: undefined };

const EngineHeadline = ({
  evalDisplay,
  engineOutput,
  sideToMove,
  orientation,
}: EngineHeadlineProps) => {
  const hasOutput = Boolean(engineOutput);

  const normalizeScore = (convention: "white" | "perspective") => (
    hasOutput
      ? getNormalizedEngineScore(engineOutput!, {
        sideToMove,
        orientation,
        convention,
      })
      : BASE_SCORE
  );

  const normalizedScoreWhite = normalizeScore("white");
  const cpForBar = getEngineBarCp(normalizedScoreWhite);
  const barAriaLabel = evalDisplay
    ? `Engine evaluation bar (${evalDisplay})`
    : "Engine evaluation bar";

  const barNormalized = Math.max(-1, Math.min(1, cpForBar / (EVAL_RAIL_SCALE_PAWNS * 100)));
  const whiteShare = Math.max(0.05, Math.min(0.95, 0.5 + barNormalized * 0.45));
  const whitePct = whiteShare * 100;
  const blackPct = (1 - whiteShare) * 100;

  return (
    <div className="gt-engine-primary">
      <div
        className="gt-engine-bar"
        role="img"
        aria-label={barAriaLabel}
        data-testid="engine-eval-bar"
      >
        <div className="gt-engine-bar-track">
          <div
            className="gt-engine-bar-segment--white"
            style={{ width: `${whitePct}%` }}
            data-testid="engine-eval-bar-white"
          />
          <div
            className="gt-engine-bar-segment--black"
            style={{ width: `${blackPct}%` }}
            data-testid="engine-eval-bar-black"
          />

          <div className="gt-engine-bar-marks" aria-hidden="true">
            {EVAL_RAIL_MARKS.map((pawn) => {
              const isCenterMark = pawn === 0;
              const positionPct = ((pawn + EVAL_RAIL_SCALE_PAWNS) / (EVAL_RAIL_SCALE_PAWNS * 2)) * 100;

              return (
                <div
                  key={pawn}
                  className={cn("gt-engine-bar-mark", isCenterMark && "gt-engine-bar-mark--center")}
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

export default EngineHeadline;

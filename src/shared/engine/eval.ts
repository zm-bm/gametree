import type {
  EngineEvalConvention,
  EngineOutput,
  EvalContext,
  NormalizedEngineScore,
} from "../../types";

const getScoreMultiplier = (
  sideToMove: string,
  orientation: string,
  convention: EngineEvalConvention,
) => {
  const turn = sideToMove === "white" ? 1 : -1;

  if (convention === "white") {
    // UCI cp/mate is from side-to-move perspective; convert to white POV.
    return turn;
  }

  const flipped = orientation === "white" ? 1 : -1;
  return turn * flipped;
};

export const getNormalizedEngineScore = (
  engineOutput: EngineOutput,
  { sideToMove, orientation, convention = "perspective" }: EvalContext,
): NormalizedEngineScore => {
  const { cp, mate } = engineOutput;
  const multiplier = getScoreMultiplier(sideToMove, orientation, convention);

  if (cp !== undefined) {
    return { cp: cp * multiplier, mate: undefined };
  }

  if (mate !== undefined) {
    return { cp: undefined, mate: mate * multiplier };
  }

  return { cp: undefined, mate: undefined };
};

export const formatEngineEval = (
  engineOutput: EngineOutput | null,
  context: EvalContext,
  locale?: string,
) => {
  if (!engineOutput) return "-";

  const { cp, mate } = getNormalizedEngineScore(engineOutput, context);

  if (cp !== undefined) {
    return Intl.NumberFormat(locale, {
      signDisplay: "always",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(cp / 100);
  }

  if (mate !== undefined) {
    const sign = mate > 0 ? "" : "-";
    return `${sign}M${Math.abs(mate)}`;
  }

  return "-";
};

export const getEngineBarCp = (score: NormalizedEngineScore) => {
  if (score.mate !== undefined) {
    return score.mate > 0 ? 1000 : -1000;
  }

  return score.cp ?? 0;
};
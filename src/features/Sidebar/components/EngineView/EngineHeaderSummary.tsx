import { useMemo } from "react";
import { useSelector } from "react-redux";

import { RootState } from "@/store";
import {
  selectBoardOrientation,
  selectEngineOutput,
  selectEngineRunning,
  selectSideToMove,
} from "@/store/selectors";

const formatCentipawns = (cp: number, sideToMove: string, orientation: string) => {
  const turn = sideToMove === "white" ? 1 : -1;
  const flipped = orientation === "white" ? 1 : -1;
  const score = (cp * turn * flipped) / 100;

  return Intl.NumberFormat(undefined, {
    signDisplay: "always",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(score);
};

const formatMate = (mate: number, sideToMove: string, orientation: string) => {
  const turn = sideToMove === "white" ? 1 : -1;
  const flipped = orientation === "white" ? 1 : -1;
  const plies = mate * turn * flipped;
  const sign = plies > 0 ? "+" : "-";
  return `${sign}#${Math.abs(plies)}`;
};

const EngineHeaderSummary = () => {
  const running = useSelector((s: RootState) => selectEngineRunning(s));
  const engineOutput = useSelector((s: RootState) => selectEngineOutput(s));
  const orientation = useSelector((s: RootState) => selectBoardOrientation(s));
  const sideToMove = useSelector((s: RootState) => selectSideToMove(s));

  const summary = useMemo(() => {
    if (!running) {
      return "Engine: off";
    }

    if (!engineOutput) {
      return "Engine: on";
    }

    const depth = engineOutput.depth || 0;
    let scoreText = "-";

    if (typeof engineOutput.cp === "number") {
      scoreText = formatCentipawns(engineOutput.cp, sideToMove, orientation);
    } else if (typeof engineOutput.mate === "number") {
      scoreText = formatMate(engineOutput.mate, sideToMove, orientation);
    }

    return `Engine: ${scoreText} @ d${depth}`;
  }, [running, engineOutput, sideToMove, orientation]);

  return <span className="font-semibold tracking-tight">{summary}</span>;
};

export default EngineHeaderSummary;
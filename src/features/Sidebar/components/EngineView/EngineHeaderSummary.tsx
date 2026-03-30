import { useMemo } from "react";
import { useSelector } from "react-redux";

import { RootState } from "@/store";
import { formatEngineEval } from "@/shared/lib/engineEval";
import {
  selectBoardOrientation,
  selectEngineOutput,
  selectEngineRunning,
  selectSideToMove,
} from "@/store/selectors";

interface EngineHeaderSummaryProps {
  collapsed: boolean;
}

const EngineHeaderSummary = ({ collapsed }: EngineHeaderSummaryProps) => {
  const running = useSelector((s: RootState) => selectEngineRunning(s));
  const engineOutput = useSelector((s: RootState) => selectEngineOutput(s));
  const orientation = useSelector((s: RootState) => selectBoardOrientation(s));
  const sideToMove = useSelector((s: RootState) => selectSideToMove(s));

  const summary = useMemo(() => {
    if (collapsed && running && engineOutput) {
      const depth = engineOutput.depth || 0;
      const scoreText = formatEngineEval(engineOutput, {
        sideToMove,
        orientation,
        convention: "white",
      });

      return `Engine: ${scoreText} @ d${depth}`;
    }

    return null;
  }, [collapsed, running, engineOutput, sideToMove, orientation]);

  if (summary) {
    return <span className="font-semibold tracking-tight">{summary}</span>;
  }

  return (
    <span className="font-semibold tracking-tight">
      Engine:{" "}
      <span className="text-emerald-300">
        {running ? "ON" : "OFF"}
      </span>
    </span>
  );
};

export default EngineHeaderSummary;
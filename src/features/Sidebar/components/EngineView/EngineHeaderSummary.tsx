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

  const hasOutput = Boolean(engineOutput);
  const stateText = running ? "running" : "idle";
  const evalText = hasOutput && engineOutput ? formatEngineEval(engineOutput, {
    sideToMove,
    orientation,
    convention: "white",
  }) : null;

  const stateClass = running
    ? "text-emerald-300/85 dark:text-emerald-300/80"
    : "text-teal-200/75 dark:text-teal-300/65";

  return (
    <span className="font-semibold tracking-tight">
      <span>Engine:</span>{" "}
      {!collapsed && (
        <span className={stateClass}>{stateText}</span>
      )}
      {collapsed && !evalText && (
        <span className={stateClass}>idle</span>
      )}
      {collapsed && evalText && (
        <>
          <span className={stateClass}>{stateText}</span>
          <span className="mx-1 text-slate-500/80">·</span>
          <span className="text-emerald-200 dark:text-emerald-200">{evalText}</span>
          <span className="mx-1 text-slate-500/80">·</span>
          <span className="font-medium text-slate-400 dark:text-slate-500">d{engineOutput?.depth ?? 0}</span>
        </>
      )}
    </span>
  );
};

export default EngineHeaderSummary;
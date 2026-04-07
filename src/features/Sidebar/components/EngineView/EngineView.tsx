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
import EngineControls from "./EngineControls";
import EnginePrimaryAnalysis from "./EnginePrimaryAnalysis";
import EnginePrincipalVariation from "./EnginePrincipalVariation";
import EngineSecondaryStats from "./EngineSecondaryStats";

function getLocale() {
  if (navigator.languages != undefined) return navigator.languages[0];
  return navigator.language;
}

const locale = getLocale();

const EngineView = () => {
  const dispatch = useAppDispatch();
  const running = useSelector((s: RootState) => selectEngineRunning(s));
  const engineOutput = useSelector((s: RootState) => selectEngineOutput(s));
  const fen = useSelector((s: RootState) => selectBoardFen(s));
  const orientation = useSelector((s: RootState) => selectBoardOrientation(s));
  const sideToMove = useSelector((s: RootState) => selectSideToMove(s));

  const { speed, depth = 0 } = engineOutput || {};
  const hasOutput = Boolean(engineOutput);
  const stateText = running ? "running" : "idle";
  const stateClass = running
    ? "text-emerald-300/85 dark:text-emerald-300/80"
    : "text-teal-200/75 dark:text-teal-300/65";

  const engineToggle = useCallback(() => {
    dispatch(ui.actions.toggleEngine());
  }, [dispatch]);

  return (
    <>
      <div className="p-3">
        <span className="font-semibold tracking-tight">
          <span>Engine:</span>{" "}
          <span className={stateClass}>{stateText}</span>
        </span>
      </div>
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

      <EngineSecondaryStats engineOutput={engineOutput} locale={locale} />
    </>
  );
};

export default EngineView;

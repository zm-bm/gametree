import { useCallback } from "react";
import { useSelector } from "react-redux";

import { RootState, useAppDispatch } from "@/store";
import { ui } from "@/store/slices";
import { formatEngineEval } from "@/shared/engine";
import {
  selectBoardFen,
  selectBoardOrientation,
  selectCurrentVisibleId,
  selectEngineOutput,
  selectEngineRunning,
  selectSideToMove,
} from "@/store/selectors";
import EngineHeadline from "./EngineHeadline";
import EngineHeader from "./EngineHeader";
import EnginePrincipalVariation from "./EnginePrincipalVariation";
import EngineSecondaryStats from "./EngineSecondaryStats";
import "./EngineView.css";

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
  const currentVisibleId = useSelector((s: RootState) => selectCurrentVisibleId(s));

  const { speed, depth = 0 } = engineOutput || {};
  const hasOutput = Boolean(engineOutput);
  const formattedEval = hasOutput
    ? formatEngineEval(engineOutput, { sideToMove, orientation, convention: "white" }, locale)
    : "";
  const evalDisplay = formattedEval === "-" ? "" : formattedEval;

  const engineToggle = useCallback(() => {
    dispatch(ui.actions.toggleEngine());
  }, [dispatch]);

  return (
    <>
      <EngineHeader
        running={running}
        hasOutput={hasOutput}
        evalDisplay={evalDisplay}
        depth={depth}
        speed={speed}
        onToggle={engineToggle}
      />

      <EngineHeadline
        evalDisplay={evalDisplay}
        engineOutput={engineOutput}
        sideToMove={sideToMove}
        orientation={orientation}
      />

      <EnginePrincipalVariation
        fen={fen}
        pvMoves={engineOutput?.pv ?? []}
        currentVisibleId={currentVisibleId}
      />
      <EngineSecondaryStats engineOutput={engineOutput} />
    </>
  );
};

export default EngineView;

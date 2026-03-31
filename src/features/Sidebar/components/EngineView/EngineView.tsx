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
import "./EngineView.css";
import { SidebarCard } from "../SidebarCard";
import EngineHeaderSummary from "./EngineHeaderSummary";
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

  const engineToggle = useCallback(() => {
    dispatch(ui.actions.toggleEngine());
  }, [dispatch]);

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

      <EnginePrincipalVariation fen={fen} pvMoves={engineOutput?.pv ?? []} />

      <EngineSecondaryStats engineOutput={engineOutput} locale={locale} />
    </SidebarCard>
  );
};

export default EngineView;

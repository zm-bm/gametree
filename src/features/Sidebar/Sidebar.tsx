import { useMemo } from "react";
import { useSelector } from "react-redux";

import { formatMoveLine, getSanHistoryFromPathId } from "@/shared/chess";
import { RootState } from "@/store";
import { selectCurrentVisibleId, selectTreeNodeMap, selectTreeSource } from "@/store/selectors";
import ChessBoard from './components/ChessBoard'
import EngineView from './components/EngineView'
import PositionSummary from "./components/PositionSummary/PositionSummary";
import PositionTheory from "./components/PositionTheory/PositionTheory";
import { useOpeningEntry } from "./hooks/useOpeningEntry";
import './Sidebar.css';

const Sidebar = () => {
  const currentVisibleId = useSelector((s: RootState) => selectCurrentVisibleId(s));
  const source = useSelector((s: RootState) => selectTreeSource(s));
  const nodeMap = useSelector((s: RootState) => selectTreeNodeMap(s));
  const ecoEntry = useOpeningEntry(currentVisibleId);
  const currentNode = nodeMap[currentVisibleId];

  const sanMoves = useMemo(() => {
    if (!currentVisibleId) return [];
    return getSanHistoryFromPathId(currentVisibleId);
  }, [currentVisibleId]);
  const recentLine = useMemo(() => formatMoveLine(sanMoves), [sanMoves]);

  const openingName = ecoEntry?.name || "Root position";
  const ecoCode = ecoEntry?.eco || "-";
  const positionStats = currentNode?.positionStats[source] ?? null;

  return (
    <div className="gt-sidebar-layout">
      <div className="gt-sidebar-board-slot">
        <ChessBoard className="gt-sidebar-card" />
      </div>

      <div className="gt-sidebar-analysis-shell">

        <div className="gt-sidebar-context-strip gt-sidebar-card gt-sidebar-sections">
          <div>
            <PositionSummary
              openingName={openingName}
              ecoCode={ecoCode}
              recentLine={recentLine}
              hasSanMoves={sanMoves.length > 0}
              isLoadingPosition={Boolean(currentNode?.loading)}
              hasCurrentNode={Boolean(currentNode)}
              hasPositionStats={Boolean(positionStats)}
              totalGames={positionStats?.total ?? 0}
            />
          </div>
        </div>

        <div className="gt-sidebar-analysis-divider" aria-hidden="true">
          <span className="gt-sidebar-analysis-divider-label">Analysis</span>
          <span className="gt-sidebar-analysis-divider-line" />
        </div>

        <div className="gt-sidebar-scroll-region" data-testid="sidebar-scroll">
          <div className="gt-sidebar-stack">
            <div className="gt-sidebar-card gt-sidebar-sections">
              <div>
                <PositionTheory
                  currentVisibleId={currentVisibleId}
                  openingName={openingName}
                  recentLine={recentLine}
                  sanMoves={sanMoves}
                />
              </div>
            </div>
            <div className="gt-sidebar-card gt-sidebar-sections">
              <EngineView />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

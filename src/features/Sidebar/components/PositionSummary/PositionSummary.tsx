import { useMemo } from "react";
import { useSelector } from "react-redux";

import { useOpeningEntry } from "@/features/Sidebar/hooks/useOpeningEntry";
import { formatMoveLine, getSanHistoryFromPathId } from "@/shared/chess";
import { cn } from "@/shared/cn";
import { RootState } from "@/store";
import { selectCurrentVisibleId, selectCurrentVisibleNodeData, selectTreeSource } from "@/store/selectors";
import "./PositionSummary.css";

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const PositionSummary = () => {
  const currentVisibleId = useSelector((s: RootState) => selectCurrentVisibleId(s));
  const currentNode = useSelector((s: RootState) => selectCurrentVisibleNodeData(s));
  const source = useSelector((s: RootState) => selectTreeSource(s));
  const ecoEntry = useOpeningEntry(currentVisibleId);

  const sanMoves = useMemo(() => {
    if (!currentVisibleId) return [];
    return getSanHistoryFromPathId(currentVisibleId);
  }, [currentVisibleId]);
  const recentLine = useMemo(() => formatMoveLine(sanMoves), [sanMoves]);

  const openingName = ecoEntry?.name || "Root position";
  const ecoCode = ecoEntry?.eco || "-";
  const positionStats = currentNode?.positionStats[source] ?? null;
  const hasSanMoves = sanMoves.length > 0;
  const isLoadingPosition = Boolean(currentNode?.loading);
  const hasCurrentNode = Boolean(currentNode);
  const hasPositionStats = Boolean(positionStats);
  const totalGames = positionStats?.total ?? 0;
  const gameCountLabel = hasPositionStats ? `${compactNumber.format(totalGames)} games` : null;
  const statusMessage = isLoadingPosition
    ? "Loading position..."
    : !hasCurrentNode
      ? "No opening data for this position yet."
      : !hasPositionStats
        ? "No game count available."
        : null;

  return (
    <div className="gt-position-summary">
      <div className="gt-position-summary-head">
        <div className="gt-position-summary-title">{openingName}</div>
        <span className="gt-position-summary-eco">{ecoCode}</span>
      </div>

      <div className="gt-position-summary-line-row">
        <div className={cn("gt-position-summary-line", !hasSanMoves && "gt-position-summary-line--empty")}>
          {recentLine}
        </div>
        {gameCountLabel ? (
          <span className="gt-position-summary-games">{gameCountLabel}</span>
        ) : null}
      </div>

      {statusMessage ? (
        <div className="gt-position-summary-status">{statusMessage}</div>
      ) : null}
    </div>
  );
};

export default PositionSummary;

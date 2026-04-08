import { useMemo } from "react";
import { useSelector } from "react-redux";

import { useHoverIntent } from "@/features/Sidebar/hooks/useHoverIntent";
import { useOpeningEntry } from "@/features/Sidebar/hooks/useOpeningEntry";
import { buildMoveLineTokens, formatMoveLine, getSanHistoryFromPathId } from "@/shared/chess";
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
  const { onMouseEnter, onMouseLeave } = useHoverIntent();

  const sanMoves = useMemo(() => {
    if (!currentVisibleId) return [];
    return getSanHistoryFromPathId(currentVisibleId);
  }, [currentVisibleId]);
  const moveLineTokens = useMemo(() => buildMoveLineTokens(sanMoves), [sanMoves]);
  const recentLine = useMemo(() => formatMoveLine(sanMoves), [sanMoves]);
  const currentPathSegments = useMemo(
    () => currentVisibleId.split(",").filter(Boolean),
    [currentVisibleId],
  );

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
          {!hasSanMoves ? recentLine : moveLineTokens.map((token, idx) => {
            const hoverId = currentPathSegments.slice(0, token.plyIndex + 1).join(",");
            return (
              <span key={`${token.plyIndex}-${token.san}-${hoverId}`}>
                {token.prefix}
                <span
                  data-id={hoverId}
                  className="gt-position-summary-line-token"
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                >
                  {token.san}
                </span>
                {idx < moveLineTokens.length - 1 ? " " : null}
              </span>
            );
          })}
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

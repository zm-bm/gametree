import { cn } from "@/shared/cn";
import "./PositionSummary.css";

type PositionSummaryProps = {
  openingName: string;
  ecoCode: string;
  recentLine: string;
  hasSanMoves: boolean;
  isLoadingPosition: boolean;
  hasCurrentNode: boolean;
  hasPositionStats: boolean;
  totalGames: number;
};

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const PositionSummary = ({
  openingName,
  ecoCode,
  recentLine,
  hasSanMoves,
  isLoadingPosition,
  hasCurrentNode,
  hasPositionStats,
  totalGames,
}: PositionSummaryProps) => {
  const gameCountLabel = hasPositionStats ? `${compactNumber.format(totalGames)} games` : null;
  const statusMessage = isLoadingPosition
    ? "Loading position..."
    : !hasCurrentNode
      ? "No opening data for this position yet."
      : !hasPositionStats
        ? "No game count available."
        : null;

  return (
    <>
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
    </>
  );
};

export default PositionSummary;

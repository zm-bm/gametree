import { cn } from "@/shared/cn";

type PositionDetailsMetadataProps = {
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

const PositionDetailsMetadata = ({
  openingName,
  ecoCode,
  recentLine,
  hasSanMoves,
  isLoadingPosition,
  hasCurrentNode,
  hasPositionStats,
  totalGames,
}: PositionDetailsMetadataProps) => {
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
      <div className="gt-position-details-meta-head">
        <div className="gt-position-details-meta-title">{openingName}</div>
        <span className="gt-position-details-meta-eco">{ecoCode}</span>
      </div>

      <div className="gt-position-details-meta-line-row">
        <div className={cn("gt-position-details-meta-line", !hasSanMoves && "gt-position-details-meta-line--empty")}>
          {recentLine}
        </div>
        {gameCountLabel ? (
          <span className="gt-position-details-meta-games">{gameCountLabel}</span>
        ) : null}
      </div>

      {statusMessage ? (
        <div className="gt-position-details-meta-status">{statusMessage}</div>
      ) : null}
    </>
  );
};

export default PositionDetailsMetadata;

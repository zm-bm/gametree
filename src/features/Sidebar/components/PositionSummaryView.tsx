import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { getSanHistoryFromPathId } from "@/shared/chess";
import { RootState } from "@/store";
import { selectCurrentVisibleId, selectTreeNodeMap, selectTreeSource } from "@/store/selectors";
import { OpeningBookEntry } from "@/types";

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const toPercent = (value: number) => `${value.toFixed(1)}%`;

type MovePair = {
  moveNo: number;
  white: string;
  black?: string;
};

const groupMoves = (sanMoves: string[]): MovePair[] => {
  const pairs: MovePair[] = [];
  for (let idx = 0; idx < sanMoves.length; idx += 2) {
    pairs.push({
      moveNo: Math.floor(idx / 2) + 1,
      white: sanMoves[idx],
      black: sanMoves[idx + 1],
    });
  }

  return pairs;
};

const getTurnLabel = (plyCount: number) => (plyCount % 2 === 0 ? "White" : "Black");
const getMoveNumber = (plyCount: number) => Math.floor(plyCount / 2) + 1;

const PositionSummaryView = () => {
  const currentVisibleId = useSelector((s: RootState) => selectCurrentVisibleId(s));
  const source = useSelector((s: RootState) => selectTreeSource(s));
  const nodeMap = useSelector((s: RootState) => selectTreeNodeMap(s));

  const currentNode = nodeMap[currentVisibleId];
  const [ecoEntry, setEcoEntry] = useState<OpeningBookEntry | null>(null);

  useEffect(() => {
    if (!currentVisibleId) {
      setEcoEntry(null);
      return;
    }

    let cancelled = false;

    void import("@/shared/opening")
      .then(({ getECOByUciPath }) => {
        if (cancelled) return;
        setEcoEntry(getECOByUciPath(currentVisibleId));
      })
      .catch(() => {
        if (cancelled) return;
        setEcoEntry(null);
      });

    return () => {
      cancelled = true;
    };
  }, [currentVisibleId]);

  const sanMoves = useMemo(() => {
    if (!currentVisibleId) return [];
    return getSanHistoryFromPathId(currentVisibleId);
  }, [currentVisibleId]);

  const movePairs = useMemo(() => groupMoves(sanMoves), [sanMoves]);

  const positionStats = useMemo(() => {
    if (!currentNode) {
      return null;
    }

    return currentNode.positionStats[source];
  }, [currentNode, source]);

  const total = positionStats?.total ?? 0;
  const whitePct = total > 0 && positionStats ? (positionStats.white / total) * 100 : 0;
  const drawPct = total > 0 && positionStats ? (positionStats.draws / total) * 100 : 0;
  const blackPct = total > 0 && positionStats ? (positionStats.black / total) * 100 : 0;
  const turnLabel = getTurnLabel(sanMoves.length);
  const moveNumber = getMoveNumber(sanMoves.length);

  return (
    <section className="space-y-1.5 text-[11px]">
      <div className="flex items-baseline justify-between gap-2">
        <div className="min-w-0 truncate text-[13px] leading-snug font-semibold text-lightmode-200 dark:text-darkmode-200">
          {ecoEntry?.name || "Root position"}
        </div>
        <span className="shrink-0 tabular-nums text-[11px] font-semibold text-lightmode-300 dark:text-darkmode-300">
          {ecoEntry?.eco || "-"}
        </span>
      </div>

      <div className="flex items-start justify-between gap-2">
        {movePairs.length > 0 ? (
          <ol className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[12px] leading-[1.4] text-lightmode-300 dark:text-darkmode-300">
            {movePairs.map((pair) => (
              <li key={pair.moveNo} className="inline-flex items-baseline gap-1 whitespace-nowrap">
                <span className="tabular-nums text-lightmode-500 dark:text-darkmode-400">{pair.moveNo}.</span>
                <span className="font-medium text-lightmode-200 dark:text-darkmode-200">{pair.white}</span>
                {pair.black ? (
                  <span className="font-medium text-lightmode-300 dark:text-darkmode-300">{pair.black}</span>
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          <div className="text-[12px] italic text-lightmode-400 dark:text-darkmode-400">Start position</div>
        )}

        <span className="shrink-0 whitespace-nowrap text-[10px] tabular-nums text-lightmode-500 dark:text-darkmode-400">
          Move {moveNumber} · {turnLabel}
        </span>
      </div>

      {currentNode?.loading ? (
        <div className="text-[10px] italic text-lightmode-400 dark:text-darkmode-400">Loading position...</div>
      ) : !currentNode ? (
        <div className="text-[10px] italic text-lightmode-400 dark:text-darkmode-400">
          No opening data for this position yet.
        </div>
      ) : !positionStats ? (
        <div className="text-[10px] italic text-lightmode-400 dark:text-darkmode-400">No position stats available.</div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-lightmode-400 dark:text-darkmode-400">
          <span className="uppercase tracking-wide">{source}</span>
          <span>{compactNumber.format(total)} games</span>
          <span className="tabular-nums">
            W {toPercent(whitePct)} · D {toPercent(drawPct)} · B {toPercent(blackPct)}
          </span>
        </div>
      )}
    </section>
  );
};

export default PositionSummaryView;

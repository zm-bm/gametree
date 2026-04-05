import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { RootState } from "@/store";
import { selectCurrentVisibleId, selectTreeNodeMap, selectTreeSource } from "@/store/selectors";
import { OpeningBookEntry } from "@/types";

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const toPercent = (value: number) => `${value.toFixed(1)}%`;

const OpeningView = () => {
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

  const positionStats = useMemo(() => {
    if (!currentNode) {
      return null;
    }

    return currentNode.positionStats[source];
  }, [currentNode, source]);

  if (!currentNode) {
    return <div className="text-xs text-lightmode-400 dark:text-darkmode-400 italic">No opening data for this position yet.</div>;
  }

  if (currentNode.loading) {
    return <div className="text-xs text-lightmode-400 dark:text-darkmode-400 italic">Loading position…</div>;
  }

  if (!positionStats) {
    return <div className="text-xs text-lightmode-400 dark:text-darkmode-400 italic">No position stats available.</div>;
  }

  const total = positionStats.total;
  const whitePct = total > 0 ? (positionStats.white / total) * 100 : 0;
  const drawPct = total > 0 ? (positionStats.draws / total) * 100 : 0;
  const blackPct = total > 0 ? (positionStats.black / total) * 100 : 0;

  return (
    <div className="space-y-3 text-xs">
      <div className="rounded-md border border-lightmode-900/10 dark:border-darkmode-100/15 px-2 py-1.5 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-lightmode-400 dark:text-darkmode-400 uppercase tracking-wide">ECO</span>
          {ecoEntry?.eco && <span className="tabular-nums font-medium">{ecoEntry.eco}</span>}
        </div>
        <div className="font-medium leading-snug">
          {ecoEntry?.name || "Root position"}
        </div>
      </div>

      <div className="rounded-md border border-lightmode-900/10 dark:border-darkmode-100/15 px-2 py-1.5 space-y-2">
        <div className="flex items-center justify-between text-lightmode-400 dark:text-darkmode-400">
          <span className="uppercase tracking-wide">{source}</span>
          <span>{compactNumber.format(total)} games</span>
        </div>
        <div className="text-lightmode-400 dark:text-darkmode-400 tabular-nums">
          W {toPercent(whitePct)} · D {toPercent(drawPct)} · B {toPercent(blackPct)}
        </div>
      </div>
    </div>
  );
};

export default OpeningView;

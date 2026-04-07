import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { formatMoveLine, getSanHistoryFromPathId } from "@/shared/chess";
import { RootState } from "@/store";
import { selectCurrentVisibleId, selectTreeNodeMap, selectTreeSource } from "@/store/selectors";
import { OpeningBookEntry } from "@/types";
import PositionDetailsMetadata from "./PositionDetailsMetadata";
import PositionDetailsTheory from "./PositionDetailsTheory";
import "./PositionDetailsView.css";

const useOpeningEntry = (currentVisibleId: string) => {
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

  return ecoEntry;
};

const PositionDetailsView = () => {
  const currentVisibleId = useSelector((s: RootState) => selectCurrentVisibleId(s));
  const source = useSelector((s: RootState) => selectTreeSource(s));
  const nodeMap = useSelector((s: RootState) => selectTreeNodeMap(s));

  const currentNode = nodeMap[currentVisibleId];
  const ecoEntry = useOpeningEntry(currentVisibleId);

  const sanMoves = useMemo(() => {
    if (!currentVisibleId) return [];
    return getSanHistoryFromPathId(currentVisibleId);
  }, [currentVisibleId]);
  const recentLine = useMemo(() => formatMoveLine(sanMoves), [sanMoves]);

  const positionStats = currentNode?.positionStats[source] ?? null;
  const openingName = ecoEntry?.name || "Root position";
  const ecoCode = ecoEntry?.eco || "-";
  const totalGames = positionStats?.total ?? 0;

  return (
    <section className="gt-position-details-view">
      <PositionDetailsMetadata
        openingName={openingName}
        ecoCode={ecoCode}
        recentLine={recentLine}
        hasSanMoves={sanMoves.length > 0}
        isLoadingPosition={Boolean(currentNode?.loading)}
        hasCurrentNode={Boolean(currentNode)}
        hasPositionStats={Boolean(positionStats)}
        totalGames={totalGames}
      />

      <PositionDetailsTheory
        currentVisibleId={currentVisibleId}
        openingName={openingName}
        recentLine={recentLine}
        sanMoves={sanMoves}
      />
    </section>
  );
};

export default PositionDetailsView;

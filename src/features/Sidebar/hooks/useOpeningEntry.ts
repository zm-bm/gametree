import { useEffect, useState } from "react";

import { getECOByUciPathIfReady, getECOByUciPathLazy } from "@/shared/opening";
import { OpeningBookEntry } from "@/types";

export const useOpeningEntry = (currentVisibleId: string) => {
  const [ecoEntry, setEcoEntry] = useState<OpeningBookEntry | null>(null);

  useEffect(() => {
    if (!currentVisibleId) {
      setEcoEntry(null);
      return;
    }

    const readyEntry = getECOByUciPathIfReady(currentVisibleId);
    if (readyEntry !== undefined) {
      setEcoEntry(readyEntry);
      return;
    }

    let cancelled = false;

    void getECOByUciPathLazy(currentVisibleId)
      .then((entry) => {
        if (cancelled) return;
        setEcoEntry(entry);
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

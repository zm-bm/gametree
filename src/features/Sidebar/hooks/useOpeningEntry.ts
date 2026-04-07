import { useEffect, useState } from "react";

import { OpeningBookEntry } from "@/types";

export const useOpeningEntry = (currentVisibleId: string) => {
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


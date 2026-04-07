import { useEffect, useState } from "react";

import { filterTheorySnippets } from "@/shared/theory";
import { TheoryLookupResult, TheorySnippet } from "@/types";

const EMPTY_THEORY_RESULT: TheoryLookupResult = {
  snippets: [],
  sourceTitle: null,
  sourceUrl: null,
  strategy: "none",
};

type UseDisplayTheoryArgs = {
  theoryData: TheoryLookupResult | undefined;
  theoryLoading: boolean;
  theoryIsError: boolean;
  openingName: string;
  recentLine: string;
  sanMoves: string[];
};

export const useDisplayTheory = ({
  theoryData,
  theoryLoading,
  theoryIsError,
  openingName,
  recentLine,
  sanMoves,
}: UseDisplayTheoryArgs) => {
  const [displayTheoryData, setDisplayTheoryData] = useState<TheoryLookupResult | null>(null);
  const [displayTheoryError, setDisplayTheoryError] = useState(false);

  useEffect(() => {
    if (theoryLoading) return;

    if (theoryIsError) {
      setDisplayTheoryData(null);
      setDisplayTheoryError(true);
      return;
    }

    setDisplayTheoryError(false);
    const filteredSnippets = theoryData?.snippets
      ? filterTheorySnippets(theoryData.snippets, openingName, recentLine, sanMoves)
      : [];

    if (!theoryData) {
      setDisplayTheoryData({
        ...EMPTY_THEORY_RESULT,
        snippets: filteredSnippets,
      });
      return;
    }

    setDisplayTheoryData({
      ...theoryData,
      snippets: filteredSnippets,
    });
  }, [openingName, recentLine, sanMoves, theoryData, theoryIsError, theoryLoading]);

  return {
    displayTheoryData,
    displayTheoryError,
    hasSettledTheory: displayTheoryData !== null || displayTheoryError,
    theorySnippets: displayTheoryData?.snippets ?? ([] as TheorySnippet[]),
  };
};

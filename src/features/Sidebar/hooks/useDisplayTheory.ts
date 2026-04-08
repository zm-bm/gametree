import { useEffect, useState } from "react";

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
};

export const useDisplayTheory = ({
  theoryData,
  theoryLoading,
  theoryIsError,
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
    if (!theoryData) {
      setDisplayTheoryData({
        ...EMPTY_THEORY_RESULT,
        snippets: [],
      });
      return;
    }

    setDisplayTheoryData({
      ...theoryData,
    });
  }, [theoryData, theoryIsError, theoryLoading]);

  return {
    displayTheoryData,
    displayTheoryError,
    hasSettledTheory: displayTheoryData !== null || displayTheoryError,
    theorySnippets: displayTheoryData?.snippets ?? ([] as TheorySnippet[]),
  };
};

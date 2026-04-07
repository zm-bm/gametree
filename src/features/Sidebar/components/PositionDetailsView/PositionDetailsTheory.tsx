import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/shared/cn";
import { theoryApi } from "@/store/theoryApi";
import { useDisplayTheory } from "./useDisplayTheory";

const THEORY_EXPAND_THRESHOLD = 320;

type PositionDetailsTheoryProps = {
  currentVisibleId: string;
  openingName: string;
  recentLine: string;
  sanMoves: string[];
};

const getTheoryPlaceholderText = (hasSettledTheory: boolean, hasTheoryError: boolean) => {
  if (!hasSettledTheory) return "Loading opening note...";
  if (hasTheoryError) return "Wikibooks note unavailable.";
  return "No Wikibooks note for this position yet (possibly past available opening theory).";
};

const PositionDetailsTheory = ({
  currentVisibleId,
  openingName,
  recentLine,
  sanMoves,
}: PositionDetailsTheoryProps) => {
  const {
    data: theoryData,
    isFetching: theoryLoading,
    isError: theoryIsError,
  } = theoryApi.useGetTheoryByNodeQuery({
    nodeId: currentVisibleId || "",
  });
  const {
    displayTheoryData,
    displayTheoryError,
    hasSettledTheory,
    theorySnippets,
  } = useDisplayTheory({
    theoryData,
    theoryLoading,
    theoryIsError,
    openingName,
    recentLine,
    sanMoves,
  });
  const placeholderText = getTheoryPlaceholderText(hasSettledTheory, displayTheoryError);
  const sourceUrl = displayTheoryData?.sourceUrl ?? null;

  const [theoryExpanded, setTheoryExpanded] = useState(false);
  const theoryBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (theoryExpanded || !theoryBoxRef.current) return;
    theoryBoxRef.current.scrollTop = 0;
  }, [theoryExpanded]);

  const theoryChars = useMemo(
    () => theorySnippets.reduce((totalChars, snippet) => totalChars + snippet.text.length, 0),
    [theorySnippets],
  );

  const hasTheorySnippets = theorySnippets.length > 0;
  const canExpandTheory = theorySnippets.length > 1 || theoryChars > THEORY_EXPAND_THRESHOLD;
  const showingTheoryPlaceholder = !hasTheorySnippets;
  const theoryContentClass = showingTheoryPlaceholder
    ? "gt-position-details-theory-box--collapsed gt-position-details-theory-box--placeholder"
    : theoryExpanded
      ? "gt-position-details-theory-box--expanded gt-position-details-theory-scroll gt-theory-scroll"
      : "gt-position-details-theory-box--collapsed";
  const showActionRow = (hasTheorySnippets && Boolean(sourceUrl)) || (hasTheorySnippets && canExpandTheory);
  const showSourceLink = hasTheorySnippets && Boolean(sourceUrl);
  const showExpandToggle = hasTheorySnippets && canExpandTheory;

  return (
    <div className="gt-position-details-theory">
      <div className="gt-position-details-theory-stack">
        <div ref={theoryBoxRef} className={cn("gt-position-details-theory-box", theoryContentClass)}>
          {showingTheoryPlaceholder ? (
            <p className="gt-position-details-theory-placeholder">{placeholderText}</p>
          ) : (
            <div className="gt-position-details-theory-snippets">
              {theorySnippets.map((snippet, idx) => (
                <div
                  key={`${idx}-${snippet.kind}-${snippet.text.slice(0, 24)}`}
                  className={snippet.kind === "heading" ? "gt-position-details-theory-heading" : "gt-position-details-theory-paragraph"}
                  dangerouslySetInnerHTML={{ __html: snippet.html }}
                >
                </div>
              ))}
            </div>
          )}
          {!showingTheoryPlaceholder && !theoryExpanded && canExpandTheory ? (
            <div className="gt-position-details-theory-fade" />
          ) : null}
        </div>

        {showActionRow ? (
          <div className="gt-position-details-theory-actions">
            {showSourceLink ? (
              <a
                href={sourceUrl!}
                target="_blank"
                rel="noreferrer"
                className="gt-position-details-theory-source-link"
              >
                Source
              </a>
            ) : (
              <span />
            )}
            {showExpandToggle ? (
              <button
                type="button"
                onClick={() => setTheoryExpanded((expanded) => !expanded)}
                className="gt-position-details-theory-toggle"
              >
                {theoryExpanded ? "Show less theory" : "Show more theory"}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PositionDetailsTheory;

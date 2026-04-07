import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/shared/cn";
import { useDisplayTheory } from "@/features/Sidebar/hooks/useDisplayTheory";
import { theoryApi } from "@/store/theoryApi";
import "./PositionTheory.css";

const THEORY_EXPAND_THRESHOLD = 320;

type PositionTheoryProps = {
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

const PositionTheory = ({
  currentVisibleId,
  openingName,
  recentLine,
  sanMoves,
}: PositionTheoryProps) => {
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

  useEffect(() => {
    if (!theoryBoxRef.current) return;
    theoryBoxRef.current.scrollTop = 0;
  }, [currentVisibleId]);

  const theoryChars = useMemo(
    () => theorySnippets.reduce((totalChars, snippet) => totalChars + snippet.text.length, 0),
    [theorySnippets],
  );

  const hasTheorySnippets = theorySnippets.length > 0;
  const canExpandTheory = theorySnippets.length > 1 || theoryChars > THEORY_EXPAND_THRESHOLD;
  const showingTheoryPlaceholder = !hasTheorySnippets;
  const theoryContentClass = showingTheoryPlaceholder
    ? "gt-position-theory-box--collapsed gt-position-theory-box--placeholder"
    : theoryExpanded
      ? "gt-position-theory-box--expanded gt-position-theory-scroll gt-theory-scroll"
      : "gt-position-theory-box--collapsed";
  const showActionRow = (hasTheorySnippets && Boolean(sourceUrl)) || (hasTheorySnippets && canExpandTheory);
  const showSourceLink = hasTheorySnippets && Boolean(sourceUrl);
  const showExpandToggle = hasTheorySnippets && canExpandTheory;

  return (
    <div className="gt-position-theory">
      <div className="gt-position-theory-stack">
        <div ref={theoryBoxRef} className={cn("gt-position-theory-box", theoryContentClass)}>
          {showingTheoryPlaceholder ? (
            <p className="gt-position-theory-placeholder">{placeholderText}</p>
          ) : (
            <div className="gt-position-theory-snippets">
              {theorySnippets.map((snippet, idx) => (
                <div
                  key={`${idx}-${snippet.kind}-${snippet.text.slice(0, 24)}`}
                  className={snippet.kind === "heading" ? "gt-position-theory-heading" : "gt-position-theory-paragraph"}
                  dangerouslySetInnerHTML={{ __html: snippet.html }}
                >
                </div>
              ))}
            </div>
          )}
          {!showingTheoryPlaceholder && !theoryExpanded && canExpandTheory ? (
            <div className="gt-position-theory-fade" />
          ) : null}
        </div>

        {showActionRow ? (
          <div className="gt-position-theory-actions">
            {showSourceLink ? (
              <a
                href={sourceUrl!}
                target="_blank"
                rel="noreferrer"
                className="gt-position-theory-source-link"
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
                className="gt-position-theory-toggle"
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

export default PositionTheory;

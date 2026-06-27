import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

import { useDisplayTheory } from "@/features/Sidebar/hooks/useDisplayTheory";
import { RootState } from "@/store";
import { selectCurrentVisibleId } from "@/store/selectors";
import { theoryApi } from "@/store/theoryApi";
import "./PositionTheory.css";

type PositionTheoryProps = {
  currentVisibleId?: string;
};

const getTheoryPlaceholderText = (hasSettledTheory: boolean, hasTheoryError: boolean) => {
  if (!hasSettledTheory) return "Loading opening note...";
  if (hasTheoryError) return "Wikibooks note unavailable.";
  return "No Wikibooks note for this position yet (possibly past available opening theory).";
};

const PositionTheory = ({ currentVisibleId }: PositionTheoryProps) => {
  const selectedCurrentVisibleId = useSelector((s: RootState) => selectCurrentVisibleId(s));
  const resolvedCurrentVisibleId = currentVisibleId ?? selectedCurrentVisibleId;

  const {
    data: theoryData,
    isFetching: theoryLoading,
    isError: theoryIsError,
  } = theoryApi.useGetTheoryByNodeQuery({ nodeId: resolvedCurrentVisibleId || "" });

  const {
    displayTheoryData,
    displayTheoryError,
    hasSettledTheory,
    theorySnippets,
  } = useDisplayTheory({
    theoryData,
    theoryLoading,
    theoryIsError,
  });

  const placeholderText = getTheoryPlaceholderText(hasSettledTheory, displayTheoryError);
  const sourceUrl = displayTheoryData?.sourceUrl ?? null;
  const hasTheorySnippets = theorySnippets.length > 0;
  const showSourceLink = hasTheorySnippets && Boolean(sourceUrl);
  const theoryBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!theoryBoxRef.current) return;
    theoryBoxRef.current.scrollTop = 0;
  }, [resolvedCurrentVisibleId]);

  return (
    <div className="gt-position-theory">
      <div
        ref={theoryBoxRef}
        className={`gt-position-theory-scrollable gt-position-theory-scroll ${!hasTheorySnippets ? "gt-position-theory-scrollable--placeholder" : ""}`}
      >
        {!hasTheorySnippets ? (
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

        {showSourceLink ? (
          <a
            href={sourceUrl!}
            target="_blank"
            rel="noreferrer"
            className="gt-position-theory-source-link"
          >
            Source
          </a>
        ) : null}
      </div>
    </div>
  );
};

export default PositionTheory;

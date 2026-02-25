import { useSelector } from "react-redux";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import { RootState } from "@/store";
import { selectTreeFrequencyMin, selectTreeSource } from "@/store/selectors";

interface Props {
  openingsError?: boolean;
  openingsErrorData?: FetchBaseQueryError | SerializedError;
}

const getOpeningsErrorLabel = (error?: FetchBaseQueryError | SerializedError): string => {
  if (!error) return "Openings unavailable";

  if ("status" in error) {
    const { status } = error;

    if (typeof status === "number") {
      if (status === 401) return "Openings: Unauthorized";
      if (status === 403) return "Openings: Forbidden";
      if (status === 404) return "Openings: Not found";
      if (status === 429) return "Openings: Rate limited";
      if (status >= 500) return "Openings: Server error";
      return `Openings: HTTP ${status}`;
    }

    if (status === "FETCH_ERROR") return "Openings: Network error";
    if (status === "TIMEOUT_ERROR") return "Openings: Request timeout";
    if (status === "PARSING_ERROR") {
      const originalStatus = error.originalStatus;
      if (originalStatus === 429) return "Openings: Rate limited";
      if (originalStatus === 401) return "Openings: Unauthorized";
      if (originalStatus === 403) return "Openings: Forbidden";
      if (originalStatus && originalStatus >= 500) return "Openings: Server error";
      return "Openings: Invalid response";
    }
    if (status === "CUSTOM_ERROR") return "Openings unavailable";
  }

  return "Openings unavailable";
};

export const TreeChips = ({ openingsError = false, openingsErrorData }: Props) => {
  const source = useSelector((s: RootState) => selectTreeSource(s));
  const frequencyMin = useSelector((s: RootState) => selectTreeFrequencyMin(s));
  const openingsErrorLabel = getOpeningsErrorLabel(openingsErrorData);

  return (
    <div className="flex flex-row gap-2 text-xs *:px-1.5 *:py-0.5">
      <div className="treeview-card select-none">
        Games: {source === 'lichess' ? 'Lichess' : 'Masters'}
      </div>
      <div className="treeview-card select-none">
        Moves {`≥${frequencyMin}`}%
      </div>
      {openingsError && (
        <div className="treeview-card select-none border border-red-500/40 text-red-300">
          {openingsErrorLabel}
        </div>
      )}
    </div>
  );
};

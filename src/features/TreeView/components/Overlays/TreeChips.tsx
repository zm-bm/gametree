import { useSelector } from "react-redux";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import { RootState } from "@/store";
import { selectTreeFrequencyMin, selectTreeSource } from "@/store/selectors";

interface Props {
  openingsLoading?: boolean;
  openingsError?: boolean;
  openingsErrorData?: FetchBaseQueryError | SerializedError;
  onRetry?: () => void;
}

type HeaderStatus = "ready" | "loading" | "error";

const getHttpStatus = (error?: FetchBaseQueryError | SerializedError): number | null => {
  if (!error || !("status" in error)) return null;
  if (typeof error.status === "number") return error.status;
  if (error.status === "PARSING_ERROR") return error.originalStatus ?? null;
  return null;
};

const resolveStatus = (
  isLoading: boolean,
  error?: FetchBaseQueryError | SerializedError
): HeaderStatus => {
  if (isLoading) return "loading";
  if (!error || !("status" in error)) return "ready";
  return "error";
};

const STATUS_TONE_CLASS: Record<HeaderStatus, string> = {
  ready: "treeview-tone-success",
  loading: "treeview-tone-info",
  error: "treeview-tone-error",
};

const CHIP_BASE_CLASS = "treeview-card px-1.5 py-0.5 cursor-default text-center";

const formatErrorLabel = (error?: FetchBaseQueryError | SerializedError): string => {
  const code = getHttpStatus(error);

  if (code === 429) return "rate limited (429)";
  if (code === 401) return "request unauthorized (401)";
  if (code === 403) return "request forbidden (403)";
  if (code === 404) return "resource not found (404)";
  if (code !== null && code >= 500) return `server error (${code})`;
  if (code !== null) return `request failed (${code})`;

  if (error && "status" in error) {
    if (error.status === "TIMEOUT_ERROR") return "request timed out";
    if (error.status === "PARSING_ERROR") return "invalid response format";
    if (error.status === "FETCH_ERROR") return "request failed";
  }

  return "request failed";
};

export const TreeChips = ({
  openingsLoading = false,
  openingsError = false,
  openingsErrorData,
  onRetry,
}: Props) => {
  const source = useSelector((s: RootState) => selectTreeSource(s));
  const frequencyMin = useSelector((s: RootState) => selectTreeFrequencyMin(s));

  const effectiveError = openingsError ? openingsErrorData : undefined;
  const status = resolveStatus(openingsLoading, effectiveError);
  const statusToneClass = STATUS_TONE_CLASS[status];
  const canRetry = Boolean(onRetry) && status === "error";

  return (
    <div className="flex flex-row items-center gap-2 text-xs">
      <div className={`${CHIP_BASE_CLASS} interactive-treeview`}>{source} games</div>
      <div className={`${CHIP_BASE_CLASS} interactive-treeview`}>moves ≥ {frequencyMin}%</div>
      <div
        className={`${CHIP_BASE_CLASS} ${statusToneClass} interactive-treeview`}
      >
        {(status === "ready" || status === "loading") ? status : formatErrorLabel(effectiveError)}
      </div>
      {canRetry && (
        <button
          type="button"
          className={`${CHIP_BASE_CLASS} leading-none interactive-treeview`}
          onClick={onRetry}
          aria-label="Retry openings request"
        >
          ↻
        </button>
      )}
    </div>
  );
};

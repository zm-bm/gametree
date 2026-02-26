import { OpeningsQueryError, getOpeningsHttpStatus } from "@/store/openingsApi";

interface Props {
  hasTree: boolean;
  isError: boolean;
  isFetching: boolean;
  error?: OpeningsQueryError;
  onRetry: () => void;
}

const getInitialTreeLoadErrorText = (error?: OpeningsQueryError): string => {
  const code = getOpeningsHttpStatus(error);

  if (code === 429) return "The openings service is rate limiting requests. Please retry shortly.";
  if (code === 401) return "The openings request was unauthorized.";
  if (code === 403) return "The openings request was forbidden.";
  if (code === 404) return "The openings endpoint was not found.";
  if (code !== null && code >= 500) return `The openings service returned a server error (${code}).`;
  if (code !== null) return `The openings request failed (${code}).`;

  if (error && "status" in error) {
    if (error.status === "TIMEOUT_ERROR") return "The openings request timed out.";
    if (error.status === "FETCH_ERROR") return "The openings request failed. Please check your connection and retry.";
    if (error.status === "PARSING_ERROR") return "The openings service returned an invalid response.";
  }

  return "The openings request failed before the tree could load.";
};

const getTreeExpansionErrorText = (error?: OpeningsQueryError): string => {
  const code = getOpeningsHttpStatus(error);

  if (code === 429) return "Could not load additional moves right now (rate limited).";
  if (code === 401) return "Could not load additional moves (unauthorized request).";
  if (code === 403) return "Could not load additional moves (forbidden request).";
  if (code === 404) return "Could not load additional moves (endpoint not found).";
  if (code !== null && code >= 500) return `Could not load additional moves (server error ${code}).`;
  if (code !== null) return `Could not load additional moves (${code}).`;

  if (error && "status" in error) {
    if (error.status === "TIMEOUT_ERROR") return "Could not load additional moves (request timed out).";
    if (error.status === "FETCH_ERROR") return "Could not load additional moves (request failed).";
    if (error.status === "PARSING_ERROR") return "Could not load additional moves (invalid response).";
  }

  return "Could not load additional moves.";
};

export const TreeErrorOverlays = ({ hasTree, isError, isFetching, error, onRetry }: Props) => {
  const isInitialTreeLoadError = !hasTree && isError && !isFetching;
  const isTreeExpansionError = hasTree && isError && !isFetching;

  if (!isInitialTreeLoadError && !isTreeExpansionError) return null;

  return (
    <>
      {isInitialTreeLoadError && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="treeview-card w-full max-w-md p-4 text-center">
            <p className="text-sm font-medium text-primary">Unable to load tree</p>
            <p className="mt-1 text-xs text-secondary">{getInitialTreeLoadErrorText(error)}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 treeview-card px-2 py-1 text-xs interactive-treeview"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {isTreeExpansionError && (
        <div className="pointer-events-none absolute top-11 left-1/2 -translate-x-1/2 px-2">
          <div className="pointer-events-auto treeview-card treeview-tone-warning flex items-center gap-2 px-2 py-1 text-xs">
            <span>{getTreeExpansionErrorText(error)}</span>
            <button
              type="button"
              onClick={onRetry}
              className="treeview-card px-1.5 py-0.5 leading-none interactive-treeview"
              aria-label="Retry loading additional moves"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </>
  );
};

import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { SerializedError } from '@reduxjs/toolkit';

import { OpeningTotals } from "../shared/types";

const API_URL =
  typeof window === 'undefined'
    ? 'http://localhost/api'
    : `${window.location.origin}/api`;

export interface GetOpeningsArgs {
  nodeId: string,
};

export type GetOpeningsResponse = OpeningTotals;

export type OpeningsQueryError = FetchBaseQueryError | SerializedError;

export const getOpeningsHttpStatus = (error?: OpeningsQueryError): number | null => {
  if (!error || !("status" in error)) return null;
  if (typeof error.status === "number") return error.status;
  if (error.status === "PARSING_ERROR") return error.originalStatus ?? null;
  return null;
};

const buildPlayArray = (nodeId: string): string[] =>
  nodeId ? nodeId.split(',') : [];

export const openingsApi = createApi({
  reducerPath: 'openingsApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  endpoints: (build) => ({
    getNodes: build.query<GetOpeningsResponse, GetOpeningsArgs>({
      query: ({ nodeId }) => ({
        url: 'totals',
        method: 'POST',
        body: {
          play: buildPlayArray(nodeId),
        },
      }),
    }),
  }),
});

import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { SerializedError } from '@reduxjs/toolkit';

import { LcOpeningData, TreeSource } from "../shared/types";

const API_URL = '/api';

export interface GetOpeningsArgs {
  nodeId: string,
  source: TreeSource,
};

export interface GetOpeningsResponse {
  otb?: LcOpeningData,
  online?: LcOpeningData,
};

interface SourceTotalsPayload {
  white: number;
  draws: number;
  black: number;
  total: number;
  moves: LcOpeningData['moves'];
}

interface GetOpeningsTotalsResponse {
  play: string[];
  otb: SourceTotalsPayload;
  online: SourceTotalsPayload;
}

export type OpeningsQueryError = FetchBaseQueryError | SerializedError;

export const getOpeningsHttpStatus = (error?: OpeningsQueryError): number | null => {
  if (!error || !("status" in error)) return null;
  if (typeof error.status === "number") return error.status;
  if (error.status === "PARSING_ERROR") return error.originalStatus ?? null;
  return null;
};

const buildPlayArray = (nodeId: string): string[] =>
  nodeId ? nodeId.split(',') : [];

const isSourceTotalsPayload = (value: unknown): value is SourceTotalsPayload => {
  if (!value || typeof value !== 'object') return false;
  return Array.isArray((value as { moves?: unknown }).moves);
};

const isOpeningsTotalsResponse = (value: unknown): value is GetOpeningsTotalsResponse => {
  if (!value || typeof value !== 'object') return false;

  const payload = value as {
    play?: unknown;
    otb?: unknown;
    online?: unknown;
  };

  return (
    Array.isArray(payload.play)
    && isSourceTotalsPayload(payload.otb)
    && isSourceTotalsPayload(payload.online)
  );
};

const createInvalidFormatError = (data: unknown): FetchBaseQueryError => ({
  status: 'CUSTOM_ERROR',
  error: 'Unexpected openings response format',
  data,
});

const fetchTotals = async (
  play: string[],
): Promise<{ data: GetOpeningsResponse } | { error: FetchBaseQueryError }> => {
  try {
    const response = await fetch(`${API_URL}/totals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ play }),
    });

    if (!response.ok) {
      return { error: { status: response.status, data: await response.text() } };
    }

    const payload: unknown = await response.json();
    if (!isOpeningsTotalsResponse(payload)) {
      return { error: createInvalidFormatError(payload) };
    }

    return {
      data: {
        otb: {
          source: 'otb',
          play: payload.play,
          white: payload.otb.white,
          draws: payload.otb.draws,
          black: payload.otb.black,
          total: payload.otb.total,
          moves: payload.otb.moves,
        },
        online: {
          source: 'online',
          play: payload.play,
          white: payload.online.white,
          draws: payload.online.draws,
          black: payload.online.black,
          total: payload.online.total,
          moves: payload.online.moves,
        },
      },
    };
  } catch (e) {
    return { error: { status: 'FETCH_ERROR', error: String(e), data: undefined } };
  }
};

export const openingsApi = createApi({
  reducerPath: 'openingsApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  endpoints: (build) => ({
    getNodes: build.query<GetOpeningsResponse, GetOpeningsArgs>({
      async queryFn(args) {
        const play = buildPlayArray(args.nodeId);
        return fetchTotals(play);
      },
    }),
  }),
});

import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'

import { LcOpeningData, TreeSource } from "../shared/types";

export interface GetOpeningsArgs {
  nodeId: string,
  source: TreeSource,
};

export interface GetOpeningsResponse {
  lichess?: LcOpeningData,
  masters?: LcOpeningData,
};

type OpeningsQueryRunner = (
  args: { url: string; responseHandler: (response: Response) => Promise<unknown> }
) => Promise<{ data?: unknown; error?: FetchBaseQueryError }>;

type OpeningDataResult = { data: LcOpeningData } | { error: FetchBaseQueryError };

function buildOpeningsQuery(args: GetOpeningsArgs) {
  const { nodeId, source } = args;
  if (nodeId === '') {
    return `${source}?play=${nodeId}&moves=20`;
  } else {
    return `${source}?play=${nodeId}`;
  }
}

const parseOpeningsResponse = async (response: Response): Promise<unknown> => {
  const body = await response.text();
  if (!body) return null;

  const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }

  return body;
};

const isOpeningDataPayload = (value: unknown): value is LcOpeningData => {
  if (!value || typeof value !== 'object') return false;
  return Array.isArray((value as { moves?: unknown }).moves);
};

const createInvalidFormatError = (data: unknown): FetchBaseQueryError => ({
  status: 'CUSTOM_ERROR',
  error: 'Unexpected openings response format',
  data,
});

const fetchOpeningData = async (
  runQuery: OpeningsQueryRunner,
  requestArgs: GetOpeningsArgs
): Promise<OpeningDataResult> => {
  const query = buildOpeningsQuery(requestArgs);
  const result = await runQuery({ url: query, responseHandler: parseOpeningsResponse });

  if (result.error) return { error: result.error };
  if (!isOpeningDataPayload(result.data)) return { error: createInvalidFormatError(result.data) };

  return { data: result.data };
};

export const openingsApi = createApi({
  reducerPath: 'openingsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://explorer.lichess.ovh/' }),
  endpoints: (build) => ({
    getNodes: build.query<GetOpeningsResponse, GetOpeningsArgs>({
      async queryFn(args, _queryApi, _extra, fetchBaseQuery) {
        const runQuery = fetchBaseQuery as OpeningsQueryRunner;
        const r1 = await fetchOpeningData(runQuery, args);
        if ('error' in r1) return r1;

        const secondarySource: TreeSource = args.source === 'lichess' ? 'masters' : 'lichess';
        const r2 = await fetchOpeningData(runQuery, { ...args, source: secondarySource });
        if ('error' in r2) return r2;

        return {
          data: {
            [args.source]: r1.data,
            [secondarySource]: r2.data,
          },
        };
      },
    }),
  }),
});

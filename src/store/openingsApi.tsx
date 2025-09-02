import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'

import { LcOpeningData, TreeSource } from "../shared/types";

export interface GetNodesArgs {
  nodeId: string,
  source: TreeSource,
};

export interface GetNodesResponse {
  lichess?: LcOpeningData,
  masters?: LcOpeningData,
};

function getQuery(args: GetNodesArgs) {
  const { nodeId, source } = args;
  if (nodeId === '') {
    return `${source}?play=${nodeId}&moves=20`;
  } else {
    return `${source}?play=${nodeId}`;
  }
}

export const openingsApi = createApi({
  reducerPath: 'openingsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://explorer.lichess.ovh/' }),
  endpoints: (build) => ({
    getNodes: build.query<GetNodesResponse, GetNodesArgs>({
      async queryFn(args, _queryApi, _extra, fetchBaseQuery) {
        const q1 = getQuery(args);
        const r1 = await fetchBaseQuery(q1);
        if ('error' in r1) return { error: r1.error as FetchBaseQueryError };

        const source2: TreeSource = args.source === 'lichess' ? 'masters' : 'lichess';
        const q2 = getQuery({ ...args, source: source2 });
        const r2 = await fetchBaseQuery(q2);
        if ('error' in r2) return { error: r2.error as FetchBaseQueryError };

        return {
          data: {
            [args.source]: r1.data as GetNodesResponse[typeof args.source],
            [source2]: r2.data as GetNodesResponse[typeof source2],
          },
        };
      },
    }),
  }),
});

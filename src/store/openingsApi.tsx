import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { LcOpeningStats, TreeSource } from "../shared/types";
import tree  from './slices/tree';

export interface GetOpeningsArgs {
  nodeId: string,
  source: TreeSource,
}

function getQuery(args: GetOpeningsArgs) {
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
  endpoints: (builder) => ({
    getOpenings: builder.query<LcOpeningStats, GetOpeningsArgs>({
      query: getQuery,
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          // query the first source
          const { data } = await queryFulfilled;
          dispatch(tree.actions.addOpenings({ openingStats: data, ...args }));

          // then query the second source (to avoid rate limiting)
          const source2 = args.source === 'lichess' ? 'masters' : 'lichess';
          const response = await fetch(`https://explorer.lichess.ovh/${getQuery({ ...args, source: source2 })}`);
          const data2 = await response.json();
          dispatch(tree.actions.addOpenings({ openingStats: data2, nodeId: args.nodeId, source: source2 }));
        } catch(error) {
          console.error('Query failed:', error)
        }
      }
    }),
  }),
})

export const { useGetOpeningsQuery } = openingsApi;

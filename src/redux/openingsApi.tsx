import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { pathId } from '../lib/chess'
import { LcOpeningStats, MovePath, TreeSource } from "../types/chess";
import { AddOpenings } from './treeSlice';


export interface GetOpeningsArgs {
  path: MovePath,
  source: TreeSource,
}

function getQuery(args: GetOpeningsArgs) {
  const { path, source } = args;
  return `${source}?play=${pathId(path)}&moves=20`;
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
          dispatch(AddOpenings({ openingStats: data, ...args }));

          // then query the second source (to avoid rate limiting)
          const source2 = args.source === 'lichess' ? 'masters' : 'lichess';
          const response = await fetch(`https://explorer.lichess.ovh/${getQuery({ ...args, source: source2 })}`);
          const data2 = await response.json();
          dispatch(AddOpenings({ openingStats: data2, path: args.path, source: source2 }));
        } catch(error) {
          console.error('Query failed:', error)
        }
      }
    }),
  }),
})

export const { useGetOpeningsQuery } = openingsApi;

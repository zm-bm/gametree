import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Move } from 'chess.js'
import { movesToString } from '../chess'
import { LichessOpenings } from "../types/chess";
import { AddOpenings } from './treeSlice';

export type TreeSource = 'masters' | 'lichess';
export interface GetOpeningsArgs {
  moves: Move[],
  source: TreeSource,
}

export const openingsApi = createApi({
  reducerPath: 'openingsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://explorer.lichess.ovh/' }),
  endpoints: (builder) => ({
    getOpenings: builder.query<LichessOpenings, GetOpeningsArgs>({
      query: (args) => `${args.source}?play=${movesToString(args.moves)}`,
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const { moves } = args;
          dispatch(AddOpenings({ openings: data, moves }));
        } catch(error) {
          console.error('Query failed:', error)
        }
      }
    }),
  }),
})

export const { useGetOpeningsQuery } = openingsApi;

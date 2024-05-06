import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Move } from 'chess.js'
import { LichessOpenings, movesToString } from '../chess'

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
    }),
  }),
})

export const { useGetOpeningsQuery } = openingsApi;

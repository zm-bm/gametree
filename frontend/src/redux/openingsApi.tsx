import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Move } from 'chess.js'
import { LichessOpenings, movesToString } from '../chess'

export const openingsApi = createApi({
  reducerPath: 'openingsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://explorer.lichess.ovh/' }),
  endpoints: (builder) => ({
    getOpeningByMoves: builder.query<LichessOpenings, Move[]>({
      query: (moves) => `lichess?play=${movesToString(moves)}`,
    }),
  }),
})

export const { useGetOpeningByMovesQuery } = openingsApi

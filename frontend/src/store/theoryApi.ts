import type { QueryReturnValue } from '@reduxjs/toolkit/query';
import {
  createApi,
  fetchBaseQuery,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import { getSanHistoryFromPathId } from '@/shared/chess';
import {
  DEFAULT_THEORY_EXTRA_SECTIONS,
  extractTheorySnippets,
  getExactTheoryTitles,
  getFenField,
  normalizeTheoryTitle,
} from '@/shared/theory';
import {
  GetTheoryArgs,
  MediaWikiParseResponse,
  MediaWikiSearchResponse,
  TheoryLookupResult,
  TheorySnippet,
  TheoryStrategy,
} from '@/types';

const WIKIBOOK_ROOT = 'https://en.wikibooks.org';
const WIKIBOOK_API = `${WIKIBOOK_ROOT}/w/api.php`;
const WIKIBOOK_SEARCH_LIMIT = 5;
type TheoryCandidate = { title: string; strategy: Exclude<TheoryStrategy, 'none'> };

type TheoryLookupQueryResult =
  | { data: TheoryLookupResult }
  | { error: FetchBaseQueryError };

type FetchWithBaseQuery = (
  arg: string,
) =>
  | QueryReturnValue<unknown, FetchBaseQueryError, unknown>
  | PromiseLike<QueryReturnValue<unknown, FetchBaseQueryError, unknown>>;

const toCustomError = (error: string): FetchBaseQueryError => ({
  status: 'CUSTOM_ERROR',
  error,
});

const isFetchError = (
  result: QueryReturnValue<unknown, FetchBaseQueryError, unknown>,
): result is { error: FetchBaseQueryError } => 'error' in result;

const getTheoryUrl = (title: string) =>
  `${WIKIBOOK_ROOT}/wiki/${encodeURIComponent(normalizeTheoryTitle(title)).replace(/%2F/g, '/')}`;

const buildFenSearchParams = (fenField: string) =>
  new URLSearchParams({
    action: 'query',
    format: 'json',
    origin: '*',
    list: 'search',
    srlimit: String(WIKIBOOK_SEARCH_LIMIT),
    srsearch: `"${fenField}" "Chess Opening Theory"`,
  });

const buildParseParams = (title: string) =>
  new URLSearchParams({
    action: 'parse',
    format: 'json',
    origin: '*',
    redirects: '1',
    prop: 'text',
    page: title,
  });

const fetchFenSearchTitles = async (
  fetchWithBQ: FetchWithBaseQuery,
  fenField: string,
): Promise<{ titles: string[] } | { error: FetchBaseQueryError }> => {
  const searchParams = buildFenSearchParams(fenField);
  const searchResult = await fetchWithBQ(`${WIKIBOOK_API}?${searchParams.toString()}`);
  if (isFetchError(searchResult)) {
    return { error: searchResult.error };
  }

  const searchData = searchResult.data as MediaWikiSearchResponse;
  if (searchData.error) {
    return { error: toCustomError(searchData.error.info || 'Unknown MediaWiki search error') };
  }

  return {
    titles: (searchData.query?.search || [])
      .map((result) => normalizeTheoryTitle(result.title))
      .filter((title) => title.startsWith('Chess_Opening_Theory/')),
  };
};

const fetchParsedTheorySnippets = async (
  fetchWithBQ: FetchWithBaseQuery,
  title: string,
): Promise<{ snippets: TheorySnippet[] | null; missing: boolean } | { error: FetchBaseQueryError }> => {
  const parseParams = buildParseParams(title);
  const parseResult = await fetchWithBQ(`${WIKIBOOK_API}?${parseParams.toString()}`);
  if (isFetchError(parseResult)) {
    return { error: parseResult.error };
  }

  const parseData = parseResult.data as MediaWikiParseResponse;
  if (parseData.error?.code === 'missingtitle') {
    return { snippets: null, missing: true };
  }
  if (parseData.error) {
    return { error: toCustomError(parseData.error.info || 'Unknown MediaWiki parse error') };
  }

  const html = parseData.parse?.text?.['*'] || '';
  return {
    snippets: extractTheorySnippets(html, DEFAULT_THEORY_EXTRA_SECTIONS),
    missing: false,
  };
};

const resolveTheoryLookup = async (
  fetchWithBQ: FetchWithBaseQuery,
  nodeId: string,
): Promise<TheoryLookupQueryResult> => {
  const sanMoves = getSanHistoryFromPathId(nodeId);
  const fenField = getFenField(nodeId);
  const exactPathTitles = getExactTheoryTitles(sanMoves);

  const seenTitles = new Set<string>();
  const tryCandidates = async (
    candidates: TheoryCandidate[],
  ): Promise<TheoryLookupQueryResult | null> => {
    for (const candidate of candidates) {
      const title = normalizeTheoryTitle(candidate.title);
      if (seenTitles.has(title)) continue;
      seenTitles.add(title);

      const parsedResult = await fetchParsedTheorySnippets(fetchWithBQ, title);
      if ('error' in parsedResult) {
        return { error: parsedResult.error };
      }
      if (parsedResult.missing) {
        continue;
      }

      if (parsedResult.snippets && parsedResult.snippets.length > 0) {
        return {
          data: {
            snippets: parsedResult.snippets,
            sourceTitle: title,
            sourceUrl: getTheoryUrl(title),
            strategy: candidate.strategy,
          },
        };
      }
    }

    return null;
  };

  const exactPathResult = await tryCandidates(
    exactPathTitles.map((title) => ({ title, strategy: 'exact-path' as const })),
  );
  if (exactPathResult) {
    return exactPathResult;
  }

  if (fenField && sanMoves.length > 0) {
    const fenSearchResult = await fetchFenSearchTitles(fetchWithBQ, fenField);
    if ('error' in fenSearchResult) {
      return { error: fenSearchResult.error };
    }

    const fenSearchCandidateResult = await tryCandidates(
      fenSearchResult.titles.map((title) => ({ title, strategy: 'fen-search' as const })),
    );
    if (fenSearchCandidateResult) {
      return fenSearchCandidateResult;
    }
  }

  return {
    data: {
      snippets: [],
      sourceTitle: null,
      sourceUrl: null,
      strategy: 'none',
    },
  };
};

export const theoryApi = createApi({
  reducerPath: 'theoryApi',
  baseQuery: fetchBaseQuery(),
  endpoints: (build) => ({
    getTheoryByNode: build.query<TheoryLookupResult, GetTheoryArgs>({
      keepUnusedDataFor: 300,
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const fenField = getFenField(queryArgs.nodeId);
        return `${endpointName}|${fenField}|${DEFAULT_THEORY_EXTRA_SECTIONS}`;
      },
      queryFn: async ({ nodeId }, _api, _extraOptions, fetchWithBQ) => {
        try {
          return await resolveTheoryLookup(fetchWithBQ, nodeId);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown theory lookup error';
          return { error: toCustomError(message) };
        }
      },
    }),
  }),
});

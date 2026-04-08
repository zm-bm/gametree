import { afterEach, describe, expect, it, vi } from 'vitest';

import { setupStore } from './index';
import { theoryApi } from './theoryApi';

const asResponse = (payload: unknown, status = 200): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });

const getRequestUrl = (request: RequestInfo | URL): URL => {
  if (request instanceof Request) return new URL(request.url);
  if (request instanceof URL) return request;
  return new URL(String(request));
};

const readableTheoryHtml = `
  <div class="mw-parser-output">
    <p>
      This opening often leads to dynamic piece play and rapid development,
      with both sides contesting central influence from the earliest moves.
    </p>
  </div>
`;

const theoryWithHeadingHtml = `
  <div class="mw-parser-output">
    <p>
      Early central pressure often defines these positions, where development
      and pawn structure choices can quickly shape the middlegame plans.
    </p>
    <div class="mw-heading mw-heading1">
      <h2 id="Closed_Sicilian">Closed Sicilian</h2>
      <span class="mw-editsection">
        <span class="mw-editsection-bracket">[</span>
        <a href="/w/index.php?title=Chess_Opening_Theory/1._e4/1...c5/2._Nc3/2...e6&veaction=edit&section=1">edit</a>
        <span class="mw-editsection-divider"> | </span>
        <a href="/w/index.php?title=Chess_Opening_Theory/1._e4/1...c5/2._Nc3/2...e6&action=edit&section=1">edit source</a>
        <span class="mw-editsection-bracket">]</span>
      </span>
    </div>
    <p>
      White can choose <strong><a href="/wiki/Chess_Opening_Theory/1._d4/1...Nf6/2._c4">c4</a></strong> to claim space, while Black may
      counter with <em>...d5</em> setups and piece pressure against the center.
    </p>
  </div>
`;

describe('theoryApi.getTheoryByNode', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prefers exact move-path titles over FEN transposition results', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (request) => {
      const url = getRequestUrl(request);
      const action = url.searchParams.get('action');

      if (action === 'query') {
        return asResponse({
          query: {
            search: [{ title: 'Chess Opening Theory/1. e3/1...e5/2. e4' }],
          },
        });
      }

      if (action === 'parse') {
        const page = url.searchParams.get('page');
        if (page === 'Chess_Opening_Theory/1._e4') {
          return asResponse({ parse: { text: { '*': readableTheoryHtml } } });
        }
        if (page === 'Chess_Opening_Theory/1._e3/1...e5/2._e4') {
          return asResponse({ parse: { text: { '*': readableTheoryHtml } } });
        }
        return asResponse({ error: { code: 'missingtitle', info: 'Missing title' } });
      }

      return asResponse({}, 500);
    });

    const store = setupStore();
    const request = store.dispatch(theoryApi.endpoints.getTheoryByNode.initiate({ nodeId: 'e2e4' }));

    try {
      await expect(request.unwrap()).resolves.toMatchObject({
        strategy: 'exact-path',
        sourceTitle: 'Chess_Opening_Theory/1._e4',
      });
      const queryCalls = fetchMock.mock.calls
        .map(([requestArg]) => getRequestUrl(requestArg))
        .filter((url) => url.searchParams.get('action') === 'query');
      expect(queryCalls).toHaveLength(0);
      expect(fetchMock).toHaveBeenCalled();
    } finally {
      request.unsubscribe();
    }
  });

  it('tries exact move-path title variants before attempting FEN search', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (request) => {
      const url = getRequestUrl(request);
      const action = url.searchParams.get('action');

      if (action === 'query') {
        return asResponse({ query: { search: [] } });
      }

      if (action === 'parse') {
        const page = url.searchParams.get('page');
        if (page === 'Chess_Opening_Theory/1.e4') {
          return asResponse({ parse: { text: { '*': readableTheoryHtml } } });
        }
        return asResponse({ error: { code: 'missingtitle', info: 'Missing title' } });
      }

      return asResponse({}, 500);
    });

    const store = setupStore();
    const request = store.dispatch(theoryApi.endpoints.getTheoryByNode.initiate({ nodeId: 'e2e4' }));

    try {
      await expect(request.unwrap()).resolves.toMatchObject({
        strategy: 'exact-path',
        sourceTitle: 'Chess_Opening_Theory/1.e4',
      });
      const parsePages = fetchMock.mock.calls
        .map(([requestArg]) => getRequestUrl(requestArg))
        .filter((url) => url.searchParams.get('action') === 'parse')
        .map((url) => url.searchParams.get('page'));
      expect(parsePages).toContain('Chess_Opening_Theory/1._e4');
      expect(parsePages).toContain('Chess_Opening_Theory/1.e4');
      const queryCalls = fetchMock.mock.calls
        .map(([requestArg]) => getRequestUrl(requestArg))
        .filter((url) => url.searchParams.get('action') === 'query');
      expect(queryCalls).toHaveLength(0);
      expect(fetchMock).toHaveBeenCalled();
    } finally {
      request.unsubscribe();
    }
  });

  it('falls back to FEN search transposition titles when exact move-path pages are missing', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (request) => {
      const url = getRequestUrl(request);
      const action = url.searchParams.get('action');

      if (action === 'query') {
        return asResponse({
          query: {
            search: [{ title: 'Chess Opening Theory/1. e3/1...e5/2. e4' }],
          },
        });
      }

      if (action === 'parse') {
        const page = url.searchParams.get('page');
        if (page === 'Chess_Opening_Theory/1._e3/1...e5/2._e4') {
          return asResponse({ parse: { text: { '*': readableTheoryHtml } } });
        }
        return asResponse({ error: { code: 'missingtitle', info: 'Missing title' } });
      }

      return asResponse({}, 500);
    });

    const store = setupStore();
    const request = store.dispatch(theoryApi.endpoints.getTheoryByNode.initiate({ nodeId: 'e2e4' }));

    try {
      await expect(request.unwrap()).resolves.toMatchObject({
        strategy: 'fen-search',
        sourceTitle: 'Chess_Opening_Theory/1._e3/1...e5/2._e4',
      });
    } finally {
      request.unsubscribe();
    }
  });

  it('keeps section headings and inline emphasis, while stripping links and edit markers', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (request) => {
      const url = getRequestUrl(request);
      const action = url.searchParams.get('action');

      if (action === 'query') {
        return asResponse({ query: { search: [] } });
      }

      if (action === 'parse') {
        const page = url.searchParams.get('page');
        if (page === 'Chess_Opening_Theory/1._e4') {
          return asResponse({ parse: { text: { '*': theoryWithHeadingHtml } } });
        }
        return asResponse({ error: { code: 'missingtitle', info: 'Missing title' } });
      }

      return asResponse({}, 500);
    });

    const store = setupStore();
    const request = store.dispatch(theoryApi.endpoints.getTheoryByNode.initiate({ nodeId: 'e2e4' }));

    try {
      const result = await request.unwrap();
      expect(result.snippets.some((snippet) => snippet.kind === 'heading' && snippet.text === 'Closed Sicilian')).toBe(true);
      expect(result.snippets.some((snippet) => snippet.kind === 'paragraph' && snippet.html.includes('<strong>c4</strong>'))).toBe(true);
      expect(result.snippets.some((snippet) => snippet.kind === 'paragraph' && snippet.html.includes('<em>...d5</em>'))).toBe(true);
      expect(result.snippets.every((snippet) => !snippet.html.includes('<a'))).toBe(true);
      expect(result.snippets.every((snippet) => !snippet.html.toLowerCase().includes('edit'))).toBe(true);
      expect(result.snippets.every((snippet) => !snippet.html.toLowerCase().includes('edit source'))).toBe(true);
    } finally {
      request.unsubscribe();
    }
  });

  it('returns a successful empty result when no usable snippets are found', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (request) => {
      const url = getRequestUrl(request);
      const action = url.searchParams.get('action');

      if (action === 'query') {
        return asResponse({ query: { search: [] } });
      }

      if (action === 'parse') {
        return asResponse({
          parse: {
            text: {
              '*': '<div class="mw-parser-output"><table><tr><td>data</td></tr></table></div>',
            },
          },
        });
      }

      return asResponse({}, 500);
    });

    const store = setupStore();
    const request = store.dispatch(theoryApi.endpoints.getTheoryByNode.initiate({ nodeId: 'e2e4' }));

    try {
      await expect(request.unwrap()).resolves.toEqual({
        snippets: [],
        sourceTitle: null,
        sourceUrl: null,
        strategy: 'none',
      });
    } finally {
      request.unsubscribe();
    }
  });

  it('returns an endpoint error for hard API failures', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(asResponse({ message: 'boom' }, 500));

    const store = setupStore();
    const request = store.dispatch(theoryApi.endpoints.getTheoryByNode.initiate({ nodeId: 'e2e4' }));

    try {
      await expect(request.unwrap()).rejects.toMatchObject({ status: 500 });
    } finally {
      request.unsubscribe();
    }
  });

  it('reuses cache for transpositions that resolve to the same FEN field', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (request) => {
      const url = getRequestUrl(request);
      const action = url.searchParams.get('action');
      const page = url.searchParams.get('page');

      if (action === 'parse' && page === 'Chess_Opening_Theory/1._e4/1...e5') {
        return asResponse({ parse: { text: { '*': readableTheoryHtml } } });
      }

      if (action === 'parse') {
        return asResponse({ error: { code: 'missingtitle', info: 'Missing title' } });
      }

      return asResponse({ query: { search: [] } });
    });

    const store = setupStore();
    const requestA = store.dispatch(theoryApi.endpoints.getTheoryByNode.initiate({ nodeId: 'e2e4,e7e5' }));

    try {
      await expect(requestA.unwrap()).resolves.toMatchObject({
        strategy: 'exact-path',
        sourceTitle: 'Chess_Opening_Theory/1._e4/1...e5',
      });
      const callsAfterFirstLookup = fetchMock.mock.calls.length;

      const requestB = store.dispatch(theoryApi.endpoints.getTheoryByNode.initiate({ nodeId: 'e2e3,e7e5,e3e4' }));
      await expect(requestB.unwrap()).resolves.toMatchObject({ strategy: 'exact-path' });
      requestB.unsubscribe();

      expect(fetchMock.mock.calls.length).toBe(callsAfterFirstLookup);
    } finally {
      requestA.unsubscribe();
    }
  });
});

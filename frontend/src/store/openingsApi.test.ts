import { afterEach, describe, expect, it, vi } from 'vitest';

import { OpeningTotals } from '@/types';

import { setupStore } from './index';
import { openingsApi } from './openingsApi';

const asResponse = (payload: unknown, status = 200): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });

describe('openingsApi.getNodes', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns unified totals payload with one shared moves list', async () => {
    const payload: OpeningTotals = {
      play: ['e2e4'],
      otb: { white: 10, draws: 5, black: 4, total: 19 },
      online: { white: 7, draws: 3, black: 8, total: 18 },
      moves: [
        {
          uci: 'e7e5',
          otb: { white: 6, draws: 2, black: 1, total: 9 },
          online: { white: 3, draws: 1, black: 4, total: 8 },
          total: 17,
        },
      ],
    };

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(asResponse(payload));
    const store = setupStore();
    const request = store.dispatch(openingsApi.endpoints.getNodes.initiate({ nodeId: 'e2e4' }));

    try {
      await expect(request.unwrap()).resolves.toEqual(payload);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [requestArg] = fetchMock.mock.calls[0] ?? [];
      expect(requestArg).toBeInstanceOf(Request);
      const requestObj = requestArg as Request;

      expect(requestObj.url).toBe(`${window.location.origin}/api/totals`);
      expect(requestObj.method).toBe('POST');
      await expect(requestObj.clone().json()).resolves.toEqual({ play: ['e2e4'] });
    } finally {
      request.unsubscribe();
    }
  });

  it('builds play array from nodeId path', async () => {
    const payload: OpeningTotals = {
      play: ['e2e4', 'e7e5'],
      otb: { white: 5, draws: 3, black: 2, total: 10 },
      online: { white: 4, draws: 1, black: 5, total: 10 },
      moves: [],
    };

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(asResponse(payload));
    const store = setupStore();
    const request = store.dispatch(openingsApi.endpoints.getNodes.initiate({ nodeId: 'e2e4,e7e5' }));

    try {
      await expect(request.unwrap()).resolves.toEqual(payload);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [requestArg] = fetchMock.mock.calls[0] ?? [];
      expect(requestArg).toBeInstanceOf(Request);
      const requestObj = requestArg as Request;

      expect(requestObj.url).toBe(`${window.location.origin}/api/totals`);
      expect(requestObj.method).toBe('POST');
      await expect(requestObj.clone().json()).resolves.toEqual({ play: ['e2e4', 'e7e5'] });
    } finally {
      request.unsubscribe();
    }
  });
});
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { renderTreeViewWithContexts } from '@/test/treeFixtures';
import { TreeNodeButtons } from './TreeNodeButtons';

const NODE_ID = 'e2e4';
const FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const emptyTreePreloadedState = {
  tree: {
    nodes: {},
    pinnedNodes: [],
    lastVisitedChildByParent: {},
  },
};

const clickActionByTitle = (title: string) => {
  const titleNode = screen.getByText(title);
  const actionGroup = titleNode.parentElement;
  expect(actionGroup).toBeInTheDocument();
  if (!actionGroup) throw new Error(`Missing action group for ${title}`);
  fireEvent.click(actionGroup);
};

describe('TreeNodeButtons', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('toggles pin state and label', () => {
    const { store } = renderTreeViewWithContexts(
      <svg>
        <TreeNodeButtons nodeId={NODE_ID} fen={FEN} nodeRadius={24} />
      </svg>,
      {
        preloadedState: emptyTreePreloadedState,
      }
    );

    expect(screen.getByText('pin')).toBeInTheDocument();
    clickActionByTitle('pin');

    expect(store.getState().tree.pinnedNodes).toContain(NODE_ID);
    expect(screen.getByText('unpin')).toBeInTheDocument();
  });

  it('copies fen and updates copy label', async () => {
    renderTreeViewWithContexts(
      <svg>
        <TreeNodeButtons nodeId={NODE_ID} fen={FEN} nodeRadius={24} />
      </svg>,
      {
        preloadedState: emptyTreePreloadedState,
      }
    );

    clickActionByTitle('copy fen');

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(FEN);
    });
    expect(screen.getByText('copied')).toBeInTheDocument();
  });

  it('opens lichess analysis URL in new tab', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    renderTreeViewWithContexts(
      <svg>
        <TreeNodeButtons nodeId={NODE_ID} fen={FEN} nodeRadius={24} />
      </svg>,
      {
        preloadedState: emptyTreePreloadedState,
      }
    );

    clickActionByTitle('open in lichess');

    expect(openSpy).toHaveBeenCalledWith(
      'https://lichess.org/analysis/standard/rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR_w_KQkq_-_0_1',
      '_blank',
      'noopener,noreferrer'
    );
  });
});

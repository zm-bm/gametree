import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BiCollapse, BiExpand } from 'react-icons/bi';

import PositionInspector from '@/features/PositionInspector';
import ChessBoard from '@/features/Sidebar/components/ChessBoard';
import PositionSummary from '@/features/Sidebar/components/PositionSummary/PositionSummary';
import ToggleOrientationButton from '@/features/Sidebar/components/ToggleOrientationButton';

const BoardDock = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const backButtonRef = useRef<HTMLButtonElement | null>(null);
  const expand = useCallback(() => setIsExpanded(true), []);
  const collapse = useCallback(() => setIsExpanded(false), []);

  useEffect(() => {
    if (isExpanded) backButtonRef.current?.focus();
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) return;

    const appRoot = document.getElementById('root');
    if (!appRoot) return;

    const hadInert = appRoot.hasAttribute('inert');
    const previousAriaHidden = appRoot.getAttribute('aria-hidden');

    appRoot.setAttribute('inert', '');
    appRoot.setAttribute('aria-hidden', 'true');

    return () => {
      if (!hadInert) appRoot.removeAttribute('inert');

      if (previousAriaHidden === null) {
        appRoot.removeAttribute('aria-hidden');
      } else {
        appRoot.setAttribute('aria-hidden', previousAriaHidden);
      }
    };
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') collapse();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [collapse, isExpanded]);

  if (isExpanded) {
    return createPortal(
      <div
        className="gt-board-dock-inspect-layer"
        data-testid="board-dock"
        aria-label="Expanded board inspector"
      >
        <div
          className="gt-board-dock-inspect-backdrop"
          data-testid="board-dock-backdrop"
          onMouseDown={collapse}
        />
        <section
          className="gt-board-dock-panel"
          data-testid="board-dock-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Board inspection"
        >
          <div className="gt-board-dock-panel-header" data-testid="board-dock-panel-header">
            <h2 className="gt-board-dock-panel-title">Board inspection</h2>
            <div className="gt-board-dock-panel-actions" data-testid="board-dock-panel-actions">
              <ToggleOrientationButton />
              <button
                ref={backButtonRef}
                type="button"
                className="gt-board-dock-header-action"
                onClick={collapse}
              >
                <BiCollapse size={14} aria-hidden="true" />
                <span>Back to tree</span>
              </button>
            </div>
          </div>

          <div className="gt-board-dock-expanded-board">
            <ChessBoard className="gt-position-inspector-card" />
          </div>

          <div className="gt-position-inspector-card gt-board-dock-summary">
            <PositionSummary />
          </div>
        </section>
      </div>,
      document.body,
    );
  }

  return (
    <div
      className="gt-board-dock"
      data-testid="board-dock"
      aria-label="Current position board"
    >
      <PositionInspector
        mode="compact"
        showDetails={false}
        boardActions={(
          <button
            type="button"
            className="gt-position-inspector-board-action gt-board-dock-expand-action"
            data-testid="board-dock-expand-action"
            aria-label="Expand board"
            title="Expand board"
            onClick={expand}
          >
            <BiExpand aria-hidden="true" />
          </button>
        )}
      />
    </div>
  );
};

export default BoardDock;

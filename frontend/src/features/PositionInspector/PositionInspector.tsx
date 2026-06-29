import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';

import ChessBoard from '@/features/Sidebar/components/ChessBoard';
import EngineView from '@/features/Sidebar/components/EngineView';
import PositionSummary from '@/features/Sidebar/components/PositionSummary/PositionSummary';
import PositionTheory from '@/features/Sidebar/components/PositionTheory/PositionTheory';
import ToggleOrientationButton from '@/features/Sidebar/components/ToggleOrientationButton';
import { cn } from '@/shared/cn';
import type { RootState } from '@/store';
import { selectBoardOrientation } from '@/store/selectors';

import './PositionInspector.css';

export type PositionInspectorMode = 'full' | 'compact';

export interface PositionInspectorProps {
  mode?: PositionInspectorMode;
  showDetails?: boolean;
  boardActions?: ReactNode;
  className?: string;
}

export const InspectorDetails = () => (
  <div className="gt-position-inspector-stack" data-testid="position-inspector-details">
    <div className="gt-position-inspector-card gt-position-inspector-card--summary">
      <PositionSummary />
    </div>

    <div className="gt-position-inspector-card gt-position-inspector-card--engine">
      <EngineView />
    </div>

    <div className="gt-position-inspector-card gt-position-inspector-card--theory">
      <PositionTheory />
    </div>
  </div>
);

export const PositionInspector = ({
  mode = 'full',
  showDetails = mode === 'full',
  boardActions,
  className,
}: PositionInspectorProps) => {
  const boardOrientation = useSelector((s: RootState) => selectBoardOrientation(s));

  return (
    <div
      className={cn('gt-position-inspector', `gt-position-inspector--${mode}`, className)}
      data-testid="position-inspector"
      data-mode={mode}
    >
      <div className="gt-position-inspector-board-slot">
        <div className="gt-position-inspector-board-actions" data-testid="position-inspector-board-actions">
          <div
            className="gt-position-inspector-board-context"
            data-testid="position-inspector-board-context"
            aria-label="Board orientation"
          >
            {boardOrientation.toUpperCase()}
          </div>

          <div
            className="gt-position-inspector-board-action-group"
            data-testid="position-inspector-board-action-group"
          >
            <ToggleOrientationButton />
            {boardActions}
          </div>
        </div>
        <ChessBoard className="gt-position-inspector-card" />
      </div>

      {showDetails ? (
        <div className="gt-position-inspector-analysis-shell">
          <InspectorDetails />
        </div>
      ) : null}
    </div>
  );
};

export default PositionInspector;

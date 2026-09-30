import { useCallback } from 'react';
import { FaCrosshairs, FaMinus, FaPlus } from 'react-icons/fa';

const buttonClass = 'focus:outline-none gt-treeview-hoverable';
const iconClass = 'h-4 w-4 m-2';

export interface TreeZoomControlsProps {
  handleZoom: (direction: 'in' | 'out') => void;
  onCenterCurrent?: () => void;
}

export const TreeZoomControls = ({ handleZoom, onCenterCurrent }: TreeZoomControlsProps) => {
  const zoomIn = useCallback(() => handleZoom('in'), [handleZoom]);
  const zoomOut = useCallback(() => handleZoom('out'), [handleZoom]);

  return (
    <div className="gt-tree-panel gt-divide-surface flex flex-col gap-1">
      <button className={buttonClass} onClick={zoomIn} aria-label="Zoom in">
        <FaPlus className={iconClass} />
      </button>
      <button className={buttonClass} onClick={zoomOut} aria-label="Zoom out">
        <FaMinus className={iconClass} />
      </button>
      {onCenterCurrent ? (
        <button className={buttonClass} onClick={onCenterCurrent} aria-label="Center current">
          <FaCrosshairs className={iconClass} />
        </button>
      ) : null}
    </div>
  );
};

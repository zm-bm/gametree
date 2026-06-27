import { useCallback } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';

const buttonClass = 'focus:outline-none gt-treeview-hoverable';
const iconClass = 'h-5 w-5 m-2';

export interface TreeZoomControlsProps {
  handleZoom: (direction: 'in' | 'out') => void;
}

export const TreeZoomControls = ({ handleZoom }: TreeZoomControlsProps) => {
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
    </div>
  );
};

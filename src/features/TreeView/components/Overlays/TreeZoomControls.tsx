import { useCallback } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';

const buttonClass = 'focus:outline-none interactive-treeview';
const iconClass = 'h-5 w-5 m-2';

export const TreeZoomControls = ({ handleZoom }: { handleZoom: (direction: 'in' | 'out') => void }) => {
  const zoomIn = useCallback(() => handleZoom('in'), [handleZoom]);
  const zoomOut = useCallback(() => handleZoom('out'), [handleZoom]);

  return (
    <div className="treeview-card flex flex-col gap-1 divide-y divide-lightmode-900/20 dark:divide-darkmode-100/20">
      <button className={buttonClass} onClick={zoomIn} aria-label="Zoom in">
        <FaPlus className={iconClass} />
      </button>
      <button className={buttonClass} onClick={zoomOut} aria-label="Zoom out">
        <FaMinus className={iconClass} />
      </button>
    </div>
  );
};

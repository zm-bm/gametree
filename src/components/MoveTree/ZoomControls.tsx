import { FaMinus, FaPlus } from 'react-icons/fa';

const buttonClass = 'p-2 transition-colors hover:bg-gray-300/80 hover:dark:bg-gray-700/80 focus:outline-none';
const iconClass = 'h-5 w-5 text-gray-700 dark:text-gray-300';

export const ZoomControls = ({ zoomIn, zoomOut }: { zoomIn: () => void; zoomOut: () => void }) => {
  return (
    <div className="tree-overlay absolute bottom-2 left-2 flex flex-col gap-1">
      <button className={buttonClass} onClick={zoomIn} aria-label="Zoom in">
        <FaPlus className={iconClass} />
      </button>
      <div className="w-full h-px bg-gray-200"></div>
      <button className={buttonClass} onClick={zoomOut} aria-label="Zoom out">
        <FaMinus className={iconClass} />
      </button>
    </div>
  );
}
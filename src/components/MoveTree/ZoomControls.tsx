import { FaMinus, FaPlus } from 'react-icons/fa';

import '../../styles/ZoomControls.css';

export const ZoomControls = ({ zoomIn, zoomOut }: { zoomIn: () => void; zoomOut: () => void }) => {
  return (
    <div className="zoom-controls">
      <button onClick={zoomIn} aria-label="Zoom in">
        <FaPlus className="h-5 w-5 text-gray-700" />
      </button>
      <div className="w-full h-px bg-gray-200"></div>
      <button onClick={zoomOut} aria-label="Zoom out">
        <FaMinus className="h-5 w-5 text-gray-700" />
      </button>
    </div>
  );
}
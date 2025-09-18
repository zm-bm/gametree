import { useContext } from 'react';
import { TreeDimensionsContext } from '../context/TreeDimensionsContext';

const id = 'tree-grid-pattern';
const gridStroke = 'stroke-lightmode-500/40 dark:stroke-darkmode-500/40';

export const TreeGrid = () => {
  const { columnWidth } = useContext(TreeDimensionsContext);
  
  const gridSize = columnWidth / 2;
  
  return (
    <>
      <defs>
        <pattern
          id={id}
          width={gridSize}
          height={gridSize}
          patternUnits="userSpaceOnUse"
        >
          {/* Vertical line */}
          <path
            d={`M 0 0 V ${gridSize}`}
            fill="none"
            strokeWidth="0.75"
            className={gridStroke}
            strokeDasharray="2,2"
          />
          {/* Horizontal line */}
          <path
            d={`M 0 0 H ${gridSize}`}
            fill="none"
            strokeWidth="0.75"
            className={gridStroke}
            strokeDasharray="2,2"
          />
        </pattern>
      </defs>
      <rect
        x={-10000} 
        y={-10000} 
        width={20000} 
        height={20000} 
        fill={`url(#${id})`}
        pointerEvents="none"
      />
    </>
  );
};
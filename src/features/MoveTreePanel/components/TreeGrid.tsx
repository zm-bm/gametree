import { useContext } from 'react';
import { MoveTreeContext } from '@/features/MoveTreePanel/context/MoveTreeContext';

interface Props {
  id?: string;
}

export const TreeGrid = ({
  id = 'tree-grid-pattern',
}: Props) => {
  const { columnWidth } = useContext(MoveTreeContext);
  
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
            strokeWidth="1"
            className="tree-grid-line"
            strokeDasharray="2,2"
          />
          {/* Horizontal line */}
          <path
            d={`M 0 0 H ${gridSize}`}
            fill="none"
            strokeWidth="1"
            className="tree-grid-line"
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
import { createContext } from 'react';
import { useParentSize } from '@visx/responsive';
import { Zoom } from '@visx/zoom';
import { TransformMatrix } from '@visx/zoom/lib/types';
import { TreeSvg } from './TreeSvg';
import { scaleLinear } from '@visx/scale';

export type ZoomState = {
  initialTransformMatrix: TransformMatrix;
  transformMatrix: TransformMatrix;
  isDragging: boolean;
};

export const defaultTransformMatrix: TransformMatrix = {
  translateX: 0,
  translateY: 0,
  scaleX: 1,
  scaleY: 1,
  skewX: 0,
  skewY: 0,
};

export const nodeRadiusScale = scaleLinear({ domain: [300, 1200], range: [12, 24] })
export const columnWidthScale = scaleLinear({ domain: [300, 1200], range: [200, 400] })
export const fontSizeScale = scaleLinear({ domain: [300, 1200], range: [8, 16] })

interface TreeDims {
  height: number,
  width: number,
  columnWidth: number,
  rowHeight: number,
  fontSize: number,
  nodeRadius: number,
}

const initialSize = { width: 800, height: 600 };
export const TreeDimsContext = createContext<TreeDims>({
  ...initialSize,
  nodeRadius: 16,
  rowHeight: 40,
  columnWidth: 300,
  fontSize: fontSizeScale(initialSize.height),
});

export default function MoveTree() {
  const { parentRef, width, height } = useParentSize({ initialSize });

  return (
    <TreeDimsContext.Provider value={{
      height,
      width,
      nodeRadius: nodeRadiusScale(height),
      rowHeight: nodeRadiusScale(height) * 2.5,
      columnWidth: columnWidthScale(width),
      fontSize: fontSizeScale(height),
    }}>
      <div
        ref={parentRef}
        className='w-full h-full border-l border-neutral-400 dark:border-neutral-500 overflow-hidden relative'
      >
        <Zoom<SVGSVGElement>
          width={width}
          height={height}
          scaleXMin={1 / 8}
          scaleYMin={1 / 8}
          scaleXMax={2}
          scaleYMax={2}
        >
          {(zoom) => (
            <TreeSvg zoom={zoom} />
          )}
        </Zoom>
      </div>
    </TreeDimsContext.Provider>
  );
};


import { useParentSize } from '@visx/responsive';
import { Zoom } from '@visx/zoom';
import { TreeSvg } from './TreeSvg';
import { TreeDimsContext } from "../../contexts/TreeContext";
import { scaleLinear } from '@visx/scale';

const nodeRadiusScale = scaleLinear({ domain: [300, 1200], range: [12, 24] });
const columnWidthScale = scaleLinear({ domain: [300, 1200], range: [240, 360] });
const fontSizeScale = scaleLinear({ domain: [300, 1200], range: [6, 14] });


export default function MoveTree() {
  const { parentRef, width, height } = useParentSize();
  const minDim = Math.min(height, width);

  return (
    <TreeDimsContext.Provider value={{
      height,
      width,
      nodeRadius: nodeRadiusScale(minDim),
      rowHeight: nodeRadiusScale(minDim) * 2.4,
      columnWidth: columnWidthScale(width),
      fontSize: fontSizeScale(minDim),
    }}>
      <div
        ref={parentRef}
        className='w-full h-full border-l border-neutral-400 overflow-hidden relative'
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
}

import { Zoom } from '@visx/zoom';

import { Tree } from './components/Tree';
import { ZoomProvider, TreeDimensionsProvider  } from "./context";
import { useStableParentSize } from './hooks/useStableParentSize';
import { treeZoomProps } from './lib/zoomProps';

const TreeView = () =>  {
  const { parentRef, width, height } = useStableParentSize();

  return (
    <div ref={parentRef} className="w-full h-full relative overflow-hidden">
      <TreeDimensionsProvider height={height} width={width}>
        <Zoom<SVGSVGElement>
          width={width}
          height={height}
          {...treeZoomProps}
        >
          {zoom => (
            <ZoomProvider zoom={zoom}>
              <Tree />
            </ZoomProvider>
          )}
        </Zoom>
      </TreeDimensionsProvider>
    </div>
  );
}

export default TreeView;

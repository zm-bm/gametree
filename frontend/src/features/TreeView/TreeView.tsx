import { Zoom } from '@visx/zoom';

import { Tree } from './components/Tree';
import { ZoomProvider, TreeDimensionsProvider  } from "./context";
import { useStableParentSize } from './hooks/useStableParentSize';
import { treeZoomConfig } from './lib/zoomConfig';

const TreeView = () =>  {
  const { parentRef, width, height } = useStableParentSize();

  return (
    <div ref={parentRef} className="gt-treeview-canvas">
      <TreeDimensionsProvider height={height} width={width}>
        <Zoom<SVGSVGElement>
          width={width}
          height={height}
          {...treeZoomConfig}
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

import { useContext  } from 'react';
import { Tree } from '@visx/hierarchy';
import { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types';
import { HierarchyNode, HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { useTooltip } from '@visx/tooltip';
import { TooltipInPortalProps } from '@visx/tooltip/lib/hooks/useTooltipInPortal';
import { SpringRef } from 'react-spring';

import { ZoomState } from "../types/tree";
import { TreeDimsContext } from "../contexts/TreeContext";
import { TreeNode } from "../types/chess";
import { TreeTooltip } from './TreeTooltip';
import { TreeGroup } from './TreeGroup';

interface Props {
  root: HierarchyNode<TreeNode>,
  zoom: ProvidedZoom<SVGSVGElement> & ZoomState,
  spring: SpringRef<TransformMatrix>,
  TooltipInPortal: React.FC<TooltipInPortalProps>,
}
export const TreeG = ({
  root,
  zoom,
  spring,
  TooltipInPortal,
}: Props) => {
  const { rowHeight, columnWidth } = useContext(TreeDimsContext);
  const tooltip = useTooltip<HierarchyPointNode<TreeNode>>();

  return (
    <g transform={zoom.toString()}>
      <Tree<TreeNode>
        root={root}
        nodeSize={[rowHeight, columnWidth]}
      >
        {(tree) => 
          <TreeGroup
            tree={tree}
            spring={spring}
            zoom={zoom}
            tooltip={tooltip}
          />
        }
      </Tree>
      {
        tooltip.tooltipLeft && tooltip.tooltipTop && tooltip.tooltipOpen &&
        <TooltipInPortal
          key={Math.random()}
          top={tooltip.tooltipTop}
          left={tooltip.tooltipLeft + (10 * zoom.transformMatrix.scaleX)}
          className="border border-neutral-400"
        >
          <TreeTooltip tooltip={tooltip} />
        </TooltipInPortal>
      }
    </g>
  );
};



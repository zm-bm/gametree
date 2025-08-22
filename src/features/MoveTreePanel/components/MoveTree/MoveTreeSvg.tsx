import React from "react";
import { HierarchyNode } from "@visx/hierarchy/lib/types";
import { UseTooltipParams } from "@visx/tooltip/lib/hooks/useTooltip";
import { Tree } from "@visx/hierarchy";

import { TreeNodeData, NodeTooltipData } from "@/shared/types";
import { MoveTreeContents } from "./MoveTreeContents";
import { separation } from "../../lib/separation";

interface Props {
  root: HierarchyNode<TreeNodeData> | null,
  nodeSize: [number, number],
  showTooltip: React.MouseEventHandler<SVGGElement>,
  hideTooltip: UseTooltipParams<NodeTooltipData>['hideTooltip'],
}

const MoveTreeSvgBase = ({
  root,
  nodeSize,
  showTooltip,
  hideTooltip,
}: Props)  => {
  if (!root) return null;

  return (
    <Tree<TreeNodeData>
      root={root}
      nodeSize={nodeSize}
      separation={separation}
    >
      {(tree) => 
        <MoveTreeContents
          tree={tree}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
        />
      }
    </Tree>
  );
};

export const MoveTreeSvg = React.memo(MoveTreeSvgBase);

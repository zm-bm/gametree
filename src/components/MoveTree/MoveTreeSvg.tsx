import React from "react";
import { HierarchyNode, HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { UseTooltipParams } from "@visx/tooltip/lib/hooks/useTooltip";
import { Tree } from "@visx/hierarchy";

import { TreeNodeData } from "../../types/chess";
import { MoveTreeContents } from "./MoveTreeContents";
import { NodeTooltipData } from "../../hooks/useTreeTooltip";
import { SEPARATION } from "./constants";

interface Props {
  root: HierarchyNode<TreeNodeData> | null,
  nodeSize: [number, number],
  currentNodeRef: React.MutableRefObject<HierarchyPointNode<TreeNodeData> | null>,
  showTooltip: React.MouseEventHandler<SVGGElement>,
  hideTooltip: UseTooltipParams<NodeTooltipData>['hideTooltip'],
  onCurrentNodeChange?: (node: HierarchyPointNode<TreeNodeData>) => void,
}

const MoveTreeSvgBase = ({
  root,
  nodeSize,
  currentNodeRef,
  showTooltip,
  hideTooltip,
  onCurrentNodeChange,
}: Props)  => {
  if (!root) return null;

  return (
    <Tree<TreeNodeData>
      root={root}
      nodeSize={nodeSize}
      separation={SEPARATION}
    >
      {(tree) => 
        <MoveTreeContents
          tree={tree}
          currentNodeRef={currentNodeRef}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
          onCurrentNodeChange={onCurrentNodeChange}
        />
      }
    </Tree>
  );
};

export const MoveTreeSvg = React.memo(MoveTreeSvgBase);

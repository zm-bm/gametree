import React, { useContext } from "react";
import { HierarchyNode } from "@visx/hierarchy/lib/types";
import { UseTooltipParams } from "@visx/tooltip/lib/hooks/useTooltip";
import { Tree as VisxTree } from "@visx/hierarchy";

import { TreeNodeData, NodeTooltipData } from "@/shared/types";
import { TreeContents } from "./TreeContents";
import { separation } from "../lib/separation";
import { TreeDimensionsContext } from "../context";

interface Props {
  root: HierarchyNode<TreeNodeData> | null,
  showTooltip: React.MouseEventHandler<SVGGElement>,
  hideTooltip: UseTooltipParams<NodeTooltipData>['hideTooltip'],
};

const TreeContainerBase = ({
  root,
  showTooltip,
  hideTooltip,
}: Props)  => {
  const { nodeSize } = useContext(TreeDimensionsContext);

  if (!root) return null;
  return (
    <VisxTree<TreeNodeData>
      root={root}
      nodeSize={nodeSize}
      separation={separation}
    >
      {(tree) =>
        <TreeContents
          tree={tree}
          nodeSize={nodeSize}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
        />
      }
    </VisxTree>
  );
};

export const TreeContainer = React.memo(TreeContainerBase);

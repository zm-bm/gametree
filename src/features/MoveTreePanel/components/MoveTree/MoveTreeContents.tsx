import { useMemo } from "react";
import { HierarchyPointNode } from "d3-hierarchy";
import { UseTooltipParams } from "@visx/tooltip/lib/hooks/useTooltip";

import { TreeLink } from "../TreeLink";
import { TreeNode } from '../TreeNode/TreeNode';
import { TreeNodeData } from "../../types";
import { NodeTooltipData } from "../../hooks/useTreeTooltip";

interface Props {
  tree: HierarchyPointNode<TreeNodeData>,
  showTooltip: React.MouseEventHandler<SVGGElement>,
  hideTooltip: UseTooltipParams<NodeTooltipData>['hideTooltip'],
}

export const MoveTreeContents = ({
  tree,
  showTooltip,
  hideTooltip,
}: Props) => {
  const links = useMemo(() => tree.links(), [tree]);
  const nodes = useMemo(() => tree.descendants(), [tree]);

  return (
    <>
      {links.map((link) => (
        <TreeLink link={link} key={`link-${link.source.data.id}-${link.target.data.id}`} />
      ))}
      {nodes.map((node) => (
        <TreeNode
          key={`node-${node.data.id}`}
          node={node}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
        />
      ))}
    </>
  )
}

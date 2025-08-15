import { HierarchyPointNode } from "d3-hierarchy";
import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { UseTooltipParams } from "@visx/tooltip/lib/hooks/useTooltip";

import { TreeLink } from "./TreeLink";
import { TreeNode } from './TreeNode';
import { TreeNodeData } from "../../types/chess";
import { selectPath } from "../../redux/gameSlice";
import { RootState } from "../../store";
import { pathId } from "../../lib/chess";
import { NodeTooltipData } from "../../hooks/useTreeTooltip";

interface Props {
  tree: HierarchyPointNode<TreeNodeData>,
  showTooltip: React.MouseEventHandler<SVGGElement>,
  hideTooltip: UseTooltipParams<NodeTooltipData>['hideTooltip'],
  currentNodeRef: React.MutableRefObject<HierarchyPointNode<TreeNodeData> | null>,
  onCurrentNodeChange?: (node: HierarchyPointNode<TreeNodeData>) => void,
}

export const MoveTreeContents = ({
  tree,
  showTooltip,
  hideTooltip,
  currentNodeRef,
  onCurrentNodeChange,
}: Props) => {
  const path = useSelector((state: RootState) => selectPath(state));
  const id = useMemo(() => pathId(path), [path])
  const links = useMemo(() => tree.links(), [tree]);
  const nodes = useMemo(() => tree.descendants(), [tree]);
  const currentNode = useMemo(() => nodes.find(node => node.data.id === id), [nodes, id]);
  
  useEffect(() => {
    if (currentNode) {
      currentNodeRef.current = currentNode;
      if (onCurrentNodeChange) onCurrentNodeChange(currentNode);
    }
  }, [currentNode, currentNodeRef, onCurrentNodeChange]);

  return (
    <>
      {links.map((link) => (
        <TreeLink link={link} key={`link-${link.source.data.id}-${link.target.data.id}`} />
      ))}
      {nodes.map((node) => (
        <TreeNode
          key={`node-${node.data.id}`}
          node={node}
          isCurrentNode={id === node.data.id}
          showTooltip={showTooltip}
          hideTooltip={hideTooltip}
        />
      ))}
    </>
  )
}

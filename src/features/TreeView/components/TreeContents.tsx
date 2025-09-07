import React, { useMemo } from "react";
import { HierarchyPointNode } from "d3-hierarchy";
import { TreeNodeData } from "@/shared/types";

import { TreeLink } from "./TreeLink";
import { TreeNode } from './TreeNode';
import { useAnimatedTreeLayout } from "../hooks";

interface Props {
  tree: HierarchyPointNode<TreeNodeData>,
  nodeSize: [number, number],
  minimap?: boolean,
}

const TreeContentsBase = ({
  tree,
  nodeSize,
  minimap = false,
}: Props) => {
  const links = useMemo(() => tree.links(), [tree]);
  const nodes = useMemo(() => tree.descendants(), [tree]);
  const { ax, ay } = useAnimatedTreeLayout(nodes, nodeSize, minimap);

  return (
    <>
      {links.map(link => (
        <TreeLink
          key={`link-${link.source.data.id}-${link.target.data.id}`}
          link={link}
          sourceX={ax(link.source.data.id)}
          sourceY={ay(link.source.data.id)}
          targetX={ax(link.target.data.id)}
          targetY={ay(link.target.data.id)}
          minimap={minimap}
        />
      ))}
      {nodes.map(node => (
        <TreeNode
          key={`node-${node.data.id}`}
          node={node}
          x={ax(node.data.id)}
          y={ay(node.data.id)}
          minimap={minimap}
        />
      ))}
    </>
  );
};

export const TreeContents = React.memo(TreeContentsBase);

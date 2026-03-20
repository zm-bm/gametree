import React, { useMemo } from "react";
import { HierarchyPointNode } from "d3-hierarchy";
import { TreeViewNode } from "@/shared/types";

import { TreeLink } from "./TreeLink";
import { TreeNode } from './TreeNode';
import { useAnimatedTreeLayout } from "../hooks";

interface Props {
  tree: HierarchyPointNode<TreeViewNode>,
  minimap?: boolean,
}

const TreeContentsBase = ({
  tree,
  minimap = false,
}: Props) => {
  const links = useMemo(() => tree.links(), [tree]);
  const nodes = useMemo(() => tree.descendants(), [tree]);
  const { ax, ay } = useAnimatedTreeLayout(nodes);

  return (
    <>
      {links.map(link => (
        <TreeLink
          key={`link-${link.source.data.id}-${link.target.data.id}`}
          link={link}
          sourceX={minimap ? link.source.x : ax(link.source.data.id)}
          sourceY={minimap ? link.source.y : ay(link.source.data.id)}
          targetX={minimap ? link.target.x : ax(link.target.data.id)}
          targetY={minimap ? link.target.y : ay(link.target.data.id)}
          minimap={minimap}
        />
      ))}
      {nodes.map(node => (
        <TreeNode
          key={`node-${node.data.id}`}
          node={node}
          x={minimap ? node.x : ax(node.data.id)}
          y={minimap ? node.y : ay(node.data.id)}
          minimap={minimap}
        />
      ))}
    </>
  );
};

export const TreeContents = React.memo(TreeContentsBase);

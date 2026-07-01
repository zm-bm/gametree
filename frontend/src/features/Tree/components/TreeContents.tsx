import React, { useMemo } from "react";
import { HierarchyPointNode } from "d3-hierarchy";
import { TreeViewNode } from "@/types";

import { TreeLink } from "./TreeLink";
import { TreeNode } from "./TreeNode";
import { useAnimatedTreeLayout } from "../hooks";

export interface TreeContentsProps {
  tree: HierarchyPointNode<TreeViewNode>;
  layoutKey: string;
  minimap?: boolean;
}

const TreeContentsBase = ({
  tree,
  layoutKey,
  minimap = false,
}: TreeContentsProps) => {
  const links = useMemo(() => {
    // Visx mutates the hierarchy object in place when nodeSize changes.
    void layoutKey;
    return tree.links();
  }, [tree, layoutKey]);
  const nodes = useMemo(() => {
    // Visx mutates the hierarchy object in place when nodeSize changes.
    void layoutKey;
    return tree.descendants();
  }, [tree, layoutKey]);
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

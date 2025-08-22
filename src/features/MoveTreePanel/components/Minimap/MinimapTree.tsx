import React, { useMemo } from 'react';
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";

import { TreeNodeData } from "@/shared/types";
import { TreeLink } from "../TreeLink";
import { TreeNode } from "../TreeNode/TreeNode";

interface Props {
  tree: HierarchyPointNode<TreeNodeData>,
};

export const MinimapTreeBase = ({ tree }: Props) => {
  const links = useMemo(() => tree.links(), [tree]);
  const nodes = useMemo(() => tree.descendants(), [tree]);

  return (
    <>
    {links.map((link) => (
        <TreeLink
          key={`link-${link.source.data.id}-${link.target.data.id}`}
          link={link}
          minimap={true}
        />

      ))}
      {nodes.map((node) => (
        <TreeNode
          key={`node-${node.data.id}`}
          node={node}
          minimap={true}
        />
      ))}
    </>
  );
};

export const MinimapTree = React.memo(MinimapTreeBase);

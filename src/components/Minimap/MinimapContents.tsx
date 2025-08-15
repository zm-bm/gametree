import React from "react";
import { HierarchyPointLink, HierarchyPointNode } from "@visx/hierarchy/lib/types";

import { TreeLink } from "../MoveTree/TreeLink";
import { TreeNode } from "../MoveTree/TreeNode";
import { TreeNodeData } from "../../types/chess";

interface Props {
  links: HierarchyPointLink<TreeNodeData>[],
  nodes: HierarchyPointNode<TreeNodeData>[],
  currentPathId: string,
};

const MinimapContents = (({ links, nodes, currentPathId }: Props) => {
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
          isCurrentNode={node.data.id === currentPathId}
          minimap={true}
        />
      ))}
    </>
  );
});

export const MemoizedMinimapContents = React.memo(MinimapContents);

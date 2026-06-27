import React, { useContext } from "react";
import { HierarchyNode } from "@visx/hierarchy/lib/types";
import { Tree as VisxTree } from "@visx/hierarchy";

import { TreeViewNode } from "@/types";
import { TreeContents } from "./TreeContents";
import { treeSeparation } from "../lib/treeSeparation";
import { TreeDimensionsContext } from "../context";

export interface TreeContainerProps {
  root: HierarchyNode<TreeViewNode> | null;
}

const TreeContainerBase = ({
  root,
}: TreeContainerProps)  => {
  const { treeNodeSpacing } = useContext(TreeDimensionsContext);

  if (!root) return null;
  return (
    <VisxTree<TreeViewNode>
      root={root}
      nodeSize={treeNodeSpacing}
      separation={treeSeparation}
    >
      {(tree) =>
        <TreeContents tree={tree} />
      }
    </VisxTree>
  );
};

export const TreeContainer = React.memo(TreeContainerBase);

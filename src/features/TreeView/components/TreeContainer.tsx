import React, { useContext } from "react";
import { HierarchyNode } from "@visx/hierarchy/lib/types";
import { Tree as VisxTree } from "@visx/hierarchy";

import { TreeNodeData } from "@/shared/types";
import { TreeContents } from "./TreeContents";
import { separation } from "../lib/separation";
import { TreeDimensionsContext } from "../context";

interface Props {
  root: HierarchyNode<TreeNodeData> | null,
};

const TreeContainerBase = ({
  root,
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
        <TreeContents tree={tree} />
      }
    </VisxTree>
  );
};

export const TreeContainer = React.memo(TreeContainerBase);

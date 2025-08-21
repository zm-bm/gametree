import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";

import { TreeNodeData } from "../../types";
import { RootState } from '../../store';
import { MemoizedMinimapContents } from './MinimapContents';
import { selectCurrentId } from '../../store/selectors';

interface Props {
  tree: HierarchyPointNode<TreeNodeData>,
};

export const MinimapTree = ({ tree }: Props) => {
  const pathId = useSelector((s: RootState) => selectCurrentId(s));
  const links = useMemo(() => tree.links(), [tree]);
  const nodes = useMemo(() => tree.descendants(), [tree]);

  return (
    <MemoizedMinimapContents
      links={links}
      nodes={nodes}
      pathId={pathId}
    />
  );
};

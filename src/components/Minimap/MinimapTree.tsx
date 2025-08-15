import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";

import { TreeNodeData } from "../../types/chess";
import { pathId } from '../../lib/chess';
import { selectPath } from '../../redux/gameSlice';
import { RootState } from '../../store';
import { MemoizedMinimapContents } from './MinimapContents';

interface Props {
  tree: HierarchyPointNode<TreeNodeData>,
};

export const MinimapTree = ({ tree }: Props) => {
  const path = useSelector((state: RootState) => selectPath(state));
  const currentPathId = useMemo(() => pathId(path), [path]);
  const links = useMemo(() => tree.links(), [tree]);
  const nodes = useMemo(() => tree.descendants(), [tree]);

  return (
    <MemoizedMinimapContents
      links={links}
      nodes={nodes}
      currentPathId={currentPathId}
    />
  );
};

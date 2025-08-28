import { HierarchyPointNode } from '@visx/hierarchy/lib/types';

import { TreeNodeData } from '@/shared/types';

export const separation = (
  a: HierarchyPointNode<TreeNodeData>,
  b: HierarchyPointNode<TreeNodeData>
) => (a.parent === b.parent) ? 1 : 1.2;

import { HierarchyPointNode } from '@visx/hierarchy/lib/types';

import { TreeViewNode } from '@/types';

export const treeSeparation = (
  a: HierarchyPointNode<TreeViewNode>,
  b: HierarchyPointNode<TreeViewNode>
) => (a.parent === b.parent) ? 1 : 1.2;
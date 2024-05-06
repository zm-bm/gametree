import { useEffect, MouseEventHandler, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Tree } from '@visx/hierarchy';
import { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types';
import { HierarchyNode, HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { Group } from '@visx/group'

import { RootState } from '../../store';
import { TreeDimsContext, ZoomState } from "./MoveTree";
import { Node } from './Node';
import { Link } from './Link';
import { TreeNode } from '../../chess';
import { selectMovesList } from '../../redux/gameSlice';

interface Props {
  root: HierarchyNode<TreeNode>,
  zoom: ProvidedZoom<SVGSVGElement> & ZoomState,
  setTargetMatrix: React.Dispatch<React.SetStateAction<TransformMatrix>>,
  showNodeTooltip: (n: HierarchyPointNode<TreeNode>) => MouseEventHandler,
  hideTooltip: () => void,
}
export const TreeG = ({
  root,
  zoom,
  setTargetMatrix,
  showNodeTooltip,
  hideTooltip,
}: Props) => {
  const { height, width, rowHeight, columnWidth } = useContext(TreeDimsContext);
  const moves = useSelector((state: RootState) => selectMovesList(state));
  const currentNode = useMemo(() => moves.map(m => m.lan).join(','), [moves])

  return (
    <g transform={zoom.toString()}>
      <Tree<TreeNode>
        root={root}
        nodeSize={[rowHeight, columnWidth]}
      >
        {(tree) => {
          useEffect(() => {
            const node = tree.descendants().find(node => node.data.name === currentNode);
            if (node) {
              setTargetMatrix({
                ...zoom.transformMatrix,
                translateX: (-node.y * zoom.transformMatrix.scaleX) + (width / 3),
                translateY: (-node.x * zoom.transformMatrix.scaleY) + (height / 2),
              });
            }
          }, [currentNode, width, height, tree]);

          return (
            <Group>
              {tree.links().map((link, i) => (
                <Link
                  key={`link-${i}`}
                  link={link}
                />
              ))}
              {tree.descendants().map((node, i) => (
                <Node
                  key={`node-${i}`}
                  node={node}
                  isCurrentNode={currentNode === node.data.name}
                  onMouseEnter={showNodeTooltip(node)}
                  onMouseLeave={hideTooltip}
                />
              ))}
            </Group>
          )
        }}
      </Tree>
    </g>
  );
};



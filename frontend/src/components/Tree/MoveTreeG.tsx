import { useMemo, useEffect, MouseEventHandler } from 'react';
import { useSelector } from 'react-redux';
import { Tree } from '@visx/hierarchy';
import { hierarchy } from '@visx/hierarchy';
import { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { scaleLinear } from '@visx/scale';
import { Group } from '@visx/group'

import { RootState } from '../../store';
import { ZoomState, margin } from './MoveTreeSvg';
import { Node } from './Node';
import { Link } from './Link';
import { TreeNode, movesToString } from '../../chess';
import { useGetOpeningByMovesQuery } from '../../redux/openingsApi';

const nodeRadiusScale = scaleLinear({ domain: [300, 1200], range: [12, 24] })
const nodeWidthScale = scaleLinear({ domain: [300, 1200], range: [200, 400] })
const fontSizeScale = scaleLinear({ domain: [300, 1200], range: [8, 16] })

interface Props {
  width: number,
  height: number,
  zoom: ProvidedZoom<SVGSVGElement> & ZoomState,
  setTargetMatrix: React.Dispatch<React.SetStateAction<TransformMatrix>>,
  showNodeTooltip: (n: HierarchyPointNode<TreeNode>) => MouseEventHandler,
  hideTooltip: () => void,
}
export const MoveTreeG = ({
  width,
  height,
  zoom,
  setTargetMatrix,
  showNodeTooltip,
  hideTooltip,
}: Props) => {
  const fontSize = fontSizeScale(height);
  const nodeRadius = nodeRadiusScale(height);
  const nodeWidth = nodeWidthScale(width);
  const nodeHeight = nodeRadius * 2.2;
  const nodeSize: [number, number] = useMemo(() => [nodeHeight, nodeWidth], [nodeHeight, nodeWidth])
  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;

  const moves = useSelector((state: RootState) => state.game.moves);
  const currentNode = movesToString(moves);

  useGetOpeningByMovesQuery(moves)
  const treeRoot = useSelector((state: RootState) => state.tree.root)

  const root = useMemo(() => {
    if (treeRoot) {
      console.log(treeRoot)
      return hierarchy(treeRoot);
    }
  }, [treeRoot])

  return root && (
    <g transform={zoom.toString()}>
      <Tree<TreeNode>
        root={root}
        nodeSize={nodeSize}
      >
        {(tree) => {
          useEffect(() => {
            const node = tree.descendants().find(node => node.data.name === currentNode);
            if (node) {
              setTargetMatrix({
                ...zoom.transformMatrix,
                translateX: (-node.y * zoom.transformMatrix.scaleX) + (xMax * 0.33),
                translateY: (-node.x * zoom.transformMatrix.scaleY) + (yMax * 0.5),
              });
            }
          }, [currentNode, xMax, yMax]);

          return (
            <Group top={margin.top} left={margin.left}>
              {tree.links().map((link, i) => (
                <Link
                  key={`link-${i}`}
                  link={link}
                  r={nodeRadius}
                  fontSize={fontSize}
                  nodeWidth={nodeWidth}
                />
              ))}
              {tree.descendants().map((node, i) => (
                <Node
                  key={`node-${i}`}
                  node={node}
                  r={nodeRadius}
                  fontSize={fontSize}
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

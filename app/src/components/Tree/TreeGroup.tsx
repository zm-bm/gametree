import { useEffect, useContext, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Tree } from '@visx/hierarchy';
import { localPoint } from '@visx/event';
import { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types';
import { HierarchyNode, HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { useTooltip } from '@visx/tooltip';
import { TooltipInPortalProps } from '@visx/tooltip/lib/hooks/useTooltipInPortal';
import { Group } from '@visx/group'
import { SpringRef } from 'react-spring';

import { RootState } from '../../store';
import { TreeDimsContext, ZoomState } from "./MoveTree";
import { Node } from './Node';
import { Link } from './Link';
import { TreeNode } from '../../chess';
import { selectMovesList } from '../../redux/gameSlice';
import { TreeTooltip } from './TreeTooltip';

interface Props {
  root: HierarchyNode<TreeNode>,
  zoom: ProvidedZoom<SVGSVGElement> & ZoomState,
  spring: SpringRef<TransformMatrix>,
  TooltipInPortal: React.FC<TooltipInPortalProps>,
}
export const TreeGroup = ({
  root,
  zoom,
  spring,
  TooltipInPortal,
}: Props) => {
  const { height, width, rowHeight, columnWidth } = useContext(TreeDimsContext);
  const moves = useSelector((state: RootState) => selectMovesList(state));
  const currentNode = useMemo(() => moves.map(m => m.lan).join(','), [moves])

  const tooltip = useTooltip<HierarchyPointNode<TreeNode>>();

  const showNodeTooltip = useCallback((node: HierarchyPointNode<TreeNode>): React.MouseEventHandler => {
    return (event) => {
      const coords = localPoint(event);
        if (coords) {
          const { transformMatrix: m } = zoom;
          tooltip.showTooltip({
            tooltipLeft: node.y * m.scaleX + m.translateX,
            tooltipTop: node.x * m.scaleY + m.translateY,
            tooltipData: node,
          });
        }
    };
  }, [zoom]);

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
              spring.start({
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
                  onMouseLeave={tooltip.hideTooltip}
                />
              ))}
            </Group>
          )
        }}
      </Tree>
      {
        tooltip.tooltipLeft && tooltip.tooltipTop && tooltip.tooltipOpen &&
        <TooltipInPortal
          key={Math.random()}
          top={tooltip.tooltipTop}
          left={tooltip.tooltipLeft + (10 * zoom.transformMatrix.scaleX)}
          className="border border-neutral-400"
        >
          <TreeTooltip tooltip={tooltip} />
        </TooltipInPortal>
      }
    </g>
  );
};



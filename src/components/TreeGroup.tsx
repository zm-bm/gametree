import { HierarchyPointNode } from "d3-hierarchy";
import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { Group } from "@visx/group";
import { localPoint } from "@visx/event";
import { UseTooltipParams } from "@visx/tooltip/lib/hooks/useTooltip";
import { ProvidedZoom, TransformMatrix } from "@visx/zoom/lib/types";

import { Link } from "./Link";
import { Node } from './Node';
import { SpringContext, SpringRef } from "react-spring";
import { TreeNode } from "../types/chess";
import { selectMovesList } from "../redux/gameSlice";
import { RootState } from "../store";
import { ZoomState } from "../types/tree";
import { TreeDimsContext } from "../contexts/TreeContext";
import { calcCoords } from "../lib/tree";

interface Props {
  tree: HierarchyPointNode<TreeNode>,
  spring: SpringRef<TransformMatrix>,
  zoom: ProvidedZoom<SVGSVGElement> & ZoomState,
  tooltip: UseTooltipParams<HierarchyPointNode<TreeNode>>,
}

export const TreeGroup = ({
  tree,
  spring,
  zoom,
  tooltip,
}: Props) => {
  const { height, width } = useContext(TreeDimsContext);
  const moves = useSelector((state: RootState) => selectMovesList(state));
  const currentNode = useMemo(() => moves.map(m => m.lan).join(','), [moves])
  const transformMatrixRef = useRef(zoom.transformMatrix);
  const prevNode = useRef<HierarchyPointNode<TreeNode> | null>(null);

  useEffect(() => {
    transformMatrixRef.current = zoom.transformMatrix;
  }, [zoom.transformMatrix]);

  useEffect(() => {
    const node = tree.descendants().find(node => node.data.name === currentNode);
    const matrix = transformMatrixRef.current;
    if (node && prevNode.current?.data.name !== node.data.name) {
      prevNode.current = node;
      spring.start(calcCoords(node, matrix, width, height));
    }
  }, [currentNode, width, height, tree, spring]);

  const showTooltip = useCallback((node: HierarchyPointNode<TreeNode>): React.MouseEventHandler => {
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
  }, [zoom, tooltip]);

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
          onMouseEnter={showTooltip(node)}
          onMouseLeave={tooltip.hideTooltip}
        />
      ))}
    </Group>
  )
}

import { useCallback, useContext, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DEFAULT_POSITION } from "chess.js";
import { Group } from "@visx/group";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { animated } from "react-spring";
import { FluidValue } from '@react-spring/shared';

import { cn } from "@/shared/lib/cn";
import { RootState, AppDispatch } from "@/store";
import { selectCurrentId } from "@/store/selectors";
import { nav } from "@/store/slices";
import { TreeNodeData } from "@/shared/types";
import { TreeDimensionsContext } from "../context/TreeDimensionsContext";
import { TreeNodeText } from "./TreeNodeText";
import { TreeNodeButtons } from "./TreeNodeButtons";
import { TreeNodeLoadingIndicator } from "./TreeNodeLoadingIndicator";

const AnimatedGroup = animated(Group);

interface Props {
  node: HierarchyPointNode<TreeNodeData>;
  x: FluidValue<number>;
  y: FluidValue<number>;
  minimap?: boolean;
}

export const TreeNode = ({
  node,
  x,
  y,
  minimap = false,
}: Props) => {
  const { id, loading } = node.data;

  const dispatch = useDispatch<AppDispatch>();
  const { fontSize, nodeRadius } = useContext(TreeDimensionsContext);
  const currentNodeId = useSelector((s: RootState) => selectCurrentId(s));
  const isCurrent = useMemo(() => currentNodeId === id, [currentNodeId, id]);
  const [hovered, setHovered] = useState(false);
  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);
  
  const nodeProps = useMemo(() => {
    if (minimap) return {};
    
    return {
      cursor: 'pointer',
      onClick: () => dispatch(nav.actions.navigateToId(node.data.id)),
      'data-fen': node.data.move?.after || DEFAULT_POSITION,
      'data-move': node.data.move?.lan || '',
      'data-id': node.data.id,
    };
  }, [node, minimap, dispatch]);

  const rectProps = useMemo(() => ({
    x: -nodeRadius,
    y: -nodeRadius,
    rx: 6,
    ry: 6,
    width: nodeRadius * 2,
    height: nodeRadius * 2,
    fill: isCurrent ? 'url(#currentNodeGradient)' : 'url(#moveGradient)',
    filter: isCurrent ? 'url(#currentNodeFilter)' : 'url(#nodeFilter)',
    className: cn('stroke-[0.75] stroke-lightmode-900/10 dark:stroke-darkmode-400/10', { 
      ['stroke-1 stroke-lightmode-900/30 dark:stroke-darkmode-400/60']: minimap,
      ['transition-all duration-200 hover:scale-110 hover:brightness-125']: !minimap,
    }),
  }), [nodeRadius, isCurrent, minimap]);

  return (
    <AnimatedGroup
      top={x}
      left={y}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Button drawer */}
      {!minimap && hovered && (
        <TreeNodeButtons
          node={node}
          nodeRadius={nodeRadius}
          onMouseLeave={handleMouseLeave}
        />
      )}

      {/* Move node*/}
      <g {...nodeProps}>
        <rect {...rectProps} />
        {!minimap && <TreeNodeText move={node.data.move} fontSize={fontSize} />}
        {loading && <TreeNodeLoadingIndicator radius={nodeRadius - 2} />}
      </g>
    </AnimatedGroup>
  );
};

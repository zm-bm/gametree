import { useCallback, useContext, useMemo } from "react";
import { HierarchyPointLink } from "@visx/hierarchy/lib/types";
import { animated, to } from "react-spring";
import { FluidValue } from '@react-spring/shared';

import { cn } from "@/shared/lib/cn";
import { TreeNodeData } from "@/shared/types";
import { gameCount } from "@/shared/lib/treeTransform";
import { TreeDimensionsContext } from "../context/TreeDimensionsContext";
import { COLORS, colorScale } from "../lib/colors";

const AnimatedPath = animated.path;

function buildTreeLinkPath(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  nodeRadius: number,
  width: number
): string {
  const midHorizontal = (sourceY + targetY) / 2;
  const curveOffset = Math.min(80, (targetY - sourceY) * 0.4);
  const controlHorizontal = midHorizontal - curveOffset;
  const topVertical = targetX - width / 2;
  const bottomVertical = targetX + width / 2;
  const verticalOffset = nodeRadius * 2 / 3;
  const sourceRightEdge = sourceY + nodeRadius - 1;
  const targetLeftEdge = targetY - nodeRadius;

  const start = `M${sourceRightEdge},${sourceX - verticalOffset}`;
  const ctrl1 = `C${controlHorizontal},${sourceX} ${midHorizontal},${topVertical} ${targetLeftEdge},${topVertical}`;
  const lineT = `L${targetLeftEdge},${bottomVertical}`;
  const ctrl2 = `C${midHorizontal},${bottomVertical} ${controlHorizontal},${sourceX} ${sourceRightEdge},${sourceX + verticalOffset}`;
  return `${start} ${ctrl1} ${lineT} ${ctrl2} Z`;
}

function getTreeLinkWidth(
  frequency: number,
  nodeRadius: number,
  minimap: boolean
): number {
  const minWidth = minimap ? nodeRadius * 2 / 3 : nodeRadius / 3;
  const maxWidth = nodeRadius * 2 - 8;
  const scaledWidth = (maxWidth - minWidth) * frequency + minWidth;
  return Math.min(scaledWidth, maxWidth);
}

function getTreeLinkFrequency(
  source: TreeNodeData,
  target: TreeNodeData,
): number {
  const sourceGames = gameCount(source);
  const targetGames = gameCount(target);
  return sourceGames ? (targetGames / sourceGames) : 0;
}

interface Props {
  link: HierarchyPointLink<TreeNodeData>;
  sourceX: FluidValue<number>;
  sourceY: FluidValue<number>;
  targetX: FluidValue<number>;
  targetY: FluidValue<number>;
  minimap?: boolean;
};

export const TreeLink = ({
  link,
  sourceX,
  sourceY,
  targetX,
  targetY,
  minimap = false,
}: Props) => {
  const { nodeRadius } = useContext(TreeDimensionsContext);
  
  const pathGenerator = useCallback((
    sourceX: number, 
    sourceY: number, 
    targetX: number, 
    targetY: number
  ) => {
    const frequency = getTreeLinkFrequency(link.source.data, link.target.data);
    const width = getTreeLinkWidth(frequency, nodeRadius, minimap);
    return buildTreeLinkPath(sourceX, sourceY, targetX, targetY, nodeRadius, width);
  }, [nodeRadius, minimap, link]);

  const linkFill = useMemo(() => {
    if (link.source.data.collapsed) return COLORS.placeholder;
    const { white, draws, black } = link.target.data;
    const games = white + draws + black;
    return (games === 0) ? COLORS.draw : colorScale((white - black) / games);
  }, [link.source.data, link.target.data]);

  return (
    <AnimatedPath
      className={cn(
        'stroke-[0.75] stroke-lightmode-900/60 dark:stroke-white', {
        ['stroke-1']: minimap,
      })}
      d={to(
        [sourceX, sourceY, targetX, targetY],
        (sx, sy, tx, ty) => pathGenerator(sx, sy, tx, ty)
      )}
      fill={linkFill}
      filter="url(#linkShadow)"
      vectorEffect="non-scaling-stroke"
    />
  );
};

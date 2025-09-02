import React, { useCallback, useContext, useMemo } from "react";
import { HierarchyPointLink } from "@visx/hierarchy/lib/types";
import { useSpring, animated, to } from "react-spring";

import { cn } from "@/shared/lib/cn";
import { TreeNodeData } from "@/shared/types";
import { gameCount } from "@/shared/lib/tree";
import { MoveTreeContext } from "../context/MoveTreeContext";
import { COLORS, colorScale } from "../lib/colors";

// Create an animated path component
const AnimatedPath = animated.path;

interface Props {
  link: HierarchyPointLink<TreeNodeData>,
  minimap?: boolean,
};

const linkStyle: React.CSSProperties = { vectorEffect: 'non-scaling-stroke' };

export const TreeLink = ({ link, minimap = false }: Props) => {
  const { nodeRadius } = useContext(MoveTreeContext);
  const { loading } = link.target.data;
  
  // Extract individual spring values
  const { sourceX, sourceY, targetX, targetY } = useSpring({
    immediate: loading,
    sourceX: link.source.x,
    sourceY: link.source.y,
    targetX: link.target.x,
    targetY: link.target.y,
    config: { tension: 170, friction: 26 },
  });

  // Create a function to generate the path based on animated values
  const pathGenerator = useCallback((
    sourceX: number, 
    sourceY: number, 
    targetX: number, 
    targetY: number
  ) => {
    // Calculate the frequency of the move
    const sourceGames = gameCount(link.source.data);
    const targetGames = gameCount(link.target.data);
    const frequency = sourceGames ? (targetGames / sourceGames) : 0;

    // Calculate the width of the link based on frequency
    const minWidth = minimap ? nodeRadius * 2/3 : nodeRadius / 3;
    const maxWidth = nodeRadius * 2 - 8;
    const scaledWidth = (maxWidth - minWidth) * frequency + minWidth;
    const width = Math.min(scaledWidth, maxWidth);

    // Calculate the control points for the bezier curve
    const sourceVertical = sourceX;
    const sourceHorizontal = sourceY;
    const targetVertical = targetX;
    const targetHorizontal = targetY;
    
    const midHorizontal = (sourceHorizontal + targetHorizontal) / 2;
    const curveOffset = Math.min(80, (targetHorizontal - sourceHorizontal) * 0.4);
    const controlHorizontal = midHorizontal - curveOffset;
    const topVertical = targetVertical - width / 2;
    const bottomVertical = targetVertical + width / 2;
    const verticalOffset = nodeRadius * 2 / 3;
    const sourceRightEdge = sourceHorizontal + nodeRadius - 1;
    const targetLeftEdge = targetHorizontal - nodeRadius;

    // Create the path string
    const start = `M${sourceRightEdge},${sourceVertical-verticalOffset}`;
    const ctrl1 = `C${controlHorizontal},${sourceVertical} ${midHorizontal},${topVertical} ${targetLeftEdge},${topVertical}`;
    const lineT = `L${targetLeftEdge},${bottomVertical}`;
    const ctrl2 = `C${midHorizontal},${bottomVertical} ${controlHorizontal},${sourceVertical} ${sourceRightEdge},${sourceVertical+verticalOffset}`;
    return `${start} ${ctrl1} ${lineT} ${ctrl2} Z`;
  }, [nodeRadius, minimap, link.source.data, link.target.data]);

  const linkFill = useMemo(() => {
    if (loading) return COLORS.loading;
    const { white, draws, black } = link.target.data;
    const games = white + draws + black;
    return (games === 0) ? COLORS.draw : colorScale((white - black) / games);
  }, [link.target.data, loading]);

  // Use the 'to' function to create an interpolated path
  const d = to(
    [sourceX, sourceY, targetX, targetY],
    (sx, sy, tx, ty) => pathGenerator(sx, sy, tx, ty)
  );

  return (
    <AnimatedPath
      className={cn(
        'stroke-[0.75] stroke-lightmode-900/60 dark:stroke-white dark:mix-blend-screen', {
        ['stroke-1']: minimap,
        ['[stroke-dasharray:6_10] animate-stroke-dash']: loading,
      })}
      d={d}
      fill={linkFill}
      filter="url(#linkShadow)"
      style={linkStyle}
    />
  );
};

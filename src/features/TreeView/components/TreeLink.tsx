import React, { useCallback, useContext, useMemo } from "react";
import { HierarchyPointLink } from "@visx/hierarchy/lib/types";
import { LinkHorizontal } from "@visx/shape";

import { cn } from "@/shared/lib/cn";
import { TreeNodeData } from "@/shared/types";
import { gameCount } from "@/shared/lib/tree";
import { MoveTreeContext } from "../context/MoveTreeContext";
import { COLORS, colorScale } from "../lib/colors";

interface Props {
  link: HierarchyPointLink<TreeNodeData>,
  minimap?: boolean,
};

const linkStyle: React.CSSProperties = { vectorEffect: 'non-scaling-stroke' };

export const TreeLink = ({ link, minimap = false }: Props) => {
  const { nodeRadius } = useContext(MoveTreeContext);
  const { loading } = link.target.data;

  const linkPath = useCallback((link: HierarchyPointLink<TreeNodeData>) => {
    const { source, target } = link;
    
    // Calculate the frequency of the move
    const sourceGames = gameCount(source.data);
    const targetGames = gameCount(target.data);
    const frequency = sourceGames ? (targetGames / sourceGames) : 0;

    // Calculate the width of the link based on frequency
    const minWidth = minimap ? nodeRadius * 2/3 : nodeRadius / 3;
    const maxWidth = nodeRadius * 2 - 8;
    const scaledWidth = (maxWidth - minWidth) * frequency + minWidth;
    const width = Math.min(scaledWidth, maxWidth);

    // Calculate the control points for the bezier curve
    const sourceVertical = source.x;
    const sourceHorizontal = source.y;
    const targetVertical = target.x;
    const targetHorizontal = target.y;
    
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
  }, [nodeRadius, minimap]);

  const linkFill = useMemo(() => {
    if (loading) return COLORS.loading;
    const { white, draws, black } = link.target.data;
    const games = white + draws + black;
    return (games === 0) ? COLORS.draw : colorScale((white - black) / games);
  }, [link.target.data, loading]);

  return (
    <LinkHorizontal
      className={cn(
        'stroke-[0.75] stroke-lightmode-900/60 dark:stroke-white dark:mix-blend-screen', {
        ['stroke-1']: minimap,
        ['[stroke-dasharray:6_10] animate-stroke-dash']: loading,
      })}
      path={linkPath}
      fill={linkFill}
      filter="url(#linkShadow)"
      data={link}
      style={linkStyle}
    />
  );
};

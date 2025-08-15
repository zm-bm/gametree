import React, { useCallback, useContext, useMemo } from "react";
import { HierarchyPointLink } from "@visx/hierarchy/lib/types";
import { LinkHorizontal } from "@visx/shape";

import { TreeNodeData } from "../../types/chess";
import { MoveTreeContext } from "../../contexts/MoveTreeContext";
import { COLORS, colorScale } from "./constants";
import { gameCount } from "../../lib/tree";

interface Props {
  link: HierarchyPointLink<TreeNodeData>,
  minimap?: boolean,
};

export const TreeLink = ({ link, minimap = false }: Props) => {
  const { nodeRadius } = useContext(MoveTreeContext);

  const linkPath = useCallback((link: HierarchyPointLink<TreeNodeData>) => {
    const { source, target } = link;
    
    // Calculate the frequency of the move
    const sourceGames = gameCount(source.data);
    const targetGames = gameCount(target.data);
    const frequency = sourceGames ? (targetGames / sourceGames) : 0;

    // Calculate the width of the link based on frequency
    const minWidth = minimap ? nodeRadius * 2/3 : nodeRadius / 3;
    const maxWidth = nodeRadius * 2 - 2;
    const calcWidth = (maxWidth - minWidth) * frequency + minWidth;
    const width = Math.min(calcWidth, maxWidth);

    // Calculate the control points for the bezier curve
    const midX = (source.y + target.y) / 2;
    const curveOffset = Math.min(80, (target.y - source.y) * 0.4);
    const controlPointX = midX - curveOffset;
    const topY = target.x - width / 2;
    const botY = target.x + width / 2;
    const offsetY = nodeRadius - 1;
    const offsetX = nodeRadius * 2 / 3;

    // Create the path string
    const start = `M${source.y+offsetY},${source.x-offsetX}`;
    const ctrl1 = `C${controlPointX},${source.x} ${midX},${topY} ${target.y},${topY}`;
    const lineT = `L${target.y},${botY}`;
    const ctrl2 = `C${midX},${botY} ${controlPointX},${source.x} ${source.y+offsetY},${source.x+offsetX}`;
    return `${start} ${ctrl1} ${lineT} ${ctrl2} Z`;
  }, [nodeRadius, minimap]);

  const linkFill = useMemo(() => {
    const { white, draws, black } = link.target.data;
    const games = white + draws + black;
    return (games === 0) ? COLORS.draw : colorScale((white - black) / games);
  }, [link.target.data]);

  const linkClass = useMemo(() => minimap ? 'tree-link-minimap' : 'tree-link', [minimap]);
  const linkStyle: React.CSSProperties = useMemo(() => ({ vectorEffect: 'non-scaling-stroke' }), []);

  return (
    <LinkHorizontal
      className={linkClass}
      path={linkPath}
      fill={linkFill}
      filter="url(#linkShadow)"
      data={link}
      style={linkStyle}
    />
  );
};

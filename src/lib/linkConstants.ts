import { HierarchyPointLink, HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { Color } from "chessground/types";
import { TreeNode } from "../types/chess";
import { countGames } from "./chess";
import scalePower from "@visx/scale/lib/scales/power";

export const winColor = '#66bb6a';
export const lossColor = '#f44336';
export const drawColor = '#535353';

export const colorScale = scalePower({
  domain: [-1, 0, 1],
  range: [lossColor, drawColor, winColor],
  exponent: 0.5,
});

export function calcStroke(node: HierarchyPointNode<TreeNode>, orientation: Color) {
  const games = countGames(node.data);
  if (games > 0) {
    const { white, black } = node.data.attributes;
    const whiteProb = white / games;
    const blackProb = black / games;
    const outcome = orientation === 'white'
      ? whiteProb - blackProb
      : blackProb - whiteProb;
    return colorScale(outcome);
  } else {
    return drawColor;
  }
}

export function calcPath(
  link: HierarchyPointLink<TreeNode>,
  r: number,
  minimap: boolean) {
  const { source, target } = link;
  const sourceGames = countGames(source.data), targetGames = countGames(target.data), frequency = (sourceGames && targetGames) ? (targetGames / sourceGames) : 0, width = Math.max(Math.min(Math.sqrt(frequency) * 2 * r, 2 * r), 4), midX = (source.y + target.y) / 2, quarterX = (source.y + midX) / 2, topY = target.x - width / 2, botY = target.x + width / 2, startOffset = (target.x > source.x) ? 0 : -1, endOffset = (target.x < source.x) ? 0 : -1, start = `M${source.y + r + startOffset},${source.x}`, topCurve = `C${quarterX},${topY},${midX},${topY},${midX},${topY}`, lineToNodeTop = `L${target.y},${topY}`, lineToNodeBottom = `L${target.y},${botY}`, linetoMidBottom = `L${midX},${botY}`, bottomCurve = `C${midX},${botY},${quarterX},${botY},${source.y + r + endOffset},${source.x}`;

  return (link.target.data.attributes.opening?.name && !minimap)
    ? `${start}${topCurve}${linetoMidBottom}${bottomCurve}`
    : `${start}${topCurve}${lineToNodeTop}${lineToNodeBottom}${linetoMidBottom}${bottomCurve}`;
}

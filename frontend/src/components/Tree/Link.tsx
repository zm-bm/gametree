import { HierarchyPointLink, HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { Group } from '@visx/group';
import { LinkHorizontal } from "@visx/shape";
import { scalePower } from "@visx/scale";
import { Text } from "@visx/text";
import { Color } from "chessground/types";

import { countGames } from "../../chess";
import { TreeNode } from "../../chess";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { mid } from '../../lib/helpers';
import { useContext } from "react";
import { TreeDimsContext } from "./MoveTree";

function calcPath(
  link: HierarchyPointLink<TreeNode>,
  r: number,
  minimap: boolean
) {
  const { source, target } = link;
  var sourceGames = countGames(source.data),
      targetGames = countGames(target.data),
      frequency = (sourceGames && targetGames) ? (targetGames / sourceGames) : 0,
      width = Math.max(Math.min(Math.sqrt(frequency) * 2 * r, 2 * r), 4),
      midX = mid(source.y, target.y),
      quarterX = mid(source.y, midX),
      topY = target.x - width / 2,
      botY = target.x + width / 2,
      startOffset = (target.x > source.x) ? 0 : -1,
      endOffset = (target.x < source.x) ? 0 : -1,
      start = `M${source.y+r+startOffset},${source.x}`,
      topCurve = `C${quarterX},${topY},${midX},${topY},${midX},${topY}`,
      lineToNodeTop = `L${target.y},${topY}`,
      lineToNodeBottom = `L${target.y},${botY}`,
      linetoMidBottom = `L${midX},${botY}`,
      bottomCurve = `C${midX},${botY},${quarterX},${botY},${source.y+r+endOffset},${source.x}`;

  return (link.target.data.attributes.opening?.name && !minimap)
    ? `${start}${topCurve}${linetoMidBottom}${bottomCurve}`
    : `${start}${topCurve}${lineToNodeTop}${lineToNodeBottom}${linetoMidBottom}${bottomCurve}`;
}

const winColor = '#66bb6a';
const lossColor = '#f44336';
const drawColor = '#535353';
const colorScale = scalePower({
  domain: [-1, 0, 1],
  range: [lossColor, drawColor, winColor],
  exponent: 0.66,
});
function calcStroke(node: HierarchyPointNode<TreeNode>, orientation: Color) {
  const games = countGames(node.data)
  if (games > 0) {
    const { white, black } = node.data.attributes;
    const whiteProb = white / games;
    const blackProb = black / games;
    const outcome = orientation === 'white'
      ? whiteProb - blackProb 
      : blackProb - whiteProb;
    return colorScale(outcome);
  } else {
    return drawColor
  }
};

interface Props {
  link: HierarchyPointLink<TreeNode>,
  minimap?: boolean
}

const Link = ({
  link,
  minimap = false,
}: Props) => {
  const { fontSize, columnWidth, nodeRadius} = useContext(TreeDimsContext);
  const orientation = useSelector((state: RootState) => state.game.orientation)
  const fill = calcStroke(link.target, orientation);
  const midX = mid(link.source.y, link.target.y);

  return (
    <Group style={{ cursor: 'pointer' }}>
      <LinkHorizontal
        path={link => calcPath(link, nodeRadius, minimap)}
        data={link}
        fill={fill}
      />
      {
        link.target.data.attributes.opening && !minimap && (
          <>
            <rect
              x={midX}
              y={link.target.x - nodeRadius}
              rx={2}
              width={columnWidth / 2}
              height={nodeRadius * 2}
              fill={fill}
              stroke="gray"
            ></rect>
            <Text
              x={midX}
              dx={8}
              y={link.target.x}
              width={columnWidth / 2 - nodeRadius}
              fill="white"
              fontSize={fontSize}
              verticalAnchor='middle'
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              { link.target.data.attributes.opening.name }
            </Text>
          </>
        )
      }
    </Group>
 )
};

export { Link };

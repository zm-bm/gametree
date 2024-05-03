import { HierarchyPointLink, HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { Group } from '@visx/group';
import { LinkHorizontal } from "@visx/shape";
import { scalePower } from "@visx/scale";
import { Text } from "@visx/text";

import { countGames } from "../../chess";
import { TreeNode } from "../../chess";

const winColor = '#66bb6a';
const lossColor = '#f44336';
const drawColor = '#535353';
const colorScale = scalePower({
  domain: [-1, 0, 1],
  range: [lossColor, drawColor, winColor],
  exponent: 0.5
});

const mid = (a: number, b: number) => a + (b - a) * 0.5;

function calcPath(
  link: HierarchyPointLink<TreeNode>,
  r: number,
) {
  const { source, target } = link;
  const sGames = countGames(source.data)
  const tGames = countGames(target.data)
  const width = (sGames && tGames)
    ? Math.sqrt(tGames / sGames) * 1.5 * r + 2
    : r * 0.1 + 2;
  const midX = mid(source.y, target.y);
  const quarterX = mid(source.y, midX)
  const topY = target.x - width/2;
  const botY = target.x + width/2;
  const startOffset = (target.x > source.x) ? 0 : -1
  const endOffset = (target.x < source.x) ? 0 : -1

  const start = `M${source.y+r+startOffset},${source.x}`
  const topCurve = `C${quarterX},${topY},${midX},${topY},${midX},${topY}`
  const lineToNodeTop = `L${target.y},${topY}`
  const lineToNodeBottom = `L${target.y},${botY}`
  const linetoMidBottom = `L${midX},${botY}`
  const bottomCurve = `C${midX},${botY},${quarterX},${botY},${source.y+r+endOffset},${source.x}`

  return (link.target.data.attributes.opening?.name)
    ? `${start}${topCurve}${linetoMidBottom}${bottomCurve}`
    : `${start}${topCurve}${lineToNodeTop}${lineToNodeBottom}${linetoMidBottom}${bottomCurve}`;
}

function calcStroke(node: HierarchyPointNode<TreeNode>) {
  const games = countGames(node.data)
  if (games) {
    const { white, black } = node.data.attributes;
    const whiteProb = white / games;
    const blackProb = black / games;
    const outcome = node.data.attributes.move?.color === 'w'
      ? whiteProb - blackProb 
      : blackProb - whiteProb;
    return colorScale(outcome);
  }
  else {
    return drawColor
  }
};

interface Props {
  link: HierarchyPointLink<TreeNode>,
  r: number,
  fontSize: number,
  nodeWidth: number,
}
const Link = ({
  link,
  r,
  fontSize,
  nodeWidth,
}: Props) => {
  const fill = calcStroke(link.target);
  const midX = mid(link.source.y, link.target.y);

  return (
    <Group style={{ cursor: 'pointer' }}>
      <LinkHorizontal
        path={link => calcPath(link, r)}
        data={link}
        fill={fill}
      />
      {
        link.target.data.attributes.opening && (
          <>
            <rect
              x={midX}
              y={link.target.x - r}
              rx={2}
              width={nodeWidth / 2}
              height={r * 2}
              fill={fill}
            ></rect>
            <Text
              x={midX}
              dx={8}
              y={link.target.x}
              width={nodeWidth / 2 - r}
              fill="white"
              scaleToFit='shrink-only'
              fontSize={fontSize+1}
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

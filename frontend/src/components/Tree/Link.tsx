import { HierarchyPointLink, HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { Group } from '@visx/group';
import { TreeNode } from "../../chess";
import { LinkHorizontal } from "@visx/shape";
import { scalePower, scaleSqrt } from "@visx/scale";
import { Text } from "@visx/text";
import { countGames } from "./helpers";

const strokeWidthScale = scaleSqrt({ domain: [0, 1], range: [8, 30] })
const winColor =  '#66bb6a'
const lossColor = '#f44336'
const drawColor =  '#555'

const colorScale = scalePower({
  domain: [-1, 0, 1],
  range: [lossColor, drawColor, winColor],
  exponent: 0.5
});

function calcPathWidth({ source, target }: HierarchyPointLink<TreeNode>) {
  const sGames = countGames(source.data)
  const tGames = countGames(target.data)
  return (sGames && tGames)
    ? strokeWidthScale(tGames / sGames)
    : strokeWidthScale(0);
}

const mid = (a: number, b: number) => a + (b - a) * 0.5;

function calcPath(
  link: HierarchyPointLink<TreeNode>,
  r: number,
) {
  const { source, target } = link;
  const width = calcPathWidth(link)
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

  return (link.target.data.attributes.title)
    ? `${start}${topCurve}${linetoMidBottom}${bottomCurve}`
    : `${start}${topCurve}${lineToNodeTop}${lineToNodeBottom}${linetoMidBottom}${bottomCurve}`;
}

function calcStroke(node: HierarchyPointNode<TreeNode>) {
  const games = countGames(node.data)
  if (games) {
    const { wins, losses } = node.data.attributes;
    const winProbability = wins! / games;
    const lossProbability = losses! / games;
    const outcome = node.data.attributes?.turn === 'b'
      ? winProbability - lossProbability
      : lossProbability - winProbability;
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
  onMouseMove: React.MouseEventHandler,
  onMouseLeave: () => void,
}
const Link = ({
  link,
  r,
  fontSize,
  nodeWidth,
  onMouseMove,
  onMouseLeave,
}: Props) => {
  const fill = calcStroke(link.target)
  const midX = mid(link.source.y, link.target.y)

  return (
    <Group
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'pointer' }}
    >
      <LinkHorizontal
        path={link => calcPath(link, r)}
        data={link}
        fill={fill}
      />
      {
        link.target.data.attributes.title && (
          <>
            <rect
              x={midX}
              y={link.target.x - r}
              rx={5}
              width={nodeWidth / 2}
              height={r * 2}
              fill={fill}
              opacity={0.66}
            ></rect>
            <Text
              x={midX}
              dx={10}
              y={link.target.x}
              fontSize={fontSize}
              verticalAnchor='middle'
              fill="black"
              width={nodeWidth / 2 + r}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {link.target.data.attributes.title}
            </Text>
          </>
        )
      }
    </Group>
  )
};

export { Link };

import { useContext } from "react";
import { useSelector } from "react-redux";
import { HierarchyPointLink } from "@visx/hierarchy/lib/types";
import { Group } from '@visx/group';
import { LinkHorizontal } from "@visx/shape";
import { Text } from "@visx/text";

import { TreeNode } from "../types/chess";
import { RootState } from "../store";
import { TreeDimsContext } from "../contexts/TreeContext";
import { calcPath, calcStroke } from "../lib/tree";

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
  const midX = (link.source.y + link.target.y) / 2;

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

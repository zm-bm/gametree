import { Group } from '@visx/group'
import { HierarchyPointNode } from "@visx/hierarchy/lib/types"
import { ProvidedZoom } from '@visx/zoom/lib/types';

import { TreeNode } from "../../chess"
import { ZoomState } from "./MoveTree";
import { mid } from "../../lib/helpers"
import { Link } from './Link'
import { Node } from './Node'

interface Props {
  tree: HierarchyPointNode<TreeNode>
  width: number,
  height: number,
  zoom: ProvidedZoom<SVGSVGElement> & ZoomState,
  nodeRadius: number,
  treeWidth: number,
  fontSize: number,
  currentNode: string,
}

export const TreeMinimap = ({
  tree,
  width,
  height,
  zoom,
  nodeRadius,
  treeWidth,
  fontSize,
  currentNode,
}: Props) => {
  const nodes = tree.descendants()
  const left = -nodes.reduce((left, node) => Math.min(left, node.y), Infinity) + 100;
  const top = -nodes.reduce((top, node) => Math.min(top, node.x), Infinity) +100;
  const right = -nodes.reduce((right, node) => Math.max(right, node.y), -Infinity) - 100;
  const bottom = -nodes.reduce((bottom, node) => Math.max(bottom, node.x), -Infinity) - 100;
  const boundingBoxWidth = left - right;
  const boundingBoxHeight = top - bottom;
  const aspectRatio = width / height ;
  const boundingBoxAspectRatio = boundingBoxWidth / boundingBoxHeight;
  const scale = (boundingBoxAspectRatio > aspectRatio)
    ? width / boundingBoxWidth
    : height / boundingBoxHeight;

  const midX = mid(left, right);
  const midY = mid(bottom, top);
  const translateX = midX*scale + width/2;
  const translateY = midY*scale + height/2;

  return (
    <Group
      transform={`matrix(${scale} 0 0 ${scale} ${translateX} ${translateY})`}
    >
      {tree.links().map((link, i) => (
        <Link
          key={`link-${i}`}
          link={link}
          r={nodeRadius}
          fontSize={fontSize}
          treeWidth={treeWidth}
          minimap={true}
        />
      ))}
      {tree.descendants().map((node, i) => (
        <Node
          key={`node-${i}`}
          node={node}
          r={nodeRadius}
          fontSize={fontSize}
          isCurrentNode={currentNode === node.data.name}
          minimap={true}
        />
      ))}
      <rect
        width={width}
        height={height}
        fill="white"
        fillOpacity={0.2}
        stroke="white"
        strokeWidth={4}
        transform={zoom.toStringInvert()}
      />
    </Group>
  )
}
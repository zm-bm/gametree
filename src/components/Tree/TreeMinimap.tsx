import { Group } from '@visx/group'
import { HierarchyNode } from "@visx/hierarchy/lib/types"
import { ProvidedZoom } from '@visx/zoom/lib/types';

import { TreeNode } from "../../chess"
import { TreeDimsContext, ZoomState } from "./MoveTree";
import { mid } from "./TreeSvg";
import { Link } from './Link'
import { Node } from './Node'
import { Tree } from '@visx/hierarchy';
import { useContext } from 'react';

interface Props {
  root: HierarchyNode<TreeNode>
  zoom: ProvidedZoom<SVGSVGElement> & ZoomState,
}

export const TreeMinimap = ({
  root,
  zoom,
}: Props) => {
  const {
    height,
    width,
    columnWidth,
    rowHeight,
  } = useContext(TreeDimsContext);

  return (
    <g
      clipPath='url(#minimap)'
      transform={`
        scale(0.25)
        translate(${width*3}, ${height*3})
      `}
    >
      <rect
        width={width}
        height={height}
        fill='#eee'
        stroke='black'
        strokeWidth={4}
      />
      <Tree<TreeNode>
        root={root}
        nodeSize={[rowHeight, columnWidth]}
      >
        {(tree) => {
          var nodes = tree.descendants(),
              left = -nodes.reduce((acc, node) => Math.min(acc, node.y), Infinity) + 100,
              top = -nodes.reduce((acc, node) => Math.min(acc, node.x), Infinity) + 100,
              right = -nodes.reduce((acc, node) => Math.max(acc, node.y), -Infinity) - 100,
              bottom = -nodes.reduce((acc, node) => Math.max(acc, node.x), -Infinity) - 100,
              boundingBoxWidth = left - right,
              boundingBoxHeight = top - bottom,
              aspectRatio = width / height,
              boundingBoxAspectRatio = boundingBoxWidth / boundingBoxHeight,
              scale = (boundingBoxAspectRatio > aspectRatio)
                ? width / boundingBoxWidth
                : height / boundingBoxHeight,
              midX = mid(left, right),
              midY = mid(bottom, top),
              translateX = midX*scale + width/2,
              translateY = midY*scale + height/2;

          return (
            <Group transform={`matrix(${scale} 0 0 ${scale} ${translateX} ${translateY})`}>
              {tree.links().map((link, i) => (
                <Link
                  key={`link-${i}`}
                  link={link}
                  minimap={true}
                />
              ))}
              {tree.descendants().map((node, i) => (
                <Node
                  key={`node-${i}`}
                  node={node}
                  isCurrentNode={false}
                  minimap={true}
                />
              ))}
              <rect
                width={width}
                height={height}
                fill="black"
                fillOpacity={0.3}
                stroke="white"
                strokeWidth={4}
                transform={zoom.toStringInvert()}
              />
            </Group>
          );
        }}
      </Tree>
    </g>
  )
}
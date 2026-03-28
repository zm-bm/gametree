import { useContext, useMemo } from "react";
import { useSelector } from "react-redux";
import { DEFAULT_POSITION } from "chess.js";
import { Group } from "@visx/group";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { animated } from "react-spring";
import { FluidValue } from '@react-spring/shared';

import { RootState } from "@/store";
import { selectBoardOrientation, selectCurrentVisibleId, selectIsDarkMode } from "@/store/selectors";
import { TreeViewNode } from "@/shared/types";
import { TreeDimensionsContext } from "../context/TreeDimensionsContext";
import { useTreeNodeInteractions } from "../hooks/useTreeNodeInteractions";
import { TreeNodeButtons } from "./TreeNodeButtons";
import { TreeNodeLoadingIndicator } from "./TreeNodeLoadingIndicator";
import { TreeNodeMoveLabel } from "./TreeNodeMoveLabel";
import { TreeNodeMoveFrequency } from "./TreeNodeMoveFrequency";
import { TreeNodeWinFrequency } from "./TreeNodeWinFrequency";

const AnimatedGroup = animated(Group);

type TreeNodePalette = {
  frequencyTextColor: string;
  barTrackColor: string;
  barStrokeColor: string;
};

function getTreeNodePalette(isDarkMode: boolean): TreeNodePalette {
  if (isDarkMode) {
    return {
      frequencyTextColor: "rgba(226,232,240,0.8)",
      barTrackColor: "rgba(255,255,255,0.13)",
      barStrokeColor: "rgba(255,255,255,0.24)",
    };
  }

  return {
    frequencyTextColor: "rgba(226,232,240,0.82)",
    barTrackColor: "rgba(15,23,42,0.13)",
    barStrokeColor: "rgba(15,23,42,0.22)",
  };
}

interface Props {
  node: HierarchyPointNode<TreeViewNode>;
  x: FluidValue<number> | number;
  y: FluidValue<number> | number;
  minimap?: boolean;
}

export const TreeNode = ({
  node,
  x,
  y,
  minimap = false,
}: Props) => {
  const { id, loading } = node.data;

  const { fontSize, nodeRadius, nodeRectSize } = useContext(TreeDimensionsContext);
  const currentNodeId = useSelector((s: RootState) => selectCurrentVisibleId(s));
  const boardOrientation = useSelector((s: RootState) => selectBoardOrientation(s));
  const isDarkMode = useSelector((s: RootState) => selectIsDarkMode(s));
  const {
    isNodeHovered,
    handleNodeClick,
    handleNodeMouseEnter,
    handleNodeMouseLeave,
  } = useTreeNodeInteractions({ node, minimap });

  const nodePalette = useMemo(() => getTreeNodePalette(isDarkMode), [isDarkMode]);

  return (
    <AnimatedGroup
      top={x}
      left={y}
      onMouseEnter={handleNodeMouseEnter}
      onMouseLeave={handleNodeMouseLeave}
    >
      {/* Button drawer */}
      {!minimap && isNodeHovered && (
        <TreeNodeButtons
          nodeId={id}
          nodeRadius={nodeRadius}
          onMouseLeave={handleNodeMouseLeave}
        />
      )}

      {/* Move node*/}
      <g
        cursor={minimap ? undefined : "pointer"}
        onClick={handleNodeClick}
        data-fen={node.data.move?.after || DEFAULT_POSITION}
        data-move={node.data.move?.lan || ""}
        data-id={node.data.id}
      >
        {/* Invisible interaction surface that keeps hover/click handling stable. */}
        {!minimap && (
          <rect
            x={-nodeRectSize / 2}
            y={-nodeRectSize / 2}
            width={nodeRectSize}
            height={nodeRectSize}
            fill="transparent"
            style={{ pointerEvents: "all" }}
          />
        )}

        {!minimap && (
          <>
            {/* Main node shell visual. */}
            <rect
              x={-nodeRectSize / 2}
              y={-nodeRectSize / 2}
              width={nodeRectSize}
              height={nodeRectSize}
              rx={Math.max(3, Math.round(nodeRectSize * 0.05))}
              ry={Math.max(3, Math.round(nodeRectSize * 0.05))}
              fill={currentNodeId === id ? "url(#currentNodeGradient)" : "url(#moveGradient)"}
              stroke={currentNodeId === id ? "rgba(245,158,11,0.95)" : isDarkMode ? "rgba(255,255,255,0.22)" : "rgba(71,85,105,0.28)"}
              strokeWidth={currentNodeId === id ? 1.2 : 0.8}
              style={{ pointerEvents: "none" }}
            />

            {/* Move frequency metadata pill (share among siblings). */}
            <TreeNodeMoveFrequency
              node={node}
              nodeRectSize={nodeRectSize}
              frequencyTextColor={nodePalette.frequencyTextColor}
              minimap={minimap}
              fontSize={fontSize}
            />

            {/* Bottom W/D/L composition bar with percentages. */}
            <TreeNodeWinFrequency
              node={node}
              nodeSize={nodeRectSize}
              barTrackColor={nodePalette.barTrackColor}
              barStrokeColor={nodePalette.barStrokeColor}
              minimap={minimap}
              boardOrientation={boardOrientation}
              fontSize={fontSize}
            />

            {/* Primary move label: the main identifier for this node. */}
            <TreeNodeMoveLabel
              move={node.data.move}
              fontSize={fontSize}
            />
          </>
        )}

        {/* Minimap keeps only a minimal square marker for performance/readability. */}
        {minimap && (
          <g>
            <rect
              x={-nodeRectSize / 2}
              y={-nodeRectSize / 2}
              rx={3}
              ry={3}
              width={nodeRectSize}
              height={nodeRectSize}
              fill={currentNodeId === id ? "url(#currentNodeGradient)" : "url(#moveGradient)"}
              stroke={currentNodeId === id ? "rgba(245,158,11,0.95)" : isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(15,23,42,0.25)"}
              strokeWidth={currentNodeId === id ? 1.4 : 0.8}
              style={{ pointerEvents: "none" }}
            />
          </g>
        )}
        {loading && <TreeNodeLoadingIndicator radius={nodeRadius - 2} />}
      </g>
    </AnimatedGroup>
  );
};

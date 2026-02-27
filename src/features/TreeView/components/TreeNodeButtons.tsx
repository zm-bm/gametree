import React, { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { IconType } from "react-icons";
import { FaBookmark, FaBullseye, FaChevronRight } from "react-icons/fa";

import { RootState, useAppDispatch } from "@/store";
import { TreeNodeData } from "@/shared/types";
import { nav, tree } from "@/store/slices";
import { selectTreeSource } from "@/store/selectors";
import { cn } from "@/shared/lib/cn";

interface ButtonConfig {
  key: string;
  icon: IconType;
  onClick: (e: React.MouseEvent) => void;
  rotate?: number;
  active?: boolean;
}

interface Props {
  node: HierarchyPointNode<TreeNodeData>;
  nodeRadius: number;
  onMouseLeave: () => void;
}

export const TreeNodeButtons = ({
  node,
  nodeRadius,
  onMouseLeave,
}: Props) => {
  const { collapsed } = node.data;
  const dispatch = useAppDispatch();
  const source = useSelector((s: RootState) => selectTreeSource(s))

  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const buttonConfigs: ButtonConfig[] = useMemo(() => [
    { 
      key: 'collapse/expand',
      icon: FaChevronRight, 
      onClick: () => {
        if (!node.data.childrenLoaded) {
          dispatch(nav.actions.navigateToId(node.data.id));
        } else {
          dispatch(tree.actions.setNodeCollapsed({ nodeId: node.data.id, source, value: !collapsed }))
        }
      },
      rotate: (node.data.collapsed || (node.data.children.length === 0 && !node.data.loading))
        ? 0 : 90,
      active: node.data.collapsed,
    },
    { 
      key: 'isolate',  
      icon: FaBullseye, 
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); } 
    },
    { 
      key: 'bookmark', 
      icon: FaBookmark, 
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); } 
    },
  ], [collapsed, node, source, dispatch]);

  const drawerConfig = useMemo(() => {
    const numIcons = buttonConfigs.length;
    const buttonSize = nodeRadius;
    
    return {
      buttonSize,
      drawerWidth: buttonSize,
      drawerHeight: buttonSize * numIcons,
      drawerX: -nodeRadius * 2.25,
      drawerY: -buttonSize * numIcons / 2,
    };
  }, [nodeRadius, buttonConfigs.length]);

  return (
    <>
      {/* Invisible bridge between node and drawer */}
      <rect
        x={drawerConfig.drawerX}
        y={-nodeRadius}
        width={nodeRadius * 1.25}
        height={nodeRadius * 2}
        fill="transparent"
        stroke="transparent"
        style={{ pointerEvents: "auto" }}
        onMouseEnter={stopPropagation}
        onMouseLeave={stopPropagation}
      />

      {/* Button drawer */}
      <g
        transform={`translate(${drawerConfig.drawerX}, ${drawerConfig.drawerY})`}
        onMouseLeave={onMouseLeave}
      >
        {/* Drawer background */}
        <rect
          x={0} y={0} 
          width={drawerConfig.drawerWidth} 
          height={drawerConfig.drawerHeight}
          rx={4} ry={4}
          className="stroke-lightmode-950/40 dark:stroke-darkmode-100/20 fill-lightmode-50/90 dark:fill-darkmode-900/90"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Vertical button stack */}
        {buttonConfigs.map((button, index) => (
          <g
            key={button.key}
            transform={`translate(${drawerConfig.buttonSize/2}, ${index * drawerConfig.buttonSize + drawerConfig.buttonSize/2}) rotate(${button.rotate ?? 0})`}
            onClick={button.onClick}
            className="cursor-pointer select-none group"
            style={{ pointerEvents: "auto" }}
          >
            <title>{button.key}</title>
            <rect 
              x={-drawerConfig.buttonSize/2} 
              y={-drawerConfig.buttonSize/2} 
              width={drawerConfig.buttonSize} 
              height={drawerConfig.buttonSize}
              rx={4} ry={4}
              fill="transparent" 
              className={cn(
                "group-hover:fill-lightmode-900/10 dark:group-hover:fill-darkmode-100/10",
                button.active && "fill-lightmode-900/15 dark:fill-darkmode-100/15",
              )}
            />
            
            <g transform={`translate(${-drawerConfig.buttonSize/4},${-drawerConfig.buttonSize/4})`}>
              <button.icon 
                size={drawerConfig.buttonSize/2}
                className="text-slate-700 dark:text-slate-200" 
              />
            </g>
          </g>
        ))}
      </g>
    </>
  );
};
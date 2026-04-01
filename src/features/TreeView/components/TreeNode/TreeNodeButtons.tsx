import React, { useContext, useEffect, useMemo, useState } from "react";
import { IconType } from "react-icons";
import { FaCheck, FaCopy, FaExternalLinkAlt } from "react-icons/fa";
import { FaThumbtack, FaThumbtackSlash } from "react-icons/fa6";
import { useSelector } from "react-redux";

import { RootState, useAppDispatch } from "@/store";
import { selectPinnedNodes } from "@/store/selectors";
import { tree } from "@/store/slices";
import { cn } from "@/shared/lib/cn";
import { ZoomContext } from "../../context/ZoomContext";

const getLichessAnalysisUrl = (fen: string) => {
  const fenPath = fen.trim().replace(/\s+/g, "_");
  return `https://lichess.org/analysis/standard/${fenPath}`;
};

interface ButtonConfig {
  key: string;
  title: string;
  icon: IconType;
  onClick: (e: React.MouseEvent) => void;
  rotate?: number;
  isActive?: boolean;
}

interface Props {
  nodeId: string;
  fen: string;
  nodeRadius: number;
}

export const TreeNodeButtons = ({
  nodeId,
  fen,
  nodeRadius,
}: Props) => {
  const dispatch = useAppDispatch();
  const { zoom } = useContext(ZoomContext);
  const pinnedNodes = useSelector((s: RootState) => selectPinnedNodes(s));
  const isPinned = pinnedNodes.includes(nodeId);
  const [isFenCopied, setIsFenCopied] = useState(false);

  useEffect(() => {
    if (!isFenCopied) return;

    const timeoutId = window.setTimeout(() => setIsFenCopied(false), 1200);
    return () => window.clearTimeout(timeoutId);
  }, [isFenCopied]);

  const buttonConfigs: ButtonConfig[] = useMemo(() => {
    return [
      {
        key: 'pin',
        title: isPinned ? 'unpin' : 'pin',
        icon: isPinned ? FaThumbtackSlash : FaThumbtack,
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          dispatch(tree.actions.toggleNodePinned(nodeId));
        },
        isActive: isPinned,
      },
      {
        key: 'copy',
        title: isFenCopied ? 'copied' : 'copy fen',
        icon: isFenCopied ? FaCheck : FaCopy,
        onClick: async (e: React.MouseEvent) => {
          e.stopPropagation();
          try {
            await navigator.clipboard.writeText(fen);
            setIsFenCopied(true);
          } catch {
            setIsFenCopied(false);
          }
        },
        isActive: isFenCopied,
      },
      {
        key: 'lichess',
        title: 'open in lichess',
        icon: FaExternalLinkAlt,
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          window.open(getLichessAnalysisUrl(fen), "_blank", "noopener,noreferrer");
        },
      },
    ];
  }, [dispatch, fen, isFenCopied, isPinned, nodeId]);

  const drawerConfig = useMemo(() => {
    const numIcons = buttonConfigs.length;
    const zoomCompensation = zoom.transformMatrix.scaleX / 1.5;
    const buttonSize = Math.max(16, Math.round(nodeRadius / zoomCompensation));
    const buttonGap = Math.max(1, Math.round(buttonSize * 0.08));
    const drawerPadding = 0;
    const drawerCornerRadius = Math.max(3, Math.round(buttonSize * 0.2));
    const buttonCornerRadius = Math.max(3, Math.round(buttonSize * 0.2));
    const drawerGapFromNode = Math.max(2, Math.round(buttonSize * 0.18));
    const nodeHalfSize = nodeRadius;
    const drawerWidth = buttonSize;
    const drawerHeight = buttonSize * numIcons + buttonGap * (numIcons - 1) + drawerPadding * 2;
    const drawerX = -(nodeHalfSize + drawerGapFromNode + drawerWidth);
    const drawerY = -drawerHeight / 2;
    const bridgeX = drawerX + drawerWidth;
    const bridgeWidth = drawerGapFromNode;
    const bridgeY = Math.min(-nodeHalfSize, drawerY);
    const bridgeBottom = Math.max(nodeHalfSize, drawerY + drawerHeight);
    const bridgeHeight = bridgeBottom - bridgeY;
    
    return {
      buttonSize,
      drawerWidth,
      buttonGap,
      drawerPadding,
      drawerHeight,
      drawerX,
      drawerY,
      drawerCornerRadius,
      buttonCornerRadius,
      bridgeX,
      bridgeY,
      bridgeWidth,
      bridgeHeight,
    };
  }, [nodeRadius, buttonConfigs.length, zoom.transformMatrix?.scaleX]);

  return (
    <>
      {/* Invisible bridge between node and drawer */}
      <rect
        x={drawerConfig.bridgeX}
        y={drawerConfig.bridgeY}
        width={drawerConfig.bridgeWidth}
        height={drawerConfig.bridgeHeight}
        fill="transparent"
        stroke="transparent"
        style={{ pointerEvents: "auto" }}
      />

      {/* Button drawer */}
      <g
        transform={`translate(${drawerConfig.drawerX}, ${drawerConfig.drawerY})`}
      >
        {/* Drawer background */}
        <rect
          x={0} y={0} 
          width={drawerConfig.drawerWidth} 
          height={drawerConfig.drawerHeight}
          rx={drawerConfig.drawerCornerRadius} ry={drawerConfig.drawerCornerRadius}
          className="stroke-lightmode-900/20 dark:stroke-darkmode-100/20 fill-lightmode-50/80 dark:fill-darkmode-800/70"
          strokeWidth={0.85}
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Vertical button stack */}
        {buttonConfigs.map((button, index) => {
          const buttonSurfaceClassName = cn(
            "transition-colors duration-150",
            button.isActive && "fill-amber-400/20 stroke-amber-700/50 dark:fill-amber-300/10 dark:stroke-amber-200/50",
            button.isActive
              ? "group-hover:fill-amber-400/30 group-hover:stroke-amber-700/70"
              : "group-hover:fill-lightmode-700/10 group-hover:stroke-lightmode-900/20",
            button.isActive
              ? "dark:group-hover:fill-amber-300/20 dark:group-hover:stroke-amber-100/70"
              : "dark:group-hover:fill-darkmode-100/10 dark:group-hover:stroke-darkmode-100/30",
          );
          const buttonIconClassName = cn(
            "transition-colors duration-150",
            button.isActive
              ? "text-amber-700 group-hover:text-amber-800 dark:text-amber-200 dark:group-hover:text-amber-100"
              : "text-slate-600 group-hover:text-slate-800 dark:text-darkmode-200 dark:group-hover:text-darkmode-100",
          );

          return (
            <g
              key={button.key}
              transform={`translate(${drawerConfig.buttonSize/2}, ${drawerConfig.drawerPadding + index * (drawerConfig.buttonSize + drawerConfig.buttonGap) + drawerConfig.buttonSize/2}) rotate(${button.rotate ?? 0})`}
              onClick={button.onClick}
              className="cursor-pointer select-none group"
              style={{ pointerEvents: "auto" }}
            >
              <title>{button.title}</title>
              <rect 
                x={-drawerConfig.buttonSize/2} 
                y={-drawerConfig.buttonSize/2} 
                width={drawerConfig.buttonSize} 
                height={drawerConfig.buttonSize}
                rx={drawerConfig.buttonCornerRadius} ry={drawerConfig.buttonCornerRadius}
                fill="transparent" 
                className={buttonSurfaceClassName}
                stroke={button.isActive ? "currentColor" : "transparent"}
                strokeWidth={0.85}
                color={button.isActive ? "rgba(217,119,6,0.68)" : undefined}
              />
              
              <g transform={`translate(${-drawerConfig.buttonSize * 0.2},${-drawerConfig.buttonSize * 0.2})`}>
                <button.icon 
                  size={drawerConfig.buttonSize * 0.4}
                  className={buttonIconClassName} 
                />
              </g>
            </g>
          );
        })}
      </g>
    </>
  );
};
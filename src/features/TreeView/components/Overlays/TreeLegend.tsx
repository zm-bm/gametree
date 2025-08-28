import React, { useState, useCallback, useMemo } from "react";
import { cn } from "@/shared/lib/cn";
import { colorScale } from "../../lib/colors";

const LEGEND_STYLES = {
  colorValues: [0.5, 0.2, 0.0, -0.2, -0.5],
  widthValues: [8, 12, 16, 20, 24],
  titleClass: "text-sm text-center font-semibold pb-1",
  labelClass: "flex justify-between text-[11px] mb-1 text-zinc-700 dark:text-zinc-200",
  rampClass: "grid grid-cols-5 gap-[4px] items-center h-[26px]",
  blockClass: "rounded-[8px] border border-lightmode-900/40 dark:border-black shadow-md",
};

const ColorRamp = React.memo(() => (
  <>
    <div className={LEGEND_STYLES.titleClass}>Edge Color → Result</div>
    <div className={LEGEND_STYLES.labelClass}>
      <span>Winning</span>
      <span>Draw</span>
      <span>Losing</span>
    </div>
    <div className="relative">
      <div className={LEGEND_STYLES.rampClass}>
        {LEGEND_STYLES.colorValues.map((value, i) => (
          <div
            key={i}
            style={{ background: colorScale(value), height: '14px' }}
            className={LEGEND_STYLES.blockClass}
          />
        ))}
      </div>
    </div>
  </>
));

const WidthRamp = React.memo(() => (
  <>
    <div className={LEGEND_STYLES.titleClass}>Edge Width → Frequency</div>
    <div className={LEGEND_STYLES.labelClass}>
      <span>Rare</span>
      <span>Common</span>
    </div>
    <div className="relative">
      <div className={LEGEND_STYLES.rampClass}>
        {LEGEND_STYLES.widthValues.map((height, i) => (
          <div
            key={i}
            className={cn(LEGEND_STYLES.blockClass, "bg-zinc-400")}
            style={{ height: `${height}px`, borderRadius: `${height / 4 + 4}px` }}
          />
        ))}
      </div>
    </div>
  </>
));

export const TreeLegend = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(localStorage.gtLegendCollapsed === '1');

  const toggleCollapsed = useCallback(() => {
    localStorage.gtLegendCollapsed = isCollapsed ? '' : '1';
    setIsCollapsed(prev => !prev);
  }, [isCollapsed]);

  const arrowStyle = useMemo(() => ({
    transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
  }), [isCollapsed]);

  return (
    <div className="treeview-card min-w-[12rem] select-none">
      {/* Collapsible header */}
      <div
        className="px-3 py-2 flex justify-between items-center cursor-pointer interactive-treeview"
        onClick={toggleCollapsed}
      >
        <div className="text-sm font-bold">Legend</div>
        <div className="text-sm transition-transform duration-300" style={arrowStyle}>▲</div>
      </div>

      {/* Animated collapsible content */}
      <div
        className={cn(
          "treeview-divider transition-all duration-300 ease-in-out overflow-hidden",
          isCollapsed ? "max-h-0 opacity-0" : "max-h-60 opacity-100"
        )}
      >
        <div>
          <ColorRamp />
        </div>
        <div>
          <WidthRamp />
        </div>
      </div>
    </div>
  );
};

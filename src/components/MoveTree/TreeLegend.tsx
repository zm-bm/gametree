import React, { useState, useCallback, useMemo } from "react";

import { colorScale } from "./constants";

const LEGEND_STYLES = {
  colorValues: [0.5, 0.2, 0.0, -0.2, -0.5],
  widthValues: [6, 10, 14, 18, 22],
  titleClass: "text-sm text-center font-semibold pb-1",
  labelClass: "flex justify-between text-[11px] mb-1 text-zinc-700 dark:text-zinc-200",
  rampClass: "grid grid-cols-5 gap-1 items-center h-[24px]",
  blockClass: "rounded-lg ring-1 ring-zinc-900/30 dark:ring-white/15 opacity-80",
};

const ColorRamp = React.memo(() => {
  return (
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
  );
});

const WidthRamp = React.memo(() => {
  return (
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
              className={`${LEGEND_STYLES.blockClass} bg-zinc-500 dark:bg-zinc-300`}
              style={{ height: `${height}px` }}
            />
          ))}
        </div>
      </div>
    </>
  );
});

export const TreeLegend = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);
  
  const arrowStyle = useMemo(() => ({
    transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
  }), [isExpanded]);

  const contentClass = useMemo(() =>
    `border-t border-gray-500 transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`
  , [isExpanded]);

  return (
    <div className="tree-overlay min-w-44 absolute top-2 right-2">
      {/* Collapsible header */}
      <div 
        className="px-3 py-2 flex justify-between items-center cursor-pointer"
        onClick={toggleExpanded}
      >
        <div className="text-sm font-bold">Legend</div>
        <div className="text-sm transition-transform duration-300" style={arrowStyle}>▲</div>
      </div>

      {/* Animated collapsible content */}
      <div className={contentClass}>
        <div className="p-3 space-y-4">
          <div className="space-y-1">
            <ColorRamp />
          </div>
          <div className="space-y-1">
            <WidthRamp />
          </div>
        </div>
      </div>
    </div>
  );
};

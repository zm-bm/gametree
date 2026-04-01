import React from "react";
import { cn } from "@/shared/lib/cn";
import { colorScale } from "../../lib/colors";
import { TreeOverlayCard } from "./TreeOverlayCard";

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

const TreeLegendBase = () => {
  return (
    <TreeOverlayCard
      title="Legend"
      persistKey="gtLegendCollapsed"
    >
      <div>
        <ColorRamp />
      </div>
      <div>
        <WidthRamp />
      </div>
    </TreeOverlayCard>
  );
};

export const TreeLegend = React.memo(TreeLegendBase);

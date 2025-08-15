import React from "react";
import { Group } from '@visx/group';

import { colorScale, COLORS } from "../MoveTree/constants";

const colorEntries = [
  { label: "Winning", value: 0.4 },
  { label: "Draw", value: 0 },
  { label: "Losing", value: -0.4 },
];

const thicknessEntries = [
  { label: "Common", frequency: 0.9, id: "common" },
  { label: "Rare", frequency: 0.1, id: "rare" }
];

export const TreeLegend: React.FC = () => {
  const legendWidth = '100%';
  const entryHeight = 24;
  const sampleLinkWidth = 50;
  const labelOffset = 12;
  const fontSize = 12;

  return (
    <div className="mb-2">
      <div className="px-4 pt-3 pb-1">
        <div className="grid grid-cols-12 gap-2">
          {/* Color Legend */}
          <div className="col-span-6 space-y-2">
            <div className="text-sm font-semibold text-gray-700 border-b pb-1">Color → Win</div>
            <svg width={legendWidth} height={colorEntries.length * entryHeight}>
              {colorEntries.map((entry, i) => {
                const y = i * entryHeight + entryHeight/2;
                const outcome = entry.value;
                const color = colorScale(outcome);
                
                return (
                  <Group 
                    key={i} 
                    top={y}
                  >
                    <rect
                      x={0}
                      y={-entryHeight / 4}
                      rx={2}
                      ry={2}
                      width={sampleLinkWidth}
                      height={entryHeight / 2}
                      fill={color}
                      // stroke={COLORS.stroke}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      filter="url(#linkShadow)"
                      className="tree-link"
                    />
                    <text 
                      x={sampleLinkWidth + labelOffset} 
                      y={4} 
                      fontSize={fontSize} 
                      className="font-medium"
                    >
                      {entry.label}
                    </text>
                  </Group>
                );
              })}
            </svg>
          </div>

          {/* Width Legend */}
          <div className="col-span-6 space-y-2">
            <div className="text-sm font-semibold text-gray-700 border-b pb-1">Width → Freq.</div>
            <svg width={legendWidth} height={thicknessEntries.length * entryHeight}>
              {thicknessEntries.map((entry, i) => {
                const y = i * entryHeight + entryHeight/2;
                const thickness = Math.max(Math.sqrt(entry.frequency) * 12, 2);
                
                return (
                  <Group 
                    key={i} 
                    top={y}
                  >
                    <rect 
                      x={0}
                      y={-thickness / 2}
                      rx={2}
                      ry={2}
                      width={sampleLinkWidth}
                      height={thickness}
                      fill={COLORS.draw}
                      filter="url(#linkShadow)"
                      className="tree-link"
                    />
                    <text 
                      x={sampleLinkWidth + labelOffset} 
                      y={3} 
                      fontSize={fontSize} 
                      className="font-medium text-gray-100"
                    >
                      {entry.label}
                    </text>
                  </Group>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

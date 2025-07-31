import React from "react";
import { Group } from '@visx/group';

import { drawColor, colorScale } from "../lib/linkConstants"

export const TreeLegend: React.FC = () => {
  const legendWidth = 150;
  const entryHeight = 22;
  const sampleLinkWidth = 40;
  const labelOffset = 12;

  const colorEntries = [
    { label: "Winning", value: 1 },
    { label: "Equal", value: 0 },
    { label: "Losing", value: -1 }
  ];
  
  const thicknessEntries = [
    { label: "Common", frequency: 1 },
    { label: "Uncommon", frequency: 0 }
  ];

  return (
    <div className="p-2 bg-white border border-gray-300 rounded shadow mb-2">
      <div className="text-sm font-semibold mb-2">Legend</div>
      
      <div className="text-xs mb-1">Line color (outcome)</div>
      <svg width={legendWidth} height={colorEntries.length * entryHeight}>
        {colorEntries.map((entry, i) => {
          const y = i * entryHeight + entryHeight/2;
          const outcome = entry.value;
          const color = colorScale(outcome);
          
          return (
            <Group key={i} top={y}>
              <line 
                x1={0} 
                y1={0} 
                x2={sampleLinkWidth} 
                y2={0} 
                stroke={color} 
                strokeWidth={7} 
                strokeLinecap="round"
              />
              <text x={sampleLinkWidth + labelOffset} y={4} fontSize={12}>{entry.label}</text>
            </Group>
          );
        })}
      </svg>
      
      <div className="text-xs mb-1 mt-2">Line thickness (frequency)</div>
      <svg width={legendWidth} height={thicknessEntries.length * entryHeight}>
        {thicknessEntries.map((entry, i) => {
          const y = i * entryHeight + entryHeight/2;
          const thickness = Math.max(Math.min(Math.sqrt(entry.frequency) * 12, 12), 2);
          
          return (
            <Group key={i} top={y}>
              <line 
                x1={0} 
                y1={0} 
                x2={sampleLinkWidth} 
                y2={0} 
                stroke={drawColor} 
                strokeWidth={thickness} 
                strokeLinecap="round"
              />
              <text x={sampleLinkWidth + labelOffset} y={4} fontSize={12}>{entry.label}</text>
            </Group>
          );
        })}
      </svg>
    </div>
  );
};
import React from "react";
import { Group } from '@visx/group';

import { drawColor, colorScale } from "../../lib/linkConstants"

export const TreeLegend: React.FC = () => {
  const legendWidth = '100%';
  const entryHeight = 22;
  const sampleLinkWidth = 40;
  const labelOffset = 12;
  const fontSize = 12;

  const colorEntries = [
    { label: "Better", value: 0.8 },
    { label: "Even", value: 0 },
    { label: "Worse", value: -0.8 }
  ];
  
  const thicknessEntries = [
    { label: "Common", frequency: 0.9 },
    { label: "Rare", frequency: 0.1 }
  ];

  return (
    <div className="p-2">
      <div className="text-sm font-semibold">Color → Outcome</div>
      <svg className="ml-4" width={legendWidth} height={colorEntries.length * entryHeight}>
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
              <text x={sampleLinkWidth + labelOffset} y={4} fontSize={fontSize}>{entry.label}</text>
            </Group>
          );
        })}
      </svg>

      <div className="text-sm font-semibold mt-2 mb-1">Width → Popularity</div>
      <svg className="ml-4" width={legendWidth} height={thicknessEntries.length * entryHeight}>
        {thicknessEntries.map((entry, i) => {
          const y = i * entryHeight + entryHeight/2;
          const thickness = Math.max(Math.sqrt(entry.frequency) * 12, 2);
          
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
              <text x={sampleLinkWidth + labelOffset} y={3} fontSize={fontSize}>{entry.label}</text>
            </Group>
          );
        })}
      </svg>
    </div>
  );
};

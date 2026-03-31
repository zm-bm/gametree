import React from "react";

interface LoadingIndicatorProps {
  radius: number;
}

export const TreeNodeLoadingIndicator: React.FC<LoadingIndicatorProps> = ({ radius }) => {
  return (
    <g className="pointer-events-none">
      <circle
        r={radius}
        className="fill-none stroke-amber-700/20 dark:stroke-amber-300/20"
        style={{ strokeWidth: 1.5 }}
      />
      <circle
        r={radius}
        className="fill-none stroke-white/90 dark:stroke-white/80 animate-spin-slow"
        strokeDasharray={radius * Math.PI / 2}
        strokeDashoffset={radius * Math.PI / 2}
        style={{ strokeWidth: 2, strokeLinecap: 'round' }}
      />
    </g>
  );
};

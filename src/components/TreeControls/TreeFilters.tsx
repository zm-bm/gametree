import React, { useState } from "react";

export const TreeFilters: React.FC = () => {
  const [frequency, setFrequency] = useState(5);
  const [winRate, setWinRate] = useState(10);

  return (
    <div className="p-2 bg-white rounded shadow-sm">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <label
            className="text-sm font-semibold"
            htmlFor="min-frequency"
          >
            Min frequency
          </label>
          <span className="w-10 text-sm text-right font-mono bg-gray-100 px-2 py-0.5 rounded">
            {frequency}%
          </span>
        </div>
        <div className="flex items-center">
          <input
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            id="min-frequency"
            type="range"
            min="0"
            max="30"
            step="1"
            value={frequency}
            onChange={(e) => setFrequency(parseInt(e.target.value))}
            aria-label="Min frequency threshold"
          />
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <label
            className="text-sm font-semibold"
            htmlFor="min-win-rate"
          >
            Min win-rate
          </label>
          <span className="w-10 text-sm text-right font-mono bg-gray-100 px-2 py-0.5 rounded shadow">
            {winRate}%
          </span>
        </div>
        <div className="flex items-center">
          <input
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            id="min-win-rate"
            type="range"
            min="0"
            max="70"
            step="1"
            value={winRate}
            onChange={(e) => setWinRate(parseInt(e.target.value))}
            aria-label="Min win-rate threshold"
          />
        </div>
      </div>

      <div className="text-xs text-gray-500 italic mt-3">
        Moves below these thresholds will be hidden
      </div>
    </div>
  );
};

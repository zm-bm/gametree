import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "../../store";
import { initialState } from "../../redux/treeSlice";


export const TreeFilters: React.FC = () => {
  const dispatch = useDispatch();

  const minFrequency = useSelector((state: RootState) => state.tree.minFrequency);
  const minWinRate = useSelector((state: RootState) => state.tree.minWinRate);

  const setFrequency = (value: number) => {
    dispatch({ type: 'tree/SetMinFrequency', payload: value });
  };
  const setWinRate = (value: number) => {
    dispatch({ type: 'tree/SetMinWinRate', payload: value });
  };

  return (
    <div className="p-2 bg-white rounded shadow-sm">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label
            className="text-sm font-semibold group relative"
            htmlFor="min-frequency"
          >
            Min. frequency
            <span className="hidden group-hover:block absolute bg-gray-800 text-white text-xs p-1 rounded whitespace-nowrap -top-6 right-0">
              Shows moves played in at least {minFrequency}% of games
            </span>
          </label>
          <span className="w-16 text-sm text-right font-mono bg-gray-100 px-2 py-0.5 rounded border border-gray-300">
            {minFrequency}%
          </span>
        </div>
        <div className="flex items-center">
          <input
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            id="min-frequency"
            type="range"
            min="0"
            max="20"
            step="0.1"
            value={minFrequency}
            onChange={(e) => setFrequency(parseFloat(e.target.value))}
            aria-label="Min frequency threshold"
          />
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between items-center mb-2">
          <label
            className="text-sm font-semibold group relative"
            htmlFor="min-win-rate"
          >
            Min. win-rate
            <span className="hidden group-hover:block absolute bg-gray-800 text-white text-xs p-1 rounded whitespace-nowrap -top-6 right-0">
              Shows moves that win at least {minWinRate}% of games
            </span>
          </label>
          <span className="w-16 text-sm text-right font-mono bg-gray-100 px-2 py-0.5 rounded shadow border border-gray-300">
            {minWinRate}%
          </span>
        </div>
        <div className="flex items-center">
          <input
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            id="min-win-rate"
            type="range"
            min="0"
            max="35"
            step="0.1"
            value={minWinRate}
            onChange={(e) => setWinRate(parseFloat(e.target.value))}
            aria-label="Min win-rate threshold"
          />
        </div>
      </div>

      <div className="flex justify-between mt-3">
        <div className="text-xs text-gray-500 italic pr-1">
          Unexplored moves below thresholds will be hidden
        </div>
        <button
          onClick={() => {
            setFrequency(initialState.minFrequency);
            setWinRate(initialState.minWinRate);
          }}
          className="text-xs text-blue-500 hover:text-blue-700"
        >
          Reset filters
        </button>
      </div>
    </div>
  );
};

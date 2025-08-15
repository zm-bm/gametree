import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "../../store";
import { SetMinFrequency } from "../../redux/treeSlice";

export const TreeFilters: React.FC = () => {
  const dispatch = useDispatch();

  const minFrequency = useSelector((state: RootState) => state.tree.minFrequency);

  const setFrequency = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    dispatch(SetMinFrequency(value));
  }, [dispatch]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.startsWith('Arrow')) e.preventDefault();
  }, []);

  return (
    <div className="px-4 py-3">
      <div className="space-y-2">
        <div className="flex justify-between items-center border-b pb-2">
          <label className="text-sm font-medium group relative"
                 htmlFor="min-frequency"
                 title="Unexplored moves below threshold will be hidden">
            Move Frequency Filter
          </label>
        </div>
        
        <div>
          <div className="relative">
            <div className="absolute h-1 inset-x-0 top-1/2 -translate-y-1/2 bg-blue-300 rounded-full"></div>
            <input
              className="relative top-[4px] w-full h-4 appearance-none cursor-pointer bg-transparent focus:outline-none"
              id="min-frequency"
              type="range"
              min="0"
              max="20"
              step="0.1"
              value={minFrequency}
              onChange={setFrequency}
              onKeyDown={onKeyDown}
              title="Unexplored moves below threshold will be hidden"
              aria-label="Min frequency threshold"
            />
          </div>
          
          <div className="flex justify-between mt-1">
            <span className="text-xs">0%</span>
            <span className="text-xs text-blue-600 font-semibold bg-gray-50 dark:bg-gray-400 mt-[-0.5rem] px-2 py-1 rounded-lg border border-gray-200">
              {minFrequency}%
            </span>
            <span className="text-xs">20%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '../../store';
import { initialState, SetDataSource } from '../../redux/treeSlice';
import { TreeSource } from '../../types/chess';


export const DataSource: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedSource, setSelectedSource] = useState<TreeSource>(initialState.source);

  const handleSourceChange = (source: TreeSource) => {
    setSelectedSource(source);
    dispatch(SetDataSource(source));
  };

  return (
    <div className="px-4 py-3">
      <div className="text-sm font-semibold border-b pb-2 mb-3">Data Source</div>
      <div className="space-y-2">
        <label className="flex items-center space-x-3 cursor-pointer group">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedSource === "masters" ? 'border-blue-500' : 'border-gray-300 group-hover:border-gray-400'}`}>
            {selectedSource === "masters" && (
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            )}
          </div>
          <input
            type="radio"
            id="masters-source"
            name="data-source"
            value="masters"
            checked={selectedSource === "masters"}
            onChange={() => handleSourceChange("masters")}
            onKeyDown={(e) => { if (e.key.startsWith('Arrow')) e.preventDefault(); }}
            className="sr-only"
          />
          <span className="text-sm font-medium">Masters games</span>
        </label>
        
        <label className="flex items-center space-x-3 cursor-pointer group">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedSource === "lichess" ? 'border-blue-500' : 'border-gray-300 group-hover:border-gray-400'}`}>
            {selectedSource === "lichess" && (
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            )}
          </div>
          <input
            type="radio"
            id="lichess-source"
            name="data-source"
            value="lichess"
            checked={selectedSource === "lichess"}
            onChange={() => handleSourceChange("lichess")}
            onKeyDown={(e) => { if (e.key.startsWith('Arrow')) e.preventDefault(); }}
            className="sr-only"
          />
          <span className="text-sm font-medium">Lichess games</span>
        </label>
      </div>
    </div>
  );
};

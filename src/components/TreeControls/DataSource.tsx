import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '../../store';
import { SetDataSource } from '../../redux/treeSlice';
import { TreeSource } from '../../redux/openingsApi';

export const DataSource: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedSource, setSelectedSource] = useState<TreeSource>("masters");

  const handleSourceChange = (source: TreeSource) => {
    setSelectedSource(source);
    dispatch(SetDataSource(source));
  };

  return (
    <div className="p-2 mb-1 border-y border-gray-300">
      <p className="text-sm font-semibold mb-1">Data source</p>
      <div className="space-y-2 ml-4">
        <div className="flex items-center">
          <input
            className="mr-2"
            type="radio"
            id="masters-source"
            name="data-source"
            value="masters"
            checked={selectedSource === "masters"}
            onChange={() => handleSourceChange("masters")}
          />
          <label htmlFor="masters-source" className="text-xs">
            Masters games
          </label>
        </div>
        <div className="flex items-center">
          <input
            className="mr-2"
            type="radio"
            id="lichess-source"
            name="data-source"
            value="lichess"
            checked={selectedSource === "lichess"}
            onChange={() => handleSourceChange("lichess")}
          />
          <label htmlFor="lichess-source" className="text-xs">
            Lichess games
          </label>
        </div>
      </div>
    </div>
  );
};

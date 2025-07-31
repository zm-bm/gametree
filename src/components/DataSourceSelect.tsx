import React from 'react';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '../store';
import { SetDataSource } from '../redux/openingsTreeSlice';
import { TreeSource } from '../redux/openingsApi';

export const DataSourceSelect: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <div className="p-2 bg-white border border-gray-300 rounded shadow">
      <label className="text-sm font-semibold text-gray-500 mb-1">
        Data source:
      </label>
      <select
        title="Data source"
        className="btn-primary text-xs w-full"
        onChange={(e) => {
          dispatch(SetDataSource(e.target.value as TreeSource))
        }}
      >
        <option value="masters">Masters games</option>
        <option value="lichess">Lichess games</option>
      </select>
    </div>
  );
};

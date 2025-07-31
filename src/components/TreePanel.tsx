import React from "react";
import { TreeLegend } from "./TreeLegend";
import { DataSourceSelect } from "./DataSourceSelect";


export const TreePanel: React.FC = () => {
  return (
    <div className="absolute top-0 right-0 p-2 bg-white border border-gray-300 rounded shadow">
      <TreeLegend />
      <DataSourceSelect />
    </div>
  );
};

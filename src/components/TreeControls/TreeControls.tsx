import React from "react";
import { TreeLegend } from "./TreeLegend";
import { DataSource } from "./DataSource";
import { TreeFilters } from "./TreeFilters";


export const TreeControls: React.FC = () => {
  return (
    <div className="absolute top-0 right-0 bg-white border border-gray-300 rounded shadow w-[200px]">
      <TreeLegend />
      <DataSource />
      <TreeFilters />
    </div>
  );
};

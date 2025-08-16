import { DataSource } from "./TreeSource";
import { TreeFilters } from "./TreeFilters";

export const TreeControls = () => {
  return (
    <>
      <div className="pt-3 px-3 font-bold text-lg">Tree Controls</div>
      <DataSource />
      <TreeFilters />
    </>
  );
};

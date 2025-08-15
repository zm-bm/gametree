import { DataSource } from "./TreeSource";
import { TreeFilters } from "./TreeFilters";

export const TreeControls = () => {
  return (
    <>
      {/* <div className="p-2 font-bold text-lg">Move Tree</div> */}
      <DataSource />
      <TreeFilters />
    </>
  );
};

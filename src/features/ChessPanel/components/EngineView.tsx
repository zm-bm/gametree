import { useState } from "react";

import EngineOutputDisplay from "./EngineOutputDisplay";
import EngineControls from "./EngineControls";

const EngineView = () => {
  const [isCollapsed, setIsCollapsed] = useState(localStorage.gtEngineViewCollapsed);

  return (
    <div className="flex flex-col h-52 min-h-0">
      <div className="flex-1 flex flex-col min-h-0 p-2">
        <div className="font-bold">Engine controls/output</div>
        <EngineControls />
        <EngineOutputDisplay />
      </div>
    </div>
  )
};

export default EngineView;
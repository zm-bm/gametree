import EngineOutputDisplay from "./EngineOutputDisplay";
import EngineControls from "./EngineControls";
import { CollapsibleCard } from "../CollapsibleCard";

const EngineView = () => {
  return (
    <CollapsibleCard header={<span className="font-semibold tracking-tight">Engine</span>}>
      <div className="border-t border-white/5 dark:border-white/10 flex flex-col">
        <EngineControls />
        <EngineOutputDisplay />
      </div>
    </CollapsibleCard>
  )
};

export default EngineView;

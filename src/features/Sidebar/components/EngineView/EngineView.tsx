import EngineOutputDisplay from "./EngineOutputDisplay";
import EngineControls from "./EngineControls";

const EngineView = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <EngineControls />
      <EngineOutputDisplay />
    </div>
  )
};

export default EngineView;

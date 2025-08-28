import EngineOutputDisplay from "./EngineOutputDisplay";
import EngineControls from "./EngineControls";

const EngineView = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <span className="text-sm text-gray-500 italic">
        Engine view coming soon!
      </span>
      {/* <EngineControls /> */}
      {/* <EngineOutputDisplay /> */}
    </div>
  )
};

export default EngineView;

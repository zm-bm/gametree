
import EngineOutput from "./EngineOutput";
import EngineControls from "./EngineControls";

const EngineView = () => {
  return (
    <div className="flex flex-col h-52 min-h-0">
      <div className="flex-1 flex flex-col min-h-0 p-2">
        <div className="font-bold">Engine controls/output</div>
        <EngineControls />
        <EngineOutput />
      </div>
    </div>
  )
}

export default EngineView;
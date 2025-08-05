import EngineHeader from "./EngineHeader";
import EngineInfo from "./EngineInfo";
import EngineControls from "./EngineControls";

const AnalysisPane = () => {
  return (
    <div className="flex flex-col h-full shadow-2xl min-h-0 border border-neutral-400">
      <div className="flex-1 flex flex-col min-h-0 border-gray-400 bg-neutral-100">
        <EngineHeader/>
        <EngineInfo />
        <EngineControls />
      </div>
    </div>
  )
}

export default AnalysisPane;
import { useSelector } from "react-redux";

import EngineInfo from "./EngineInfo";
import EngineControls from "./EngineControls";
import { RootState } from "../store";
import { formatSpeed } from "../lib/formatters";

const AnalysisPane = () => {
  const time = useSelector((state: RootState) => state.engine.output[0]?.time)
  const speed = useSelector((state: RootState) => state.engine.output[0]?.speed)
  const hashfull = useSelector((state: RootState) => state.engine.output[0]?.hashfull)
  const tbhits = useSelector((state: RootState) => state.engine.output[0]?.tbhits)

  const data = {
    Time: `${time ? (time / 1000).toFixed(1) : 0} s`,
    Nodes: `${speed ? formatSpeed(speed) : 0} n/s`,
    Hash: `${hashfull ? (hashfull / 10).toFixed(1) : 0} %`,
    'TB Hits': tbhits ? tbhits : 0,
  }

  return (
    <div className="flex flex-col h-full shadow-2xl min-h-0 border border-neutral-400">
      <div className="flex-1 flex flex-col min-h-0 border-gray-400 bg-neutral-100">
        <div className="flex text-sm gap-2 py-0.5 px-2 border-b border-neutral-400">
          {
            Object.entries(data).map((([key, value]) => (
              <div key={key} className="flex-auto overflow-hidden">
                <span className="font-bold">{key}: </span>
                <span>{value}</span>
              </div>
            )))
          }
        </div>
        <EngineInfo />
        <EngineControls />
      </div>
    </div>
  )
}

export default AnalysisPane;
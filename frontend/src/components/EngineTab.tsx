import { useSelector } from "react-redux";
import EngineControls from "./EngineControls";
import { RootState } from '../store';
import { formatScore, formatSpeed } from "../lib/helpers";

const EngineTab = () => {
  const infos = useSelector((state: RootState) => state.engine.infos);
  const time = useSelector((state: RootState) => state.engine.time)
  const speed = useSelector((state: RootState) => state.engine.speed)
  const hashfull = useSelector((state: RootState) => state.engine.hashfull)
  const tbhits = useSelector((state: RootState) => state.engine.tbhits)

  return (
    <>
      <div className="flex text-xs gap-2 p-1 border-b border-gray-400">
        <div className="flex-auto overflow-hidden">
          <span className="font-bold">Time: </span>
          <span>{time ? (time/1000).toFixed(1) : 0} s</span>
        </div>
        <div className="flex-auto overflow-hidden">
          <span className="font-bold">Nodes: </span>
          <span>{speed ? formatSpeed(speed) : 0} n/s</span>
        </div>
        <div className="flex-auto overflow-hidden">
          <span className="font-bold">Hash: </span>
          <span>{hashfull ? (hashfull/10).toFixed(1) : 0} %</span>
        </div>
        <div className="flex-auto overflow-hidden">
          <span className="font-bold">TB Hits: </span>
          <span>{tbhits ? tbhits : 0}</span>
        </div>
      </div>
      <div className="flex-1 p-1 font-mono text-xs leading-tight overflow-auto">
        <div className="flex">
          <span className="w-12 font-bold underline">Depth</span>
          <span className="w-12 font-bold underline">Score</span>
          <span className="flex-1 font-bold underline">Moves</span>
        </div>

        {infos.slice(0).reverse().map((info, index) => (
          <div className="flex " key={index}>
            <span className="w-12">{info.depth}/{info.seldepth}</span>
            <span className="w-12">{formatScore(info)}</span>
            <span className="flex-1">{info.pv.join(' ')}</span>
          </div>
        ))}
      </div>
      <EngineControls />
    </>
  )
};

export default EngineTab;

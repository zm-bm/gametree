import { useSelector } from "react-redux";
import { RootState } from '../store';
import { formatSpeed } from "../lib/helpers";

const EngineTabHeader = () => {
  const time = useSelector((state: RootState) => state.engine.time)
  const speed = useSelector((state: RootState) => state.engine.speed)
  const hashfull = useSelector((state: RootState) => state.engine.hashfull)
  const tbhits = useSelector((state: RootState) => state.engine.tbhits)

  return (
    <div className="flex text-sm gap-2 p-1 border-b border-neutral-400 dark:border-neutral-600">
      <div className="flex-auto overflow-hidden">
        <span className="font-bold">Time: </span>
        <span>{time ? (time / 1000).toFixed(1) : 0} s</span>
      </div>
      <div className="flex-auto overflow-hidden">
        <span className="font-bold">Nodes: </span>
        <span>{speed ? formatSpeed(speed) : 0} n/s</span>
      </div>
      <div className="flex-auto overflow-hidden">
        <span className="font-bold">Hash: </span>
        <span>{hashfull ? (hashfull / 10).toFixed(1) : 0} %</span>
      </div>
      <div className="flex-auto overflow-hidden">
        <span className="font-bold">TB Hits: </span>
        <span>{tbhits ? tbhits : 0}</span>
      </div>
    </div>
  );
}

export default EngineTabHeader;

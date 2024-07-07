import { useSelector } from "react-redux";
import { RootState } from '../store';
import { formatSpeed } from "../lib/formatters";

const EngineHeader = () => {
  const time = useSelector((state: RootState) => state.engine.time)
  const speed = useSelector((state: RootState) => state.engine.speed)
  const hashfull = useSelector((state: RootState) => state.engine.hashfull)
  const tbhits = useSelector((state: RootState) => state.engine.tbhits)

  const data = {
    Time: `${time ? (time / 1000).toFixed(1) : 0} s`,
    Nodes: `${speed ? formatSpeed(speed) : 0} n/s`,
    Hash: `${hashfull ? (hashfull / 10).toFixed(1) : 0} %`,
    'TB Hits': tbhits ? tbhits : 0,
  }

  return (
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
  );
}

export default EngineHeader;

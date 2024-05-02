import { useSelector } from "react-redux";
import { RootState } from '../../store';
import { formatSpeed } from "../../lib/helpers";

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
    <div className="flex text-sm gap-2 py-1 px-2 border-y border-neutral-400 dark:border-neutral-600 neutral-gradient-to-b">
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

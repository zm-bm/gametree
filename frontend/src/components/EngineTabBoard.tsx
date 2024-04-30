import BaseBoard from "./Board/BaseBoard";
import { Config } from "chessground/config";

interface Props {
  config: Config,
  isHovered: boolean,
  coords: { top: number, left: number },
}
const EngineTabBoard = ({ config, coords, isHovered }: Props) => {
  return (
    <div
      className={`absolute z-20 border border-neutral-400 ${isHovered ? 'visible' : 'hidden'}`}
      style={coords}
    >
      <div className="relative h-[240px] w-[240px]">
        <BaseBoard config={config} />
      </div>
    </div>
  );
}

export default EngineTabBoard;

import BaseBoard from "../Board/BaseBoard";
import { Config } from "chessground/config";

interface Props {
  size: number
  config: Config,
  isHovered: boolean,
  coords: { top: number, left: number },
}
const EngineBoard = ({ size, config, coords, isHovered }: Props) => {
  return (
    <div
      className={`absolute shadow-xl z-20 ${isHovered ? 'visible' : 'hidden'}`}
      style={coords}
    >
      <div className='relative' style={{ height: size+'px', width: size+'px' }}>
        <BaseBoard config={config} />
      </div>
    </div>
  );
}

export default EngineBoard;

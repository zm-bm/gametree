import { useSelector } from "react-redux";
import { DEFAULT_POSITION, Square } from "chess.js";
import { RootState } from '../store';
import { formatScore } from "../lib/formatters";
import { useCallback, useState } from "react";
import EngineBoard from "./EngineBoard";
import { colorFromFen } from "../lib/chess";
import { EngineInfoMove } from "./EngineInfoMove";

const boardTooltipSize = 320;
const columnWidth = 'w-14';
const columnHeader = 'font-bold underline cursor-default'

const EngineInfo = () => {
  const infos = useSelector((state: RootState) => state.engine.infos);
  const fen = useSelector((state: RootState) => state.engine.fen)
  const orientation = useSelector((state: RootState) => state.game.orientation);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [tooltip, setTooltip] = useState({
    hovered: false,
    fen: DEFAULT_POSITION,
    move: '',
  });

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    setCoords({ top: e.pageY-boardTooltipSize-10, left: e.pageX+5 })
  }, []);
  const onMouseEnter = useCallback((e: React.MouseEvent) => {
    const dataFen = e.currentTarget.getAttribute('data-fen');
    const dataMove = e.currentTarget.getAttribute('data-move');
    if (dataFen && dataMove) {
      setTooltip({
        hovered: true,
        fen: dataFen,
        move: dataMove,
      })
    }
  }, []);
  const onMouseLeave = useCallback(() => setTooltip({ ...tooltip, hovered: false }), [tooltip]);

  return (
    <div className="flex-1 p-2 font-mono text-sm leading-tight overflow-auto">
      <div className="flex">
        <span className={`${columnWidth} ${columnHeader}`}>Depth</span>
        <span className={`${columnWidth} ${columnHeader}`}>Score</span>
        <span className={`flex-1 ${columnHeader}`}>Moves</span>
      </div>
      {
        infos.slice(0).reverse().map((info, index) => {
          return (
            <div className="flex" key={index}>
              <span className={columnWidth}>{info.depth}/{info.seldepth}</span>
              <span className={columnWidth}>{formatScore(info, colorFromFen(fen), orientation)}</span>
              <div className="flex-1"
              >
                {
                  info.pv.map((move, ix) => (
                    <EngineInfoMove
                      key={ix+move.lan}
                      move={move}
                      onMouseEnter={onMouseEnter}
                      onMouseMove={onMouseMove}
                      onMouseLeave={onMouseLeave}
                    />
                  ))
                }
              </div>
            </div>
          );
        }
      )}
      <EngineBoard
        size={boardTooltipSize}
        isHovered={tooltip.hovered}
        config={{
          fen: tooltip.fen,
          orientation,
          coordinates: false,
          viewOnly: true,
          lastMove: [
            tooltip.move.substring(0, 2) as Square,
            tooltip.move.substring(2, 4) as Square,
          ],
        }}
        coords={coords}
      />
    </div>
  )
};

export default EngineInfo;

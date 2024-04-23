import { useSelector } from "react-redux";
import EngineControls from "./EngineControls";
import { RootState } from '../store';
import { formatScore } from "../lib/helpers";
import { useCallback, useState } from "react";
import EngineTabBoard from "./EngineTabBoard";
import EngineTabHeader from "./EngineTabHeader";
import { Square } from "chess.js";
import EngineTabMove from "./EngineTabMove";

const EngineTab = () => {
  const infos = useSelector((state: RootState) => state.engine.infos);
  const orientation = useSelector((state: RootState) => state.board.orientation);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverFen, setHoverFen] = useState<string>();
  const [lastMove, setLastMove] = useState<Square[]>([]);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const fen = useSelector((state: RootState) => state.engine.fen)

  const onHover: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      setIsHovered(true)
      const dataFen = e.currentTarget.getAttribute('data-fen');
      if (dataFen) {
        setHoverFen(dataFen);
      }
      const dataMove = e.currentTarget.getAttribute('data-move');
      if (dataMove) {
        setLastMove([dataMove.substring(0, 2) as Square,
                     dataMove.substring(2, 4) as Square])
      }
    }, [fen]);

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseMove = useCallback((e: any) => setCoords({ top: e.pageY-245, left: e.pageX+5 }), []);
  const onMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <>
      <EngineTabHeader />
      <div className="flex-1 p-1 font-mono text-xs leading-tight overflow-auto">
        <div className="flex">
          <span className="w-12 font-bold underline cursor-default">Depth</span>
          <span className="w-12 font-bold underline cursor-default">Score</span>
          <span className="flex-1 font-bold underline cursor-default">Moves</span>
        </div>
        {
          infos.slice(0).reverse().map((info, index) => {
            return (
              <div className="flex" key={index}>
                <span className="w-12">{info.depth}/{info.seldepth}</span>
                <span className="w-12">{formatScore(info)}</span>
                <div className="flex-1"
                  onMouseEnter={onMouseEnter}
                  onMouseMove={onMouseMove}
                  onMouseLeave={onMouseLeave}
                >
                  {
                    info.pv.map((move, i) => (
                      <>
                        <EngineTabMove
                          key={i}
                          onHover={onHover}
                          move={move}
                          showMoveNum={i === 0 || move.color === 'w'}
                        />
                        &#32;
                      </>
                    ))
                  }
                </div>
              </div>
            );
          }
        )}
      </div>
      <EngineControls />
      <EngineTabBoard
        isHovered={isHovered}
        config={{
          fen: hoverFen,
          orientation,
          coordinates: false,
          viewOnly: true,
          lastMove,
        }}
        coords={coords}
      />
    </>
  )
};

export default EngineTab;

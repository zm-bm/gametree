import { useSelector } from "react-redux";
import EngineControls from "./EngineControls";
import { RootState } from '../store';
import { formatScore } from "../lib/helpers";
import { colorFromFen, moveNumFromFen } from "../chess";
import { useCallback, useState } from "react";
import EngineTabBoard from "./EngineTabBoard";
import EngineTabHeader from "./EngineTabHeader";
import { Chess, Square } from "chess.js";
import EngineTabMove from "./EngineTabMove";

const EngineTab = () => {
  const infos = useSelector((state: RootState) => state.engine.infos);
  const orientation = useSelector((state: RootState) => state.board.orientation);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverFen, setHoverFen] = useState<string>();
  const [lastMove, setLastMove] = useState<Square[]>([]);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const fen = useSelector((state: RootState) => state.board.fen)

  const onHover: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      setIsHovered(true)
      const dataMoves = e.currentTarget.getAttribute('data-moves');
      if (dataMoves) {
        const chess = new Chess(fen);
        const moves = dataMoves.split(',');
        try {
          moves.forEach(mv => mv && chess.move(mv));
          setHoverFen(chess.fen());
          const last = moves.at(-1)
          setLastMove(last ? [last.substring(0, 2) as Square, last.substring(2, 4) as Square] : [])
        } catch (error) {
          console.log(error);
        }
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
            let isWhitesTurn = colorFromFen(fen) === 'w';
            let moveNum = +(moveNumFromFen(fen) || '1');
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
                    info.pv.map((mv, i) => {
                      const move = (
                        <EngineTabMove
                          key={i}
                          onHover={onHover}
                          moves={info.pv.slice(0, i+1)}
                          move={mv}
                          moveNum={moveNum}
                          isWhitesTurn={isWhitesTurn}
                          showMoveNum={i === 0 || isWhitesTurn}
                        />
                      );
                      if (!isWhitesTurn) moveNum += 1;
                      isWhitesTurn = !isWhitesTurn;
                      return move
                    })
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

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from '../../store';
import { formatScore } from "../../lib/helpers";
import { useCallback, useState } from "react";
import EngineBoard from "./EngineBoard";
import { Chess, Square } from "chess.js";
import EngineMove from "./EngineMove";
import { MAKE_MOVE } from "../../redux/actions";
import { colorFromFen } from "../../chess";

const EngineInfo = () => {
  const dispatch = useDispatch<AppDispatch>()
  const infos = useSelector((state: RootState) => state.engine.infos);
  const fen = useSelector((state: RootState) => state.engine.fen)
  const boardFen = useSelector((state: RootState) => state.board.fen)
  const orientation = useSelector((state: RootState) => state.board.orientation);
  const [isHovered, setIsHovered] = useState(false);
  const [hoverFen, setHoverFen] = useState<string>();
  const [lastMove, setLastMove] = useState<Square[]>([]);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const turnColor = colorFromFen(fen);

  const onHover: React.MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
    setIsHovered(true)
    const dataFen = e.currentTarget.getAttribute('data-fen');
    if (dataFen)
      setHoverFen(dataFen);
    const dataMoves = e.currentTarget.getAttribute('data-moves');
    if (dataMoves) {
      const lastMove = dataMoves.split(',').at(-1)
      if (lastMove)
        setLastMove([lastMove.substring(0, 2) as Square,
                     lastMove.substring(2, 4) as Square])
    }
  }, [fen]);

  const onClick: React.MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
    const moves = e.currentTarget.getAttribute('data-moves');
    if (moves) {
      const chess = new Chess(boardFen);
      try {
        moves.split(',').forEach(mv => {
          if (mv) {
            const move = chess.move(mv);
            dispatch(MAKE_MOVE(move))
          }
        })
      } catch (error) {
        console.warn(error);
      }
    }
  }, [boardFen])

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseMove = useCallback((e: any) => setCoords({ top: e.pageY-250, left: e.pageX+5 }), []);
  const onMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <div className="flex-1 p-2 font-mono text-sm leading-tight overflow-auto neutral-gradient-to-b">
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
              <span className="w-12">{formatScore(info, turnColor, orientation)}</span>
              <div className="flex-1"
                onMouseEnter={onMouseEnter}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
              >
                {
                  info.pv.map((move, i) => (
                    <>
                      <EngineMove
                        key={i}
                        onHover={onHover}
                        onClick={onClick}
                        move={move}
                        moves={info.pv.slice(0, i+1).map(m => m.lan)}
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
      <EngineBoard
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
    </div>
  )
};

export default EngineInfo;

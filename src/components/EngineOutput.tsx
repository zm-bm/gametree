import { useDispatch, useSelector } from "react-redux";
import { Chess } from "chess.js";
import { AppDispatch, RootState } from '../store';
import { useCallback } from "react";
import { SetHover } from "../redux/gameSlice";
import { formatScore, formatSpeed } from "../lib/formatters";
import { useFenColor } from "../lib/chessground";

const EngineOutput = () => {
  const dispatch = useDispatch<AppDispatch>();

  const engineFen = useSelector((state: RootState) => state.engine.fen);
  const engineOutput = useSelector((state: RootState) => state.engine.output.at(0));
  const orientation = useSelector((state: RootState) => state.game.orientation);
  const turn = useFenColor(engineFen);

  const onMouseEnter = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const { dataset } = e.currentTarget;
    dispatch(SetHover({ fen: dataset.fen || "", move: dataset.move || "" }));
  }, [dispatch]);

  const onMouseLeave = useCallback(() => {
    dispatch(SetHover(null));
  }, [dispatch]);

  const chess = new Chess(engineFen);

  const { time, speed } = engineOutput || {};

  const data = {
    Time: `${time ? (time / 1000).toFixed(1) : 0} s`,
    Speed: `${speed ? formatSpeed(speed) : 0} n/s`,
    Depth: `${engineOutput?.depth || 0} / ${engineOutput?.seldepth || 0}`,
    Score: engineOutput ? formatScore(engineOutput, turn, orientation) : '-',
  }

  return (
    <div className="py-2 space-y-2">
      <div className="grid grid-cols-4 text-xs gap-2">
      {
        Object.entries(data).map((([key, value]) => (
          <div key={key} className="engine-chip">
            <div className="text-xs">{key}: </div>
            <div className="text-sm">{value}</div>
          </div>
        )))
      }
      </div>
      <div className="flex-1 font-mono text-sm leading-tight overflow-auto">
        <span className="font-semibold">Best line: </span>
        {
          engineOutput?.pv?.map((move, moveIx) => {
            const chessMove = chess.move(move);
            if (!chessMove) return null;

            // Show move number at start of variation or for white moves
            const isWhiteMove = chessMove.color === 'w';
            const isFirstMove = moveIx === 0;
            const showMoveNumber = isWhiteMove || isFirstMove;

            // Extract the full move number from FEN
            const fullMoveNumber = parseInt(chessMove.before.split(' ')[5] || '1');

            return (
              <span
                key={chessMove.lan+moveIx}
                data-move={chessMove.lan}
                data-fen={chessMove.after}
                className="hover:text-sky-600 cursor-pointer"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              >
                {showMoveNumber && (
                  <>
                    {fullMoveNumber}
                    {isWhiteMove ? '.' : '...'}
                  </>
                )}
                <span>{chessMove.san}</span>
                {' '}
              </span>
            );
          })
        }
      </div>
    </div>
  )
};

export default EngineOutput;

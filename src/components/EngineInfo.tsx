import { useSelector } from "react-redux";
import { Chess } from "chess.js";
import { RootState } from '../store';
import { formatScore } from "../lib/formatters";
import { useCallback } from "react";
import { colorFromFen } from "../lib/chess";

const columnWidth = 'w-14';
const columnHeader = 'font-bold underline cursor-default'

const EngineInfo = () => {
  const engineFen = useSelector((state: RootState) => state.engine.fen);
  const engineOutput = useSelector((state: RootState) => state.engine.output);
  const fen = useSelector((state: RootState) => state.engine.fen)
  const orientation = useSelector((state: RootState) => state.game.orientation);

  const onMouseEnter = useCallback((e: React.MouseEvent<HTMLElement>) => {
    console.log('Mouse enter', e.currentTarget.dataset.move);
  }, []);
  const onMouseLeave = useCallback(() => {
    console.log('Mouse leave');
  }, []);

  return (
    <div className="flex-1 p-2 font-mono text-sm leading-tight overflow-auto">
      <div className="flex">
        <span className={`${columnWidth} ${columnHeader}`}>Depth</span>
        <span className={`${columnWidth} ${columnHeader}`}>Score</span>
        <span className={`flex-1 ${columnHeader}`}>Moves</span>
      </div>
      {
        engineOutput.map((output, outputIx) => {
          const chess = new Chess(engineFen);

          return (
            <div className="flex" key={outputIx}>
              <span className={columnWidth}>{output.depth}/{output.seldepth}</span>
              <span className={columnWidth}>{formatScore(output, colorFromFen(fen), orientation)}</span>
              <div className="flex-1"
              >
                {
                  output.pv?.map((move, moveIx) => {
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
                        key={chessMove.lan}
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
          );
        }
      )}
    </div>
  )
};

export default EngineInfo;

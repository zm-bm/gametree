import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from '../store';
import { ui } from "../store/slices";
import { selectBoardOrientation, selectCurrentFen, selectEngineOutput, selectSideToMove } from "../store/selectors";
import { EngineOutput } from "../types";
import { Chess } from "chess.js";

function getLocale() {
  if (navigator.languages != undefined) 
    return navigator.languages[0]; 
  return navigator.language;
}

const locale = getLocale();

const formatSpeed = (speed: number) =>(
  Intl.NumberFormat(locale, {
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(speed)
)
const formatScore = (
  engineOutput: EngineOutput,
  sideToMove: string,
  orientation: string,
) => {
  const { cp, mate } = engineOutput;
  const turn = sideToMove === 'white' ? 1 : -1;
  const flipped = orientation === 'white' ? 1 : -1;

  if (cp !== undefined) {
    const score = cp * turn * flipped;
    return Intl.NumberFormat(locale, {
        signDisplay: 'always',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(score / 100)
  } else {
    return mate ? `#${mate * turn * flipped}` : '-';
  }
};

const EngineOutputDisplay = () => {
  const dispatch = useDispatch<AppDispatch>();

  const engineOutput = useSelector((s: RootState) => selectEngineOutput(s));
  const fen = useSelector((s: RootState) => selectCurrentFen(s));
  const orientation = useSelector((s: RootState) => selectBoardOrientation(s));
  const sideToMove = useSelector((s: RootState) => selectSideToMove(s));

  const { time, speed } = engineOutput || {};

  const onMouseEnter = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const id = e.currentTarget.getAttribute('data-id');
    dispatch(ui.actions.setHover(id));
  }, [dispatch]);

  const onMouseLeave = useCallback(() => {
    dispatch(ui.actions.setHover(null));
  }, [dispatch]);

  const data = {
    Time: `${time ? (time / 1000).toFixed(1) : 0} s`,
    Speed: `${speed ? formatSpeed(speed) : 0} n/s`,
    Depth: `${engineOutput?.depth || 0} / ${engineOutput?.seldepth || 0}`,
    Score: engineOutput ? formatScore(engineOutput, sideToMove, orientation) : '-',
  }

  const chess = new Chess(fen);

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
            try {
              const chessMove = chess.move(move);

              // Show move number at start of variation or for white moves
              const isWhiteMove = chessMove.color === 'w';
              const isFirstMove = moveIx === 0;
              const showMoveNumber = isWhiteMove || isFirstMove;

              // Extract the full move number from FEN
              const fullMoveNumber = parseInt(chessMove.before.split(' ')[5] || '1');

              return (
                <span
                  key={chessMove.lan+moveIx}
                  data-id={chessMove.lan}
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
            } catch {
              return null;
            }
          })
        }
      </div>
    </div>
  )
};

export default EngineOutputDisplay;

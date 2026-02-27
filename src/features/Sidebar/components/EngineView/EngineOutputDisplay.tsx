import { useCallback } from "react";
import { useSelector } from "react-redux";
import { Chess } from "chess.js";

import { RootState, useAppDispatch } from '@/store';
import { ui } from "@/store/slices";
import { EngineOutput } from "@/shared/types";
import {
  selectBoardOrientation, selectBoardFen, selectEngineOutput, selectSideToMove,
} from "@/store/selectors";
import './EngineView.css';

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
  const dispatch = useAppDispatch();

  const engineOutput = useSelector((s: RootState) => selectEngineOutput(s));
  const fen = useSelector((s: RootState) => selectBoardFen(s));
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
    <div className="p-2 p space-y-2 h-full">
      <div className="grid grid-cols-4 gap-2">
      {
        Object.entries(data).map((([key, value]) => (
          <div key={key} className="engine-chip">
            <div className="text-xs">{key}: </div>
            <div className="font-bold">{value}</div>
          </div>
        )))
      }
      </div>
      <div className="engine-chip">
        <div className="text-xs">Best line: </div>
        <div className="text-sm">
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
                  {isWhiteMove ? " " : <>&nbsp;</>}
                </span>
              );
            } catch {
              return null;
            }
          })
        }
        </div>
      </div>
    </div>
  )
};

export default EngineOutputDisplay;

import { useCallback } from "react";
import { useSelector } from "react-redux";
import { Chess } from "chess.js";
import { IoIosPause, IoIosPlay } from "react-icons/io";

import { RootState, useAppDispatch } from "@/store";
import { ui } from "@/store/slices";
import { EngineOutput } from "@/shared/types";
import {
  selectBoardFen,
  selectBoardOrientation,
  selectEngineOutput,
  selectEngineRunning,
  selectSideToMove,
} from "@/store/selectors";
import "./EngineView.css";

function getLocale() {
  if (navigator.languages != undefined)
    return navigator.languages[0];
  return navigator.language;
}

const locale = getLocale();

const formatSpeed = (speed: number) => (
  Intl.NumberFormat(locale, {
    notation: "compact",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(speed)
);

const formatScore = (
  engineOutput: EngineOutput,
  sideToMove: string,
  orientation: string,
) => {
  const { cp, mate } = engineOutput;
  const turn = sideToMove === "white" ? 1 : -1;
  const flipped = orientation === "white" ? 1 : -1;

  if (cp !== undefined) {
    const score = cp * turn * flipped;
    return Intl.NumberFormat(locale, {
      signDisplay: "always",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(score / 100);
  } else {
    return mate ? `#${mate * turn * flipped}` : "-";
  }
};

const EngineView = ({ className }: { className?: string }) => {
  const dispatch = useAppDispatch();
  const running = useSelector((s: RootState) => selectEngineRunning(s));
  const engineOutput = useSelector((s: RootState) => selectEngineOutput(s));
  const fen = useSelector((s: RootState) => selectBoardFen(s));
  const orientation = useSelector((s: RootState) => selectBoardOrientation(s));
  const sideToMove = useSelector((s: RootState) => selectSideToMove(s));

  const { time, speed } = engineOutput || {};
  const chess = new Chess(fen);

  const engineToggle = useCallback(() => {
    dispatch(ui.actions.toggleEngine());
  }, [dispatch]);

  const onMouseEnter = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const id = e.currentTarget.getAttribute("data-id");
    dispatch(ui.actions.setHover(id));
  }, [dispatch]);

  const onMouseLeave = useCallback(() => {
    dispatch(ui.actions.setHover(null));
  }, [dispatch]);

  const data = {
    Time: `${time ? (time / 1000).toFixed(1) : 0} s`,
    Speed: `${speed ? formatSpeed(speed) : 0} n/s`,
    Depth: `${engineOutput?.depth || 0} / ${engineOutput?.seldepth || 0}`,
    Score: engineOutput ? formatScore(engineOutput, sideToMove, orientation) : "-",
  };

  return (
    <div className={className}>
      <div className="flex items-center text-sm p-2 gap-2 border-b border-white/5 dark:border-white/10">
        <button
          onClick={engineToggle}
          className="border border-gray-400/60 dark:border-gray-600/60 p-2 hover:scale-105"
          title="Start/stop engine"
        >
          {running ? <IoIosPause /> : <IoIosPlay />}
        </button>
        <div className="flex flex-col text-xs leading-none overflow-hidden whitespace-nowrap">
          <span>Stockfish 18</span>
          <p>local browser</p>
        </div>
      </div>

      <div className="p-2 p space-y-2 h-full">
        <div className="grid grid-cols-4 gap-2">
          {
            Object.entries(data).map(([key, value]) => (
              <div key={key} className="engine-chip">
                <div className="text-xs">{key}: </div>
                <div className="font-bold">{value}</div>
              </div>
            ))
          }
        </div>
        <div className="engine-chip">
          <div className="text-xs">Best line: </div>
          <div className="text-sm">
            {
              engineOutput?.pv?.map((move, moveIx) => {
                try {
                  const chessMove = chess.move(move);

                  const isWhiteMove = chessMove.color === "w";
                  const isFirstMove = moveIx === 0;
                  const showMoveNumber = isWhiteMove || isFirstMove;
                  const fullMoveNumber = parseInt(chessMove.before.split(" ")[5] || "1");

                  return (
                    <span
                      key={chessMove.lan + moveIx}
                      data-id={chessMove.lan}
                      className="hover:text-sky-600 cursor-pointer"
                      onMouseEnter={onMouseEnter}
                      onMouseLeave={onMouseLeave}
                    >
                      {showMoveNumber && (
                        <>
                          {fullMoveNumber}
                          {isWhiteMove ? "." : "..."}
                        </>
                      )}
                      <span>{chessMove.san}</span>
                      {" "}
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
    </div>
  );
};

export default EngineView;

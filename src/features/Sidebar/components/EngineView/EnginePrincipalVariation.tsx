import { useCallback, useMemo } from "react";
import { Chess } from "chess.js";

import { useAppDispatch } from "@/store";
import { ui } from "@/store/slices";

interface EnginePrincipalVariationProps {
  fen: string;
  pvMoves: string[];
}

const PV_TITLE = "Principal variation";
const NO_ANALYSIS_TEXT = "no analysis yet";

const EnginePrincipalVariation = ({ fen, pvMoves }: EnginePrincipalVariationProps) => {
  const dispatch = useAppDispatch();

  const onMouseEnter = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const hoverId = e.currentTarget.getAttribute("data-id");
    dispatch(ui.actions.setHover(hoverId));
  }, [dispatch]);

  const onMouseLeave = useCallback(() => {
    dispatch(ui.actions.setHover(null));
  }, [dispatch]);

  const pvTokens = useMemo(() => {
    if (!pvMoves.length) return null;

    const chessForPv = new Chess(fen);
    return pvMoves.map((move, moveIx) => {
      try {
        const chessMove = chessForPv.move(move);
        const isWhiteMove = chessMove.color === "w";
        const isFirstMove = moveIx === 0;
        const showMoveNumber = isWhiteMove || isFirstMove;
        const fullMoveToken = chessMove.before.split(" ")[5] || "1";
        const fullMoveNumber = Number.parseInt(fullMoveToken, 10);

        return (
          <span
            key={chessMove.lan + moveIx}
            data-id={chessMove.lan}
            className="cursor-default transition-colors hover:text-emerald-300"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            {showMoveNumber && (
              <span className="font-bold text-slate-300/95">
                {fullMoveNumber}
                {isWhiteMove ? "." : "..."}
              </span>
            )}
            <span className="font-thin">{chessMove.san}</span>
            {" "}
            {isWhiteMove ? " " : <>&nbsp;</>}
          </span>
        );
      } catch {
        return null;
      }
    });
  }, [fen, pvMoves, onMouseEnter, onMouseLeave]);

  return (
    <div className="space-y-2 py-4">
      <div className="text-xs uppercase tracking-wide text-slate-400/85">{PV_TITLE}</div>
      <div className="engine-pv-line min-h-20 max-h-48 overflow-y-auto pr-1 text-base leading-7 text-slate-100/95">
        {pvTokens ?? <span className="text-slate-400/85">{NO_ANALYSIS_TEXT}</span>}
      </div>
    </div>
  );
};

export default EnginePrincipalVariation;

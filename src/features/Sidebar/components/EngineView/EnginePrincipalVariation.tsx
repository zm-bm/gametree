import { useCallback, useMemo } from "react";
import { Chess } from "chess.js";

import { useAppDispatch } from "@/store";
import { ui } from "@/store/slices";

interface EnginePrincipalVariationProps {
  fen: string;
  pvMoves: string[];
  currentVisibleId?: string;
}

const PV_TITLE = "Principal variation";
const NO_ANALYSIS_TEXT = "";
const MAX_PV_PLIES = 10;

const EnginePrincipalVariation = ({ fen, pvMoves, currentVisibleId = "" }: EnginePrincipalVariationProps) => {
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
    const basePath = currentVisibleId ? currentVisibleId.split(",").filter(Boolean) : [];
    let hoverPath = [...basePath];

    return pvMoves.slice(0, MAX_PV_PLIES).map((move, moveIx) => {
      try {
        const chessMove = chessForPv.move(move);
        const isWhiteMove = chessMove.color === "w";
        const isFirstMove = moveIx === 0;
        const showMoveNumber = isWhiteMove || isFirstMove;
        const fullMoveToken = chessMove.before.split(" ")[5] || "1";
        const fullMoveNumber = Number.parseInt(fullMoveToken, 10);
        hoverPath = [...hoverPath, chessMove.lan];
        const hoverId = hoverPath.join(",");

        return (
          <span
            key={chessMove.lan + moveIx}
            data-id={hoverId}
            className="gt-engine-pv-token"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            {showMoveNumber && (
              <span className="gt-engine-pv-move-number">
                {fullMoveNumber}
                {isWhiteMove ? "." : "..."}
              </span>
            )}
            <span className="gt-engine-pv-move">{chessMove.san}</span>
            {" "}
            {isWhiteMove ? " " : <>&nbsp;</>}
          </span>
        );
      } catch {
        return null;
      }
    });
  }, [fen, pvMoves, currentVisibleId, onMouseEnter, onMouseLeave]);

  return (
    <div className="gt-engine-pv">
      <div className="gt-engine-pv-title">{PV_TITLE}</div>
      <div className="gt-engine-pv-body">
        {pvTokens ?? <span className="gt-engine-pv-empty">{NO_ANALYSIS_TEXT}</span>}
      </div>
    </div>
  );
};

export default EnginePrincipalVariation;

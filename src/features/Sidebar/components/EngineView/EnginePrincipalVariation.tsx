import { useCallback, useEffect, useMemo, useRef } from "react";
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
const HOVER_INTENT_DELAY_MS = 200;
const HOVER_LEAVE_DELAY_MS = 200;

const EnginePrincipalVariation = ({ fen, pvMoves, currentVisibleId = "" }: EnginePrincipalVariationProps) => {
  const dispatch = useAppDispatch();
  const hoverEnterTimeoutRef = useRef<number | null>(null);
  const hoverLeaveTimeoutRef = useRef<number | null>(null);

  const clearHoverEnterTimeout = useCallback(() => {
    if (hoverEnterTimeoutRef.current === null) return;
    window.clearTimeout(hoverEnterTimeoutRef.current);
    hoverEnterTimeoutRef.current = null;
  }, []);

  const clearHoverLeaveTimeout = useCallback(() => {
    if (hoverLeaveTimeoutRef.current === null) return;
    window.clearTimeout(hoverLeaveTimeoutRef.current);
    hoverLeaveTimeoutRef.current = null;
  }, []);

  const onMouseEnter = useCallback((e: React.MouseEvent<HTMLElement>) => {
    clearHoverLeaveTimeout();
    clearHoverEnterTimeout();
    const hoverId = e.currentTarget.getAttribute("data-id");
    hoverEnterTimeoutRef.current = window.setTimeout(() => {
      dispatch(ui.actions.setHover(hoverId));
      hoverEnterTimeoutRef.current = null;
    }, HOVER_INTENT_DELAY_MS);
  }, [clearHoverLeaveTimeout, clearHoverEnterTimeout, dispatch]);

  const onMouseLeave = useCallback(() => {
    clearHoverEnterTimeout();
    clearHoverLeaveTimeout();
    hoverLeaveTimeoutRef.current = window.setTimeout(() => {
      dispatch(ui.actions.setHover(null));
      hoverLeaveTimeoutRef.current = null;
    }, HOVER_LEAVE_DELAY_MS);
  }, [clearHoverEnterTimeout, clearHoverLeaveTimeout, dispatch]);

  useEffect(() => {
    return () => {
      clearHoverEnterTimeout();
      clearHoverLeaveTimeout();
    };
  }, [clearHoverEnterTimeout, clearHoverLeaveTimeout]);

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

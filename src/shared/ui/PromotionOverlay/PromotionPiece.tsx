import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { Chess, PieceSymbol } from "chess.js";
import { Color } from "chessground/types";


import { RootState, useAppDispatch } from "@/store";
import { nav } from "@/store/slices";
import { selectBoardPromotionTarget, selectBoardFen } from "@/store/selectors";
import { serializeMove } from "@/shared/lib/chess";

type PromotionPieceProps = {
  pieceName: string;
  pieceSymbol: PieceSymbol;
  sideToMove: Color;
  orientation: Color;
  targetRank: number;
};

export const PromotionPiece = ({
  pieceName,
  pieceSymbol,
  sideToMove,
  orientation,
  targetRank,
}: PromotionPieceProps) => {
  const dispatch = useAppDispatch();
  const fen = useSelector((s: RootState) => selectBoardFen(s));
  const target = useSelector((s: RootState) => selectBoardPromotionTarget(s));
  const targetFile = useMemo(() => target ? target[1].charCodeAt(0) - 'a'.charCodeAt(0) : 0, [target]);

  const rank = (orientation === sideToMove) ? targetRank : 7 - targetRank;
  const file = (orientation === 'white') ? targetFile : 7 - targetFile;

  const onClick: React.MouseEventHandler<HTMLDivElement> = useCallback(async () => {
    if (!target) return;
    try {
      const chess = new Chess(fen);
      const [from, to] = target;
      
      const move = chess.move({ from, to, promotion: pieceSymbol });
      dispatch(nav.actions.commitMove(serializeMove(move)));
    } catch (error) {
      console.error("Failed to make promotion move:", error);
    }
  }, [target, fen, pieceSymbol, dispatch]);

  return (
    <div
      key={pieceName}
      className='square'
      style={{
        top: `${12.5 * rank}%`,
        left: `${12.5 * file}%`,
        width: '12.5%',
        height: '12.5%',
        position: 'absolute',
      }}
      onClick={onClick}
    >
      <div className={`piece ${sideToMove} ${pieceName}`}></div>
    </div>
  );
};

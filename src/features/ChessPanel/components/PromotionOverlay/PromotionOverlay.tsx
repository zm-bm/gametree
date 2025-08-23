import { PieceSymbol } from "chess.js";
import { useSelector } from "react-redux";

import { RootState } from "@/store";
import { selectBoardOrientation, selectBoardPromotionTarget, selectSideToMove } from "@/store/selectors";
import { PromotionPiece } from "./PromotionPiece";
import './PromotionOverlay.css';

type Promotion = { piece: string, symbol: PieceSymbol }

const PROMOTIONS: Promotion[] = [
  { piece: 'queen', symbol: 'q'},
  { piece: 'rook', symbol: 'r'},
  { piece: 'bishop', symbol: 'b'},
  { piece: 'knight', symbol: 'n'},
];

type Props = { size: number };

const PromotionOverlay = ({ size }: Props) => {
  const orientation = useSelector((s: RootState) => selectBoardOrientation(s));
  const sideToMove = useSelector((s: RootState) => selectSideToMove(s));
  const target = useSelector((s: RootState) => selectBoardPromotionTarget(s));

  return !target ? null : (
    <div id='promotion-overlay' style={{ height: size, width: size }}>
      {
        PROMOTIONS.map((promote, i) => (
          <PromotionPiece
            key={promote.piece}
            pieceName={promote.piece}
            pieceSymbol={promote.symbol}
            sideToMove={sideToMove}
            orientation={orientation}
            targetRank={i}
          />
        ))
      }
    </div>
  );
}

export default PromotionOverlay;

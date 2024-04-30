import { useCallback } from "react";
import { Chess, PieceSymbol } from "chess.js";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../../store";
import { SET_PROMOTION_TARGET } from "../../redux/boardSlice";
import { MAKE_MOVE } from "../../redux/actions";
import { colorFromFen } from "../../chess";

type Promotion = { piece: string, symbol: PieceSymbol }
const promotions: Promotion[] = [
  { piece: 'queen', symbol: 'q'},
  { piece: 'rook', symbol: 'r'},
  { piece: 'bishop', symbol: 'b'},
  { piece: 'knight', symbol: 'n'},
];

type Props = { size: number };

const PromotionOverlay = ({ size }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const fen = useSelector((state: RootState) => state.board.fen);
  const orientation = useSelector((state: RootState) => state.board.orientation);
  const promotionTarget = useSelector((state: RootState) => state.board.promotionTarget);
  const targetFile = promotionTarget
    ? promotionTarget[1].charCodeAt(0) - 'a'.charCodeAt(0) : 0;
  const turnColor = colorFromFen(fen) === 'w' ? 'white' : 'black';

  const onClick: React.MouseEventHandler<HTMLDivElement> = useCallback((e) => {
    if (!promotionTarget) return;
    const chess = new Chess(fen);
    const [from, to] = promotionTarget;
    const move = chess.move({
      from, to,
      promotion: e.currentTarget.getAttribute('data-promotion') as string,
    });
    dispatch(MAKE_MOVE(move))
    dispatch(SET_PROMOTION_TARGET(null))
  }, [promotionTarget]);

  return !promotionTarget ? null : (
    <div
      id='promotion-overlay'
      style={{ height: size, width: size }}>
      {
        promotions.map((promote, ix) => {
          const file = (orientation === 'white') ? targetFile : 7 - targetFile;
          const rank = (orientation === turnColor) ? ix : 7 - ix;
          return (
            <div
              key={promote.piece}
              className='square'
              style={{
                top: `${12.5 * rank}%`,
                left: `${12.5 * file}%`,
                width: '12.5%',
                height: '12.5%',
                position: 'absolute',
              }}
              data-promotion={promote.symbol}
              onClick={onClick}
            >
              <div className={`piece ${turnColor} ${promote.piece}`}></div>
            </div>
          )
        })
      }
    </div>
  );
}

export default PromotionOverlay;

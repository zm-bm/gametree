import { useCallback, useMemo } from "react";
import { Chess, PieceSymbol } from "chess.js";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../store";
import { selectFen } from "../redux/gameSlice";
import { serializeMove } from "../lib/chess";
import { MakeMove } from "../thunks";
import { useFenColor } from "../lib/chessground";

type Promotion = { piece: string, symbol: PieceSymbol }
const promotions: Promotion[] = [
  { piece: 'queen', symbol: 'q'},
  { piece: 'rook', symbol: 'r'},
  { piece: 'bishop', symbol: 'b'},
  { piece: 'knight', symbol: 'n'},
];

type PromotionPieceProps = {
  promote: Promotion;
  color: string;
  rank: number;
  file: number;
  onClick: React.MouseEventHandler<HTMLDivElement>;
};

const PromotionPiece = ({ promote, color, rank, file, onClick }: PromotionPieceProps) => {
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
      <div className={`piece ${color} ${promote.piece}`}></div>
    </div>
  );
};

const calculateFileRank = (
  targetFile: number, 
  ix: number, 
  orientation: string, 
  color: string
): { file: number, rank: number } => {
  const file = (orientation === 'white') ? targetFile : 7 - targetFile;
  const rank = (orientation === color) ? ix : 7 - ix;
  return { file, rank };
};

type Props = { size: number };

const PromotionOverlay = ({ size }: Props) => {
  const dispatch = useDispatch<AppDispatch>();

  const fen = useSelector((state: RootState) => selectFen(state));
  const orientation = useSelector((state: RootState) => state.game.orientation);
  const target = useSelector((state: RootState) => state.game.promotionTarget);
  const color = useFenColor(fen) === 'w' ? 'white' : 'black';

  const targetFile = useMemo(() => 
    target ? target[1].charCodeAt(0) - 'a'.charCodeAt(0) : 0
  , [target]);

  const onClick: React.MouseEventHandler<HTMLDivElement> = useCallback(async (e) => {
    if (!target) return;
    try {
      const chess = new Chess(fen);
      const [from, to] = target;
      const promotion = e.currentTarget.dataset.promotion;
      if (!promotion) return;
      
      const move = chess.move({ from, to, promotion });
      dispatch(MakeMove(serializeMove(move)));
    } catch (error) {
      console.error("Failed to make promotion move:", error);
    }
  }, [target, fen, dispatch]);

  return !target ? null : (
    <div
      id='promotion-overlay'
      style={{ height: size, width: size }}
    >
      {
        promotions.map((promote, ix) => {
          const { file, rank } = calculateFileRank(targetFile, ix, orientation, color);
          return (
            <PromotionPiece
              key={promote.piece}
              promote={promote}
              color={color}
              rank={rank}
              file={file}
              onClick={onClick}
            />
          )
        })
      }
    </div>
  );
}

export default PromotionOverlay;

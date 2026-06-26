import { useChessgroundConfig } from "@/shared/hooks";
import Board from "@/shared/ui/Board";

import ToggleOrientationButton from './ToggleOrientationButton';

export interface ChessBoardProps {
  className?: string;
}

const ChessBoard = ({ className }: ChessBoardProps) => {
  const config = useChessgroundConfig();

  return (
    <div className="aspect-square h-auto relative">
      <Board
        className={className}
        config={config}
        promotionOverlay={true}
      />
      <ToggleOrientationButton />
    </div>
  );
};

export default ChessBoard;

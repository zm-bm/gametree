import { useChessgroundConfig } from "@/shared/hooks";
import Board from "@/shared/ui/Board";

import ToggleOrientationButton from './ToggleOrientationButton';

const ChessBoard = () => {
  const config = useChessgroundConfig();

  return (
    <div className="aspect-square h-auto relative">
      <Board
        config={config}
        promotionOverlay={true}
      />
      <ToggleOrientationButton />
    </div>
  );
};

export default ChessBoard;

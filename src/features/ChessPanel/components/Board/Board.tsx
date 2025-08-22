import { useMemo } from "react";

import { useDimensions, useChessgroundConfig } from "@/shared/hooks";
import BaseBoard from "./BaseBoard";
import PromotionOverlay from "../PromotionOverlay";

const calculateBoardSize = (width: number) => {
  // board must be multiple of 8px + small margin for chessground
  return (Math.floor(width * window.devicePixelRatio / 8) * 8) / window.devicePixelRatio + 0.1;
};

const Board = () => {
  const [ref, bounds] = useDimensions();
  const config = useChessgroundConfig();
  
  const boardSize = useMemo(() => calculateBoardSize(bounds.width), [bounds]);
  const style = useMemo(() => ({
    width: `${boardSize}px`,
    height: `${boardSize}px`,
  }), [boardSize]);

  return (
    <div ref={ref} className="w-full h-full">
      <div style={style} className="relative" data-testid="board-wrapper">
        <BaseBoard config={config} />
        <PromotionOverlay size={boardSize} />
      </div>
    </div>
  );
};

export default Board;

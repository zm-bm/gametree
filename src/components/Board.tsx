import { useMemo } from "react";

import { useChessgroundConfig } from "../lib/chessground";
import { useDimensions } from "../hooks/useDimensions";
import BaseBoard from "./BaseBoard";
import PromotionOverlay from "./PromotionOverlay";

const Board = () => {
  const [ref, dims] = useDimensions();
  const config = useChessgroundConfig();

  // Ensure the board is always a multiple of 8px for proper square rendering
  const size = useMemo(() => {
    return Math.floor((dims.width - 24) / 8) * 8;
  }, [dims]);

  const style = useMemo(() => ({
    width: size,
    height: size,
  }), [size]);

  return (
    <div ref={ref} className="flex items-center justify-center w-full mt-3">
      <div style={style} className="mx-auto relative" data-testid="board-wrapper">
        <BaseBoard config={config} />
        <PromotionOverlay size={size} />
      </div>
    </div>
  );
};

export default Board;

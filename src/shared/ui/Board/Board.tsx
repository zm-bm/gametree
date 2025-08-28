import { useEffect, useMemo, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import { Api } from 'chessground/api';
import { Config } from 'chessground/config';

import { cn } from '@/shared/lib/cn';
import { useBoardSize } from '@/shared/hooks/useBoardSize';
import PromotionOverlay from '@/shared/ui/PromotionOverlay';
import "./chessground.base.css";
import "./chessground.board.css";
import "./chessground.pieces.css";

interface Props {
  config: Config,
  className?: string,
  promotionOverlay?: boolean,
}

const Board = ({ config, className, promotionOverlay = false }: Props) => {
  const chessgroundRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<Api | undefined>(undefined);
  const [ref, boardSize] = useBoardSize();

  useEffect(() => {
    if (chessgroundRef && chessgroundRef.current && !api) {
      const chessgroundApi = Chessground(chessgroundRef.current, {
        animation: { enabled: true, duration: 200 },
        ...config,
      });
      setApi(chessgroundApi);
    } else if (chessgroundRef && chessgroundRef.current && api) {
      api.set(config);
    }
  }, [chessgroundRef, api, config]);

  const style = useMemo(() => ({
    width: `${boardSize}px`,
    height: `${boardSize}px`,
  }), [boardSize]);

  return (
    <div ref={ref} className="w-full h-full">
      <div style={style} className="relative mx-auto" data-testid="board-wrapper">
        <div ref={chessgroundRef} className={cn('w-full h-full table shadow-xl cg-wrap', className)} />
        {
          promotionOverlay && <PromotionOverlay size={boardSize} />
        }
      </div>
    </div>
  );
}

export default Board;

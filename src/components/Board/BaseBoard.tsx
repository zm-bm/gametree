import { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import { Api } from 'chessground/api';
import { Config } from 'chessground/config';

import "../../styles/chessground.base.css";
import "../../styles/chessground.board.css";
import "../../styles/chessground.pieces.css";

interface Props {
  config: Config
}
const BaseBoard = ({ config }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<Api | undefined>(undefined);

  useEffect(() => {
    if (ref && ref.current && !api) {
      const chessgroundApi = Chessground(ref.current, {
        animation: { enabled: true, duration: 200 },
        ...config,
      });
      setApi(chessgroundApi);
    } else if (ref && ref.current && api) {
      api.set(config);
    }
  }, [ref, api, config]);

  return (
    <div ref={ref} className='w-full h-full table cg-wrap' />
  );
}

export default BaseBoard;
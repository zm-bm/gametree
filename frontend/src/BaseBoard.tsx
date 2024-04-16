import { useEffect, useRef, useState } from 'react';
import { Chessground as ChessgroundApi } from 'chessground';
import { Api } from 'chessground/api';
import { Config } from 'chessground/config';

import "./styles/chessground.base.css";
import "./styles/chessground.brown.css";
import "./styles/chessground.cburnett.css";

interface Props {
  config: Config
}
const BaseBoard = ({ config }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<Api | undefined>(undefined);

  useEffect(() => {
    api?.set(config);
  }, [api, config]);

  useEffect(() => {
    if (ref && ref.current && !api) {
      const chessgroundApi = ChessgroundApi(ref.current, {
        animation: { enabled: true, duration: 200 },
        ...config,
      });
      setApi(chessgroundApi);
    } else if (ref && ref.current && api) {
      api.set(config);
    }
  }, [ref]);

  return (
    <div ref={ref} className='table w-full h-full' />
  );
}

export default BaseBoard;
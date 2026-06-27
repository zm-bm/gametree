import { useState, useCallback, useRef, useLayoutEffect } from 'react';

const calculateBoardSize = (width: number) => {
  // board must be multiple of 8px + small margin for chessground
  return (Math.floor(width * window.devicePixelRatio / 8) * 8) / window.devicePixelRatio + 0.1;
};

export const useBoardSize = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState(0);

  const updateDimensions = useCallback(() => {
    if (ref.current) {
      const newSize = calculateBoardSize(ref.current.offsetWidth);
      setBoardSize(newSize);
    }
  }, []);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => updateDimensions());
    resizeObserver.observe(element);
    return () => {
      resizeObserver.unobserve(element);
    };
  }, [updateDimensions]);

  return [ref, boardSize] as [React.RefObject<HTMLDivElement>, number];
};

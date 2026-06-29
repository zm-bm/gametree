import { useState, useCallback, useRef, useLayoutEffect } from 'react';

const BOARD_GRID_SIZE = 8;
const MAX_DPR_ALIGNMENT_ADJUSTMENT = BOARD_GRID_SIZE * 3;
const DEVICE_PIXEL_EPSILON = 0.0001;

const isDevicePixelAligned = (cssSize: number, devicePixelRatio: number) => {
  const devicePixelsPerSquare = (cssSize / BOARD_GRID_SIZE) * devicePixelRatio;
  return Math.abs(devicePixelsPerSquare - Math.round(devicePixelsPerSquare)) < DEVICE_PIXEL_EPSILON;
};

const calculateBoardSize = (width: number) => {
  const cssAlignedSize = Math.floor(width / BOARD_GRID_SIZE) * BOARD_GRID_SIZE;
  const devicePixelRatio = window.devicePixelRatio || 1;

  if (cssAlignedSize <= 0 || !Number.isFinite(devicePixelRatio) || devicePixelRatio <= 0) {
    return cssAlignedSize;
  }

  const smallestCandidate = Math.max(
    BOARD_GRID_SIZE,
    cssAlignedSize - MAX_DPR_ALIGNMENT_ADJUSTMENT,
  );

  for (let size = cssAlignedSize; size >= smallestCandidate; size -= BOARD_GRID_SIZE) {
    if (isDevicePixelAligned(size, devicePixelRatio)) {
      return size;
    }
  }

  return cssAlignedSize;
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

import { useState, useCallback, useRef, useLayoutEffect } from 'react';

interface Dimensions {
  width: number;
  height: number;
}

export const useDimensions = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const updateDimensions = useCallback(() => {
    if (ref.current) {
      setDimensions({
        width: ref.current.offsetWidth,
        height: ref.current.offsetHeight
      });
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

  return [ref, dimensions] as [React.RefObject<HTMLDivElement>, Dimensions];
};

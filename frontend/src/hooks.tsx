import { useState, useCallback, useRef, useLayoutEffect } from 'react';

interface Dimensions {
  width: number;
  height: number;
}

export const useDimensions = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update dimensions function
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

    // Initialize the dimensions
    updateDimensions();

    // Create a resize observer to listen for changes in size
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    // Start observing the element
    resizeObserver.observe(element);

    // Cleanup function
    return () => {
      resizeObserver.unobserve(element);
    };
  }, [updateDimensions]);

  return [ref, dimensions] as [React.RefObject<HTMLDivElement>, Dimensions];
};

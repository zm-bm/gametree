import { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types';
import { useRef, useEffect } from 'react';

function useAnimateTransform(
  initialTransform: TransformMatrix,
  targetTransform: TransformMatrix,
  zoom: ProvidedZoom<SVGSVGElement>,
  duration: number = 1000,
): void {
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const initialTransformRef = useRef<TransformMatrix>(initialTransform);
  
  useEffect(() => {
    initialTransformRef.current = initialTransform;
    startTimeRef.current = undefined
  }, [initialTransform]);

  useEffect(() => {
    const animate = (time: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = time;
      }

      const elapsedTime = time - startTimeRef.current;
      const fraction = Math.min(elapsedTime / duration, 1);

      const translateX = initialTransformRef.current.translateX + (targetTransform.translateX - initialTransformRef.current.translateX) * fraction;
      const translateY = initialTransformRef.current.translateY + (targetTransform.translateY - initialTransformRef.current.translateY) * fraction;

      zoom.setTransformMatrix({
        translateX,
        translateY,
        scaleX: targetTransform.scaleX,
        scaleY: targetTransform.scaleY,
        skewX: 0,
        skewY: 0,
      })

      if (fraction < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        initialTransformRef.current = targetTransform
      }
    };
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (startTimeRef.current) {
        initialTransformRef.current = targetTransform
      }
      startTimeRef.current = undefined;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = undefined
      }
    };
  }, [targetTransform]);
}

export default useAnimateTransform;

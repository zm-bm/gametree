import { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types';
import { useRef, useEffect } from 'react';
import { ZoomState } from '../components/Tree/MoveTree';

function useAnimateTransform(
  initialTransform: TransformMatrix,
  targetTransform: TransformMatrix,
  zoom: ProvidedZoom<SVGSVGElement> & ZoomState,
  duration: number = 1000,
): void {
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const initialTransformRef = useRef<TransformMatrix>(initialTransform);
  const currentTransformRef = useRef<TransformMatrix>(initialTransform);
  
  useEffect(() => {
    initialTransformRef.current = initialTransform;
    startTimeRef.current = undefined
    console.log('new initial', initialTransformRef.current)
  }, [initialTransform]);

  useEffect(() => {
    currentTransformRef.current = zoom.transformMatrix
  }, [zoom])

  useEffect(() => {
    const animate = (time: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = time;
      }

      const elapsedTime = time - startTimeRef.current;
      const fraction = Math.min(elapsedTime / duration, 1);
      const { translateX: startX, translateY: startY } = initialTransformRef.current;

      zoom.setTransformMatrix({
        translateX: startX + (targetTransform.translateX - startX) * fraction,
        translateY: startY + (targetTransform.translateY - startY) * fraction,
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
        initialTransformRef.current = currentTransformRef.current
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

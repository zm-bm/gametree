import { Point, ProvidedZoom } from '@visx/zoom/lib/types';
import { useRef, useEffect } from 'react';

/*
  using react-spring bc its smoother but this might be useful later

  usage:
  const [target, setTarget] = useState<Point>({ x: 0, y: 0 });
  useAnimateTranslate({ x: 0, y: 0 }, target, zoom, 500);
*/

function useAnimateTranslate(
  initialPoint: Point,
  targetPoint: Point,
  zoom: ProvidedZoom<SVGSVGElement>,
  duration: number = 1000
): void {
  const requestRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const initialPointRef = useRef<Point>(initialPoint);

  const animate = (time: number) => {
    if (!startTimeRef.current) {
        startTimeRef.current = time;
    }

    const elapsedTime = time - startTimeRef.current;
    const fraction = Math.min(elapsedTime / duration, 1);

    const translateX = initialPointRef.current.x + (targetPoint.x - initialPointRef.current.x) * fraction;
    const translateY = initialPointRef.current.y + (targetPoint.y - initialPointRef.current.y) * fraction;

    zoom.setTranslate({ translateX, translateY })

    if (fraction < 1) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (startTimeRef.current)
        initialPointRef.current = targetPoint;
      startTimeRef.current = undefined;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [targetPoint.x, targetPoint.y]);
}

export default useAnimateTranslate;

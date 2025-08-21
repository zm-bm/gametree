import { createContext } from 'react';
import { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types';

import { ZoomState } from "../types";

type ZoomContextType = {
  zoom: ProvidedZoom<SVGSVGElement> & ZoomState;
  transformRef: React.MutableRefObject<TransformMatrix>;
};

export const ZoomContext = createContext<ZoomContextType>({
  zoom: {} as ProvidedZoom<SVGSVGElement> & ZoomState,
  transformRef: { current: {} as TransformMatrix },
});

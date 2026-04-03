import { createContext } from 'react';
import { TransformMatrix } from '@visx/zoom/lib/types';

import { TreeZoom } from "@/shared/types";

type ZoomContextType = {
  zoom: TreeZoom;
  transformRef: React.MutableRefObject<TransformMatrix>;
};

export const ZoomContext = createContext<ZoomContextType>({
  zoom: {} as TreeZoom,
  transformRef: { current: {} as TransformMatrix },
});

import React, { useRef, useLayoutEffect } from "react";
import { ProvidedZoom } from "@visx/zoom/lib/types";

import { ZoomState } from "@/shared/types";
import { ZoomContext } from "./ZoomContext";

type ZoomProviderProps = {
  children: React.ReactNode;
  zoom: ProvidedZoom<SVGSVGElement> & ZoomState;
};

export const ZoomProvider: React.FC<ZoomProviderProps> = ({ children, zoom }) => {
  const transformRef = useRef(zoom.transformMatrix);

  useLayoutEffect(() => {
    transformRef.current = zoom.transformMatrix;
  }, [zoom.transformMatrix]);

  return (
    <ZoomContext.Provider value={{ zoom, transformRef }}>
      {children}
    </ZoomContext.Provider>
  );
};

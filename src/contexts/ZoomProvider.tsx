import React, { useRef, useEffect } from "react";
import { ProvidedZoom } from "@visx/zoom/lib/types";

import { ZoomState } from "../types/tree";
import { ZoomContext } from "./ZoomContext";

type ZoomProviderProps = {
  children: React.ReactNode;
  zoom: ProvidedZoom<SVGSVGElement> & ZoomState;
};

export const ZoomProvider: React.FC<ZoomProviderProps> = ({ children, zoom }) => {
  const transformRef = useRef(zoom.transformMatrix);

  useEffect(() => {
    transformRef.current = zoom.transformMatrix;
  }, [zoom]);

  return (
    <ZoomContext.Provider value={{ zoom, transformRef }}>
      {children}
    </ZoomContext.Provider>
  );
};

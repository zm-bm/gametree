import { useMemo } from "react";
import { useDimensions } from "../hooks";
import BaseBoard from "./BaseBoard";

const BoardPane = () => {
  const [ref, dimensions] = useDimensions()

  const size = useMemo(() => {
    return (Math.floor(dimensions.width / 8) * 8)
  }, [dimensions])

  return (
    <div className="h-full w-full" ref={ref}>
      <div
        data-testid='board-wrapper'
        style={{ height: size, width: size, position: 'relative' }}
      >
        <BaseBoard config={{}} />
      </div>
    </div>
  )
}

export default BoardPane;

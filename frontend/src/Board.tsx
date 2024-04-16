import { useMemo } from "react";
import useDimensions from "./hooks";
import BaseBoard from "./BaseBoard";

const Board = () => {
  const [ref, dimensions] = useDimensions()

  const size = useMemo(() => {
    return (Math.floor(dimensions.width / 8) * 8)
  }, [dimensions])

  return (
    <div className="h-full w-full flex" ref={ref}>
      <div style={{ height: size, width: size, position: 'relative' }}>
        <BaseBoard config={{ }} />
      </div>
    </div>
  )
}

export default Board;

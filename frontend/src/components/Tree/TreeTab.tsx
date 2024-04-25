import Example from './Tree'
import { useDimensions } from "../../hooks/useDimensions";



export const TreeTab = () => {
  const [ref, dimensions] = useDimensions()

  return (
    <div className="w-full h-full border-l border-gray-400 overflow-hidden" ref={ref}>
      <Example width={dimensions.width} height={dimensions.height} />
    </div>
  )
};

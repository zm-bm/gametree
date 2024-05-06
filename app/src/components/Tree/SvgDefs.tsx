import { RectClipPath } from "@visx/clip-path"

interface Props {
  width: number,
  height: number,
}
export const SvgDefs = ({ width, height }: Props) => {
  return (
    <defs>
      <RectClipPath id="minimap" width={width} height={height} />
      <linearGradient id="currentNodeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
        <stop offset="100%" stopColor="#B8960B" stopOpacity="1" />
      </linearGradient>
      <linearGradient id="whiteMoveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />  // Light gray at the top
        <stop offset="100%" stopColor="#c0c0c0" stopOpacity="1" />  // Pure white at the bottom
      </linearGradient>
      <linearGradient id="blackMoveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#707070" stopOpacity="1" />  // Dark gray at the top
        <stop offset="100%" stopColor="#000000" stopOpacity="1" />  // Black at the bottom
      </linearGradient>
    </defs>
  )
}

export const SvgDefs = () => {
  return (
    <defs>
      <linearGradient id="currentNodeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#b0e57c" stopOpacity="1" />
        <stop offset="100%" stopColor="#006400" stopOpacity="1" />
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

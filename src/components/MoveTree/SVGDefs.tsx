export const SVGDefs = () => {
  return (
    <defs>
      {/* Default node gradient/filter */}
      <linearGradient id="moveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" className="stop-zinc-500 dark:stop-zinc-700" stopOpacity="1" />
        <stop offset="100%" className="stop-slate-600 dark:stop-slate-800" stopOpacity="1" />
      </linearGradient>
      <filter id="nodeFilter">
        <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodColor="#000" floodOpacity="0.1"/>
        <feDropShadow dx="0" dy="0" stdDeviation="0.8" floodColor="#fff" floodOpacity="0.1"/>
      </filter>
      
      {/* Current node gradient */}
      <linearGradient id="currentNodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" className="stop-amber-400 dark:stop-amber-500" stopOpacity="1" />
        <stop offset="100%" className="stop-amber-600 dark:stop-amber-700" stopOpacity="1" />
      </linearGradient>
      <filter id="currentNodeFilter" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#f59e0b" floodOpacity="0.35"/>
      </filter>
      
      {/* Hover gradient gradient */}
      <linearGradient id="hoverNodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" className="stop-zinc-400 dark:stop-zinc-700" stopOpacity="1" />
        <stop offset="100%" className="stop-slate-500 dark:stop-slate-700" stopOpacity="1" />
      </linearGradient>
      <filter id="hoverNodeFilter">
        <feDropShadow dx="0" dy="1" stdDeviation="1.0"
          floodColor="#38bdf8" floodOpacity="0.22"/>
      </filter>


      {/* Link filter */}
      <filter id="linkShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" />
        <feOffset dx="0.5" dy="0.5" result="offsetblur" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.2" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      {/* Minimap glow effect */}
      <filter id="minimapGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

    </defs>
  )
};

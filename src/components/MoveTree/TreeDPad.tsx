import { useCallback, useState } from 'react';
import clsx from 'clsx';
import { BiCollapse, BiExpand } from 'react-icons/bi'

// Base button component
const DPadButton = ({ 
  label, 
  icon, 
  onClick, 
  visible = true, 
  className = "" 
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  visible?: boolean;
  className?: string;
}) => (
  <button 
    aria-label={label} 
    className={clsx(
      "h-8 w-8 rounded-md grid place-items-center hover:bg-black/10 dark:hover:bg-white/10",
      "transition-all duration-300",
      !visible && "opacity-0 pointer-events-none",
      className
    )} 
    onClick={onClick}
  >
    {icon}
  </button>
);

export const TreeDPad = () => {
  const [navOpen, setNavOpen] = useState(!localStorage.mtNavDismissed);
  const dismiss = useCallback(() => { setNavOpen(false); localStorage.mtNavDismissed = '1'; }, []);
  const open = useCallback(() => { setNavOpen(true); localStorage.mtNavDismissed = ''; }, []);
  
  const key = useCallback((keyName: string) => {
    console.log(keyName);
  }, []);

  return (
    <div className="absolute top-4 left-4 z-40 select-none tree-overlay">
      <div 
        className={clsx(
          "relative transition-all duration-300 ease-in-out",
          navOpen ? "w-[108px] h-[108px]" : "w-8 h-8"
        )}
      >
        {/* Center button - always visible */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <DPadButton 
            label={navOpen ? "collapse" : "open tree nav"} 
            icon={navOpen ? <BiCollapse /> : <BiExpand />}
            onClick={navOpen ? dismiss : open}
          />
        </div>
        
        {/* Up button */}
        <div 
          className={clsx(
            "absolute left-1/2 -translate-x-1/2 transition-all duration-300",
            navOpen ? "top-0" : "top-1/2 -translate-y-1/2"
          )}
        >
          <DPadButton 
            label="up" 
            icon="↑" 
            onClick={() => key('ArrowUp')} 
            visible={navOpen}
          />
        </div>
        
        {/* Left button */}
        <div 
          className={clsx(
            "absolute top-1/2 -translate-y-1/2 transition-all duration-300",
            navOpen ? "left-0" : "left-1/2 -translate-x-1/2"
          )}
        >
          <DPadButton 
            label="left" 
            icon="←" 
            onClick={() => key('ArrowLeft')} 
            visible={navOpen}
          />
        </div>
        
        {/* Right button */}
        <div 
          className={clsx(
            "absolute top-1/2 -translate-y-1/2 transition-all duration-300",
            navOpen ? "right-0" : "left-1/2 -translate-x-1/2"
          )}
        >
          <DPadButton 
            label="right" 
            icon="→" 
            onClick={() => key('ArrowRight')} 
            visible={navOpen}
          />
        </div>
        
        {/* Down button */}
        <div 
          className={clsx(
            "absolute left-1/2 -translate-x-1/2 transition-all duration-300",
            navOpen ? "bottom-0" : "top-1/2 -translate-y-1/2"
          )}
        >
          <DPadButton 
            label="down" 
            icon="↓" 
            onClick={() => key('ArrowDown')} 
            visible={navOpen}
          />
        </div>
      </div>
    </div>
  );
};

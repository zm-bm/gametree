import { useCallback, useState } from 'react';
import { BiCollapse, BiExpand } from 'react-icons/bi'
import { useDispatch } from 'react-redux';
import clsx from 'clsx';

import { nav } from '@/store/slices';

interface TreeDPadProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  visible?: boolean;
  className?: string;
}

const DPadButton = ({ 
  label, 
  icon, 
  onClick, 
  visible = true, 
  className = "" 
}: TreeDPadProps) => (
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
  const dispatch = useDispatch();
  const [isCollapsed, setIsCollapsed] = useState(localStorage.gtNavCollapsed === '1');

  const toggleCollapsed = useCallback(() => {
    localStorage.gtNavCollapsed = isCollapsed ? '' : '1';
    setIsCollapsed(prev => !prev);
  }, [isCollapsed]);
  const handleUp = useCallback(() => dispatch(nav.actions.navigatePrevSibling()), [dispatch]);
  const handleDown = useCallback(() => dispatch(nav.actions.navigateNextSibling()), [dispatch]);
  const handleRight = useCallback(() => dispatch(nav.actions.navigateDown()), [dispatch]);
  const handleLeft = useCallback(() => dispatch(nav.actions.navigateUp()), [dispatch]);

  return (
    <div className="z-40 select-none tree-overlay mx-2">
      <div 
        className={clsx(
          "relative transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[108px] h-[108px]" : "w-8 h-8"
        )}
      >
        {/* Center button - always visible */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <DPadButton 
            label={isCollapsed ? "collapse" : "open tree nav"} 
            icon={isCollapsed ? <BiCollapse size={20} /> : <BiExpand size={20} />}
            onClick={toggleCollapsed}
          />
        </div>
        
        {/* Up button */}
        <div 
          className={clsx(
            "absolute left-1/2 -translate-x-1/2 transition-all duration-300",
            isCollapsed ? "top-0" : "top-1/2 -translate-y-1/2"
          )}
        >
          <DPadButton 
            label="up" 
            icon="↑" 
            onClick={handleUp} 
            visible={isCollapsed}
          />
        </div>
        
        {/* Left button */}
        <div 
          className={clsx(
            "absolute top-1/2 -translate-y-1/2 transition-all duration-300",
            isCollapsed ? "left-0" : "left-1/2 -translate-x-1/2"
          )}
        >
          <DPadButton 
            label="left" 
            icon="←" 
            onClick={handleLeft} 
            visible={isCollapsed}
          />
        </div>
        
        {/* Right button */}
        <div 
          className={clsx(
            "absolute top-1/2 -translate-y-1/2 transition-all duration-300",
            isCollapsed ? "right-0" : "left-1/2 -translate-x-1/2"
          )}
        >
          <DPadButton 
            label="right" 
            icon="→" 
            onClick={handleRight} 
            visible={isCollapsed}
          />
        </div>
        
        {/* Down button */}
        <div 
          className={clsx(
            "absolute left-1/2 -translate-x-1/2 transition-all duration-300",
            isCollapsed ? "bottom-0" : "top-1/2 -translate-y-1/2"
          )}
        >
          <DPadButton 
            label="down" 
            icon="↓" 
            onClick={handleDown} 
            visible={isCollapsed}
          />
        </div>
      </div>
    </div>
  );
};

import { useCallback, useState } from 'react';
import { BiCollapse, BiExpand } from 'react-icons/bi'
import { useDispatch } from 'react-redux';

import { nav } from '@/store/slices';
import { cn } from '@/shared/lib/cn';

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
}: TreeDPadProps) => (
  <button 
    title={label}
    aria-label={label} 
    className={cn(
      "h-8 w-8 rounded-md grid place-items-center interactive-treeview",
      !visible && "opacity-0 pointer-events-none"
    )} 
    onClick={onClick}
  >
    {icon}
  </button>
);

const btnBase = "absolute transition-all duration-300";
const btnCenter = "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";
const btnVert = "left-1/2 -translate-x-1/2";
const btnHoriz = "top-1/2 -translate-y-1/2";

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
    <div className="z-40 select-none treeview-card mx-2">
      <div 
        className={cn(
          "relative transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[108px] h-[108px]" : "w-8 h-8"
        )}
      >
        {/* Center button */}
        <div className={cn(btnBase, btnCenter, "z-10")}>
          <DPadButton 
            label={isCollapsed ? "collapse" : "open tree nav"} 
            icon={isCollapsed ? <BiCollapse size={20} /> : <BiExpand size={20} />}
            onClick={toggleCollapsed}
          />
        </div>
        
        {/* Up button */}
        <div className={cn(btnBase, btnVert, isCollapsed && "top-0")}>
          <DPadButton 
            label="up" 
            icon="↑" 
            onClick={handleUp} 
            visible={isCollapsed}
          />
        </div>
        
        {/* Left button */}
        <div className={cn(btnBase, btnHoriz, isCollapsed && "left-0")}>
          <DPadButton 
            label="left" 
            icon="←" 
            onClick={handleLeft} 
            visible={isCollapsed}
          />
        </div>
        
        {/* Right button */}
        <div className={cn(btnBase, btnHoriz, isCollapsed && "right-0")}>
          <DPadButton 
            label="right" 
            icon="→" 
            onClick={handleRight} 
            visible={isCollapsed}
          />
        </div>
        
        {/* Down button */}
        <div className={cn(btnBase, btnVert, isCollapsed && "bottom-0")}>
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

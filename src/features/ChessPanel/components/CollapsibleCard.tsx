import { useState, useEffect, useMemo, ReactNode } from "react";
import clsx from "clsx";

interface CollapsibleCardProps {
  header: ReactNode;
  collapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  children: ReactNode;
  maxHeight?: string; // e.g. "max-h-60"
  duration?: number; // ms
}

export const CollapsibleCard = ({
  header,
  collapsed = false,
  onToggle,
  children,
  maxHeight = "max-h-60",
  duration = 300,
}: CollapsibleCardProps) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [showContent, setShowContent] = useState(!collapsed);

  useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);

  useEffect(() => {
    if (!isCollapsed) {
      setShowContent(true);
    } else {
      const timeout = setTimeout(() => setShowContent(false), duration);
      return () => clearTimeout(timeout);
    }
  }, [isCollapsed, duration]);

  const arrowStyle = useMemo(() => ({
    transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: `transform ${duration}ms`,
  }), [isCollapsed, duration]);

  const handleToggle = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      onToggle?.(next);
      return next;
    });
  };

  return (
    <div className="flex flex-col">
      <div
        className="w-full flex items-center justify-between p-3 gap-2 text-sm cursor-pointer select-none"
        onClick={handleToggle}
      >
        <div>{header}</div>
        <div
          className="transition-transform"
          style={arrowStyle}
        >
          ▲
        </div>
      </div>
      <div
        className={clsx(
          "transition-all ease-in-out overflow-hidden",
          isCollapsed ? "max-h-0 opacity-0" : `${maxHeight} opacity-100`
        )}
        style={{ transitionDuration: `${duration}ms` }}
      >
        {showContent && children}
      </div>
    </div>
  );
};
import { useState, useEffect, useMemo, ReactNode } from "react";
import { cn } from "../cn";

type HeaderRenderer = (collapsed: boolean) => ReactNode;

interface CollapsibleCardProps {
  header: ReactNode | HeaderRenderer;
  collapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  children: ReactNode;
  maxHeight?: string; // e.g. "max-h-60"
  duration?: number; // ms
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  persistKey?: string;
}

export const CollapsibleCard = ({
  header,
  collapsed,
  onToggle,
  children,
  maxHeight = "max-h-60",
  duration = 300,
  className,
  headerClassName,
  contentClassName,
  persistKey,
}: CollapsibleCardProps) => {
  const defaultCollapsed = collapsed ?? false;

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (!persistKey) return defaultCollapsed;

    try {
      const persisted = localStorage.getItem(persistKey);
      if (persisted === null) return defaultCollapsed;
      return persisted === "1";
    } catch {
      return defaultCollapsed;
    }
  });
  const [showContent, setShowContent] = useState(!isCollapsed);

  useEffect(() => {
    if (collapsed !== undefined) {
      setIsCollapsed(collapsed);
    }
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
      if (persistKey) {
        try {
          localStorage.setItem(persistKey, next ? "1" : "");
        } catch {
          // no-op
        }
      }
      onToggle?.(next);
      return next;
    });
  };

  const baseHeaderClassName = "w-full flex items-center justify-between gap-2 text-sm cursor-pointer select-none";
  const appliedHeaderClassName = headerClassName ?? "p-3 interactive-sidebar";
  const resolvedHeader = typeof header === "function" ? header(isCollapsed) : header;

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        className={cn(baseHeaderClassName, appliedHeaderClassName)}
        onClick={handleToggle}
      >
        <div>{resolvedHeader}</div>
        <div
          className="transition-transform"
          style={arrowStyle}
        >
          ▲
        </div>
      </div>
      <div
        className={cn(
          "transition-all ease-in-out overflow-hidden",
          isCollapsed ? "max-h-0 opacity-0" : `${maxHeight} opacity-100`,
          contentClassName,
        )}
        style={{ transitionDuration: `${duration}ms` }}
      >
        {showContent && children}
      </div>
    </div>
  );
};

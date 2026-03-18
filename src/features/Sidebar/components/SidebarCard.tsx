import { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { CollapsibleCard } from "@/shared/ui/CollapsibleCard";

interface SidebarCardProps {
  title: string;
  children: ReactNode;
  maxHeight?: string;
  className?: string;
  persistKey?: string;
}

export const SidebarCard = ({
  title,
  children,
  maxHeight = "max-h-60",
  className,
  persistKey,
}: SidebarCardProps) => {
  return (
    <CollapsibleCard
      header={<span className="font-semibold tracking-tight">{title}</span>}
      className={cn("sidebar-card", className)}
      headerClassName="p-3 interactive-sidebar"
      contentClassName="sidebar-divider"
      maxHeight={maxHeight}
      persistKey={persistKey}
    >
      {children}
    </CollapsibleCard>
  );
};

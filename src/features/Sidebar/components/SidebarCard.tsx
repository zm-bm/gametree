import { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { CollapsibleCard } from "@/shared/ui/CollapsibleCard";

type HeaderRenderer = (collapsed: boolean) => ReactNode;

interface SidebarCardProps {
  title?: string;
  header?: ReactNode | HeaderRenderer;
  children: ReactNode;
  maxHeight?: string;
  className?: string;
  persistKey?: string;
}

export const SidebarCard = ({
  title,
  header,
  children,
  maxHeight = "max-h-60",
  className,
  persistKey,
}: SidebarCardProps) => {
  const resolvedHeader = header ?? <span className="font-semibold tracking-tight">{title}</span>;

  return (
    <CollapsibleCard
      header={resolvedHeader}
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

import { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";
import { CollapsibleCard } from "@/shared/ui/CollapsibleCard";

interface TreeOverlayCardProps {
  title: string;
  persistKey: string;
  children: ReactNode;
  maxHeight?: string;
  className?: string;
}

export const TreeOverlayCard = ({
  title,
  persistKey,
  children,
  maxHeight = "max-h-60",
  className,
}: TreeOverlayCardProps) => {
  return (
    <CollapsibleCard
      header={<div className="text-sm font-bold">{title}</div>}
      className={cn("treeview-card w-[14rem] select-none", className)}
      headerClassName="px-3 py-2 interactive-treeview"
      contentClassName="treeview-divider"
      maxHeight={maxHeight}
      persistKey={persistKey}
    >
      {children}
    </CollapsibleCard>
  );
};

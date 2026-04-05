import { useEffect } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/shared/cn";

type HelpModalProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  dismissLabel?: string;
  maxWidthClassName?: string;
};

export const HelpModal = ({
  isOpen,
  title,
  onClose,
  children,
  dismissLabel = "Got it",
  maxWidthClassName = "max-w-lg",
}: HelpModalProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] bg-black/45 backdrop-blur-[1px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div className="h-full w-full grid place-items-center p-4">
        <section
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={cn(
            "gt-tree-panel w-full",
            maxWidthClassName,
            "max-h-[90vh] overflow-hidden",
            "flex flex-col",
          )}
        >
          <header className="flex items-center justify-between px-5 py-3 border-b border-lightmode-900/15 dark:border-darkmode-100/20">
            <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
            <button
              type="button"
              aria-label="Close help"
              className="h-8 w-8 rounded-md grid place-items-center gt-treeview-hoverable"
              onClick={onClose}
            >
              x
            </button>
          </header>

          <div className="px-5 py-4 overflow-y-auto space-y-5 text-sm leading-5">
            {children}
          </div>

          <footer className="px-5 py-3 border-t border-lightmode-900/15 dark:border-darkmode-100/20 flex justify-end">
            <button
              type="button"
              className="gt-tree-panel px-3 py-1.5 text-sm gt-treeview-hoverable"
              onClick={onClose}
            >
              {dismissLabel}
            </button>
          </footer>
        </section>
      </div>
    </div>,
    document.body,
  );
};

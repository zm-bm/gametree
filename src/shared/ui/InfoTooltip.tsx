import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { createPortal } from "react-dom";

import { cn } from "@/shared/lib/cn";

type TooltipInteraction = "hover" | "click" | "hybrid";

interface InfoTooltipProps {
  text: string;
  ariaLabel: string;
  className?: string;
  tooltipClassName?: string;
  iconSize?: number;
  interaction?: TooltipInteraction;
}

export const InfoTooltip = ({
  text,
  ariaLabel,
  className,
  tooltipClassName,
  iconSize = 12,
  interaction = "hybrid",
}: InfoTooltipProps) => {
  const tooltipId = useId();
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);

  const isHoverInteraction = interaction === "hover" || interaction === "hybrid";
  const isClickInteraction = interaction === "click" || interaction === "hybrid";

  const isOpen = (isHoverInteraction && (isHovered || isFocused)) || (isClickInteraction && isPinnedOpen);

  useLayoutEffect(() => {
    if (!isOpen) {
      setTooltipPosition(null);
      return;
    }

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const tooltipWidth = 176;
      const viewportMargin = 8;
      const left = Math.max(
        viewportMargin,
        Math.min(rect.left, window.innerWidth - tooltipWidth - viewportMargin),
      );

      setTooltipPosition({
        top: rect.bottom + 6,
        left,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isClickInteraction) {
      setIsPinnedOpen(false);
    }
  }, [isClickInteraction]);

  useEffect(() => {
    if (!isClickInteraction || !isPinnedOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      setIsPinnedOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isClickInteraction, isPinnedOpen]);

  return (
    <>
      <span
        ref={rootRef}
        className={cn("relative inline-flex items-center", className)}
        onMouseEnter={() => isHoverInteraction && setIsHovered(true)}
        onMouseLeave={() => isHoverInteraction && setIsHovered(false)}
      >
        <button
          ref={triggerRef}
          type="button"
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          aria-describedby={isOpen ? tooltipId : undefined}
          onFocus={() => isHoverInteraction && setIsFocused(true)}
          onBlur={() => isHoverInteraction && setIsFocused(false)}
          onClick={() => {
            if (!isClickInteraction) return;
            setIsPinnedOpen((prev) => !prev);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsPinnedOpen(false);
              if (isHoverInteraction) setIsFocused(false);
              e.currentTarget.blur();
            }
          }}
          className={cn(
            "inline-flex items-center justify-center rounded-sm cursor-pointer",
            "text-lightmode-500 dark:text-darkmode-400",
            "hover:text-lightmode-700 dark:hover:text-darkmode-200",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-sky-500/45 dark:focus-visible:ring-sky-400/35",
          )}
        >
          <FaInfoCircle size={iconSize} />
        </button>
      </span>

      {isOpen && tooltipPosition && typeof document !== "undefined"
        ? createPortal(
            <span
              id={tooltipId}
              role="tooltip"
              style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
              className={cn(
                "pointer-events-none fixed z-50 w-44 rounded-md px-2 py-1",
                "text-xs leading-snug font-normal",
                "text-lightmode-900 dark:text-darkmode-100",
                "bg-lightmode-50/95 dark:bg-darkmode-900/95",
                "ring-1 ring-lightmode-700/25 dark:ring-darkmode-100/20",
                tooltipClassName,
              )}
            >
              {text}
            </span>,
            document.body,
          )
        : null}
    </>
  );
};

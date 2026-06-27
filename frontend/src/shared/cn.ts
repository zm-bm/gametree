import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...a: unknown[]) { return twMerge(clsx(a)); }

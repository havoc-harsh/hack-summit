// components/ui/skeleton.tsx
import * as React from "react"
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Function to merge class names (Tailwind-specific)
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    className={cn(
      "inline-block h-[15px] w-full animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800",
      className
    )}
    {...props}
    ref={ref}
  />
))
Skeleton.displayName = "Skeleton"

export { Skeleton, cn }

// src/components/ui/shimmer-button.jsx
import React from "react";
import { cn } from "@/utils/cn";

export const ShimmerButton = React.forwardRef(
  ({ children, className, shimmerColor = "#ffffff", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg border border-white/20 bg-slate-950 px-6 font-medium text-white transition-all hover:scale-105",
          "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
ShimmerButton.displayName = "ShimmerButton";
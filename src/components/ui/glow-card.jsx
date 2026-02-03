// src/components/ui/glow-card.jsx
import React from "react";
import { cn } from "@/utils/cn";

export function GlowCard({ children, className, glowColor = "purple" }) {
  const glowColors = {
    purple: "before:from-purple-500/50 before:to-pink-500/50",
    blue: "before:from-blue-500/50 before:to-cyan-500/50",
    green: "before:from-green-500/50 before:to-emerald-500/50",
    orange: "before:from-orange-500/50 before:to-yellow-500/50",
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl bg-slate-900 p-[1px]",
        "before:absolute before:-inset-[2px] before:rounded-2xl before:bg-gradient-to-r before:blur-xl before:opacity-75 before:transition-opacity hover:before:opacity-100",
        glowColors[glowColor],
        className
      )}
    >
      <div className="relative rounded-2xl bg-slate-900">{children}</div>
    </div>
  );
}
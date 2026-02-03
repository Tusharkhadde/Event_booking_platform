// src/components/ui/particle-button.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

export function ParticleButton({ children, className, onClick, ...props }) {
  const [particles, setParticles] = useState([]);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
    }));

    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 600);

    onClick?.(e);
  };

  return (
    <button
      className={cn(
        "relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-8 font-medium text-white transition-transform hover:scale-105 active:scale-95",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            className="pointer-events-none absolute h-2 w-2 rounded-full bg-white"
            initial={{ x: particle.x, y: particle.y, scale: 1, opacity: 1 }}
            animate={{
              x: particle.x + (Math.random() - 0.5) * 100,
              y: particle.y + (Math.random() - 0.5) * 100,
              scale: 0,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
      {children}
    </button>
  );
}
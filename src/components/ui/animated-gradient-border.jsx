// src/components/ui/animated-gradient-border.jsx
import React from 'react';
import { cn } from '@/utils/cn';

export function AnimatedGradientBorder({ children, className }) {
  return (
    <div className={cn('relative rounded-2xl p-[2px]', className)}>
      {/* Animated gradient border */}
      <div 
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-75"
        style={{
          background: 'linear-gradient(90deg, #a855f7, #ec4899, #06b6d4, #a855f7)',
          backgroundSize: '300% 100%',
          animation: 'gradient-shift 3s ease infinite',
        }}
      />
      {/* Blur effect */}
      <div 
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-50 blur-xl"
        style={{
          background: 'linear-gradient(90deg, #a855f7, #ec4899, #06b6d4, #a855f7)',
          backgroundSize: '300% 100%',
          animation: 'gradient-shift 3s ease infinite',
        }}
      />
      {/* Content */}
      <div className="relative rounded-2xl bg-slate-950">
        {children}
      </div>
    </div>
  );
}

export default AnimatedGradientBorder;
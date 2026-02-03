// src/components/ui/gradient-text.jsx
import React from 'react';
import { cn } from '@/utils/cn';

export function GradientText({ 
  children, 
  className, 
  colors = 'from-purple-400 via-pink-400 to-cyan-400' 
}) {
  return (
    <span
      className={cn(
        'bg-gradient-to-r bg-clip-text text-transparent',
        colors,
        className
      )}
      style={{
        backgroundSize: '200% auto',
        animation: 'gradient-text 3s ease infinite',
      }}
    >
      {children}
    </span>
  );
}

export default GradientText;
// src/components/ui/FlipCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export const FlipCard = ({ 
  front, 
  back, 
  isFlipped: controlledFlipped, 
  className 
}) => {
  const [isFlippedLocal, setIsFlippedLocal] = useState(false);
  
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : isFlippedLocal;

  const handleClick = () => {
    if (controlledFlipped === undefined) {
      setIsFlippedLocal(!isFlippedLocal);
    }
  };

  return (
    <div 
      className={cn("perspective-1000 cursor-pointer group", className)} 
      onClick={handleClick}
    >
      <motion.div
        className="relative w-full h-full transition-all duration-500 transform-style-preserve-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Front */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          {front}
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 w-full h-full backface-hidden"
          style={{ transform: "rotateY(180deg)" }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
};
// src/components/payment/CreditCard3D.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Wifi } from 'lucide-react';

const cardBrands = {
  visa: {
    gradient: 'from-blue-600 via-blue-700 to-blue-900',
    logo: 'VISA',
    textColor: 'text-white',
  },
  mastercard: {
    gradient: 'from-red-600 via-orange-500 to-yellow-500',
    logo: '●●',
    textColor: 'text-white',
  },
  amex: {
    gradient: 'from-slate-600 via-slate-700 to-slate-900',
    logo: 'AMEX',
    textColor: 'text-white',
  },
  discover: {
    gradient: 'from-orange-500 via-orange-600 to-orange-700',
    logo: 'DISCOVER',
    textColor: 'text-white',
  },
  unknown: {
    gradient: 'from-purple-600 via-violet-600 to-indigo-800',
    logo: 'CARD',
    textColor: 'text-white',
  },
};

export function CreditCard3D({
  cardNumber = '',
  cardHolder = '',
  expiryDate = '',
  cvv = '',
  isFlipped = false,
  brand = 'unknown',
}) {
  const brandInfo = cardBrands[brand] || cardBrands.unknown;

  // Format card number for display
  const formatCardNumber = (num) => {
    const cleaned = num.replace(/\s/g, '');
    const groups = [];
    
    for (let i = 0; i < 16; i += 4) {
      const group = cleaned.substring(i, i + 4);
      groups.push(group.padEnd(4, '•'));
    }
    
    return groups.join(' ');
  };

  return (
    <div 
      className="w-full max-w-[380px] mx-auto"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="relative w-full"
        style={{ 
          aspectRatio: '1.586 / 1',
          transformStyle: 'preserve-3d',
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        {/* Front of card */}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl p-6 shadow-2xl',
            'bg-gradient-to-br',
            brandInfo.gradient
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Holographic overlay */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-30"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 45%, transparent 50%)',
            }}
          />

          {/* Pattern overlay */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Chip */}
          <div className="absolute top-6 left-6">
            <div className="w-12 h-10 rounded-md bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 shadow-lg overflow-hidden">
              <div className="w-full h-full grid grid-cols-2 gap-0.5 p-1">
                <div className="rounded-sm bg-yellow-600/40" />
                <div className="rounded-sm bg-yellow-600/40" />
                <div className="rounded-sm bg-yellow-600/40" />
                <div className="rounded-sm bg-yellow-600/40" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-6 border border-yellow-600/50 rounded-sm" />
              </div>
            </div>
          </div>

          {/* Contactless icon */}
          <div className="absolute top-6 left-20">
            <Wifi className="w-6 h-6 text-white/70 rotate-90" />
          </div>

          {/* Brand logo */}
          <div className="absolute top-6 right-6 text-xl font-bold text-white/90 tracking-widest">
            {brand === 'mastercard' ? (
              <div className="flex items-center gap-0">
                <div className="w-8 h-8 rounded-full bg-red-500 opacity-90" />
                <div className="w-8 h-8 rounded-full bg-yellow-500 opacity-90 -ml-3" />
              </div>
            ) : (
              <span className="drop-shadow-lg">{brandInfo.logo}</span>
            )}
          </div>

          {/* Card number */}
          <div className="absolute left-6 right-6 bottom-20">
            <p className="font-mono text-xl md:text-2xl tracking-[0.25em] text-white drop-shadow-lg">
              {formatCardNumber(cardNumber)}
            </p>
          </div>

          {/* Card holder and expiry */}
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div>
              <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">
                Card Holder
              </p>
              <p className="font-mono text-sm text-white uppercase tracking-wider truncate max-w-[180px]">
                {cardHolder || 'YOUR NAME'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">
                Expires
              </p>
              <p className="font-mono text-sm text-white tracking-wider">
                {expiryDate || 'MM/YY'}
              </p>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl shadow-2xl',
            'bg-gradient-to-br',
            brandInfo.gradient
          )}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Magnetic stripe */}
          <div className="absolute top-10 inset-x-0 h-12 bg-slate-900" />

          {/* Signature strip and CVV */}
          <div className="absolute top-28 left-6 right-6 flex items-center gap-4">
            {/* Signature strip */}
            <div className="flex-1 h-10 bg-white/90 rounded flex items-center justify-end px-4">
              <p className="font-handwriting text-slate-700 italic text-sm truncate">
                {cardHolder || 'Signature'}
              </p>
            </div>
            {/* CVV box */}
            <div className="w-16 h-10 bg-white rounded flex items-center justify-center">
              <p className="font-mono text-slate-900 text-lg font-bold tracking-wider">
                {cvv || '•••'}
              </p>
            </div>
          </div>

          {/* Security text */}
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-[8px] text-white/50 leading-relaxed">
              This card is property of EventHub Inc. Use of this card is subject to
              the cardholder agreement. Unauthorized use is prohibited. If found,
              please return to the nearest EventHub office or contact support.
            </p>
          </div>

          {/* Brand logo on back */}
          <div className="absolute bottom-6 right-6">
            {brand === 'mastercard' ? (
              <div className="flex items-center gap-0">
                <div className="w-6 h-6 rounded-full bg-red-500 opacity-70" />
                <div className="w-6 h-6 rounded-full bg-yellow-500 opacity-70 -ml-2" />
              </div>
            ) : (
              <span className="text-sm font-bold text-white/50">{brandInfo.logo}</span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default CreditCard3D;
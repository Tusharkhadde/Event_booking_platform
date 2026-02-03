// src/components/booking/TicketSelection.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Minus, 
  Plus, 
  Ticket, 
  Star, 
  Crown,
  Sparkles,
  Users,
  AlertCircle,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { cn } from '@/utils/cn';

// Icon mapping for ticket types
const ticketIcons = {
  vip: Crown,
  premium: Star,
  regular: Ticket,
  student: Users,
  group: Users,
  early_bird: Zap,
};

// Gradient mapping for ticket types
const ticketGradients = {
  vip: 'from-purple-600 to-pink-600',
  premium: 'from-amber-500 to-orange-600',
  regular: 'from-blue-600 to-cyan-600',
  student: 'from-emerald-500 to-teal-600',
  group: 'from-indigo-500 to-purple-600',
  early_bird: 'from-yellow-500 to-orange-500',
};

export function TicketSelection({ 
  ticketTypes = [],
  selectedTickets = {}, 
  onTicketChange,
  maxTickets = 10,
}) {
  // Calculate total selected tickets
  const totalSelected = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);

  // Handle quantity change
  const handleQuantityChange = (ticketId, delta) => {
    const currentQty = selectedTickets[ticketId] || 0;
    const newQty = Math.max(0, currentQty + delta);
    
    const ticket = ticketTypes.find(t => t.id === ticketId);
    if (!ticket) return;

    // Check max per order
    const maxPerOrder = ticket.maxPerOrder || 10;
    if (newQty > maxPerOrder) return;

    // Check total max tickets
    const otherTickets = totalSelected - currentQty;
    if (otherTickets + newQty > maxTickets) return;

    // Check availability
    const available = ticket.available ?? Infinity;
    if (newQty > available) return;

    onTicketChange?.({
      ...selectedTickets,
      [ticketId]: newQty,
    });
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return Object.entries(selectedTickets).reduce((sum, [id, qty]) => {
      const ticket = ticketTypes.find(t => t.id === id);
      return sum + (ticket?.price || 0) * qty;
    }, 0);
  };

  // If no ticket types, show message
  if (!ticketTypes || ticketTypes.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No Tickets Available
          </h3>
          <p className="text-slate-400">
            Tickets for this event are not yet available or have sold out.
          </p>
        </CardContent>
      </Card>
    );
  }

  const subtotal = calculateSubtotal();

  return (
    <div className="space-y-4">
      {/* Tickets Grid */}
      <div className="grid gap-4">
        {ticketTypes.map((ticket, index) => {
          const Icon = ticketIcons[ticket.type] || ticketIcons.regular;
          const gradient = ticketGradients[ticket.type] || ticketGradients.regular;
          const quantity = selectedTickets[ticket.id] || 0;
          const isSelected = quantity > 0;
          const available = ticket.available ?? Infinity;
          const isSoldOut = available === 0;
          const isLimitedStock = available > 0 && available <= 20;

          return (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={cn(
                  'relative overflow-hidden transition-all duration-300 border-2',
                  'bg-slate-900/80 backdrop-blur',
                  isSoldOut && 'opacity-60',
                  isSelected 
                    ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' 
                    : 'border-slate-700/50 hover:border-slate-600'
                )}
              >
                {/* Top gradient accent */}
                <div className={cn(
                  'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
                  gradient
                )} />

                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn(
                      'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0',
                      'bg-gradient-to-br shadow-lg',
                      gradient
                    )}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Title & Badges */}
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-bold text-white text-lg">
                              {ticket.name}
                            </h3>
                            
                            {isSoldOut && (
                              <Badge variant="destructive" className="text-xs">
                                Sold Out
                              </Badge>
                            )}
                            
                            {!isSoldOut && isLimitedStock && (
                              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Only {available} left
                              </Badge>
                            )}
                            
                            {ticket.originalPrice && !isSoldOut && (
                              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Save ${(ticket.originalPrice - ticket.price).toFixed(0)}
                              </Badge>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-sm text-slate-400 mb-3">
                            {ticket.description}
                          </p>

                          {/* Features */}
                          {ticket.features && ticket.features.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {ticket.features.map((feature, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-slate-800/80 text-slate-300"
                                >
                                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                                  {feature}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Price & Quantity */}
                        <div className="text-right flex-shrink-0">
                          <div className="mb-3">
                            {ticket.originalPrice && (
                              <p className="text-sm text-slate-500 line-through">
                                ${ticket.originalPrice.toFixed(2)}
                              </p>
                            )}
                            <p className="text-2xl font-bold text-white">
                              ${ticket.price.toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-400">per ticket</p>
                          </div>

                          {/* Quantity Controls */}
                          {!isSoldOut && (
                            <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  'h-9 w-9 rounded-md transition-colors',
                                  quantity > 0 
                                    ? 'text-white hover:bg-slate-700' 
                                    : 'text-slate-600 cursor-not-allowed'
                                )}
                                onClick={() => handleQuantityChange(ticket.id, -1)}
                                disabled={quantity === 0}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              
                              <span className="w-10 text-center font-bold text-white text-lg">
                                {quantity}
                              </span>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  'h-9 w-9 rounded-md transition-colors',
                                  'text-white hover:bg-slate-700'
                                )}
                                onClick={() => handleQuantityChange(ticket.id, 1)}
                                disabled={
                                  totalSelected >= maxTickets || 
                                  quantity >= (ticket.maxPerOrder || 10) ||
                                  quantity >= available
                                }
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selected indicator line */}
                  {isSelected && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Summary Bar - Fixed at bottom when tickets selected */}
      {totalSelected > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-4 z-10"
        >
          <Card className="bg-slate-900/95 backdrop-blur-lg border-slate-700 shadow-xl shadow-purple-500/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">
                      {totalSelected} ticket{totalSelected !== 1 ? 's' : ''} selected
                    </p>
                    <p className="text-xl font-bold text-white">
                      ${subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-3 py-1">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Great choice!
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Helper text */}
      <p className="text-center text-sm text-slate-500">
        You can select up to {maxTickets} tickets per order
      </p>
    </div>
  );
}

export default TicketSelection;
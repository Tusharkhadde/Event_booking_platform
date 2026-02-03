// src/components/payment/GlowingOrderSummary.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedGradientBorder } from '@/components/ui/animated-gradient-border';
import { GradientText } from '@/components/ui/gradient-text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Tag,
  X,
  CheckCircle,
  Loader2,
  Percent,
  Gift,
  Sparkles,
  Users,
  CreditCard,
  Shield,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';
import { validatePromoCode } from '@/services/bookingService';
import { cn } from '@/utils/cn';
import { toast } from 'sonner';

export function GlowingOrderSummary({
  event,
  tickets = [],
  selectedSeats = [],
  subtotal = 0,
  onDiscountApplied,
  className,
}) {
  // State
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [appliedCode, setAppliedCode] = useState('');
  const [promoDetails, setPromoDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSeats, setShowSeats] = useState(false);
  const [showPromoHelp, setShowPromoHelp] = useState(false);

  // Calculate totals
  const taxRate = 0.05;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * taxRate;
  const total = taxableAmount + tax;
  const savings = discount;

  // Total ticket count
  const totalTicketCount = tickets.reduce((sum, t) => sum + (t.quantity || 1), 0);

  // Handle promo code application
  const handleApplyPromo = async () => {
    // Validation
    if (!promoCode.trim()) {
      setError('Please enter a promo code');
      return;
    }

    if (subtotal <= 0) {
      setError('Add tickets to your order first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call the validate function
      const result = await validatePromoCode(promoCode.trim(), subtotal);
      
      // Apply the discount
      setDiscount(result.discount);
      setAppliedCode(result.code);
      setPromoDetails(result);
      setPromoApplied(true);
      setPromoCode('');
      
      // Notify parent component
      if (onDiscountApplied) {
        onDiscountApplied(result.discount, result);
      }
      
      // Success message
      toast.success(result.message || `Promo applied! You save $${result.discount.toFixed(2)}`);
      
    } catch (err) {
      // Handle error
      const errorMessage = err.message || 'Failed to apply promo code';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Promo code error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle promo code removal
  const handleRemovePromo = () => {
    setDiscount(0);
    setAppliedCode('');
    setPromoDetails(null);
    setPromoApplied(false);
    setError('');
    
    // Notify parent
    if (onDiscountApplied) {
      onDiscountApplied(0, null);
    }
    
    toast.info('Promo code removed');
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleApplyPromo();
    }
  };

  // Available promo codes for demo
  const demoCodes = [
    { code: 'DEMO', desc: '25% off' },
    { code: 'SAVE10', desc: '10% off' },
    { code: 'VIP25', desc: '25% off' },
    { code: 'FLAT20', desc: '$20 off' },
  ];

  return (
    <AnimatedGradientBorder className={className}>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-400" />
            Order Summary
          </h3>
          {totalTicketCount > 0 && (
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              <Ticket className="w-3 h-3 mr-1" />
              {totalTicketCount} ticket{totalTicketCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Event Card */}
        {event && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
          >
            {event.image_url ? (
              <img
                src={event.image_url}
                alt={event.title}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-8 h-8 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white truncate text-base">
                {event.title}
              </h4>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-slate-400 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>
                    {event.date &&
                      new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                  </span>
                </p>
                {event.time && (
                  <p className="text-sm text-slate-400 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{event.time}</span>
                  </p>
                )}
                <p className="text-sm text-slate-400 flex items-center gap-2 truncate">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{event.location}</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <Separator className="bg-slate-700/50" />

        {/* Ticket Items */}
        {tickets.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Ticket className="w-4 h-4 text-purple-400" />
              Tickets
            </p>
            <div className="space-y-2">
              {tickets.map((ticket, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold',
                      ticket.type === 'vip' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                      ticket.type === 'premium' ? 'bg-gradient-to-br from-amber-500 to-orange-500' :
                      'bg-gradient-to-br from-blue-500 to-cyan-500'
                    )}>
                      {ticket.quantity || 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {ticket.name || ticket.type}
                      </p>
                      <p className="text-xs text-slate-400">
                        ${(ticket.price || 0).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-white">
                    ${((ticket.price || 0) * (ticket.quantity || 1)).toFixed(2)}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Ticket className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No tickets selected</p>
          </div>
        )}

        {/* Selected Seats */}
        {selectedSeats && selectedSeats.length > 0 && (
          <>
            <Separator className="bg-slate-700/50" />
            <div className="space-y-3">
              <button
                onClick={() => setShowSeats(!showSeats)}
                className="w-full flex items-center justify-between text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Selected Seats ({selectedSeats.length})
                </span>
                {showSeats ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              
              <AnimatePresence>
                {showSeats && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedSeats.map((seat) => (
                        <Badge
                          key={seat.id}
                          className={cn(
                            'border text-xs',
                            seat.type === 'vip'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : seat.type === 'premium'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-slate-700/50 text-slate-300 border-slate-600'
                          )}
                        >
                          {seat.id}
                          <span className="ml-1 opacity-60 capitalize">
                            ({seat.type})
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}

        <Separator className="bg-slate-700/50" />

        {/* Promo Code Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Gift className="w-4 h-4 text-pink-400" />
              Promo Code
            </p>
            <button
              onClick={() => setShowPromoHelp(!showPromoHelp)}
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
            >
              <Info className="w-3 h-3" />
              {showPromoHelp ? 'Hide' : 'Show'} codes
            </button>
          </div>

          {/* Promo Help - Available Codes */}
          <AnimatePresence>
            {showPromoHelp && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-xs">
                  <p className="font-medium text-slate-300 mb-2">Available codes:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {demoCodes.map((promo) => (
                      <button
                        key={promo.code}
                        onClick={() => {
                          setPromoCode(promo.code);
                          setShowPromoHelp(false);
                          setError('');
                        }}
                        className="text-left p-2 rounded bg-slate-700/50 hover:bg-slate-700 transition-colors"
                      >
                        <code className="text-emerald-400 font-bold">{promo.code}</code>
                        <span className="text-slate-400 ml-2">{promo.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Promo Input or Applied State */}
          <AnimatePresence mode="wait">
            {!promoApplied ? (
              <motion.div
                key="promo-input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase());
                        setError('');
                      }}
                      onKeyPress={handleKeyPress}
                      disabled={subtotal <= 0 || loading}
                      className={cn(
                        'pl-10 bg-slate-800/50 border-slate-700 text-white uppercase font-mono',
                        'focus:border-purple-500 focus:ring-purple-500/20',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        error && 'border-red-500/50'
                      )}
                    />
                  </div>
                  <Button
                    onClick={handleApplyPromo}
                    disabled={loading || !promoCode.trim() || subtotal <= 0}
                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 min-w-[80px]"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </div>
                
                {/* Error Message */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {error}
                  </motion.p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="promo-applied"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-400 font-mono">
                      {appliedCode}
                    </p>
                    <p className="text-xs text-emerald-400/70">
                      {promoDetails?.description || `$${discount.toFixed(2)} off`}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
                  onClick={handleRemovePromo}
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator className="bg-slate-700/50" />

        {/* Price Breakdown */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Subtotal</span>
            <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
          </div>

          <AnimatePresence>
            {discount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex justify-between text-sm"
              >
                <span className="text-emerald-400 flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  Discount
                </span>
                <span className="text-emerald-400 font-medium">
                  -${discount.toFixed(2)}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Tax (5%)</span>
            <span className="text-white font-medium">${tax.toFixed(2)}</span>
          </div>

          {/* Savings Banner */}
          <AnimatePresence>
            {savings > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20"
              >
                <Sparkles className="w-4 h-4 text-emerald-400 mr-2" />
                <span className="text-sm text-emerald-400 font-medium">
                  You're saving ${savings.toFixed(2)}!
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <Separator className="bg-slate-700/50" />

          {/* Total */}
          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-semibold text-white">Total</span>
            <div className="text-right">
              {discount > 0 && (
                <p className="text-sm text-slate-500 line-through">
                  ${(subtotal + subtotal * taxRate).toFixed(2)}
                </p>
              )}
              <GradientText
                className="text-2xl font-bold"
                colors="from-purple-400 via-pink-400 to-cyan-400"
              >
                ${total.toFixed(2)}
              </GradientText>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="pt-4 space-y-3">
          <Separator className="bg-slate-700/50" />
          
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Zap, text: 'Instant Delivery', color: 'text-yellow-400' },
              { icon: Shield, text: 'Secure Payment', color: 'text-emerald-400' },
              { icon: CheckCircle, text: 'Money Back', color: 'text-blue-400' },
              { icon: Users, text: '24/7 Support', color: 'text-purple-400' },
            ].map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center gap-2 text-xs text-slate-400"
              >
                <badge.icon className={cn('w-3.5 h-3.5', badge.color)} />
                <span>{badge.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 pt-2">
          Secure checkout powered by EventHub
        </p>
      </div>
    </AnimatedGradientBorder>
  );
}

export default GlowingOrderSummary;
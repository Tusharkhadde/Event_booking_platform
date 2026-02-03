// src/components/payment/MockPaymentForm.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard3D } from './CreditCard3D';
import { MagicCard } from '@/components/ui/magic-card';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { ParticleButton } from '@/components/ui/particle-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CreditCard,
  Smartphone,
  Wallet,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Shield,
  Zap,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { 
  processCardPayment, 
  detectCardBrand,
  validateCardNumber,
  validateExpiry,
} from '@/services/mockPaymentService';
import { toast } from 'sonner';

// Payment method options
const paymentMethods = [
  {
    id: 'card',
    name: 'Credit Card',
    icon: CreditCard,
    description: 'Visa, Mastercard, Amex',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 'upi',
    name: 'UPI',
    icon: Smartphone,
    description: 'GPay, PhonePe, Paytm',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    id: 'wallet',
    name: 'Wallet',
    icon: Wallet,
    description: 'EventHub Wallet',
    gradient: 'from-orange-500 to-amber-600',
  },
];

// Card brand icons/colors
const cardBrandConfig = {
  visa: { color: 'text-blue-500', bg: 'bg-blue-500' },
  mastercard: { color: 'text-orange-500', bg: 'bg-orange-500' },
  amex: { color: 'text-blue-600', bg: 'bg-blue-600' },
  discover: { color: 'text-orange-600', bg: 'bg-orange-600' },
  unknown: { color: 'text-slate-400', bg: 'bg-slate-500' },
};

export function MockPaymentForm({ 
  amount, 
  currency = 'USD', 
  onSuccess, 
  onError,
  onCancel,
}) {
  // Payment method state
  const [selectedMethod, setSelectedMethod] = useState('card');
  
  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  
  // UI state
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cardBrand, setCardBrand] = useState('unknown');
  const [errors, setErrors] = useState({});
  
  // UPI state
  const [upiId, setUpiId] = useState('');
  
  // Wallet state
  const [walletBalance] = useState(500);

  // Detect card brand
  useEffect(() => {
    const brand = detectCardBrand(cardNumber);
    setCardBrand(brand);
  }, [cardNumber]);

  // Format card number with spaces
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    value = value.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(value);
    
    // Clear error
    if (errors.cardNumber) {
      setErrors({ ...errors, cardNumber: null });
    }
  };

  // Format expiry date
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 4);
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    setExpiryDate(value);
    
    if (errors.expiryDate) {
      setErrors({ ...errors, expiryDate: null });
    }
  };

  // Handle CVV change
  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCvv(value);
    
    if (errors.cvv) {
      setErrors({ ...errors, cvv: null });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (selectedMethod === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
        newErrors.cardNumber = 'Please enter a valid card number';
      }
      
      if (!cardHolder.trim()) {
        newErrors.cardHolder = 'Please enter cardholder name';
      }
      
      if (!expiryDate || !validateExpiry(expiryDate)) {
        newErrors.expiryDate = 'Please enter a valid expiry date';
      }
      
      if (!cvv || cvv.length < 3) {
        newErrors.cvv = 'Please enter CVV';
      }
    } else if (selectedMethod === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        newErrors.upiId = 'Please enter a valid UPI ID';
      }
    } else if (selectedMethod === 'wallet') {
      if (amount > walletBalance) {
        newErrors.wallet = 'Insufficient wallet balance';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle payment submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before proceeding');
      return;
    }

    setLoading(true);

    try {
      let result;

      if (selectedMethod === 'card') {
        result = await processCardPayment({
          cardNumber,
          expiryDate,
          cvv,
          cardHolder,
          amount,
          currency,
          saveCard,
        });
      } else if (selectedMethod === 'upi') {
        // Simulate UPI payment
        await new Promise(resolve => setTimeout(resolve, 2000));
        result = {
          success: true,
          transactionId: `UPI-${Date.now()}`,
          amount,
          currency: 'INR',
          paymentMethod: 'upi',
        };
      } else if (selectedMethod === 'wallet') {
        // Simulate wallet payment
        await new Promise(resolve => setTimeout(resolve, 1000));
        result = {
          success: true,
          transactionId: `WAL-${Date.now()}`,
          amount,
          currency,
          paymentMethod: 'wallet',
        };
      }

      toast.success('Payment successful!');
      onSuccess?.(result);
    } catch (error) {
      toast.error(error.message || 'Payment failed');
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  // Format amount display
  const formatAmount = (amt, curr) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
    }).format(amt);
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selector */}
      <div className="grid grid-cols-3 gap-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <motion.button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={cn(
                'relative p-4 rounded-xl border-2 transition-all duration-300',
                isSelected
                  ? 'border-transparent bg-slate-800'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSelected && (
                <motion.div
                  layoutId="selectedPaymentMethod"
                  className={cn(
                    'absolute inset-0 rounded-xl bg-gradient-to-r opacity-20',
                    method.gradient
                  )}
                />
              )}
              <div className="relative flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                    isSelected
                      ? `bg-gradient-to-r ${method.gradient}`
                      : 'bg-slate-800'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5',
                      isSelected ? 'text-white' : 'text-slate-400'
                    )}
                  />
                </div>
                <span
                  className={cn(
                    'text-xs font-medium',
                    isSelected ? 'text-white' : 'text-slate-400'
                  )}
                >
                  {method.name}
                </span>
              </div>
              
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Payment Forms */}
      <AnimatePresence mode="wait">
        {/* Card Payment Form */}
        {selectedMethod === 'card' && (
          <motion.div
            key="card-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* 3D Card Preview */}
            <CreditCard3D
              cardNumber={cardNumber}
              cardHolder={cardHolder}
              expiryDate={expiryDate}
              cvv={cvv}
              isFlipped={isFlipped}
              brand={cardBrand}
            />

            {/* Card Form */}
            <MagicCard className="p-5 space-y-4" gradientColor="#8b5cf6">
              {/* Card Number */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Card Number
                </Label>
                <div className="relative">
                  <Input
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    className={cn(
                      'bg-slate-800/80 border-slate-700 text-white font-mono text-lg tracking-wider h-12 pr-12',
                      errors.cardNumber && 'border-red-500'
                    )}
                    maxLength={19}
                  />
                  {cardBrand !== 'unknown' && (
                    <div className={cn(
                      'absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs font-bold uppercase',
                      cardBrandConfig[cardBrand]?.bg,
                      'text-white'
                    )}>
                      {cardBrand}
                    </div>
                  )}
                </div>
                {errors.cardNumber && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.cardNumber}
                  </p>
                )}
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Try: 4242 4242 4242 4242 (Success) or 4000 0000 0000 0002 (Decline)
                </p>
              </div>

              {/* Cardholder Name */}
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm">Cardholder Name</Label>
                <Input
                  placeholder="JOHN DOE"
                  value={cardHolder}
                  onChange={(e) => {
                    setCardHolder(e.target.value.toUpperCase());
                    if (errors.cardHolder) setErrors({ ...errors, cardHolder: null });
                  }}
                  className={cn(
                    'bg-slate-800/80 border-slate-700 text-white uppercase tracking-wide h-12',
                    errors.cardHolder && 'border-red-500'
                  )}
                />
                {errors.cardHolder && (
                  <p className="text-xs text-red-400">{errors.cardHolder}</p>
                )}
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm">Expiry Date</Label>
                  <Input
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={handleExpiryChange}
                    className={cn(
                      'bg-slate-800/80 border-slate-700 text-white font-mono h-12',
                      errors.expiryDate && 'border-red-500'
                    )}
                    maxLength={5}
                  />
                  {errors.expiryDate && (
                    <p className="text-xs text-red-400">{errors.expiryDate}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-300 text-sm">CVV</Label>
                  <div className="relative">
                    <Input
                      placeholder="•••"
                      value={cvv}
                      onChange={handleCvvChange}
                      onFocus={() => setIsFlipped(true)}
                      onBlur={() => setIsFlipped(false)}
                      type={showCvv ? 'text' : 'password'}
                      className={cn(
                        'bg-slate-800/80 border-slate-700 text-white font-mono h-12 pr-10',
                        errors.cvv && 'border-red-500'
                      )}
                      maxLength={4}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCvv(!showCvv)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.cvv && (
                    <p className="text-xs text-red-400">{errors.cvv}</p>
                  )}
                </div>
              </div>

              {/* Save Card */}
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="saveCard"
                  checked={saveCard}
                  onCheckedChange={setSaveCard}
                  className="border-slate-600 data-[state=checked]:bg-purple-600"
                />
                <label
                  htmlFor="saveCard"
                  className="text-sm text-slate-400 cursor-pointer"
                >
                  Save card for future payments
                </label>
              </div>
            </MagicCard>
          </motion.div>
        )}

        {/* UPI Payment Form */}
        {selectedMethod === 'upi' && (
          <motion.div
            key="upi-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MagicCard className="p-6 space-y-6" gradientColor="#22c55e">
              {/* UPI App Icons */}
              <div className="flex items-center justify-center gap-6 py-4">
                {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                  <motion.div
                    key={app}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-14 h-14 bg-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg"
                  >
                    <span className="text-xs font-bold text-slate-800">{app}</span>
                  </motion.div>
                ))}
              </div>

              {/* UPI ID Input */}
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  UPI ID
                </Label>
                <Input
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => {
                    setUpiId(e.target.value);
                    if (errors.upiId) setErrors({ ...errors, upiId: null });
                  }}
                  className={cn(
                    'bg-slate-800/80 border-slate-700 text-white h-12',
                    errors.upiId && 'border-red-500'
                  )}
                />
                {errors.upiId && (
                  <p className="text-xs text-red-400">{errors.upiId}</p>
                )}
                <p className="text-xs text-slate-500">
                  Enter your UPI ID (e.g., yourname@okaxis, number@ybl)
                </p>
              </div>
            </MagicCard>
          </motion.div>
        )}

        {/* Wallet Payment Form */}
        {selectedMethod === 'wallet' && (
          <motion.div
            key="wallet-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MagicCard className="p-6" gradientColor="#f97316">
              <div className="text-center py-6 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Wallet className="w-10 h-10 text-white" />
                </div>
                
                <div>
                  <p className="text-slate-400 text-sm">Available Balance</p>
                  <p className="text-4xl font-bold text-white">
                    ${walletBalance.toFixed(2)}
                  </p>
                </div>

                {amount <= walletBalance ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Sufficient Balance
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Insufficient Balance
                  </Badge>
                )}

                <div className="pt-4 border-t border-slate-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Amount to pay</span>
                    <span className="text-white font-bold">{formatAmount(amount, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-slate-400">Balance after payment</span>
                    <span className="text-emerald-400 font-bold">
                      ${Math.max(0, walletBalance - amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </MagicCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Badges */}
      <div className="flex items-center justify-center gap-6 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>256-bit SSL</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Lock className="w-4 h-4 text-emerald-500" />
          <span>Secure</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span>Instant</span>
        </div>
      </div>

      {/* Submit Button */}
      <ParticleButton
        onClick={handleSubmit}
        disabled={loading}
        className={cn(
          'w-full h-14 text-lg font-semibold',
          loading && 'opacity-80 cursor-not-allowed'
        )}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5 mr-2" />
            Pay {formatAmount(amount, currency)}
            <Sparkles className="w-4 h-4 ml-2" />
          </>
        )}
      </ParticleButton>

      {/* Cancel Button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="w-full text-center text-sm text-slate-500 hover:text-white transition-colors py-2"
        >
          Cancel Payment
        </button>
      )}
    </div>
  );
}

export default MockPaymentForm;
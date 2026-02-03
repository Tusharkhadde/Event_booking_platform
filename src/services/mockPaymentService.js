// src/services/mockPaymentService.js
import { v4 as uuidv4 } from 'uuid';

// Simulated delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Test card database
const TEST_CARDS = {
  '4242424242424242': { status: 'success', brand: 'visa', name: 'Visa' },
  '4000000000000002': { status: 'declined', brand: 'visa', name: 'Visa (Declined)' },
  '5555555555554444': { status: 'success', brand: 'mastercard', name: 'Mastercard' },
  '378282246310005': { status: 'success', brand: 'amex', name: 'American Express' },
  '6011111111111117': { status: 'success', brand: 'discover', name: 'Discover' },
  '4000000000009995': { status: 'insufficient_funds', brand: 'visa', name: 'Visa (No Funds)' },
  '4000000000000069': { status: 'expired', brand: 'visa', name: 'Visa (Expired)' },
};

// Generate transaction ID
const generateTransactionId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = uuidv4().split('-')[0].toUpperCase();
  return `TXN-${timestamp}-${random}`;
};

// Generate order ID
const generateOrderId = () => {
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
};

// Detect card brand from number
export const detectCardBrand = (cardNumber) => {
  const num = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(num)) return 'visa';
  if (/^5[1-5]/.test(num)) return 'mastercard';
  if (/^3[47]/.test(num)) return 'amex';
  if (/^6(?:011|5)/.test(num)) return 'discover';
  if (/^(?:2131|1800|35)/.test(num)) return 'jcb';
  
  return 'unknown';
};

// Validate card number (Luhn algorithm)
export const validateCardNumber = (cardNumber) => {
  const num = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(num)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Validate expiry date
export const validateExpiry = (expiry) => {
  const [month, year] = expiry.split('/').map(s => parseInt(s, 10));
  if (!month || !year) return false;
  if (month < 1 || month > 12) return false;
  
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  
  return true;
};

// Validate CVV
export const validateCVV = (cvv, brand) => {
  const length = brand === 'amex' ? 4 : 3;
  return new RegExp(`^\\d{${length}}$`).test(cvv);
};

// Process card payment
export const processCardPayment = async ({
  cardNumber,
  expiryDate,
  cvv,
  cardHolder,
  amount,
  currency = 'USD',
  saveCard = false,
}) => {
  // Simulate network delay (1.5 - 3 seconds)
  await delay(1500 + Math.random() * 1500);

  const cleanCardNumber = cardNumber.replace(/\s/g, '');
  const cardInfo = TEST_CARDS[cleanCardNumber];
  const brand = detectCardBrand(cleanCardNumber);

  // For demo: Accept any valid-looking card
  if (!cardInfo || cardInfo.status === 'success') {
    const result = {
      success: true,
      transactionId: generateTransactionId(),
      orderId: generateOrderId(),
      amount,
      currency,
      cardBrand: brand,
      cardName: cardInfo?.name || 'Card',
      last4: cleanCardNumber.slice(-4),
      timestamp: new Date().toISOString(),
      message: 'Payment processed successfully',
      receiptUrl: `https://receipt.example.com/${generateTransactionId()}`,
    };

    // Simulate saving card
    if (saveCard) {
      result.savedCardId = `card_${uuidv4().split('-')[0]}`;
    }

    return result;
  }

  // Handle specific errors
  const errorMessages = {
    declined: 'Your card was declined. Please try another payment method.',
    insufficient_funds: 'Insufficient funds. Please try a different card.',
    expired: 'This card has expired. Please use a valid card.',
    invalid: 'Invalid card details. Please check and try again.',
  };

  const error = new Error(errorMessages[cardInfo.status] || 'Payment failed');
  error.code = cardInfo.status;
  error.decline_code = cardInfo.status;
  throw error;
};

// Process UPI payment
export const processUPIPayment = async ({
  upiId,
  amount,
  currency = 'INR',
}) => {
  await delay(2000 + Math.random() * 2000);

  // Validate UPI ID format
  if (!upiId || !upiId.includes('@')) {
    throw new Error('Invalid UPI ID format. Expected format: name@bank');
  }

  // Simulate random failure (10% chance)
  if (Math.random() < 0.1) {
    throw new Error('UPI payment failed. Please try again.');
  }

  return {
    success: true,
    transactionId: generateTransactionId(),
    orderId: generateOrderId(),
    amount,
    currency,
    upiId,
    paymentMethod: 'upi',
    timestamp: new Date().toISOString(),
    message: 'UPI payment successful',
  };
};

// Process wallet payment
export const processWalletPayment = async ({
  walletType,
  amount,
  currency = 'USD',
  walletBalance = 500,
}) => {
  await delay(1000);

  if (amount > walletBalance) {
    throw new Error(`Insufficient wallet balance. Available: $${walletBalance.toFixed(2)}`);
  }

  return {
    success: true,
    transactionId: generateTransactionId(),
    orderId: generateOrderId(),
    amount,
    currency,
    walletType,
    previousBalance: walletBalance,
    newBalance: walletBalance - amount,
    paymentMethod: 'wallet',
    timestamp: new Date().toISOString(),
    message: `${walletType} payment successful`,
  };
};

// Validate promo code
export const validatePromoCode = async (code, subtotal) => {
  await delay(500);

  const promoCodes = {
    'SAVE10': { type: 'percentage', value: 10, minAmount: 50, description: '10% off' },
    'SAVE20': { type: 'percentage', value: 20, minAmount: 100, description: '20% off' },
    'FLAT20': { type: 'fixed', value: 20, minAmount: 80, description: '$20 off' },
    'FLAT50': { type: 'fixed', value: 50, minAmount: 150, description: '$50 off' },
    'WELCOME50': { type: 'percentage', value: 50, maxDiscount: 100, description: '50% off (max $100)' },
    'FREE100': { type: 'fixed', value: 100, minAmount: 200, description: '$100 off' },
    'DEMO': { type: 'percentage', value: 25, description: '25% off' },
    'VIP25': { type: 'percentage', value: 25, description: '25% off for VIP' },
    'FIRST': { type: 'percentage', value: 15, description: '15% off first order' },
    'EVENT2024': { type: 'percentage', value: 30, maxDiscount: 75, description: '30% off (max $75)' },
  };

  const promo = promoCodes[code.toUpperCase()];

  if (!promo) {
    throw new Error('Invalid promo code. Please check and try again.');
  }

  if (promo.minAmount && subtotal < promo.minAmount) {
    throw new Error(`Minimum order amount is $${promo.minAmount} for this code.`);
  }

  let discount = 0;
  if (promo.type === 'percentage') {
    discount = (subtotal * promo.value) / 100;
    if (promo.maxDiscount) {
      discount = Math.min(discount, promo.maxDiscount);
    }
  } else {
    discount = Math.min(promo.value, subtotal);
  }

  return {
    code: code.toUpperCase(),
    discount: Math.round(discount * 100) / 100,
    type: promo.type,
    value: promo.value,
    description: promo.description,
    finalAmount: Math.max(0, subtotal - discount),
  };
};

// Get saved cards (mock)
export const getSavedCards = async (userId) => {
  await delay(300);

  return [
    {
      id: 'card_1',
      brand: 'visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '2025',
      cardHolder: 'JOHN DOE',
      isDefault: true,
    },
    {
      id: 'card_2',
      brand: 'mastercard',
      last4: '4444',
      expiryMonth: '06',
      expiryYear: '2026',
      cardHolder: 'JOHN DOE',
      isDefault: false,
    },
  ];
};

// Delete saved card
export const deleteSavedCard = async (cardId) => {
  await delay(500);
  return { success: true, message: 'Card deleted successfully' };
};

// Refund payment
export const refundPayment = async (transactionId, amount, reason) => {
  await delay(1500);

  return {
    success: true,
    refundId: `REF-${generateTransactionId()}`,
    originalTransactionId: transactionId,
    amount,
    reason,
    status: 'processed',
    timestamp: new Date().toISOString(),
    message: 'Refund processed successfully',
  };
};

export default {
  processCardPayment,
  processUPIPayment,
  processWalletPayment,
  validatePromoCode,
  getSavedCards,
  deleteSavedCard,
  refundPayment,
  detectCardBrand,
  validateCardNumber,
  validateExpiry,
  validateCVV,
};